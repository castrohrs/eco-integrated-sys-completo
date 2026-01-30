
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useAppStore } from '../hooks/useAppStore';
import { generateAccessKey, buildCTeXML, buildCTeOSXML } from '../utils/cteGenerator';
import DactePreview from './DactePreview';
import DacteModel from './DacteModel';

// Define types for global libraries to satisfy TypeScript
declare const pdfjsLib: any;
declare const jspdf: any;
declare const QRCode: any;

// --- Types for Reader ---
interface CteData {
    chaveAcesso: string;
    numeroCTe: string;
    dataEmissao: string;
    valorCTe: string;
    emitenteNome: string;
    emitenteCNPJ: string;
    emitenteEndereco: string;
    tomadorNome: string;
    tomadorCNPJCPF: string;
    tomadorEndereco: string;
    valorCarga: string;
    pesoBruto: string;
    volumes: string;
}

interface PdfCacheItem {
    dataUrl: string;
    width: number;
    height: number;
}

const initialCteData: CteData = {
    chaveAcesso: '', numeroCTe: '', dataEmissao: '', valorCTe: '',
    emitenteNome: '', emitenteCNPJ: '', emitenteEndereco: '',
    tomadorNome: '', tomadorCNPJCPF: '', tomadorEndereco: '',
    valorCarga: '', pesoBruto: '', volumes: ''
};

type ValidationStatus = 'idle' | 'validating' | 'validated' | 'error' | 'mismatch';

// --- Types for Emitter ---
interface CteItem {
    code: string;
    description: string;
    quantity: number;
    unitValue: number;
}

const emptyItem: CteItem = { code: "001", description: "Serviço de Transporte", quantity: 1, unitValue: 150.0 };

const ValidationStatusDisplay: React.FC<{ status: ValidationStatus; message: string }> = ({ status, message }) => {
    if (status === 'idle') return null;

    const config = {
        validating: { icon: 'fa-spinner fa-spin', color: 'text-secondary', bgColor: 'bg-secondary/10' },
        validated: { icon: 'fa-check-circle', color: 'text-success', bgColor: 'bg-success/10' },
        error: { icon: 'fa-times-circle', color: 'text-danger', bgColor: 'bg-danger/10' },
        mismatch: { icon: 'fa-exclamation-triangle', color: 'text-warning', bgColor: 'bg-warning/10' },
    };

    const currentConfig = config[status as keyof typeof config];

    return (
        <div className={`p-3 rounded-md flex items-center gap-3 mb-4 text-sm ${currentConfig.bgColor}`}>
            <i className={`fas ${currentConfig.icon} text-lg ${currentConfig.color}`}></i>
            <span className={currentConfig.color}>{message}</span>
        </div>
    );
};


const CteReader: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'read' | 'emit' | 'model'>('read');
    
    // --- Reader State ---
    const [fileInfo, setFileInfo] = useState('Nenhum arquivo selecionado');
    const [isPdfMode, setIsPdfMode] = useState(false);
    const [cteData, setCteData] = useState<CteData>(initialCteData);
    const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
    const [pdfCache, setPdfCache] = useState<Record<string, PdfCacheItem>>({});
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const pdfContainerRef = useRef<HTMLDivElement>(null);

    const [validationStatus, setValidationStatus] = useState<ValidationStatus>('idle');
    const [validationMessage, setValidationMessage] = useState('');

    // --- Emitter State ---
    const { logAction } = useAppStore();
    const [issuerName] = useState("EcOLog Transportes");
    const [issuerCNPJ, setIssuerCNPJ] = useState("12345678000199");
    const [sender, setSender] = useState({ name: "REMETENTE EXEMPLO LTDA", cnpj: "11111111000111", city: "SANTOS", uf: "SP" });
    const [receiver, setReceiver] = useState({ name: "DESTINATARIO FINAL SA", cnpj: "22222222000122", city: "SAO PAULO", uf: "SP" });
    const [items, setItems] = useState<CteItem[]>([emptyItem]);
    const [cteType, setCteType] = useState<"normal" | "os">("normal");
    const [generatedData, setGeneratedData] = useState<any>(null);

    // --- Helper formatting functions ---
    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
    };
    const formatCNPJ = (cnpj: string) => cnpj ? cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5') : '';
    const formatCPF = (cpf: string) => cpf ? cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') : '';
    const formatCEP = (cep: string) => cep ? cep.replace(/(\d{5})(\d{3})/, '$1-$2') : '';
    const formatCurrency = (value: string | number) => {
        if (!value) return 'R$ 0,00';
        const val = typeof value === 'string' ? parseFloat(value) : value;
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
    };
    const formatNumber = (value: string) => {
        if (!value) return '0';
        return new Intl.NumberFormat('pt-BR').format(parseFloat(value));
    };

    const clearForm = () => {
        setCteData(initialCteData);
        setValidationStatus('idle');
        setValidationMessage('');
        setIsPdfMode(false);
        if (canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
    };

    const clearCache = () => {
        setPdfCache({});
        alert("Cache de visualização limpo.");
    };

    // --- Reader Logic ---
    useEffect(() => {
        if (cteData.chaveAcesso) {
            setValidationStatus('validating');
            setValidationMessage('Validando chave de acesso em sistema de terceiros...');

            setTimeout(() => {
                const keyIsValid = cteData.chaveAcesso.length === 44 && /^\d+$/.test(cteData.chaveAcesso);
                
                const valueString = cteData.valorCTe.replace('R$', '').replace(/\./g, '').replace(',', '.').trim();
                const valueIsPositive = !isNaN(parseFloat(valueString)) && parseFloat(valueString) > 0;

                if (keyIsValid && valueIsPositive) {
                    setValidationStatus('validated');
                    setValidationMessage('CTe validado com sucesso. Os dados correspondem ao registro externo.');
                } else if (!keyIsValid) {
                    setValidationStatus('error');
                    setValidationMessage('A chave de acesso é inválida (deve conter 44 dígitos numéricos).');
                } else {
                    setValidationStatus('mismatch');
                    setValidationMessage('Dados divergentes. O valor do CTe informado no XML é inválido ou zero.');
                }
            }, 1500);
        }
    }, [cteData.chaveAcesso, cteData.valorCTe]);


    const extractDataFromXML = (xmlDoc: XMLDocument) => {
        const getText = (element: Element, tagName: string, defaultValue = '') => {
            const elements = element.getElementsByTagName(tagName);
            return elements.length > 0 ? elements[0].textContent || defaultValue : defaultValue;
        };

        const cte = xmlDoc.getElementsByTagName('CTe')[0] || xmlDoc.getElementsByTagName('cte:CTe')[0];
        if (!cte) throw new Error('Estrutura do CTe não encontrada no XML');
        
        const infCte = cte.getElementsByTagName('infCte')[0];
        const ide = infCte.getElementsByTagName('ide')[0];
        const emit = infCte.getElementsByTagName('emit')[0];
        const dest = infCte.getElementsByTagName('dest')[0];
        const vPrest = infCte.getElementsByTagName('vPrest')[0];
        const infCTeNorm = infCte.getElementsByTagName('infCTeNorm')[0];
        const infCarga = infCTeNorm ? infCTeNorm.getElementsByTagName('infCarga')[0] : null;

        const dhEmi = getText(ide, 'dhEmi', '');
        const dataEmissao = dhEmi ? new Date(dhEmi).toLocaleString('pt-BR') : '';

        const emitEnderecoEl = emit.getElementsByTagName('enderEmit')[0];
        const emitenteEndereco = emitEnderecoEl ? `${getText(emitEnderecoEl, 'xLgr', '')}, ${getText(emitEnderecoEl, 'nro', '')} - ${getText(emitEnderecoEl, 'xBairro', '')}, ${getText(emitEnderecoEl, 'xMun', '')} - ${getText(emitEnderecoEl, 'UF', '')}, CEP: ${formatCEP(getText(emitEnderecoEl, 'CEP', ''))}` : '';

        const destEnderecoEl = dest?.getElementsByTagName('enderDest')[0];
        const tomadorEndereco = destEnderecoEl ? `${getText(destEnderecoEl, 'xLgr', '')}, ${getText(destEnderecoEl, 'nro', '')} - ${getText(destEnderecoEl, 'xBairro', '')}, ${getText(destEnderecoEl, 'xMun', '')} - ${getText(destEnderecoEl, 'UF', '')}, CEP: ${formatCEP(getText(destEnderecoEl, 'CEP', ''))}`: '';

        const cnpj = getText(dest, 'CNPJ', '');
        const cpf = getText(dest, 'CPF', '');
        
        const infQ = infCarga?.getElementsByTagName('infQ')[0];

        setCteData({
            chaveAcesso: infCte.getAttribute('Id')?.replace('CTe', '') || '',
            numeroCTe: getText(ide, 'nCT', ''),
            dataEmissao,
            valorCTe: formatCurrency(getText(vPrest, 'vTPrest', '')),
            emitenteNome: getText(emit, 'xNome', ''),
            emitenteCNPJ: formatCNPJ(getText(emit, 'CNPJ', '')),
            emitenteEndereco,
            tomadorNome: getText(dest, 'xNome', ''),
            tomadorCNPJCPF: cnpj ? formatCNPJ(cnpj) : (cpf ? formatCPF(cpf) : ''),
            tomadorEndereco,
            valorCarga: formatCurrency(getText(infCarga, 'vCarga', '')),
            pesoBruto: `${formatNumber(getText(infCarga, 'pesoB', ''))} kg`,
            volumes: getText(infQ, 'qCarga', '')
        });
    };

    const renderPdf = async (file: File) => {
        if (!canvasRef.current) return;

        const cacheKey = `${file.name}-${file.size}-${file.lastModified}`;
        
        // Verificando Cache
        if (pdfCache[cacheKey]) {
            const cached = pdfCache[cacheKey];
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');
            if (context) {
                const img = new Image();
                img.onload = () => {
                    canvas.width = cached.width;
                    canvas.height = cached.height;
                    canvas.style.width = (cached.width / (window.devicePixelRatio || 1)) + "px";
                    canvas.style.height = (cached.height / (window.devicePixelRatio || 1)) + "px";
                    context.drawImage(img, 0, 0);
                    setValidationStatus('validated');
                    setValidationMessage('Documento carregado do cache de visualização rápida.');
                };
                img.src = cached.dataUrl;
                return;
            }
        }
        
        try {
            if (pdfjsLib.GlobalWorkerOptions && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
                 pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
            }

            const fileURL = URL.createObjectURL(file);
            const loadingTask = pdfjsLib.getDocument(fileURL);
            const pdf = await loadingTask.promise;
            const page = await pdf.getPage(1);

            const containerWidth = pdfContainerRef.current?.clientWidth || 600;
            const unscaledViewport = page.getViewport({ scale: 1 });
            const scale = (containerWidth - 40) / unscaledViewport.width;
            const viewport = page.getViewport({ scale: scale });
            const outputScale = window.devicePixelRatio || 1;

            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');

            if (context) {
                canvas.width = Math.floor(viewport.width * outputScale);
                canvas.height = Math.floor(viewport.height * outputScale);
                canvas.style.width = Math.floor(viewport.width) + "px";
                canvas.style.height = Math.floor(viewport.height) + "px";

                const transform = outputScale !== 1 
                    ? [outputScale, 0, 0, outputScale, 0, 0] 
                    : null;

                const renderContext = {
                    canvasContext: context,
                    transform: transform,
                    viewport: viewport
                };
                
                await page.render(renderContext).promise;

                // Salvar no Cache
                const dataUrl = canvas.toDataURL('image/png');
                setPdfCache(prev => ({
                    ...prev,
                    [cacheKey]: { dataUrl, width: canvas.width, height: canvas.height }
                }));
            }
        } catch (error) {
            console.error("Erro ao renderizar PDF:", error);
            alert("Erro ao visualizar o PDF. O arquivo pode estar corrompido.");
        }
    };

    const handleFile = useCallback((file: File) => {
        const fileName = file.name;
        const fileExtension = fileName.split('.').pop()?.toLowerCase();

        setFileInfo(`Arquivo: ${fileName} (${formatFileSize(file.size)})`);
        clearForm();

        if (fileExtension === 'xml') {
            setIsPdfMode(false);
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const parser = new DOMParser();
                    const xmlDoc = parser.parseFromString(e.target!.result as string, 'text/xml');
                    if (xmlDoc.getElementsByTagName('parsererror').length > 0) throw new Error('XML inválido ou malformado');
                    extractDataFromXML(xmlDoc);
                } catch (error) {
                    console.error('Erro ao processar XML:', error);
                    alert('Erro ao processar o arquivo XML. Verifique se é um CTe válido.');
                }
            };
            reader.readAsText(file);
        } else if (fileExtension === 'pdf') {
            setIsPdfMode(true);
            setTimeout(() => {
                renderPdf(file);
            }, 100);
        } else {
            alert('Por favor, selecione um arquivo XML ou PDF.');
        }
    }, [pdfCache]);

    const onDragOver = (e: React.DragEvent) => e.preventDefault();
    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
    };
    const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.length) handleFile(e.target.files[0]);
    };
    
    const downloadJSON = () => {
        const jsonString = JSON.stringify(cteData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'dados_cte.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const generateQRCode = (value: string) => {
        if (!value) return;
        QRCode.toDataURL(value, { errorCorrectionLevel: 'H', width: 256 }, (err: any, url: string) => {
            if (err) { console.error(err); return; }
            setQrCodeDataUrl(url);
        });
    };

    // --- Emitter Logic ---
    const updateItem = (idx: number, field: keyof CteItem, value: string | number) => {
        const newItems = [...items];
        newItems[idx] = { ...newItems[idx], [field]: value };
        setItems(newItems);
    };

    const addItem = () => setItems([...items, { ...emptyItem, code: String(items.length + 1).padStart(3, "0") }]);
    const removeItem = (idx: number) => setItems(items.filter((_, i) => i !== idx));
    
    const totalValue = items.reduce((s, it) => s + (it.quantity || 0) * (it.unitValue || 0), 0);

    const handleGenerateCte = (type: 'normal' | 'os') => {
        // Validações Obrigatórias
        const cleanIssuerCNPJ = issuerCNPJ.replace(/\D/g, "");
        
        // 1. Validar Emitente
        if (!cleanIssuerCNPJ) { alert("Erro: O CNPJ do Emitente é obrigatório."); return; }

        // 2. Validar Remetente (Apenas Normal)
        if (type === 'normal') {
            if (!sender.name.trim()) { alert("Erro: O Nome do Remetente é obrigatório."); return; }
            if (!sender.cnpj.replace(/\D/g, "")) { alert("Erro: O CNPJ do Remetente é obrigatório."); return; }
            if (!sender.city.trim()) { alert("Erro: A Cidade do Remetente é obrigatória."); return; }
            if (!sender.uf.trim()) { alert("Erro: A UF do Remetente é obrigatória."); return; }
        }

        // 3. Validar Destinatário/Tomador
        if (!receiver.name.trim()) { alert("Erro: O Nome do Destinatário/Tomador é obrigatório."); return; }
        if (!receiver.cnpj.replace(/\D/g, "")) { alert("Erro: O CNPJ/CPF do Destinatário/Tomador é obrigatório."); return; }
        if (!receiver.city.trim()) { alert("Erro: A Cidade do Destinatário/Tomador é obrigatória."); return; }
        if (!receiver.uf.trim()) { alert("Erro: A UF do Destinatário/Tomador é obrigatória."); return; }

        // 4. Validar Itens
        if (items.length === 0) { alert("Erro: Adicione pelo menos um item ou serviço."); return; }
        
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (!item.description.trim()) { alert(`Erro: A descrição do item #${i + 1} é obrigatória.`); return; }
            if (!item.quantity || Number(item.quantity) <= 0) { alert(`Erro: A quantidade do item #${i + 1} deve ser maior que zero.`); return; }
            if (!item.unitValue || Number(item.unitValue) <= 0) { alert(`Erro: O valor unitário do item #${i + 1} deve ser maior que zero.`); return; }
        }

        const serie = Math.floor(Math.random() * 900) + 1;
        const numero = Math.floor(Math.random() * 900000000) + 1;
        const cnpjIssuer = issuerCNPJ.replace(/\D/g, "").padStart(14, "0").slice(0,14);
        const modelo = type === "os" ? "67" : "57";
        const now = new Date();
        const anoMes = now.toISOString().slice(2,7).replace("-", "");
        const ufCode = "33"; // RJ
        const tpEmis = "1";
        const nCTe = String(numero % 1000000000).padStart(9, "0");
        const serieStr = String(serie).padStart(3, "0");
        const cNF = String(Math.floor(Math.random() * 99999999)).padStart(8, "0");

        const key43 = [ufCode, anoMes, cnpjIssuer, modelo, serieStr, nCTe, tpEmis, cNF].join("");
        const chave = generateAccessKey(key43);

        const formData = { issuerName, issuerCNPJ, sender, receiver, items };
        const xmlData = { ...formData, modelo, serie: serieStr, numero: String(numero), chave, dtEmissao: now.toISOString() };
        
        const xml = type === "os" ? buildCTeOSXML(xmlData) : buildCTeXML(xmlData);

        const newData = {
            ...formData,
            tipo: type,
            serie: serieStr,
            numero: String(numero),
            modelo,
            chave,
            dtEmissao: now.toLocaleString(),
            total: totalValue,
            xml
        };

        setGeneratedData(newData);
        logAction(`CT-e ${type.toUpperCase()} gerado: ${chave}`);
    };

    const downloadXML = () => {
        if (!generatedData) return;
        const blob = new Blob([generatedData.xml], { type: "application/xml;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `CTE_${generatedData.numero}.xml`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };
    
    const printDacte = () => {
        const printContent = document.getElementById('dacte-print-area');
        if(!printContent) return;
        
        const printWindow = window.open('', '_blank');
        if(printWindow) {
            printWindow.document.write(`
                <html>
                    <head>
                        <title>Impressão DACTE</title>
                        <script src="https://cdn.tailwindcss.com"></script>
                        <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
                        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
                    </head>
                    <body>
                        ${printContent.outerHTML}
                        <script>
                            setTimeout(() => {
                                window.print();
                                setTimeout(() => window.close(), 100);
                            }, 500);
                        </script>
                    </body>
                </html>
            `);
            printWindow.document.close();
        }
    };

    const TAB_ITEMS = [
        { id: 'read', label: 'Leitura Fiscal', icon: 'fa-qrcode', desc: 'Importação de XML e validação SEFAZ' },
        { id: 'emit', label: 'Emissor CT-e', icon: 'fa-file-signature', desc: 'Gerador de conhecimentos de transporte' },
        { id: 'model', label: 'Modelo DACTE', icon: 'fa-print', desc: 'Visualizador de layout padrão' },
    ];

    return (
        <div className="bg-bg-card text-light p-6 rounded-[2rem] shadow-2xl min-h-[80vh] border border-white/5 animate-fade-in">
            {/* Header com Navegação em Quadros (Cards) */}
            <div className="mb-8">
                <div className="flex flex-col md:flex-row justify-between items-end mb-6 gap-4">
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter uppercase leading-none">
                            CT-e <span className="text-primary">MANAGER</span>
                        </h1>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mt-2">
                            Central de Inteligência Fiscal
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {TAB_ITEMS.map((tab) => (
                        <button 
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as 'read' | 'emit' | 'model')}
                            className={`p-6 rounded-2xl border transition-all text-left group relative overflow-hidden ${
                                activeTab === tab.id 
                                    ? 'bg-primary/10 border-primary shadow-[0_0_20px_rgba(var(--color-primary-val),0.2)]' 
                                    : 'bg-bg-main border-white/5 hover:border-white/20 hover:bg-white/5'
                            }`}
                        >
                            <div className="relative z-10 flex flex-col h-full">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl mb-4 transition-colors ${
                                    activeTab === tab.id ? 'bg-primary text-black' : 'bg-bg-card text-gray-500 group-hover:text-white'
                                }`}>
                                    <i className={`fas ${tab.icon}`}></i>
                                </div>
                                <h3 className={`font-black text-sm uppercase tracking-wider mb-1 ${
                                    activeTab === tab.id ? 'text-primary' : 'text-gray-300 group-hover:text-white'
                                }`}>
                                    {tab.label}
                                </h3>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wide opacity-80">
                                    {tab.desc}
                                </p>
                            </div>
                            {/* Background decoration */}
                            <i className={`fas ${tab.icon} absolute -bottom-4 -right-4 text-8xl opacity-5 group-hover:scale-110 transition-transform`}></i>
                        </button>
                    ))}
                </div>
            </div>

            {/* Conteúdo Dinâmico */}
            <div className="bg-bg-main/30 border border-white/5 rounded-[2rem] p-6 shadow-inner min-h-[500px]">
                {activeTab === 'read' && (
                    <div className="flex flex-col lg:flex-row gap-6 animate-slide-up">
                        <section className="lg:w-1/3 flex flex-col gap-4">
                            <div className="bg-bg-card p-6 rounded-2xl border border-white/5">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-sm font-black text-light uppercase tracking-wider">Arquivo Fonte</h2>
                                    <button onClick={clearCache} className="text-[9px] uppercase font-bold text-gray-500 hover:text-danger transition-colors bg-white/5 px-2 py-1 rounded">
                                        Limpar Cache
                                    </button>
                                </div>
                                <div
                                    className="border-2 border-dashed border-gray-700 hover:border-primary/50 bg-black/20 rounded-xl p-10 text-center cursor-pointer transition-all group"
                                    onClick={() => fileInputRef.current?.click()}
                                    onDragOver={onDragOver}
                                    onDrop={onDrop}
                                >
                                    <i className="fas fa-cloud-upload-alt text-4xl text-gray-600 mb-4 group-hover:text-primary transition-colors"></i>
                                    <p className="text-xs font-bold text-gray-400 group-hover:text-light">
                                        ARRASTE O XML OU PDF AQUI
                                    </p>
                                    <input type="file" ref={fileInputRef} className="hidden" accept=".xml,.pdf" onChange={onFileInputChange} />
                                </div>
                                <div className="mt-4 text-[10px] text-gray-500 font-mono text-center bg-black/40 p-2 rounded-lg border border-white/5">
                                    {fileInfo}
                                </div>
                            </div>
                            
                            {cteData.chaveAcesso && (
                                <div className="bg-bg-card p-6 rounded-2xl border border-white/5 flex-grow">
                                    <h3 className="text-xs font-black text-secondary uppercase tracking-wider mb-4">Metadados Extraídos</h3>
                                    <div className="space-y-3">
                                        <div><label className="text-[9px] text-gray-500 uppercase font-bold block mb-1">Chave de Acesso</label><input type="text" value={cteData.chaveAcesso} readOnly className="form-input font-mono text-[10px]" /></div>
                                        <div><label className="text-[9px] text-gray-500 uppercase font-bold block mb-1">Valor Total</label><input type="text" value={cteData.valorCTe} readOnly className="form-input text-success font-bold" /></div>
                                        <div><label className="text-[9px] text-gray-500 uppercase font-bold block mb-1">Emitente</label><input type="text" value={cteData.emitenteNome} readOnly className="form-input" /></div>
                                    </div>
                                    <div className="flex gap-2 mt-4 pt-4 border-t border-white/5">
                                        <button onClick={downloadJSON} className="flex-1 btn-action bg-primary text-black text-xs"><i className="fas fa-download mr-1"></i> JSON</button>
                                        <button onClick={() => cteData.chaveAcesso && generateQRCode(cteData.chaveAcesso)} className="flex-1 btn-action bg-secondary text-white text-xs"><i className="fas fa-qrcode mr-1"></i> QR</button>
                                    </div>
                                </div>
                            )}
                        </section>

                        <section className="lg:w-2/3 bg-white/5 rounded-2xl border border-white/5 p-1 relative overflow-hidden" ref={pdfContainerRef}>
                            {isPdfMode ? (
                                <div className="flex flex-col items-center justify-center h-full bg-black/50 p-4">
                                    <ValidationStatusDisplay status={validationStatus} message={validationMessage} />
                                    <canvas ref={canvasRef} className="shadow-2xl border border-white/10 max-w-full rounded-lg" />
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-center p-10 opacity-50">
                                    <i className="fas fa-file-invoice text-6xl mb-4 text-gray-600"></i>
                                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Nenhuma visualização ativa</p>
                                </div>
                            )}
                        </section>
                    </div>
                )}
                
                {activeTab === 'emit' && (
                    <div className="flex flex-wrap gap-6 animate-slide-up">
                        <div className="flex-1 min-w-[400px] bg-bg-card p-8 rounded-3xl border border-white/5">
                            <h3 className="text-lg font-black text-secondary uppercase tracking-widest mb-6 border-b border-white/5 pb-4">Simulador de Emissão</h3>
                            
                            <div className="form-section mb-6">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Modelo Fiscal</label>
                                <select value={cteType} onChange={(e) => setCteType(e.target.value as "normal" | "os")} className="form-input bg-bg-main border-white/10 p-3 rounded-xl">
                                    <option value="normal">CT-e Normal (57) - Carga Geral</option>
                                    <option value="os">CT-e OS (67) - Fretamento/Pessoas</option>
                                </select>
                            </div>

                            {cteType === 'normal' && (
                                <div className="form-section mb-6">
                                    <h4 className="section-title text-xs font-bold text-primary mb-3">Remetente da Carga</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <input placeholder="Razão Social" value={sender.name} onChange={e => setSender({...sender, name: e.target.value})} className="form-input" />
                                        <input placeholder="CNPJ" value={sender.cnpj} onChange={e => setSender({...sender, cnpj: e.target.value})} className="form-input" />
                                    </div>
                                </div>
                            )}

                            <div className="form-section mb-6">
                                <h4 className="section-title text-xs font-bold text-primary mb-3">{cteType === 'os' ? 'Tomador do Serviço' : 'Destinatário'}</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <input placeholder="Razão Social" value={receiver.name} onChange={e => setReceiver({...receiver, name: e.target.value})} className="form-input" />
                                    <input placeholder="CNPJ/CPF" value={receiver.cnpj} onChange={e => setReceiver({...receiver, cnpj: e.target.value})} className="form-input" />
                                    <input placeholder="Cidade" value={receiver.city} onChange={e => setReceiver({...receiver, city: e.target.value})} className="form-input" />
                                    <input placeholder="UF" value={receiver.uf} onChange={e => setReceiver({...receiver, uf: e.target.value})} className="form-input" />
                                </div>
                            </div>

                            <div className="form-section mb-6 bg-black/20 p-4 rounded-xl border border-white/5">
                                <h4 className="section-title text-xs font-bold text-gray-400 mb-3 uppercase">Serviços / Componentes</h4>
                                {items.map((it, idx) => (
                                    <div key={idx} className="flex gap-2 mb-2 items-center">
                                        <input value={it.description} onChange={e => updateItem(idx, 'description', e.target.value)} placeholder="Descrição" className="form-input flex-grow text-xs" />
                                        <input type="number" value={it.unitValue} onChange={e => updateItem(idx, 'unitValue', e.target.value)} placeholder="Valor" className="form-input w-24 text-xs font-bold text-right" />
                                        <button onClick={() => removeItem(idx)} className="text-red-500 hover:bg-red-500/10 p-2 rounded transition-colors"><i className="fas fa-times"></i></button>
                                    </div>
                                ))}
                                <button onClick={addItem} className="text-[10px] font-bold text-primary hover:text-white mt-2 uppercase tracking-wide">+ Adicionar Item</button>
                            </div>

                            <div className="flex justify-between items-center pt-6 border-t border-white/5">
                                <div>
                                    <span className="text-[9px] font-bold text-gray-500 uppercase block">Valor Total</span>
                                    <span className="text-2xl font-black text-white">{formatCurrency(totalValue)}</span>
                                </div>
                                <button onClick={() => handleGenerateCte(cteType)} className="bg-success text-black font-black uppercase text-xs px-8 py-4 rounded-xl shadow-lg hover:scale-105 transition-all">
                                    Gerar Documento
                                </button>
                            </div>
                        </div>

                        {/* Preview Panel */}
                        <div className="flex-1 min-w-[500px] bg-white rounded-3xl overflow-hidden shadow-2xl relative">
                            {generatedData ? (
                                <div className="h-full overflow-y-auto custom-scrollbar">
                                    <DactePreview 
                                        data={generatedData} 
                                        onPrint={printDacte} 
                                        onDownloadXml={downloadXML}
                                    />
                                </div>
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 text-gray-400">
                                    <i className="fas fa-print text-6xl mb-4 opacity-20"></i>
                                    <p className="text-xs font-bold uppercase tracking-widest">Aguardando geração...</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'model' && (
                    <div className="bg-white rounded-[2rem] overflow-hidden shadow-2xl h-full animate-slide-up">
                        <DacteModel />
                    </div>
                )}
            </div>

            {qrCodeDataUrl && (
                <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[5000] backdrop-blur-sm" onClick={() => setQrCodeDataUrl(null)}>
                    <div className="bg-white p-8 rounded-3xl text-center shadow-[0_0_50px_rgba(255,255,255,0.2)]" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-black text-black mb-6 uppercase tracking-tight">Chave de Acesso Digital</h3>
                        <img src={qrCodeDataUrl} alt="QR Code" className="mx-auto w-64 h-64 border-4 border-black rounded-xl" />
                        <p className="text-[10px] font-mono text-gray-500 mt-4 break-all max-w-xs mx-auto bg-gray-100 p-2 rounded border border-gray-200">{cteData.chaveAcesso}</p>
                        <button onClick={() => setQrCodeDataUrl(null)} className="mt-8 px-6 py-2 bg-black text-white font-bold rounded-full hover:bg-gray-800 transition-colors text-xs uppercase tracking-widest">Fechar</button>
                    </div>
                </div>
            )}

            <style>{`
                .form-input { width: 100%; padding: 12px; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; background-color: rgba(0,0,0,0.3); color: white; font-size: 13px; outline: none; transition: all 0.2s; }
                .form-input:focus { border-color: var(--color-primary-val); background-color: rgba(0,0,0,0.5); }
                .btn-action { padding: 8px 16px; border-radius: 8px; font-weight: 700; transition: all 0.2s; display: flex; align-items: center; justify-content: center; text-transform: uppercase; letter-spacing: 0.05em; }
                .btn-action:hover { opacity: 0.9; transform: translateY(-1px); }
            `}</style>
        </div>
    );
};

export default CteReader;

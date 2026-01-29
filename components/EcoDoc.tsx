
import React, { useState, useRef } from 'react';
import { useAppStore } from '../hooks/useAppStore';
import { useAuth } from '../hooks/useAuth';
import { Frete, Demand } from '../types';

type DocTemplate = 
    | 'frete_recibo' 
    | 'container_recibo' 
    | 'dse_export' 
    | 'vale_adiantamento' 
    | 'recibo_terceiros'
    | 'holerite'
    | 'relatorio_custos'
    | 'gerador_geral';

interface TemplateInfo {
    id: DocTemplate;
    title: string;
    icon: string;
    desc: string;
    category: 'Logística' | 'Financeiro' | 'RH' | 'Geral';
}

const EcoDoc: React.FC = () => {
    const { demands, freightSheetData, logAction } = useAppStore();
    const { currentUser } = useAuth();
    const [selectedTemplate, setSelectedTemplate] = useState<DocTemplate | null>(null);
    const [selectedSource, setSelectedSource] = useState<{ type: 'demand' | 'freight', id: string } | null>(null);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    const templates: TemplateInfo[] = [
        { id: 'frete_recibo', title: 'Recibo de Transporte', icon: 'fa-truck', desc: 'Comprovante fiscal/operacional de frete.', category: 'Logística' },
        { id: 'container_recibo', title: 'Ticket de Container', icon: 'fa-box', desc: 'Gate pass e controle de pátio.', category: 'Logística' },
        { id: 'dse_export', title: 'DSE - Exportação', icon: 'fa-file-export', desc: 'Declaração simplificada para despacho.', category: 'Logística' },
        { id: 'vale_adiantamento', title: 'Vale Adiantamento', icon: 'fa-money-bill-wave', desc: 'Comprovante de adiantamento financeiro.', category: 'Financeiro' },
        { id: 'recibo_terceiros', title: 'Recibo de Terceiros', icon: 'fa-handshake', desc: 'Pagamento a prestadores sem vínculo.', category: 'Financeiro' },
        { id: 'relatorio_custos', title: 'Relatório de Custos', icon: 'fa-chart-line', desc: 'Consolidação de gastos de viagem.', category: 'Financeiro' },
        { id: 'holerite', title: 'Holerite / Pagamento', icon: 'fa-user-tag', desc: 'Recibo de salário ou pró-labore.', category: 'RH' },
        { id: 'gerador_geral', title: 'Documento Genérico', icon: 'fa-file-alt', desc: 'Modelo em branco com cabeçalho corporativo.', category: 'Geral' },
    ];

    const categories = ['Logística', 'Financeiro', 'RH', 'Geral'];

    const handleSelectTemplate = (id: string) => {
        setSelectedTemplate(id as DocTemplate);
        logAction(`ECO.DOCS: Iniciando edição de ${id}`);
    };

    const handlePrint = () => {
        if (iframeRef.current && iframeRef.current.contentWindow) {
            iframeRef.current.contentWindow.focus();
            iframeRef.current.contentWindow.print();
            logAction(`ECO.DOCS: Documento ${selectedTemplate} enviado para impressão.`);
        }
    };

    const getSourceData = () => {
        if (!selectedSource) return null;
        if (selectedSource.type === 'demand') return demands.find(d => d.id === selectedSource.id);
        return freightSheetData.find(f => f.id === selectedSource.id);
    };

    const getIframeDoc = () => {
        const sourceData = getSourceData();
        const dataNow = new Date().toLocaleDateString('pt-BR');
        
        // CSS Styles for A4 Print
        const proStyles = `
            @page { size: A4; margin: 0; }
            * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            body { 
                font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; 
                background: #525659; 
                margin: 0; padding: 20px; 
                display: flex; justify-content: center;
            }
            .page {
                width: 210mm; min-height: 297mm; 
                background: #fff; 
                padding: 15mm; 
                position: relative;
                box-shadow: 0 0 10px rgba(0,0,0,0.5);
            }
            .header { 
                display: flex; justify-content: space-between; align-items: flex-start;
                border-bottom: 2px solid #1e293b; padding-bottom: 15px; margin-bottom: 30px;
            }
            .brand { display: flex; align-items: center; gap: 15px; }
            .logo-placeholder { 
                width: 50px; height: 50px; background: #1e293b; color: white; 
                display: flex; align-items: center; justify-content: center; 
                font-size: 24px; border-radius: 8px; font-weight: bold;
            }
            .company-info h1 { margin: 0; font-size: 16px; text-transform: uppercase; color: #1e293b; letter-spacing: 1px; }
            .company-info p { margin: 2px 0 0; font-size: 10px; color: #64748b; }
            .doc-meta { text-align: right; }
            .doc-title { font-size: 20px; font-weight: 900; color: #1e293b; text-transform: uppercase; margin: 0; }
            .doc-id { font-size: 11px; color: #ef4444; font-weight: bold; font-family: monospace; margin-top: 5px; }

            .section-title { 
                font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; 
                border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin: 20px 0 10px 0; letter-spacing: 0.5px;
            }
            .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
            .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; }
            .field-box { margin-bottom: 10px; }
            .label { font-size: 9px; color: #94a3b8; font-weight: 600; text-transform: uppercase; display: block; margin-bottom: 2px; }
            
            .editable { 
                font-size: 13px; color: #0f172a; font-weight: 500; 
                border-bottom: 1px dashed #cbd5e1; padding: 2px 0; display: block;
                transition: background 0.2s;
                min-height: 18px;
            }
            .editable:hover, .editable:focus { background: #e0f2fe; outline: none; border-bottom: 1px solid #3b82f6; }
            .editable:empty::before { content: attr(placeholder); color: #cbd5e1; }
            .editable.large { font-size: 16px; font-weight: 700; }
            .editable.mono { font-family: 'Courier New', monospace; }
            
            table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
            th { text-align: left; background: #f8fafc; padding: 8px; border-bottom: 1px solid #e2e8f0; color: #475569; font-weight: 700; font-size: 10px; text-transform: uppercase; }
            td { padding: 8px; border-bottom: 1px solid #f1f5f9; color: #334155; }
            
            .footer { 
                position: absolute; bottom: 15mm; left: 15mm; right: 15mm; 
                border-top: 1px solid #e2e8f0; padding-top: 15px;
                display: flex; justify-content: space-between; align-items: flex-end;
            }
            .signatures { display: flex; gap: 40px; }
            .sig-block { text-align: center; }
            .sig-line { width: 180px; border-top: 1px solid #000; margin-bottom: 5px; }
            .sig-name { font-size: 11px; font-weight: 700; color: #1e293b; text-transform: uppercase; }
            .sig-role { font-size: 9px; color: #64748b; }
            .timestamp { font-size: 9px; color: #94a3b8; text-align: right; }

            @media print {
                body { background: white !important; padding: 0 !important; margin: 0 !important; }
                .page { box-shadow: none !important; margin: 0 !important; width: 100% !important; height: auto !important; padding: 10mm !important; }
                .editable { border-bottom: none !important; background: transparent !important; }
                .editable:empty::before { content: ""; }
            }
        `;

        const renderHeader = (title: string, id: string = 'GERADO AUTOMATICAMENTE') => `
            <div class="header">
                <div class="brand">
                    <div class="logo-placeholder">EL</div>
                    <div class="company-info">
                        <h1>Império Eco Log Ltda</h1>
                        <p>CNPJ: 32.243.464/0001-15 | IE: 123.456.789</p>
                        <p>Av. Brasil, 2520 - Caju, Rio de Janeiro - RJ</p>
                        <p>contato@imperiolog.com.br | (21) 2594-1889</p>
                    </div>
                </div>
                <div class="doc-meta">
                    <h2 class="doc-title">${title}</h2>
                    <div class="doc-id">#${id.slice(-8).toUpperCase()}</div>
                </div>
            </div>
        `;

        const renderFooter = () => `
            <div class="footer">
                <div class="signatures">
                    <div class="sig-block">
                        <div class="sig-line"></div>
                        <div class="sig-name">Operacional</div>
                        <div class="sig-role">Império Eco Log</div>
                    </div>
                    <div class="sig-block">
                        <div class="sig-line"></div>
                        <div class="sig-name editable" contenteditable="true" placeholder="Assinatura Responsável"></div>
                        <div class="sig-role">Recebedor / Motorista</div>
                    </div>
                </div>
                <div class="timestamp">
                    Gerado em: ${new Date().toLocaleString('pt-BR')}<br>
                    Sistema EcoLog Intelligence v5.2
                </div>
            </div>
        `;

        const toBRL = (val?: number) => val ? val.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'}) : '';

        // --- TEMPLATES ---

        if (selectedTemplate === 'frete_recibo') {
            const data = sourceData as Frete;
            return `
                <html><head><style>${proStyles}</style></head><body>
                    <div class="page">
                        ${renderHeader('Recibo de Transporte', data?.id)}
                        <div class="section-title">Dados do Cliente & Serviço</div>
                        <div class="grid-2">
                            <div class="field-box"><span class="label">Cliente</span><div class="editable large" contenteditable="true">${data?.cliente || ''}</div></div>
                            <div class="field-box"><span class="label">Ref / DI</span><div class="editable" contenteditable="true">${data?.referencia || ''}</div></div>
                        </div>
                        <div class="section-title">Detalhes</div>
                        <div class="grid-3">
                            <div class="field-box"><span class="label">Origem</span><div class="editable" contenteditable="true">${data?.terminal || ''}</div></div>
                            <div class="field-box"><span class="label">Destino</span><div class="editable" contenteditable="true">${data?.destino || ''}</div></div>
                            <div class="field-box"><span class="label">Data</span><div class="editable" contenteditable="true">${data?.data || dataNow}</div></div>
                        </div>
                        <div class="section-title">Veículo & Carga</div>
                        <div class="grid-3">
                            <div class="field-box"><span class="label">Motorista</span><div class="editable" contenteditable="true">${data?.motorista || ''}</div></div>
                            <div class="field-box"><span class="label">Placa</span><div class="editable mono" contenteditable="true">${data?.cavalo || ''}</div></div>
                            <div class="field-box"><span class="label">Container</span><div class="editable mono large" contenteditable="true">${data?.container || ''}</div></div>
                        </div>
                        <div class="section-title">Valor</div>
                        <div style="background:#f8fafc;padding:20px;border:1px solid #e2e8f0;border-radius:8px;">
                            <div class="grid-2">
                                <div><span class="label">Descrição</span><div class="editable" contenteditable="true">Transporte Rodoviário de Cargas</div></div>
                                <div style="text-align:right;"><span class="label">Total (R$)</span><div class="editable large" contenteditable="true" style="text-align:right;">${toBRL(data?.vrFrete)}</div></div>
                            </div>
                        </div>
                        <div class="section-title">Observações</div>
                        <div class="field-box"><div class="editable" contenteditable="true" style="min-height:60px;">${data?.obs || ''}</div></div>
                        ${renderFooter()}
                    </div>
                </body></html>
            `;
        }

        if (selectedTemplate === 'container_recibo') {
             const data = sourceData as Frete;
             return `
                <html><head><style>${proStyles}</style></head><body>
                    <div class="page">
                        ${renderHeader('Ticket de Container', data?.id)}
                        <div style="text-align: center; margin: 40px 0;">
                            <span class="label">Identificação</span>
                            <div class="editable mono" contenteditable="true" style="font-size: 42px; font-weight: 900; letter-spacing: 2px;">${data?.container || 'AAAA000000-0'}</div>
                            <div style="margin-top: 10px; display: inline-block; padding: 5px 15px; background: #e2e8f0; border-radius: 4px; font-weight: bold;">
                                <div class="editable" contenteditable="true" style="text-align: center;">${data?.tipo || "40' HC"}</div>
                            </div>
                        </div>
                        <div class="grid-2" style="border: 2px solid #1e293b; border-radius: 8px; overflow: hidden;">
                            <div style="padding: 20px; border-right: 1px solid #e2e8f0;">
                                <div class="section-title" style="margin-top:0;">Origem</div>
                                <div class="field-box"><span class="label">Terminal</span><div class="editable" contenteditable="true">${data?.terminal || ''}</div></div>
                            </div>
                            <div style="padding: 20px;">
                                <div class="section-title" style="margin-top:0;">Transportador</div>
                                <div class="field-box"><span class="label">Motorista</span><div class="editable" contenteditable="true">${data?.motorista || ''}</div></div>
                            </div>
                        </div>
                        <div class="section-title">Checklist Rápido</div>
                        <table><thead><tr><th>Item</th><th>Status</th><th>Obs</th></tr></thead><tbody><tr><td>Estrutura</td><td>OK/NOK</td><td class="editable" contenteditable="true">-</td></tr><tr><td>Lacres</td><td>OK/NOK</td><td class="editable" contenteditable="true">-</td></tr></tbody></table>
                        ${renderFooter()}
                    </div>
                </body></html>
             `;
        }

        if (selectedTemplate === 'holerite') {
             return `
                <html><head><style>${proStyles}</style></head><body>
                    <div class="page">
                        ${renderHeader('Recibo de Pagamento Salarial')}
                        <div class="grid-2" style="margin-top:20px;">
                            <div class="field-box"><span class="label">Colaborador</span><div class="editable large" contenteditable="true">NOME DO FUNCIONÁRIO</div></div>
                            <div class="field-box"><span class="label">CPF</span><div class="editable" contenteditable="true">000.000.000-00</div></div>
                        </div>
                        <div class="field-box"><span class="label">Referência</span><div class="editable" contenteditable="true">MÊS / ANO</div></div>
                        <table style="margin-top:20px;">
                            <thead><tr><th>Descrição</th><th style="text-align:right;">Vencimentos</th><th style="text-align:right;">Descontos</th></tr></thead>
                            <tbody>
                                <tr><td><div class="editable" contenteditable="true">Salário Base</div></td><td style="text-align:right;"><div class="editable" contenteditable="true">R$ 0,00</div></td><td></td></tr>
                                <tr><td><div class="editable" contenteditable="true">Hora Extra</div></td><td style="text-align:right;"><div class="editable" contenteditable="true">R$ 0,00</div></td><td></td></tr>
                                <tr><td><div class="editable" contenteditable="true">INSS</div></td><td></td><td style="text-align:right;"><div class="editable" contenteditable="true">R$ 0,00</div></td></tr>
                                <tr><td><div class="editable" contenteditable="true">Adiantamento</div></td><td></td><td style="text-align:right;"><div class="editable" contenteditable="true">R$ 0,00</div></td></tr>
                            </tbody>
                        </table>
                        <div style="margin-top:20px; text-align:right; font-size:18px; font-weight:bold; padding:10px; background:#f1f5f9;">
                            Líquido a Receber: <span class="editable" contenteditable="true" style="display:inline-block; min-width:100px;">R$ 0,00</span>
                        </div>
                        <div style="margin-top:50px; text-align:center;">
                            <div style="border-top:1px solid #000; width:60%; margin:0 auto 5px auto;"></div>
                            <span style="font-size:10px;">Assinatura do Colaborador</span>
                        </div>
                        ${renderFooter()}
                    </div>
                </body></html>
             `;
        }
        
        if (selectedTemplate === 'recibo_terceiros') {
             return `
                <html><head><style>${proStyles}</style></head><body>
                    <div class="page">
                        ${renderHeader('Recibo de Pagamento - Terceiros')}
                        <div style="border: 2px solid #1e293b; border-radius: 12px; padding: 30px; margin: 40px 0; text-align: center;">
                            <span class="label">VALOR RECEBIDO</span>
                            <div class="editable large" contenteditable="true" style="font-size: 36px; margin: 10px 0; color: #0f172a; text-align: center;" placeholder="R$ 0,00"></div>
                        </div>
                        <div class="field-box">
                            <div class="editable" contenteditable="true" style="min-height:80px; line-height:1.6;">
                                Recebi da empresa IMPÉRIO ECO LOG LTDA, a importância supra de R$ _____________, referente aos serviços de: (DESCREVER SERVIÇO) ______________________________________________________.
                            </div>
                        </div>
                        <div class="grid-2">
                            <div class="field-box"><span class="label">Nome Beneficiário</span><div class="editable" contenteditable="true"></div></div>
                            <div class="field-box"><span class="label">CPF / CNPJ</span><div class="editable" contenteditable="true"></div></div>
                        </div>
                        <div style="margin-top:50px; text-align:center;">
                            <div style="border-top:1px solid #000; width:60%; margin:0 auto 5px auto;"></div>
                            <span style="font-size:10px;">Assinatura do Beneficiário</span>
                        </div>
                        ${renderFooter()}
                    </div>
                </body></html>
             `;
        }

        // Default Generic
        return `
            <html><head><style>${proStyles}</style></head><body>
                <div class="page">
                    ${renderHeader('Documento Interno')}
                    <div class="section-title">Conteúdo</div>
                    <div class="field-box"><span class="label">Assunto</span><div class="editable large" contenteditable="true">TÍTULO</div></div>
                    <div class="field-box" style="margin-top: 20px;">
                        <span class="label">Corpo do Texto</span>
                        <div class="editable" contenteditable="true" style="min-height: 400px; vertical-align: top; line-height: 1.8;">
                            <p>Digite o conteúdo do documento aqui...</p>
                        </div>
                    </div>
                    ${renderFooter()}
                </div>
            </body></html>
        `;
    };

    return (
        <div className="flex flex-col h-full space-y-6 animate-fade-in">
            {/* Gallery View */}
            {!selectedTemplate ? (
                <div>
                    <h2 className="text-3xl font-black text-light mb-6">Eco.Docs - Central de Documentação</h2>
                    <div className="space-y-8">
                        {categories.map(cat => (
                            <div key={cat}>
                                <h3 className="text-xs font-black text-secondary uppercase tracking-widest mb-4 border-b border-white/5 pb-2">{cat}</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {templates.filter(t => t.category === cat).map(tmp => (
                                        <button 
                                            key={tmp.id}
                                            onClick={() => handleSelectTemplate(tmp.id)}
                                            className="bg-bg-card p-6 rounded-3xl border border-border-color/50 hover:border-primary/50 transition-all text-left flex flex-col group shadow-xl hover:translate-y-[-4px]"
                                        >
                                            <div className="w-12 h-12 bg-bg-main rounded-2xl flex items-center justify-center text-gray-500 group-hover:bg-primary/20 group-hover:text-primary mb-4 transition-all">
                                                <i className={`fas ${tmp.icon} text-xl`}></i>
                                            </div>
                                            <h3 className="font-black text-light uppercase text-xs tracking-widest mb-2">{tmp.title}</h3>
                                            <p className="text-gray-text text-[10px] leading-relaxed opacity-60">{tmp.desc}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                /* Editor View */
                <div className="flex flex-col lg:flex-row gap-6 h-full min-h-[700px]">
                    <div className="lg:w-80 space-y-6 shrink-0">
                        <div className="bg-bg-card p-6 rounded-3xl border border-border-color/50 shadow-xl">
                            <h3 className="text-[10px] font-black uppercase text-secondary tracking-widest mb-6">Configuração</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[9px] font-bold text-gray-500 uppercase block mb-2">Preencher com:</label>
                                    <select 
                                        className="w-full bg-bg-main border border-border-color rounded-xl p-3 text-xs text-light outline-none focus:border-primary transition-all"
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (!val) { setSelectedSource(null); return; }
                                            const [type, id] = val.split(':');
                                            setSelectedSource({ type: type as 'demand' | 'freight', id });
                                        }}
                                    >
                                        <option value="">(Manual)</option>
                                        <optgroup label="Fretes">
                                            {freightSheetData.slice(0, 10).map(f => <option key={f.id} value={`freight:${f.id}`}>{f.cliente}</option>)}
                                        </optgroup>
                                    </select>
                                </div>
                                <button onClick={handlePrint} className="w-full py-4 bg-primary text-white font-black uppercase tracking-widest rounded-xl shadow-lg hover:opacity-90 transition-all flex items-center justify-center gap-2 transform active:scale-95">
                                    <i className="fas fa-print"></i> IMPRIMIR
                                </button>
                                <button onClick={() => setSelectedTemplate(null)} className="w-full py-3 bg-bg-main border border-border-color text-gray-400 font-bold uppercase text-[9px] tracking-widest rounded-xl hover:text-light transition-all">
                                    Voltar
                                </button>
                            </div>
                        </div>
                        <div className="bg-bg-card p-6 rounded-3xl border border-border-color/50 opacity-60">
                             <p className="text-[10px] leading-relaxed text-gray-400">
                                Clique nos campos tracejados na visualização ao lado para editar o texto antes de imprimir.
                             </p>
                        </div>
                    </div>

                    <div className="flex-1 bg-[#525659] rounded-3xl border border-border-color shadow-2xl overflow-hidden relative min-h-[800px] flex items-center justify-center p-8">
                        <iframe 
                            ref={iframeRef}
                            srcDoc={getIframeDoc()}
                            className="w-full h-full border-none shadow-2xl"
                            style={{ maxWidth: '210mm', height: '297mm', background: 'white' }}
                            title="Preview do Documento"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default EcoDoc;

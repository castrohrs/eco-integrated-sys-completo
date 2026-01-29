
import React, { useState, useMemo, useEffect } from 'react';
import { useAppStore } from '../hooks/useAppStore';
import { useAuth } from '../hooks/useAuth';
import { ServiceOrder, OsStatus, MecPart, MecServiceItem, OsType, OsStep, Mechanic } from '../types';
import { getMecBI } from '../services/mecMetricsService';

const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

type ViewMode = 'dashboard' | 'os_list' | 'inventory' | 'team' | 'finance' | 'os_detail' | 'multirio';

const EcoMec: React.FC = () => {
    const { 
        serviceOrders, setServiceOrders, 
        mechanics, setMechanics,
        mechanicParts, setMechanicParts, 
        logAction 
    } = useAppStore();
    const { currentUser } = useAuth();
    
    const [view, setView] = useState<ViewMode>('dashboard');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOsId, setSelectedOsId] = useState<string | null>(null);
    const [activeOsTab, setActiveOsTab] = useState<string>('entrance');

    const bi = useMemo(() => getMecBI(serviceOrders), [serviceOrders]);

    const stepsInfo = [
        { id: 'entrance', label: 'Entrada', icon: 'fa-sign-in-alt', color: 'text-blue-400' },
        { id: 'checklist', label: 'Vistoria', icon: 'fa-clipboard-check', color: 'text-purple-400' },
        { id: 'quote', label: 'Orçamento', icon: 'fa-file-invoice-dollar', color: 'text-yellow-400' },
        { id: 'bodywork', label: 'Funilaria', icon: 'fa-hammer', color: 'text-orange-400' },
        { id: 'painting', label: 'Pintura', icon: 'fa-fill-drip', color: 'text-pink-400' },
        { id: 'mechanics', label: 'Mecânica', icon: 'fa-cogs', color: 'text-cyan-400' },
        { id: 'electrical', label: 'Elétrica', icon: 'fa-bolt', color: 'text-yellow-300' },
        { id: 'parts', label: 'Suprimento', icon: 'fa-box-open', color: 'text-gray-400' },
        { id: 'wash', label: 'Lavagem', icon: 'fa-shower', color: 'text-blue-300' },
        { id: 'exit', label: 'Saída', icon: 'fa-check-double', color: 'text-success' }
    ];

    const currentOs = useMemo(() => serviceOrders.find(o => o.id === selectedOsId), [selectedOsId, serviceOrders]);

    // --- SISTEMA DE IMPRESSÃO PROFISSIONAL ---
    const handlePrintOs = () => {
        if (!currentOs) return;

        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const stepsHtml = stepsInfo.map(step => {
            const stepData = currentOs.steps[step.id as keyof typeof currentOs.steps] as OsStep;
            return `
                <div class="print-step">
                    <div class="step-header">
                        <strong>${step.label.toUpperCase()}</strong>
                        <span class="status ${stepData.status}">${stepData.status === 'completed' ? '✓ CONCLUÍDO' : stepData.status === 'in_progress' ? 'EM CURSO' : 'PENDENTE'}</span>
                    </div>
                    <div class="step-date">${stepData.completedAt ? new Date(stepData.completedAt).toLocaleString('pt-BR') : '---'}</div>
                </div>
            `;
        }).join('');

        printWindow.document.write(`
            <html>
                <head>
                    <title>OS - ${currentOs.id}</title>
                    <style>
                        body { font-family: sans-serif; padding: 40px; color: #000; background: #fff; }
                        .header { display: flex; justify-content: space-between; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
                        .logo { font-size: 24px; font-weight: 900; }
                        .os-info { text-align: right; }
                        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
                        .box { border: 1px solid #ccc; padding: 10px; border-radius: 5px; }
                        .box-title { font-size: 10px; font-weight: bold; color: #666; text-transform: uppercase; margin-bottom: 5px; }
                        .box-val { font-size: 16px; font-weight: bold; }
                        .steps-container { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
                        .print-step { border: 1px solid #eee; padding: 8px; font-size: 11px; border-radius: 4px; }
                        .step-header { display: flex; justify-content: space-between; border-bottom: 1px solid #f0f0f0; margin-bottom: 3px; }
                        .status.completed { color: green; font-weight: bold; }
                        .status.in_progress { color: orange; font-weight: bold; }
                        .signature-area { margin-top: 50px; display: flex; justify-content: space-around; }
                        .sig-line { border-top: 1px solid #000; width: 200px; text-align: center; padding-top: 5px; font-size: 10px; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div class="logo">ECO.MEC <span style="font-weight:100">| WORKSHOP</span></div>
                        <div class="os-info">
                            <strong>ORDEM DE SERVIÇO: ${currentOs.id}</strong><br/>
                            Abertura: ${new Date(currentOs.openingDate).toLocaleDateString('pt-BR')}
                        </div>
                    </div>
                    <div class="grid">
                        <div class="box"><div class="box-title">Veículo</div><div class="box-val">${currentOs.vehiclePlate}</div></div>
                        <div class="box"><div class="box-title">Tipo</div><div class="box-val">${currentOs.type.toUpperCase()}</div></div>
                    </div>
                    <div class="box" style="margin-bottom:20px"><div class="box-title">Relato Técnico / Descrição</div><div>${currentOs.description}</div></div>
                    
                    <h3 style="text-transform:uppercase; font-size:12px; border-bottom: 1px solid #000; padding-bottom:5px">Timeline de Produção</h3>
                    <div class="steps-container">${stepsHtml}</div>

                    <div class="signature-area">
                        <div class="sig-line">Responsável Técnico</div>
                        <div class="sig-line">Visto do Cliente</div>
                    </div>
                    <script>window.onload = function() { window.print(); setTimeout(window.close, 500); }</script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    const handleUpdateStep = (stepId: string, updates: Partial<OsStep>) => {
        if (!selectedOsId) return;
        setServiceOrders(prev => prev.map(os => {
            if (os.id === selectedOsId) {
                const updatedSteps = { 
                    ...os.steps, 
                    [stepId]: { ...os.steps[stepId as keyof typeof os.steps], ...updates } 
                };
                let newStatus = os.status;
                if (updates.status === 'in_progress') newStatus = 'em_execucao';
                return { ...os, status: newStatus, steps: updatedSteps, updatedAt: new Date().toISOString() };
            }
            return os;
        }));
    };

    const handleOpenNewOs = () => {
        const plate = prompt("Placa do Veículo:");
        if (!plate) return;
        const newOs: ServiceOrder = {
            id: `OS-${Math.floor(Math.random() * 90000) + 10000}`,
            vehicleId: `V-${Date.now()}`,
            vehiclePlate: plate.toUpperCase(),
            openingDate: new Date().toISOString(),
            status: 'aberta',
            type: 'preventiva',
            description: 'Abertura manual de OS via sistema',
            mileage: 0,
            parts: [],
            services: [],
            totalParts: 0,
            totalServices: 0,
            totalCost: 0,
            photosBefore: [],
            photosAfter: [],
            notes: '',
            steps: {
                entrance: { status: 'completed', startedAt: new Date().toISOString(), completedAt: new Date().toISOString() },
                checklist: { status: 'pending' },
                quote: { status: 'pending' },
                bodywork: { status: 'pending' },
                painting: { status: 'pending' },
                mechanics: { status: 'pending' },
                electrical: { status: 'pending' },
                parts: { status: 'pending' },
                wash: { status: 'pending' },
                exit: { status: 'pending' }
            }
        };
        setServiceOrders(prev => [newOs, ...prev]);
        setSelectedOsId(newOs.id);
        setView('os_detail');
        logAction(`ECO.MEC: Nova OS aberta para veículo ${plate}`);
    };

    const renderOsDetail = () => {
        if (!currentOs) return <div className="text-center py-20 text-gray-500 font-black">SELECIONE UMA OS</div>;

        return (
            <div className="bg-bg-card p-10 rounded-[3rem] border border-white/5 shadow-2xl animate-fade-in-up">
                <div className="flex justify-between items-start mb-10">
                    <div className="flex gap-6 items-center">
                        <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary text-2xl">
                            <i className="fas fa-microchip"></i>
                        </div>
                        <div>
                            <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Protocolo Operacional</span>
                            <h3 className="text-5xl font-black text-white tracking-tighter uppercase">{currentOs.vehiclePlate}</h3>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={handlePrintOs} className="w-14 h-14 rounded-2xl bg-secondary/10 text-secondary hover:bg-secondary hover:text-white flex items-center justify-center transition-all border border-secondary/20">
                            <i className="fas fa-print text-xl"></i>
                        </button>
                        <button onClick={() => setView('os_list')} className="w-14 h-14 rounded-2xl bg-white/5 text-gray-400 hover:text-white flex items-center justify-center transition-all">
                            <i className="fas fa-times text-xl"></i>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Pipeline Lateral */}
                    <div className="lg:col-span-1 space-y-2">
                        {stepsInfo.map(step => {
                            const stepData = currentOs.steps[step.id as keyof typeof currentOs.steps] as OsStep;
                            const isActive = activeOsTab === step.id;
                            return (
                                <button key={step.id} onClick={() => setActiveOsTab(step.id)} className={`w-full p-4 rounded-2xl border transition-all flex items-center justify-between group ${isActive ? 'bg-primary border-primary text-black' : 'bg-black/20 border-white/5 text-gray-500 hover:border-white/20'}`}>
                                    <div className="flex items-center gap-4">
                                        <i className={`fas ${step.icon} ${isActive ? 'text-black' : step.color}`}></i>
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-black' : 'text-gray-400'}`}>{step.label}</span>
                                    </div>
                                    <div className={`w-1.5 h-1.5 rounded-full ${stepData.status === 'completed' ? (isActive ? 'bg-black' : 'bg-success') : stepData.status === 'in_progress' ? 'bg-warning animate-pulse' : 'bg-gray-800'}`}></div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Área de Ação da Etapa */}
                    <div className="lg:col-span-3 bg-black/40 p-10 rounded-[2.5rem] border border-white/5 relative overflow-hidden">
                        <h4 className="text-3xl font-black text-white uppercase tracking-tighter mb-8">Gestão de {stepsInfo.find(s => s.id === activeOsTab)?.label}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div className="bg-bg-card p-6 rounded-2xl border border-white/5">
                                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-4">Status do Fluxo</p>
                                    <div className="flex gap-2">
                                        {['pending', 'in_progress', 'completed'].map(st => (
                                            <button key={st} onClick={() => handleUpdateStep(activeOsTab, { status: st as any, completedAt: st === 'completed' ? new Date().toISOString() : undefined })} className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${currentOs.steps[activeOsTab as keyof typeof currentOs.steps].status === st ? 'bg-primary text-black border-primary' : 'bg-black/50 text-gray-500 border-white/5 hover:text-white'}`}>
                                                {st.replace('_', ' ')}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="bg-primary/5 border border-primary/10 p-6 rounded-3xl text-gray-500 text-[10px] font-mono space-y-2">
                                <p className="text-primary font-bold"># LOG_DE_AUDITORIA</p>
                                <p>{'>'} OPERADOR: {currentUser?.name}</p>
                                <p>{'>'} STATUS_ETAPA: {currentOs.steps[activeOsTab as keyof typeof currentOs.steps].status.toUpperCase()}</p>
                                <p>{'>'} TIMESTAMP: {new Date().toISOString()}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderMultiRio = () => (
        <div className="h-[750px] w-full bg-white rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl animate-fade-in relative">
            <div className="absolute top-0 left-0 right-0 p-4 bg-bg-card border-b border-white/5 flex justify-between items-center z-10">
                <span className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2">
                    <i className="fas fa-external-link-alt"></i> Multirio: Janelas Disponíveis
                </span>
                <button onClick={() => window.open('https://www.multirio.com.br/janelas-disponiveis', '_blank')} className="text-[9px] font-black text-gray-500 hover:text-white transition-colors">ABRIR EM NOVA ABA</button>
            </div>
            <iframe 
                src="https://www.multirio.com.br/janelas-disponiveis" 
                className="w-full h-full pt-12 border-none"
                title="MultiRio Integrado"
            />
        </div>
    );

    return (
        <div className="space-y-10 pb-32 max-w-[1700px] mx-auto p-2">
            {/* UNIFIED HUD HEADER */}
            <div className="bg-[#080808]/90 backdrop-blur-3xl p-10 rounded-[3rem] border border-white/10 shadow-2xl flex flex-col lg:flex-row justify-between items-center gap-10">
                <div className="flex items-center gap-8">
                    <div className="w-20 h-20 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-[0_0_40px_rgba(20,184,166,0.15)]">
                        <i className="fas fa-tools text-4xl"></i>
                    </div>
                    <div>
                        <h2 className="text-5xl font-black text-white tracking-tighter uppercase leading-none">ECO.<span className="text-primary">MEC</span></h2>
                        <div className="flex items-center gap-3 mt-3">
                            <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">Integrated Commander v7.0</span>
                        </div>
                    </div>
                </div>

                <div className="flex bg-black/60 p-2 rounded-[2rem] border border-white/5 backdrop-blur-xl">
                    {[
                        { id: 'dashboard', label: 'Monitor', icon: 'fa-satellite' },
                        { id: 'os_list', label: 'Ordens', icon: 'fa-microchip' },
                        { id: 'multirio', label: 'Multirio', icon: 'fa-ship' },
                        { id: 'team', label: 'Equipe', icon: 'fa-users-gear' },
                        { id: 'finance', label: 'P&L', icon: 'fa-coins' }
                    ].map(tab => (
                        <button key={tab.id} onClick={() => setView(tab.id as ViewMode)} className={`px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-3 ${view === tab.id ? 'bg-primary text-black shadow-lg shadow-primary/20 scale-105' : 'text-gray-500 hover:text-white'}`}>
                            <i className={`fas ${tab.icon}`}></i> {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <main>
                {view === 'dashboard' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
                        <div className="bg-bg-card p-8 rounded-[2.5rem] border border-white/5"><p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Atendimento Ativo</p><p className="text-4xl font-black text-white mt-2">{serviceOrders.filter(o => o.status !== 'finalizada').length} Veículos</p></div>
                        <div className="bg-bg-card p-8 rounded-[2.5rem] border border-white/5"><p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Ocupação Boxes</p><p className="text-4xl font-black text-primary mt-2">72%</p></div>
                        <div className="bg-bg-card p-8 rounded-[2.5rem] border border-white/5"><p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Peças em Espera</p><p className="text-4xl font-black text-warning mt-2">12 Itens</p></div>
                        <div className="bg-bg-card p-8 rounded-[2.5rem] border border-white/5"><p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Faturamento Mês</p><p className="text-4xl font-black text-success mt-2">{formatCurrency(bi.period.totalValue)}</p></div>
                    </div>
                )}

                {view === 'multirio' && renderMultiRio()}
                {view === 'os_detail' && renderOsDetail()}

                {view === 'os_list' && (
                    <div className="bg-bg-card p-10 rounded-[3.5rem] border border-white/5 shadow-2xl animate-fade-in">
                        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
                            <input type="text" placeholder="FILTRAR PLACA OU PROTOCOLO..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="bg-black/50 border border-white/10 rounded-2xl px-6 py-5 text-sm text-white focus:border-primary outline-none w-full md:w-96 shadow-inner tracking-widest uppercase font-bold" />
                            <button onClick={handleOpenNewOs} className="bg-primary hover:bg-primary/80 text-black px-10 py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] shadow-2xl transition-all">ABRIR NOVA OS</button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {serviceOrders.filter(o => o.vehiclePlate.includes(searchTerm.toUpperCase())).map(os => {
                                const progress = (Object.values(os.steps).filter(s => (s as OsStep).status === 'completed').length / 10) * 100;
                                return (
                                    <div key={os.id} onClick={() => { setSelectedOsId(os.id); setView('os_detail'); }} className="bg-black/20 p-6 rounded-3xl border border-white/5 hover:border-primary/40 cursor-pointer group transition-all">
                                        <div className="flex justify-between items-start mb-4">
                                            <span className="text-[9px] font-black text-primary uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded">{os.id}</span>
                                            <i className="fas fa-chevron-right text-gray-700 group-hover:text-primary transition-all"></i>
                                        </div>
                                        <h4 className="text-3xl font-black text-white tracking-tighter uppercase mb-4">{os.vehiclePlate}</h4>
                                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mb-2">
                                            <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                                        </div>
                                        <div className="flex justify-between text-[9px] font-bold text-gray-500 uppercase">
                                            <span>{os.status}</span>
                                            <span className="text-primary">{Math.round(progress)}% PROGRESS</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default EcoMec;

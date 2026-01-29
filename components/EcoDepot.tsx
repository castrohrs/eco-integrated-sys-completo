
import React, { useState, useMemo, useEffect } from 'react';
import { useAppStore } from '../hooks/useAppStore';
import { useAuth } from '../hooks/useAuth';
import { Container, ContainerFsmState } from '../types';

// Componente de Badge de Status com Efeito Glow
const StatusBeacon: React.FC<{ state: ContainerFsmState }> = ({ state }) => {
    const config: Record<string, { color: string, label: string, pulse: boolean }> = {
        'CREATED': { color: 'bg-gray-500', label: 'PRE-AVISO', pulse: false },
        'GATE_IN': { color: 'bg-blue-500', label: 'ENTRADA', pulse: true },
        'INSPECTION': { color: 'bg-warning', label: 'VISTORIA', pulse: true },
        'READY': { color: 'bg-primary', label: 'PRONTO', pulse: false },
        'IN_YARD': { color: 'bg-success', label: 'NO PÁTIO', pulse: false },
        'EMPTY_ALERT': { color: 'bg-danger', label: 'VAZIO!', pulse: true },
        'FULL': { color: 'bg-secondary', label: 'CHEIO', pulse: false },
        'BILLED': { color: 'bg-purple-500', label: 'FATURADO', pulse: false },
        'CLOSED': { color: 'bg-gray-800', label: 'FINALIZADO', pulse: false },
    };

    const current = config[state] || config['CREATED'];

    return (
        <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${current.color} ${current.pulse ? 'animate-pulse shadow-[0_0_10px_rgba(var(--color-primary-val),0.8)]' : ''}`}></div>
            <span className={`text-[9px] font-black uppercase tracking-widest ${current.color.replace('bg-', 'text-')}`}>{current.label}</span>
        </div>
    );
};

const EcoDepot: React.FC = () => {
    const { logAction, containers, processContainerEvent } = useAppStore();
    const { currentUser } = useAuth();
    
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const [isEirModalOpen, setIsEirModalOpen] = useState(false);
    const [yardView, setYardView] = useState<'grid' | 'list'>('grid');

    const metrics = useMemo(() => {
        const occupied = containers.filter(c => c.id !== '');
        const occupancy = (occupied.length / containers.length) * 100;
        const critical = occupied.filter(c => !c.billed).length;
        return { occupancy: occupancy.toFixed(1), total: containers.length, occupied: occupied.length, critical };
    }, [containers]);

    const handleQuickAction = (id: string, event: string) => {
        processContainerEvent(id, event, currentUser?.name || 'Comandante');
        logAction(`DEPOT: Ação ${event} executada para unidade ${id}`);
    };

    // Componente de Slot do Mapa de Pátio
    // FIX: Explicitly type YardSlot as React.FC to ensure 'key' prop is recognized by TypeScript for this nested component
    const YardSlot: React.FC<{ container: Container }> = ({ container }) => {
        const isEmpty = !container.id;
        const isActive = selectedSlot === container.internalId;

        return (
            <div 
                onClick={() => setSelectedSlot(container.internalId)}
                className={`relative aspect-square rounded-xl border-2 transition-all cursor-pointer flex flex-col items-center justify-center group
                    ${isEmpty ? 'border-white/5 bg-black/20 hover:border-white/20' : 'bg-bg-card border-primary/20 hover:border-primary shadow-lg'}
                    ${isActive ? 'ring-2 ring-primary ring-offset-4 ring-offset-bg-main scale-105 z-10 border-primary' : ''}
                `}
            >
                <span className="absolute top-2 left-2 text-[8px] font-black text-gray-600 uppercase tracking-tighter">{container.internalId}</span>
                {!isEmpty ? (
                    <>
                        <div className="text-[10px] font-black text-primary mb-1">{container.id.slice(-4)}</div>
                        <div className={`w-1.5 h-1.5 rounded-full ${container.billed ? 'bg-success' : 'bg-warning animate-pulse'}`}></div>
                    </>
                ) : (
                    <i className="fas fa-plus text-[10px] text-gray-800 opacity-0 group-hover:opacity-100 transition-opacity"></i>
                )}
            </div>
        );
    };

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] gap-6 animate-fade-in">
            
            {/* TOP HUD: METRICS & CONTROLS */}
            <header className="grid grid-cols-1 lg:grid-cols-4 gap-6 shrink-0">
                <div className="lg:col-span-1 bg-bg-card p-6 rounded-[2rem] border border-white/5 shadow-2xl flex flex-col justify-center">
                    <h2 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">MATRIX.<span className="text-primary">YARD</span></h2>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse"></span>
                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-[0.4em]">Operations Core v5.2</span>
                    </div>
                </div>

                <div className="lg:col-span-3 bg-bg-card p-2 rounded-[2rem] border border-white/5 shadow-2xl flex items-center gap-6 pr-8">
                    <div className="flex-1 grid grid-cols-3 gap-2 px-4">
                        <div className="text-center border-r border-white/5">
                            <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">Ocupação</p>
                            <p className="text-2xl font-black text-white">{metrics.occupancy}%</p>
                        </div>
                        <div className="text-center border-r border-white/5">
                            <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">Slots Ativos</p>
                            <p className="text-2xl font-black text-primary">{metrics.occupied}/{metrics.total}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">Pendências</p>
                            <p className="text-2xl font-black text-danger">{metrics.critical}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setYardView('grid')} className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${yardView === 'grid' ? 'bg-primary text-black' : 'bg-bg-main text-gray-500'}`}><i className="fas fa-th-large"></i></button>
                        <button onClick={() => setYardView('list')} className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${yardView === 'list' ? 'bg-primary text-black' : 'bg-bg-main text-gray-500'}`}><i className="fas fa-list"></i></button>
                    </div>
                </div>
            </header>

            <div className="flex-1 flex gap-6 overflow-hidden">
                
                {/* LEFT: YARD VISUALIZATION */}
                <main className="flex-1 bg-black/40 rounded-[3rem] border border-white/5 p-8 overflow-y-auto custom-scrollbar shadow-inner">
                    {yardView === 'grid' ? (
                        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                            {containers.map(c => <YardSlot key={c.internalId} container={c} />)}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {containers.filter(c => c.id !== '').map(c => (
                                <div key={c.internalId} onClick={() => setSelectedSlot(c.internalId)} className={`p-5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${selectedSlot === c.internalId ? 'bg-primary/10 border-primary' : 'bg-bg-card border-white/5 hover:bg-white/5'}`}>
                                    <div className="flex items-center gap-6">
                                        <span className="text-xs font-black text-gray-500 font-mono w-8">{c.internalId}</span>
                                        <div>
                                            <p className="text-sm font-black text-white tracking-tighter">{c.id}</p>
                                            <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">{c.client} • {c.shippingLine}</p>
                                        </div>
                                    </div>
                                    <StatusBeacon state={c.fsmState} />
                                </div>
                            ))}
                        </div>
                    )}
                </main>

                {/* RIGHT: TACTICAL CONTROL PANEL */}
                <aside className="w-96 flex flex-col gap-6 shrink-0">
                    <div className="flex-1 bg-bg-card rounded-[3rem] border border-white/5 shadow-2xl p-8 flex flex-col relative overflow-hidden">
                        {selectedSlot ? (
                            <div className="animate-fade-in space-y-8">
                                <header className="pb-6 border-b border-white/5">
                                    <div className="flex justify-between items-start mb-4">
                                        <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-primary/30">Slot {selectedSlot}</span>
                                        <button onClick={() => setSelectedSlot(null)} className="text-gray-600 hover:text-white"><i className="fas fa-times"></i></button>
                                    </div>
                                    <h3 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">
                                        {containers.find(c => c.internalId === selectedSlot)?.id || 'VAZIO'}
                                    </h3>
                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-2">
                                        {containers.find(c => c.internalId === selectedSlot)?.client || 'SLOT DISPONÍVEL'}
                                    </p>
                                </header>

                                {containers.find(c => c.internalId === selectedSlot)?.id ? (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-bg-main p-4 rounded-2xl border border-white/5">
                                                <p className="text-[8px] font-black text-gray-600 uppercase mb-1">Status FSM</p>
                                                <StatusBeacon state={containers.find(c => c.internalId === selectedSlot)!.fsmState} />
                                            </div>
                                            <div className="bg-bg-main p-4 rounded-2xl border border-white/5">
                                                <p className="text-[8px] font-black text-gray-600 uppercase mb-1">Faturamento</p>
                                                <span className={`text-[10px] font-black uppercase ${containers.find(c => c.internalId === selectedSlot)?.billed ? 'text-success' : 'text-warning'}`}>
                                                    {containers.find(c => c.internalId === selectedSlot)?.billed ? 'Processado' : 'Pendente'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Comandos de Campo</p>
                                            <button 
                                                onClick={() => setIsEirModalOpen(true)}
                                                className="w-full py-4 bg-secondary text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-secondary/20 hover:scale-105 transition-all flex items-center justify-center gap-3"
                                            >
                                                <i className="fas fa-file-signature"></i> Gerar EIR Digital
                                            </button>
                                            <button 
                                                onClick={() => handleQuickAction(selectedSlot, 'CHECKLIST_COMPLETED')}
                                                className="w-full py-4 bg-bg-main border border-white/10 text-gray-400 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:text-white hover:border-primary transition-all flex items-center justify-center gap-3"
                                            >
                                                <i className="fas fa-clipboard-check"></i> Validar Inspeção
                                            </button>
                                            <button 
                                                onClick={() => handleQuickAction(selectedSlot, 'CONTAINER_BILLED')}
                                                className="w-full py-4 bg-primary/10 text-primary border border-primary/20 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-primary hover:text-black transition-all flex items-center justify-center gap-3"
                                            >
                                                <i className="fas fa-dollar-sign"></i> Registrar Faturamento
                                            </button>
                                        </div>

                                        <div className="pt-6 border-t border-white/5">
                                            <p className="text-[9px] font-black text-gray-600 uppercase mb-3">Linha do Tempo (Logs)</p>
                                            <div className="space-y-3 max-h-40 overflow-y-auto custom-scrollbar pr-2">
                                                {containers.find(c => c.internalId === selectedSlot)?.history.map((log, i) => (
                                                    <div key={i} className="flex gap-3 text-[9px]">
                                                        <span className="text-primary font-mono">{new Date(log.timestamp).toLocaleTimeString()}</span>
                                                        <span className="text-gray-400 font-bold uppercase">{log.event}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex-1 flex flex-col items-center justify-center text-center py-20 opacity-30">
                                        <i className="fas fa-box-open text-6xl mb-6"></i>
                                        <h4 className="text-xs font-black uppercase tracking-widest">Nenhuma Unidade Atribuída</h4>
                                        <p className="text-[10px] mt-2 max-w-[200px]">Aguardando Gate-In ou pré-aviso de chegada para este slot.</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center py-20 animate-pulse">
                                <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-700 mb-6 text-2xl">
                                    <i className="fas fa-mouse-pointer"></i>
                                </div>
                                <h4 className="text-xs font-black uppercase tracking-[0.3em] text-gray-600 leading-relaxed">
                                    SELECIONE UM SLOT NO MAPA <br/> PARA GERENCIAMENTO TÁTICO
                                </h4>
                            </div>
                        )}
                    </div>
                </aside>
            </div>

            {/* MODAL EIR INTEGRADO (GHOST INTERFACE) */}
            {isEirModalOpen && (
                <div className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-[5000] flex items-center justify-center p-6" onClick={() => setIsEirModalOpen(false)}>
                    <div className="bg-[#050505] border border-primary/20 p-12 rounded-[4rem] max-w-2xl w-full shadow-[0_0_100px_rgba(var(--color-primary-val),0.15)] animate-slide-up" onClick={e => e.stopPropagation()}>
                        <header className="mb-10 text-center">
                            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto mb-6 text-2xl">
                                <i className="fas fa-file-contract"></i>
                            </div>
                            <h3 className="text-3xl font-black text-white uppercase tracking-tighter">EIR Digital Protocol</h3>
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-2">Unidade: {containers.find(c => c.internalId === selectedSlot)?.id}</p>
                        </header>
                        
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-600 uppercase ml-2">Condição Externa</label>
                                    <select className="w-full bg-bg-main border border-white/10 rounded-2xl p-4 text-xs text-light outline-none focus:border-primary transition-all">
                                        <option>INTACTO / SEM AVARIAS</option>
                                        <option>AVARIADO - VER OBS</option>
                                        <option>REPARO NECESSÁRIO</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-600 uppercase ml-2">Lacre (Bolt Seal)</label>
                                    <input className="w-full bg-bg-main border border-white/10 rounded-2xl p-4 text-xs text-light outline-none focus:border-primary transition-all" placeholder="NUMERAÇÃO..." />
                                </div>
                            </div>
                            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 text-center">
                                <p className="text-[10px] font-black text-gray-500 uppercase mb-4">Assinatura Digital de Campo</p>
                                <div className="h-32 bg-white rounded-2xl mb-4"></div>
                                <p className="text-[9px] text-gray-600 font-bold">Ao clicar em confirmar, você valida a integridade do equipamento conforme normas ISO.</p>
                            </div>
                        </div>

                        <div className="mt-12 flex gap-4">
                            <button onClick={() => setIsEirModalOpen(false)} className="flex-1 py-5 bg-bg-main border border-white/5 text-gray-500 font-black uppercase rounded-2xl hover:text-white transition-all">Abortar</button>
                            <button 
                                onClick={() => { 
                                    handleQuickAction(selectedSlot!, 'EIR_COMPLETED');
                                    setIsEirModalOpen(false);
                                }} 
                                className="flex-[2] py-5 bg-primary text-black font-black uppercase rounded-2xl shadow-xl shadow-primary/20 transform active:scale-95 transition-all"
                            >
                                Validar Protocolo
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EcoDepot;

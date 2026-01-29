
import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../hooks/useAppStore';
import { useAuth } from '../hooks/useAuth';
import { PORTS_DATABASE } from '../services/logisticsData';

const EirDigital: React.FC = () => {
    const { logAction, containers, processContainerEvent } = useAppStore();
    const { currentUser } = useAuth();
    const [step, setStep] = useState(1);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [selectedContainerId, setSelectedContainerId] = useState('');
    const [formData, setFormData] = useState({
        container: '',
        type: "40' HC",
        condition: 'Intacto',
        driver: '',
        plate: ''
    });

    const [schedulingUrl, setSchedulingUrl] = useState<string | null>(null);

    useEffect(() => {
        if (selectedContainerId) {
            const c = containers.find(item => item.internalId === selectedContainerId);
            if (c) {
                setFormData(prev => ({ ...prev, container: c.id, type: "40' HC" }));
                
                // Busca automática de URL de agendamento baseada no shippingLine ou porto (Mock logic)
                const port = PORTS_DATABASE.find(p => p.city.toUpperCase() === c.destination.toUpperCase());
                if (port && port.terminals && port.terminals.length > 0) {
                    setSchedulingUrl(port.terminals[0].url);
                } else {
                    // Fallback para MultiRio se estiver no Rio
                    setSchedulingUrl(c.destination.includes('RIO') ? 'https://www.multirio.com.br' : null);
                }
            }
        } else {
            setSchedulingUrl(null);
        }
    }, [selectedContainerId, containers]);

    const handleSaveEir = () => {
        if (!selectedContainerId) {
            alert("Vínculo Obrigatório: Selecione um container.");
            return;
        }
        processContainerEvent(selectedContainerId, 'EIR_COMPLETED', currentUser?.name || 'Sistema');
        logAction(`EIR: Registro finalizado para ${formData.container}`);
        alert("EIR Digital gerado com sucesso. Protocolo arquivado em nuvem.");
        setStep(1);
        setFormData({ container: '', type: "40' HC", condition: 'Intacto', driver: '', plate: '' });
        setSelectedContainerId('');
    };

    const clearSignature = () => {
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx && canvasRef.current) {
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
    };

    const steps = [
        { id: 1, label: 'Atribuição', icon: 'fa-box' },
        { id: 2, label: 'Checklist', icon: 'fa-clipboard-check' },
        { id: 3, label: 'Validação', icon: 'fa-file-signature' }
    ];

    return (
        <div className="max-w-4xl mx-auto space-y-4 animate-fade-in pb-12">
            <header className="bg-bg-card/80 backdrop-blur-xl p-5 rounded-3xl border border-white/10 shadow-2xl flex justify-between items-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-primary"></div>
                <div className="flex items-center gap-5 pl-2">
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-inner">
                        <i className="fas fa-file-contract text-2xl"></i>
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-white tracking-tighter uppercase leading-none">EIR.<span className="text-primary">DIGITAL</span></h2>
                        <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.3em] mt-1.5">Interchange Receipt Protocol</p>
                    </div>
                </div>
                <div className="hidden md:flex items-center gap-10 pr-4">
                    {steps.map((s, idx) => (
                        <div key={s.id} className="flex items-center gap-4">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black transition-all border ${step === s.id ? 'bg-primary text-black border-primary shadow-lg shadow-primary/20 scale-110' : step > s.id ? 'bg-success/20 text-success border-success/30' : 'bg-bg-main text-gray-600 border-white/5'}`}>
                                {step > s.id ? <i className="fas fa-check"></i> : s.id}
                            </div>
                            <span className={`text-[10px] font-black uppercase tracking-widest ${step === s.id ? 'text-primary' : 'text-gray-600'}`}>{s.label}</span>
                        </div>
                    ))}
                </div>
            </header>

            <div className="bg-bg-card rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden min-h-[460px] flex flex-col">
                <div className="flex-1 p-10">
                    {step === 1 && (
                        <div className="max-w-xl mx-auto space-y-10 py-4 animate-fade-in">
                            <div className="text-center">
                                <h3 className="text-lg font-black text-white uppercase tracking-[0.2em] mb-3">Vinculação de Unidade</h3>
                                <p className="text-[11px] text-gray-500 font-medium">Selecione um slot ativo para iniciar o intercâmbio.</p>
                            </div>
                            <div className="space-y-6">
                                <div className="space-y-2.5">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Slot Disponível</label>
                                    <select 
                                        className="w-full bg-bg-main border border-white/10 rounded-2xl p-5 text-sm text-light focus:border-primary outline-none transition-all shadow-inner font-bold appearance-none cursor-pointer"
                                        value={selectedContainerId}
                                        onChange={e => setSelectedContainerId(e.target.value)}
                                    >
                                        <option value="">AGUARDANDO SELEÇÃO...</option>
                                        {containers.filter(c => c.id !== '').map(c => (
                                            <option key={c.internalId} value={c.internalId}>{c.internalId} — IDENT: {c.id}</option>
                                        ))}
                                    </select>
                                </div>
                                {schedulingUrl && (
                                    <div className="bg-secondary/10 border border-secondary/30 rounded-2xl p-6 flex items-center justify-between animate-fade-in">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center text-secondary"><i className="fas fa-calendar-alt"></i></div>
                                            <div>
                                                <p className="text-[10px] font-black text-secondary uppercase tracking-widest">Portal Oficial de Janelas</p>
                                                <p className="text-[11px] text-gray-400 font-bold uppercase mt-1">Terminal Vinculado Detectado</p>
                                            </div>
                                        </div>
                                        <a href={schedulingUrl} target="_blank" className="bg-secondary text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all no-underline shadow-lg">Abrir Agendamento</a>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="max-w-3xl mx-auto space-y-10 animate-fade-in">
                            <div className="text-center"><h3 className="text-lg font-black text-white uppercase tracking-[0.2em] mb-2">Checklist Operacional</h3></div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {['ESTRUTURA_PISO', 'ESTANQUEIDADE', 'LACRES_INTACTOS', 'LIMPEZA_INTERNA', 'SEM_ODORES', 'TRAVAS_SEGURANÇA'].map(item => (
                                    <label key={item} className="relative flex flex-col items-center justify-center p-6 bg-bg-main/40 border border-white/5 rounded-3xl cursor-pointer hover:border-primary/40 transition-all group">
                                        <input type="checkbox" className="peer hidden" defaultChecked />
                                        <div className="absolute top-4 right-4 w-5 h-5 rounded-lg border border-white/10 peer-checked:bg-primary flex items-center justify-center transition-all"><i className="fas fa-check text-[10px] text-black opacity-0 peer-checked:opacity-100"></i></div>
                                        <i className="fas fa-clipboard-check text-2xl mb-3 text-gray-600 group-hover:text-primary transition-colors"></i>
                                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{item}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="max-w-xl mx-auto space-y-10 animate-fade-in">
                            <div className="text-center"><h3 className="text-lg font-black text-white uppercase tracking-[0.2em] mb-2">Validação Final</h3></div>
                            <div className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-secondary/30 rounded-[2.5rem] blur opacity-30 group-hover:opacity-100 transition duration-1000"></div>
                                <div className="relative bg-white rounded-[2rem] overflow-hidden shadow-2xl border-2 border-primary/10">
                                    <canvas ref={canvasRef} className="w-full h-40 cursor-crosshair" width={800} height={200}></canvas>
                                    <button onClick={clearSignature} className="absolute bottom-4 right-4 text-[9px] font-black text-gray-400 hover:text-danger uppercase tracking-widest bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl">Limpar</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <footer className="bg-black/30 p-8 border-t border-white/5 flex gap-6 backdrop-blur-md">
                    {step > 1 && <button onClick={() => setStep(step - 1)} className="px-10 py-5 bg-bg-main border border-white/10 text-gray-500 font-black uppercase tracking-[0.2em] rounded-2xl hover:text-white transition-all text-[11px]"><i className="fas fa-arrow-left mr-3"></i> Recuar</button>}
                    <button onClick={() => { if (step === 1 && !selectedContainerId) { alert("Selecione uma unidade."); return; } if (step < 3) setStep(step + 1); else handleSaveEir(); }} className={`flex-1 py-5 font-black uppercase tracking-[0.3em] rounded-2xl shadow-2xl transition-all transform active:scale-95 text-[11px] flex items-center justify-center gap-4 ${step === 3 ? 'bg-success text-white shadow-success/20' : 'bg-primary text-black shadow-primary/20'}`}>
                        {step === 3 ? <><i className="fas fa-shield-check"></i> AUTORIZAR E FINALIZAR</> : <>Próxima Etapa <i className="fas fa-arrow-right"></i></>}
                    </button>
                </footer>
            </div>
            <div className="flex justify-between items-center px-6 py-4 opacity-40">
                <div className="flex items-center gap-5 text-[10px] font-black text-gray-500 uppercase tracking-widest"><span><i className="fas fa-terminal"></i> CORE_V5</span><span className="w-1.5 h-1.5 rounded-full bg-gray-700"></span><span>OP: {currentUser?.name}</span></div>
                <div className="text-[10px] font-black text-primary uppercase tracking-widest font-mono">SECURE_LINK_ACTIVE: 100%</div>
            </div>
        </div>
    );
};

export default EirDigital;


import React, { useState, useMemo } from 'react';
import { useAppStore } from '../hooks/useAppStore';

interface EscortMission {
    id: string;
    client: string;
    description: string;
    start: string;
    end: string;
    origin: string;
    destination: string;
    risk: 'Baixo' | 'Médio' | 'Alto';
    level: '1' | '2' | '3' | '4';
    status: 'Solicitação' | 'Em Execução' | 'Finalizado' | 'Cancelado';
    total: number;
}

const EcoBolt: React.FC = () => {
    const { logAction } = useAppStore();
    const [missions, setMissions] = useState<EscortMission[]>([
        { 
            id: 'ESC-2025-001', client: 'Oceanic Logística', description: 'Escolta Blindada - Carga de Eletroeletrônicos',
            start: '2025-05-10T08:00', end: '2025-05-10T18:00', origin: 'Porto de Santos', destination: 'CD Capital/SP',
            risk: 'Alto', level: '4', status: 'Em Execução', total: 4500.00
        }
    ]);

    const stats = useMemo(() => ({
        active: missions.filter(m => m.status === 'Em Execução').length,
        pending: missions.filter(m => m.status === 'Solicitação').length,
        riskHigh: missions.filter(m => m.risk === 'Alto').length
    }), [missions]);

    const handlePrintOS = (mission: EscortMission) => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;
        printWindow.document.write(`
            <html><head><title>OS Escolta ${mission.id}</title><style>
                body { font-family: sans-serif; padding: 40px; color: #000; }
                .header { border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; text-align: center; }
                .box { border: 1px solid #333; padding: 15px; margin-bottom: 15px; }
                .label { font-size: 10px; font-weight: bold; text-transform: uppercase; color: #666; }
                .val { font-size: 16px; font-weight: bold; margin-top: 2px; }
                .sig { margin-top: 60px; display: flex; justify-content: space-around; }
                .line { border-top: 1px solid #000; width: 200px; text-align: center; padding-top: 5px; font-size: 10px; }
            </style></head><body>
                <div class="header"><h1>AUTORIZAÇÃO DE ESCOLTA ARMADA</h1><p># ${mission.id} | Protocolo de Segurança</p></div>
                <div class="box">
                    <div class="label">Cliente Contratante</div><div class="val">${mission.client}</div>
                    <div class="label" style="margin-top:10px">Serviço</div><div class="val">${mission.description}</div>
                </div>
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <div class="box"><div class="label">Origem</div><div class="val">${mission.origin}</div></div>
                    <div class="box"><div class="label">Destino</div><div class="val">${mission.destination}</div></div>
                </div>
                <div class="box">
                    <div class="label">Classificação de Risco</div><div class="val">${mission.risk} - Nível ${mission.level}</div>
                </div>
                <div class="sig"><div class="line">Responsável Operacional</div><div class="line">Visto Cliente</div></div>
                <script>window.print();</script>
            </body></html>
        `);
        printWindow.document.close();
        logAction(`ECO.BOLT: OS gerada para missão ${mission.id}`);
    };

    return (
        <div className="space-y-6 animate-fade-in pb-20">
            <header className="bg-bg-card p-8 rounded-[3rem] border border-white/10 shadow-2xl flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-primary to-red-600"></div>
                <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-3xl bg-red-600/10 border border-red-600/30 flex items-center justify-center text-red-500 shadow-[0_0_40px_rgba(220,38,38,0.2)]">
                        <i className="fas fa-shield-halved text-4xl"></i>
                    </div>
                    <div>
                        <h2 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">ECO.<span className="text-red-600">BOLT</span></h2>
                        <div className="flex items-center gap-3 mt-3">
                            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">Elite Security Protocol v7.0</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-8 px-10 border-x border-white/5">
                    <div className="text-center"><p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">Missões Ativas</p><p className="text-2xl font-black text-white">{stats.active}</p></div>
                    <div className="text-center"><p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">Solicitações</p><p className="text-2xl font-black text-primary">{stats.pending}</p></div>
                    <div className="text-center"><p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">Alto Risco</p><p className="text-2xl font-black text-red-600">{stats.riskHigh}</p></div>
                </div>

                <button className="bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest px-8 py-4 rounded-2xl shadow-xl shadow-red-900/20 transition-all transform active:scale-95">
                    NOVA MISSÃO
                </button>
            </header>

            <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Tactical Board */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-bg-card border border-white/5 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                                <i className="fas fa-satellite text-primary"></i> Monitoramento em Campo
                            </h3>
                        </div>

                        <div className="space-y-4">
                            {missions.map(m => (
                                <div key={m.id} className="bg-black/40 border border-white/5 p-6 rounded-[2rem] hover:border-red-600/40 transition-all group">
                                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                                        <div className="flex items-center gap-6">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-lg ${m.risk === 'Alto' ? 'bg-red-600 text-white' : 'bg-primary text-black'}`}>
                                                <i className={`fas ${m.risk === 'Alto' ? 'fa-triangle-exclamation' : 'fa-check-shield'}`}></i>
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-black text-white tracking-tight">{m.client}</h4>
                                                <div className="flex items-center gap-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                                                    <span className="text-red-600">{m.id}</span>
                                                    <span>•</span>
                                                    <span>Nível {m.level}</span>
                                                    <span>•</span>
                                                    <span>{m.origin} → {m.destination}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-3">
                                            <button onClick={() => handlePrintOS(m)} className="px-5 py-2 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-gray-400 hover:text-white transition-all">GERAR OS</button>
                                            <button className="px-5 py-2 bg-red-600/10 border border-red-600/30 rounded-xl text-[9px] font-black uppercase tracking-widest text-red-500 hover:bg-red-600 hover:text-white transition-all">PANIC LOG</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Intelligence Side */}
                <div className="space-y-6">
                    <div className="bg-bg-card border border-white/5 rounded-[2.5rem] p-8 shadow-2xl">
                        <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-6">Controle de Escoltantes</h3>
                        <div className="space-y-3">
                            {['VTR-ALPHA (Nasser)', 'VTR-BRAVO (Silva)', 'VTR-CHARLIE (Ruan)'].map(vtr => (
                                <div key={vtr} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
                                        <span className="text-[10px] font-bold text-gray-300">{vtr}</span>
                                    </div>
                                    <span className="text-[9px] font-black text-gray-600">ONLINE</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-red-900/10 border border-red-900/30 rounded-[2.5rem] p-8 shadow-2xl">
                        <h3 className="text-xs font-black text-red-500 uppercase tracking-widest mb-4">Avisos de Risco</h3>
                        <p className="text-[10px] text-gray-400 leading-relaxed font-bold italic">
                            "Protocolo de escolta nível 4 exige monitoramento visual ativo 24/7 via telemetria embarcada."
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default EcoBolt;

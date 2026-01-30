
import React, { useState } from 'react';
import { useAppStore } from '../hooks/useAppStore';

type ShipmentStatus = 'waiting' | 'transit' | 'arrived' | 'returned';

interface Shipment {
    id: string;
    client: string;
    container: string;
    status: ShipmentStatus;
    updatedAt: string;
}

const TrackingScheduling: React.FC = () => {
    const { logAction } = useAppStore();
    const [shipments, setShipments] = useState<Shipment[]>([
        { id: 'S-1002', client: 'Oceanic Corp', container: 'MSCU123456', status: 'transit', updatedAt: '14:30' },
        { id: 'S-1003', client: 'Brasil Log', container: 'MAER884211', status: 'arrived', updatedAt: '10:15' },
    ]);

    const getStatusInfo = (status: ShipmentStatus) => {
        switch(status) {
            case 'waiting': return { label: 'Aguardando', color: 'bg-gray-600', icon: 'fa-clock' };
            case 'transit': return { label: 'Em Trânsito', color: 'bg-secondary', icon: 'fa-truck-moving' };
            case 'arrived': return { label: 'Chegou', color: 'bg-primary', icon: 'fa-check-circle' };
            case 'returned': return { label: 'Devolvido', color: 'bg-success', icon: 'fa-undo' };
        }
    };

    const updateStatus = (id: string, next: ShipmentStatus) => {
        setShipments(prev => prev.map(s => s.id === id ? { ...s, status: next, updatedAt: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) } : s));
        logAction(`TRACKING: Remessa ${id} atualizada para ${next.toUpperCase()}`);
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <header className="bg-bg-card p-6 rounded-3xl border border-border-color/50 shadow-xl flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-black text-light tracking-tighter uppercase">RADAR.<span className="text-secondary">TRACKING</span></h2>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] mt-1">Live Shipment Intelligence Hub</p>
                </div>
                <button className="px-6 py-2.5 bg-secondary text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-secondary/20">+ Agendar Carga</button>
            </header>

            <div className="grid grid-cols-1 gap-6">
                {shipments.map(s => {
                    const info = getStatusInfo(s.status);
                    return (
                        <div key={s.id} className="bg-bg-card border border-white/5 p-8 rounded-[2.5rem] shadow-xl hover:border-secondary/30 transition-all group">
                            <div className="flex flex-col lg:flex-row justify-between items-center gap-8">
                                <div className="flex items-center gap-6">
                                    <div className={`w-16 h-16 rounded-2xl ${info.color} flex items-center justify-center text-black text-2xl shadow-xl`}>
                                        <i className={`fas ${info.icon}`}></i>
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-light tracking-tight">{s.client}</h3>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-[10px] font-black text-secondary uppercase tracking-widest">{s.id}</span>
                                            <span className="w-1 h-1 rounded-full bg-gray-700"></span>
                                            <span className="text-[10px] font-bold text-gray-500 uppercase font-mono">{s.container}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-1 w-full max-w-2xl px-10 relative">
                                    {/* Timeline Line */}
                                    <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-800 -translate-y-1/2"></div>
                                    <div className="flex justify-between relative z-10">
                                        {['waiting', 'transit', 'arrived', 'returned'].map((st, i) => {
                                            const isActive = s.status === st;
                                            const isPast = ['waiting', 'transit', 'arrived', 'returned'].indexOf(s.status) >= i;
                                            return (
                                                <button 
                                                    key={st}
                                                    onClick={() => updateStatus(s.id, st as ShipmentStatus)}
                                                    className={`w-6 h-6 rounded-full border-4 border-bg-card transition-all ${isPast ? 'bg-secondary' : 'bg-gray-800'} ${isActive ? 'scale-150 shadow-lg shadow-secondary/40' : 'hover:scale-125'}`}
                                                ></button>
                                            );
                                        })}
                                    </div>
                                    <div className="flex justify-between mt-4">
                                        {['Agendado', 'Em Rota', 'No Porto', 'Finalizado'].map(label => (
                                            <span key={label} className="text-[8px] font-black text-gray-600 uppercase tracking-widest">{label}</span>
                                        ))}
                                    </div>
                                </div>

                                <div className="text-right shrink-0">
                                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Último Evento</p>
                                    <p className="text-xl font-black text-light uppercase">{info.label}</p>
                                    <p className="text-[10px] font-bold text-secondary mt-1">{s.updatedAt}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default TrackingScheduling;

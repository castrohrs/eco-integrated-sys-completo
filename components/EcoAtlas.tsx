
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useAppStore } from '../hooks/useAppStore';
import { Port, LogisticsCarrier } from '../types';
import { PORTS_DATABASE, RJ_COORDS } from '../services/logisticsData';

// Tipagem para o Leaflet global injetado no index.html
declare const L: any;

const EcoAtlas: React.FC = () => {
    const { logAction } = useAppStore();
    const [selectedPortId, setSelectedPortId] = useState<string>('BRRIO'); // Default: Rio
    const [filterOperation, setFilterOperation] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');
    
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<any>(null);
    const markersRef = useRef<any[]>([]);
    const radiusRef = useRef<any>(null);

    const selectedPort = useMemo(() => 
        PORTS_DATABASE.find(p => p.id === selectedPortId) || PORTS_DATABASE[0], 
    [selectedPortId]);

    const filteredCarriers = useMemo(() => {
        let list = selectedPort.carriers || [];
        if (filterOperation !== 'all') {
            list = list.filter(c => c.operationType === filterOperation);
        }
        if (searchTerm) {
            list = list.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));
        }
        return list;
    }, [selectedPort, filterOperation, searchTerm]);

    // Inicialização Única do Mapa
    useEffect(() => {
        if (typeof L === 'undefined' || !mapRef.current) return;

        if (!mapInstance.current) {
            mapInstance.current = L.map(mapRef.current, {
                zoomControl: false,
                attributionControl: false
            }).setView([RJ_COORDS.lat, RJ_COORDS.lng], 13);

            // Layer Dark Premium da CartoDB
            L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                maxZoom: 19
            }).addTo(mapInstance.current);
            
            logAction("ECO.ATLAS: Módulo de Geointeligência Inicializado.");
        }
    }, []);

    // Atualizar Marcadores e Visão quando o porto ou filtros mudam
    useEffect(() => {
        const map = mapInstance.current;
        if (!map || typeof L === 'undefined') return;

        // Limpeza de camadas anteriores
        markersRef.current.forEach(m => map.removeLayer(m));
        markersRef.current = [];
        if (radiusRef.current) map.removeLayer(radiusRef.current);

        // Suave transição para o ponto focal
        map.flyTo([selectedPort.lat, selectedPort.lng], 13, { duration: 2 });

        // Marcador do Porto com Pulsação
        const portIcon = L.divIcon({
            html: `<div class="port-pulse-main"><i class="fas fa-anchor"></i></div>`,
            className: '', 
            iconSize: [46, 46]
        });
        const portMarker = L.marker([selectedPort.lat, selectedPort.lng], { icon: portIcon })
            .addTo(map)
            .bindPopup(`
                <div class="p-2 text-black font-sans">
                    <h4 class="font-black text-xs uppercase text-primary tracking-widest">${selectedPort.id}</h4>
                    <p class="font-bold text-sm">${selectedPort.name}</p>
                    <p class="text-[10px] text-gray-500">${selectedPort.city}, ${selectedPort.state}</p>
                </div>
            `);
        markersRef.current.push(portMarker);

        // Raio Tático de Influência (10km)
        radiusRef.current = L.circle([selectedPort.lat, selectedPort.lng], {
            color: '#14b8a6',
            fillColor: '#14b8a6',
            fillOpacity: 0.08,
            radius: 10000,
            dashArray: '10, 10',
            weight: 1
        }).addTo(map);

        // Inserir Transportadoras parceiras
        filteredCarriers.forEach(c => {
            const carrierIcon = L.divIcon({
                html: `<div class="carrier-pin-tactical"><i class="fas fa-truck-moving"></i></div>`,
                className: '', 
                iconSize: [24, 24]
            });
            const marker = L.marker([c.lat, c.lng], { icon: carrierIcon })
                .addTo(map)
                .bindPopup(`
                    <div class="p-2 text-black font-sans" style="min-width: 180px;">
                        <div class="flex justify-between items-center mb-1">
                            <span class="text-[9px] font-black text-secondary uppercase">${c.operationType}</span>
                            <span class="text-[9px] font-bold text-gray-400">${c.distanceToPortKm} KM</span>
                        </div>
                        <h4 class="font-black text-sm uppercase">${c.name}</h4>
                        <p class="text-[10px] text-gray-600 mt-1"><i class="fas fa-map-marker-alt"></i> ${c.city}</p>
                    </div>
                `);
            markersRef.current.push(marker);
        });

    }, [selectedPort, filteredCarriers]);

    const operationTypes = ['all', 'Container', 'Granel', 'Rodoviário', 'Multimodal'];

    return (
        <div className="flex h-[calc(100vh-140px)] bg-[#05070a] rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden animate-fade-in relative">
            
            {/* HUD LATERAL: SELETOR DE COMPLEXO PORTUÁRIO */}
            <aside className="w-80 bg-black/80 backdrop-blur-3xl border-r border-white/5 flex flex-col shrink-0 z-[1001]">
                <div className="p-8 border-b border-white/5">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary shadow-inner border border-primary/30">
                            <i className="fas fa-satellite animate-pulse"></i>
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-white tracking-tighter uppercase leading-none">
                                ATLAS.<span className="text-primary">CORE</span>
                            </h2>
                            <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mt-1">Geo-Intelligence v5.2</p>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
                    {PORTS_DATABASE.map(port => (
                        <button
                            key={port.id}
                            onClick={() => {
                                setSelectedPortId(port.id);
                                logAction(`ATLAS: Foco alterado para ${port.name}`);
                            }}
                            className={`w-full text-left p-4 rounded-2xl transition-all border flex items-center justify-between group ${selectedPortId === port.id ? 'bg-primary border-primary shadow-xl shadow-primary/20' : 'bg-white/5 border-white/5 hover:border-primary/40 hover:bg-white/10'}`}
                        >
                            <div className="overflow-hidden">
                                <h4 className={`font-black text-xs uppercase tracking-tight truncate ${selectedPortId === port.id ? 'text-black' : 'text-light group-hover:text-primary'}`}>{port.name}</h4>
                                <p className={`text-[10px] font-bold ${selectedPortId === port.id ? 'text-black/60' : 'text-gray-500'}`}>{port.city}, {port.state}</p>
                            </div>
                            <i className={`fas fa-chevron-right text-[10px] ${selectedPortId === port.id ? 'text-black' : 'text-gray-700'}`}></i>
                        </button>
                    ))}
                </div>

                <div className="p-6 bg-black/40 border-t border-white/5">
                    <div className="bg-bg-main/50 p-4 rounded-2xl border border-white/5 flex items-center gap-4">
                        <div className="w-8 h-8 rounded-lg bg-success/20 flex items-center justify-center text-success text-xs shadow-inner">
                            <i className="fas fa-check-shield"></i>
                        </div>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Malha Ativa e Sincronizada</p>
                    </div>
                </div>
            </aside>

            {/* ÁREA CENTRAL: MAPA TÁTICO E HUD DE FILTROS */}
            <main className="flex-1 flex flex-col min-w-0 relative">
                
                {/* HUD SUPERIOR: BUSCA E FILTROS FLUTUANTES */}
                <div className="absolute top-8 left-8 right-8 z-[1000] flex flex-col md:flex-row gap-4 pointer-events-none">
                    <div className="bg-bg-card/90 backdrop-blur-2xl p-2 rounded-2xl border border-white/10 shadow-2xl flex items-center gap-3 pointer-events-auto flex-1 max-w-lg">
                        <i className="fas fa-search text-primary ml-3"></i>
                        <input 
                            type="text" 
                            placeholder="PESQUISAR PARCEIRO LOGÍSTICO..." 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="bg-transparent border-none outline-none text-[11px] text-light font-black uppercase tracking-widest w-full placeholder-gray-700"
                        />
                    </div>
                    <div className="bg-bg-card/90 backdrop-blur-2xl p-2 rounded-2xl border border-white/10 shadow-2xl flex items-center gap-2 pointer-events-auto overflow-x-auto no-scrollbar scroll-smooth">
                        {operationTypes.map(op => (
                            <button
                                key={op}
                                onClick={() => setFilterOperation(op)}
                                className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${filterOperation === op ? 'bg-secondary text-white shadow-lg shadow-secondary/30 scale-105' : 'bg-white/5 text-gray-500 hover:text-light'}`}
                            >
                                {op === 'all' ? 'Ver Todos' : op}
                            </button>
                        ))}
                    </div>
                </div>

                {/* VIEWPORT DO MAPA (LEAFLET) */}
                <div className="flex-grow relative z-0">
                    <div ref={mapRef} className="w-full h-full bg-gray-900"></div>
                    {/* Dark Vignette Overlay */}
                    <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_150px_rgba(0,0,0,0.8)]"></div>
                </div>

                {/* PAINEL INFERIOR: CARTÕES DE TRANSPORTADORES */}
                <div className="h-72 bg-[#080808]/90 backdrop-blur-2xl border-t border-white/10 p-8 flex flex-col shrink-0 z-[1001]">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-5">
                            <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary border border-secondary/20 shadow-inner">
                                <i className="fas fa-truck-loading text-xl"></i>
                            </div>
                            <div>
                                <h3 className="text-base font-black text-white uppercase tracking-[0.2em]">Network Logística Ativa</h3>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Status: Conexão Estável em 33.04557</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                             <div className="h-8 w-px bg-white/5"></div>
                             <span className="text-[11px] font-black text-primary bg-primary/10 px-4 py-1.5 rounded-full border border-primary/30 shadow-lg">
                                {filteredCarriers.length} TERMINAIS MAPEADOS
                            </span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-x-auto flex gap-6 pb-2 custom-scrollbar">
                        {filteredCarriers.map(carrier => (
                            <div 
                                key={carrier.id}
                                className="min-w-[340px] bg-bg-card border border-white/5 rounded-[2.5rem] p-6 flex flex-col justify-between hover:border-primary/50 hover:bg-bg-card/80 transition-all shadow-2xl relative overflow-hidden group"
                            >
                                {/* Background Accent Icon */}
                                <i className="fas fa-route absolute -bottom-4 -right-4 text-white/5 text-7xl group-hover:text-primary/5 transition-colors"></i>
                                
                                <div className="flex justify-between items-start relative z-10">
                                    <div>
                                        <h4 className="font-black text-light text-sm uppercase group-hover:text-primary transition-colors tracking-tight truncate max-w-[200px]">{carrier.name}</h4>
                                        <p className="text-[9px] font-mono text-gray-600 mt-1 uppercase tracking-tighter">PROTOCOLO: {carrier.cnpj?.slice(0,10) || 'ECOLOG_HUB'}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black text-white">{carrier.distanceToPortKm} KM</p>
                                        <p className="text-[8px] text-gray-600 font-black uppercase tracking-widest">RAIO DO PORTO</p>
                                    </div>
                                </div>

                                <div className="mt-6 flex gap-3 relative z-10">
                                    <span className="bg-white/5 border border-white/10 text-[9px] font-black text-gray-400 px-4 py-1.5 rounded-xl uppercase tracking-[0.1em]">
                                        {carrier.operationType}
                                    </span>
                                    <span className="bg-secondary/10 border border-secondary/20 text-[9px] font-black text-secondary px-4 py-1.5 rounded-xl uppercase tracking-[0.1em]">
                                        {carrier.city}
                                    </span>
                                </div>

                                <div className="mt-6 pt-5 border-t border-white/5 flex justify-between items-center relative z-10">
                                    <div className="flex items-center gap-2">
                                        <i className="fas fa-phone-alt text-[10px] text-primary"></i>
                                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{carrier.contact || 'S/ COMUNICAÇÃO'}</span>
                                    </div>
                                    <button className="w-10 h-10 rounded-xl bg-bg-main border border-white/10 hover:bg-secondary hover:text-white transition-all flex items-center justify-center shadow-lg group/btn">
                                        <i className="fas fa-external-link-alt text-[10px] group-hover/btn:scale-110 transition-transform"></i>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            <style>{`
                .port-pulse-main {
                    width: 46px; height: 46px; border-radius: 50%;
                    background: rgba(20, 184, 166, 0.2);
                    border: 3px solid #14b8a6;
                    display: flex; align-items: center; justify-content: center;
                    color: #14b8a6; font-size: 20px;
                    box-shadow: 0 0 30px rgba(20, 184, 166, 0.6);
                    animation: pulse-ring-tactical 3s infinite;
                    cursor: pointer;
                }
                .carrier-pin-tactical {
                    width: 24px; height: 24px; border-radius: 8px;
                    background: #3b82f6; color: white;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 10px; box-shadow: 0 5px 15px rgba(59, 130, 246, 0.4);
                    border: 2px solid #0f172a;
                    transform: rotate(45deg);
                    cursor: pointer;
                    transition: all 0.3s;
                }
                .carrier-pin-tactical i { transform: rotate(-45deg); }
                .carrier-pin-tactical:hover {
                    transform: rotate(45deg) scale(1.2);
                    background: #14b8a6;
                }
                @keyframes pulse-ring-tactical {
                    0% { transform: scale(0.9); box-shadow: 0 0 0 0 rgba(20, 184, 166, 0.7); }
                    70% { transform: scale(1.1); box-shadow: 0 0 0 20px rgba(20, 184, 166, 0); }
                    100% { transform: scale(0.9); box-shadow: 0 0 0 0 rgba(20, 184, 166, 0); }
                }
                .leaflet-popup-content-wrapper { 
                    background: rgba(255, 255, 255, 0.95) !important; 
                    backdrop-filter: blur(10px);
                    color: #0f172a !important; 
                    border: none !important;
                    border-radius: 16px !important;
                    box-shadow: 0 15px 40px rgba(0,0,0,0.4) !important;
                    text-transform: none !important;
                }
                .leaflet-popup-tip { background: rgba(255, 255, 255, 0.95) !important; }
                .leaflet-container { font-family: 'Inter', sans-serif !important; }
            `}</style>
        </div>
    );
};

export default EcoAtlas;

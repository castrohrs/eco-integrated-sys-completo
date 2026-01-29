
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useAppStore } from '../hooks/useAppStore';
import { PORTS_DATABASE, RJ_COORDS } from '../services/logisticsData';

// Tipagem para o Leaflet global
declare const L: any;

const EcoMaps: React.FC = () => {
    const { logAction, fleetData } = useAppStore();
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<any>(null);
    const markersRef = useRef<Record<string, any>>({});
    const portMarkersRef = useRef<any[]>([]);
    const routeLinesRef = useRef<any[]>([]);
    
    // UI States
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isSatellite, setIsSatellite] = useState(true);
    const [viewMode, setViewMode] = useState<'fleet' | 'ports'>('ports');
    const [mapReady, setMapReady] = useState(false);

    // Simulated Fleet state (Interno para animação suave)
    const [simulatedPositions, setSimulatedPositions] = useState<Record<string, {lat: number, lng: number, heading: number, speed: number}>>({});

    // Algoritmo de Haversine para Distância Real
    const getDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371; 
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        const a = 
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
            Math.sin(dLon / 2) * Math.sin(dLon / 2); 
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
        return (R * c).toFixed(1);
    };

    // 1. Efeito de Simulação de Movimento
    useEffect(() => {
        if (!fleetData) return;

        // Inicializar posições se não existirem
        setSimulatedPositions(prev => {
            const next = { ...prev };
            fleetData.forEach(v => {
                if (!next[v.id]) {
                    next[v.id] = {
                        lat: RJ_COORDS.lat + (Math.random() * 0.1 - 0.05),
                        lng: RJ_COORDS.lng + (Math.random() * 0.1 - 0.05),
                        heading: Math.random() * 360,
                        speed: v.status === 'Operacional' ? Math.floor(Math.random() * 30 + 50) : 0
                    };
                }
            });
            return next;
        });

        const interval = setInterval(() => {
            setSimulatedPositions(prev => {
                const next = { ...prev };
                fleetData.forEach(v => {
                    if (v.status === 'Operacional' && next[v.id]) {
                        // Pequeno incremento para simular movimento em direção ao Norte (exemplo)
                        next[v.id].lat += (Math.random() * 0.0005);
                        next[v.id].lng += (Math.random() * 0.0005 - 0.00025);
                        next[v.id].heading = (next[v.id].heading + (Math.random() * 10 - 5)) % 360;
                    }
                });
                return next;
            });
        }, 2000);

        return () => clearInterval(interval);
    }, [fleetData]);

    // 2. Inicialização do Mapa (Resiliente)
    useEffect(() => {
        if (typeof L === 'undefined' || !mapRef.current) return;

        // Cleanup total de instâncias anteriores
        if (mapInstance.current) {
            mapInstance.current.remove();
            mapInstance.current = null;
        }

        const map = L.map(mapRef.current, {
            zoomControl: false,
            attributionControl: false,
            center: [RJ_COORDS.lat, RJ_COORDS.lng],
            zoom: 7
        });

        mapInstance.current = map;

        const dark = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png');
        const satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}');
        const labels = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png', { pane: 'markerPane' });

        (map as any).baseLayers = { dark, satellite, labels };
        
        if (isSatellite) {
            satellite.addTo(map);
            labels.addTo(map);
        } else {
            dark.addTo(map);
        }

        // Adicionar Portos (Fixos)
        PORTS_DATABASE.forEach(port => {
            const portIcon = L.divIcon({
                html: `<div class="port-marker-pulse"><i class="fas fa-anchor"></i></div>`,
                className: '',
                iconSize: [30, 30]
            });

            const marker = L.marker([port.lat, port.lng], { icon: portIcon })
                .addTo(map)
                .bindPopup(`
                    <div class="p-2 text-black font-sans" style="text-transform: none; min-width: 200px;">
                        <p class="font-black text-xs text-primary uppercase tracking-widest">${port.id}</p>
                        <h4 class="font-bold text-base mb-1">${port.name}</h4>
                        <p class="text-[10px] text-gray-500 mb-2">${port.city}, ${port.state}</p>
                        <button class="w-full bg-primary text-black font-black text-[9px] py-1.5 rounded uppercase">Ver Janelas</button>
                    </div>
                `);
            portMarkersRef.current.push(marker);
        });

        setMapReady(true);

        return () => {
            if (mapInstance.current) {
                mapInstance.current.remove();
                mapInstance.current = null;
            }
        };
    }, []);

    // 3. Update Visual dos Caminhões e Camadas
    useEffect(() => {
        const map = mapInstance.current;
        if (!map || !mapReady) return;

        // Toggle Camadas
        if (isSatellite) {
            map.removeLayer((map as any).baseLayers.dark);
            map.addLayer((map as any).baseLayers.satellite);
            map.addLayer((map as any).baseLayers.labels);
        } else {
            map.removeLayer((map as any).baseLayers.satellite);
            map.removeLayer((map as any).baseLayers.labels);
            map.addLayer((map as any).baseLayers.dark);
        }

        // Atualizar Marcadores de Veículos
        // FIX: Explicitly cast the pos element to any within the loop to resolve property access on unknown type
        Object.entries(simulatedPositions).forEach(([id, pos]: [string, any]) => {
            const vehicle = fleetData.find(v => v.id === id);
            if (!vehicle) return;

            if (markersRef.current[id]) {
                markersRef.current[id].setLatLng([pos.lat, pos.lng]);
                const el = markersRef.current[id].getElement();
                if (el) {
                    const iconEl = el.querySelector('.truck-icon-inner');
                    if (iconEl) iconEl.style.transform = `rotate(${pos.heading}deg)`;
                }
            } else {
                const truckIcon = L.divIcon({
                    html: `
                        <div class="truck-marker-container">
                            <div class="truck-icon-inner" style="transform: rotate(${pos.heading}deg)">
                                <i class="fas fa-truck-moving"></i>
                            </div>
                            <div class="truck-plate-label">${vehicle.plate}</div>
                        </div>
                    `,
                    className: '',
                    iconSize: [40, 40]
                });

                markersRef.current[id] = L.marker([pos.lat, pos.lng], { icon: truckIcon }).addTo(map);
            }
        });

        // Limpeza de marcadores de veículos deletados
        Object.keys(markersRef.current).forEach(id => {
            if (!fleetData.find(v => v.id === id)) {
                map.removeLayer(markersRef.current[id]);
                delete markersRef.current[id];
            }
        });

    }, [isSatellite, simulatedPositions, mapReady, fleetData]);

    return (
        <div className="flex h-[calc(100vh-140px)] bg-[#05070a] rounded-[2.5rem] shadow-2xl overflow-hidden relative border border-white/5">
            
            {/* HUD: CONTROLES DE CAMADA */}
            <div className="absolute right-6 top-6 z-[1001] flex flex-col gap-3">
                <button 
                    onClick={() => setIsSatellite(!isSatellite)}
                    className={`w-12 h-12 rounded-2xl shadow-2xl flex items-center justify-center transition-all border border-white/10 active:scale-95 ${isSatellite ? 'bg-primary text-black shadow-[0_0_20px_rgba(20,184,166,0.4)]' : 'bg-bg-card/90 backdrop-blur-md text-gray-400'}`}
                    title="Alternar Visão de Satélite"
                >
                    <i className={`fas ${isSatellite ? 'fa-layer-group' : 'fa-globe-americas'}`}></i>
                </button>
                <button 
                    onClick={() => mapInstance.current?.flyTo([RJ_COORDS.lat, RJ_COORDS.lng], 12)}
                    className="w-12 h-12 rounded-2xl bg-bg-card/90 backdrop-blur-md border border-white/10 shadow-2xl flex items-center justify-center text-gray-400 hover:text-primary transition-all active:scale-95"
                    title="Centralizar no Rio de Janeiro"
                >
                    <i className="fas fa-crosshairs"></i>
                </button>
            </div>

            {/* BARRA LATERAL GPS */}
            <div className={`absolute top-0 left-0 h-full bg-black/80 backdrop-blur-2xl border-r border-white/10 transition-all duration-700 ease-in-out z-[1000] flex flex-col overflow-hidden ${isSidebarOpen ? 'w-80 opacity-100' : 'w-0 opacity-0'}`}>
                <div className="p-6 h-full flex flex-col min-w-[20rem]">
                    <div className="flex items-center gap-4 mb-8 border-b border-white/5 pb-6">
                        <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary shadow-inner">
                            <i className="fas fa-satellite animate-pulse"></i>
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-white tracking-tighter uppercase leading-none">Radar Tático</h2>
                            <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mt-1">Sincronização Ativa v5.2</p>
                        </div>
                    </div>

                    <div className="flex gap-2 p-1 bg-white/5 rounded-xl mb-6">
                        <button onClick={() => setViewMode('fleet')} className={`flex-1 py-2 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${viewMode === 'fleet' ? 'bg-primary text-black' : 'text-gray-500'}`}>Frota Ativa</button>
                        <button onClick={() => setViewMode('ports')} className={`flex-1 py-2 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${viewMode === 'ports' ? 'bg-primary text-black' : 'text-gray-500'}`}>Terminais</button>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3">
                        {viewMode === 'fleet' ? (
                            fleetData.map(v => {
                                // FIX: Cast the access from simulatedPositions to any to allow property access without unknown errors
                                const pos = simulatedPositions[v.id] as any;
                                return (
                                    <div key={v.id} onClick={() => pos && mapInstance.current?.flyTo([pos.lat, pos.lng], 14)} className="bg-white/5 border border-white/5 p-4 rounded-2xl hover:border-primary/50 transition-all cursor-pointer group">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-sm font-black text-white tracking-tighter group-hover:text-primary transition-colors">{v.plate}</span>
                                            <span className={`w-2 h-2 rounded-full ${v.status === 'Operacional' ? 'bg-success shadow-[0_0_8px_#22c55e]' : 'bg-danger'}`}></span>
                                        </div>
                                        <div className="flex justify-between text-[9px] text-gray-500 uppercase font-black tracking-tighter">
                                            <span>Velocidade: {pos?.speed || 0} KM/H</span>
                                            <span className="text-primary">EM ROTA</span>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            PORTS_DATABASE.map(p => (
                                <div key={p.id} onClick={() => mapInstance.current?.flyTo([p.lat, p.lng], 14)} className="bg-white/5 border border-white/5 p-4 rounded-2xl hover:border-secondary transition-all cursor-pointer group">
                                    <div className="flex justify-between items-center mb-1">
                                        <h4 className="font-black text-white uppercase text-xs group-hover:text-secondary transition-colors">{p.name}</h4>
                                        <span className="text-[10px] font-black text-gray-600">{p.state}</span>
                                    </div>
                                    <p className="text-[9px] text-gray-500 font-bold tracking-widest uppercase">{p.type} • {p.city}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* BOTÃO TOGGLE SIDEBAR */}
            <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="absolute top-6 left-6 z-[1001] w-12 h-12 bg-bg-card/90 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl flex items-center justify-center text-primary hover:scale-110 active:scale-95 transition-all"
            >
                <i className={`fas ${isSidebarOpen ? 'fa-times' : 'fa-bars'}`}></i>
            </button>

            {/* CONTAINER DO MAPA */}
            <div ref={mapRef} className="flex-1 w-full h-full bg-gray-900 z-0"></div>

            <style>{`
                .port-marker-pulse { 
                    width: 30px; height: 30px; background: rgba(20, 184, 166, 0.2); 
                    border: 2px solid #14b8a6; border-radius: 50%; display: flex; 
                    align-items: center; justify-content: center; color: #14b8a6; 
                    font-size: 14px; box-shadow: 0 0 15px rgba(20, 184, 166, 0.4);
                    animation: pulse-marker 2s infinite;
                }
                @keyframes pulse-marker { 0% { transform: scale(1); } 50% { transform: scale(1.1); } 100% { transform: scale(1); } }
                
                .truck-marker-container { display: flex; flex-direction: column; align-items: center; gap: 4px; }
                .truck-icon-inner { 
                    width: 32px; height: 32px; background: #0f172a; border: 2px solid #14b8a6; 
                    border-radius: 8px; display: flex; align-items: center; justify-content: center;
                    color: #14b8a6; font-size: 16px; transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
                    box-shadow: 0 5px 15px rgba(0,0,0,0.5);
                }
                .truck-plate-label { 
                    background: rgba(0,0,0,0.85); backdrop-filter: blur(4px); 
                    border: 1px solid rgba(255,255,255,0.1); padding: 2px 6px; 
                    border-radius: 4px; font-size: 8px; font-weight: 900; 
                    color: white; white-space: nowrap; letter-spacing: 1px;
                }
                
                .leaflet-popup-content-wrapper { 
                    background: rgba(255, 255, 255, 0.95) !important; 
                    backdrop-filter: blur(10px); border-radius: 16px; border: none;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.3);
                }
                .leaflet-popup-tip { background: rgba(255, 255, 255, 0.95); }
                .leaflet-container { font-family: inherit !important; }
            `}</style>
        </div>
    );
};

export default EcoMaps;

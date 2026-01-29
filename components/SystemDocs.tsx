
import React, { useState } from 'react';

interface DocSection {
    id: string;
    title: string;
    desc: string;
    icon: string;
    details: {
        objective: string;
        architecture: string[];
        dataFlow: string;
        security: string[];
        limitations: string;
    };
}

const SYSTEM_SPECS: DocSection[] = [
    {
        id: 'overview',
        title: 'System Architecture',
        desc: 'Core architecture overview and high-level structural design.',
        icon: 'fa-layer-group',
        details: {
            objective: 'To provide a robust, reactive environment for complex logistics management.',
            architecture: [
                'React 18+ for UI Rendering',
                'Custom React Hooks for State Orchestration',
                'Deterministic Data Layer (apiService)',
                'Sector-Based Access Control (RBAC)'
            ],
            dataFlow: 'One-way data flow via useAppStore. Mutations are proxied through apiService to persist in LocalStorage/Firebase.',
            security: [
                'Encrypted Session Management',
                'Hierarchical Auth (Admin > User)',
                'Validation at Entry Point (Frontend + Service layer)'
            ],
            limitations: 'Currently relies on LocalStorage for persistence in Lite mode. Production requires Cloud Firestore Native Mode.'
        }
    },
    {
        id: 'ai-engine',
        title: 'Eco.IA Intelligence',
        desc: 'Integration with Google Gemini API for logistics reasoning.',
        icon: 'fa-brain',
        details: {
            objective: 'Leverage LLM for OCR, predictive analysis, and natural language command processing.',
            architecture: [
                'Gemini 2.5 Flash for high-speed reasoning',
                'Veo for generative visual assets',
                'Custom prompt engineering for logistics doctrine'
            ],
            dataFlow: 'User Input -> System Context Sanitization -> Gemini API -> Output Interpretation -> Store Update.',
            security: [
                'API Key strictly server-side/env handled',
                'No PII leakage in AI prompts',
                'Deterministic Fallback for AI failures'
            ],
            limitations: 'Token limits apply to large document OCR. Requires high-quality imagery for 100% precision.'
        }
    },
    {
        id: 'realtime',
        title: 'Real-time Synchronization',
        desc: 'WebSocket and Socket.io infrastructure for team collaboration.',
        icon: 'fa-sync',
        details: {
            objective: 'Enable instant communication and live fleet tracking across all terminals.',
            architecture: [
                'Socket.io for bi-directional event emission',
                'Node.js Backend for message persistence (SQLite)',
                'React State listeners for live UI updates'
            ],
            dataFlow: 'Client Event -> Socket Server -> Database Store -> Broadcast to Room/Tenant.',
            security: [
                'JWT validation per socket connection',
                'Room isolation by Sector/Tenant',
                'Rate limiting for message ingestion'
            ],
            limitations: 'Requires active backend connectivity. Fallback to polling mode if Socket fails.'
        }
    },
    {
        id: 'gis-maps',
        title: 'GIS & Tracking Module',
        desc: 'Geolocation and route optimization systems.',
        icon: 'fa-map-marked-alt',
        details: {
            objective: 'Track fleet movements and optimize port-to-client routing.',
            architecture: [
                'Leaflet for map rendering',
                'OSRM for route calculation',
                'Browser Geolocation API for live positioning'
            ],
            dataFlow: 'GPS Ping -> Tracking Store -> Map Layer Update -> ETA Recalculation.',
            security: [
                'HTTPS mandatory for Location access',
                'Data masking for unauthorized viewers',
                'Secure IPC channels for Electron desktop mode'
            ],
            limitations: 'Map data cached locally for performance but requires internet for tile refreshing.'
        }
    }
];

const SystemDocs: React.FC = () => {
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const activeDoc = SYSTEM_SPECS.find(s => s.id === selectedId);

    return (
        <section className="animate-fade-in py-6 max-w-[1600px] mx-auto pb-20 px-6 h-[calc(100vh-100px)] flex flex-col">
            <header className="mb-10 shrink-0">
                <div className="inline-block px-4 py-1 bg-primary/20 text-primary rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-2 border border-primary/30">
                    Technical Specifications • Enterprise v5.2
                </div>
                <h3 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">
                    SYSTEM <span className="text-primary">INTELLIGENCE</span> DOCS
                </h3>
            </header>

            <div className="flex flex-row gap-8 flex-1 overflow-hidden">
                
                {/* NAVIGATION (LEFT) */}
                <div className={`transition-all duration-500 ease-in-out overflow-y-auto custom-scrollbar pr-2 ${selectedId ? 'w-[35%]' : 'w-full max-w-4xl mx-auto'}`}>
                    <div className="space-y-4">
                        {SYSTEM_SPECS.map((spec) => (
                            <div 
                                key={spec.id} 
                                onClick={() => setSelectedId(spec.id)}
                                className={`flex items-center gap-5 p-6 rounded-2xl border transition-all cursor-pointer group ${selectedId === spec.id ? 'bg-primary border-primary shadow-[0_0_40px_rgba(20,184,166,0.2)]' : 'bg-bg-card border-white/5 hover:border-primary/50 hover:bg-white/5'}`}
                            >
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${selectedId === spec.id ? 'bg-white text-primary' : 'bg-bg-main text-gray-500 group-hover:text-primary transition-colors'}`}>
                                    <i className={`fas ${spec.icon} text-2xl`}></i>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className={`font-black text-sm uppercase tracking-wider ${selectedId === spec.id ? 'text-white' : 'text-light'}`}>{spec.title}</h4>
                                    <p className={`text-xs mt-1 leading-snug ${selectedId === spec.id ? 'text-white/80' : 'text-gray-500'}`}>{spec.desc}</p>
                                </div>
                                <i className={`fas fa-chevron-right text-xs transition-transform ${selectedId === spec.id ? 'text-white rotate-90' : 'text-gray-800'}`}></i>
                            </div>
                        ))}
                    </div>
                </div>

                {/* DOCTRINE PANEL (RIGHT) */}
                <div className={`transition-all duration-500 ease-in-out ${selectedId ? 'w-[65%] opacity-100' : 'w-0 opacity-0 pointer-events-none'}`}>
                    {activeDoc && (
                        <div className="h-full bg-bg-card border border-white/10 rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-fade-in-right">
                            <header className="p-8 bg-white/5 border-b border-white/5 flex justify-between items-center">
                                <div>
                                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Governance Layer • Level 2 Detail</span>
                                    <h2 className="text-2xl font-black text-light tracking-tight uppercase mt-1">{activeDoc.title}</h2>
                                </div>
                                <button onClick={() => setSelectedId(null)} className="w-12 h-12 rounded-full hover:bg-white/10 text-gray-500 hover:text-white transition-all">
                                    <i className="fas fa-times text-xl"></i>
                                </button>
                            </header>

                            <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
                                <section>
                                    <h5 className="spec-label">01. Objective</h5>
                                    <p className="text-base text-gray-300 font-medium leading-relaxed italic border-l-4 border-primary pl-6 py-2">"{activeDoc.details.objective}"</p>
                                </section>

                                <div className="grid grid-cols-2 gap-10">
                                    <section>
                                        <h5 className="spec-label">02. Architecture Stack</h5>
                                        <ul className="space-y-3">
                                            {activeDoc.details.architecture.map((item, i) => (
                                                <li key={i} className="text-sm text-gray-400 flex items-start gap-3">
                                                    <i className="fas fa-check text-primary text-[10px] mt-1.5"></i> {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </section>

                                    <section>
                                        <h5 className="spec-label">03. Security Boundaries</h5>
                                        <div className="space-y-3">
                                            {activeDoc.details.security.map((item, i) => (
                                                <div key={i} className="bg-bg-main p-3 rounded-xl border border-white/5 text-xs text-gray-400 font-mono">
                                                    <span className="text-primary mr-2">SEC_PRT:</span> {item}
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                </div>

                                <section>
                                    <h5 className="spec-label">04. Technical Data Flow</h5>
                                    <div className="bg-black/40 p-6 rounded-2xl border border-white/5 font-mono text-xs text-gray-300 leading-relaxed overflow-x-auto">
                                        {activeDoc.details.dataFlow}
                                    </div>
                                </section>

                                <section className="p-6 bg-yellow-900/10 border border-yellow-500/20 rounded-2xl">
                                    <h5 className="spec-label text-yellow-500 mb-3"><i className="fas fa-exclamation-triangle"></i> 05. Known Limitations & Constraints</h5>
                                    <p className="text-sm text-gray-400 font-medium">{activeDoc.details.limitations}</p>
                                </section>
                            </div>

                            <footer className="p-6 bg-primary text-center">
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white">
                                    Confidential • System Spec Sheet • Internal Use Only
                                </p>
                            </footer>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .spec-label { 
                    font-size: 11px; font-weight: 900; text-transform: uppercase; 
                    letter-spacing: 0.3em; color: #475569; margin-bottom: 15px; 
                    display: flex; align-items: center; gap: 10px;
                }
                @keyframes fade-in-right {
                    from { opacity: 0; transform: translateX(40px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                .animate-fade-in-right {
                    animation: fade-in-right 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}</style>
        </section>
    );
};

export default SystemDocs;

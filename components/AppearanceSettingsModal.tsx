
import React, { useState, useEffect } from 'react';
import { useAppStore } from '../hooks/useAppStore';
import { ThemeMode, AppearanceSettings } from '../types';

const GOOGLE_FONTS = [
    'Inter', 'Roboto', 'Poppins', 'Montserrat', 'Nunito', 
    'Source Sans 3', 'IBM Plex Sans', 'Work Sans', 'DM Sans', 'Manrope'
];

const BACKGROUND_OPTIONS = [
  { id: 'PORT_CONTAINER_YARD', label: 'Pátio de Porto', icon: 'fa-boxes' },
  { id: 'CONTAINER_SHIP_AT_SEA', label: 'Navio em Mar', icon: 'fa-ship' },
  { id: 'PORT_CRANE_OPERATION', label: 'Guindastes Portuários', icon: 'fa-anchor' },
  { id: 'NIGHT_PORT_OPERATIONS', label: 'Operação Noturna', icon: 'fa-moon' },
  { id: 'TRUCK_LOGISTICS_HIGHWAY', label: 'Rodovia Logística', icon: 'fa-truck' },
  { id: 'CONTAINER_TERMINAL_CLOSEUP', label: 'Terminal Closeup', icon: 'fa-th-large' },
  { id: 'DEPOT_YARD_OPERATIONS', label: 'Depot Yard', icon: 'fa-warehouse' },
  { id: 'INDUSTRIAL_MAP_OVERLAY', label: 'Mapa Industrial', icon: 'fa-map' },
  { id: 'MINIMAL_DARK_GRADIENT', label: 'Gradiente Minimal', icon: 'fa-brush' },
  { id: 'PORT_STORM_OPERATION', label: 'Operação Crítica', icon: 'fa-cloud-showers-heavy' }
];

interface AppearanceSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const Section = ({ title, children }: { title: string, children?: React.ReactNode }) => (
    <div className="mb-8">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-4 flex items-center gap-2">
            <span className="w-1 h-3 bg-primary rounded-full"></span>
            {title}
        </h3>
        <div className="space-y-4">
            {children}
        </div>
    </div>
);

const ControlGroup = ({ label, children }: { label: string, children?: React.ReactNode }) => (
    <div>
        <label className="text-[11px] font-bold text-gray-400 block mb-2">{label}</label>
        <div className="flex flex-wrap gap-2">
            {children}
        </div>
    </div>
);

const OptionButton = ({ active, onClick, children }: { active: boolean, onClick: () => void, children?: React.ReactNode }) => (
    <button
        onClick={onClick}
        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${active ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-bg-main text-gray-400 border-border-color hover:text-light hover:border-gray-500'}`}
    >
        {children}
    </button>
);

const AppearanceSettingsModal: React.FC<AppearanceSettingsModalProps> = ({ isOpen, onClose }) => {
    const { appearance, updateAppearance } = useAppStore();
    const [localAppearance, setLocalAppearance] = useState<AppearanceSettings>(appearance);

    // Sync buffer when modal opens
    useEffect(() => {
        if (isOpen) {
            setLocalAppearance(appearance);
        }
    }, [isOpen, appearance]);

    if (!isOpen) return null;

    const handleLocalUpdate = (updates: Partial<AppearanceSettings>) => {
        setLocalAppearance(prev => ({ ...prev, ...updates }));
    };

    const handleSave = () => {
        updateAppearance(localAppearance);
        onClose();
    };

    const handleColorChange = (key: keyof AppearanceSettings, value: string) => {
        handleLocalUpdate({ [key]: value });
    };

    return (
        <div className="fixed inset-0 z-[3005] overflow-hidden" onClick={onClose}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"></div>
            
            <div 
                className="absolute right-0 top-0 h-full w-[400px] bg-bg-card border-l border-border-color shadow-2xl animate-fade-in-right flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <header className="p-6 border-b border-border-color flex items-center justify-between bg-bg-card/50 backdrop-blur-md sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                            <i className="fas fa-magic"></i>
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-light tracking-tight">Personalização</h2>
                            <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Interface Engine v2.0</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-light transition-colors">
                        <i className="fas fa-times text-xl"></i>
                    </button>
                </header>

                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    <Section title="Modo Visual">
                        <ControlGroup label="Esquema de Cores Base">
                            <div className="grid grid-cols-3 gap-2 w-full">
                                {(['light', 'dark', 'auto'] as ThemeMode[]).map(mode => (
                                    <button
                                        key={mode}
                                        onClick={() => handleLocalUpdate({ themeMode: mode })}
                                        className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${localAppearance.themeMode === mode ? 'bg-primary/10 border-primary text-primary shadow-lg shadow-primary/10' : 'bg-bg-main border-border-color text-gray-400 hover:border-gray-500'}`}
                                    >
                                        <i className={`fas ${mode === 'light' ? 'fa-sun' : mode === 'dark' ? 'fa-moon' : 'fa-desktop'} text-lg`}></i>
                                        <span className="text-[9px] font-black uppercase text-center leading-tight">{mode}</span>
                                    </button>
                                ))}
                            </div>
                        </ControlGroup>
                    </Section>

                    <Section title="Ambiente Imersivo">
                        <ControlGroup label="Background do Sistema">
                            <div className="grid grid-cols-2 gap-2 w-full">
                                {BACKGROUND_OPTIONS.map(bg => (
                                    <button
                                        key={bg.id}
                                        onClick={() => handleLocalUpdate({ backgroundId: bg.id })}
                                        className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${localAppearance.backgroundId === bg.id ? 'bg-primary/10 border-primary text-primary shadow-lg shadow-primary/10' : 'bg-bg-main border-border-color text-gray-400 hover:border-gray-500'}`}
                                    >
                                        <i className={`fas ${bg.icon} text-lg`}></i>
                                        <span className="text-[9px] font-black uppercase text-center leading-tight">{bg.label}</span>
                                    </button>
                                ))}
                            </div>
                        </ControlGroup>
                    </Section>

                    <Section title="Cores customizadas">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between bg-bg-main p-3 rounded-xl border border-border-color">
                                <span className="text-xs font-bold text-gray-400 uppercase">Primária</span>
                                <input type="color" value={localAppearance.primaryColorHex} onChange={e => handleColorChange('primaryColorHex', e.target.value)} className="w-10 h-8 rounded cursor-pointer bg-transparent border-none" />
                            </div>
                            <div className="flex items-center justify-between bg-bg-main p-3 rounded-xl border border-border-color">
                                <span className="text-xs font-bold text-gray-400 uppercase">Acento</span>
                                <input type="color" value={localAppearance.accentColorHex} onChange={e => handleColorChange('accentColorHex', e.target.value)} className="w-10 h-8 rounded cursor-pointer bg-transparent border-none" />
                            </div>
                        </div>
                    </Section>

                    <Section title="Tipografia">
                        <ControlGroup label="Família da Fonte">
                            <div className="grid grid-cols-2 gap-2 w-full">
                                {GOOGLE_FONTS.slice(0, 6).map(font => (
                                    <button
                                        key={font}
                                        onClick={() => handleLocalUpdate({ fontFamily: font })}
                                        className={`p-3 rounded-xl border text-left transition-all ${localAppearance.fontFamily === font ? 'bg-primary/10 border-primary text-primary' : 'bg-bg-main border-border-color text-gray-400'}`}
                                        style={{ fontFamily: font }}
                                    >
                                        <span className="block text-xs font-bold">{font}</span>
                                    </button>
                                ))}
                            </div>
                        </ControlGroup>
                    </Section>
                </div>

                <footer className="p-6 bg-bg-main border-t border-border-color">
                    <button 
                        onClick={handleSave}
                        className="w-full py-4 bg-primary text-white font-black uppercase tracking-widest rounded-xl shadow-xl shadow-primary/20 hover:brightness-110 transition-all transform active:scale-95"
                    >
                        Salvar Alterações
                    </button>
                </footer>
            </div>

            <style>{`
                @keyframes fade-in-right {
                    from { transform: translateX(100%); }
                    to { transform: translateX(0); }
                }
                .animate-fade-in-right {
                    animation: fade-in-right 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                }
            `}</style>
        </div>
    );
};

export default AppearanceSettingsModal;

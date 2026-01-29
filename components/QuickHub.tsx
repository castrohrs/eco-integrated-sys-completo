
import React, { useState } from 'react';
import { useAppStore, SIDEBAR_SECTORS } from '../hooks/useAppStore';
import { TabId, Shortcut } from '../types';

const QuickHub: React.FC = () => {
    const { 
        shortcuts, 
        setActiveTab, 
        activeTab, 
        logAction,
        activeFloatingTool,
        setActiveFloatingTool,
        toggleShortcut
    } = useAppStore();
    
    const [isConfigOpen, setIsConfigOpen] = useState(false);

    const toggleTool = (tool: 'chat' | 'notes') => {
        setActiveFloatingTool(activeFloatingTool === tool ? null : tool);
    };

    return (
        <div className="relative">
            {/* CONFIG MENU (POPUP) */}
            {isConfigOpen && (
                <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-64 bg-[#0a0c10]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl z-[1600] animate-fade-in-up origin-bottom">
                    <div className="flex justify-between items-center mb-3 pb-2 border-b border-white/10">
                        <h4 className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Gerenciar Atalhos</h4>
                        <button onClick={() => setIsConfigOpen(false)} className="text-gray-500 hover:text-white"><i className="fas fa-times"></i></button>
                    </div>
                    <div className="max-h-60 overflow-y-auto custom-scrollbar space-y-1">
                        {SIDEBAR_SECTORS.flatMap(s => s.items).map(item => {
                            const isPinned = shortcuts.some(s => s.tabId === item.id);
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => toggleShortcut(item.id as TabId)}
                                    className={`w-full flex items-center gap-3 p-2 rounded-lg text-xs font-bold transition-all ${isPinned ? 'bg-primary/20 text-primary border border-primary/30' : 'text-gray-400 hover:bg-white/5'}`}
                                >
                                    <div className="w-6 flex justify-center"><i className={`fas ${item.icon}`}></i></div>
                                    <span className="flex-1 text-left truncate">{item.textKey}</span>
                                    {isPinned && <i className="fas fa-check text-[10px]"></i>}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            <div className="bg-[#0a0c10]/80 backdrop-blur-3xl border border-white/10 p-2 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex items-center justify-between gap-2 ring-1 ring-white/5 group/dock relative">
                {/* SEÇÃO SISTEMA */}
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => toggleTool('chat')}
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${activeFloatingTool === 'chat' ? 'bg-primary text-black shadow-[0_0_20px_rgba(var(--color-primary-val),0.5)]' : 'text-gray-500 hover:text-primary hover:bg-primary/10'}`}
                        title="Chat Interno"
                    >
                        <i className="fas fa-comments text-lg"></i>
                    </button>
                    <button
                        onClick={() => toggleTool('notes')}
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${activeFloatingTool === 'notes' ? 'bg-warning text-black shadow-[0_0_20px_rgba(var(--color-warning-val),0.5)]' : 'text-gray-500 hover:text-warning hover:bg-warning/10'}`}
                        title="Bloco de Notas"
                    >
                        <i className="fas fa-sticky-note text-lg"></i>
                    </button>
                </div>

                <div className="h-8 w-px bg-white/10 mx-1"></div>

                {/* SEÇÃO ATALHOS (CENTER DOCK) */}
                <div className="flex-1 flex items-center justify-center gap-2 overflow-x-auto no-scrollbar scroll-smooth px-2">
                    {shortcuts.map(shortcut => (
                        <button
                            key={shortcut.id}
                            onClick={() => {
                                setActiveTab(shortcut.tabId);
                                logAction(`DOCK: Atalho ${shortcut.label} ativado.`);
                            }}
                            className={`min-w-[48px] h-12 rounded-2xl flex items-center justify-center transition-all relative group/item
                                ${activeTab === shortcut.tabId ? 'bg-primary/20 text-primary border border-primary/30 scale-110' : 'text-gray-400 hover:bg-white/5 hover:text-light'}
                            `}
                        >
                            <i className={`fas ${shortcut.icon} text-lg`}></i>
                            <span className="absolute -top-12 left-1/2 -translate-x-1/2 bg-black/90 text-white text-[9px] font-black uppercase px-3 py-1.5 rounded-lg border border-white/10 opacity-0 group-hover/item:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                {shortcut.label}
                            </span>
                            {activeTab === shortcut.tabId && (
                                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full shadow-[0_0_8px_#14b8a6]"></span>
                            )}
                        </button>
                    ))}
                    
                    {/* ADD SHORTCUT BUTTON */}
                    <button 
                        onClick={() => setIsConfigOpen(!isConfigOpen)}
                        className={`min-w-[40px] h-10 rounded-xl flex items-center justify-center border-2 border-dashed border-white/10 text-gray-600 hover:text-white hover:border-white/30 transition-all ${isConfigOpen ? 'bg-white/10 text-white border-white/30' : ''}`}
                        title="Adicionar Atalho"
                    >
                        <i className={`fas ${isConfigOpen ? 'fa-times' : 'fa-plus'} text-xs`}></i>
                    </button>
                </div>

                <div className="h-8 w-px bg-white/10 mx-1"></div>

                {/* SEÇÃO MANIFESTO */}
                <button
                    onClick={() => setActiveTab('manifesto')}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${activeTab === 'manifesto' ? 'bg-secondary text-white' : 'text-gray-500 hover:text-secondary'}`}
                    title="Manifesto do Sistema"
                >
                    <i className="fas fa-info-circle text-lg"></i>
                </button>
            </div>
        </div>
    );
};

export default QuickHub;

import React, { useState, useEffect } from 'react';
import { useAppStore } from '../hooks/useAppStore';
import { MobileMenuItem, CustomMobileMenu } from '../types';
import MobileMockup from './MobileMockup';

const ICONS = ['fa-chart-line', 'fa-truck', 'fa-wallet', 'fa-file-alt', 'fa-box', 'fa-shield-alt', 'fa-user-tie', 'fa-calendar-alt', 'fa-map-marker-alt', 'fa-cogs', 'fa-bell', 'fa-lock', 'fa-print', 'fa-search-dollar'];
const COLOR_CLASSES: Record<string, string> = {
    'bg-primary': 'bg-primary shadow-[0_0_20px_rgba(20,184,166,0.4)]',
    'bg-secondary': 'bg-secondary shadow-[0_0_20px_rgba(59,130,246,0.4)]',
    'bg-success': 'bg-success shadow-[0_0_20px_rgba(34,197,94,0.4)]',
    'bg-warning': 'bg-warning shadow-[0_0_20px_rgba(245,158,11,0.4)]',
    'bg-danger': 'bg-danger shadow-[0_0_20px_rgba(220,38,38,0.4)]',
    'bg-purple-500': 'bg-purple-500 shadow-[0_0_20px_rgba(139,92,246,0.4)]',
    'bg-orange-500': 'bg-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.4)]',
    'bg-pink-500': 'bg-pink-500 shadow-[0_0_20px_rgba(236,72,153,0.4)]'
};

const MobileMenuBuilder: React.FC = () => {
    const { customMobileMenus, saveMobileMenu, logAction } = useAppStore();
    
    const [currentMenu, setCurrentMenu] = useState<CustomMobileMenu>({
        id: 'main-hub',
        title: 'ECO.DASH',
        subtitle: 'CENTRO DE COMANDO OPERACIONAL',
        footerText: 'PROTOCOLO SEGURO MIND7 V5.2',
        items: [
            { id: '1', label: 'Monitor', icon: 'fa-chart-line', color: 'bg-primary' },
            { id: '2', label: 'Logística', icon: 'fa-truck', color: 'bg-secondary' }
        ]
    });

    const [newItem, setNewItem] = useState<Partial<MobileMenuItem>>({ 
        label: '', 
        icon: 'fa-star', 
        color: 'bg-primary' 
    });

    // Load saved menu if exists
    useEffect(() => {
        if (customMobileMenus.length > 0) {
            const saved = customMobileMenus.find(m => m.id === 'main-hub');
            if (saved) setCurrentMenu(saved);
        }
    }, [customMobileMenus]);

    const addItem = () => {
        if (!newItem.label) return;
        const updatedMenu = {
            ...currentMenu,
            items: [...currentMenu.items, { ...newItem, id: Date.now().toString() } as MobileMenuItem]
        };
        setCurrentMenu(updatedMenu);
        saveMobileMenu(updatedMenu);
        setNewItem({ label: '', icon: 'fa-star', color: 'bg-primary' });
        logAction(`MOBILE_BUILDER: Item '${newItem.label}' adicionado ao menu.`);
    };

    const removeItem = (id: string) => {
        const updatedMenu = {
            ...currentMenu,
            items: currentMenu.items.filter(i => i.id !== id)
        };
        setCurrentMenu(updatedMenu);
        saveMobileMenu(updatedMenu);
    };

    const updateHeader = (field: keyof CustomMobileMenu, val: string) => {
        const updated = { ...currentMenu, [field]: val };
        setCurrentMenu(updated);
        saveMobileMenu(updated);
    };

    return (
        <div className="flex flex-col lg:flex-row h-[calc(100vh-100px)] gap-10 p-6 animate-fade-in">
            
            {/* EDITOR PANEL */}
            <div className="flex-[1.2] bg-bg-card/40 backdrop-blur-xl border border-white/5 rounded-[3rem] p-10 overflow-y-auto shadow-2xl space-y-10 custom-scrollbar">
                <header>
                    <h2 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">
                        Dashboard <span className="text-primary">Designer</span>
                    </h2>
                    <p className="text-gray-text text-xs font-bold uppercase tracking-[0.3em] mt-3 opacity-60">Crie interfaces mobile com DNA EcoLog</p>
                </header>

                {/* Header Config */}
                <div className="space-y-6">
                    <h3 className="text-[10px] font-black uppercase text-secondary tracking-widest border-l-2 border-secondary pl-3">Configuração do Cabeçalho</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase text-gray-500 ml-1">Título Principal</label>
                            <input 
                                value={currentMenu.title} 
                                onChange={e => updateHeader('title', e.target.value.toUpperCase())} 
                                className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-white font-black tracking-widest outline-none focus:border-primary transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase text-gray-500 ml-1">Subtítulo / Descrição</label>
                            <input 
                                value={currentMenu.subtitle} 
                                onChange={e => updateHeader('subtitle', e.target.value.toUpperCase())} 
                                className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-gray-400 font-bold text-[10px] outline-none focus:border-primary transition-all"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase text-gray-500 ml-1">Texto de Segurança (Rodapé)</label>
                        <input 
                            value={currentMenu.footerText} 
                            onChange={e => updateHeader('footerText', e.target.value.toUpperCase())} 
                            className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-gray-600 font-mono text-[9px] outline-none focus:border-primary transition-all"
                        />
                    </div>
                </div>

                {/* Add Item Form */}
                <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5 space-y-8">
                    <h3 className="text-[10px] font-black uppercase text-primary tracking-widest border-l-2 border-primary pl-3">Adicionar Novo Módulo</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-gray-500 ml-1 uppercase">Rótulo do Botão</label>
                            <input 
                                placeholder="EX: FINANCEIRO" 
                                value={newItem.label} 
                                onChange={e => setNewItem({...newItem, label: e.target.value.toUpperCase()})}
                                className="w-full bg-bg-main border border-white/5 rounded-2xl p-4 text-white text-xs font-bold outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-gray-500 ml-1 uppercase">Cor do Efeito Glow</label>
                            <div className="flex flex-wrap gap-2">
                                {Object.keys(COLOR_CLASSES).map(color => (
                                    <button 
                                        key={color}
                                        onClick={() => setNewItem({...newItem, color})}
                                        style={{ backgroundColor: color.includes('bg-') ? `var(--color-${color.replace('bg-', '')}-val)` : color }}
                                        // FIX: Merged duplicate className attributes to resolve JSX element error and consolidated styling
                                        className={`${color} w-8 h-8 rounded-full transition-all border-2 ${newItem.color === color ? 'border-white scale-110' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-gray-500 ml-1 uppercase">Ícone Operacional</label>
                        <div className="flex flex-wrap gap-3 p-4 bg-black/20 rounded-2xl">
                            {ICONS.map(icon => (
                                <button 
                                    key={icon}
                                    onClick={() => setNewItem({...newItem, icon})}
                                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${newItem.icon === icon ? 'bg-primary text-black scale-110 shadow-lg' : 'bg-white/5 text-gray-500 hover:text-white'}`}
                                >
                                    <i className={`fas ${icon}`}></i>
                                </button>
                            ))}
                        </div>
                    </div>

                    <button 
                        onClick={addItem}
                        disabled={!newItem.label}
                        className="w-full py-5 bg-primary text-white font-black uppercase tracking-[0.3em] rounded-2xl hover:brightness-110 shadow-2xl shadow-primary/20 transition-all disabled:opacity-30 disabled:grayscale"
                    >
                        Adicionar ao Dashboard
                    </button>
                </div>

                {/* List of current items */}
                <div className="space-y-3">
                    <h3 className="text-[10px] font-black uppercase text-gray-500 tracking-widest pl-1">Estrutura Atual</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {currentMenu.items.map((item) => (
                            <div key={item.id} className="flex items-center justify-between bg-black/20 p-4 rounded-2xl border border-white/5 group">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${COLOR_CLASSES[item.color]}`}>
                                        <i className={`fas ${item.icon}`}></i>
                                    </div>
                                    <span className="font-black text-[10px] text-gray-300 uppercase tracking-widest">{item.label}</span>
                                </div>
                                <button onClick={() => removeItem(item.id)} className="text-gray-600 hover:text-danger p-2 transition-colors">
                                    <i className="fas fa-trash-alt text-xs"></i>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* PREVIEW PANEL (The Login Phone) */}
            <div className="flex-1 flex items-center justify-center bg-black/40 rounded-[3rem] border border-white/5 relative group/preview overflow-hidden">
                <div className="absolute top-6 right-8 bg-primary/20 text-primary px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-primary/30 animate-pulse z-50">
                    Live Interface
                </div>
                
                <MobileMockup>
                    <div className="p-8 pt-12 min-h-full flex flex-col items-center">
                        {/* Dynamic App Header */}
                        <div className="text-center mb-12 w-full">
                            <div className="w-16 h-16 bg-primary/5 rounded-[1.8rem] flex items-center justify-center mx-auto mb-6 border border-primary/20 shadow-[0_0_30px_rgba(var(--color-primary-val),0.1)] relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent animate-pulse"></div>
                                <i className="fas fa-brain text-3xl text-primary drop-shadow-[0_0_10px_rgba(var(--color-primary-val),0.6)]"></i>
                            </div>
                            <h2 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">
                                {currentMenu.title.split('.')[0]}.<span className="text-red-600 drop-shadow-[0_0_15px_rgba(220,38,38,0.6)]">{currentMenu.title.split('.')[1] || 'LOG'}</span>
                            </h2>
                            <p className="text-gray-500 mt-4 text-[9px] font-black uppercase tracking-[0.3em] opacity-80 leading-relaxed px-4">
                                {currentMenu.subtitle}
                            </p>
                        </div>

                        {/* Login-style Grid Menu */}
                        <div className="grid grid-cols-2 gap-5 w-full">
                            {currentMenu.items.map(item => (
                                <button key={item.id} className="bg-white/5 border border-white/10 hover:border-white/30 p-6 rounded-[2rem] flex flex-col items-center justify-center gap-5 group transition-all active:scale-95 aspect-square shadow-xl hover:bg-white/10">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform text-white ${COLOR_CLASSES[item.color]}`}>
                                        <i className={`fas ${item.icon}`}></i>
                                    </div>
                                    <span className="text-[9px] font-black text-gray-400 group-hover:text-white uppercase tracking-[0.2em]">{item.label}</span>
                                </button>
                            ))}
                        </div>

                        {/* Footer / Manifesto */}
                        <div className="mt-auto pt-10 pb-4 text-center opacity-40">
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <i className="fas fa-lock text-[8px] text-primary"></i>
                                <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.4em]">{currentMenu.footerText}</span>
                            </div>
                        </div>
                    </div>
                </MobileMockup>

                {/* Cyber Background for Preview */}
                <div className="absolute inset-0 pointer-events-none opacity-30 bg-[radial-gradient(circle_at_center,rgba(var(--color-primary-val),0.15)_0%,transparent_70%)]"></div>
            </div>
        </div>
    );
};

export default MobileMenuBuilder;
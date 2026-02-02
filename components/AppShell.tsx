
import React, { useState, useMemo, useEffect } from 'react';
import { useAppStore, SIDEBAR_SECTORS } from '../hooks/useAppStore';
import { useAuth } from '../hooks/useAuth';
import { TabId } from '../types';
import { useLanguage } from '../hooks/useLanguage';
import { SettingsModal } from './SettingsModal';

const Sidebar: React.FC<{ onOpenSettings: () => void }> = ({ onOpenSettings }) => {
    const { 
        activeTab, 
        setActiveTab, 
        checkPermission, 
        isSidebarPinned, 
        setIsSidebarPinned 
    } = useAppStore();
    const { currentUser } = useAuth();
    const { t } = useLanguage();

    const handleTabClick = (tabId: TabId) => {
        if (checkPermission(currentUser, tabId)) setActiveTab(tabId);
    };

    // Helper para cor do texto do grupo baseado no ID do setor
    const getSectorTextColor = (sectorId: string) => {
        switch(sectorId) {
            case 'FlowCapital': return 'text-emerald-400'; // Financeiro Verde
            case 'NeuroTech': return 'text-red-400';       // Operacional Vermelho
            case 'IdeaForge': return 'text-indigo-400';    // Inovação Roxo
            default: return 'text-gray-400';               // Gestão Padrão
        }
    };

    // Helper para borda do item ativo baseado no setor
    const getActiveItemStyle = (itemId: string, sectorId: string) => {
        if (activeTab !== itemId) return 'text-gray-400 hover:text-white hover:bg-white/5';
        
        switch(sectorId) {
            case 'FlowCapital': return 'bg-emerald-500/20 text-emerald-300 border-l-4 border-emerald-500';
            case 'NeuroTech': return 'bg-red-500/20 text-red-300 border-l-4 border-red-500';
            case 'IdeaForge': return 'bg-indigo-500/20 text-indigo-300 border-l-4 border-indigo-500';
            default: return 'bg-white/10 text-white border-l-4 border-white';
        }
    };

    return (
        <aside 
            className={`${isSidebarPinned ? 'w-[260px]' : 'w-[65px] hover:w-[260px]'} h-screen flex flex-col transition-all duration-300 ease-in-out z-[1000] fixed left-0 top-0 shadow-2xl group bg-[#0f172a] border-r border-white/5 overflow-hidden`}
        >
            {/* Header / Logo */}
            <div className="h-16 flex items-center px-4 shrink-0 bg-black/20 backdrop-blur-sm border-b border-white/5 whitespace-nowrap overflow-hidden">
                <i className="fas fa-cubes text-2xl text-primary min-w-[24px]"></i>
                <span className={`ml-4 font-black text-white text-xl tracking-tighter transition-opacity duration-300 ${isSidebarPinned ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                    EcoLog <span className="text-primary">CRM</span>
                </span>
            </div>

            {/* LISTA CONTÍNUA ("Tudo Corrido") */}
            <nav className="flex-1 overflow-y-auto custom-scrollbar py-4 space-y-6">
                {SIDEBAR_SECTORS.map((sector) => (
                    <div key={sector.id} className="relative">
                        {/* Título do Setor (Visível apenas expandido) */}
                        <div className={`px-5 py-2 text-[10px] font-black uppercase tracking-[0.2em] border-b border-white/5 mb-1 mx-2 transition-opacity duration-200 whitespace-nowrap overflow-hidden ${isSidebarPinned ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} ${getSectorTextColor(sector.id)}`}>
                            {sector.label}
                        </div>

                        {/* Separador para modo recolhido */}
                        <div className={`h-px w-8 bg-white/10 mx-auto mb-2 ${isSidebarPinned ? 'hidden' : 'block group-hover:hidden'}`}></div>

                        <div className="space-y-0.5">
                            {sector.items.map(item => checkPermission(currentUser, item.id as TabId) && (
                                <button 
                                    key={item.id} 
                                    onClick={() => handleTabClick(item.id as TabId)} 
                                    className={`w-full flex items-center h-11 px-4 transition-all relative group/item ${getActiveItemStyle(item.id, sector.id)}`}
                                    title={t(item.textKey)}
                                >
                                    <div className="w-6 flex justify-center flex-shrink-0">
                                        <i className={`fas ${item.icon} text-sm`}></i>
                                    </div>
                                    
                                    <span className={`ml-3 text-xs font-bold whitespace-nowrap transition-opacity duration-200 ${isSidebarPinned ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                        {t(item.textKey)}
                                    </span>

                                    {/* Tooltip flutuante (apenas quando recolhido e não fixado) */}
                                    {!isSidebarPinned && (
                                        <div className="absolute left-full ml-2 px-3 py-1.5 bg-gray-900 text-white text-xs font-bold rounded opacity-0 group-hover/item:opacity-100 hidden group-hover/item:block z-50 whitespace-nowrap border border-white/10 shadow-xl pointer-events-none">
                                            {t(item.textKey)}
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </nav>

            {/* Footer / Controles */}
            <div className="p-3 border-t border-white/10 bg-black/20 backdrop-blur-md flex flex-col gap-2">
                <button 
                    onClick={() => setIsSidebarPinned(!isSidebarPinned)}
                    className={`w-full flex items-center h-10 px-3 rounded-lg transition-all ${isSidebarPinned ? 'bg-primary/20 text-primary' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                    title={isSidebarPinned ? "Desafixar Menu" : "Fixar Menu Aberto"}
                >
                    <div className="w-6 flex justify-center">
                        <i className={`fas ${isSidebarPinned ? 'fa-thumbtack' : 'fa-bars'} text-sm transform ${isSidebarPinned ? '-rotate-45' : ''}`}></i>
                    </div>
                    <span className={`ml-3 text-xs font-black uppercase tracking-wider transition-opacity duration-300 whitespace-nowrap ${isSidebarPinned ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                        {isSidebarPinned ? 'Menu Fixo' : 'Expandir'}
                    </span>
                </button>
                
                <button 
                    onClick={onOpenSettings}
                    className="w-full flex items-center h-10 px-3 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors group/cfg"
                >
                    <div className="w-6 flex justify-center">
                        <i className="fas fa-cog text-sm group-hover/cfg:rotate-90 transition-transform duration-500"></i>
                    </div>
                    <span className={`ml-3 text-xs font-black uppercase tracking-wider transition-opacity duration-300 whitespace-nowrap ${isSidebarPinned ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                        Configurações
                    </span>
                </button>
            </div>
        </aside>
    );
};

const Header: React.FC = () => {
    const { activeTab, setActiveTab } = useAppStore();
    const { currentUser, logout } = useAuth();
    const { t } = useLanguage();
    
    const currentTabInfo = useMemo(() => {
        for (const sector of SIDEBAR_SECTORS) {
            const item = sector.items.find(i => i.id === activeTab);
            if (item) return item;
        }
        return { textKey: 'Página Inicial', icon: 'fa-home' };
    }, [activeTab]);

    return (
        <header className="h-16 bg-white border-b border-border-color sticky top-0 flex items-center justify-between px-6 z-[900]">
            <div className="flex items-center gap-4">
                <h2 className="text-lg font-bold text-navy flex items-center gap-2 cursor-default">
                    <i className={`fas ${currentTabInfo.icon} text-gray-400`}></i>
                    {t(currentTabInfo.textKey)}
                </h2>
                <div className="h-6 w-px bg-border-color mx-2"></div>
                <div className="hidden sm:flex items-center gap-1 text-[11px] text-gray-500">
                    <span 
                        className="hover:text-primary cursor-pointer transition-colors hover:underline"
                        onClick={() => setActiveTab('dashboard')}
                    >
                        EcoLog
                    </span>
                    <i className="fas fa-chevron-right text-[8px]"></i>
                    <span 
                        className="font-bold text-navy hover:text-primary cursor-pointer transition-colors hover:underline"
                        onClick={() => setActiveTab(activeTab)}
                    >
                        {t(currentTabInfo.textKey)}
                    </span>
                </div>
            </div>

            <div className="flex-1 max-w-xl mx-10">
                <div className="relative group">
                    <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors"></i>
                    <input 
                        className="w-full bg-gray-100 border-none rounded-full py-2 pl-12 pr-4 text-sm focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                        placeholder="Pesquisar em todos os módulos (Leads, Fretes, Clientes...)"
                    />
                </div>
            </div>

            <div className="flex items-center gap-5">
                <button className="text-gray-500 hover:text-primary transition-all active:scale-90" title="Adicionar Rápido"><i className="fas fa-plus-circle text-xl"></i></button>
                <button className="text-gray-500 hover:text-primary transition-all relative active:scale-90" title="Notificações">
                    <i className="fas fa-bell text-xl"></i>
                    <span className="absolute top-0 right-0 w-2 h-2 bg-danger rounded-full border border-white"></span>
                </button>
                <div 
                    className="relative"
                    ref={userMenuRef}
                    onMouseEnter={() => setIsUserMenuOpen(true)}
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                >
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold cursor-pointer hover:brightness-110 transition-all border-2 border-transparent hover:border-primary/20">
                        {currentUser?.name?.[0].toUpperCase()}
                    </div>
                    <div className={`absolute right-0 top-full mt-2 w-48 bg-white border border-border-color shadow-xl rounded-lg py-2 transition-all transform origin-top-right ${isUserMenuOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-2 pointer-events-none'}`}>
                        <div className="px-4 py-2 border-b border-border-color mb-2">
                            <p className="text-xs font-bold text-navy">{currentUser?.name}</p>
                            <p className="text-[10px] text-gray-500">{currentUser?.sector}</p>
                        </div>
                        <button className="w-full text-left px-4 py-2 text-xs hover:bg-gray-50 transition-colors flex items-center gap-2">
                            <i className="fas fa-user-circle w-4"></i> Meu Perfil
                        </button>
                        <button className="w-full text-left px-4 py-2 text-xs hover:bg-gray-50 transition-colors flex items-center gap-2">
                            <i className="fas fa-cog w-4"></i> Configurações
                        </button>
                        <div className="h-px bg-border-color my-1"></div>
                        <button onClick={logout} className="w-full text-left px-4 py-2 text-xs text-danger hover:bg-red-50 transition-colors flex items-center gap-2 font-bold">
                            <i className="fas fa-power-off w-4"></i> Sair
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

const AppShell: React.FC<{ children: React.ReactNode; onReturnToLanding?: () => void }> = ({ children, onReturnToLanding }) => {
    const { isSidebarPinned } = useAppStore();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-bg-main">
            <Sidebar onOpenSettings={() => setIsSettingsOpen(true)} />
            <div 
                className={`flex flex-col flex-1 transition-all duration-300 ease-in-out ${isSidebarPinned ? 'ml-[260px]' : 'ml-[65px]'}`}
            >
                <Header />
                <main className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    <div className="max-w-[1600px] mx-auto min-h-full">
                        {children}
                    </div>
                </main>
                <footer className="h-10 bg-white border-t border-border-color px-6 flex items-center justify-between shrink-0">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">© 2025 EcoLog CRM Core v5.2</p>
                    <div className="flex items-center gap-6 text-[10px] text-gray-500 font-bold uppercase">
                        <span className="flex items-center gap-2 group cursor-default">
                            <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span> 
                            <span className="group-hover:text-success transition-colors">ONLINE</span>
                        </span>
                        <span className="hover:text-primary cursor-pointer transition-colors hover:underline">PRIVACIDADE</span>
                        <a 
                            href="mailto:OLS34X@GMAIL.COM"
                            className="hover:text-primary cursor-pointer transition-colors hover:underline text-gray-500"
                        >
                            SUPORTE
                        </a>
                    </div>
                </footer>
            </div>
            
            {/* Modal de Configurações */}
            <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
        </div>
    );
};

export default AppShell;

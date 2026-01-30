
import React, { useState, useEffect } from 'react';
import { useAppStore } from '../hooks/useAppStore';
import { TabId } from '../types';

// --- ESTRUTURA DE DADOS FIXA (BASE OPERACIONAL) ---
const OPERATIONAL_GUIDE = [
    {
        category: "AGENDAMENTO DE CONTAINER (OFICIAL)",
        icon: "fa-calendar-check",
        items: [
            { title: "SANTOS: Porto de Santos", url: "https://www.portodesantos.com.br", desc: "Portal Geral de Informações" },
            { title: "SANTOS: BTP", url: "https://agendamento.btpsantos.com.br", desc: "Brasil Terminal Portuário" },
            { title: "SANTOS: Santos Brasil", url: "https://agendamento.santosbrasil.com.br", desc: "Agendamento Tecon" },
            { title: "SANTOS: DP World", url: "https://agendamento.dpworldsantos.com.br", desc: "Emissão de Janelas" },
            { title: "ITAJAÍ: Porto de Itajaí", url: "https://www.portoitajai.com.br", desc: "Autoridade Portuária" },
            { title: "NAVEGANTES: Portonave", url: "https://www.portonave.com.br", desc: "Área do Cliente → Agendamento" },
            { title: "PARANAGUÁ: Portos do Paraná", url: "https://www.portosdoparana.pr.gov.br", desc: "Acesso aos Terminais" },
            { title: "PARANAGUÁ: TCP", url: "https://agendamento.tcp.com.br", desc: "Terminal de Containers" },
            { title: "RIO: MultiRio", url: "https://www.multirio.com.br", desc: "Agendamento Portuário" },
            { title: "ITAGUAÍ: Sepetiba Tecon", url: "https://www.sepetibatecon.com.br", desc: "Tecon Sepetiba" },
            { title: "SUAPE: Tecon Suape", url: "https://www.teconsuape.com.br", desc: "Terminal de Pernambuco" },
            { title: "PECÉM: Porto do Pecém", url: "https://www.portodopecem.com.br", desc: "Serviços e Janelas" },
            { title: "VITÓRIA: TVV", url: "https://www.tvv.com.br", desc: "Terminal de Vila Velha" },
            { title: "MANAUS: Porto de Manaus", url: "https://www.portodemanaus.com.br", desc: "Logística Fluvial" }
        ]
    },
    {
        category: "AUTORIDADE PORTUÁRIA",
        icon: "fa-anchor",
        items: [
            { title: "PortosRio (CDRJ)", url: "https://www.portosrio.gov.br", desc: "Tarifas, mapas e normas oficiais" }
        ]
    },
    {
        category: "ADUANA E FISCALIZAÇÃO",
        icon: "fa-balance-scale",
        items: [
            { title: "Receita Federal", url: "https://www.gov.br/receitafederal", desc: "Fiscalização e DTA" },
            { title: "ANTAQ", url: "https://www.gov.br/antaq", desc: "Regulação portuária" }
        ]
    },
    {
        category: "TRANSPORTE & DOCS",
        icon: "fa-truck-loading",
        items: [
            { title: "Portal do CTe", url: "https://www.cte.fazenda.gov.br", desc: "Consulta SEFAZ Nacional" },
            { title: "DNIT", url: "https://www.gov.br/dnit", desc: "Condições de rodovias" }
        ]
    },
    {
        category: "FERRAMENTAS INTERNAS",
        icon: "fa-cubes",
        isInternal: true,
        items: [
            { title: "ECO.HUB", url: "INTERNAL:dashboard", desc: "Painel Geral" },
            { title: "ECO.FROTA", url: "INTERNAL:fleet-control", desc: "Gestão de Frota" },
            { title: "ECO.CONTAINER", url: "INTERNAL:container-receipt", desc: "Histórico de Contêiner" },
            { title: "ECO.DOC", url: "INTERNAL:eco-doc", desc: "Documentos e Impressão" },
            { title: "ECO.CHAT", url: "INTERNAL:eco-chat", desc: "Comunicação Operacional" }
        ]
    }
];

const EcoSites: React.FC = () => {
    const { ecoSites, addEcoSite, deleteEcoSite, logAction, setActiveTab } = useAppStore();
    const [lastOpened, setLastOpened] = useState<{title: string, url: string} | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newSiteTitle, setNewSiteTitle] = useState('');
    const [newSiteUrl, setNewSiteUrl] = useState('');

    const handleLinkClick = (url: string, title: string) => {
        if (url.startsWith('INTERNAL:')) {
            const tabId = url.split(':')[1] as TabId;
            setActiveTab(tabId);
            logAction(`ECO.SITES: Navegação interna para ${title}`);
        } else {
            window.open(url, '_blank');
            setLastOpened({ title, url });
            logAction(`ECO.SITES: Aberto externamente ${title}`);
        }
    };

    const handleAddSite = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSiteTitle.trim() || !newSiteUrl.trim()) return;
        let formattedUrl = newSiteUrl.trim();
        if (!/^https?:\/\//i.test(formattedUrl)) formattedUrl = 'https://' + formattedUrl;
        addEcoSite({ title: newSiteTitle, url: formattedUrl });
        setIsModalOpen(false);
        setNewSiteTitle('');
        setNewSiteUrl('');
    };

    const handleDeleteSite = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm("Deseja remover este atalho?")) {
            deleteEcoSite(id);
        }
    };

    return (
        <div className="flex h-full bg-[#05070a] overflow-hidden animate-fade-in border-t border-border-color/20">
            <aside className="w-80 bg-bg-card/40 border-r border-border-color/30 flex flex-col shrink-0 backdrop-blur-md h-[calc(100vh-80px)]">
                <div className="p-5 border-b border-border-color/20 bg-bg-main/50">
                    <h2 className="text-sm font-black text-light uppercase tracking-widest flex items-center gap-2">
                        <i className="fas fa-book-reader text-primary"></i> Guia Operacional
                    </h2>
                    <p className="text-[10px] text-gray-500 mt-1">Links Externos & Ferramentas</p>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-6">
                    {OPERATIONAL_GUIDE.map((section, idx) => (
                        <div key={idx}>
                            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-3 px-2 flex items-center gap-2">
                                <i className={`fas ${section.icon} text-secondary`}></i> {section.category}
                            </h3>
                            <div className="space-y-1">
                                {section.items.map((item, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleLinkClick(item.url, item.title)}
                                        className="w-full text-left px-4 py-3 rounded-lg transition-all group relative border border-transparent hover:bg-white/5 text-gray-400 hover:text-light"
                                    >
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-bold">{item.title}</span>
                                            <i className={`fas ${section.category.includes('AGENDAMENTO') ? 'fa-calendar-check' : 'fa-external-link-alt'} text-[10px] opacity-0 group-hover:opacity-100 transition-opacity text-primary`}></i>
                                        </div>
                                        <p className="text-[9px] text-gray-600 mt-0.5 font-medium group-hover:text-gray-500 transition-colors">{item.desc}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </aside>

            <div className="flex-1 flex flex-col min-w-0 bg-black relative p-8 overflow-y-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-black text-light uppercase tracking-tight">Terminal de Acesso</h1>
                        <p className="text-sm text-gray-500">Gerencie seus atalhos rápidos para sites de logística.</p>
                    </div>
                    <button onClick={() => setIsModalOpen(true)} className="bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg flex items-center gap-2">
                        <i className="fas fa-plus"></i> Novo Atalho
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-10">
                    {ecoSites.map(site => (
                        <div key={site.id} onClick={() => handleLinkClick(site.url, site.title)} className="bg-bg-card border border-border-color p-5 rounded-2xl cursor-pointer hover:border-primary/50 hover:bg-bg-card/80 transition-all group relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                <button onClick={(e) => handleDeleteSite(site.id, e)} className="text-gray-500 hover:text-danger p-1"><i className="fas fa-trash"></i></button>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-bg-main flex items-center justify-center text-light mb-4 text-xl shadow-inner border border-border-color">
                                <i className="fas fa-globe"></i>
                            </div>
                            <h3 className="font-bold text-light text-sm truncate">{site.title}</h3>
                            <p className="text-[10px] text-gray-500 truncate mt-1">{site.url}</p>
                            <div className="mt-4 pt-3 border-t border-border-color/30 flex justify-between items-center">
                                <span className="text-[9px] font-black text-secondary uppercase">Personalizado</span>
                                <i className="fas fa-external-link-alt text-[10px] text-gray-600"></i>
                            </div>
                        </div>
                    ))}
                </div>
                {lastOpened && (
                    <div className="mt-auto bg-bg-card/50 border border-border-color/50 rounded-2xl p-6 flex items-center justify-between animate-slide-up backdrop-blur-sm">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-success/20 rounded-full flex items-center justify-center text-success animate-pulse"><i className="fas fa-check"></i></div>
                            <div>
                                <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Último Acesso</p>
                                <h3 className="text-lg font-bold text-light">{lastOpened.title}</h3>
                                <p className="text-xs text-secondary truncate max-w-md">{lastOpened.url}</p>
                            </div>
                        </div>
                        <button onClick={() => handleLinkClick(lastOpened.url, lastOpened.title)} className="px-6 py-2 bg-bg-main border border-border-color rounded-lg text-xs font-bold text-gray-300 hover:text-white hover:border-light transition-all">REABRIR</button>
                    </div>
                )}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[5000] backdrop-blur-sm p-6" onClick={() => setIsModalOpen(false)}>
                    <div className="bg-bg-card p-8 rounded-2xl shadow-2xl w-full max-w-md border border-border-color" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-black text-light tracking-tight mb-1">Novo Atalho</h3>
                        <p className="text-xs text-gray-500 mb-6">Adicione um site frequente ao seu painel.</p>
                        <form onSubmit={handleAddSite} className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-wider text-gray-500 ml-1">Nome</label>
                                <input type="text" value={newSiteTitle} onChange={e => setNewSiteTitle(e.target.value)} className="w-full bg-bg-main border border-white/10 rounded-xl p-3 text-light outline-none focus:border-primary transition-all text-sm mt-1" placeholder="Ex: Rastreamento Maersk" required />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-wider text-gray-500 ml-1">URL</label>
                                <input type="text" value={newSiteUrl} onChange={e => setNewSiteUrl(e.target.value)} className="w-full bg-bg-main border border-white/10 rounded-xl p-3 text-light outline-none focus:border-primary transition-all text-sm mt-1" placeholder="www.exemplo.com" required />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-xs font-bold uppercase text-gray-500 hover:text-light hover:bg-bg-main rounded-xl transition-all">Cancelar</button>
                                <button type="submit" className="flex-1 py-3 bg-primary text-white font-bold uppercase text-xs rounded-xl hover:opacity-90 shadow-lg">Adicionar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EcoSites;

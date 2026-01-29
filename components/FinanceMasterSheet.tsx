
import React, { useState } from 'react';
import FinancialEntries from './FinancialEntries';
import Transactions from './Transactions';
import FaturamentoReceita from './FaturamentoReceita';
import CustosFixos from './CustosFixos';
import CustosVariaveis from './CustosVariaveis';
import EcoClientes from './EcoClientes';

type FinanceTab = 'entries' | 'transactions' | 'revenue' | 'fixed' | 'variable' | 'clients';

const FinanceMasterSheet: React.FC = () => {
    const [activeTab, setActiveTab] = useState<FinanceTab>('entries');

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="flex flex-col h-[calc(100vh-120px)] animate-fade-in">
            {/* Header / Tab Navigation */}
            <div className="bg-bg-card border-b border-border-color p-4 flex flex-col md:flex-row justify-between items-center gap-4 rounded-t-2xl shadow-md">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary border border-primary/20 shadow-inner">
                        <i className="fas fa-wallet text-2xl"></i>
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-light uppercase tracking-tighter">Planilha Modular Financeira</h2>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Hub Integrado de Gestão</p>
                    </div>
                </div>

                <div className="flex bg-bg-main p-1 rounded-xl border border-white/5 overflow-x-auto max-w-full no-scrollbar">
                    {[
                        { id: 'entries', label: 'Lançamentos', icon: 'fa-plus-circle' },
                        { id: 'transactions', label: 'Transações', icon: 'fa-exchange-alt' },
                        { id: 'revenue', label: 'Faturamento', icon: 'fa-file-invoice-dollar' },
                        { id: 'fixed', label: 'Custos Fixos', icon: 'fa-building' },
                        { id: 'variable', label: 'Custos Variáveis', icon: 'fa-chart-pie' },
                        { id: 'clients', label: 'Eco.Clientes', icon: 'fa-users' },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as FinanceTab)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                                activeTab === tab.id 
                                    ? 'bg-primary text-black shadow-lg shadow-primary/20 scale-105' 
                                    : 'text-gray-500 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            <i className={`fas ${tab.icon} ${activeTab === tab.id ? 'text-black' : 'text-gray-400'}`}></i>
                            {tab.label}
                        </button>
                    ))}
                </div>

                <button 
                    onClick={handlePrint}
                    className="px-5 py-2.5 bg-secondary/10 text-secondary border border-secondary/30 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-secondary hover:text-white transition-all shadow-lg flex items-center gap-2"
                >
                    <i className="fas fa-print"></i> Relatório
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 bg-bg-card/50 rounded-b-2xl border-x border-b border-border-color p-6 overflow-y-auto custom-scrollbar relative">
                <div className="max-w-[1800px] mx-auto">
                    {activeTab === 'entries' && (
                        <div className="animate-slide-up">
                            <FinancialEntries />
                        </div>
                    )}
                    {activeTab === 'transactions' && (
                        <div className="animate-slide-up">
                            <Transactions />
                        </div>
                    )}
                    {activeTab === 'revenue' && (
                        <div className="animate-slide-up">
                            <FaturamentoReceita />
                        </div>
                    )}
                    {activeTab === 'fixed' && (
                        <div className="animate-slide-up">
                            <CustosFixos />
                        </div>
                    )}
                    {activeTab === 'variable' && (
                        <div className="animate-slide-up">
                            <CustosVariaveis />
                        </div>
                    )}
                    {activeTab === 'clients' && (
                        <div className="animate-slide-up">
                            <EcoClientes />
                        </div>
                    )}
                </div>
            </div>
            
            <style>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .custom-scrollbar, .custom-scrollbar * {
                        visibility: visible;
                    }
                    .custom-scrollbar {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        height: 100%;
                        overflow: visible;
                    }
                }
            `}</style>
        </div>
    );
};

export default FinanceMasterSheet;

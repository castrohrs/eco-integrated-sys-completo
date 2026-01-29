
import React, { useState } from 'react';
import { useAppStore } from '../hooks/useAppStore';

const Mind7FloatingWindow: React.FC = () => {
    const { activeTab, isSidebarPinned } = useAppStore();
    const [isHovered, setIsHovered] = useState(false);

    const getHelpContent = () => {
        // Mock contextual help based on activeTab
        switch(activeTab) {
            case 'eco-clientes':
                return {
                    title: "ECO.CLIENTES COMERCIAL",
                    desc: "Gestão completa de contratos, serviços e CRM financeiro. Visualize o status de pagamentos e histórico de serviços por cliente."
                };
            case 'freight-sheet':
                return {
                    title: "PLANILHA DE FRETES",
                    desc: "Controle central de operações de transporte. Arraste cards no modo Kanban para atualizar status ou use a tabela para edição em massa."
                };
            case 'eco-doc':
                return {
                    title: "CENTRO DE DOCUMENTAÇÃO",
                    desc: "Gere recibos, DACTEs e documentos oficiais prontos para impressão. Os dados são preenchidos automaticamente se selecionada uma origem."
                };
            default:
                return {
                    title: "O QUE É O ECO.LOG?",
                    desc: "MIND7 transforma conversas em decisões operacionais. Plataforma de inteligência logística com arquitetura em nuvem e governança por setor."
                };
        }
    };

    const content = getHelpContent();

    const handleExplainScreen = () => {
        alert("🤖 ECO.AI: Analisando tela atual para gerar explicação contextual detalhada... (Funcionalidade em Breve)");
    };

    return (
        <div 
            className="fixed bottom-6 right-6 z-[9999]"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Hover Panel */}
            <div 
                className={`absolute bottom-16 right-0 w-[320px] bg-[#0a0f14]/95 backdrop-blur-xl border border-border-color rounded-xl p-5 shadow-2xl transition-all duration-300 transform origin-bottom-right ${isHovered ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95 pointer-events-none'}`}
            >
                <div className="flex items-center gap-3 mb-3 border-b border-white/10 pb-3">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-black font-bold text-xs">
                        <i className="fas fa-info"></i>
                    </div>
                    <h4 className="text-xs font-black text-white uppercase tracking-widest">{content.title}</h4>
                </div>

                <p className="text-xs text-gray-300 leading-relaxed font-medium">
                    {content.desc}
                </p>

                <ul className="mt-4 space-y-2 text-[10px] text-gray-400 border-l-2 border-primary/30 pl-3">
                    <li>• Arquitetura em nuvem</li>
                    <li>• Multiplataforma</li>
                    <li>• Dados viram inteligência</li>
                </ul>

                <div className="mt-5 pt-3 border-t border-white/10 flex justify-between items-center">
                    <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">
                        Ajuda Institucional • MIND7
                    </span>
                    <button 
                        onClick={handleExplainScreen}
                        className="bg-secondary/20 hover:bg-secondary text-secondary hover:text-white px-3 py-1 rounded text-[9px] font-bold uppercase transition-colors flex items-center gap-1"
                    >
                        <i className="fas fa-robot"></i> ECO.AI
                    </button>
                </div>
            </div>

            {/* Floating Icon */}
            <div className={`w-12 h-12 rounded-full bg-primary text-black font-bold flex items-center justify-center shadow-[0_0_20px_rgba(var(--color-primary-val),0.4)] cursor-pointer transition-all duration-300 ${isHovered ? 'scale-110 rotate-180' : 'scale-100'}`}>
                {isHovered ? <i className="fas fa-times text-lg"></i> : <span className="text-lg font-serif italic">i</span>}
            </div>
        </div>
    );
};

export default Mind7FloatingWindow;

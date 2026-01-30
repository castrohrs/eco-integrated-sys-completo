
import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../hooks/useAppStore';
import { useAuth } from '../hooks/useAuth';

const OFFICIAL_CONTACT = "+552125941889"; // Número unificado Fixo/Móvel
const OFFICIAL_EMAIL = "contato@imperiolog.com.br";

const ChatWidget: React.FC = () => {
    const { setActiveFloatingTool, logAction } = useAppStore();
    const { currentUser } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleAction = (type: 'email' | 'sms' | 'whatsapp' | 'note' | 'comment' | 'restart') => {
        logAction(`MOBILE_HUB: Executando ação ${type.toUpperCase()}`);
        
        switch(type) {
            case 'email':
                window.location.href = `mailto:${OFFICIAL_EMAIL}?subject=Solicitação Operacional - ${currentUser?.name}`;
                break;
            case 'sms':
                window.location.href = `sms:${OFFICIAL_CONTACT}?body=EcoLog: Solicitação de suporte prioritário.`;
                break;
            case 'whatsapp':
                window.open(`https://wa.me/${OFFICIAL_CONTACT.replace('+', '')}`, '_blank');
                break;
            case 'note':
                setActiveFloatingTool('notes');
                setIsOpen(false);
                break;
            case 'comment':
                setActiveFloatingTool('chat');
                setIsOpen(false);
                break;
            case 'restart':
                if(confirm("Deseja reinicializar o núcleo do sistema? Todas as sessões locais serão atualizadas.")) {
                    window.location.reload();
                }
                break;
        }
    };

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div ref={containerRef} className="fixed bottom-6 right-6 z-[5000] font-sans">
            {/* HUB MENU */}
            {isOpen && (
                <div className="absolute bottom-20 right-0 w-[300px] bg-[#0a0c10]/95 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.8)] overflow-hidden animate-slide-up origin-bottom-right ring-1 ring-white/5">
                    <header className="p-6 bg-gradient-to-r from-primary/10 to-secondary/10 border-b border-white/5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary shadow-inner">
                                <i className="fas fa-crown"></i>
                            </div>
                            <div>
                                <h3 className="text-xs font-black text-white uppercase tracking-widest">Comando Móvel</h3>
                                <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest mt-1">Sessão: {currentUser?.name}</p>
                            </div>
                        </div>
                    </header>

                    <div className="p-4 grid grid-cols-1 gap-2">
                        {[
                            { id: 'whatsapp', label: 'WhatsApp Direto', icon: 'fab fa-whatsapp', color: 'text-green-500', bg: 'bg-green-500/10' },
                            { id: 'sms', label: 'Enviar Mensagem SMS', icon: 'fas fa-sms', color: 'text-blue-400', bg: 'bg-blue-400/10' },
                            { id: 'email', label: 'Canal de E-mail', icon: 'fas fa-envelope', color: 'text-secondary', bg: 'bg-secondary/10' },
                            { id: 'note', label: 'Anotar Agora', icon: 'fas fa-pen-nib', color: 'text-warning', bg: 'bg-warning/10' },
                            { id: 'comment', label: 'Deixar Comentário', icon: 'fas fa-comment-dots', color: 'text-primary', bg: 'bg-primary/10' },
                        ].map(item => (
                            <button 
                                key={item.id}
                                onClick={() => handleAction(item.id as any)}
                                className="w-full flex items-center gap-4 p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/10 transition-all group"
                            >
                                <div className={`w-9 h-9 rounded-lg ${item.bg} flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform`}>
                                    <i className={item.icon}></i>
                                </div>
                                <span className="text-[10px] font-black uppercase text-gray-300 tracking-wider group-hover:text-white">{item.label}</span>
                            </button>
                        ))}

                        <div className="h-px bg-white/5 my-2"></div>

                        <button 
                            onClick={() => handleAction('restart')}
                            className="w-full flex items-center gap-4 p-3 rounded-2xl bg-danger/5 hover:bg-danger/20 border border-danger/10 transition-all group"
                        >
                            <div className="w-9 h-9 rounded-lg bg-danger/20 flex items-center justify-center text-danger group-hover:rotate-180 transition-all duration-500">
                                <i className="fas fa-sync-alt"></i>
                            </div>
                            <span className="text-[10px] font-black uppercase text-danger tracking-widest">Reiniciar Sistema</span>
                        </button>
                    </div>

                    <footer className="p-4 bg-black/20 text-center">
                        <p className="text-[8px] font-black text-gray-600 uppercase tracking-[0.4em]">Protocolo Seguro MIND7</p>
                    </footer>
                </div>
            )}

            {/* FLOATING ACTION BUTTON (FAB) */}
            <button 
                onClick={() => setIsOpen(!isOpen)} 
                className={`relative w-16 h-16 rounded-full shadow-[0_15px_40px_rgba(0,0,0,0.4)] flex items-center justify-center transition-all duration-500 active:scale-90 ${isOpen ? 'bg-danger rotate-90' : 'bg-primary hover:scale-110'}`}
            >
                {isOpen ? (
                    <i className="fas fa-times text-white text-xl"></i>
                ) : (
                    <div className="relative">
                        {/* A Coroa 👑 */}
                        <i className="fas fa-crown text-yellow-500 text-[10px] absolute -top-4 left-1/2 -translate-x-1/2 animate-bounce drop-shadow-[0_0_5px_rgba(234,179,8,0.8)]"></i>
                        {/* O Celular 📱 */}
                        <i className="fas fa-mobile-screen-button text-white text-2xl drop-shadow-[0_5px_10px_rgba(0,0,0,0.3)]"></i>
                    </div>
                )}
                
                {!isOpen && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-secondary rounded-full border-2 border-bg-main animate-pulse"></span>
                )}
            </button>
            
            <style>{`
                @keyframes slide-up {
                    from { opacity: 0; transform: translateY(20px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                .animate-slide-up { animation: slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
            `}</style>
        </div>
    );
};

export default ChatWidget;

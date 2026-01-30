
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useAppStore } from '../hooks/useAppStore';

interface ChatMessage {
    id: string;
    text: string;
    senderId: string;
    senderName: string;
    timestamp: string;
}

const FloatingInternalChat: React.FC = () => {
    const { currentUser } = useAuth();
    const { addNotification } = useAppStore();
    
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [unreadCount, setUnreadCount] = useState(0);
    
    // Mobility States
    const [iconPos, setIconPos] = useState({ x: window.innerWidth - 80, y: window.innerHeight - 80 });
    const [panelPos, setPanelPos] = useState({ x: window.innerWidth - 400, y: window.innerHeight - 650 });
    const [isDraggingIcon, setIsDraggingIcon] = useState(false);
    const [isDraggingPanel, setIsDraggingPanel] = useState(false);
    const dragOffset = useRef({ x: 0, y: 0 });

    const scrollRef = useRef<HTMLDivElement>(null);
    const socketRef = useRef<any>(null);

    // Simulação de conexão Socket.IO (Em produção: import { io } from 'socket.io-client')
    useEffect(() => {
        // Simulando recebimento de mensagem para demonstração de UI
        const demoInterval = setInterval(() => {
            if (!isOpen && Math.random() > 0.8) {
                setUnreadCount(prev => prev + 1);
            }
        }, 15000);

        return () => clearInterval(demoInterval);
    }, [isOpen]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    const handleSendMessage = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!inputValue.trim()) return;

        const msg: ChatMessage = {
            id: Date.now().toString(),
            text: inputValue,
            senderId: currentUser?.id || 'unknown',
            senderName: currentUser?.name || 'Anônimo',
            timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, msg]);
        setInputValue('');
        
        // Simular resposta automática se for a primeira mensagem
        if (messages.length === 0) {
            setTimeout(() => {
                const reply: ChatMessage = {
                    id: 'reply-1',
                    text: 'Mensagem recebida pelo canal interno. Operação em escuta.',
                    senderId: 'system',
                    senderName: 'Central EcoLog',
                    timestamp: new Date().toISOString()
                };
                setMessages(prev => [...prev, reply]);
                if (!isOpen) setUnreadCount(c => c + 1);
            }, 1000);
        }
    };

    // Drag Logic for Icon
    const startIconDrag = (e: React.MouseEvent) => {
        setIsDraggingIcon(true);
        dragOffset.current = { x: e.clientX - iconPos.x, y: e.clientY - iconPos.y };
    };

    // Drag Logic for Panel
    const startPanelDrag = (e: React.MouseEvent) => {
        if ((e.target as HTMLElement).closest('.drag-handle')) {
            setIsDraggingPanel(true);
            dragOffset.current = { x: e.clientX - panelPos.x, y: e.clientY - panelPos.y };
        }
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDraggingIcon) {
                setIconPos({ x: e.clientX - dragOffset.current.x, y: e.clientY - dragOffset.current.y });
            }
            if (isDraggingPanel) {
                setPanelPos({ x: e.clientX - dragOffset.current.x, y: e.clientY - dragOffset.current.y });
            }
        };

        const handleMouseUp = () => {
            setIsDraggingIcon(false);
            setIsDraggingPanel(false);
        };

        if (isDraggingIcon || isDraggingPanel) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDraggingIcon, isDraggingPanel]);

    const toggleChat = () => {
        setIsOpen(!isOpen);
        if (!isOpen) setUnreadCount(0);
    };

    return (
        <>
            {/* Ícone Flutuante */}
            <div 
                className={`fixed z-[3000] cursor-grab active:cursor-grabbing transition-transform hover:scale-110 ${isDraggingIcon ? 'scale-110' : ''}`}
                style={{ left: iconPos.x, top: iconPos.y }}
                onMouseDown={startIconDrag}
                onClick={(e) => { if (!isDraggingIcon) toggleChat(); }}
            >
                <div className="relative w-14 h-14 bg-gradient-to-br from-primary to-secondary rounded-2xl shadow-[0_8px_25px_rgba(var(--color-primary-val),0.4)] flex items-center justify-center border border-white/20">
                    <i className={`fas ${isOpen ? 'fa-times' : 'fa-comments'} text-white text-xl`}></i>
                    {unreadCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-danger text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-bg-main animate-bounce">
                            {unreadCount}
                        </span>
                    )}
                </div>
            </div>

            {/* Painel de Chat */}
            {isOpen && (
                <div 
                    className="fixed z-[2999] w-[360px] h-[550px] bg-bg-card/95 backdrop-blur-xl border border-white/10 rounded-3xl shadow-[0_30px_90px_rgba(0,0,0,0.6)] flex flex-col overflow-hidden animate-fade-in-up"
                    style={{ left: panelPos.x, top: panelPos.y }}
                >
                    {/* Header - Drag Handle */}
                    <div 
                        className="drag-handle p-4 bg-white/5 border-b border-white/10 flex items-center justify-between cursor-move"
                        onMouseDown={startPanelDrag}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30">
                                <i className="fas fa-users text-primary"></i>
                            </div>
                            <div>
                                <h3 className="text-xs font-black text-light uppercase tracking-widest">Chat Interno</h3>
                                <div className="flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse"></span>
                                    <span className="text-[9px] text-gray-400 font-bold uppercase">Canal Operacional</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => setIsOpen(false)} className="w-8 h-8 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all">
                                <i className="fas fa-minus"></i>
                            </button>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div 
                        ref={scrollRef}
                        className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-gradient-to-b from-transparent to-black/20"
                    >
                        {messages.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-center px-6 opacity-30">
                                <i className="fas fa-shield-alt text-4xl mb-4"></i>
                                <p className="text-xs font-bold uppercase tracking-widest leading-relaxed">
                                    Início da comunicação segura<br/>Setor: {currentUser?.sector}
                                </p>
                            </div>
                        )}
                        {messages.map((msg) => {
                            const isMe = msg.senderId === currentUser?.id;
                            return (
                                <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-slide-up`}>
                                    {!isMe && <span className="text-[9px] font-black text-secondary uppercase ml-2 mb-1">{msg.senderName}</span>}
                                    <div className={`max-w-[85%] p-3 rounded-2xl shadow-sm text-sm ${isMe ? 'bg-primary text-white rounded-tr-none' : 'bg-bg-main border border-white/5 text-gray-200 rounded-tl-none'}`}>
                                        <p className="leading-relaxed">{msg.text}</p>
                                        <div className={`text-[8px] mt-1 font-bold opacity-40 ${isMe ? 'text-right' : 'text-left'}`}>
                                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-black/20 border-t border-white/5">
                        <form onSubmit={handleSendMessage} className="flex items-center gap-2 bg-bg-main/50 border border-white/10 rounded-2xl p-1.5 focus-within:border-primary/50 transition-all shadow-inner">
                            <input 
                                type="text" 
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="Sua mensagem..."
                                className="flex-1 bg-transparent border-none text-xs text-light outline-none px-3"
                            />
                            <button 
                                type="submit"
                                className="w-10 h-10 bg-primary text-white rounded-xl shadow-lg hover:opacity-90 transition-all flex items-center justify-center active:scale-95"
                            >
                                <i className="fas fa-paper-plane text-xs"></i>
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default FloatingInternalChat;

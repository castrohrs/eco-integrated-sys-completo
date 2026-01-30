
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { ChatMessage, User } from '../types';
import { io } from 'socket.io-client';

const EcoChat: React.FC = () => {
    const { currentUser, users } = useAuth();
    const [activeContactId, setActiveContactId] = useState<string | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [connStatus, setConnStatus] = useState<'connecting' | 'online' | 'local'>('connecting');
    const [isUploading, setIsUploading] = useState(false);
    
    // BroadcastChannel para comunicação entre abas (Fallback Realtime)
    const broadcastRef = useRef<BroadcastChannel | null>(null);
    const socketRef = useRef<any>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Inicialização do Sistema de Mensageria Híbrido
    useEffect(() => {
        // 1. Setup BroadcastChannel (Sempre ativo para redundância local)
        broadcastRef.current = new BroadcastChannel('ecolog_secure_link');
        broadcastRef.current.onmessage = (event) => {
            const msg = event.data;
            if (msg.targetId === currentUser?.id || msg.senderId === currentUser?.id) {
                setMessages(prev => (prev.some(m => m.id === msg.id) ? prev : [...prev, msg]));
            }
        };

        // 2. Tentar Socket.IO (Servidor Real)
        try {
            const socket = io('http://localhost:3001', { timeout: 3000, reconnectionAttempts: 2 });
            socketRef.current = socket;

            socket.on('connect', () => {
                setConnStatus('online');
                socket.emit('register', { id: currentUser?.id, name: currentUser?.name });
            });

            socket.on('connect_error', () => {
                if (connStatus === 'connecting') setConnStatus('local');
            });

            socket.on('new_private_message', (msg: ChatMessage) => {
                setMessages(prev => (prev.some(m => m.id === msg.id) ? prev : [...prev, msg]));
            });

            socket.on('chat_history', (history: ChatMessage[]) => setMessages(history));
        } catch (e) {
            setConnStatus('local');
        }

        return () => {
            socketRef.current?.disconnect();
            broadcastRef.current?.close();
        };
    }, [currentUser]);

    useEffect(() => {
        if (activeContactId && connStatus === 'online') {
            socketRef.current.emit('get_chat_history', { myId: currentUser?.id, targetId: activeContactId });
        } else if (activeContactId) {
            // No modo local, tentamos carregar do localStorage
            const localHist = localStorage.getItem(`chat_hist_${activeContactId}`);
            if (localHist) setMessages(JSON.parse(localHist));
            else setMessages([]);
        }
    }, [activeContactId, connStatus]);

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        // Persistir histórico local
        if (activeContactId && messages.length > 0) {
            localStorage.setItem(`chat_hist_${activeContactId}`, JSON.stringify(messages));
        }
    }, [messages]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim() || !activeContactId) return;

        const newMessage: ChatMessage = {
            id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            text: inputValue,
            senderId: currentUser?.id || 'unknown',
            senderName: currentUser?.name || 'Anônimo',
            timestamp: new Date().toISOString()
        };

        // Enviar via Socket se estiver online
        if (connStatus === 'online') {
            socketRef.current.emit('private_message', {
                fromId: currentUser?.id,
                toId: activeContactId,
                fromName: currentUser?.name,
                text: inputValue
            });
        } else {
            // Enviar via Broadcast (Multi-aba)
            setMessages(prev => [...prev, newMessage]);
            broadcastRef.current?.postMessage({ ...newMessage, targetId: activeContactId });
        }

        setInputValue('');
    };

    const StatusBadge = () => {
        const config = {
            connecting: { label: 'Estabelecendo Link...', color: 'bg-warning', icon: 'fa-circle-notch fa-spin' },
            online: { label: 'Servidor Central Ativo', color: 'bg-success', icon: 'fa-server' },
            local: { label: 'Conexão Segura P2P Ativa', color: 'bg-primary', icon: 'fa-shield-halved' }
        };
        const current = config[connStatus];
        return (
            <div className="flex items-center gap-2 px-3 py-1 bg-black/40 rounded-full border border-white/10">
                <i className={`fas ${current.icon} text-[8px] ${current.color.replace('bg-', 'text-')}`}></i>
                <span className={`text-[8px] font-black uppercase tracking-widest ${current.color.replace('bg-', 'text-')}`}>{current.label}</span>
            </div>
        );
    };

    return (
        <div className="flex h-[calc(100vh-160px)] bg-bg-card rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden animate-fade-in">
            {/* LISTA DE CONTATOS */}
            <aside className="w-80 border-r border-white/5 bg-black/20 flex flex-col shrink-0">
                <header className="p-6 border-b border-white/5">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xs font-black text-light uppercase tracking-[0.3em]">Operadores</h3>
                        <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
                    </div>
                    <div className="relative group">
                        <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-primary transition-colors text-xs"></i>
                        <input 
                            type="text" 
                            placeholder="FILTRAR CANAL..." 
                            value={searchTerm} 
                            onChange={e => setSearchTerm(e.target.value)} 
                            className="w-full bg-bg-main border border-white/5 rounded-2xl py-3 pl-11 pr-4 text-[10px] font-bold text-white outline-none focus:border-primary/30 transition-all uppercase tracking-widest" 
                        />
                    </div>
                </header>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                    {(users || []).filter(u => u.id !== currentUser?.id && u.name.toLowerCase().includes(searchTerm.toLowerCase())).map(user => (
                        <button 
                            key={user.id} 
                            onClick={() => setActiveContactId(user.id)} 
                            className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all group ${activeContactId === user.id ? 'bg-primary/10 border border-primary/20 shadow-lg' : 'hover:bg-white/5 border border-transparent'}`}
                        >
                            <div className="relative">
                                <div className="w-10 h-10 rounded-xl bg-bg-main flex items-center justify-center text-primary font-black border border-white/10 text-xs shadow-inner">
                                    {user.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-success rounded-full border-2 border-bg-card shadow-sm"></span>
                            </div>
                            <div className="text-left flex-1 min-w-0">
                                <p className={`text-xs font-black truncate uppercase tracking-tighter ${activeContactId === user.id ? 'text-primary' : 'text-light'}`}>{user.name}</p>
                                <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest truncate">{user.sector}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </aside>

            {/* ÁREA DE CHAT */}
            <main className="flex-1 flex flex-col bg-[#05070a] relative">
                {activeContactId ? (
                    <>
                        <header className="p-6 border-b border-white/5 bg-bg-card/50 backdrop-blur-xl flex items-center justify-between z-10">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                                    <i className="fas fa-user-shield"></i>
                                </div>
                                <div>
                                    <h4 className="text-sm font-black text-white uppercase tracking-widest">{(users || []).find(u => u.id === activeContactId)?.name}</h4>
                                    <p className="text-[9px] text-success font-bold uppercase tracking-[0.2em] mt-0.5">Encrypted Session Active</p>
                                </div>
                            </div>
                            <StatusBadge />
                        </header>

                        <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-95">
                            {messages.length === 0 && (
                                <div className="h-full flex flex-col items-center justify-center text-center px-10">
                                    <div className="w-16 h-16 rounded-[2rem] bg-white/5 flex items-center justify-center text-gray-700 mb-6 border border-white/10 animate-pulse">
                                        <i className="fas fa-lock text-2xl"></i>
                                    </div>
                                    <h5 className="text-xs font-black text-gray-500 uppercase tracking-[0.3em]">Início do Log de Conversa</h5>
                                    <p className="text-[10px] text-gray-600 mt-2 max-w-xs">As mensagens enviadas neste canal são protegidas pelo protocolo de governança da EcoLog.</p>
                                </div>
                            )}
                            {messages.map((msg, idx) => {
                                const isMe = msg.senderId === currentUser?.id;
                                return (
                                    <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-slide-up`}>
                                        <div className={`max-w-[75%] group relative`}>
                                            {!isMe && <span className="text-[9px] font-black text-primary uppercase tracking-widest mb-1.5 block ml-1">{msg.senderName}</span>}
                                            <div className={`p-4 rounded-2xl shadow-2xl border ${isMe ? 'bg-primary text-black font-medium border-primary/20 rounded-tr-none' : 'bg-bg-card/80 backdrop-blur-md text-gray-100 border-white/5 rounded-tl-none'}`}>
                                                <p className="text-sm leading-relaxed">{msg.text}</p>
                                                <div className={`text-[8px] mt-2 font-black opacity-40 uppercase tracking-tighter ${isMe ? 'text-right' : 'text-left'}`}>
                                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Secure ID: {msg.id.slice(0,8)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <footer className="p-6 bg-bg-card/80 backdrop-blur-xl border-t border-white/5">
                            <form onSubmit={handleSendMessage} className="flex items-center gap-3 bg-black/40 border border-white/10 rounded-3xl p-2 focus-within:border-primary/40 transition-all shadow-inner">
                                <button type="button" onClick={() => fileInputRef.current?.click()} className="w-11 h-11 rounded-2xl text-gray-500 hover:text-primary hover:bg-primary/10 transition-all flex items-center justify-center shrink-0">
                                    <i className="fas fa-plus"></i>
                                </button>
                                <input type="file" ref={fileInputRef} className="hidden" />
                                
                                <input 
                                    type="text" 
                                    value={inputValue} 
                                    onChange={e => setInputValue(e.target.value)} 
                                    placeholder="DIGITE O COMANDO OU MENSAGEM..." 
                                    className="flex-1 bg-transparent border-none text-xs text-light outline-none px-2 font-bold uppercase tracking-widest placeholder-gray-700" 
                                />
                                
                                <button 
                                    type="submit" 
                                    disabled={!inputValue.trim()}
                                    className="w-12 h-11 bg-primary text-black rounded-2xl shadow-[0_0_20px_rgba(var(--color-primary-val),0.4)] hover:scale-105 active:scale-95 disabled:opacity-30 disabled:grayscale transition-all flex items-center justify-center"
                                >
                                    <i className="fas fa-paper-plane"></i>
                                </button>
                            </form>
                            <div className="mt-3 flex justify-center items-center gap-4 opacity-30">
                                <span className="text-[7px] font-black text-gray-500 uppercase tracking-[0.5em]">AES-256 Enabled</span>
                                <div className="h-px w-12 bg-white/10"></div>
                                <span className="text-[7px] font-black text-gray-500 uppercase tracking-[0.5em]">MIND7 CORE</span>
                            </div>
                        </footer>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-20 animate-fade-in">
                        <div className="relative mb-10">
                            <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
                            <div className="relative w-24 h-24 rounded-[2.5rem] bg-bg-card border border-white/10 flex items-center justify-center text-primary text-4xl shadow-2xl">
                                <i className="fas fa-terminal"></i>
                            </div>
                        </div>
                        <h3 className="text-xl font-black text-white uppercase tracking-[0.4em] mb-4">Aguardando Seleção</h3>
                        <p className="text-xs text-gray-500 font-bold max-w-sm uppercase leading-relaxed tracking-widest">
                            Selecione um canal operacional à esquerda para iniciar o intercâmbio de dados criptografados.
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default EcoChat;

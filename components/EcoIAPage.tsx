
import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../hooks/useAppStore';
import { TabId } from '../types';
import { GoogleGenAI } from "@google/genai";
import { useAuth } from '../hooks/useAuth';

// @ts-ignore
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;

if (recognition) {
  recognition.continuous = false;
  recognition.lang = 'pt-BR';
}

const COMMAND_MAP: Record<string, TabId> = {
    'painel': 'dashboard', 'frota': 'fleet-control', 'financeiro': 'transactions',
    'lançamento': 'financial-entries', 'mapa': 'freight-quotation', 'checklist': 'port-checklist',
    'configuração': 'user-management', 'manual': 'operational-manual', 'documento': 'eco-doc'
};

interface Message {
    role: 'system' | 'user' | 'ai';
    content: string;
}

const EcoIAPage: React.FC = () => {
    const { setActiveTab, logAction } = useAppStore();
    const { currentUser } = useAuth();
    
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    const WELCOME_MSG = `CONEXÃO ESTABELECIDA. EU SOU O NÚCLEO ECO.IA.

ESTOU MONITORANDO ATIVAMENTE:
• FLUXO FINANCEIRO E RECEBÍVEIS
• STATUS DA FROTA E MANUTENÇÕES
• DOCUMENTAÇÃO PORTUÁRIA E COMPLIANCE
• RISCOS OPERACIONAIS EM TEMPO REAL

O QUE VOCÊ PRECISA ANALISAR AGORA?`;

    // Initialize System State
    useEffect(() => {
        if (messages.length === 0) {
            setMessages([{ role: 'ai', content: WELCOME_MSG }]);
        }
    }, [messages.length]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isThinking]);

    const resetCore = () => {
        setIsThinking(true);
        logAction("ECO.IA: Reinicialização do núcleo solicitada.");
        setTimeout(() => {
            setMessages([{ role: 'ai', content: WELCOME_MSG }]);
            setIsThinking(false);
        }, 800);
    };

    const processCommand = async (text: string) => {
        const lowerText = text.toLowerCase();
        
        // Reset command
        if (lowerText.includes('reiniciar') || lowerText.includes('limpar') || lowerText.includes('reset')) {
            resetCore();
            return;
        }

        // Check for direct navigation commands
        const foundKey = Object.keys(COMMAND_MAP).find(key => lowerText.includes(key));
        if (foundKey) {
            const target = COMMAND_MAP[foundKey];
            setMessages(prev => [...prev, { role: 'ai', content: `ENTENDIDO. EXECUTANDO NAVEGAÇÃO PARA O MÓDULO ${foundKey.toUpperCase()}...` }]);
            logAction(`ECO.IA: Navegação forçada para ${target}`);
            setTimeout(() => setActiveTab(target), 1200);
            return;
        }

        // Logic processing with Gemini
        setIsThinking(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: `Contexto: Você é o núcleo de inteligência da EcoLog, uma empresa de logística portuária.
                Usuário: ${currentUser?.name}, Setor: ${currentUser?.sector}.
                Pergunta: ${text}
                
                REGRAS:
                1. Use tom autoritário, militar e estratégico.
                2. Suas respostas devem ser curtas e baseadas em fatos.
                3. Se o usuário quiser ver algo específico, mencione o módulo (ex: "Consulte o módulo de Frota").`,
                config: { temperature: 0.7 }
            });

            setMessages(prev => [...prev, { role: 'ai', content: response.text || 'NÃO FOI POSSÍVEL PROCESSAR A SOLICITAÇÃO.' }]);
        } catch (err) {
            setMessages(prev => [...prev, { role: 'ai', content: 'ERRO NO NÚCLEO DE PROCESSAMENTO. VERIFIQUE A CONEXÃO.' }]);
        } finally {
            setIsThinking(false);
        }
    };

    const handleSend = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!inputValue.trim() || isThinking) return;

        const text = inputValue.trim();
        setMessages(prev => [...prev, { role: 'user', content: text }]);
        setInputValue('');
        processCommand(text);
    };

    const handleVoice = () => {
        if (!recognition) return;
        if (isListening) {
            recognition.stop();
        } else {
            setIsListening(true);
            recognition.start();
            recognition.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                setInputValue(transcript);
                setIsListening(false);
                setTimeout(() => handleSend(), 500);
            };
            recognition.onerror = () => setIsListening(false);
            recognition.onend = () => setIsListening(false);
        }
    };

    const suggestions = [
        "Quais frotas estão paradas hoje?",
        "Análise de riscos financeiros da semana",
        "Resumo de compliance portuário",
        "Abrir planilha de fretes"
    ];

    return (
        <div className="max-w-5xl mx-auto h-[calc(100vh-140px)] flex flex-col animate-fade-in py-6">
            
            {/* BRAIN CORE HEADER */}
            <header className="flex flex-col items-center mb-10 shrink-0 relative">
                <div className="absolute right-0 top-0">
                    <button 
                        onClick={resetCore}
                        className="group flex items-center gap-2 px-4 py-2 bg-bg-main border border-white/10 rounded-xl text-gray-500 hover:text-danger hover:border-danger/30 transition-all shadow-lg"
                        title="Reiniciar Núcleo IA"
                    >
                        <i className={`fas fa-sync-alt text-xs ${isThinking ? 'fa-spin' : ''}`}></i>
                        <span className="text-[9px] font-black uppercase tracking-widest">Reiniciar Ciclo</span>
                    </button>
                </div>

                <div className="relative inline-block mb-6">
                    <div className={`absolute inset-0 bg-primary/20 rounded-full blur-3xl transition-all duration-1000 ${isThinking ? 'scale-150 opacity-100' : 'scale-100 opacity-40'}`}></div>
                    <div className={`relative w-24 h-24 bg-bg-card border-2 rounded-[2.5rem] flex items-center justify-center shadow-2xl transition-all duration-500 ${isThinking ? 'border-primary shadow-primary/40' : 'border-white/10'}`}>
                        <i className={`fas fa-brain text-4xl ${isThinking ? 'text-primary animate-pulse' : 'text-gray-600'}`}></i>
                    </div>
                </div>
                <h1 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">
                    ECO.<span className="text-[#e10600]">IA</span> STRATEGIC CORE
                </h1>
                <div className="flex items-center justify-center gap-2 mt-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse"></span>
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">Integrated Operational Logic</span>
                </div>
            </header>

            {/* CHAT INTERFACE */}
            <main className="flex-1 bg-bg-card/40 backdrop-blur-xl border border-white/5 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col min-h-0">
                
                {/* Scrollable History */}
                <div className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
                            <div className={`max-w-[80%] ${msg.role === 'user' ? 'bg-primary text-white rounded-2xl rounded-tr-none p-4 shadow-lg' : 'space-y-4'}`}>
                                {msg.role !== 'user' && (
                                    <span className="text-[9px] font-black text-primary uppercase tracking-[0.3em] block mb-2">System Response:</span>
                                )}
                                <p className={`text-sm md:text-base font-medium leading-relaxed whitespace-pre-wrap ${msg.role === 'user' ? '' : 'text-gray-200'}`}>
                                    {msg.content}
                                </p>
                            </div>
                        </div>
                    ))}
                    {isThinking && (
                        <div className="flex justify-start animate-pulse">
                            <div className="space-y-2">
                                <span className="text-[9px] font-black text-gray-500 uppercase tracking-[0.3em]">Cérebro processando...</span>
                                <div className="flex gap-1">
                                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"></div>
                                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>

                {/* Input Controls */}
                <footer className="p-8 border-t border-white/5 bg-black/20">
                    
                    {/* Contextual Suggestions */}
                    <div className="flex flex-wrap gap-2 mb-6">
                        {suggestions.map((s, i) => (
                            <button 
                                key={i} 
                                onClick={() => { setInputValue(s); }}
                                className="px-4 py-2 bg-bg-main/50 border border-white/5 rounded-full text-[10px] font-bold text-gray-500 hover:text-primary hover:border-primary transition-all uppercase tracking-widest"
                            >
                                {s}
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleSend} className="relative flex items-center gap-4">
                        <div className="relative flex-1 group">
                            <input 
                                type="text"
                                value={inputValue}
                                onChange={e => setInputValue(e.target.value)}
                                placeholder="Insira comando estratégico ou dúvida operacional..."
                                className="w-full bg-bg-main border border-white/10 rounded-2xl py-5 pl-8 pr-20 text-sm text-light focus:border-primary/50 outline-none transition-all shadow-inner group-hover:border-white/20 uppercase font-medium tracking-wide"
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-3">
                                <button 
                                    type="button"
                                    onClick={handleVoice}
                                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isListening ? 'bg-danger text-white shadow-xl shadow-danger/20 animate-pulse' : 'text-gray-500 hover:text-primary hover:bg-primary/10'}`}
                                    title="Entrada de Voz"
                                >
                                    <i className="fas fa-microphone"></i>
                                </button>
                            </div>
                        </div>
                        <button 
                            type="submit"
                            disabled={!inputValue.trim() || isThinking}
                            className="w-16 h-16 bg-primary text-white rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 disabled:opacity-30 disabled:grayscale transition-all"
                        >
                            <i className="fas fa-paper-plane text-xl"></i>
                        </button>
                    </form>
                    
                    <div className="mt-4 text-center">
                        <p className="text-[9px] font-black text-gray-600 uppercase tracking-[0.5em]">EcoLog Cognition Module • Secure Auth Layer</p>
                    </div>
                </footer>
            </main>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 5px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(var(--color-primary-val), 0.2); border-radius: 10px; }
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up { animation: fade-in-up 0.4s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default EcoIAPage;

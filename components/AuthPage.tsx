
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import MobileMockup from './MobileMockup';

const AuthPage: React.FC = () => {
    const { login } = useAuth();
    const { t } = useLanguage();
    
    // States
    const [inputValue, setInputValue] = useState('');
    const [error, setError] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    
    // Intro State
    const [showIntro, setShowIntro] = useState(true);
    const [introFading, setIntroFading] = useState(false);

    // Simula o foco no input ao carregar
    useEffect(() => {
        const input = document.getElementById('hidden-auth-input');
        if(input && !showIntro) input.focus();
    }, [showIntro]);

    // Timer da Intro
    useEffect(() => {
        const timer = setTimeout(() => {
            handleDismissIntro();
        }, 5000); // 5 Segundos
        return () => clearTimeout(timer);
    }, []);

    const handleDismissIntro = () => {
        setIntroFading(true);
        setTimeout(() => {
            setShowIntro(false);
            const input = document.getElementById('hidden-auth-input');
            if(input) input.focus();
        }, 1000); // Tempo da transição CSS
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (inputValue.length < 1) return;
        
        setError('');
        setIsVerifying(true);
        
        // Simulação de delay de segurança/biometria conforme o vídeo
        setTimeout(async () => {
            const success = await login(inputValue);
            if (!success) {
                setError('ACESSO NEGADO: CREDENCIAIS INVÁLIDAS');
                setIsVerifying(false);
                setInputValue('');
            }
        }, 1500);
    };

    // Renderiza as bolinhas do PIN conforme digitado
    const renderPinDots = () => {
        const dots = [];
        for (let i = 0; i < 4; i++) {
            dots.push(
                <div 
                    key={i} 
                    className={`w-4 h-4 rounded-full transition-all duration-300 shadow-[0_2px_5px_rgba(0,0,0,0.5)] border border-white/10 ${
                        inputValue.length > i 
                        ? 'bg-emerald-400 shadow-[0_0_15px_#34d399] scale-110' 
                        : 'bg-white/20 backdrop-blur-sm'
                    }`}
                ></div>
            );
        }
        return dots;
    };
    
    return (
        <div className="min-h-screen w-full relative flex items-center justify-center overflow-hidden bg-[#020405] selection:bg-emerald-500/30">
            
            {/* --- INTRO SPLASH SCREEN (5 SEGUNDOS) --- */}
            {showIntro && (
                <div className={`fixed inset-0 z-[100] flex items-center justify-center bg-black transition-opacity duration-1000 ${introFading ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                    
                    {/* Imagem Épica de Fundo (LOCAL) */}
                    <div className="absolute inset-0 z-0">
                        <img 
                            src="/intro-bg.jpg" 
                            className="w-full h-full object-cover opacity-80 animate-slow-zoom"
                            alt="Background Intro"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent"></div>
                    </div>

                    <div className="relative z-10 w-full max-w-7xl px-8 lg:px-16 flex flex-col justify-center h-full">
                        <div className="max-w-2xl space-y-8 animate-slide-in-left">
                            
                            <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center border border-emerald-500/50 mb-6 shadow-[0_0_30px_rgba(16,185,129,0.3)] backdrop-blur-md">
                                <i className="fas fa-leaf text-3xl text-emerald-400 drop-shadow-[0_2px_5px_rgba(0,0,0,0.5)]"></i>
                            </div>

                            <h1 className="text-7xl lg:text-9xl font-black text-slate-100 tracking-tighter leading-none drop-shadow-[0_5px_10px_rgba(0,0,0,0.8)]">
                                EcoLog<br/>
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 filter drop-shadow-md">Enterprise</span>
                            </h1>

                            <p className="text-xl text-gray-200 font-medium max-w-lg border-l-4 border-emerald-500 pl-6 leading-relaxed drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                                O sistema inteligente de gestão portuária e logística para operações de alta performance.
                            </p>

                            <div className="flex gap-4 pt-4">
                                <span className="px-4 py-2 border border-white/20 rounded-full text-xs font-black text-white uppercase tracking-widest bg-white/5 backdrop-blur-md shadow-lg">v5.2 | Seguro</span>
                                <span className="px-4 py-2 border border-white/20 rounded-full text-xs font-black text-emerald-400 uppercase tracking-widest bg-white/5 backdrop-blur-md flex items-center gap-2 shadow-lg">
                                    <i className="fas fa-brain"></i> AI Ready
                                </span>
                            </div>

                            <button 
                                onClick={handleDismissIntro}
                                className="mt-8 px-10 py-5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black uppercase tracking-[0.2em] rounded-full shadow-[0_0_40px_rgba(16,185,129,0.4)] hover:scale-105 transition-transform flex items-center gap-4 group border border-emerald-400/30"
                            >
                                Entrar na Plataforma
                                <i className="fas fa-arrow-right group-hover:translate-x-2 transition-transform"></i>
                            </button>
                        </div>
                    </div>
                </div>
            )}


            {/* --- TELA DE LOGIN REAL (BACKGROUND LOCAL) --- */}
            <div className="absolute inset-0 z-0">
                <img 
                    src="/intro-bg.jpg" 
                    className="absolute inset-0 w-full h-full object-cover opacity-60 filter brightness-[0.9] saturate-150 contrast-125"
                    alt="EcoLog Background"
                />
                {/* Overlay reduzido e refinado */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#020405]/90 via-[#020405]/40 to-transparent"></div>
            </div>

            <div className={`relative z-10 flex flex-col lg:flex-row items-center justify-between max-w-[1400px] w-full px-8 lg:px-16 gap-16 transition-all duration-1000 ${showIntro ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
                
                {/* LADO ESQUERDO: MANIFESTO & BRANDING */}
                <div className="flex-1 text-center lg:text-left space-y-10 max-w-2xl">
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-xl shadow-lg">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]"></div>
                            <span className="text-[10px] font-black text-white uppercase tracking-[0.3em] drop-shadow-md">System Online</span>
                        </div>
                        
                        <h1 className="text-6xl lg:text-8xl font-black text-slate-100 tracking-tighter leading-[0.9] drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]">
                            EcoLog<br/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500 filter drop-shadow-lg">Enterprise</span>
                        </h1>
                        
                        <p className="text-lg lg:text-xl text-gray-300 font-bold leading-relaxed max-w-lg mx-auto lg:mx-0 border-l-4 border-emerald-500/50 pl-6 drop-shadow-md bg-black/10 backdrop-blur-sm rounded-r-lg py-2">
                            Acesse o Centro de Comando. Autenticação biométrica ou credencial corporativa requerida.
                        </p>
                    </div>
                </div>

                {/* LADO DIREITO: SMARTPHONE GATEWAY (INTERATIVO) */}
                <div className="flex-shrink-0 relative group perspective-1000 lg:scale-110">
                    {/* Efeito de brilho atrás do celular */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[650px] bg-emerald-500/20 blur-[100px] rounded-full pointer-events-none"></div>

                    <MobileMockup showStatusBar={true}>
                        <div className="w-full h-full bg-[#0a0a0a] flex flex-col items-center relative overflow-hidden px-8 pt-14 pb-8">
                            
                            {/* Background sutil no celular */}
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                            <div className="absolute top-0 left-0 w-full h-80 bg-gradient-to-b from-emerald-900/30 to-transparent"></div>

                            {/* Conteúdo do Celular */}
                            <div className="relative z-10 w-full flex flex-col items-center h-full">
                                
                                {/* Ícone de Escudo */}
                                <div className="mb-8 relative mt-6">
                                    <div className={`absolute inset-0 bg-emerald-500/30 blur-2xl rounded-full transition-opacity duration-500 ${isVerifying ? 'opacity-100' : 'opacity-50'}`}></div>
                                    <div className="relative w-24 h-24 bg-gray-900/80 backdrop-blur-xl border border-white/10 rounded-3xl flex items-center justify-center shadow-[0_10px_30px_rgba(0,0,0,0.5)] ring-1 ring-white/5">
                                        <i className={`fas ${isVerifying ? 'fa-circle-notch fa-spin' : 'fa-shield-halved'} text-4xl text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.5)]`}></i>
                                    </div>
                                </div>

                                <div className="text-center mb-10 space-y-3">
                                    <h2 className="text-3xl font-black text-white tracking-[0.2em] uppercase drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]">
                                        ECO.<span className="text-emerald-500">LOG</span>
                                    </h2>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] drop-shadow-sm">Centro de Operações Inteligente MIND7</p>
                                </div>

                                <form onSubmit={handleFormSubmit} className="w-full space-y-6 mt-auto mb-auto">
                                    <div className="space-y-4">
                                        <label className="text-xs font-bold text-gray-300 uppercase tracking-[0.2em] text-center block drop-shadow-md">
                                            Matrícula
                                        </label>
                                        
                                        <div className="relative h-16 bg-gray-900/60 backdrop-blur-md border border-white/10 rounded-2xl flex items-center justify-center cursor-text group-hover:border-emerald-500/30 transition-all shadow-inner" onClick={() => document.getElementById('hidden-auth-input')?.focus()}>
                                            <input 
                                                id="hidden-auth-input"
                                                autoFocus
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-default z-10 text-center text-transparent caret-transparent"
                                                type="tel" 
                                                maxLength={4}
                                                value={inputValue} 
                                                onChange={e => setInputValue(e.target.value.replace(/\D/g, ''))} 
                                                required 
                                                autoComplete="off"
                                            />
                                            <div className="flex gap-4">
                                                {renderPinDots()}
                                            </div>
                                        </div>
                                    </div>

                                    <button 
                                        type="submit" 
                                        disabled={inputValue.length === 0 || isVerifying}
                                        className={`w-full py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 border border-white/10 backdrop-blur-md
                                            ${inputValue.length > 0 
                                                ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_30px_rgba(16,185,129,0.6)] border-emerald-500/50' 
                                                : 'bg-gray-800/50 text-gray-500 cursor-not-allowed'}
                                        `}
                                    >
                                        {isVerifying ? (
                                            <>
                                                <i className="fas fa-spinner fa-spin"></i> Autenticando...
                                            </>
                                        ) : (
                                            <>
                                                Autorizar Acesso <i className="fas fa-unlock"></i>
                                            </>
                                        )}
                                    </button>
                                </form>

                                <div className="mt-8 text-center opacity-60">
                                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] flex items-center justify-center gap-2 drop-shadow-sm">
                                        <i className="fas fa-fingerprint"></i> Secure Auth v5.4
                                    </p>
                                </div>
                            </div>
                        </div>
                    </MobileMockup>
                </div>
            </div>

            <style>{`
                @keyframes slow-zoom {
                    from { transform: scale(1); }
                    to { transform: scale(1.1); }
                }
                .animate-slow-zoom { animation: slow-zoom 10s linear infinite alternate; }
                
                @keyframes slide-in-left {
                    from { opacity: 0; transform: translateX(-50px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                .animate-slide-in-left { animation: slide-in-left 1s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
            `}</style>
        </div>
    );
};

export default AuthPage;

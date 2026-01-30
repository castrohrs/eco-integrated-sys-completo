
import React, { useRef, useState } from 'react';
import { useLanguage } from '../hooks/useLanguage';

interface LandingPageProps {
  onEnter: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onEnter }) => {
  const { t } = useLanguage();
  
  const pulseAudio = useRef<HTMLAudioElement | null>(null);
  const [videoError, setVideoError] = useState(false);

  const handleInteraction = () => {
    if (pulseAudio.current) {
      pulseAudio.current.volume = 0.3;
      pulseAudio.current.play().catch(() => {});
    }
    setTimeout(onEnter, 300);
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#05070a] flex items-center justify-center selection:bg-primary/30">
        <audio ref={pulseAudio} src="https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3" preload="auto" />

        <div className="absolute inset-0 z-0 overflow-hidden">
            {!videoError ? (
                <video
                    className="absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto -translate-x-1/2 -translate-y-1/2 object-cover opacity-60 filter blur-[2px] brightness-75 scale-105"
                    autoPlay muted loop playsInline onError={() => setVideoError(true)}
                >
                    <source src="/ecoia-bg.mp4" type="video/mp4" />
                </video>
            ) : (
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(20,184,166,0.15)_0%,#05070a_90%)]">
                    <div className="absolute inset-0 opacity-30">
                        <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent animate-sweep-slow"></div>
                        <div className="absolute top-3/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-secondary/30 to-transparent animate-sweep-fast"></div>
                    </div>
                </div>
            )}
            <div className="absolute inset-0 bg-black/60 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-40"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#05070a] via-transparent to-[#05070a] opacity-90"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,#05070a_100%)]"></div>
        </div>

        <div className="relative z-20 text-center p-8 max-w-4xl w-full flex flex-col items-center transition-transform duration-500">
            {/* Logo Reactor - Reduced Size */}
            <div className="mb-6 animate-fade-in-up">
                <div className="relative group">
                    <div className="absolute inset-0 bg-orange-500/20 rounded-full blur-3xl group-hover:bg-orange-500/40 transition-all duration-700 animate-pulse"></div>
                    <div className="relative w-14 h-14 bg-[#0a0c10]/80 backdrop-blur-xl border border-white/10 rounded-[1.2rem] flex items-center justify-center shadow-[0_0_40px_rgba(var(--color-primary-val),0.2)] transform rotate-3 hover:rotate-0 transition-all duration-700 ease-out cursor-default overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                        <i className="fas fa-brain text-2xl text-orange-500 drop-shadow-[0_0_10px_rgba(249,115,22,0.8)] group-hover:scale-110 transition-transform duration-500"></i>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="space-y-4 mb-8">
                <div className="flex items-center justify-center gap-2 opacity-80 animate-fade-in-up animation-delay-100">
                    <div className="h-px w-6 bg-gradient-to-r from-transparent to-secondary"></div>
                    <h2 className="text-secondary font-black tracking-[0.4em] uppercase text-[8px]">Integrated Intelligence System</h2>
                    <div className="h-px w-6 bg-gradient-to-l from-transparent to-secondary"></div>
                </div>

                <div className="flex flex-col items-center animate-fade-in-up animation-delay-200">
                    <h1 className="eco-ia-title text-white drop-shadow-2xl">
                        ECO.<span className="text-[#e10600] drop-shadow-[0_0_20px_rgba(225,6,0,0.8)]">IA</span>
                    </h1>
                    
                    <div className="mt-4 eco-ia-manifest text-white/90">
                        NÃO CONTROLAMOS A OPERAÇÃO.<br/>
                        NÓS COMANDAMOS O FLUXO.
                    </div>
                </div>
                
                <div className="flex flex-col items-center animate-fade-in-up animation-delay-300 mt-4">
                    <div className="flex items-center gap-6 mb-2">
                        <div className="relative group/mobile">
                            <i className="fas fa-crown text-[8px] text-yellow-500 absolute -top-2 -right-1 rotate-12 drop-shadow-[0_0_5px_rgba(234,179,8,0.6)] z-10 animate-bounce"></i>
                            <i className="fas fa-mobile-screen-button text-2xl text-slate-500 group-hover/mobile:text-slate-300 transition-colors"></i>
                        </div>
                        
                        <div className="w-px h-8 bg-gradient-to-b from-transparent via-slate-700 to-transparent"></div>
                        
                        <div className="flex items-center gap-3 text-left">
                            <p className="text-slate-300 text-sm leading-relaxed font-medium tracking-tight">
                                Comando Digital de Alta Precisão.
                            </p>
                            <i className="fas fa-brain text-primary text-xs opacity-50 animate-pulse"></i>
                        </div>
                    </div>

                    <div className="eco-ia-signature mt-4">
                        by JORGE NASSER – Design
                    </div>
                </div>
            </div>

            <div className="animate-fade-in-up animation-delay-500">
                <button 
                    onClick={handleInteraction}
                    className="group relative inline-flex items-center justify-center px-12 py-4 font-black text-white transition-all duration-300 bg-gradient-to-b from-primary/80 to-primary rounded-xl hover:scale-105 hover:shadow-[0_0_40px_rgba(var(--color-primary-val),0.6)] active:scale-95 focus:outline-none border-t border-white/20 overflow-hidden backdrop-blur-sm"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    <span className="relative flex items-center gap-3 text-xs tracking-[0.3em] uppercase text-shadow-sm">
                        Iniciar Operação
                        <i className="fas fa-power-off text-xs group-hover:rotate-90 transition-transform duration-500"></i>
                    </span>
                </button>
            </div>
            
            <div className="mt-10 flex items-center gap-3 text-slate-600 text-[8px] font-black uppercase tracking-[0.5em] animate-fade-in-up animation-delay-700 opacity-60">
                <span>Core v5.2</span>
                <span className="w-0.5 h-0.5 rounded-full bg-primary/50"></span>
                <span>Bio-Metric Validated</span>
                <span className="w-0.5 h-0.5 rounded-full bg-primary/50"></span>
                <span>2025 Security Protocol</span>
            </div>
        </div>

        <style>{`
            .eco-ia-title {
                font-size: 4.5rem; /* Reduzido de 8.5rem para ~metade */
                font-weight: 900;
                letter-spacing: 0.02em;
                line-height: 1;
                margin: 0;
            }
            .eco-ia-manifest {
                font-size: 0.75rem; /* Reduzido de 1rem */
                font-weight: 200;
                letter-spacing: 0.3em;
                text-transform: uppercase;
                line-height: 1.8;
                text-align: center;
                border-top: 1px solid rgba(255,255,255,0.1);
                border-bottom: 1px solid rgba(255,255,255,0.1);
                padding: 1rem 0;
                width: 100%;
                max-width: 500px;
            }
            .eco-ia-signature {
                font-size: 0.6rem;
                font-weight: 600;
                letter-spacing: 0.2em;
                opacity: 0.5;
                text-transform: uppercase;
                color: #94a3b8;
                font-family: 'Inter', sans-serif;
            }
            @media (max-width: 768px) {
                .eco-ia-title { font-size: 3rem; }
                .eco-ia-manifest { font-size: 0.6rem; letter-spacing: 0.15em; }
            }
            @keyframes sweep {
                0% { transform: translateY(-20vh) translateX(-100%); opacity: 0; }
                50% { opacity: 0.5; }
                100% { transform: translateY(20vh) translateX(100%); opacity: 0; }
            }
            .animate-sweep-slow { animation: sweep 12s infinite linear; }
            .animate-sweep-fast { animation: sweep 8s infinite linear reverse; }
            
            .animate-fade-in-up {
                animation: fadeInUp 1.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                opacity: 0;
                transform: translateY(40px);
                filter: blur(10px);
            }
            .animation-delay-100 { animation-delay: 0.1s; }
            .animation-delay-200 { animation-delay: 0.2s; }
            .animation-delay-300 { animation-delay: 0.3s; }
            .animation-delay-500 { animation-delay: 0.5s; }
            .animation-delay-700 { animation-delay: 0.7s; }

            @keyframes fadeInUp {
                to {
                    opacity: 1;
                    transform: translateY(0);
                    filter: blur(0);
                }
            }
            .text-shadow-sm {
                text-shadow: 0 1px 2px rgba(0,0,0,0.5);
            }
        `}</style>
    </div>
  );
};

export default LandingPage;

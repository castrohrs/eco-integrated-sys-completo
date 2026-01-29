
import React, { useRef, useState, useEffect } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import MobileMockup from './MobileMockup';

interface LandingPageProps {
  onEnter: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onEnter }) => {
  const { t } = useLanguage();
  const pulseAudio = useRef<HTMLAudioElement | null>(null);

  const handleInteraction = () => {
    if (pulseAudio.current) {
      pulseAudio.current.volume = 0.3;
      pulseAudio.current.play().catch(() => {});
    }
    setTimeout(onEnter, 300);
  };

  // Preload background to avoid flicker
  const [bgLoaded, setBgLoaded] = useState(false);
  useEffect(() => {
    const img = new Image();
    img.src = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop";
    img.onload = () => setBgLoaded(true);
  }, []);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#0f172a] flex items-center justify-center font-sans">
        <audio ref={pulseAudio} src="https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3" preload="auto" />

        {/* Background Atmosférico */}
        <div className="absolute inset-0 z-0">
            <div className={`absolute inset-0 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')] bg-cover bg-center transition-opacity duration-1000 ${bgLoaded ? 'opacity-40' : 'opacity-0'}`}></div>
            <div className="absolute inset-0 bg-gradient-to-r from-[#0f172a] via-[#0f172a]/80 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-[#0f172a]/50"></div>
            
            {/* Partículas / Brilhos (Efeito Mágico) */}
            <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-primary/20 rounded-full blur-[100px] animate-pulse"></div>
            <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-secondary/20 rounded-full blur-[80px] animate-pulse" style={{animationDelay: '1s'}}></div>
        </div>

        <div className="relative z-10 w-full max-w-7xl px-8 flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-20">
            
            {/* Lado Esquerdo: Texto e CTA */}
            <div className="flex-1 text-center lg:text-left space-y-8 animate-fade-in-up">
                <div className="space-y-4">
                    <div className="flex items-center justify-center lg:justify-start gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/30">
                            <i className="fas fa-leaf text-xl"></i>
                        </div>
                        <span className="text-primary font-bold tracking-widest uppercase text-xs bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                            Operational Intelligence
                        </span>
                    </div>
                    
                    <h1 className="text-5xl lg:text-7xl font-black text-white tracking-tight leading-none drop-shadow-xl">
                        EcoLog<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-300">Enterprise</span>
                    </h1>
                    
                    <p className="text-lg lg:text-xl text-slate-300 font-medium max-w-xl mx-auto lg:mx-0 leading-relaxed">
                        O sistema inteligente de gestão portuária e logística para operações de alta performance.
                    </p>
                </div>

                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                    {['v5.2', 'SEGURO', 'AI READY'].map((tag) => (
                        <span key={tag} className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-gray-400">
                            {tag}
                        </span>
                    ))}
                </div>

                <div className="pt-4">
                    <button 
                        onClick={handleInteraction}
                        className="group relative inline-flex items-center justify-center px-10 py-5 bg-gradient-to-r from-primary to-emerald-600 text-white font-black text-sm uppercase tracking-[0.2em] rounded-2xl shadow-[0_0_40px_rgba(16,185,129,0.4)] hover:shadow-[0_0_60px_rgba(16,185,129,0.6)] hover:scale-105 transition-all duration-300 overflow-hidden"
                    >
                        <span className="relative z-10 flex items-center gap-3">
                            Entrar na Plataforma
                            <i className="fas fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
                        </span>
                        <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12"></div>
                    </button>
                </div>
            </div>

            {/* Lado Direito: Mockup (Hero Image) */}
            <div className="flex-1 flex justify-center lg:justify-end animate-fade-in-up animation-delay-200">
                <div className="relative">
                    {/* Efeitos de Fundo do Mockup */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-primary/30 to-blue-500/30 rounded-full blur-[100px] pointer-events-none"></div>
                    
                    <MobileMockup className="scale-90 lg:scale-100 origin-center rotate-[-5deg] hover:rotate-0 transition-all duration-700 shadow-2xl">
                        <div className="h-full w-full bg-[#0a0c10] flex flex-col items-center justify-center p-8 relative overflow-hidden">
                            {/* Conteúdo da Tela do Mockup */}
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                            
                            <div className="z-10 text-center space-y-6 w-full">
                                <div className="w-20 h-20 bg-primary/10 rounded-3xl border border-primary/30 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(20,184,166,0.2)]">
                                    <i className="fas fa-shield-alt text-4xl text-primary"></i>
                                </div>
                                
                                <div>
                                    <h3 className="text-2xl font-black text-white tracking-wider">ECO.LOG</h3>
                                    <p className="text-[9px] font-bold text-gray-500 uppercase tracking-[0.3em] mt-1">Centro de Operações</p>
                                    <p className="text-[9px] font-bold text-gray-600 uppercase tracking-[0.3em]">Inteligente Mind7</p>
                                </div>

                                <div className="space-y-3 pt-6 w-full">
                                    <div className="h-12 w-full bg-white/5 rounded-xl border border-white/10 flex items-center px-4">
                                        <div className="w-20 h-2 bg-white/10 rounded-full"></div>
                                    </div>
                                    <div className="flex justify-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-white/20"></div>
                                        <div className="w-2 h-2 rounded-full bg-white/20"></div>
                                        <div className="w-2 h-2 rounded-full bg-white/20"></div>
                                        <div className="w-2 h-2 rounded-full bg-white/20"></div>
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <div className="w-full py-4 bg-primary text-black font-black uppercase text-xs rounded-xl shadow-lg flex items-center justify-center gap-2">
                                        Autorizar Acesso <i className="fas fa-fingerprint"></i>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="absolute bottom-6 text-[8px] font-black text-gray-700 uppercase tracking-widest">
                                v Secure Auth v5.4
                            </div>
                        </div>
                    </MobileMockup>

                    {/* Elemento flutuante decorativo (Simulando o "Kid" da imagem original com um ícone ou badge) */}
                    <div className="absolute -bottom-10 -left-10 lg:-left-20 bg-bg-card/80 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-2xl animate-bounce-slow hidden md:block">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-400 to-orange-500 flex items-center justify-center text-white shadow-lg">
                                <i className="fas fa-bolt"></i>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-white">Performance</p>
                                <p className="text-[10px] text-gray-400">Otimização máxima</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <style>{`
            .animate-fade-in-up { animation: fadeInUp 1s ease-out forwards; opacity: 0; transform: translateY(20px); }
            .animation-delay-200 { animation-delay: 0.2s; }
            @keyframes fadeInUp { to { opacity: 1; transform: translateY(0); } }
            @keyframes bounce-slow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
            .animate-bounce-slow { animation: bounce-slow 4s infinite ease-in-out; }
        `}</style>
    </div>
  );
};

export default LandingPage;

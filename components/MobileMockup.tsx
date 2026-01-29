
import React, { useState, useEffect } from 'react';

interface MobileMockupProps {
    children: React.ReactNode;
    className?: string;
    showStatusBar?: boolean;
}

const MobileMockup: React.FC<MobileMockupProps> = ({ children, className = "", showStatusBar = true }) => {
    const [currentTime, setCurrentTime] = useState('');

    useEffect(() => {
        const updateClock = () => {
            const now = new Date();
            setCurrentTime(now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
        };
        updateClock();
        const interval = setInterval(updateClock, 60000);
        return () => clearInterval(interval);
    }, []);

    return (
        /* DISPOSITIVO MÓVEL (MOCKUP PREMIUM) */
        <div className={`relative mx-auto w-[360px] h-[740px] bg-[#020617] rounded-[4rem] border-[14px] border-[#1e293b] shadow-[0_60px_120px_-20px_rgba(0,0,0,1)] overflow-hidden ring-4 ring-white/5 flex flex-col items-center group/phone transition-all duration-1000 hover:scale-[1.01] ${className}`}>
            
            {/* BOTÕES LATERAIS COM RELEVO */}
            <div className="absolute -left-[16px] top-32 w-[6px] h-16 bg-gradient-to-b from-[#334155] to-[#0f172a] rounded-l-lg shadow-[-2px_0_10px_rgba(0,0,0,0.5)] border-l border-white/10"></div>
            <div className="absolute -left-[16px] top-56 w-[6px] h-16 bg-gradient-to-b from-[#334155] to-[#0f172a] rounded-l-lg shadow-[-2px_0_10px_rgba(0,0,0,0.5)] border-l border-white/10"></div>
            <div className="absolute -right-[16px] top-40 w-[6px] h-24 bg-gradient-to-b from-[#334155] to-[#0f172a] rounded-r-lg shadow-[2px_0_10px_rgba(0,0,0,0.5)] border-r border-white/10"></div>

            {/* ILHA DINÂMICA / NOTCH COM SENSORES */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-32 h-8 bg-black rounded-full z-50 flex items-center justify-center gap-4 border border-white/5 shadow-inner pointer-events-none">
                <div className="w-2.5 h-2.5 rounded-full bg-[#1a1f2e] border border-white/10 relative overflow-hidden">
                    <div className="absolute inset-0 bg-blue-500/30 blur-[1px]"></div>
                </div>
                <div className="w-2 h-2 rounded-full bg-emerald-500/40 animate-pulse shadow-[0_0_8px_#10b981]"></div>
            </div>

            {/* TELA DO SMARTPHONE (GLASS EFFECT) */}
            <div className="w-full h-full bg-[#0a0c10] flex flex-col items-center relative overflow-hidden">
                
                {/* BARRA DE STATUS SIMULADA */}
                {showStatusBar && (
                    <div className="w-full pt-4 px-8 flex justify-between items-center z-40 mb-2 shrink-0">
                        <span className="text-[12px] font-black text-white/80">{currentTime}</span>
                        <div className="flex items-center gap-2">
                            <i className="fas fa-signal text-[10px] text-white/60"></i>
                            <i className="fas fa-wifi text-[10px] text-white/60"></i>
                            <div className="flex items-center gap-1 border border-white/20 rounded-[2px] px-0.5">
                                <div className="w-3 h-1.5 bg-success rounded-[1px]"></div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Reflexo de Vidro Temperado Superior */}
                <div className="absolute -top-1/2 -left-1/4 w-[150%] h-full bg-gradient-to-br from-white/10 via-transparent to-transparent rotate-12 pointer-events-none z-10"></div>
                
                {/* CONTEÚDO SCROLLÁVEL */}
                <div className="flex-1 w-full relative z-20 overflow-y-auto custom-scrollbar scroll-smooth">
                    {children}
                </div>

                {/* Home Indicator Bar */}
                <div className="mt-auto pb-6 pt-4 flex flex-col items-center gap-6 opacity-40 shrink-0 w-full bg-gradient-to-t from-black to-transparent z-30">
                    <div className="w-32 h-1.5 bg-slate-800 rounded-full shadow-inner border border-white/5"></div>
                </div>
            </div>
        </div>
    );
};

export default MobileMockup;

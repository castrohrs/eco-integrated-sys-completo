
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
        /* DISPOSITIVO MÓVEL (MOCKUP ULTRA PREMIUM) */
        <div className={`relative mx-auto w-[380px] h-[780px] bg-[#020617] rounded-[4.5rem] border-[12px] border-[#1e293b] shadow-[0_80px_160px_-40px_rgba(0,0,0,1)] overflow-hidden ring-1 ring-white/10 flex flex-col items-center group/phone transition-all duration-1000 ${className}`}>
            
            {/* BOTÕES LATERAIS DE TITÂNIO */}
            <div className="absolute -left-[14px] top-36 w-[4px] h-12 bg-[#334155] rounded-l-lg border-l border-white/10"></div>
            <div className="absolute -left-[14px] top-56 w-[4px] h-20 bg-[#334155] rounded-l-lg border-l border-white/10"></div>
            <div className="absolute -right-[14px] top-44 w-[4px] h-24 bg-[#334155] rounded-r-lg border-r border-white/10"></div>

            {/* DYNAMIC ISLAND (ILHA DINÂMICA) */}
            <div className="absolute top-5 left-1/2 -translate-x-1/2 w-28 h-7 bg-black rounded-full z-50 flex items-center justify-end pr-3 gap-3 border border-white/5 shadow-inner pointer-events-none">
                <div className="w-1.5 h-1.5 rounded-full bg-[#1a1f2e] border border-white/10"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-pulse"></div>
            </div>

            {/* TELA OLED (GLASS EFFECT) */}
            <div className="w-full h-full bg-[#0a0c10] flex flex-col items-center relative overflow-hidden">
                
                {/* BARRA DE STATUS TÁTICA */}
                {showStatusBar && (
                    <div className="w-full pt-5 px-10 flex justify-between items-center z-40 mb-2 shrink-0">
                        <span className="text-[13px] font-black text-white/90 font-mono tracking-tighter">{currentTime}</span>
                        <div className="flex items-center gap-3">
                            <i className="fas fa-signal text-[11px] text-white/70"></i>
                            <i className="fas fa-wifi text-[11px] text-white/70"></i>
                            <div className="flex items-center gap-1 border border-white/30 rounded-[3px] px-0.5 h-3.5 w-6 relative">
                                <div className="h-full bg-success rounded-[1px] w-[80%]"></div>
                                <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-1 h-1.5 bg-white/30 rounded-r-sm"></div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Reflexo Lateral Realista */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none z-10 opacity-30"></div>
                
                {/* CONTEÚDO SCROLLÁVEL DO APP */}
                <div className="flex-1 w-full relative z-20 overflow-y-auto no-scrollbar scroll-smooth">
                    {children}
                </div>

                {/* Home Indicator (Barra Inferior iOS) */}
                <div className="mt-auto pb-4 pt-2 flex flex-col items-center gap-6 opacity-30 shrink-0 w-full z-30">
                    <div className="w-32 h-1.5 bg-slate-700 rounded-full"></div>
                </div>
            </div>
            
            {/* Inner Glow Border */}
            <div className="absolute inset-0 rounded-[3.8rem] border border-white/5 pointer-events-none z-50"></div>
        </div>
    );
};

export default MobileMockup;


import React from 'react';

const Manifesto: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[85vh] px-8 text-center animate-fade-in bg-bg-main relative overflow-hidden rounded-3xl border border-border-color/30">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="relative z-10 max-w-2xl space-y-4">
                
                {/* Cabeçalho Filosófico */}
                <header className="space-y-1 animate-slide-up">
                    <div className="flex justify-center mb-1">
                        <div className="w-px h-8 bg-gradient-to-b from-transparent to-primary"></div>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-black text-light tracking-tighter leading-none">
                        A VISÃO É O NOSSO <span className="text-primary">MAIOR ATIVO</span>.
                    </h2>
                    <p className="text-[13px] md:text-sm text-gray-text font-bold uppercase tracking-widest opacity-80 leading-tight">
                        Nem todo mundo entende o ritmo. A música é para quem enxerga o amanhã hoje.
                    </p>
                </header>

                {/* Parte Central: Jornada Tênue */}
                <section className="space-y-4 animate-slide-up animation-delay-200 py-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-center">
                        <div className="space-y-1">
                            <h3 className="text-[8px] font-black uppercase tracking-[0.4em] text-secondary">A Caminhada</h3>
                            <p className="text-gray-400 text-[10px] leading-tight max-w-[220px] mx-auto font-medium">
                                Enquanto falam, avançamos. O trabalho devolve em foco, precisão e lealdade.
                            </p>
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-[8px] font-black uppercase tracking-[0.4em] text-secondary">A Gratidão</h3>
                            <p className="text-gray-400 text-[10px] leading-tight max-w-[220px] mx-auto font-medium">
                                Agradecimento a cada mente que caminhou junto. Somos um só organismo.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Fechamento: Liderança, Assinatura e Rodapé Técnico */}
                <footer className="space-y-3 animate-slide-up animation-delay-500">
                    <div className="pt-3 border-t border-border-color/20">
                        <p className="italic text-gray-500 text-[11px] leading-tight max-w-md mx-auto font-medium">
                            “E aqueles que foram vistos dançando foram julgados insanos por aqueles que não podiam escutar a música.”
                        </p>
                        <p className="text-[7px] font-black uppercase tracking-[0.5em] text-gray-600 mt-1">— Friedrich Nietzsche</p>
                    </div>

                    <div className="pt-1">
                        <h4 className="text-base font-black text-light tracking-[0.3em] leading-none">— JORGE NASSER</h4>
                        <p className="text-[7px] font-black uppercase tracking-[0.6em] text-primary mt-1">
                            TECNOLOGIA ESTRATÉGICA | LIDERANÇA OPERACIONAL
                        </p>
                    </div>

                    <div className="pt-2 flex flex-col items-center gap-1.5">
                        <div className="h-px w-12 bg-primary/20"></div>
                        
                        <p className="text-[8px] font-black text-secondary/40 tracking-[0.4em] uppercase">
                            Gratidão Rafael Santos! Obrigado por tudo!
                        </p>

                        <p className="text-[8px] font-black text-light tracking-[0.4em] uppercase animate-pulse">
                            O AMANHÃ É UMA DECISÃO. EXECUTE.
                        </p>
                    </div>
                </footer>
            </div>

            <style>{`
                .animation-delay-200 { animation-delay: 0.1s; }
                .animation-delay-500 { animation-delay: 0.3s; }
            `}</style>
        </div>
    );
};

export default Manifesto;


import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import MobileMockup from './MobileMockup';

const AuthPage: React.FC = () => {
    const { login } = useAuth();
    const { t } = useLanguage();
    const [inputValue, setInputValue] = useState('');
    const [error, setError] = useState('');

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const success = await login(inputValue);
        if (!success) setError('Acesso negado. Matrícula inválida.');
    };
    
    return (
        <div className="min-h-screen w-full relative flex items-center justify-center p-6 bg-slate-50 overflow-hidden">
            {/* Soft background accents */}
            <div className="absolute top-0 left-0 w-full h-full opacity-40 pointer-events-none">
                <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-emerald-100 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-blue-100 rounded-full blur-[120px]"></div>
            </div>

            <div className="relative z-10 flex flex-col lg:flex-row items-center gap-16 max-w-6xl w-full">
                <div className="flex-1 text-center lg:text-left space-y-6">
                    <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-200 mx-auto lg:mx-0">
                        <i className="fas fa-leaf text-white text-3xl"></i>
                    </div>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tight">Eco<span className="text-emerald-600">Log</span> Enterprise</h1>
                    <p className="text-xl text-slate-600 font-medium max-w-md mx-auto lg:mx-0">O sistema inteligente de gestão portuária e logística para operações de alta performance.</p>
                    <div className="flex items-center gap-4 justify-center lg:justify-start pt-4">
                        <span className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-widest">v5.2 Secure</span>
                        <span className="bg-emerald-50 px-4 py-2 rounded-xl text-xs font-bold text-emerald-700 uppercase tracking-widest">AI Ready</span>
                    </div>
                </div>

                <div className="flex-shrink-0 animate-fade-in">
                    <MobileMockup>
                        <div className="w-full px-8 pt-12 pb-8 flex flex-col items-center min-h-full">
                            <div className="text-center mb-10">
                                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Login</h2>
                                <p className="text-slate-500 text-sm font-medium mt-2">Insira sua matrícula para autorizar o acesso ao núcleo.</p>
                            </div>
                            
                            <form onSubmit={handleFormSubmit} className="w-full space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">ID de Acesso</label>
                                    <input 
                                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 text-center font-mono text-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 transition-all outline-none" 
                                        type="password" 
                                        value={inputValue} 
                                        onChange={e => setInputValue(e.target.value)} 
                                        placeholder="••••"
                                        required 
                                    />
                                </div>
                                
                                {error && (
                                    <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 text-center">
                                        <p className="text-rose-600 text-xs font-bold">{error}</p>
                                    </div>
                                )}

                                <button type="submit" className="w-full p-4 bg-emerald-600 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-emerald-700 shadow-xl shadow-emerald-100 transition-all active:scale-95 flex items-center justify-center gap-3">
                                    Acessar Sistema
                                    <i className="fas fa-arrow-right"></i>
                                </button>
                            </form>

                            <div className="mt-auto pt-10 opacity-30 text-center">
                                <i className="fas fa-shield-alt text-lg text-emerald-600 mb-2"></i>
                                <p className="text-[10px] font-black uppercase tracking-widest">Protocolo de Segurança Ativo</p>
                            </div>
                        </div>
                    </MobileMockup>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;

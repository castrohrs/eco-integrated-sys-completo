
import React, { useState, useEffect } from 'react';
import { Frete } from '../types';
import { XIcon } from './icons';

interface FreightDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    frete: Frete | null;
    onSave: (frete: Frete) => void;
}

const FreightDetailModal: React.FC<FreightDetailModalProps> = ({ isOpen, onClose, frete, onSave }) => {
    const [formData, setFormData] = useState<Partial<Frete>>({});
    const stages = ['Aguardando Alocação', 'Em Rota / Coletando', 'Em Trânsito', 'Pendente de Entrega', 'Fechamento / Faturamento'];

    useEffect(() => {
        if (frete) setFormData({ ...frete });
    }, [frete, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleStageClick = (stage: string) => {
        setFormData(prev => ({ ...prev, status: stage }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData as Frete);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[2000] backdrop-blur-sm" onClick={onClose}>
            <div className="bg-bg-main w-full max-w-6xl h-[90vh] flex flex-col shadow-2xl rounded-zoho overflow-hidden" onClick={e => e.stopPropagation()}>
                {/* Modal Header */}
                <header className="p-6 bg-white border-b border-border-color flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-50 text-primary rounded flex items-center justify-center text-2xl"><i className="fas fa-truck-loading"></i></div>
                        <div>
                            <h2 className="text-xl font-black text-navy">{formData.cliente}</h2>
                            <p className="text-xs text-gray-500 uppercase font-bold tracking-widest">Frete ID: {formData.id}</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={handleSubmit} className="px-6 py-2 bg-primary text-white font-bold rounded-zoho hover:bg-blue-600 transition-all">Salvar</button>
                        <button onClick={onClose} className="p-2 text-gray-400 hover:text-navy"><XIcon className="w-6 h-6" /></button>
                    </div>
                </header>

                {/* Stage Ribbon (Zoho CRM Signature) */}
                <div className="px-6 py-3 bg-gray-50 border-b border-border-color flex">
                    {stages.map((st, idx) => {
                        const currentIdx = stages.indexOf(formData.status || '');
                        const isCompleted = idx < currentIdx;
                        const isActive = st === formData.status;
                        
                        return (
                            <button 
                                key={st}
                                onClick={() => handleStageClick(st)}
                                className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest text-center relative border-r border-border-color last:border-r-0 transition-all
                                    ${isActive ? 'bg-primary text-white' : isCompleted ? 'bg-green-500 text-white' : 'bg-white text-gray-400 hover:bg-blue-50 hover:text-primary'}
                                `}
                            >
                                {st}
                                {isActive && <div className="absolute -bottom-px left-0 right-0 h-1 bg-white/30"></div>}
                            </button>
                        );
                    })}
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-10 bg-white grid grid-cols-1 md:grid-cols-3 gap-10">
                    {/* Left Col: Info */}
                    <div className="md:col-span-2 space-y-10">
                        <section>
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-6 border-b border-gray-100 pb-2">Informações da Operação</h3>
                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <label className="text-[11px] font-bold text-gray-500 uppercase block mb-2">DIV BK / Booking</label>
                                    <input name="di_br" value={formData.di_br || ''} onChange={handleChange} className="w-full p-2 bg-gray-50 border-b border-border-color outline-none focus:border-primary transition-all font-medium text-navy" />
                                </div>
                                <div>
                                    <label className="text-[11px] font-bold text-gray-500 uppercase block mb-2">Referência</label>
                                    <input name="referencia" value={formData.referencia || ''} onChange={handleChange} className="w-full p-2 bg-gray-50 border-b border-border-color outline-none focus:border-primary transition-all font-medium text-navy" />
                                </div>
                                <div>
                                    <label className="text-[11px] font-bold text-gray-500 uppercase block mb-2">Container</label>
                                    <input name="container" value={formData.container || ''} onChange={handleChange} className="w-full p-2 bg-gray-50 border-b border-border-color outline-none focus:border-primary transition-all font-bold text-navy font-mono" />
                                </div>
                                <div>
                                    <label className="text-[11px] font-bold text-gray-500 uppercase block mb-2">Free Time</label>
                                    <input name="free_time" value={formData.free_time || ''} onChange={handleChange} className="w-full p-2 bg-gray-50 border-b border-border-color outline-none focus:border-primary transition-all font-medium text-navy" />
                                </div>
                            </div>
                        </section>

                        <section>
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-6 border-b border-gray-100 pb-2">Logística e Transporte</h3>
                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <label className="text-[11px] font-bold text-gray-500 uppercase block mb-2">Motorista</label>
                                    <input name="motorista" value={formData.motorista || ''} onChange={handleChange} className="w-full p-2 bg-gray-50 border-b border-border-color outline-none focus:border-primary transition-all font-medium text-navy" />
                                </div>
                                <div>
                                    <label className="text-[11px] font-bold text-gray-500 uppercase block mb-2">Destino</label>
                                    <input name="destino" value={formData.destino || ''} onChange={handleChange} className="w-full p-2 bg-gray-50 border-b border-border-color outline-none focus:border-primary transition-all font-medium text-navy" />
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Right Col: Finance & Highlights */}
                    <div className="space-y-6">
                        <div className="bg-gray-50 p-6 rounded-zoho border border-border-color">
                            <h4 className="text-xs font-black text-navy uppercase tracking-widest mb-4">Informações de Cartão</h4>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-gray-500">Valor do Frete:</span>
                                    <span className="font-black text-navy text-lg">R$ {formData.vrFrete}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-gray-500">Data de Abertura:</span>
                                    <span className="font-bold text-gray-700">{new Date(formData.data || '').toLocaleDateString('pt-BR')}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-gray-500">Proprietário:</span>
                                    <span className="text-primary font-bold">Jorge Nasser</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-blue-50 p-6 rounded-zoho border border-primary/20">
                            <h4 className="text-xs font-black text-primary uppercase tracking-widest mb-2">Assistente de Notas</h4>
                            <textarea 
                                className="w-full bg-transparent border-none text-xs text-navy outline-none resize-none h-40"
                                placeholder="Clique para adicionar uma nota para este frete..."
                                name="obs"
                                value={formData.obs}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FreightDetailModal;

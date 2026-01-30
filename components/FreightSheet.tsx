
import React, { useState } from 'react';
import { Frete, ClientNote, FreightColumn } from '../types';
import FreteCard from './FreteCard';
import FreightDetailModal from './FreightDetailModal';
import { PlusIcon, TableCellsIcon, KanbanIcon } from './icons';

interface FreightSheetProps {
    fretes: Frete[];
    onAddFrete: (frete: Frete) => void;
    onUpdateFrete: (frete: Frete) => void;
    onDeleteFrete: (id: string) => void;
    clientNotes: ClientNote[];
    onAddClientNote: (note: ClientNote) => void;
    onOpenDetailModal: (frete: Frete) => void;
}

const FreightSheet: React.FC<FreightSheetProps> = ({ 
    fretes, onAddFrete, onUpdateFrete, onDeleteFrete 
}) => {
    const [viewMode, setViewMode] = useState<'kanban' | 'table'>('table');
    const [searchTerm, setSearchTerm] = useState('');
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedFrete, setSelectedFrete] = useState<Frete | null>(null);

    const stages = ['Aguardando Alocação', 'Em Rota', 'Em Trânsito', 'Pendente', 'Finalizado'];

    const filteredFretes = fretes.filter(f => f.cliente?.toLowerCase().includes(searchTerm.toLowerCase()));

    const handleAdd = () => {
        const newFrete: Frete = { id: `F-${Date.now()}`, cliente: 'Novo Cliente', status: 'Aguardando Alocação', data: new Date().toISOString(), value: 0 } as any;
        onAddFrete(newFrete);
    };

    return (
        <div className="bg-white rounded-zoho border border-border-color shadow-sm h-full flex flex-col">
            {/* Action Bar */}
            <div className="p-4 border-b border-border-color flex justify-between items-center bg-gray-50">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
                        <input 
                            className="bg-white border border-border-color rounded py-1.5 pl-9 pr-4 text-xs w-64 focus:ring-2 focus:ring-primary/20 outline-none"
                            placeholder="Pesquisar Fretes..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex border border-border-color rounded overflow-hidden">
                        <button onClick={() => setViewMode('table')} className={`p-2 transition-all ${viewMode === 'table' ? 'bg-white text-primary shadow-inner' : 'bg-gray-100 text-gray-400'}`}><TableCellsIcon /></button>
                        <button onClick={() => setViewMode('kanban')} className={`p-2 transition-all ${viewMode === 'kanban' ? 'bg-white text-primary shadow-inner' : 'bg-gray-100 text-gray-400'}`}><KanbanIcon /></button>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-2 border border-border-color bg-white text-navy text-xs font-bold rounded-zoho hover:bg-gray-100 transition-colors"><i className="fas fa-filter mr-2"></i> Filtros</button>
                    <button onClick={handleAdd} className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-zoho hover:bg-blue-600 transition-all flex items-center gap-2 shadow-sm">
                        <PlusIcon /> Novo Frete
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-auto">
                {viewMode === 'table' ? (
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 border-b border-border-color sticky top-0 z-10">
                            <tr>
                                <th className="p-4 w-10 text-center"><input type="checkbox" className="accent-primary" /></th>
                                <th className="p-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Cliente</th>
                                <th className="p-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Estágio</th>
                                <th className="p-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Valor do Frete</th>
                                <th className="p-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Data do Serviço</th>
                                <th className="p-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Container</th>
                                <th className="p-4 text-right"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-color">
                            {filteredFretes.map(frete => (
                                <tr key={frete.id} className="zoho-row" onClick={() => { setSelectedFrete(frete); setIsDetailModalOpen(true); }}>
                                    <td className="p-4 text-center" onClick={e => e.stopPropagation()}><input type="checkbox" className="accent-primary" /></td>
                                    <td className="p-4 font-bold text-navy">{frete.cliente}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${frete.status === 'Finalizado' ? 'bg-green-100 text-green-700' : 'bg-blue-50 text-primary'}`}>
                                            {frete.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-gray-600 font-mono">R$ {frete.vrFrete?.toLocaleString('pt-BR')}</td>
                                    <td className="p-4 text-gray-500">{new Date(frete.data).toLocaleDateString('pt-BR')}</td>
                                    <td className="p-4 font-mono text-gray-400">{frete.container || '---'}</td>
                                    <td className="p-4 text-right space-x-2">
                                        <button className="text-gray-400 hover:text-primary transition-colors"><i className="fas fa-edit"></i></button>
                                        <button onClick={(e) => { e.stopPropagation(); onDeleteFrete(frete.id); }} className="text-gray-400 hover:text-danger transition-colors"><i className="fas fa-trash"></i></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="p-6 h-full bg-gray-50">
                         {/* Kanban simple structure similar to existing but with Zoho style */}
                         <div className="flex gap-6 h-full overflow-x-auto pb-4">
                            {stages.map(stage => (
                                <div key={stage} className="min-w-[280px] w-[280px] flex flex-col bg-white border border-border-color rounded-zoho shadow-sm">
                                    <div className="p-3 border-b border-border-color bg-gray-50 font-bold text-navy flex justify-between items-center">
                                        <span className="text-xs uppercase tracking-widest">{stage}</span>
                                        <span className="text-[10px] bg-gray-200 px-2 py-0.5 rounded-full text-gray-600">{filteredFretes.filter(f => f.status === stage).length}</span>
                                    </div>
                                    <div className="p-3 flex-1 overflow-y-auto space-y-3 custom-scrollbar">
                                        {filteredFretes.filter(f => f.status === stage).map(f => (
                                            <div key={f.id} className="p-3 border border-border-color rounded hover:border-primary transition-all shadow-sm cursor-pointer">
                                                <p className="font-bold text-navy text-sm mb-1">{f.cliente}</p>
                                                <p className="text-[10px] text-gray-500 font-mono">{f.container}</p>
                                                <div className="mt-2 pt-2 border-t border-gray-100 flex justify-between items-center">
                                                    <span className="text-xs font-bold text-primary">R$ {f.vrFrete}</span>
                                                    <span className="text-[9px] text-gray-400">{f.data}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                         </div>
                    </div>
                )}
            </div>

            <FreightDetailModal 
                isOpen={isDetailModalOpen} 
                onClose={() => setIsDetailModalOpen(false)} 
                frete={selectedFrete} 
                onSave={(updated) => { onUpdateFrete(updated); setIsDetailModalOpen(false); }} 
            />
        </div>
    );
};

export default FreightSheet;

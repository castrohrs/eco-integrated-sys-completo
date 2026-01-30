
import React, { useState, useMemo } from 'react';
import { useAppStore } from '../hooks/useAppStore';
import { ServiceRecord, Demand, Attachment } from '../types';
import { validateFileFormat, ALLOWED_EXTENSIONS, fileToBase64 } from '../services/fileService';

const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

type SubTab = 'overview' | 'services' | 'financial';

// --- Components ---

const StatCard: React.FC<{ title: string; value: string; icon: string; color: string; subValue?: string }> = ({ title, value, icon, color, subValue }) => (
    <div className={`bg-bg-card p-5 rounded-2xl border-l-4 shadow-lg group hover:border-white/50 transition-all`} style={{ borderLeftColor: color }}>
        <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">{title}</span>
            <i className={`fas ${icon} opacity-50`} style={{ color }}></i>
        </div>
        <div className="text-2xl font-black text-light tracking-tighter">{value}</div>
        {subValue && <div className="text-[9px] font-bold text-gray-400 mt-1">{subValue}</div>}
    </div>
);

const ServiceModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (record: Omit<ServiceRecord, 'id'>) => void;
    recordToEdit: ServiceRecord | null;
    demands: Demand[];
}> = ({ isOpen, onClose, onSave, recordToEdit, demands }) => {
    const [formData, setFormData] = useState<Partial<ServiceRecord>>({
        serviceNumber: '',
        customerName: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        valueCharged: 0,
        valueReceived: 0,
        status: 'Pendente',
        notes: '',
        linkedDemandId: '',
        attachments: []
    });

    React.useEffect(() => {
        if (recordToEdit) {
            setFormData(recordToEdit);
        } else {
            setFormData({
                serviceNumber: String(Math.floor(Math.random() * 1000)).padStart(3, '0'),
                customerName: '',
                description: '',
                date: new Date().toISOString().split('T')[0],
                valueCharged: 0,
                valueReceived: 0,
                status: 'Pendente',
                notes: '',
                linkedDemandId: '',
                attachments: []
            });
        }
    }, [recordToEdit, isOpen]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            if (!validateFileFormat(file)) {
                alert(`Arquivo inválido. Permitidos: ${ALLOWED_EXTENSIONS.join(', ')}`);
                return;
            }
            try {
                const base64 = await fileToBase64(file);
                const newAttachment: Attachment = {
                    id: crypto.randomUUID(),
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    url: base64
                };
                setFormData(prev => ({
                    ...prev,
                    attachments: [...(prev.attachments || []), newAttachment]
                }));
            } catch (err) {
                console.error("Erro ao anexar", err);
            }
        }
    };

    const removeAttachment = (id: string) => {
        setFormData(prev => ({
            ...prev,
            attachments: prev.attachments?.filter(a => a.id !== id)
        }));
    };

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Auto-calculate status if not manually set differently
        let calculatedStatus: ServiceRecord['status'] = formData.status || 'Pendente';
        if (formData.valueReceived! >= formData.valueCharged! && formData.valueCharged! > 0) {
            calculatedStatus = 'Pago';
        } else if (formData.valueReceived! > 0) {
            calculatedStatus = 'Parcial';
        } else {
            calculatedStatus = 'Pendente';
        }

        onSave({ ...formData, status: calculatedStatus } as ServiceRecord);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: (name === 'valueCharged' || name === 'valueReceived') ? parseFloat(value) || 0 : value
        }));
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[3000] p-4 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-bg-card border border-border-color rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto custom-scrollbar" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-border-color flex justify-between items-center bg-bg-card sticky top-0 z-10">
                    <h3 className="text-lg font-black text-light uppercase tracking-wide">
                        {recordToEdit ? 'Editar Serviço' : 'Novo Serviço'}
                    </h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-white"><i className="fas fa-times"></i></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Nº Serviço</label>
                            <input name="serviceNumber" value={formData.serviceNumber} onChange={handleChange} className="w-full bg-bg-main border border-border-color rounded-lg p-2 text-sm text-light font-mono" required />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Data</label>
                            <input type="date" name="date" value={formData.date} onChange={handleChange} className="w-full bg-bg-main border border-border-color rounded-lg p-2 text-sm text-light" required />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Cliente</label>
                        <input name="customerName" value={formData.customerName} onChange={handleChange} className="w-full bg-bg-main border border-border-color rounded-lg p-2 text-sm text-light" placeholder="Nome do Cliente" required />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Descrição do Serviço</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} className="w-full bg-bg-main border border-border-color rounded-lg p-2 text-sm text-light h-20 resize-none" placeholder="Detalhes do serviço prestado..." required />
                    </div>
                    
                    <div className="bg-bg-main/50 p-4 rounded-lg border border-border-color/50 grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-blue-400 uppercase block mb-1">Valor Cobrado (R$)</label>
                            <input type="number" step="0.01" name="valueCharged" value={formData.valueCharged} onChange={handleChange} className="w-full bg-bg-card border border-border-color rounded-lg p-2 text-lg font-bold text-light" required />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-green-400 uppercase block mb-1">Valor Recebido (R$)</label>
                            <input type="number" step="0.01" name="valueReceived" value={formData.valueReceived} onChange={handleChange} className="w-full bg-bg-card border border-border-color rounded-lg p-2 text-lg font-bold text-light" />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Vincular Demanda (Opcional)</label>
                        <select name="linkedDemandId" value={formData.linkedDemandId || ''} onChange={handleChange} className="w-full bg-bg-main border border-border-color rounded-lg p-2 text-sm text-light">
                            <option value="">-- Selecione uma demanda --</option>
                            {demands.map(d => (
                                <option key={d.id} value={d.id}>{d.id} - {d.client} ({d.service})</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Anexos</label>
                        <div className="flex gap-2 items-center">
                            <label className="cursor-pointer bg-secondary/10 text-secondary border border-secondary/30 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-secondary hover:text-white transition-all">
                                <i className="fas fa-paperclip mr-1"></i> Adicionar Arquivo
                                <input type="file" className="hidden" onChange={handleFileChange} />
                            </label>
                        </div>
                        {formData.attachments && formData.attachments.length > 0 && (
                            <div className="mt-2 space-y-1">
                                {formData.attachments.map(att => (
                                    <div key={att.id} className="flex justify-between items-center bg-bg-main p-2 rounded border border-border-color text-xs">
                                        <span className="truncate max-w-[200px] text-gray-300">{att.name}</span>
                                        <button type="button" onClick={() => removeAttachment(att.id)} className="text-red-400 hover:text-red-500"><i className="fas fa-times"></i></button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Notas Internas</label>
                        <input name="notes" value={formData.notes} onChange={handleChange} className="w-full bg-bg-main border border-border-color rounded-lg p-2 text-sm text-gray-400 italic" placeholder="Observações..." />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-border-color/30">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-bold text-gray-400 hover:text-white transition-colors">CANCELAR</button>
                        <button type="submit" className="px-6 py-2 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-lg hover:opacity-90 transition-all shadow-lg">Salvar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const EcoClientes: React.FC = () => {
    const { serviceRecords, addServiceRecord, updateServiceRecord, deleteServiceRecord, demands } = useAppStore();
    const [activeSubTab, setActiveSubTab] = useState<SubTab>('overview');
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [recordToEdit, setRecordToEdit] = useState<ServiceRecord | null>(null);

    // --- Metrics ---
    const metrics = useMemo(() => {
        const totalCharged = serviceRecords.reduce((acc, r) => acc + r.valueCharged, 0);
        const totalReceived = serviceRecords.reduce((acc, r) => acc + r.valueReceived, 0);
        const totalPending = totalCharged - totalReceived;
        const totalServices = serviceRecords.length;

        return { totalCharged, totalReceived, totalPending, totalServices };
    }, [serviceRecords]);

    const filteredRecords = useMemo(() => {
        return serviceRecords.filter(r => 
            r.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
            r.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.serviceNumber.includes(searchTerm)
        ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [serviceRecords, searchTerm]);

    const handleEdit = (record: ServiceRecord) => {
        setRecordToEdit(record);
        setIsModalOpen(true);
    };

    const handleSave = (recordData: Omit<ServiceRecord, 'id'>) => {
        if (recordToEdit) {
            updateServiceRecord({ ...recordData, id: recordToEdit.id });
        } else {
            addServiceRecord(recordData);
        }
        setIsModalOpen(false);
        setRecordToEdit(null);
    };

    const handleDelete = (id: string) => {
        if (confirm('Tem certeza que deseja remover este registro?')) {
            deleteServiceRecord(id);
        }
    };

    const handlePrintReport = () => {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            const date = new Date().toLocaleDateString('pt-BR');
            const rows = filteredRecords.map(r => `
                <tr>
                    <td>${r.serviceNumber}</td>
                    <td>${new Date(r.date).toLocaleDateString('pt-BR')}</td>
                    <td>${r.customerName}</td>
                    <td>${r.description}</td>
                    <td class="text-right">${formatCurrency(r.valueCharged)}</td>
                    <td class="text-right">${formatCurrency(r.valueReceived)}</td>
                    <td class="text-center">${r.status}</td>
                </tr>
            `).join('');

            printWindow.document.write(`
                <html>
                    <head>
                        <title>Relatório Financeiro de Serviços - Eco.Clientes</title>
                        <style>
                            body { font-family: Arial, sans-serif; padding: 20px; }
                            h1 { color: #2c3e50; border-bottom: 2px solid #2c3e50; padding-bottom: 10px; }
                            table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
                            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                            th { background-color: #f2f2f2; font-weight: bold; text-transform: uppercase; }
                            .text-right { text-align: right; }
                            .text-center { text-align: center; }
                            .summary { margin-top: 30px; display: flex; justify-content: space-between; background: #f9f9f9; padding: 15px; border: 1px solid #ddd; }
                            .summary-item { text-align: center; }
                            .summary-val { font-size: 16px; font-weight: bold; margin-top: 5px; }
                            @media print { .no-print { display: none; } }
                        </style>
                    </head>
                    <body>
                        <h1>Relatório Financeiro de Serviços</h1>
                        <p><strong>Data de Emissão:</strong> ${date}</p>
                        
                        <div class="summary">
                            <div class="summary-item">Total Serviços: <div class="summary-val">${metrics.totalServices}</div></div>
                            <div class="summary-item">Total Faturado: <div class="summary-val" style="color: #2980b9">${formatCurrency(metrics.totalCharged)}</div></div>
                            <div class="summary-item">Total Recebido: <div class="summary-val" style="color: #27ae60">${formatCurrency(metrics.totalReceived)}</div></div>
                            <div class="summary-item">Pendente: <div class="summary-val" style="color: #c0392b">${formatCurrency(metrics.totalPending)}</div></div>
                        </div>

                        <table>
                            <thead>
                                <tr>
                                    <th>Nº</th>
                                    <th>Data</th>
                                    <th>Cliente</th>
                                    <th>Descrição</th>
                                    <th class="text-right">Cobrado</th>
                                    <th class="text-right">Recebido</th>
                                    <th class="text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody>${rows}</tbody>
                        </table>
                        <script>window.onload = function() { window.print(); }</script>
                    </body>
                </html>
            `);
            printWindow.document.close();
        }
    };

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-end border-b border-border-color/30 pb-6 gap-4">
                <div>
                    <h2 className="text-3xl font-black text-light tracking-tighter uppercase leading-none">
                        ECO.<span className="text-primary">CLIENTES</span>
                    </h2>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mt-2">
                        Gestão de Contratos e Serviços
                    </p>
                </div>
                
                <div className="flex bg-bg-card p-1 rounded-xl border border-border-color/50">
                    {[
                        { id: 'overview', label: 'Visão Geral', icon: 'fa-chart-pie' },
                        { id: 'services', label: 'Meus Serviços', icon: 'fa-list-alt' },
                        { id: 'financial', label: 'Financeiro', icon: 'fa-coins' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveSubTab(tab.id as SubTab)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeSubTab === tab.id ? 'bg-primary text-white shadow-lg' : 'text-gray-500 hover:text-light'}`}
                        >
                            <i className={`fas ${tab.icon}`}></i> {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            
            {/* --- VISÃO GERAL --- */}
            {activeSubTab === 'overview' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard 
                            title="Total Serviços" 
                            value={metrics.totalServices.toString()} 
                            icon="fa-clipboard-list" 
                            color="#3b82f6" 
                        />
                        <StatCard 
                            title="Total Faturado" 
                            value={formatCurrency(metrics.totalCharged)} 
                            icon="fa-file-invoice-dollar" 
                            color="#14b8a6" 
                        />
                        <StatCard 
                            title="Valor Recebido" 
                            value={formatCurrency(metrics.totalReceived)} 
                            icon="fa-check-circle" 
                            color="#22c55e" 
                            subValue={`${metrics.totalCharged > 0 ? ((metrics.totalReceived / metrics.totalCharged) * 100).toFixed(1) : 0}% do total`}
                        />
                        <StatCard 
                            title="Pendente" 
                            value={formatCurrency(metrics.totalPending)} 
                            icon="fa-clock" 
                            color="#ef4444" 
                        />
                    </div>
                    
                    <div className="bg-bg-card rounded-3xl border border-border-color/50 p-8 shadow-2xl">
                         <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest">Últimos Serviços</h3>
                            <button onClick={() => setActiveSubTab('services')} className="text-[10px] font-bold text-primary hover:underline">VER TODOS</button>
                         </div>
                         <div className="space-y-3">
                            {serviceRecords.slice(0, 5).map(record => (
                                <div key={record.id} className="flex items-center justify-between p-4 bg-bg-main/30 rounded-2xl border border-transparent hover:border-white/10 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-inner ${record.status === 'Pago' ? 'bg-success/20 text-success' : record.status === 'Parcial' ? 'bg-warning/20 text-warning' : 'bg-danger/20 text-danger'}`}>
                                            <i className={`fas ${record.status === 'Pago' ? 'fa-check' : 'fa-hourglass-half'}`}></i>
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-light flex items-center gap-2">
                                                {record.description}
                                                {record.linkedDemandId && <i className="fas fa-link text-xs text-secondary" title="Demanda Vinculada"></i>}
                                                {record.attachments && record.attachments.length > 0 && <i className="fas fa-paperclip text-xs text-gray-400" title="Anexos"></i>}
                                            </p>
                                            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">{record.customerName} • {new Date(record.date).toLocaleDateString('pt-BR')}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black text-light">{formatCurrency(record.valueCharged)}</p>
                                        <p className={`text-[9px] font-bold uppercase tracking-widest ${record.status === 'Pago' ? 'text-success' : 'text-danger'}`}>{record.status}</p>
                                    </div>
                                </div>
                            ))}
                            {serviceRecords.length === 0 && <p className="text-center text-gray-500 italic py-4">Nenhum serviço registrado.</p>}
                         </div>
                    </div>
                </div>
            )}

            {/* --- SERVIÇOS E FINANCEIRO (Shared List View basically, just different emphasis maybe) --- */}
            {(activeSubTab === 'services' || activeSubTab === 'financial') && (
                <div className="bg-bg-card rounded-3xl border border-border-color/50 shadow-2xl overflow-hidden flex flex-col min-h-[600px]">
                    {/* Toolbar */}
                    <div className="p-6 border-b border-border-color/50 flex flex-col md:flex-row justify-between items-center gap-4 bg-bg-main/20">
                        <div className="relative w-full md:w-96 group">
                            <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors"></i>
                            <input 
                                type="text" 
                                placeholder="BUSCAR CLIENTE, SERVIÇO OU NÚMERO..." 
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full bg-bg-main border border-border-color rounded-xl py-3 pl-10 pr-4 text-xs font-bold text-light focus:border-primary outline-none transition-all uppercase tracking-wider placeholder-gray-700"
                            />
                        </div>
                        <div className="flex gap-3">
                            <button 
                                onClick={handlePrintReport}
                                className="bg-bg-main hover:bg-bg-card text-light border border-border-color hover:border-primary px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow transition-all flex items-center gap-2"
                                title="Imprimir Relatório"
                            >
                                <i className="fas fa-print"></i> Relatório
                            </button>
                            <button 
                                onClick={() => { setRecordToEdit(null); setIsModalOpen(true); }}
                                className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 transition-all flex items-center gap-2 transform active:scale-95"
                            >
                                <i className="fas fa-plus"></i> Novo Serviço
                            </button>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="flex-1 overflow-auto custom-scrollbar p-2">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-bg-main text-gray-500 text-[9px] font-black uppercase tracking-widest sticky top-0 z-10">
                                <tr>
                                    <th className="p-4 rounded-l-xl">Status</th>
                                    <th className="p-4">Nº / Data</th>
                                    <th className="p-4">Cliente</th>
                                    <th className="p-4">Descrição</th>
                                    <th className="p-4 text-right">Valor Cobrado</th>
                                    {activeSubTab === 'financial' && <th className="p-4 text-right">Recebido</th>}
                                    {activeSubTab === 'financial' && <th className="p-4 text-center">Progresso</th>}
                                    <th className="p-4 text-right rounded-r-xl">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-color/10">
                                {filteredRecords.map(record => {
                                    const percentPaid = record.valueCharged > 0 ? (record.valueReceived / record.valueCharged) * 100 : 0;
                                    return (
                                        <tr key={record.id} className="hover:bg-white/5 transition-colors group">
                                            <td className="p-4">
                                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${record.status === 'Pago' ? 'bg-success/10 text-success border-success/20' : record.status === 'Parcial' ? 'bg-warning/10 text-warning border-warning/20' : 'bg-danger/10 text-danger border-danger/20'}`}>
                                                    {record.status}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <div className="font-mono text-xs text-light font-bold">#{record.serviceNumber}</div>
                                                <div className="text-[9px] text-gray-500 mt-0.5">{new Date(record.date).toLocaleDateString('pt-BR')}</div>
                                            </td>
                                            <td className="p-4 text-sm font-bold text-light">{record.customerName}</td>
                                            <td className="p-4 text-xs text-gray-400 max-w-xs truncate" title={record.description}>
                                                {record.description}
                                                {record.linkedDemandId && <i className="fas fa-link ml-2 text-secondary" title={`Demanda vinculada: ${record.linkedDemandId}`}></i>}
                                                {record.attachments && record.attachments.length > 0 && <i className="fas fa-paperclip ml-2 text-gray-500" title={`${record.attachments.length} anexo(s)`}></i>}
                                            </td>
                                            <td className="p-4 text-right text-sm font-mono font-bold text-light">{formatCurrency(record.valueCharged)}</td>
                                            
                                            {activeSubTab === 'financial' && (
                                                <>
                                                    <td className="p-4 text-right text-sm font-mono font-bold text-success">{formatCurrency(record.valueReceived)}</td>
                                                    <td className="p-4 w-32">
                                                        <div className="w-full h-1.5 bg-bg-main rounded-full overflow-hidden">
                                                            <div className={`h-full rounded-full ${percentPaid >= 100 ? 'bg-success' : 'bg-warning'}`} style={{ width: `${Math.min(percentPaid, 100)}%` }}></div>
                                                        </div>
                                                        <div className="text-[8px] text-center text-gray-500 mt-1 font-mono">{percentPaid.toFixed(0)}%</div>
                                                    </td>
                                                </>
                                            )}

                                            <td className="p-4 text-right">
                                                <div className="flex justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => handleEdit(record)} className="p-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500 hover:text-white transition-all"><i className="fas fa-pencil-alt text-xs"></i></button>
                                                    <button onClick={() => handleDelete(record.id)} className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-all"><i className="fas fa-trash text-xs"></i></button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        {filteredRecords.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-20 text-gray-600">
                                <i className="fas fa-folder-open text-4xl mb-4 opacity-50"></i>
                                <p className="text-xs font-bold uppercase tracking-widest">Nenhum registro encontrado</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <ServiceModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSave={handleSave} 
                recordToEdit={recordToEdit} 
                demands={demands}
            />
        </div>
    );
};

export default EcoClientes;

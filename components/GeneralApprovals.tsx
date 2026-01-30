
import React, { useState, useMemo } from 'react';
import { useAppStore } from '../hooks/useAppStore';
import { useAuth } from '../hooks/useAuth';
import { ApprovalRequest, ApprovalType, ApprovalStatus } from '../types';

const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const typeColors: Record<ApprovalType, string> = {
    'Serviço': 'border-blue-500 text-blue-500',
    'Peças': 'border-orange-500 text-orange-500',
    'Roupas': 'border-purple-500 text-purple-500',
    'Pagamento': 'border-green-500 text-green-500',
    'Outros': 'border-gray-500 text-gray-500',
};

const GeneralApprovals: React.FC = () => {
    const { approvalRequests, addApprovalRequest, approveRequest, rejectRequest, addNotification } = useAppStore();
    const { currentUser } = useAuth();
    const [view, setView] = useState<'list' | 'kanban'>('list');
    const [filter, setFilter] = useState<'pending' | 'history' | 'all'>('pending');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [rejectModalOpen, setRejectModalOpen] = useState<string | null>(null);
    const [rejectReason, setRejectReason] = useState('');

    const [newRequest, setNewRequest] = useState<{ type: ApprovalType; description: string; value: string; requester: string; }>({
        type: 'Serviço', description: '', value: '', requester: currentUser?.name || '',
    });

    const filteredRequests = useMemo(() => {
        let reqs = approvalRequests;
        if (filter === 'pending') reqs = reqs.filter(r => r.status === 'pending');
        else if (filter === 'history') reqs = reqs.filter(r => r.status !== 'pending');
        
        return reqs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [approvalRequests, filter]);

    const sendEmailSimulation = (reqId: string, status: string, details?: string) => {
        const req = approvalRequests.find(r => r.id === reqId);
        if (!req) return;
        
        console.log(`[EMAIL SIMULADO]
        Para: ${req.requester}@empresa.com
        Assunto: [${status.toUpperCase()}] Solicitação #${reqId}
        Corpo: 
        Sua solicitação "${req.description}" no valor de ${formatCurrency(req.value)} foi ${status}.
        ${details ? `Motivo: ${details}` : ''}
        Aprovador: ${currentUser?.name}
        Data: ${new Date().toLocaleString()}
        `);
        
        addNotification({ message: `E-mail de notificação enviado para ${req.requester}`, type: 'info' });
    };

    const handleApprove = (id: string) => {
        approveRequest(id);
        sendEmailSimulation(id, 'aprovada');
    };

    const handleRejectSubmit = () => {
        if (rejectModalOpen && rejectReason.trim()) {
            rejectRequest(rejectModalOpen, rejectReason);
            sendEmailSimulation(rejectModalOpen, 'reprovada', rejectReason);
            setRejectModalOpen(null);
            setRejectReason('');
        } else {
            alert("Justificativa é obrigatória.");
        }
    };

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newRequest.description || !newRequest.value) return;
        addApprovalRequest({
            type: newRequest.type,
            description: newRequest.description,
            value: parseFloat(newRequest.value),
            requester: newRequest.requester,
            date: new Date().toISOString().split('T')[0],
        });
        setIsFormOpen(false);
        setNewRequest({ type: 'Serviço', description: '', value: '', requester: currentUser?.name || '' });
    };
    
    const handlePrintReport = () => {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            const html = `
                <html>
                <head>
                    <title>Relatório de Aprovações</title>
                    <style>
                        body { font-family: sans-serif; padding: 20px; }
                        h1 { color: #1e293b; border-bottom: 2px solid #ccc; padding-bottom: 10px; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        th { background-color: #f1f5f9; text-transform: uppercase; }
                        .status-approved { color: green; font-weight: bold; }
                        .status-rejected { color: red; font-weight: bold; }
                        .status-pending { color: orange; font-weight: bold; }
                    </style>
                </head>
                <body>
                    <h1>Relatório Geral de Aprovações</h1>
                    <p>Gerado em: ${new Date().toLocaleString()}</p>
                    <table>
                        <thead>
                            <tr>
                                <th>Data</th>
                                <th>Tipo</th>
                                <th>Descrição</th>
                                <th>Valor</th>
                                <th>Solicitante</th>
                                <th>Status</th>
                                <th>Justificativa</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${filteredRequests.map(r => `
                                <tr>
                                    <td>${new Date(r.date).toLocaleDateString('pt-BR')}</td>
                                    <td>${r.type}</td>
                                    <td>${r.description}</td>
                                    <td>${formatCurrency(r.value)}</td>
                                    <td>${r.requester}</td>
                                    <td class="status-${r.status}">${r.status.toUpperCase()}</td>
                                    <td>${r.justification || '-'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    <script>window.print();</script>
                </body>
                </html>
            `;
            printWindow.document.write(html);
            printWindow.document.close();
        }
    };

    const renderKanban = () => {
        const statuses: ApprovalStatus[] = ['pending', 'approved', 'rejected'];
        const titles = { pending: 'Pendentes', approved: 'Aprovados', rejected: 'Rejeitados' };
        const colors = { pending: 'border-yellow-500', approved: 'border-green-500', rejected: 'border-red-500' };

        return (
            <div className="flex gap-4 overflow-x-auto pb-4 h-full">
                {statuses.map(status => {
                    const items = approvalRequests.filter(r => r.status === status);
                    return (
                        <div key={status} className={`flex-1 min-w-[300px] bg-bg-main rounded-xl border-t-4 ${colors[status]} p-4 flex flex-col`}>
                            <h3 className="font-bold text-light mb-4 flex justify-between uppercase text-sm tracking-wider">
                                {titles[status]} <span className="bg-bg-card px-2 rounded">{items.length}</span>
                            </h3>
                            <div className="space-y-3 overflow-y-auto custom-scrollbar pr-2 flex-1">
                                {items.map(req => (
                                    <div key={req.id} className="bg-bg-card p-4 rounded-lg border border-border-color shadow-sm hover:border-primary transition-all">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${typeColors[req.type]}`}>{req.type}</span>
                                            <span className="text-[10px] text-gray-500">{new Date(req.date).toLocaleDateString('pt-BR')}</span>
                                        </div>
                                        <h4 className="font-bold text-light text-sm mb-1">{req.description}</h4>
                                        <p className="text-xs text-gray-400 mb-3">{req.requester}</p>
                                        <div className="flex justify-between items-center pt-2 border-t border-border-color/50">
                                            <span className="font-bold text-light">{formatCurrency(req.value)}</span>
                                            {status === 'pending' && (
                                                <div className="flex gap-2">
                                                    <button onClick={() => setRejectModalOpen(req.id)} className="text-red-400 hover:text-white p-1 rounded bg-red-500/10"><i className="fas fa-times"></i></button>
                                                    <button onClick={() => handleApprove(req.id)} className="text-green-400 hover:text-white p-1 rounded bg-green-500/10"><i className="fas fa-check"></i></button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {items.length === 0 && <div className="text-center text-gray-600 text-xs italic mt-4">Vazio</div>}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="bg-bg-card rounded-lg p-6 shadow-lg min-h-[80vh] flex flex-col">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 border-b border-border-color pb-4 shrink-0">
                <h2 className="text-2xl font-bold text-light flex items-center gap-3"><i className="fas fa-check-double text-primary"></i> Aprovações</h2>
                <div className="flex flex-wrap gap-3 items-center">
                    <button onClick={handlePrintReport} className="text-gray-400 hover:text-light mr-2" title="Gerar Relatório"><i className="fas fa-print"></i></button>
                    
                    <div className="bg-bg-main rounded-lg p-1 flex">
                        <button onClick={() => setView('list')} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${view === 'list' ? 'bg-bg-card text-light shadow-sm' : 'text-gray-500 hover:text-light'}`}><i className="fas fa-list"></i> Lista</button>
                        <button onClick={() => setView('kanban')} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${view === 'kanban' ? 'bg-bg-card text-light shadow-sm' : 'text-gray-500 hover:text-light'}`}><i className="fas fa-columns"></i> Quadros</button>
                    </div>

                    {view === 'list' && (
                        <select 
                            value={filter} 
                            onChange={(e) => setFilter(e.target.value as any)} 
                            className="bg-bg-main text-xs text-light p-2 rounded border border-border-color focus:border-primary outline-none"
                        >
                            <option value="pending">Pendentes</option>
                            <option value="history">Histórico</option>
                            <option value="all">Todos</option>
                        </select>
                    )}

                    <button onClick={() => setIsFormOpen(!isFormOpen)} className={`px-4 py-2 rounded-md font-bold text-xs flex items-center gap-2 shadow-md transition-all ${isFormOpen ? 'bg-border-color text-gray-300' : 'bg-primary hover:bg-opacity-90 text-white'}`}>
                        <i className={`fas ${isFormOpen ? 'fa-minus' : 'fa-plus'}`}></i> {isFormOpen ? 'Cancelar' : 'Nova'}
                    </button>
                </div>
            </div>

            {isFormOpen && (
                <form onSubmit={handleCreateSubmit} className="bg-bg-main/50 p-6 rounded-lg border border-border-color mb-8 animate-fade-in shadow-inner grid grid-cols-1 md:grid-cols-4 gap-4 shrink-0">
                    <div>
                        <label className="block text-xs font-bold text-gray-400 mb-1">Tipo</label>
                        <select value={newRequest.type} onChange={e => setNewRequest({...newRequest, type: e.target.value as ApprovalType})} className="w-full bg-bg-card border border-border-color rounded p-2 text-light">
                            {Object.keys(typeColors).map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-400 mb-1">Descrição</label>
                        <input type="text" value={newRequest.description} onChange={e => setNewRequest({...newRequest, description: e.target.value})} className="w-full bg-bg-card border border-border-color rounded p-2 text-light" required />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-400 mb-1">Valor (R$)</label>
                        <input type="number" step="0.01" value={newRequest.value} onChange={e => setNewRequest({...newRequest, value: e.target.value})} className="w-full bg-bg-card border border-border-color rounded p-2 text-light" required />
                    </div>
                    <div className="md:col-span-4 flex justify-end"><button type="submit" className="px-6 py-2 bg-success text-white font-bold rounded hover:bg-green-600 shadow-lg">Enviar</button></div>
                </form>
            )}

            <div className="flex-1 overflow-hidden">
                {view === 'list' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto custom-scrollbar h-full pb-4">
                        {filteredRequests.map(request => (
                            <div key={request.id} className={`bg-bg-main border-l-4 ${typeColors[request.type].split(' ')[0]} rounded-r-lg p-5 shadow-sm hover:shadow-md transition-all h-fit`}>
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-xs font-bold px-2 py-1 rounded-full bg-bg-card text-gray-400 border border-border-color">{request.type}</span>
                                    <span className="text-xs text-gray-500">{new Date(request.date).toLocaleDateString('pt-BR')}</span>
                                </div>
                                <h3 className="font-bold text-lg text-light mb-1">{request.description}</h3>
                                <p className="text-sm text-gray-400 mb-4">Solicitante: <span className="text-light">{request.requester}</span></p>
                                
                                <div className="flex justify-between items-end border-t border-border-color pt-3">
                                    <span className="text-xl font-bold text-light">{formatCurrency(request.value)}</span>
                                    {request.status === 'pending' && (
                                        <div className="flex gap-2">
                                            <button onClick={() => setRejectModalOpen(request.id)} className="w-8 h-8 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white flex items-center justify-center transition-colors"><i className="fas fa-times"></i></button>
                                            <button onClick={() => handleApprove(request.id)} className="w-8 h-8 rounded-full bg-green-500/20 text-green-400 hover:bg-green-500 hover:text-white flex items-center justify-center transition-colors"><i className="fas fa-check"></i></button>
                                        </div>
                                    )}
                                    {request.status !== 'pending' && <span className={`text-xs font-bold uppercase ${request.status === 'approved' ? 'text-green-500' : 'text-red-500'}`}>{request.status}</span>}
                                </div>
                            </div>
                        ))}
                        {filteredRequests.length === 0 && <div className="col-span-full text-center text-gray-500 py-10">Nenhuma solicitação encontrada.</div>}
                    </div>
                ) : (
                    renderKanban()
                )}
            </div>

            {rejectModalOpen && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[2000] p-4">
                    <div className="bg-bg-card p-6 rounded-lg shadow-xl w-full max-w-md border border-border-color">
                        <h3 className="text-xl font-bold text-red-400 mb-4">Motivo da Rejeição</h3>
                        <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} className="w-full bg-bg-main border border-border-color rounded p-3 text-light min-h-[100px]" autoFocus></textarea>
                        <div className="flex justify-end gap-2 mt-4">
                            <button onClick={() => setRejectModalOpen(null)} className="px-4 py-2 bg-border-color rounded text-light">Cancelar</button>
                            <button onClick={handleRejectSubmit} className="px-4 py-2 bg-red-600 text-white font-bold rounded">Confirmar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GeneralApprovals;

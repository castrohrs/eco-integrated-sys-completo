
import React, { useState, useMemo } from 'react';
import { useAppStore } from '../hooks/useAppStore';
import { useAuth } from '../hooks/useAuth';
import { ContainerRecord, ContainerSchedule, GateLog, ContainerStatus, Terminal, GateMovementType } from '../types';

// Declare QR Code globally if loaded via CDN
declare const QRCode: any;

// --- DADOS ESTRUTURADOS ---

const ARMADORES_LIST = [
    // Globais
    'MSC', 'Maersk', 'CMA CGM', 'Hapag-Lloyd', 'Evergreen', 'COSCO Shipping', 'ONE (Ocean Network Express)', 'Yang Ming', 'ZIM', 'HMM',
    // Regionais / América do Sul
    'Hamburg Süd', 'Sealand', 'Log-In Logística', 'Aliança Navegação'
];

const DEPOTS_BY_STATE: Record<string, string[]> = {
    'SP': ['Santos Brasil Depot', 'Localfrio Depot', 'Deicmar Depot', 'Multirio Depot (base SP)', 'Rodrimar Depot', 'Libra Depot', 'Santos Logística'],
    'RJ': ['Multi Rio', 'Chácara Arcampo', 'Libra Rio', 'ICTSI Rio Depot', 'Triunfo Logística', 'Wilson Sons Depot'],
    'SC': ['Portonave Depot', 'Multilog Itajaí', 'Multilog Navegantes', 'Itapoá Depot', 'Fiesc Logística'],
    'PR': ['TCP Depot Paranaguá', 'Multilog Paranaguá', 'Rocha Terminais Depot'],
    'RS': ['Tecon Rio Grande Depot', 'Multilog Rio Grande'],
    'ES': ['TVV Depot', 'Portocel Depot', 'Multilog Vitória'],
    'BA': ['Wilson Sons Salvador', 'Tecon Salvador Depot'],
    'PE': ['Suape Depot', 'APM Terminals Suape'],
    'CE': ['Pecém Depot', 'CSP Logística'],
    'MA': ['Tegram Depot', 'Porto do Itaqui Depot'],
    'PA': ['Vila do Conde Depot', 'Outeiro Logística']
};

const PORTS_BY_STATE: Record<string, string[]> = {
    'AC': ['Porto Fluvial de Rio Branco'],
    'AL': ['Porto de Maceió'],
    'AM': ['Porto de Manaus', 'Porto de Itacoatiara', 'Porto de Coari', 'Porto de Parintins'],
    'AP': ['Porto de Santana'],
    'BA': ['Porto de Salvador', 'Porto de Aratu', 'Porto de Ilhéus', 'Tecon Salvador'],
    'CE': ['Porto de Fortaleza (Mucuripe)', 'Porto do Pecém'],
    'ES': ['Porto de Vitória', 'Porto de Vila Velha (TVV)', 'Porto de Tubarão', 'Porto de Praia Mole', 'Porto de Barra do Riacho', 'Portocel'],
    'MA': ['Porto do Itaqui', 'Porto da Alumar', 'Porto de Ponta da Madeira', 'Tegram'],
    'MG': ['Portos Fluviais (diversos)'],
    'MS': ['Porto de Corumbá', 'Porto de Ladário'],
    'MT': ['Porto de Cáceres', 'Porto de Miritituba'],
    'PA': ['Porto de Belém', 'Porto de Vila do Conde', 'Porto de Santarém', 'Porto de Outeiro', 'Porto de Barcarena'],
    'PB': ['Porto de Cabedelo'],
    'PE': ['Porto do Recife', 'Porto de Suape'],
    'PI': ['Porto de Luís Correia'],
    'PR': ['Porto de Paranaguá', 'TCP Paranaguá', 'Porto de Antonina'],
    'RJ': ['Porto do Rio de Janeiro', 'Porto de Itaguaí (Sepetiba)', 'Porto de Niterói', 'Porto do Forno', 'Multi Rio', 'ICTSI Rio', 'Libra Rio'],
    'RN': ['Porto de Natal'],
    'RO': ['Porto de Porto Velho'],
    'RR': ['Portos fluviais (Rio Branco)'],
    'RS': ['Porto do Rio Grande', 'Tecon Rio Grande', 'Porto de Pelotas', 'Porto de Porto Alegre'],
    'SC': ['Porto de Itajaí', 'Porto de Navegantes (Portonave)', 'Porto de Itapoá', 'APM Terminals Itajaí', 'Porto de São Francisco do Sul', 'Porto de Imbituba'],
    'SE': ['Porto de Barra dos Coqueiros'],
    'SP': ['Porto de Santos', 'BTP', 'Santos Brasil', 'DP World Santos', 'Porto de São Sebastião'],
    'TO': ['Porto de Palmas', 'Porto Nacional']
};

const UF_LIST = Object.keys(PORTS_BY_STATE).sort();

const StatusBadge = ({ status, type }: { status: string, type: 'status' | 'situation' }) => {
    let color = 'bg-gray-500/20 text-gray-300';
    if (type === 'status') {
        color = status === 'CHEIO' ? 'bg-blue-500/20 text-blue-300' : 'bg-yellow-500/20 text-yellow-300';
    } else {
        switch(status) {
            case 'AGENDADO': color = 'bg-purple-500/20 text-purple-300'; break;
            case 'NO PÁTIO': color = 'bg-green-500/20 text-green-300'; break;
            case 'EM TRÂNSITO': color = 'bg-orange-500/20 text-orange-300'; break;
            case 'ENTREGUE': color = 'bg-blue-600/20 text-blue-300'; break;
        }
    }
    return <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${color}`}>{status}</span>;
};

const EcoContainer: React.FC = () => {
    const { 
        ecoContainerRecords, ecoContainerSchedules, ecoGateLogs,
        addContainerRecord, updateContainerRecord, deleteContainerRecord,
        addContainerSchedule, updateContainerSchedule,
        registerGateMovement
    } = useAppStore();
    const { currentUser } = useAuth();

    const [activeTab, setActiveTab] = useState<'dashboard' | 'schedules' | 'yard' | 'gate'>('dashboard');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterTerminal, setFilterTerminal] = useState<string>('ALL');
    const [filterStatus, setFilterStatus] = useState<ContainerStatus | 'ALL'>('ALL');

    // Forms State
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
    const [scheduleForm, setScheduleForm] = useState<any>({ type: 'VAZIO', status: 'PENDENTE', uf: 'RJ', terminal: '', depot: '' });
    
    const [isGateModalOpen, setIsGateModalOpen] = useState(false);
    const [gateForm, setGateForm] = useState<Partial<GateLog>>({ movement: 'ENTRADA', status: 'VAZIO' });

    // --- Computed Data ---
    const filteredRecords = useMemo(() => {
        return ecoContainerRecords.filter(r => {
            const matchSearch = r.containerNumber.includes(searchTerm.toUpperCase()) || r.booking?.includes(searchTerm.toUpperCase());
            const matchTerm = filterTerminal === 'ALL' || r.terminal === filterTerminal;
            const matchStatus = filterStatus === 'ALL' || r.status === filterStatus;
            return matchSearch && matchTerm && matchStatus;
        });
    }, [ecoContainerRecords, searchTerm, filterTerminal, filterStatus]);

    const stats = useMemo(() => {
        return {
            total: ecoContainerRecords.length,
            inYard: ecoContainerRecords.filter(r => r.situation === 'NO PÁTIO').length,
            scheduled: ecoContainerSchedules.filter(s => s.status === 'PENDENTE').length,
            alerts: ecoContainerRecords.filter(r => r.status === 'CHEIO' && !r.booking).length
        };
    }, [ecoContainerRecords, ecoContainerSchedules]);

    // --- Handlers ---
    const handleAddSchedule = () => {
        if (!scheduleForm.containerNumber || !scheduleForm.date) {
            alert("Preencha Container e Data.");
            return;
        }
        
        // Concatena informações para salvar no campo terminal se necessário ou cria campos novos no tipo
        const finalTerminal = scheduleForm.terminal || scheduleForm.depot || scheduleForm.uf;

        addContainerSchedule({
            ...scheduleForm,
            terminal: finalTerminal
        } as ContainerSchedule);

        setIsScheduleModalOpen(false);
        setScheduleForm({ type: 'VAZIO', status: 'PENDENTE', uf: 'RJ', terminal: '', depot: '' });
    };

    const handleConfirmSchedule = (schedule: ContainerSchedule) => {
        if (confirm("Confirmar este agendamento?")) {
            updateContainerSchedule({ ...schedule, status: 'CONFIRMADO' });
        }
    };

    const handleGateSubmit = () => {
        if (!gateForm.containerNumber || !gateForm.motorista) {
            alert("Container e Motorista são obrigatórios");
            return;
        }
        registerGateMovement({ 
            ...gateForm, 
            conferente: currentUser?.name || 'Sistema' 
        } as GateLog);
        setIsGateModalOpen(false);
        setGateForm({ movement: 'ENTRADA', status: 'VAZIO' });
    };

    const deleteRecord = (id: string) => {
        if (confirm("Deseja excluir este registro permanentemente?")) deleteContainerRecord(id);
    };

    const generateReport = (record: ContainerRecord) => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            alert("Habilite os popups para gerar o relatório.");
            return;
        }

        const htmlContent = `
            <html>
            <head>
                <title>Relatório Container - ${record.containerNumber}</title>
                <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
                <style>
                    body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #333; background: #fff; }
                    .header { display: flex; justify-content: space-between; border-bottom: 3px solid #14b8a6; padding-bottom: 20px; margin-bottom: 30px; }
                    .title { font-size: 24px; font-weight: 900; text-transform: uppercase; color: #0f172a; }
                    .subtitle { font-size: 12px; color: #64748b; margin-top: 5px; font-weight: bold; letter-spacing: 1px; }
                    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
                    .box { background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; }
                    .label { font-size: 10px; text-transform: uppercase; color: #94a3b8; font-weight: 700; margin-bottom: 4px; display: block; }
                    .value { font-size: 16px; font-weight: 600; color: #0f172a; }
                    .qrcode-container { display: flex; flex-direction: column; align-items: center; justify-content: center; margin-top: 40px; padding: 20px; border: 2px dashed #14b8a6; border-radius: 12px; }
                    .footer { margin-top: 50px; text-align: center; font-size: 10px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 10px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <div>
                        <div class="title">ECONTAINER REPORT</div>
                        <div class="subtitle">IMPÉRIO ECO LOG • SISTEMA DE CONTROLE</div>
                    </div>
                    <div style="text-align: right;">
                        <div class="value">${record.containerNumber}</div>
                        <div class="label">ID DO EQUIPAMENTO</div>
                    </div>
                </div>

                <div class="grid">
                    <div class="box"><span class="label">Armador</span><div class="value">${record.armador || '-'}</div></div>
                    <div class="box"><span class="label">Tipo</span><div class="value">${record.type}</div></div>
                    <div class="box"><span class="label">Local Atual</span><div class="value">${record.terminal}</div></div>
                    <div class="box"><span class="label">Situação</span><div class="value">${record.situation}</div></div>
                    <div class="box"><span class="label">Booking / BL</span><div class="value">${record.booking || record.bl || '-'}</div></div>
                    <div class="box"><span class="label">Status Carga</span><div class="value">${record.status}</div></div>
                </div>

                <div class="qrcode-container">
                    <div id="qrcode"></div>
                    <p style="margin-top: 10px; font-size: 12px; font-weight: bold;">${record.id}</p>
                </div>

                <div class="footer">
                    Gerado em: ${new Date().toLocaleString('pt-BR')} • Operador: ${currentUser?.name || 'Sistema'}
                </div>

                <script>
                    new QRCode(document.getElementById("qrcode"), {
                        text: "${record.id} | ${record.containerNumber} | ${record.status}",
                        width: 128,
                        height: 128
                    });
                    setTimeout(() => window.print(), 500);
                </script>
            </body>
            </html>
        `;

        printWindow.document.write(htmlContent);
        printWindow.document.close();
    };

    return (
        <div className="space-y-6 animate-fade-in pb-20">
            {/* Header / Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-bg-card p-4 rounded-xl border-l-4 border-primary shadow-lg">
                    <p className="text-[10px] font-black uppercase text-gray-500">Total Containers</p>
                    <p className="text-2xl font-black text-white">{stats.total}</p>
                </div>
                <div className="bg-bg-card p-4 rounded-xl border-l-4 border-green-500 shadow-lg">
                    <p className="text-[10px] font-black uppercase text-gray-500">No Pátio</p>
                    <p className="text-2xl font-black text-white">{stats.inYard}</p>
                </div>
                <div className="bg-bg-card p-4 rounded-xl border-l-4 border-purple-500 shadow-lg">
                    <p className="text-[10px] font-black uppercase text-gray-500">Agendados</p>
                    <p className="text-2xl font-black text-white">{stats.scheduled}</p>
                </div>
                <div className="bg-bg-card p-4 rounded-xl border-l-4 border-red-500 shadow-lg">
                    <p className="text-[10px] font-black uppercase text-gray-500">Pendências Doc</p>
                    <p className="text-2xl font-black text-white">{stats.alerts}</p>
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-bg-card p-4 rounded-xl border border-white/10">
                <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
                    {['dashboard', 'schedules', 'yard', 'gate'].map(tab => (
                        <button 
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${activeTab === tab ? 'bg-secondary text-white' : 'bg-bg-main text-gray-500 hover:text-white'}`}
                        >
                            {tab === 'dashboard' ? 'Painel Geral' : tab === 'schedules' ? 'Agendamentos' : tab === 'yard' ? 'Pátio' : 'Portaria'}
                        </button>
                    ))}
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <button onClick={() => setIsScheduleModalOpen(true)} className="flex-1 md:flex-none px-4 py-2 bg-primary text-black font-bold text-xs rounded-lg uppercase hover:opacity-90 transition-all">+ Agendar</button>
                    <button onClick={() => setIsGateModalOpen(true)} className="flex-1 md:flex-none px-4 py-2 bg-white/10 text-white font-bold text-xs rounded-lg uppercase hover:bg-white/20 transition-all">Registrar Acesso</button>
                </div>
            </div>

            {/* Content Area */}
            <div className="bg-bg-card border border-white/5 rounded-2xl overflow-hidden min-h-[500px]">
                
                {/* DASHBOARD & YARD VIEW (Shared Table for simplicity in MVP) */}
                {(activeTab === 'dashboard' || activeTab === 'yard') && (
                    <div className="p-4">
                        <div className="flex gap-4 mb-4">
                            <input 
                                type="text" 
                                placeholder="BUSCAR CONTAINER / BOOKING..." 
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="bg-bg-main border border-white/10 rounded-lg px-4 py-2 text-xs text-white focus:border-primary outline-none flex-1 uppercase"
                            />
                            <select onChange={e => setFilterTerminal(e.target.value)} className="bg-bg-main border border-white/10 rounded-lg px-2 text-xs text-white">
                                <option value="ALL">TODOS TERMINAIS</option>
                                <option value="RJ">RIO DE JANEIRO</option>
                                <option value="SANTOS">SANTOS</option>
                            </select>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-bg-main text-[10px] uppercase font-black text-gray-500">
                                    <tr>
                                        <th className="p-3">Container</th>
                                        <th className="p-3">Tipo</th>
                                        <th className="p-3">Status</th>
                                        <th className="p-3">Situação</th>
                                        <th className="p-3">Armador</th>
                                        <th className="p-3">Local</th>
                                        <th className="p-3">Booking/BL</th>
                                        <th className="p-3 text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="text-xs text-gray-300 divide-y divide-white/5">
                                    {filteredRecords.map(r => (
                                        <tr key={r.id} className="hover:bg-white/5 transition-colors group">
                                            <td className="p-3 font-bold text-white font-mono">{r.containerNumber}</td>
                                            <td className="p-3">{r.type}</td>
                                            <td className="p-3"><StatusBadge status={r.status} type="status" /></td>
                                            <td className="p-3"><StatusBadge status={r.situation} type="situation" /></td>
                                            <td className="p-3">{r.armador}</td>
                                            <td className="p-3">{r.terminal}</td>
                                            <td className="p-3 text-secondary font-bold">{r.booking || r.bl || '-'}</td>
                                            <td className="p-3 text-right flex justify-end gap-2">
                                                <button 
                                                    onClick={() => generateReport(r)} 
                                                    className="text-gray-400 hover:text-white bg-white/5 p-1.5 rounded transition-all" 
                                                    title="Relatório com QR Code"
                                                >
                                                    <i className="fas fa-print"></i>
                                                </button>
                                                <button onClick={() => deleteRecord(r.id)} className="text-red-500 hover:text-white bg-red-500/10 p-1.5 rounded transition-all"><i className="fas fa-trash"></i></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* SCHEDULES VIEW */}
                {activeTab === 'schedules' && (
                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {ecoContainerSchedules.map(s => (
                            <div key={s.id} className="bg-bg-main p-4 rounded-xl border border-white/5 hover:border-primary/50 transition-all relative">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-[10px] font-black text-gray-500">{s.date} • {s.time}</span>
                                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${s.status === 'CONFIRMADO' ? 'bg-success/20 text-success' : 'bg-yellow-500/20 text-yellow-300'}`}>{s.status}</span>
                                </div>
                                <h4 className="text-lg font-black text-white uppercase">{s.containerNumber}</h4>
                                <p className="text-xs text-gray-400 mt-1">{s.type} • {s.terminal} • {s.armador}</p>
                                {s.status === 'PENDENTE' && (
                                    <button onClick={() => handleConfirmSchedule(s)} className="w-full mt-4 py-2 bg-primary/20 text-primary border border-primary/30 rounded-lg text-xs font-bold hover:bg-primary hover:text-black transition-all">Confirmar Chegada</button>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* GATE LOG VIEW */}
                {activeTab === 'gate' && (
                    <div className="p-4 space-y-2">
                        {ecoGateLogs.slice(0, 50).map(log => (
                            <div key={log.id} className="flex items-center justify-between p-3 bg-bg-main rounded-lg border-l-4 border-white/10 hover:border-l-primary transition-all">
                                <div className="flex items-center gap-4">
                                    <div className={`w-8 h-8 rounded flex items-center justify-center text-xs font-bold ${log.movement === 'ENTRADA' ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'}`}>
                                        {log.movement === 'ENTRADA' ? 'IN' : 'OUT'}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-white">{log.containerNumber}</p>
                                        <p className="text-[10px] text-gray-500">{new Date(log.timestamp).toLocaleString()}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-300">{log.motorista}</p>
                                    <p className="text-[10px] text-gray-600 font-mono uppercase">{log.placa}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modals */}
            {isScheduleModalOpen && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[5000] p-4" onClick={() => setIsScheduleModalOpen(false)}>
                    <div className="bg-bg-card p-6 rounded-2xl w-full max-w-lg border border-white/10" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black text-white uppercase tracking-tight">ECONTAINER <span className="text-primary">CHECK-IN</span></h3>
                            <button onClick={() => setIsScheduleModalOpen(false)} className="text-gray-500 hover:text-white"><i className="fas fa-times"></i></button>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1">
                                    <label className="text-[10px] font-black text-gray-500 uppercase">Container ID</label>
                                    <input 
                                        placeholder="MSCU1234567" 
                                        className="w-full bg-bg-main p-3 rounded-lg text-white border border-white/10 uppercase font-mono focus:border-primary outline-none" 
                                        value={scheduleForm.containerNumber || ''} 
                                        onChange={e => setScheduleForm({...scheduleForm, containerNumber: e.target.value.toUpperCase()})} 
                                    />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-[10px] font-black text-gray-500 uppercase">Tipo / Tamanho</label>
                                    <select 
                                        className="w-full bg-bg-main p-3 rounded-lg text-white border border-white/10 focus:border-primary outline-none" 
                                        value={scheduleForm.type} 
                                        onChange={e => setScheduleForm({...scheduleForm, type: e.target.value})}
                                    >
                                        <option>VAZIO</option>
                                        <option>CHEIO</option>
                                    </select>
                                </div>
                            </div>

                            {/* LOCATION SELECTORS */}
                            <div className="bg-bg-main/50 p-4 rounded-xl border border-white/5 space-y-3">
                                <div className="flex flex-col gap-1">
                                    <label className="text-[10px] font-black text-gray-500 uppercase">Estado (UF)</label>
                                    <select 
                                        className="w-full bg-bg-card p-2 rounded-lg text-white border border-white/10 text-sm focus:border-primary outline-none"
                                        value={scheduleForm.uf}
                                        onChange={e => setScheduleForm({...scheduleForm, uf: e.target.value, terminal: '', depot: ''})}
                                    >
                                        {UF_LIST.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[10px] font-black text-gray-500 uppercase">Terminal / Porto</label>
                                        <select 
                                            className="w-full bg-bg-card p-2 rounded-lg text-white border border-white/10 text-sm focus:border-primary outline-none"
                                            value={scheduleForm.terminal}
                                            onChange={e => setScheduleForm({...scheduleForm, terminal: e.target.value, depot: ''})}
                                            disabled={!scheduleForm.uf}
                                        >
                                            <option value="">Selecione...</option>
                                            {(PORTS_BY_STATE[scheduleForm.uf] || []).map(port => (
                                                <option key={port} value={port}>{port}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[10px] font-black text-gray-500 uppercase">Depot (Vazio)</label>
                                        <select 
                                            className="w-full bg-bg-card p-2 rounded-lg text-white border border-white/10 text-sm focus:border-primary outline-none"
                                            value={scheduleForm.depot}
                                            onChange={e => setScheduleForm({...scheduleForm, depot: e.target.value, terminal: ''})}
                                            disabled={!scheduleForm.uf || !DEPOTS_BY_STATE[scheduleForm.uf]}
                                        >
                                            <option value="">Selecione...</option>
                                            {(DEPOTS_BY_STATE[scheduleForm.uf] || []).map(depot => (
                                                <option key={depot} value={depot}>{depot}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-black text-gray-500 uppercase">Armador (Editável)</label>
                                <input 
                                    list="armadores-options" 
                                    className="w-full bg-bg-main p-3 rounded-lg text-white border border-white/10 uppercase focus:border-primary outline-none"
                                    placeholder="Digite ou selecione..."
                                    value={scheduleForm.armador || ''}
                                    onChange={e => setScheduleForm({...scheduleForm, armador: e.target.value})}
                                />
                                <datalist id="armadores-options">
                                    {ARMADORES_LIST.map(a => <option key={a} value={a} />)}
                                </datalist>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1">
                                    <label className="text-[10px] font-black text-gray-500 uppercase">Data Prevista</label>
                                    <input type="date" className="bg-bg-main p-3 rounded-lg text-white border border-white/10 focus:border-primary outline-none" onChange={e => setScheduleForm({...scheduleForm, date: e.target.value})} />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-[10px] font-black text-gray-500 uppercase">Hora</label>
                                    <input type="time" className="bg-bg-main p-3 rounded-lg text-white border border-white/10 focus:border-primary outline-none" onChange={e => setScheduleForm({...scheduleForm, time: e.target.value})} />
                                </div>
                            </div>
                            
                            <button onClick={handleAddSchedule} className="w-full py-4 bg-primary text-black font-black uppercase rounded-xl hover:bg-primary/90 mt-4 shadow-lg shadow-primary/20 transition-all transform active:scale-95">
                                Confirmar Agendamento
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isGateModalOpen && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[5000] p-4" onClick={() => setIsGateModalOpen(false)}>
                    <div className="bg-bg-card p-6 rounded-2xl w-full max-w-md border border-white/10" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-black text-white mb-4 uppercase">Registro de Portaria</h3>
                        <div className="space-y-3">
                            <div className="flex gap-2 mb-2">
                                <button onClick={() => setGateForm({...gateForm, movement: 'ENTRADA'})} className={`flex-1 py-2 rounded-lg font-bold text-xs ${gateForm.movement === 'ENTRADA' ? 'bg-green-600 text-white' : 'bg-bg-main text-gray-500'}`}>ENTRADA</button>
                                <button onClick={() => setGateForm({...gateForm, movement: 'SAÍDA'})} className={`flex-1 py-2 rounded-lg font-bold text-xs ${gateForm.movement === 'SAÍDA' ? 'bg-red-600 text-white' : 'bg-bg-main text-gray-500'}`}>SAÍDA</button>
                            </div>
                            <input placeholder="Container" className="w-full bg-bg-main p-3 rounded-lg text-white border border-white/10 uppercase" value={gateForm.containerNumber || ''} onChange={e => setGateForm({...gateForm, containerNumber: e.target.value.toUpperCase()})} />
                            <input placeholder="Placa Cavalo" className="w-full bg-bg-main p-3 rounded-lg text-white border border-white/10 uppercase" onChange={e => setGateForm({...gateForm, placa: e.target.value.toUpperCase()})} />
                            <input placeholder="Nome Motorista" className="w-full bg-bg-main p-3 rounded-lg text-white border border-white/10 uppercase" onChange={e => setGateForm({...gateForm, motorista: e.target.value.toUpperCase()})} />
                            <select className="w-full bg-bg-main p-3 rounded-lg text-white border border-white/10" value={gateForm.status} onChange={e => setGateForm({...gateForm, status: e.target.value as any})}><option>VAZIO</option><option>CHEIO</option></select>
                            <button onClick={handleGateSubmit} className="w-full py-3 bg-secondary text-white font-bold uppercase rounded-lg hover:bg-secondary/90 mt-2">Registrar Movimento</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EcoContainer;


import React, { useMemo } from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend, 
  ArcElement,
  Filler 
} from 'chart.js';
import { Line, Pie } from 'react-chartjs-2';
import { useAppStore } from '../hooks/useAppStore';
import { useLanguage } from '../hooks/useLanguage';

// Registrar componentes do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const WidgetHeader = ({ title, icon, onAction }: { title: string, icon: string, onAction?: () => void }) => (
    <div className="flex items-center justify-between mb-8 group/header">
        <h3 className="text-[11px] font-black text-gray-500 flex items-center gap-4 transition-all duration-300 group-hover/header:translate-x-1">
            <div className="w-10 h-10 rounded-2xl bg-bg-main flex items-center justify-center text-primary shadow-[inset_0_0_10px_rgba(0,0,0,0.1)] border border-border-color/20">
                <i className={`fas ${icon}`}></i>
            </div>
            <span className="uppercase tracking-[0.3em] font-black">{title}</span>
        </h3>
        <button 
            onClick={onAction}
            className="w-10 h-10 rounded-2xl text-gray-400 hover:text-primary hover:bg-primary/5 transition-all active:scale-90 border border-transparent hover:border-primary/20"
        >
            <i className="fas fa-ellipsis-v text-[12px]"></i>
        </button>
    </div>
);

const Dashboard: React.FC = () => {
    const { financialData } = useAppStore();
    const { t } = useLanguage();

    const lineChartData = useMemo(() => {
        const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
        const labels: string[] = [];
        const revenueData: number[] = [];
        const expenseData: number[] = [];
        const now = new Date();

        for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const month = date.getMonth();
            const year = date.getFullYear();
            labels.push(`${monthNames[month]}`);

            const rev = (financialData.revenues || [])
                .filter(r => { const d = new Date(r.date); return d.getMonth() === month && d.getFullYear() === year; })
                .reduce((acc, curr) => acc + curr.value, 0);

            const exp = [...(financialData.fixedCosts || []), ...(financialData.variableCosts || [])]
                .filter(c => { const d = new Date(c.date); return d.getMonth() === month && d.getFullYear() === year; })
                .reduce((acc, curr) => acc + curr.value, 0);

            revenueData.push(rev);
            expenseData.push(exp);
        }

        return {
            labels,
            datasets: [
                {
                    label: 'Receitas',
                    data: revenueData,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.08)',
                    fill: true,
                    tension: 0.45,
                    pointBackgroundColor: '#10b981',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 3,
                    pointRadius: 5,
                    pointHoverRadius: 7,
                },
                {
                    label: 'Despesas',
                    data: expenseData,
                    borderColor: '#f43f5e',
                    backgroundColor: 'rgba(244, 63, 94, 0.04)',
                    fill: true,
                    tension: 0.45,
                    pointBackgroundColor: '#f43f5e',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 3,
                    pointRadius: 5,
                    pointHoverRadius: 7,
                }
            ]
        };
    }, [financialData]);

    const pieChartData = useMemo(() => {
        const totalFixed = (financialData.fixedCosts || []).reduce((acc, curr) => acc + curr.value, 0);
        const totalVariable = (financialData.variableCosts || []).reduce((acc, curr) => acc + curr.value, 0);
        const totalProfit = Math.max(0, (financialData.revenues || []).reduce((acc, r) => acc + r.value, 0) - (totalFixed + totalVariable));

        return {
            labels: ['Fixos', 'Variáveis', 'Margem'],
            datasets: [{
                data: [totalFixed, totalVariable, totalProfit],
                backgroundColor: ['#3b82f6', '#f59e0b', '#10b981'],
                hoverOffset: 20,
                borderWidth: 0,
                spacing: 8,
            }]
        };
    }, [financialData]);

    const commonOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { 
                position: 'bottom' as const,
                labels: { 
                    font: { family: "'Inter', sans-serif", size: 10, weight: '900' as const },
                    usePointStyle: true,
                    padding: 30,
                    color: '#64748b'
                } 
            },
            tooltip: {
                backgroundColor: '#0f172a',
                padding: 15,
                titleFont: { size: 12, weight: '900' as const },
                bodyFont: { size: 11 },
                cornerRadius: 12,
                callbacks: {
                    label: (context: any) => `${context.dataset.label}: ${formatCurrency(context.parsed.y || context.parsed)}`
                }
            }
        },
        scales: {
            x: { 
                grid: { display: false }, 
                ticks: { color: '#94a3b8', font: { size: 10, weight: 'bold' as const } } 
            },
            y: { 
                grid: { color: 'rgba(226, 232, 240, 0.3)', drawBorder: false }, 
                ticks: { 
                    color: '#94a3b8', 
                    font: { size: 10, weight: 'bold' as const },
                    callback: (value: any) => `R$ ${value / 1000}k` 
                },
                border: { display: false }
            }
        }
    };

    return (
        <div className="space-y-10 animate-fade-in pb-16">
            {/* Dashboard Header */}
            <header className="flex flex-col md:flex-row justify-between items-end gap-6 bg-white p-8 rounded-[3rem] border border-border-color/40 shadow-sm">
                <div>
                    <div className="flex items-center gap-4 mb-3">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-success"></span>
                        </span>
                        <span className="text-[11px] font-black text-primary uppercase tracking-[0.5em]">Live Ops Monitor Engine v5.2</span>
                    </div>
                    <h2 className="text-5xl font-black text-navy tracking-tighter">Comando <span className="text-primary">Estratégico</span></h2>
                </div>
                <div className="flex gap-4">
                    <div className="bg-bg-main px-6 py-3 rounded-2xl border border-border-color shadow-inner flex items-center gap-4">
                         <i className="fas fa-calendar-alt text-primary text-sm"></i>
                         <span className="text-[11px] font-black uppercase text-gray-500 tracking-widest">{new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</span>
                    </div>
                    <button className="w-12 h-12 bg-primary text-white rounded-2xl shadow-lg shadow-primary/20 flex items-center justify-center hover:scale-105 transition-transform active:scale-95">
                        <i className="fas fa-sync-alt"></i>
                    </button>
                </div>
            </header>

            {/* Key Performance Panels */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Cash Flow Evolution */}
                <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] border border-border-color/30 shadow-2xl hover:shadow-primary/5 transition-all duration-700">
                    <WidgetHeader title="Fluxo de Caixa Evolutivo" icon="fa-chart-line" />
                    <div className="h-96 w-full">
                        <Line options={commonOptions as any} data={lineChartData} />
                    </div>
                </div>

                {/* Cost Mix Analysis */}
                <div className="lg:col-span-1 bg-white p-10 rounded-[3rem] border border-border-color/30 shadow-2xl hover:shadow-primary/5 transition-all duration-700 flex flex-col">
                    <WidgetHeader title="Mix de Performance" icon="fa-chart-pie" />
                    <div className="flex-1 relative flex items-center justify-center min-h-[280px]">
                        <Pie options={{...commonOptions, cutout: '75%'} as any} data={pieChartData} />
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.4em] mb-2">Saúde Fiscal</span>
                            <span className="text-2xl font-black text-navy tracking-tighter">OTIMIZADA</span>
                        </div>
                    </div>
                    <div className="mt-10 pt-8 border-t border-border-color/50 grid grid-cols-2 gap-6">
                        <div className="bg-bg-main/60 p-5 rounded-3xl border border-border-color/40 shadow-inner">
                            <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-2">Margem de Lucro</p>
                            <p className="text-xl font-black text-success tracking-tighter">+18.5%</p>
                        </div>
                        <div className="bg-bg-main/60 p-5 rounded-3xl border border-border-color/40 shadow-inner">
                            <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-2">Liquidez Imed.</p>
                            <p className="text-xl font-black text-primary tracking-tighter">1.42</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tactical Event Log Table */}
            <div className="bg-white rounded-[4rem] border border-border-color/40 shadow-2xl overflow-hidden group">
                <div className="p-10 border-b border-border-color bg-gray-50/50 flex justify-between items-center">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-[1.8rem] bg-navy text-white flex items-center justify-center shadow-xl shadow-navy/20 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 to-transparent"></div>
                            <i className="fas fa-satellite-dish text-xl relative z-10"></i>
                        </div>
                        <div>
                            <h3 className="text-xs font-black text-navy uppercase tracking-[0.5em]">Log Tático em Tempo Real</h3>
                            <p className="text-[10px] text-gray-400 font-bold uppercase mt-1 tracking-widest">Sincronização com Terminais Santos/Rio</p>
                        </div>
                    </div>
                    <button className="px-8 py-3.5 bg-white hover:bg-navy hover:text-white text-[10px] font-black text-navy border-2 border-navy/10 rounded-2xl transition-all uppercase tracking-widest shadow-sm">
                        Exportar Relatório Completo
                    </button>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-bg-main/40 border-b border-border-color">
                            <tr>
                                <th className="p-8 font-black text-gray-400 uppercase tracking-widest text-[10px] text-center w-32">Evento</th>
                                <th className="p-8 font-black text-gray-400 uppercase tracking-widest text-[10px]">Descrição da Ação</th>
                                <th className="p-8 font-black text-gray-400 uppercase tracking-widest text-[10px]">Responsável</th>
                                <th className="p-8 font-black text-gray-400 uppercase tracking-widest text-[10px] text-right">Timestamp</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-color/50">
                            {[
                                { id: 'EVT-0192', desc: 'Protocolo de Sincronização CT-e autorizado via MIND7 Gateway', resp: 'JORGE NASSER', time: '14:32:01' },
                                { id: 'EVT-0191', desc: 'Checklist tático de saída validado para Comboio VTR-BETA', resp: 'RUAN CARLOS', time: '14:28:45' },
                                { id: 'EVT-0190', desc: 'Entrada de container MSCU12932 registrada no Terminal Portuário', resp: 'RAFAEL SANTOS', time: '14:15:30' },
                                { id: 'EVT-0189', desc: 'Faturamento de contrato multinacional OceanCorp processado', resp: 'THIAGO MARINS', time: '13:55:12' }
                            ].map((activity, i) => (
                                <tr key={i} className="zoho-row group transition-all hover:bg-primary/[0.02]">
                                    <td className="p-8">
                                        <span className="font-mono text-[11px] bg-navy/5 text-navy px-3 py-1.5 rounded-lg font-black tracking-tighter border border-navy/10">
                                            {activity.id}
                                        </span>
                                    </td>
                                    <td className="p-8">
                                        <span className="font-black text-navy text-[13px] uppercase tracking-tight leading-relaxed">{activity.desc}</span>
                                    </td>
                                    <td className="p-8">
                                        <div className="flex items-center gap-4">
                                            <div className="w-9 h-9 rounded-xl bg-navy text-white flex items-center justify-center text-[10px] font-black shadow-lg shadow-navy/10">
                                                {activity.resp.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <span className="text-[11px] text-gray-600 font-black uppercase tracking-widest">{activity.resp}</span>
                                        </div>
                                    </td>
                                    <td className="p-8 text-right font-mono text-[11px] text-gray-400 font-bold">{activity.time}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="p-10 bg-bg-main/20 text-center">
                    <button className="text-[10px] font-black text-primary uppercase tracking-[0.4em] hover:underline transition-all">Ver Histórico Operacional Completo</button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

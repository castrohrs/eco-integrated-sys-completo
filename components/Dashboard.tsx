
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
    <div className="flex items-center justify-between mb-6 group/header">
        <h3 className="text-sm font-bold text-navy flex items-center gap-3 transition-transform duration-300 group-hover/header:translate-x-1">
            <div className="w-8 h-8 rounded-lg bg-bg-main flex items-center justify-center text-primary/70 shadow-sm border border-border-color">
                <i className={`fas ${icon}`}></i>
            </div>
            <span className="uppercase tracking-wider">{title}</span>
        </h3>
        <button 
            onClick={onAction}
            className="w-8 h-8 rounded-full text-gray-400 hover:text-primary hover:bg-primary/5 transition-all active:scale-90"
        >
            <i className="fas fa-ellipsis-h text-xs"></i>
        </button>
    </div>
);

const Dashboard: React.FC = () => {
    const { financialData } = useAppStore();
    const { t } = useLanguage();

    // Processamento de dados para o Gráfico de Linha (Últimos 6 meses)
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
                    borderColor: '#22c55e', // Success Green
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#22c55e',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                },
                {
                    label: 'Despesas',
                    data: expenseData,
                    borderColor: '#ef4444', // Danger Red
                    backgroundColor: 'rgba(239, 68, 68, 0.05)',
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#ef4444',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                }
            ]
        };
    }, [financialData]);

    // Processamento de dados para o Gráfico de Pizza (Distribuição de Custos Atual)
    const pieChartData = useMemo(() => {
        const totalFixed = (financialData.fixedCosts || []).reduce((acc, curr) => acc + curr.value, 0);
        const totalVariable = (financialData.variableCosts || []).reduce((acc, curr) => acc + curr.value, 0);
        const totalProfit = Math.max(0, (financialData.revenues || []).reduce((acc, r) => acc + r.value, 0) - (totalFixed + totalVariable));

        return {
            labels: ['Custos Fixos', 'Custos Variáveis', 'Margem Líquida'],
            datasets: [{
                data: [totalFixed, totalVariable, totalProfit],
                backgroundColor: ['#3b82f6', '#f59e0b', '#22c55e'], // Blue, Orange, Green
                hoverOffset: 15,
                borderWidth: 0,
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
                    font: { family: "'Inter', sans-serif", size: 11 },
                    usePointStyle: true,
                    padding: 20
                } 
            },
            tooltip: {
                backgroundColor: '#1e293b',
                padding: 12,
                titleFont: { size: 12, weight: 'bold' as const },
                bodyFont: { size: 11 },
                cornerRadius: 8,
                callbacks: {
                    label: function(context: any) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== undefined) {
                            label += formatCurrency(context.parsed.y);
                        } else {
                             label += formatCurrency(context.parsed);
                        }
                        return label;
                    }
                }
            }
        },
        scales: {
            x: { 
                grid: { display: false }, 
                ticks: { color: '#64748b', font: { size: 10 } } 
            },
            y: { 
                grid: { color: '#f1f5f9', drawBorder: false }, 
                ticks: { 
                    color: '#64748b', 
                    font: { size: 10 },
                    callback: (value: any) => `R$ ${value / 1000}k` 
                },
                border: { display: false }
            }
        },
        interaction: {
            mode: 'index' as const,
            intersect: false,
        },
    };

    const pieOptions = {
        ...commonOptions,
        scales: {}, // No scales for pie chart
        cutout: '65%',
    };

    const handleWidgetAction = (title: string) => {
        console.log(`Action clicked for ${title}`);
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header com Resumo Visual */}
            <div className="flex flex-col md:flex-row justify-between items-end mb-4 gap-4">
                <div>
                    <h2 className="text-2xl font-black text-navy tracking-tight">Visão Geral Financeira</h2>
                    <p className="text-xs font-medium text-gray-500 mt-1">Análise de tendências e comportamento de custos em tempo real.</p>
                </div>
                <div className="flex gap-2">
                    <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-bold border border-green-100 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        DADOS SINCRONIZADOS
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Line Chart - Trends */}
                <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-border-color shadow-sm hover:shadow-md transition-all">
                    <WidgetHeader title="Fluxo de Caixa (Semestral)" icon="fa-chart-line" onAction={() => handleWidgetAction('Fluxo')} />
                    <div className="h-80 w-full">
                        <Line options={commonOptions} data={lineChartData} />
                    </div>
                </div>

                {/* Pie Chart - Distribution */}
                <div className="lg:col-span-1 bg-white p-8 rounded-2xl border border-border-color shadow-sm hover:shadow-md transition-all">
                    <WidgetHeader title="Distribuição de Receita" icon="fa-chart-pie" onAction={() => handleWidgetAction('Distribuição')} />
                    <div className="h-64 relative flex items-center justify-center mt-4">
                        <Pie options={pieOptions} data={pieChartData} />
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Resultado</span>
                            <span className={`text-xl font-black ${pieChartData.datasets[0].data[2] >= 0 ? 'text-success' : 'text-danger'}`}>
                                {pieChartData.datasets[0].data[2] > 0 ? '+' : ''}
                                {Math.round((pieChartData.datasets[0].data[2] / (pieChartData.datasets[0].data.reduce((a,b)=>a+b,0) || 1)) * 100)}%
                            </span>
                        </div>
                    </div>
                    <div className="mt-6 pt-6 border-t border-border-color grid grid-cols-2 gap-4 text-center">
                        <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase">Custos Fixos</p>
                            <p className="text-sm font-bold text-navy">{formatCurrency(pieChartData.datasets[0].data[0])}</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase">Variáveis</p>
                            <p className="text-sm font-bold text-navy">{formatCurrency(pieChartData.datasets[0].data[1])}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activities List */}
            <div className="bg-white rounded-2xl border-2 border-primary/10 shadow-lg overflow-hidden transition-all hover:shadow-xl">
                <div className="p-8 border-b border-border-color bg-gray-50/50 flex justify-between items-center">
                    <h3 className="text-base font-black text-navy flex items-center gap-4 uppercase tracking-widest">
                        <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg">
                            <i className="fas fa-history"></i>
                        </div>
                        Atividades Operacionais Recentes
                    </h3>
                    <div className="flex gap-4">
                            <button className="px-5 py-2 text-[10px] font-black text-primary border-2 border-primary/10 hover:bg-primary/5 rounded-xl transition-all uppercase tracking-widest active:scale-95">
                            Filtrar Histórico
                        </button>
                        <button className="w-10 h-10 rounded-xl text-gray-400 hover:text-primary hover:bg-primary/5 transition-all" onClick={() => handleWidgetAction('Atividades')}>
                            <i className="fas fa-ellipsis-h"></i>
                        </button>
                    </div>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-navy/5 border-b border-border-color">
                            <tr>
                                <th className="p-5 font-black text-gray-500 uppercase tracking-widest text-[11px]">Descrição da Atividade</th>
                                <th className="p-5 font-black text-gray-500 uppercase tracking-widest text-[11px]">Responsável Técnico</th>
                                <th className="p-5 font-black text-gray-500 uppercase tracking-widest text-[11px]">Data / Horário</th>
                                <th className="p-5 font-black text-gray-500 uppercase tracking-widest text-[11px] text-right">Módulo do Sistema</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-color">
                            {[
                                { desc: 'Atualização de status no frete #10293', resp: 'Jorge Nasser', time: 'Hoje às 14:32', module: 'Fretes' },
                                { desc: 'Novo lead qualificado: Indústrias Metalúrgicas', resp: 'Jorge Nasser', time: 'Hoje às 13:10', module: 'Vendas' },
                                { desc: 'Checklist concluído: Caminhão Placa ABC-1234', resp: 'Ruan Carlos', time: 'Hoje às 11:45', module: 'Frota' },
                                { desc: 'Faturamento emitido: Nota Fiscal #5521', resp: 'Thiago Marins', time: 'Ontem às 17:50', module: 'Financeiro' },
                                { desc: 'DSE exportação registrada: Proc. #2024-001', resp: 'Josué', time: 'Ontem às 16:30', module: 'Logística' }
                            ].map((activity, i) => (
                                <tr key={i} className="zoho-row group transition-all hover:bg-primary/[0.02]">
                                    <td className="p-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-primary/30 group-hover:bg-primary transition-colors"></div>
                                            <span className="font-bold text-navy text-[13px]">{activity.desc}</span>
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-navy/5 flex items-center justify-center text-[10px] font-black text-navy border border-navy/10">
                                                {activity.resp.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <span className="text-[13px] text-gray-600 font-medium">{activity.resp}</span>
                                        </div>
                                    </td>
                                    <td className="p-5 text-[12px] text-gray-500 font-medium italic">{activity.time}</td>
                                    <td className="p-5 text-right">
                                        <span className="px-4 py-1.5 bg-blue-50 text-primary rounded-full font-black uppercase text-[10px] border border-blue-100 shadow-sm group-hover:bg-primary group-hover:text-white transition-all cursor-pointer">
                                            {activity.module}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                
                <div className="p-6 bg-gray-50/50 border-t border-border-color text-center">
                    <button className="text-[11px] font-black text-primary uppercase tracking-[0.3em] hover:underline transition-all">
                        Visualizar Registro Completo de Atividades <i className="fas fa-arrow-right ml-2"></i>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

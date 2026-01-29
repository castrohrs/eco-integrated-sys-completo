
import React, { useMemo, useState } from 'react';
import { useAppStore } from '../hooks/useAppStore';
import { FinancialRecord } from '../types';
import { GoogleGenAI } from "@google/genai";
import CostFormModal from './CostFormModal';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return new Date(date.getTime() + date.getTimezoneOffset() * 60000).toLocaleDateString('pt-BR');
};

const fixedCostCategories = [
    "Infra: aluguel", 
    "Infra: escritório adm", 
    "Infra: energia", 
    "Pessoal: Salários", 
    "Seguros", 
    "Pró-labore", 
    "Salários administrativos (gestores, despachantes, contadores etc.)",
    "Encargos sociais e trabalhistas", 
    "Benefícios (vale-refeição, plano de saúde, etc.)", 
    "Aluguel de escritório, pátio ou garagem", 
    "Energia elétrica", 
    "Água", 
    "Telefone fixo", 
    "Internet", 
    "Sistemas de gestão (TMS, ERP)", 
    "Segurança patrimonial", 
    "Limpeza e manutenção predial", 
    "Depreciação dos veículos", 
    "IPVA", 
    "Seguro dos veículos (casco e terceiros)", 
    "Rastreamento e monitoramento (mensalidade)", 
    "Juros e amortizações de financiamentos", 
    "Contabilidade", 
    "Assessoria jurídica", 
    "Outros"
];

const KpiCard: React.FC<{ title: string; value: string | number; icon: string; color: string; }> = ({ title, value, icon, color }) => (
    <div className={`bg-bg-main p-4 rounded-lg shadow-md border-l-4 ${color}`}>
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-semibold text-gray-text">{title}</p>
                <p className="text-2xl font-bold text-light">{value}</p>
            </div>
            <i className={`fas ${icon} text-3xl opacity-30`}></i>
        </div>
    </div>
);

const TableCard: React.FC<{ title: string; children: React.ReactNode; actions?: React.ReactNode }> = ({ title, children, actions }) => (
    <div className="bg-bg-card rounded-lg p-5 shadow-lg mb-5 overflow-x-auto">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-light">{title}</h3>
            <div>{actions}</div>
        </div>
        <div>{children}</div>
    </div>
);

const CustosFixos: React.FC = () => {
    const { financialData, deleteRecord, addRecord, logAction } = useAppStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const filteredData = useMemo(() => {
        let data = financialData.fixedCosts || [];

        if (startDate) {
            data = data.filter(item => item.date >= startDate);
        }
        if (endDate) {
            data = data.filter(item => item.date <= endDate);
        }
        if (categoryFilter) {
            data = data.filter(item => item.category === categoryFilter);
        }

        if (!searchTerm) return data;
        const lowercasedFilter = searchTerm.toLowerCase();
        // FIX: Added safe navigation and empty string fallback to prevent crash on undefined properties
        return data.filter(item =>
            (item.name?.toLowerCase() || '').includes(lowercasedFilter) ||
            (item.description?.toLowerCase() || '').includes(lowercasedFilter)
        );
    }, [financialData.fixedCosts, searchTerm, startDate, endDate, categoryFilter]);

    const kpiData = useMemo(() => {
        const costs = filteredData;
        const count = costs.length;
        if (count === 0) return { total: 0, average: 0, count: 0, max: 0 };
        const total = costs.reduce((sum, item) => sum + item.value, 0);
        const average = total / count;
        const max = Math.max(...costs.map(item => item.value));
        return { total, average, count, max };
    }, [filteredData]);

    const chartData = useMemo(() => {
        const costs = filteredData;
        const categoryTotals: Record<string, number> = {};
        
        costs.forEach(item => {
            const cat = item.category || 'Outros';
            categoryTotals[cat] = (categoryTotals[cat] || 0) + item.value;
        });

        const sortedCategories = Object.entries(categoryTotals)
            .sort(([, a], [, b]) => b - a);

        return {
            labels: sortedCategories.map(([cat]) => cat),
            datasets: [{
                data: sortedCategories.map(([, val]) => val),
                backgroundColor: [
                    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', 
                    '#8B5CF6', '#EC4899', '#06B6D4', '#6366F1', 
                    '#84CC16', '#F97316', '#14B8A6', '#D946EF'
                ],
                borderColor: 'rgba(30, 41, 59, 0.5)',
                borderWidth: 1,
            }],
            topCosts: sortedCategories.slice(0, 5)
        };
    }, [filteredData]);

    const pieOptions = useMemo(() => ({
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { 
                position: 'bottom' as const,
                labels: { color: '#94A3B8', boxWidth: 12, padding: 15, font: { size: 10 } }
            },
            tooltip: {
                callbacks: {
                    label: function(context: any) {
                        const value = context.raw as number;
                        const total = context.chart._metasets[context.datasetIndex].total;
                        const percentage = ((value / total) * 100).toFixed(1) + '%';
                        return `${context.label}: ${formatCurrency(value)} (${percentage})`;
                    }
                }
            }
        }
    }), []);

    const handleSave = (records: any[]) => {
        records.forEach(record => {
            addRecord('fixed-cost', record);
        });
        logAction(`${records.length} custo(s) fixo(s) adicionado(s) em lote.`);
    };

    const handleDelete = (id: number) => {
        if (window.confirm('Tem certeza que deseja excluir este registro?')) {
            deleteRecord('fixedCosts', id);
        }
    };

    const isRowInvalid = (item: FinancialRecord) => {
        return !item.name || !item.value || !item.date || !item.category;
    };

    const exportToCSV = (data: any[], filename: string) => {
        if (data.length === 0) { alert("Não há dados para exportar."); return; }
        const headers = Object.keys(data[0]);
        const csvContent = [ headers.join(','), ...data.map(row => headers.map(header => { let cell = row[header] === null || row[header] === undefined ? '' : String(row[header]); cell = cell.replace(/"/g, '""'); if (cell.search(/("|,|\n)/g) >= 0) { cell = `"${cell}"`; } return cell; }).join(',')) ].join('\n');
        const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        logAction(`Exported ${filename}`);
    };

    return (
        <div>
            <CostFormModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSave={handleSave} 
                title="Lançamento em Lote: Custos Fixos"
                categories={fixedCostCategories}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <KpiCard title="Custo Fixo Filtrado" value={formatCurrency(kpiData.total)} icon="fa-coins" color="border-danger" />
                <KpiCard title="Ticket Médio" value={formatCurrency(kpiData.average)} icon="fa-receipt" color="border-warning" />
                <KpiCard title="Nº de Lançamentos" value={kpiData.count} icon="fa-list-ol" color="border-secondary" />
                <KpiCard title="Custo Mais Alto" value={formatCurrency(kpiData.max)} icon="fa-arrow-up" color="border-primary" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <div className="bg-bg-card rounded-lg p-5 shadow-lg border border-border-color flex flex-col">
                    <h3 className="text-lg font-semibold text-light mb-4 flex items-center gap-2">
                        <i className="fas fa-chart-pie text-primary"></i> Distribuição por Categoria
                    </h3>
                    <div className="flex-grow min-h-[250px] relative flex justify-center items-center">
                        {chartData.datasets[0].data.length > 0 ? (
                            <Pie data={chartData} options={pieOptions} />
                        ) : (
                            <div className="text-gray-text italic">Sem dados para exibir</div>
                        )}
                    </div>
                </div>

                <div className="bg-bg-card rounded-lg p-5 shadow-lg border border-border-color flex flex-col">
                    <h3 className="text-lg font-semibold text-light mb-4 flex items-center gap-2">
                        <i className="fas fa-percent text-secondary"></i> Participação no Total
                    </h3>
                    <div className="flex-grow min-h-[250px] relative flex justify-center items-center">
                        {chartData.datasets[0].data.length > 0 ? (
                            <Pie data={chartData} options={{...pieOptions, plugins: {...pieOptions.plugins, legend: { display: false }}}} />
                        ) : (
                            <div className="text-gray-text italic">Sem dados para exibir</div>
                        )}
                    </div>
                </div>
                
                <div className="bg-bg-card rounded-lg p-5 shadow-lg border border-border-color flex flex-col">
                    <h3 className="text-lg font-semibold text-light mb-4 flex items-center gap-2">
                        <i className="fas fa-list-ol text-warning"></i> Top 5 Maiores Custos
                    </h3>
                    <div className="space-y-3 overflow-y-auto max-h-[300px] pr-1 custom-scrollbar">
                        {chartData.topCosts.map(([cat, val], idx) => (
                            <div key={idx} className="flex justify-between items-center p-3 bg-bg-main rounded border-l-4 shadow-sm" style={{ borderLeftColor: chartData.datasets[0].backgroundColor[idx % 12] }}>
                                <span className="text-sm text-light font-medium truncate mr-2">{cat}</span>
                                <span className="text-sm font-bold text-gray-text">{formatCurrency(val)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="bg-bg-card rounded-lg p-4 mb-4 border border-border-color flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 w-full relative">
                    <label className="text-[10px] font-bold text-gray-500 uppercase ml-1 block mb-1">Busca Rápida</label>
                    <input type="text" placeholder="Pesquisar por nome ou descrição..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-bg-main border border-border-color rounded-md py-2 pl-10 pr-4 text-light focus:outline-none focus:ring-2 focus:ring-secondary" />
                    <div className="absolute inset-y-0 left-0 pl-3 pt-5 flex items-center pointer-events-none">
                        <i className="fas fa-search text-gray-text"></i>
                    </div>
                </div>
                <div className="flex gap-2 w-full md:w-auto flex-wrap items-end">
                    <div className="flex flex-col gap-1 min-w-[150px]">
                        <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Filtrar Categoria</label>
                        <select 
                            value={categoryFilter} 
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="bg-bg-main border border-border-color rounded-md p-2 text-sm text-light focus:border-primary outline-none"
                        >
                            <option value="">Todas as Categorias</option>
                            {fixedCostCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">De</label>
                        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-bg-main border border-border-color rounded-md p-2 text-sm text-light" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Até</label>
                        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="bg-bg-main border border-border-color rounded-md p-2 text-sm text-light" />
                    </div>
                    {(searchTerm || startDate || endDate || categoryFilter) && (
                        <button 
                            onClick={() => { setSearchTerm(''); setStartDate(''); setEndDate(''); setCategoryFilter(''); }}
                            className="text-red-400 hover:text-red-300 text-xs font-bold uppercase pb-3 transition-colors"
                        >
                            <i className="fas fa-times-circle mr-1"></i> Limpar
                        </button>
                    )}
                </div>
            </div>

            <TableCard 
                title="Registros de Custos Fixos"
                actions={
                    <div className="flex gap-2">
                        <button onClick={() => setIsModalOpen(true)} className="px-3 py-1 bg-primary text-white text-xs font-semibold rounded-md hover:bg-opacity-90 flex items-center gap-1 shadow-md">
                            <i className="fas fa-plus mr-1"></i> Adicionar Lote
                        </button>
                        <button onClick={() => exportToCSV(filteredData, 'custos_fixos_export.csv')} className="px-3 py-1 bg-secondary text-white text-xs font-semibold rounded-md hover:bg-opacity-90 flex items-center gap-1 shadow-md">
                            <i className="fas fa-file-csv mr-1"></i> Exportar
                        </button>
                    </div>
                }
            >
                <table className="w-full text-sm text-left text-gray-text">
                    <thead className="text-xs text-gray-400 uppercase bg-gray-700">
                        <tr>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Nome</th>
                            <th className="px-6 py-3">Categoria</th>
                            <th className="px-6 py-3">Valor</th>
                            <th className="px-6 py-3">Data</th>
                            <th className="px-6 py-3">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.map((item: FinancialRecord) => {
                             const isInvalid = isRowInvalid(item);
                             return (
                                <tr key={item.id} className={isInvalid ? 'bg-red-900/20 border-b border-red-700' : 'bg-bg-card border-b border-border-color hover:bg-border-color'}>
                                    <td className="px-6 py-4 text-center">{isInvalid ? <i className="fas fa-exclamation-triangle text-warning"></i> : <i className="fas fa-check-circle text-success"></i>}</td>
                                    <td className="px-6 py-4">{item.name}</td>
                                    <td className="px-6 py-4">{item.category}</td>
                                    <td className="px-6 py-4">{formatCurrency(item.value)}</td>
                                    <td className="px-6 py-4">{formatDate(item.date)}</td>
                                    <td className="px-6 py-4">
                                        <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-400"><i className="fas fa-trash"></i></button>
                                    </td>
                                </tr>
                             );
                        })}
                        {filteredData.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-10 text-center text-gray-500 italic">Nenhum registro encontrado para os filtros selecionados.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </TableCard>
        </div>
    );
};

export default CustosFixos;

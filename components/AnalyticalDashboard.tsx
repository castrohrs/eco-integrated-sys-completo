
import React, { useMemo, useState } from 'react';
import { useAppStore } from '../hooks/useAppStore';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const AnalyticalDashboard: React.FC = () => {
    const { financialData } = useAppStore();
    const [selectedDate, setSelectedDate] = useState(new Date());

    const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

    // --- Data Processing ---

    // Specific Month Analysis
    const currentMonthStats = useMemo(() => {
        const month = selectedDate.getMonth();
        const year = selectedDate.getFullYear();

        const filterByMonth = (item: any) => {
            const d = new Date(item.date);
            return d.getMonth() === month && d.getFullYear() === year;
        };

        const revenues = (financialData.revenues || []).filter(filterByMonth).reduce((acc, curr) => acc + curr.value, 0);
        const fixedCosts = (financialData.fixedCosts || []).filter(filterByMonth).reduce((acc, curr) => acc + curr.value, 0);
        const variableCosts = (financialData.variableCosts || []).filter(filterByMonth).reduce((acc, curr) => acc + curr.value, 0);
        const totalCosts = fixedCosts + variableCosts;
        const balance = revenues - totalCosts;

        // Category Breakdown for Pie Chart (Top Categories)
        const categoryMap: Record<string, number> = {};
        [...(financialData.fixedCosts || []), ...(financialData.variableCosts || [])].filter(filterByMonth).forEach(item => {
            const cat = item.category.split(':')[0] || 'Outros';
            categoryMap[cat] = (categoryMap[cat] || 0) + item.value;
        });

        const sortedCategories = Object.entries(categoryMap)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10); // Show more categories in analytical view

        return {
            revenues,
            fixedCosts,
            variableCosts,
            totalCosts,
            balance,
            categoryLabels: sortedCategories.map(([k]) => k),
            categoryValues: sortedCategories.map(([, v]) => v)
        };
    }, [financialData, selectedDate]);

    // Consolidated View Data (Pie Chart)
    const consolidatedPieData = useMemo(() => {
        const { fixedCosts, variableCosts, balance } = currentMonthStats;
        const data = [fixedCosts, variableCosts];
        const labels = ['Custos Fixos', 'Custos Variáveis'];
        const backgroundColor = ['#EF4444', '#F59E0B'];

        if (balance > 0) {
            data.push(balance);
            labels.push('Lucro Líquido');
            backgroundColor.push('#10B981');
        }

        return {
            labels,
            datasets: [{
                data,
                backgroundColor,
                borderColor: '#1E293B',
                borderWidth: 2
            }]
        };
    }, [currentMonthStats]);

    // --- Navigation Handlers ---
    const handlePrevMonth = () => {
        setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1));
    };

    // --- Chart Options ---
    const pieOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'bottom' as const, labels: { color: '#94A3B8', boxWidth: 12, padding: 15 } },
            tooltip: {
                callbacks: {
                    label: function(context: any) {
                        const label = context.label || '';
                        const value = context.parsed;
                        const total = context.chart._metasets[context.datasetIndex].total;
                        const percentage = ((value / total) * 100).toFixed(1) + '%';
                        return `${label}: ${formatCurrency(value)} (${percentage})`;
                    }
                }
            }
        }
    };

    return (
        <div className="space-y-6 pb-10 animate-fade-in">
            {/* Header / Date Controls */}
            <div className="bg-bg-card p-6 rounded-lg shadow-lg flex flex-col md:flex-row justify-between items-center border border-border-color">
                <div>
                    <h2 className="text-2xl font-bold text-light flex items-center gap-2">
                        <i className="fas fa-chart-pie text-secondary"></i> Dashboard Analítico
                    </h2>
                    <p className="text-gray-text text-sm">Visão consolidada de receitas e despesas.</p>
                </div>
                <div className="flex items-center gap-4 mt-4 md:mt-0 bg-bg-main p-2 rounded-lg border border-border-color">
                    <button onClick={handlePrevMonth} className="text-gray-400 hover:text-light transition-colors p-2"><i className="fas fa-chevron-left"></i></button>
                    <span className="text-light font-bold min-w-[150px] text-center capitalize">
                        {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
                    </span>
                    <button onClick={handleNextMonth} className="text-gray-400 hover:text-light transition-colors p-2"><i className="fas fa-chevron-right"></i></button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-bg-card p-5 rounded-lg border-l-4 border-green-500 shadow-md">
                    <p className="text-sm font-semibold text-gray-400 uppercase">Receita Total</p>
                    <p className="text-2xl font-bold text-green-400">{formatCurrency(currentMonthStats.revenues)}</p>
                </div>
                <div className="bg-bg-card p-5 rounded-lg border-l-4 border-red-500 shadow-md">
                    <p className="text-sm font-semibold text-gray-400 uppercase">Custos Totais</p>
                    <p className="text-2xl font-bold text-red-400">{formatCurrency(currentMonthStats.totalCosts)}</p>
                    <div className="text-xs text-gray-500 mt-1 flex justify-between">
                        <span>Fixo: {formatCurrency(currentMonthStats.fixedCosts)}</span>
                        <span>Var: {formatCurrency(currentMonthStats.variableCosts)}</span>
                    </div>
                </div>
                <div className="bg-bg-card p-5 rounded-lg border-l-4 border-blue-500 shadow-md">
                    <p className="text-sm font-semibold text-gray-400 uppercase">Saldo Líquido</p>
                    <p className={`text-2xl font-bold ${currentMonthStats.balance >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
                        {formatCurrency(currentMonthStats.balance)}
                    </p>
                </div>
                <div className="bg-bg-card p-5 rounded-lg border-l-4 border-yellow-500 shadow-md">
                    <p className="text-sm font-semibold text-gray-400 uppercase">Margem de Lucro</p>
                    <p className="text-2xl font-bold text-yellow-400">
                        {currentMonthStats.revenues > 0 
                            ? ((currentMonthStats.balance / currentMonthStats.revenues) * 100).toFixed(1) 
                            : '0.0'}%
                    </p>
                </div>
            </div>

            {/* Main Charts Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Consolidated View (Pie) */}
                <div className="lg:col-span-2 bg-bg-card p-6 rounded-lg shadow-lg border border-border-color">
                    <h3 className="text-lg font-bold text-light mb-4 flex items-center gap-2">
                        <i className="fas fa-chart-pie text-secondary"></i> Visão Consolidada (Receitas vs Despesas)
                    </h3>
                    <div className="h-80 relative flex items-center justify-center">
                        {currentMonthStats.revenues > 0 || currentMonthStats.totalCosts > 0 ? (
                            <Pie options={pieOptions} data={consolidatedPieData} />
                        ) : (
                            <p className="text-gray-500 italic">Sem dados financeiros neste mês.</p>
                        )}
                    </div>
                </div>

                {/* Cost Distribution (Pie) */}
                <div className="bg-bg-card p-6 rounded-lg shadow-lg border border-border-color flex flex-col">
                    <h3 className="text-lg font-bold text-light mb-4">Detalhe por Categoria</h3>
                    <div className="flex-grow relative min-h-[300px] flex items-center justify-center">
                        {currentMonthStats.totalCosts > 0 ? (
                            <Pie 
                                data={{
                                    labels: currentMonthStats.categoryLabels,
                                    datasets: [{
                                        data: currentMonthStats.categoryValues,
                                        backgroundColor: [
                                            '#06B6D4', '#14B8A6', '#FBBF24', '#F87171', 
                                            '#8B5CF6', '#EC4899', '#3B82F6', '#6366F1',
                                            '#10B981', '#F59E0B'
                                        ],
                                        borderColor: '#1E293B',
                                        borderWidth: 2
                                    }]
                                }} 
                                options={pieOptions}
                            />
                        ) : (
                            <p className="text-gray-500 italic">Sem custos registrados.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom Row: Top Expenses */}
            <div className="bg-bg-card p-6 rounded-lg shadow-lg border border-border-color">
                <h3 className="text-lg font-bold text-light mb-4">Top 10 Categorias de Custo ({monthNames[selectedDate.getMonth()]})</h3>
                {currentMonthStats.categoryValues.length > 0 ? (
                    <div className="h-64">
                         <Bar 
                            options={{
                                indexAxis: 'y' as const,
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: { legend: { display: false } },
                                scales: {
                                    x: { grid: { color: '#334155' }, ticks: { color: '#94A3B8', callback: (val) => `R$${Number(val)/1000}k` } },
                                    y: { grid: { display: false }, ticks: { color: '#F1F5F9' } }
                                }
                            }} 
                            data={{
                                labels: currentMonthStats.categoryLabels,
                                datasets: [{
                                    label: 'Valor',
                                    data: currentMonthStats.categoryValues,
                                    backgroundColor: ['#3B82F6', '#6366F1', '#8B5CF6', '#EC4899', '#F43F5E', '#06B6D4', '#14B8A6', '#FBBF24', '#F87171', '#10B981'],
                                    borderRadius: 4,
                                    barThickness: 20
                                }]
                            }} 
                        />
                    </div>
                ) : (
                     <div className="h-32 flex items-center justify-center text-gray-500 italic">
                        Nenhum dado de categoria disponível.
                    </div>
                )}
            </div>
        </div>
    );
};

export default AnalyticalDashboard;

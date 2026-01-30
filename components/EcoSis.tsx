
import React, { useState, useMemo } from 'react';
import { useAppStore } from '../hooks/useAppStore';
import { CalendarEvent } from '../types';
import { formatBrDate } from '../utils/helpers';

const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

type ViewMode = 'calendar' | 'kanban' | 'timeline';

const COLORS = ['#3b82f6', '#22c55e', '#ef4444', '#f59e0b', '#8b5cf6', '#ec4899', '#6366f1'];

const EcoSis: React.FC = () => {
    const { calendarEvents, updateCalendarEvent, deleteRecord, addCalendarEvent, completeCalendarEvent } = useAppStore();
    const [viewMode, setViewMode] = useState<ViewMode>('calendar');
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [hoveredEvent, setHoveredEvent] = useState<CalendarEvent | null>(null);
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
    const [isEditing, setIsEditing] = useState<CalendarEvent | null>(null);
    const [draggedEventId, setDraggedEventId] = useState<number | null>(null);

    // --- Computed Data ---
    const eventsByDate = useMemo(() => {
        const map: Record<string, CalendarEvent[]> = {};
        calendarEvents.forEach(e => {
            const dateKey = e.dueDate.split('T')[0];
            if (!map[dateKey]) map[dateKey] = [];
            map[dateKey].push(e);
        });
        return map;
    }, [calendarEvents]);

    const kanbanData = useMemo(() => {
        return {
            pending: calendarEvents.filter(e => e.status === 'pending'),
            completed: calendarEvents.filter(e => e.status === 'completed'),
            overdue: calendarEvents.filter(e => {
                if (e.status === 'completed') return false;
                return new Date(e.dueDate) < new Date(new Date().setHours(0,0,0,0));
            })
        };
    }, [calendarEvents]);

    const reportData = useMemo(() => {
        const total = calendarEvents.reduce((acc, e) => acc + e.value, 0);
        const paid = calendarEvents.filter(e => e.status === 'completed').reduce((acc, e) => acc + e.value, 0);
        const pending = total - paid;
        return { total, paid, pending };
    }, [calendarEvents]);

    // --- Handlers ---
    const handleDragStart = (e: React.DragEvent, id: number) => {
        setDraggedEventId(id);
    };

    const handleDrop = (e: React.DragEvent, status: 'pending' | 'completed') => {
        e.preventDefault();
        if (draggedEventId) {
            if (status === 'completed') {
                completeCalendarEvent(draggedEventId, "Movido via Kanban");
            } else {
                // Revert to pending logic if needed (requires API support update, here we simulate)
                const evt = calendarEvents.find(ev => ev.id === draggedEventId);
                if (evt && evt.status !== 'pending') {
                    updateCalendarEvent({ ...evt, status: 'pending', completionDate: undefined });
                }
            }
            setDraggedEventId(null);
        }
    };

    const handleColorChange = (color: string) => {
        if (isEditing) {
            updateCalendarEvent({ ...isEditing, color });
            setIsEditing(null);
        }
    };

    const handlePrintReport = () => {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            const html = `
                <html>
                <head><title>Relatório Eco.Sis</title><style>body{font-family:sans-serif;padding:20px;} table{width:100%;border-collapse:collapse;} th,td{border:1px solid #ccc;padding:8px;text-align:left;} th{background:#eee;}</style></head>
                <body>
                    <h1>Relatório Financeiro Eco.Sis</h1>
                    <p>Gerado em: ${new Date().toLocaleString()}</p>
                    <div style="margin-bottom:20px; display:flex; gap:20px;">
                        <div><strong>Total:</strong> ${formatCurrency(reportData.total)}</div>
                        <div style="color:green"><strong>Pago:</strong> ${formatCurrency(reportData.paid)}</div>
                        <div style="color:red"><strong>Pendente:</strong> ${formatCurrency(reportData.pending)}</div>
                    </div>
                    <table>
                        <thead><tr><th>Data</th><th>Descrição</th><th>Valor</th><th>Status</th></tr></thead>
                        <tbody>
                            ${calendarEvents.map(e => `
                                <tr>
                                    <td>${formatBrDate(new Date(e.dueDate))}</td>
                                    <td>${e.description}</td>
                                    <td>${formatCurrency(e.value)}</td>
                                    <td>${e.status === 'completed' ? 'Pago' : 'Pendente'}</td>
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

    // --- Renderers ---
    const renderCalendar = () => {
        const year = selectedDate.getFullYear();
        const month = selectedDate.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay();
        const days = [];

        for (let i = 0; i < firstDay; i++) days.push(null);
        for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));

        return (
            <div className="grid grid-cols-7 gap-2">
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
                    <div key={d} className="text-center font-bold text-gray-500 uppercase text-xs py-2">{d}</div>
                ))}
                {days.map((date, idx) => {
                    if (!date) return <div key={`empty-${idx}`} className="h-32 bg-bg-main/30 rounded-lg"></div>;
                    const dateKey = date.toISOString().split('T')[0];
                    const events = eventsByDate[dateKey] || [];

                    return (
                        <div key={dateKey} className="h-32 bg-bg-main border border-border-color rounded-lg p-2 overflow-y-auto custom-scrollbar relative group">
                            <span className="text-xs font-bold text-gray-400 absolute top-2 right-2">{date.getDate()}</span>
                            <div className="mt-4 space-y-1">
                                {events.map(ev => (
                                    <div 
                                        key={ev.id}
                                        className="text-[10px] p-1 rounded cursor-pointer truncate text-white hover:brightness-110 shadow-sm transition-all"
                                        style={{ backgroundColor: ev.color || (ev.status === 'completed' ? '#22c55e' : '#ef4444') }}
                                        onMouseEnter={(e) => {
                                            setHoveredEvent(ev);
                                            setTooltipPos({ x: e.clientX, y: e.clientY });
                                        }}
                                        onMouseLeave={() => setHoveredEvent(null)}
                                        onClick={() => setIsEditing(ev)}
                                    >
                                        {formatCurrency(ev.value)} - {ev.description}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    const renderKanban = () => (
        <div className="flex gap-4 h-full overflow-x-auto pb-4">
            {[
                { id: 'pending', title: 'A Pagar', items: kanbanData.pending, color: 'border-yellow-500' },
                { id: 'overdue', title: 'Atrasados', items: kanbanData.overdue, color: 'border-red-500' },
                { id: 'completed', title: 'Pagos', items: kanbanData.completed, color: 'border-green-500' }
            ].map(col => (
                <div 
                    key={col.id} 
                    className={`flex-1 min-w-[300px] bg-bg-main rounded-xl border-t-4 ${col.color} p-4 flex flex-col`}
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => handleDrop(e, col.id === 'completed' ? 'completed' : 'pending')}
                >
                    <h3 className="font-bold text-light mb-4 flex justify-between">
                        {col.title} <span className="bg-bg-card px-2 rounded text-xs py-1">{col.items.length}</span>
                    </h3>
                    <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-2">
                        {col.items.map(ev => (
                            <div 
                                key={ev.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, ev.id)}
                                className="bg-bg-card p-3 rounded-lg border border-border-color cursor-move hover:border-primary transition-all shadow-sm"
                                style={{ borderLeft: `4px solid ${ev.color || (ev.status === 'completed' ? '#22c55e' : '#ef4444')}` }}
                                onClick={() => setIsEditing(ev)}
                            >
                                <div className="flex justify-between items-start">
                                    <span className="font-bold text-sm text-light">{ev.description}</span>
                                    <span className="text-xs font-mono text-gray-400">{formatCurrency(ev.value)}</span>
                                </div>
                                <div className="text-[10px] text-gray-500 mt-2">{formatBrDate(new Date(ev.dueDate))}</div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );

    const renderTimeline = () => (
        <div className="bg-bg-main rounded-xl p-4 overflow-y-auto h-full custom-scrollbar">
            {calendarEvents
                .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                .map(ev => (
                    <div key={ev.id} className="flex gap-4 mb-4 relative group">
                        <div className="w-24 text-right pt-2">
                            <span className="text-xs font-bold text-gray-400 block">{formatBrDate(new Date(ev.dueDate))}</span>
                            <span className="text-[10px] text-gray-600 block">{new Date(ev.dueDate).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                        </div>
                        <div className="relative pt-2">
                            <div className="w-3 h-3 rounded-full bg-border-color border-2 border-bg-main absolute left-[-6px] z-10" style={{ backgroundColor: ev.color || '#3b82f6' }}></div>
                            <div className="w-0.5 h-full bg-border-color absolute left-0 top-3"></div>
                        </div>
                        <div className="flex-1 bg-bg-card p-3 rounded-lg border border-border-color hover:border-primary transition-all cursor-pointer" onClick={() => setIsEditing(ev)}>
                            <div className="flex justify-between">
                                <h4 className="font-bold text-sm text-light">{ev.description}</h4>
                                <span className={`text-xs font-bold ${ev.status === 'completed' ? 'text-success' : 'text-warning'}`}>{formatCurrency(ev.value)}</span>
                            </div>
                            <div className="text-[10px] text-gray-500 mt-1">Status: {ev.status === 'completed' ? 'Pago' : 'Pendente'}</div>
                        </div>
                    </div>
                ))}
        </div>
    );

    return (
        <div className="h-full flex flex-col bg-bg-card rounded-lg shadow-xl overflow-hidden relative">
            {/* Header */}
            <div className="p-4 bg-bg-main border-b border-border-color flex justify-between items-center gap-4 flex-wrap">
                <div className="flex items-center gap-4">
                    <h2 className="text-xl font-bold text-light flex items-center gap-2"><i className="fas fa-calendar-check text-primary"></i> Eco.Sis</h2>
                    <div className="flex bg-bg-card rounded-lg p-1 border border-border-color">
                        <button onClick={() => setViewMode('calendar')} className={`px-3 py-1 text-xs font-bold rounded ${viewMode === 'calendar' ? 'bg-primary text-white' : 'text-gray-400 hover:text-light'}`}>Calendário</button>
                        <button onClick={() => setViewMode('kanban')} className={`px-3 py-1 text-xs font-bold rounded ${viewMode === 'kanban' ? 'bg-primary text-white' : 'text-gray-400 hover:text-light'}`}>Kanban</button>
                        <button onClick={() => setViewMode('timeline')} className={`px-3 py-1 text-xs font-bold rounded ${viewMode === 'timeline' ? 'bg-primary text-white' : 'text-gray-400 hover:text-light'}`}>Cronograma</button>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => window.print()} className="px-3 py-1.5 bg-bg-card border border-border-color text-gray-400 hover:text-white rounded text-xs font-bold transition-all flex items-center gap-2" title="Imprimir Visualização Atual">
                        <i className="fas fa-print"></i>
                    </button>
                    <button onClick={handlePrintReport} className="px-3 py-1.5 bg-secondary/10 text-secondary border border-secondary/30 rounded text-xs font-bold hover:bg-secondary hover:text-white transition-all flex items-center gap-2">
                        <i className="fas fa-file-alt"></i> Relatório
                    </button>
                    {viewMode === 'calendar' && (
                        <div className="flex items-center gap-2 bg-bg-card px-2 rounded border border-border-color">
                            <button onClick={() => setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth() - 1)))} className="text-gray-400 hover:text-white"><i className="fas fa-chevron-left"></i></button>
                            <span className="text-xs font-bold text-light w-24 text-center">{selectedDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}</span>
                            <button onClick={() => setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth() + 1)))} className="text-gray-400 hover:text-white"><i className="fas fa-chevron-right"></i></button>
                        </div>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-4 overflow-hidden bg-bg-main/50">
                {viewMode === 'calendar' && renderCalendar()}
                {viewMode === 'kanban' && renderKanban()}
                {viewMode === 'timeline' && renderTimeline()}
            </div>

            {/* Tooltip */}
            {hoveredEvent && (
                <div 
                    className="fixed z-50 bg-black/90 text-white p-3 rounded-lg shadow-xl border border-white/10 pointer-events-none text-xs w-64 animate-fade-in"
                    style={{ top: tooltipPos.y + 10, left: tooltipPos.x + 10 }}
                >
                    <div className="font-bold text-primary mb-1 border-b border-white/10 pb-1">{hoveredEvent.description}</div>
                    <div className="flex justify-between mb-1"><span>Valor:</span> <span className="font-mono text-success">{formatCurrency(hoveredEvent.value)}</span></div>
                    <div className="flex justify-between mb-1"><span>Data:</span> <span>{formatBrDate(new Date(hoveredEvent.dueDate))}</span></div>
                    <div className="italic text-gray-400 mt-2">{hoveredEvent.justification || 'Sem observações.'}</div>
                </div>
            )}

            {/* Edit/Color Modal */}
            {isEditing && (
                <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setIsEditing(null)}>
                    <div className="bg-bg-card p-6 rounded-xl border border-border-color shadow-2xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
                        <h3 className="font-bold text-light mb-4">Personalizar Evento</h3>
                        <p className="text-sm text-gray-300 mb-4">{isEditing.description}</p>
                        <div className="mb-4">
                            <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Cor do Quadro</label>
                            <div className="flex flex-wrap gap-2">
                                {COLORS.map(c => (
                                    <button 
                                        key={c}
                                        onClick={() => handleColorChange(c)}
                                        className="w-8 h-8 rounded-full border-2 border-transparent hover:scale-110 transition-transform"
                                        style={{ backgroundColor: c, borderColor: isEditing.color === c ? 'white' : 'transparent' }}
                                    />
                                ))}
                            </div>
                        </div>
                        <div className="flex justify-end gap-2">
                             <button onClick={() => setIsEditing(null)} className="px-4 py-2 bg-bg-main rounded text-gray-400 text-xs hover:text-white">Fechar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EcoSis;

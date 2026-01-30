
import { ServiceOrder, OsStep } from '../types';

/**
 * Motor de BI da Oficina - Protocolo v6.0
 */

export const calculateDuration = (step: OsStep): number => {
    if (!step.startedAt || !step.completedAt) return 0;
    const start = new Date(step.startedAt).getTime();
    const end = new Date(step.completedAt).getTime();
    return Math.max(0, (end - start) / (1000 * 60 * 60)); 
};

export const getMecBI = (orders: ServiceOrder[]) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthOrders = orders.filter(os => {
        const d = new Date(os.openingDate);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const stepKeys = ['entrance', 'checklist', 'quote', 'bodywork', 'painting', 'mechanics', 'electrical', 'parts', 'wash', 'exit'] as const;
    const timeByStep: Record<string, number> = {};
    const stepCounts: Record<string, number> = {};

    orders.forEach(os => {
        stepKeys.forEach(key => {
            const duration = calculateDuration(os.steps[key]);
            if (duration > 0) {
                timeByStep[key] = (timeByStep[key] || 0) + duration;
                stepCounts[key] = (stepCounts[key] || 0) + 1;
            }
        });
    });

    const avgTimeByStep = Object.keys(timeByStep).reduce((acc, key) => {
        acc[key] = timeByStep[key] / (stepCounts[key] || 1);
        return acc;
    }, {} as Record<string, number>);

    const bottleneck = Object.entries(avgTimeByStep).sort((a, b) => b[1] - a[1])[0];

    return {
        period: {
            count: monthOrders.length,
            completed: monthOrders.filter(o => o.status === 'finalizada').length,
            totalValue: monthOrders.reduce((sum, o) => sum + (o.totalCost || 0), 0)
        },
        bottleneck: bottleneck ? { name: bottleneck[0], value: bottleneck[1] } : null,
        quality: {
            incompleteChecklists: orders.filter(o => o.steps.checklist.status !== 'completed' && o.status === 'finalizada').length,
            avgRating: orders.reduce((acc, o) => {
                const ratings = Object.values(o.steps).filter(s => s.rating).map(s => s.rating as number);
                if (ratings.length === 0) return acc;
                return acc + (ratings.reduce((a,b) => a+b, 0) / ratings.length);
            }, 0) / (orders.length || 1)
        }
    };
};

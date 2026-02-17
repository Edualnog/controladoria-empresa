import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Transaction, ProjectProfit, MonthlyData, CategoryDistribution, ForecastData } from '@/types';

export function formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value);
}

export function formatDate(dateStr: string): string {
    try {
        return format(parseISO(dateStr), 'dd/MM/yyyy', { locale: ptBR });
    } catch {
        return dateStr;
    }
}

export function formatMonthYear(dateStr: string): string {
    try {
        const d = parseISO(dateStr + '-01');
        return format(d, 'MMM/yy', { locale: ptBR });
    } catch {
        return dateStr;
    }
}

export function calculateTotals(transactions: Transaction[]) {
    const today = new Date().toISOString().split('T')[0];
    const pastTransactions = transactions.filter(t => t.date <= today);

    const totalIncome = pastTransactions
        .filter((t) => t.type === 'INCOME')
        .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalExpense = pastTransactions
        .filter((t) => t.type === 'EXPENSE')
        .reduce((sum, t) => sum + Number(t.amount), 0);

    return { totalIncome, totalExpense, totalProfit: totalIncome - totalExpense };
}

export function calculateProfitByProject(transactions: Transaction[]): ProjectProfit[] {
    const map = new Map<string, ProjectProfit>();

    transactions.forEach((t) => {
        const projectName = t.project?.name || 'Sem projeto';
        const projectId = t.project_id;

        if (!map.has(projectId)) {
            map.set(projectId, {
                projectId,
                projectName,
                income: 0,
                expense: 0,
                profit: 0,
            });
        }

        const entry = map.get(projectId)!;
        if (t.type === 'INCOME') {
            entry.income += Number(t.amount);
        } else {
            entry.expense += Number(t.amount);
        }
        entry.profit = entry.income - entry.expense;
    });

    return Array.from(map.values()).sort((a, b) => b.profit - a.profit);
}

export function calculateMonthlyData(transactions: Transaction[]): MonthlyData[] {
    const map = new Map<string, MonthlyData>();

    transactions.forEach((t) => {
        const month = t.date.substring(0, 7); // YYYY-MM

        if (!map.has(month)) {
            map.set(month, { month, income: 0, expense: 0, profit: 0 });
        }

        const entry = map.get(month)!;
        if (t.type === 'INCOME') {
            entry.income += Number(t.amount);
        } else {
            entry.expense += Number(t.amount);
        }
        entry.profit = entry.income - entry.expense;
    });

    return Array.from(map.values()).sort((a, b) => a.month.localeCompare(b.month));
}

export function calculateExpenseByCategory(transactions: Transaction[]): CategoryDistribution[] {
    const map = new Map<string, number>();

    const expenses = transactions.filter((t) => t.type === 'EXPENSE');
    const total = expenses.reduce((sum, t) => sum + Number(t.amount), 0);

    expenses.forEach((t) => {
        const catName = t.category?.name || 'Sem categoria';
        map.set(catName, (map.get(catName) || 0) + Number(t.amount));
    });

    return Array.from(map.entries())
        .map(([name, value]) => ({
            name,
            value,
            percentage: total > 0 ? (value / total) * 100 : 0,
        }))
        .sort((a, b) => b.value - a.value);
}

export function calculateForecast(transactions: Transaction[]): ForecastData[] {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const map = new Map<string, ForecastData>();

    // Get future transactions (parcelas futuras)
    const futureTransactions = transactions.filter((t) => t.date > todayStr);

    futureTransactions.forEach((t) => {
        const month = t.date.substring(0, 7);

        if (!map.has(month)) {
            map.set(month, { month, income: 0, expense: 0 });
        }

        const entry = map.get(month)!;
        if (t.type === 'INCOME') {
            entry.income += Number(t.amount);
        } else {
            entry.expense += Number(t.amount);
        }
    });

    return Array.from(map.values()).sort((a, b) => a.month.localeCompare(b.month));
}

export function cn(...classes: (string | undefined | false)[]): string {
    return classes.filter(Boolean).join(' ');
}

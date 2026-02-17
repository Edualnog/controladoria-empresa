import { createClient } from '@/lib/supabase/server';
import {
    calculateTotals,
    calculateProfitByProject,
    calculateMonthlyData,
    calculateExpenseByCategory,
    calculateForecast,
} from '@/lib/utils';
import type { DashboardData, Transaction } from '@/types';

export async function getDashboardData(): Promise<DashboardData> {
    const supabase = await createClient();

    const { data: transactions, error } = await supabase
        .from('transactions')
        .select('*, project:projects(*), category:categories(*)')
        .order('date', { ascending: true });

    if (error || !transactions) {
        return {
            totalIncome: 0,
            totalExpense: 0,
            totalProfit: 0,
            profitByProject: [],
            monthlyData: [],
            expenseByCategory: [],
            forecast: [],
        };
    }

    const typedTransactions = transactions as Transaction[];
    const { totalIncome, totalExpense, totalProfit } = calculateTotals(typedTransactions);

    return {
        totalIncome,
        totalExpense,
        totalProfit,
        profitByProject: calculateProfitByProject(typedTransactions),
        monthlyData: calculateMonthlyData(typedTransactions),
        expenseByCategory: calculateExpenseByCategory(typedTransactions),
        forecast: calculateForecast(typedTransactions),
    };
}

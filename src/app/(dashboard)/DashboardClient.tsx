'use client';

import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import {
    formatCurrency,
    calculateTotals,
    calculateProfitByProject,
    calculateMonthlyData,
    calculateExpenseByCategory,
    calculateForecast,
} from '@/lib/utils';
import type { Transaction } from '@/types';
import { usePeriodSelector } from '@/hooks/usePeriodSelector';
import PeriodSelector from '@/components/ui/PeriodSelector';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

const RevenueExpenseChart = dynamic(
    () => import('@/components/charts/RevenueExpenseChart'),
    { ssr: false }
);

const ProfitChart = dynamic(
    () => import('@/components/charts/ProfitChart'),
    { ssr: false }
);

const ExpensePieChart = dynamic(
    () => import('@/components/charts/ExpensePieChart'),
    { ssr: false }
);

const ForecastChart = dynamic(
    () => import('@/components/charts/ForecastChart'),
    { ssr: false }
);

interface DashboardClientProps {
    transactions: Transaction[];
}

export default function DashboardClient({ transactions }: DashboardClientProps) {
    const period = usePeriodSelector({ showAll: true });

    // Filter transactions by period
    const filtered = useMemo(() => {
        return transactions.filter(
            (t) => t.date >= period.periodRange.startStr && t.date <= period.periodRange.endStr
        );
    }, [transactions, period.periodRange]);

    // Compute all dashboard data
    const { totalIncome, totalExpense, totalProfit } = useMemo(
        () => calculateTotals(filtered),
        [filtered]
    );
    const profitByProject = useMemo(() => {
        const all = calculateProfitByProject(filtered);
        return all.filter((p) => p.projectId !== 'no-project');
    }, [filtered]);
    const monthlyData = useMemo(() => calculateMonthlyData(filtered), [filtered]);
    const expenseByCategory = useMemo(() => calculateExpenseByCategory(filtered), [filtered]);
    const forecast = useMemo(() => calculateForecast(transactions), [transactions]);

    return (
        <>
            <div className="page-header">
                <h1 className="page-title">Dashboard</h1>
            </div>

            <PeriodSelector {...period} />

            {/* Summary Cards */}
            <div className="summary-cards">
                <div className="stat-card income">
                    <div className="stat-card__inner">
                        <div>
                            <p className="summary-card__label--neutral">Receita</p>
                            <p className="summary-card__value--lg">{formatCurrency(totalIncome)}</p>
                        </div>
                        <TrendingUp size={20} color="#16a34a" />
                    </div>
                </div>

                <div className="stat-card expense">
                    <div className="stat-card__inner">
                        <div>
                            <p className="summary-card__label--neutral">Despesa</p>
                            <p className="summary-card__value--lg">{formatCurrency(totalExpense)}</p>
                        </div>
                        <TrendingDown size={20} color="#dc2626" />
                    </div>
                </div>

                <div className="stat-card profit">
                    <div className="stat-card__inner">
                        <div>
                            <p className="summary-card__label--neutral">Lucro</p>
                            <p
                                className="summary-card__value--lg"
                                style={{ color: totalProfit >= 0 ? '#37352f' : '#dc2626' }}
                            >
                                {formatCurrency(totalProfit)}
                            </p>
                        </div>
                        <DollarSign size={20} color="#37352f" />
                    </div>
                </div>
            </div>

            {/* Row 1: Pie chart + Profit by Project */}
            <div className="chart-grid">
                <div>
                    <h2 className="section-title">Distribuição de Despesas</h2>
                    <div className="glass-card card-padded">
                        <ExpensePieChart data={expenseByCategory} />
                    </div>
                </div>

                <div>
                    <h2 className="section-title">Lucro por Obra</h2>
                    {profitByProject.length === 0 ? (
                        <div className="glass-card card-padded empty-state">
                            Nenhuma transação neste período
                        </div>
                    ) : (
                        <div className="glass-card overflow-hidden">
                            <div className="table-container">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Obra</th>
                                            <th className="text-right">Receitas</th>
                                            <th className="text-right">Despesas</th>
                                            <th className="text-right">Lucro</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {profitByProject.map((p) => (
                                            <tr key={p.projectId}>
                                                <td className="text-bold">{p.projectName}</td>
                                                <td className="text-right text-income">
                                                    {formatCurrency(p.income)}
                                                </td>
                                                <td className="text-right text-expense">
                                                    {formatCurrency(p.expense)}
                                                </td>
                                                <td
                                                    className="text-right text-bold"
                                                    style={{ color: p.profit >= 0 ? '#37352f' : '#dc2626' }}
                                                >
                                                    {formatCurrency(p.profit)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Row 2: Revenue vs Expense + Profit */}
            <div className="chart-grid">
                <div>
                    <h2 className="section-title">Receitas vs Despesas</h2>
                    <div className="glass-card card-padded">
                        <RevenueExpenseChart data={monthlyData} />
                    </div>
                </div>

                <div>
                    <h2 className="section-title">Lucro Mensal</h2>
                    <div className="glass-card card-padded">
                        <ProfitChart data={monthlyData} />
                    </div>
                </div>
            </div>

            {/* Row 3: Forecast */}
            <div className="chart-section">
                <h2 className="section-title">Previsão de Entradas e Saídas</h2>
                <div className="glass-card card-padded">
                    <ForecastChart data={forecast} />
                </div>
            </div>
        </>
    );
}

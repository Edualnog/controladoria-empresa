'use client';

import dynamic from 'next/dynamic';
import { formatCurrency } from '@/lib/utils';
import type { ProjectProfit, MonthlyData, CategoryDistribution, ForecastData } from '@/types';

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
    profitByProject: ProjectProfit[];
    monthlyData: MonthlyData[];
    expenseByCategory: CategoryDistribution[];
    forecast: ForecastData[];
}

export default function DashboardClient({
    profitByProject,
    monthlyData,
    expenseByCategory,
    forecast,
}: DashboardClientProps) {
    return (
        <>
            {/* Row 1: Pie chart + Profit by Project */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
                    gap: '24px',
                    marginBottom: '32px',
                }}
            >
                <div>
                    <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#37352f', marginBottom: '12px' }}>
                        Distribuição de Despesas
                    </h2>
                    <div className="glass-card" style={{ padding: '20px' }}>
                        <ExpensePieChart data={expenseByCategory} />
                    </div>
                </div>

                <div>
                    <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#37352f', marginBottom: '12px' }}>
                        Lucro por Obra
                    </h2>
                    {profitByProject.length === 0 ? (
                        <div className="glass-card" style={{ padding: '32px', textAlign: 'center', color: '#a3a3a3', fontSize: '14px' }}>
                            Nenhuma transação registrada ainda
                        </div>
                    ) : (
                        <div className="glass-card" style={{ overflow: 'hidden' }}>
                            <div className="table-container">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Obra</th>
                                            <th style={{ textAlign: 'right' }}>Receitas</th>
                                            <th style={{ textAlign: 'right' }}>Despesas</th>
                                            <th style={{ textAlign: 'right' }}>Lucro</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {profitByProject.map((p) => (
                                            <tr key={p.projectId}>
                                                <td style={{ fontWeight: 500 }}>{p.projectName}</td>
                                                <td style={{ textAlign: 'right', color: '#16a34a' }}>
                                                    {formatCurrency(p.income)}
                                                </td>
                                                <td style={{ textAlign: 'right', color: '#dc2626' }}>
                                                    {formatCurrency(p.expense)}
                                                </td>
                                                <td
                                                    style={{
                                                        textAlign: 'right',
                                                        fontWeight: 600,
                                                        color: p.profit >= 0 ? '#37352f' : '#dc2626',
                                                    }}
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
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
                    gap: '24px',
                    marginBottom: '32px',
                }}
            >
                <div>
                    <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#37352f', marginBottom: '12px' }}>
                        Receitas vs Despesas
                    </h2>
                    <div className="glass-card" style={{ padding: '20px' }}>
                        <RevenueExpenseChart data={monthlyData} />
                    </div>
                </div>

                <div>
                    <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#37352f', marginBottom: '12px' }}>
                        Lucro Mensal
                    </h2>
                    <div className="glass-card" style={{ padding: '20px' }}>
                        <ProfitChart data={monthlyData} />
                    </div>
                </div>
            </div>

            {/* Row 3: Forecast */}
            <div style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#37352f', marginBottom: '12px' }}>
                    Previsão de Entradas e Saídas
                </h2>
                <div className="glass-card" style={{ padding: '20px' }}>
                    <ForecastChart data={forecast} />
                </div>
            </div>
        </>
    );
}

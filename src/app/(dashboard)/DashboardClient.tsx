'use client';

import { useState, useMemo } from 'react';
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
import { TrendingUp, TrendingDown, DollarSign, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

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

type PeriodMode = 'month' | 'week' | 'all';

function getMonthLabel(year: number, month: number): string {
    const date = new Date(year, month);
    return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
}

function getWeekRange(date: Date): { start: Date; end: Date } {
    const day = date.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    const start = new Date(date);
    start.setDate(date.getDate() + diff);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return { start, end };
}

function getWeekLabel(start: Date, end: Date): string {
    const sDay = start.getDate().toString().padStart(2, '0');
    const sMonth = (start.getMonth() + 1).toString().padStart(2, '0');
    const eDay = end.getDate().toString().padStart(2, '0');
    const eMonth = (end.getMonth() + 1).toString().padStart(2, '0');
    const year = end.getFullYear();
    return `${sDay}/${sMonth} — ${eDay}/${eMonth}/${year}`;
}

function formatDateStr(d: Date): string {
    return d.toISOString().split('T')[0];
}

interface DashboardClientProps {
    transactions: Transaction[];
}

export default function DashboardClient({ transactions }: DashboardClientProps) {
    const now = new Date();
    const [periodMode, setPeriodMode] = useState<PeriodMode>('month');
    const [selectedYear, setSelectedYear] = useState(now.getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
    const [weekAnchor, setWeekAnchor] = useState(() => {
        const { start } = getWeekRange(now);
        return start;
    });

    const periodRange = useMemo(() => {
        if (periodMode === 'all') {
            return { startStr: '1900-01-01', endStr: '2100-12-31', label: 'Todos os períodos' };
        }
        if (periodMode === 'month') {
            const start = new Date(selectedYear, selectedMonth, 1);
            const end = new Date(selectedYear, selectedMonth + 1, 0);
            return {
                startStr: formatDateStr(start),
                endStr: formatDateStr(end),
                label: getMonthLabel(selectedYear, selectedMonth),
            };
        }
        const { start, end } = getWeekRange(weekAnchor);
        return {
            startStr: formatDateStr(start),
            endStr: formatDateStr(end),
            label: getWeekLabel(start, end),
        };
    }, [periodMode, selectedYear, selectedMonth, weekAnchor]);

    const goBack = () => {
        if (periodMode === 'month') {
            if (selectedMonth === 0) {
                setSelectedMonth(11);
                setSelectedYear((y) => y - 1);
            } else {
                setSelectedMonth((m) => m - 1);
            }
        } else if (periodMode === 'week') {
            setWeekAnchor((prev) => {
                const d = new Date(prev);
                d.setDate(d.getDate() - 7);
                return d;
            });
        }
    };

    const goForward = () => {
        if (periodMode === 'month') {
            if (selectedMonth === 11) {
                setSelectedMonth(0);
                setSelectedYear((y) => y + 1);
            } else {
                setSelectedMonth((m) => m + 1);
            }
        } else if (periodMode === 'week') {
            setWeekAnchor((prev) => {
                const d = new Date(prev);
                d.setDate(d.getDate() + 7);
                return d;
            });
        }
    };

    const goToday = () => {
        const today = new Date();
        setSelectedYear(today.getFullYear());
        setSelectedMonth(today.getMonth());
        setWeekAnchor(getWeekRange(today).start);
    };

    // Filter transactions by period
    const filtered = useMemo(() => {
        return transactions.filter(
            (t) => t.date >= periodRange.startStr && t.date <= periodRange.endStr
        );
    }, [transactions, periodRange]);

    // Compute all dashboard data
    const { totalIncome, totalExpense, totalProfit } = useMemo(
        () => calculateTotals(filtered),
        [filtered]
    );
    const profitByProject = useMemo(() => calculateProfitByProject(filtered), [filtered]);
    const monthlyData = useMemo(() => calculateMonthlyData(filtered), [filtered]);
    const expenseByCategory = useMemo(() => calculateExpenseByCategory(filtered), [filtered]);
    const forecast = useMemo(() => calculateForecast(transactions), [transactions]);

    const modes: { label: string; value: PeriodMode }[] = [
        { label: 'Semana', value: 'week' },
        { label: 'Mês', value: 'month' },
        { label: 'Tudo', value: 'all' },
    ];

    return (
        <>
            <div className="page-header">
                <h1 className="page-title">Dashboard</h1>
            </div>

            {/* Period Selector */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    background: '#fafafa',
                    borderRadius: '8px',
                    border: '1px solid #ebebea',
                    marginBottom: '24px',
                    flexWrap: 'wrap',
                    gap: '12px',
                }}
            >
                {/* Mode toggle */}
                <div style={{ display: 'flex', gap: '2px', background: '#e5e5e5', borderRadius: '6px', padding: '2px' }}>
                    {modes.map((m) => (
                        <button
                            key={m.value}
                            onClick={() => setPeriodMode(m.value)}
                            style={{
                                padding: '5px 12px',
                                fontSize: '12px',
                                fontWeight: 500,
                                borderRadius: '5px',
                                border: 'none',
                                cursor: 'pointer',
                                background: periodMode === m.value ? '#ffffff' : 'transparent',
                                color: periodMode === m.value ? '#37352f' : '#737373',
                                boxShadow: periodMode === m.value ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                                transition: 'all 0.15s ease',
                            }}
                        >
                            {m.label}
                        </button>
                    ))}
                </div>

                {/* Navigation */}
                {periodMode !== 'all' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                            onClick={goBack}
                            style={{
                                background: '#ffffff',
                                border: '1px solid #e5e5e5',
                                borderRadius: '6px',
                                padding: '5px 8px',
                                cursor: 'pointer',
                                color: '#737373',
                                display: 'flex',
                                alignItems: 'center',
                            }}
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <span
                            style={{
                                fontSize: '14px',
                                fontWeight: 600,
                                color: '#37352f',
                                minWidth: '180px',
                                textAlign: 'center',
                                textTransform: 'capitalize',
                            }}
                        >
                            {periodRange.label}
                        </span>
                        <button
                            onClick={goForward}
                            style={{
                                background: '#ffffff',
                                border: '1px solid #e5e5e5',
                                borderRadius: '6px',
                                padding: '5px 8px',
                                cursor: 'pointer',
                                color: '#737373',
                                display: 'flex',
                                alignItems: 'center',
                            }}
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                )}

                {periodMode === 'all' && (
                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#37352f' }}>
                        {periodRange.label}
                    </span>
                )}

                {/* Today button */}
                {periodMode !== 'all' && (
                    <button
                        onClick={goToday}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '5px 12px',
                            fontSize: '12px',
                            fontWeight: 500,
                            background: '#ffffff',
                            border: '1px solid #e5e5e5',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            color: '#737373',
                        }}
                    >
                        <Calendar size={13} />
                        Hoje
                    </button>
                )}
            </div>

            {/* Summary Cards */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '16px',
                    marginBottom: '32px',
                }}
            >
                <div className="stat-card income">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <p style={{ fontSize: '12px', color: '#737373', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                                Receita
                            </p>
                            <p style={{ fontSize: '24px', fontWeight: 700, color: '#37352f', marginTop: '4px' }}>
                                {formatCurrency(totalIncome)}
                            </p>
                        </div>
                        <TrendingUp size={20} color="#16a34a" />
                    </div>
                </div>

                <div className="stat-card expense">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <p style={{ fontSize: '12px', color: '#737373', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                                Despesa
                            </p>
                            <p style={{ fontSize: '24px', fontWeight: 700, color: '#37352f', marginTop: '4px' }}>
                                {formatCurrency(totalExpense)}
                            </p>
                        </div>
                        <TrendingDown size={20} color="#dc2626" />
                    </div>
                </div>

                <div className="stat-card profit">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <p style={{ fontSize: '12px', color: '#737373', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                                Lucro
                            </p>
                            <p
                                style={{
                                    fontSize: '24px',
                                    fontWeight: 700,
                                    color: totalProfit >= 0 ? '#37352f' : '#dc2626',
                                    marginTop: '4px',
                                }}
                            >
                                {formatCurrency(totalProfit)}
                            </p>
                        </div>
                        <DollarSign size={20} color="#37352f" />
                    </div>
                </div>
            </div>

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
                            Nenhuma transação neste período
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

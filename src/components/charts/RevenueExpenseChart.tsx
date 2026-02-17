'use client';

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import type { MonthlyData } from '@/types';
import { formatMonthYear, formatCurrency } from '@/lib/utils';

interface RevenueExpenseChartProps {
    data: MonthlyData[];
}

export default function RevenueExpenseChart({ data }: RevenueExpenseChartProps) {
    const chartData = data.map((d) => ({
        ...d,
        monthLabel: formatMonthYear(d.month),
    }));

    if (data.length === 0) {
        return (
            <div style={{ padding: '40px', textAlign: 'center', color: '#9b9a97', fontSize: '14px' }}>
                Nenhum dado para exibir
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ebebea" />
                <XAxis
                    dataKey="monthLabel"
                    tick={{ fill: '#9b9a97', fontSize: 12 }}
                    axisLine={{ stroke: '#ebebea' }}
                    tickLine={false}
                />
                <YAxis
                    tick={{ fill: '#9b9a97', fontSize: 12 }}
                    axisLine={{ stroke: '#ebebea' }}
                    tickLine={false}
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                    contentStyle={{
                        background: '#ffffff',
                        border: '1px solid #ebebea',
                        borderRadius: '6px',
                        color: '#37352f',
                        fontSize: '13px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    }}
                    formatter={(value) => [formatCurrency(Number(value))]}
                />
                <Legend
                    formatter={(value) => (
                        <span style={{ color: '#9b9a97', fontSize: '12px' }}>{value}</span>
                    )}
                />
                <Bar dataKey="income" name="Receitas" fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" name="Despesas" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );
}

'use client';

import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import type { MonthlyData } from '@/types';
import { formatMonthYear, formatCurrency } from '@/lib/utils';

interface ProfitChartProps {
    data: MonthlyData[];
}

export default function ProfitChart({ data }: ProfitChartProps) {
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
            <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <defs>
                    <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#37352f" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#37352f" stopOpacity={0} />
                    </linearGradient>
                </defs>
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
                    formatter={(value) => [formatCurrency(Number(value)), 'Lucro']}
                />
                <Area
                    type="monotone"
                    dataKey="profit"
                    stroke="#37352f"
                    strokeWidth={2}
                    fill="url(#profitGradient)"
                />
            </AreaChart>
        </ResponsiveContainer>
    );
}

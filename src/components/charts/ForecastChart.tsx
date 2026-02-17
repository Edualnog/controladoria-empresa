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
import type { ForecastData } from '@/types';
import { formatMonthYear, formatCurrency } from '@/lib/utils';

interface ForecastChartProps {
    data: ForecastData[];
}

export default function ForecastChart({ data }: ForecastChartProps) {
    const chartData = data.map((d) => ({
        ...d,
        monthLabel: formatMonthYear(d.month),
    }));

    if (data.length === 0) {
        return (
            <div style={{ padding: '40px', textAlign: 'center', color: '#a3a3a3', fontSize: '14px' }}>
                Nenhuma parcela futura registrada
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ebebea" />
                <XAxis
                    dataKey="monthLabel"
                    tick={{ fill: '#737373', fontSize: 12 }}
                    axisLine={{ stroke: '#e5e5e5' }}
                    tickLine={false}
                />
                <YAxis
                    tick={{ fill: '#737373', fontSize: 12 }}
                    axisLine={{ stroke: '#e5e5e5' }}
                    tickLine={false}
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                    contentStyle={{
                        background: '#ffffff',
                        border: '1px solid #e5e5e5',
                        borderRadius: '6px',
                        color: '#37352f',
                        fontSize: '13px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    }}
                    formatter={(value) => [formatCurrency(Number(value))]}
                />
                <Legend
                    formatter={(value) => (
                        <span style={{ color: '#737373', fontSize: '12px' }}>{value}</span>
                    )}
                />
                <Bar dataKey="income" name="Entradas Previstas" fill="#16a34a" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" name="Saídas Previstas" fill="#dc2626" radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );
}

'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { CategoryDistribution } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface ExpensePieChartProps {
    data: CategoryDistribution[];
}

const COLORS = [
    '#37352f', '#737373', '#a3a3a3', '#d4d4d4',
    '#525252', '#404040', '#262626', '#e5e5e5',
    '#171717', '#fafafa',
];

export default function ExpensePieChart({ data }: ExpensePieChartProps) {
    if (data.length === 0) {
        return (
            <div style={{ padding: '40px', textAlign: 'center', color: '#a3a3a3', fontSize: '14px' }}>
                Nenhuma despesa registrada
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
            <div style={{ width: '200px', height: '200px' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={85}
                            dataKey="value"
                            stroke="#ffffff"
                            strokeWidth={2}
                        >
                            {data.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            formatter={(value) => formatCurrency(Number(value))}
                            contentStyle={{
                                background: '#ffffff',
                                border: '1px solid #e5e5e5',
                                borderRadius: '6px',
                                fontSize: '13px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                            }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <div style={{ flex: 1, minWidth: '160px' }}>
                {data.map((item, index) => (
                    <div
                        key={item.name}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '4px 0',
                            fontSize: '13px',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div
                                style={{
                                    width: '10px',
                                    height: '10px',
                                    borderRadius: '2px',
                                    backgroundColor: COLORS[index % COLORS.length],
                                }}
                            />
                            <span style={{ color: '#37352f' }}>{item.name}</span>
                        </div>
                        <span style={{ color: '#737373', fontWeight: 500 }}>
                            {item.percentage.toFixed(1)}%
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

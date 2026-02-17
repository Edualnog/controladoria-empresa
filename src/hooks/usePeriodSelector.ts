'use client';

import { useState, useMemo } from 'react';

export type PeriodMode = 'month' | 'week' | 'all';

export interface PeriodRange {
    startStr: string;
    endStr: string;
    label: string;
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

function getMonthLabel(year: number, month: number): string {
    const date = new Date(year, month);
    return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
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

interface UsePeriodSelectorOptions {
    showAll?: boolean;
}

export function usePeriodSelector(options: UsePeriodSelectorOptions = {}) {
    const { showAll = false } = options;
    const now = new Date();

    const [periodMode, setPeriodMode] = useState<PeriodMode>('month');
    const [selectedYear, setSelectedYear] = useState(now.getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
    const [weekAnchor, setWeekAnchor] = useState(() => {
        const { start } = getWeekRange(now);
        return start;
    });

    const periodRange: PeriodRange = useMemo(() => {
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

    const modes: { label: string; value: PeriodMode }[] = showAll
        ? [
            { label: 'Semana', value: 'week' },
            { label: 'Mês', value: 'month' },
            { label: 'Tudo', value: 'all' },
        ]
        : [
            { label: 'Mês', value: 'month' },
            { label: 'Semana', value: 'week' },
        ];

    return {
        periodMode,
        setPeriodMode,
        periodRange,
        goBack,
        goForward,
        goToday,
        modes,
    };
}

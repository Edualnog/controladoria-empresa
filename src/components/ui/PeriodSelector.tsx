'use client';

import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import type { PeriodMode } from '@/hooks/usePeriodSelector';

interface PeriodSelectorProps {
    periodMode: PeriodMode;
    setPeriodMode: (mode: PeriodMode) => void;
    periodRange: { label: string };
    goBack: () => void;
    goForward: () => void;
    goToday: () => void;
    modes: { label: string; value: PeriodMode }[];
}

export default function PeriodSelector({
    periodMode,
    setPeriodMode,
    periodRange,
    goBack,
    goForward,
    goToday,
    modes,
}: PeriodSelectorProps) {
    return (
        <div className="period-selector">
            {/* Mode toggle */}
            <div className="period-toggle">
                {modes.map((m) => (
                    <button
                        key={m.value}
                        onClick={() => setPeriodMode(m.value)}
                        className={`period-toggle-btn ${periodMode === m.value ? 'active' : ''}`}
                    >
                        {m.label}
                    </button>
                ))}
            </div>

            {/* Navigation */}
            {periodMode !== 'all' ? (
                <div className="period-nav">
                    <button onClick={goBack} className="period-nav-btn" aria-label="Período anterior">
                        <ChevronLeft size={16} />
                    </button>
                    <span className="period-label">{periodRange.label}</span>
                    <button onClick={goForward} className="period-nav-btn" aria-label="Próximo período">
                        <ChevronRight size={16} />
                    </button>
                </div>
            ) : (
                <span className="period-label">{periodRange.label}</span>
            )}

            {/* Today button */}
            {periodMode !== 'all' && (
                <button onClick={goToday} className="today-btn">
                    <Calendar size={13} />
                    Hoje
                </button>
            )}
        </div>
    );
}

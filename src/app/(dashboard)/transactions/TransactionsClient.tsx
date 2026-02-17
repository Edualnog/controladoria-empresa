'use client';

import { useState, useMemo } from 'react';
import {
    createTransaction,
    updateTransaction,
    deleteTransaction,
} from '@/app/actions';
import type { Transaction, Project, Category, TransactionType } from '@/types';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Pagination from '@/components/ui/Pagination';
import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

const ITEMS_PER_PAGE = 10;

interface TransactionsClientProps {
    initialTransactions: Transaction[];
    projects: Project[];
    categories: Category[];
}

type PeriodMode = 'month' | 'week';

function getMonthLabel(year: number, month: number): string {
    const date = new Date(year, month);
    return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
}

function getWeekRange(date: Date): { start: Date; end: Date } {
    const day = date.getDay();
    const diff = day === 0 ? -6 : 1 - day; // Monday as start
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

export default function TransactionsClient({
    initialTransactions,
    projects,
    categories,
}: TransactionsClientProps) {
    const [transactions, setTransactions] = useState(initialTransactions);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Transaction | null>(null);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState<'ALL' | TransactionType>('ALL');
    const [currentPage, setCurrentPage] = useState(1);
    const [formData, setFormData] = useState({
        description: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        type: 'EXPENSE' as TransactionType,
        project_id: '',
        category_id: '',
        installments: '1',
    });

    // Period state
    const now = new Date();
    const [periodMode, setPeriodMode] = useState<PeriodMode>('month');
    const [selectedYear, setSelectedYear] = useState(now.getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
    const [weekAnchor, setWeekAnchor] = useState(() => {
        const { start } = getWeekRange(now);
        return start;
    });

    // Computed period range
    const periodRange = useMemo(() => {
        if (periodMode === 'month') {
            const start = new Date(selectedYear, selectedMonth, 1);
            const end = new Date(selectedYear, selectedMonth + 1, 0); // Last day of month
            return {
                startStr: formatDateStr(start),
                endStr: formatDateStr(end),
                label: getMonthLabel(selectedYear, selectedMonth),
            };
        } else {
            const { start, end } = getWeekRange(weekAnchor);
            return {
                startStr: formatDateStr(start),
                endStr: formatDateStr(end),
                label: getWeekLabel(start, end),
            };
        }
    }, [periodMode, selectedYear, selectedMonth, weekAnchor]);

    // Navigate period
    const goBack = () => {
        if (periodMode === 'month') {
            if (selectedMonth === 0) {
                setSelectedMonth(11);
                setSelectedYear((y) => y - 1);
            } else {
                setSelectedMonth((m) => m - 1);
            }
        } else {
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
        } else {
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

    // Filter transactions by period and type
    const filtered = useMemo(() => {
        setCurrentPage(1);
        let result = transactions.filter(
            (t) => t.date >= periodRange.startStr && t.date <= periodRange.endStr
        );
        if (filter !== 'ALL') {
            result = result.filter((t) => t.type === filter);
        }
        return result.sort((a, b) => b.date.localeCompare(a.date));
    }, [transactions, periodRange, filter]);

    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const paginatedItems = filtered.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    // Calculate totals for the period
    const periodTotals = useMemo(() => {
        const income = filtered
            .filter((t) => t.type === 'INCOME')
            .reduce((s, t) => s + Number(t.amount), 0);
        const expense = filtered
            .filter((t) => t.type === 'EXPENSE')
            .reduce((s, t) => s + Number(t.amount), 0);
        return { income, expense, balance: income - expense };
    }, [filtered]);

    const filteredCategories = categories.filter((c) => c.type === formData.type);

    const resetForm = () => {
        setFormData({
            description: '',
            amount: '',
            date: new Date().toISOString().split('T')[0],
            type: 'EXPENSE',
            project_id: '',
            category_id: '',
            installments: '1',
        });
        setEditingTransaction(null);
        setIsModalOpen(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const payload = {
            description: formData.description,
            amount: parseFloat(formData.amount),
            date: formData.date,
            type: formData.type,
            project_id: formData.project_id,
            category_id: formData.category_id,
            installments: parseInt(formData.installments) || 1,
        };

        if (editingTransaction) {
            const updated = await updateTransaction(editingTransaction.id, payload);
            if (updated) {
                setTransactions((prev) =>
                    prev.map((t) => (t.id === updated.id ? updated : t))
                );
            }
        } else {
            const created = await createTransaction(payload);
            if (created) {
                if (Array.isArray(created)) {
                    setTransactions((prev) => [...created, ...prev]);
                } else {
                    setTransactions((prev) => [created, ...prev]);
                }
            }
        }

        setLoading(false);
        resetForm();
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setLoading(true);
        await deleteTransaction(deleteTarget.id);
        setTransactions((prev) => prev.filter((t) => t.id !== deleteTarget.id));
        setLoading(false);
        setDeleteTarget(null);
    };

    const openEdit = (transaction: Transaction) => {
        setEditingTransaction(transaction);
        setFormData({
            description: transaction.description,
            amount: transaction.amount.toString(),
            date: transaction.date,
            type: transaction.type,
            project_id: transaction.project_id,
            category_id: transaction.category_id,
            installments: '1',
        });
        setIsModalOpen(true);
    };

    const tabs: { label: string; value: 'ALL' | TransactionType }[] = [
        { label: 'Todos', value: 'ALL' },
        { label: 'Receitas', value: 'INCOME' },
        { label: 'Despesas', value: 'EXPENSE' },
    ];

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Lançamentos</h1>
                <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
                    <Plus size={16} />
                    Novo Lançamento
                </button>
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
                    marginBottom: '16px',
                    flexWrap: 'wrap',
                    gap: '12px',
                }}
            >
                {/* Mode toggle */}
                <div style={{ display: 'flex', gap: '2px', background: '#e5e5e5', borderRadius: '6px', padding: '2px' }}>
                    <button
                        onClick={() => setPeriodMode('month')}
                        style={{
                            padding: '5px 12px',
                            fontSize: '12px',
                            fontWeight: 500,
                            borderRadius: '5px',
                            border: 'none',
                            cursor: 'pointer',
                            background: periodMode === 'month' ? '#ffffff' : 'transparent',
                            color: periodMode === 'month' ? '#37352f' : '#737373',
                            boxShadow: periodMode === 'month' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                            transition: 'all 0.15s ease',
                        }}
                    >
                        Mês
                    </button>
                    <button
                        onClick={() => setPeriodMode('week')}
                        style={{
                            padding: '5px 12px',
                            fontSize: '12px',
                            fontWeight: 500,
                            borderRadius: '5px',
                            border: 'none',
                            cursor: 'pointer',
                            background: periodMode === 'week' ? '#ffffff' : 'transparent',
                            color: periodMode === 'week' ? '#37352f' : '#737373',
                            boxShadow: periodMode === 'week' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                            transition: 'all 0.15s ease',
                        }}
                    >
                        Semana
                    </button>
                </div>

                {/* Period navigation */}
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

                {/* Today button */}
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
            </div>

            {/* Period summary */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '12px',
                    marginBottom: '16px',
                }}
            >
                <div
                    style={{
                        padding: '12px 16px',
                        background: '#f0fdf4',
                        borderRadius: '8px',
                        border: '1px solid #bbf7d0',
                    }}
                >
                    <p style={{ fontSize: '11px', color: '#16a34a', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Entradas
                    </p>
                    <p style={{ fontSize: '18px', fontWeight: 700, color: '#16a34a', marginTop: '2px' }}>
                        {formatCurrency(periodTotals.income)}
                    </p>
                </div>
                <div
                    style={{
                        padding: '12px 16px',
                        background: '#fef2f2',
                        borderRadius: '8px',
                        border: '1px solid #fecaca',
                    }}
                >
                    <p style={{ fontSize: '11px', color: '#dc2626', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Saídas
                    </p>
                    <p style={{ fontSize: '18px', fontWeight: 700, color: '#dc2626', marginTop: '2px' }}>
                        {formatCurrency(periodTotals.expense)}
                    </p>
                </div>
                <div
                    style={{
                        padding: '12px 16px',
                        background: '#fafafa',
                        borderRadius: '8px',
                        border: '1px solid #e5e5e5',
                    }}
                >
                    <p style={{ fontSize: '11px', color: '#737373', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Saldo do Período
                    </p>
                    <p
                        style={{
                            fontSize: '18px',
                            fontWeight: 700,
                            color: periodTotals.balance >= 0 ? '#16a34a' : '#dc2626',
                            marginTop: '2px',
                        }}
                    >
                        {formatCurrency(periodTotals.balance)}
                    </p>
                </div>
            </div>

            {/* Filter tabs */}
            <div style={{ display: 'flex', gap: '2px', marginBottom: '20px', borderBottom: '1px solid #ebebea', paddingBottom: '0' }}>
                {tabs.map((tab) => (
                    <button
                        key={tab.value}
                        onClick={() => setFilter(tab.value)}
                        style={{
                            padding: '8px 12px',
                            fontSize: '13px',
                            fontWeight: 500,
                            color: filter === tab.value ? '#37352f' : '#9b9a97',
                            background: 'transparent',
                            border: 'none',
                            borderBottom: filter === tab.value ? '2px solid #37352f' : '2px solid transparent',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            marginBottom: '-1px',
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {filtered.length === 0 ? (
                <div className="empty-state">
                    <p style={{ fontSize: '14px' }}>Nenhum lançamento neste período</p>
                    <p style={{ fontSize: '13px', marginTop: '4px' }}>
                        Use as setas para navegar entre períodos ou clique em &quot;Novo Lançamento&quot;
                    </p>
                </div>
            ) : (
                <div className="glass-card" style={{ overflow: 'hidden' }}>
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Data</th>
                                    <th>Descrição</th>
                                    <th>Obra</th>
                                    <th>Categoria</th>
                                    <th style={{ textAlign: 'right' }}>Valor</th>
                                    <th>Parcela</th>
                                    <th style={{ width: '80px', textAlign: 'right' }}>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedItems.map((t) => (
                                    <tr key={t.id}>
                                        <td style={{ color: '#9b9a97', fontSize: '13px', whiteSpace: 'nowrap' }}>
                                            {formatDate(t.date)}
                                        </td>
                                        <td style={{ fontWeight: 500 }}>{t.description}</td>
                                        <td style={{ color: '#9b9a97' }}>{t.project?.name || '—'}</td>
                                        <td>
                                            <span
                                                className={
                                                    t.type === 'INCOME' ? 'badge badge-income' : 'badge badge-expense'
                                                }
                                            >
                                                {t.category?.name || '—'}
                                            </span>
                                        </td>
                                        <td
                                            style={{
                                                textAlign: 'right',
                                                fontWeight: 600,
                                                color: t.type === 'INCOME' ? '#16a34a' : '#dc2626',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {t.type === 'INCOME' ? '+' : '-'}{formatCurrency(t.amount)}
                                        </td>
                                        <td style={{ color: '#9b9a97', fontSize: '13px' }}>
                                            {t.total_installments && t.total_installments > 1
                                                ? `${t.installment_number}/${t.total_installments}`
                                                : '—'}
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                                                <button
                                                    onClick={() => openEdit(t)}
                                                    style={{
                                                        background: 'transparent',
                                                        border: 'none',
                                                        borderRadius: '4px',
                                                        padding: '6px',
                                                        cursor: 'pointer',
                                                        color: '#9b9a97',
                                                    }}
                                                >
                                                    <Pencil size={15} />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteTarget(t)}
                                                    style={{
                                                        background: 'transparent',
                                                        border: 'none',
                                                        borderRadius: '4px',
                                                        padding: '6px',
                                                        cursor: 'pointer',
                                                        color: '#9b9a97',
                                                    }}
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={filtered.length}
                        itemsPerPage={ITEMS_PER_PAGE}
                        onPageChange={setCurrentPage}
                    />
                </div>
            )}

            {/* Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={resetForm}
                title={editingTransaction ? 'Editar Lançamento' : 'Novo Lançamento'}
            >
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                        <label className="form-label">Tipo</label>
                        <select
                            className="form-input"
                            value={formData.type}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    type: e.target.value as TransactionType,
                                    category_id: '',
                                })
                            }
                        >
                            <option value="EXPENSE">Despesa</option>
                            <option value="INCOME">Receita</option>
                        </select>
                    </div>
                    <div>
                        <label className="form-label">Descrição</label>
                        <input
                            type="text"
                            className="form-input"
                            value={formData.description}
                            onChange={(e) =>
                                setFormData({ ...formData, description: e.target.value })
                            }
                            placeholder="Ex: Compra de cimento"
                            required
                        />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                        <div>
                            <label className="form-label">Valor Total (R$)</label>
                            <input
                                type="number"
                                step="0.01"
                                min="0.01"
                                className="form-input"
                                value={formData.amount}
                                onChange={(e) =>
                                    setFormData({ ...formData, amount: e.target.value })
                                }
                                placeholder="0,00"
                                required
                            />
                        </div>
                        <div>
                            <label className="form-label">Data</label>
                            <input
                                type="date"
                                className="form-input"
                                value={formData.date}
                                onChange={(e) =>
                                    setFormData({ ...formData, date: e.target.value })
                                }
                                required
                            />
                        </div>
                        <div>
                            <label className="form-label">Parcelas</label>
                            <input
                                type="number"
                                min="1"
                                max="120"
                                className="form-input"
                                value={formData.installments}
                                onChange={(e) =>
                                    setFormData({ ...formData, installments: e.target.value })
                                }
                                disabled={!!editingTransaction}
                            />
                        </div>
                    </div>
                    {parseInt(formData.installments) > 1 && (
                        <p style={{ fontSize: '12px', color: '#737373', marginTop: '-8px' }}>
                            {parseInt(formData.installments)} parcelas de{' '}
                            <strong>
                                {formatCurrency(
                                    parseFloat(formData.amount || '0') / parseInt(formData.installments)
                                )}
                            </strong>{' '}
                            — uma por mês a partir de {formData.date}
                        </p>
                    )}
                    <div>
                        <label className="form-label">Obra</label>
                        <select
                            className="form-input"
                            value={formData.project_id}
                            onChange={(e) =>
                                setFormData({ ...formData, project_id: e.target.value })
                            }
                            required
                        >
                            <option value="">Selecione uma obra</option>
                            {projects.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="form-label">Categoria</label>
                        <select
                            className="form-input"
                            value={formData.category_id}
                            onChange={(e) =>
                                setFormData({ ...formData, category_id: e.target.value })
                            }
                            required
                        >
                            <option value="">Selecione uma categoria</option>
                            {filteredCategories.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '4px' }}>
                        <button type="button" className="btn-secondary" onClick={resetForm}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Salvando...' : editingTransaction ? 'Salvar' : 'Criar'}
                        </button>
                    </div>
                </form>
            </Modal>

            <ConfirmDialog
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
                title="Excluir Lançamento"
                message={`Tem certeza que deseja excluir "${deleteTarget?.description}"? Essa ação não pode ser desfeita.`}
                loading={loading}
            />
        </div>
    );
}

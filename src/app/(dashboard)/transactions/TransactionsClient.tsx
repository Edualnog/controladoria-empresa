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
import PeriodSelector from '@/components/ui/PeriodSelector';
import { usePeriodSelector } from '@/hooks/usePeriodSelector';
import { useToast } from '@/components/ui/Toast';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

const ITEMS_PER_PAGE = 10;

interface TransactionsClientProps {
    initialTransactions: Transaction[];
    projects: Project[];
    categories: Category[];
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

    const period = usePeriodSelector();
    const { showToast } = useToast();

    // Filter transactions by period and type
    const filtered = useMemo(() => {
        setCurrentPage(1);
        let result = transactions.filter(
            (t) => t.date >= period.periodRange.startStr && t.date <= period.periodRange.endStr
        );
        if (filter !== 'ALL') {
            result = result.filter((t) => t.type === filter);
        }
        return result.sort((a, b) => b.date.localeCompare(a.date));
    }, [transactions, period.periodRange, filter]);

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
            const result = await updateTransaction(editingTransaction.id, payload);
            if (result.success) {
                setTransactions((prev) =>
                    prev.map((t) => (t.id === (result.data as unknown as Transaction).id ? (result.data as unknown as Transaction) : t))
                );
                showToast('Lançamento atualizado com sucesso!', 'success');
            } else {
                showToast(result.error, 'error');
            }
        } else {
            const result = await createTransaction(payload);
            if (result.success) {
                if (Array.isArray(result.data)) {
                    setTransactions((prev) => [...(result.data as unknown as Transaction[]), ...prev]);
                } else {
                    setTransactions((prev) => [(result.data as unknown as Transaction), ...prev]);
                }
                showToast('Lançamento criado com sucesso!', 'success');
            } else {
                showToast(result.error, 'error');
            }
        }

        setLoading(false);
        resetForm();
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setLoading(true);
        const result = await deleteTransaction(deleteTarget.id);
        if (result.success) {
            setTransactions((prev) => prev.filter((t) => t.id !== deleteTarget.id));
            showToast('Lançamento excluído com sucesso!', 'success');
        } else {
            showToast(result.error, 'error');
        }
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
            project_id: transaction.project_id || '',
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

            <PeriodSelector {...period} />

            {/* Period summary */}
            <div className="summary-cards" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: '16px' }}>
                <div className="summary-card summary-card--income">
                    <p className="summary-card__label summary-card__label--income">Entradas</p>
                    <p className="summary-card__value" style={{ color: '#16a34a' }}>
                        {formatCurrency(periodTotals.income)}
                    </p>
                </div>
                <div className="summary-card summary-card--expense">
                    <p className="summary-card__label summary-card__label--expense">Saídas</p>
                    <p className="summary-card__value" style={{ color: '#dc2626' }}>
                        {formatCurrency(periodTotals.expense)}
                    </p>
                </div>
                <div className="summary-card summary-card--balance">
                    <p className="summary-card__label summary-card__label--balance">Saldo do Período</p>
                    <p
                        className="summary-card__value"
                        style={{ color: periodTotals.balance >= 0 ? '#16a34a' : '#dc2626' }}
                    >
                        {formatCurrency(periodTotals.balance)}
                    </p>
                </div>
            </div>

            {/* Filter tabs */}
            <div className="filter-tabs">
                {tabs.map((tab) => (
                    <button
                        key={tab.value}
                        onClick={() => setFilter(tab.value)}
                        className={`filter-tab ${filter === tab.value ? 'active' : ''}`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {filtered.length === 0 ? (
                <div className="empty-state">
                    <p>Nenhum lançamento neste período</p>
                    <p className="text-muted-sm" style={{ marginTop: '4px' }}>
                        Use as setas para navegar entre períodos ou clique em &quot;Novo Lançamento&quot;
                    </p>
                </div>
            ) : (
                <div className="glass-card overflow-hidden">
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Data</th>
                                    <th>Descrição</th>
                                    <th>Obra</th>
                                    <th>Categoria</th>
                                    <th className="text-right">Valor</th>
                                    <th>Parcela</th>
                                    <th className="text-right" style={{ width: '80px' }}>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedItems.map((t) => (
                                    <tr key={t.id}>
                                        <td className="text-muted-sm text-nowrap">
                                            {formatDate(t.date)}
                                        </td>
                                        <td className="text-bold">{t.description}</td>
                                        <td className="text-muted">{t.project?.name || '—'}</td>
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
                                            className={`text-right text-bold text-nowrap ${t.type === 'INCOME' ? 'text-income' : 'text-expense'}`}
                                        >
                                            {t.type === 'INCOME' ? '+' : '-'}{formatCurrency(t.amount)}
                                        </td>
                                        <td className="text-muted-sm">
                                            {t.total_installments && t.total_installments > 1
                                                ? `${t.installment_number}/${t.total_installments}`
                                                : '—'}
                                        </td>
                                        <td>
                                            <div className="action-row">
                                                <button
                                                    onClick={() => openEdit(t)}
                                                    className="icon-btn"
                                                    title="Editar"
                                                    aria-label={`Editar ${t.description}`}
                                                >
                                                    <Pencil size={15} />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteTarget(t)}
                                                    className="icon-btn"
                                                    title="Excluir"
                                                    aria-label={`Excluir ${t.description}`}
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
                <form onSubmit={handleSubmit} className="form-modal">
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
                    <div className="form-row">
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
                        <p className="form-hint">
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
                        <label className="form-label">Obra (Opcional)</label>
                        <select
                            className="form-input"
                            value={formData.project_id}
                            onChange={(e) =>
                                setFormData({ ...formData, project_id: e.target.value })
                            }
                        >
                            <option value="">Sem obra (opcional)</option>
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
                    <div className="form-actions">
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

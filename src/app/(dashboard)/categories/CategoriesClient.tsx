'use client';

import { useState, useMemo } from 'react';
import { createCategory, updateCategory, deleteCategory } from '@/app/actions';
import type { Category, TransactionType } from '@/types';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Pagination from '@/components/ui/Pagination';
import { useToast } from '@/components/ui/Toast';
import { Plus, Pencil, Trash2 } from 'lucide-react';

const ITEMS_PER_PAGE = 10;

interface CategoriesClientProps {
    initialCategories: Category[];
}

export default function CategoriesClient({ initialCategories }: CategoriesClientProps) {
    const [categories, setCategories] = useState(initialCategories);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
    const [formData, setFormData] = useState({ name: '', type: 'INCOME' as TransactionType });
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState<'ALL' | TransactionType>('ALL');
    const [currentPage, setCurrentPage] = useState(1);
    const { showToast } = useToast();

    const filtered = useMemo(() => {
        setCurrentPage(1);
        return filter === 'ALL'
            ? categories
            : categories.filter((c) => c.type === filter);
    }, [categories, filter]);

    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const paginatedItems = filtered.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const resetForm = () => {
        setFormData({ name: '', type: 'INCOME' });
        setEditingCategory(null);
        setIsModalOpen(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (editingCategory) {
            const result = await updateCategory(editingCategory.id, formData);
            if (result.success) {
                setCategories((prev) =>
                    prev.map((c) => (c.id === (result.data as unknown as Category).id ? (result.data as unknown as Category) : c))
                );
                showToast('Categoria atualizada com sucesso!', 'success');
            } else {
                showToast(result.error, 'error');
            }
        } else {
            const result = await createCategory(formData);
            if (result.success) {
                setCategories((prev) => [...prev, result.data as unknown as Category]);
                showToast('Categoria criada com sucesso!', 'success');
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
        const result = await deleteCategory(deleteTarget.id);
        if (result.success) {
            setCategories((prev) => prev.filter((c) => c.id !== deleteTarget.id));
            showToast('Categoria excluída com sucesso!', 'success');
        } else {
            showToast(result.error, 'error');
        }
        setLoading(false);
        setDeleteTarget(null);
    };

    const openEdit = (category: Category) => {
        setEditingCategory(category);
        setFormData({ name: category.name, type: category.type });
        setIsModalOpen(true);
    };

    const tabs: { label: string; value: 'ALL' | TransactionType }[] = [
        { label: 'Todas', value: 'ALL' },
        { label: 'Receitas', value: 'INCOME' },
        { label: 'Despesas', value: 'EXPENSE' },
    ];

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Categorias</h1>
                <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
                    <Plus size={16} />
                    Nova Categoria
                </button>
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
                    <p>Nenhuma categoria encontrada</p>
                </div>
            ) : (
                <div className="glass-card overflow-hidden">
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Nome</th>
                                    <th>Tipo</th>
                                    <th className="text-right" style={{ width: '100px' }}>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedItems.map((category) => (
                                    <tr key={category.id}>
                                        <td className="text-bold">{category.name}</td>
                                        <td>
                                            <span className={category.type === 'INCOME' ? 'badge badge-income' : 'badge badge-expense'}>
                                                {category.type === 'INCOME' ? 'Receita' : 'Despesa'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-row">
                                                <button
                                                    onClick={() => openEdit(category)}
                                                    className="icon-btn"
                                                    title="Editar"
                                                    aria-label={`Editar ${category.name}`}
                                                >
                                                    <Pencil size={15} />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteTarget(category)}
                                                    className="icon-btn"
                                                    title="Excluir"
                                                    aria-label={`Excluir ${category.name}`}
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

            <Modal
                isOpen={isModalOpen}
                onClose={resetForm}
                title={editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
            >
                <form onSubmit={handleSubmit} className="form-modal">
                    <div>
                        <label className="form-label">Nome</label>
                        <input
                            type="text"
                            className="form-input"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Ex: Material de Construção"
                            required
                        />
                    </div>
                    <div>
                        <label className="form-label">Tipo</label>
                        <select
                            className="form-input"
                            value={formData.type}
                            onChange={(e) =>
                                setFormData({ ...formData, type: e.target.value as TransactionType })
                            }
                        >
                            <option value="INCOME">Receita</option>
                            <option value="EXPENSE">Despesa</option>
                        </select>
                    </div>
                    <div className="form-actions">
                        <button type="button" className="btn-secondary" onClick={resetForm}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Salvando...' : editingCategory ? 'Salvar' : 'Criar'}
                        </button>
                    </div>
                </form>
            </Modal>

            <ConfirmDialog
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
                title="Excluir Categoria"
                message={`Tem certeza que deseja excluir "${deleteTarget?.name}"? Essa ação não pode ser desfeita.`}
                loading={loading}
            />
        </div>
    );
}

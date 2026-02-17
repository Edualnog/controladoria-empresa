'use client';

import { useState } from 'react';
import { createCategory, updateCategory, deleteCategory } from '@/app/actions';
import type { Category, TransactionType } from '@/types';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { Plus, Pencil, Trash2 } from 'lucide-react';

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

    const filtered =
        filter === 'ALL'
            ? categories
            : categories.filter((c) => c.type === filter);

    const resetForm = () => {
        setFormData({ name: '', type: 'INCOME' });
        setEditingCategory(null);
        setIsModalOpen(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (editingCategory) {
            const updated = await updateCategory(editingCategory.id, formData);
            if (updated) {
                setCategories((prev) =>
                    prev.map((c) => (c.id === updated.id ? updated : c))
                );
            }
        } else {
            const created = await createCategory(formData);
            if (created) {
                setCategories((prev) => [...prev, created]);
            }
        }

        setLoading(false);
        resetForm();
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setLoading(true);
        await deleteCategory(deleteTarget.id);
        setCategories((prev) => prev.filter((c) => c.id !== deleteTarget.id));
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
                    <p style={{ fontSize: '14px' }}>Nenhuma categoria encontrada</p>
                </div>
            ) : (
                <div className="glass-card" style={{ overflow: 'hidden' }}>
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Nome</th>
                                    <th>Tipo</th>
                                    <th style={{ width: '100px', textAlign: 'right' }}>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((category) => (
                                    <tr key={category.id}>
                                        <td style={{ fontWeight: 500 }}>{category.name}</td>
                                        <td>
                                            <span className={category.type === 'INCOME' ? 'badge badge-income' : 'badge badge-expense'}>
                                                {category.type === 'INCOME' ? 'Receita' : 'Despesa'}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                                                <button
                                                    onClick={() => openEdit(category)}
                                                    style={{
                                                        background: 'transparent',
                                                        border: 'none',
                                                        borderRadius: '4px',
                                                        padding: '6px',
                                                        cursor: 'pointer',
                                                        color: '#9b9a97',
                                                    }}
                                                    title="Editar"
                                                >
                                                    <Pencil size={15} />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteTarget(category)}
                                                    style={{
                                                        background: 'transparent',
                                                        border: 'none',
                                                        borderRadius: '4px',
                                                        padding: '6px',
                                                        cursor: 'pointer',
                                                        color: '#9b9a97',
                                                    }}
                                                    title="Excluir"
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
                </div>
            )}

            {/* Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={resetForm}
                title={editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
            >
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '4px' }}>
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

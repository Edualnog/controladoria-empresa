'use client';

import { useState } from 'react';
import { createProject, updateProject, deleteProject } from '@/app/actions';
import type { Project } from '@/types';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Pagination from '@/components/ui/Pagination';
import { Plus, Pencil, Trash2 } from 'lucide-react';

const ITEMS_PER_PAGE = 10;

interface ProjectsClientProps {
    initialProjects: Project[];
}

export default function ProjectsClient({ initialProjects }: ProjectsClientProps) {
    const [projects, setProjects] = useState(initialProjects);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
    const [formData, setFormData] = useState({ name: '', description: '' });
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.ceil(projects.length / ITEMS_PER_PAGE);
    const paginatedItems = projects.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const resetForm = () => {
        setFormData({ name: '', description: '' });
        setEditingProject(null);
        setIsModalOpen(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (editingProject) {
            const updated = await updateProject(editingProject.id, formData);
            if (updated) {
                setProjects((prev) =>
                    prev.map((p) => (p.id === updated.id ? updated : p))
                );
            }
        } else {
            const created = await createProject(formData);
            if (created) {
                setProjects((prev) => [...prev, created]);
            }
        }

        setLoading(false);
        resetForm();
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setLoading(true);
        await deleteProject(deleteTarget.id);
        setProjects((prev) => prev.filter((p) => p.id !== deleteTarget.id));
        setLoading(false);
        setDeleteTarget(null);
    };

    const openEdit = (project: Project) => {
        setEditingProject(project);
        setFormData({ name: project.name, description: project.description || '' });
        setIsModalOpen(true);
    };

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Obras</h1>
                <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
                    <Plus size={16} />
                    Nova Obra
                </button>
            </div>

            {projects.length === 0 ? (
                <div className="empty-state">
                    <p style={{ fontSize: '14px' }}>Nenhuma obra cadastrada</p>
                    <p style={{ fontSize: '13px', marginTop: '4px' }}>
                        Clique em &quot;Nova Obra&quot; para começar
                    </p>
                </div>
            ) : (
                <div className="glass-card" style={{ overflow: 'hidden' }}>
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Nome</th>
                                    <th>Descrição</th>
                                    <th style={{ width: '100px', textAlign: 'right' }}>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedItems.map((project) => (
                                    <tr key={project.id}>
                                        <td style={{ fontWeight: 500 }}>{project.name}</td>
                                        <td style={{ color: '#9b9a97' }}>
                                            {project.description || '—'}
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                                                <button
                                                    onClick={() => openEdit(project)}
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
                                                    onClick={() => setDeleteTarget(project)}
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
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={projects.length}
                        itemsPerPage={ITEMS_PER_PAGE}
                        onPageChange={setCurrentPage}
                    />
                </div>
            )}

            {/* Modal Create/Edit */}
            <Modal
                isOpen={isModalOpen}
                onClose={resetForm}
                title={editingProject ? 'Editar Obra' : 'Nova Obra'}
            >
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                        <label className="form-label">Nome</label>
                        <input
                            type="text"
                            className="form-input"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Ex: Residencial Park"
                            required
                        />
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
                            placeholder="Descrição opcional"
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '4px' }}>
                        <button type="button" className="btn-secondary" onClick={resetForm}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Salvando...' : editingProject ? 'Salvar' : 'Criar'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Confirm Delete */}
            <ConfirmDialog
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
                title="Excluir Obra"
                message={`Tem certeza que deseja excluir "${deleteTarget?.name}"? Essa ação não pode ser desfeita.`}
                loading={loading}
            />
        </div>
    );
}

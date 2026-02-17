'use client';

import { useState } from 'react';
import { createProject, updateProject, deleteProject } from '@/app/actions';
import type { Project } from '@/types';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Pagination from '@/components/ui/Pagination';
import { useToast } from '@/components/ui/Toast';
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
    const { showToast } = useToast();

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
            const result = await updateProject(editingProject.id, formData);
            if (result.success) {
                setProjects((prev) =>
                    prev.map((p) => (p.id === (result.data as unknown as Project).id ? (result.data as unknown as Project) : p))
                );
                showToast('Obra atualizada com sucesso!', 'success');
            } else {
                showToast(result.error, 'error');
            }
        } else {
            const result = await createProject(formData);
            if (result.success) {
                setProjects((prev) => [...prev, result.data as unknown as Project]);
                showToast('Obra criada com sucesso!', 'success');
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
        const result = await deleteProject(deleteTarget.id);
        if (result.success) {
            setProjects((prev) => prev.filter((p) => p.id !== deleteTarget.id));
            showToast('Obra excluída com sucesso!', 'success');
        } else {
            showToast(result.error, 'error');
        }
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
                    <p>Nenhuma obra cadastrada</p>
                    <p className="text-muted-sm">Clique em &quot;Nova Obra&quot; para começar</p>
                </div>
            ) : (
                <div className="glass-card overflow-hidden">
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Nome</th>
                                    <th>Descrição</th>
                                    <th className="text-right" style={{ width: '100px' }}>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedItems.map((project) => (
                                    <tr key={project.id}>
                                        <td className="text-bold">{project.name}</td>
                                        <td className="text-muted">
                                            {project.description || '—'}
                                        </td>
                                        <td>
                                            <div className="action-row">
                                                <button
                                                    onClick={() => openEdit(project)}
                                                    className="icon-btn"
                                                    title="Editar"
                                                    aria-label={`Editar ${project.name}`}
                                                >
                                                    <Pencil size={15} />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteTarget(project)}
                                                    className="icon-btn"
                                                    title="Excluir"
                                                    aria-label={`Excluir ${project.name}`}
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

            <Modal
                isOpen={isModalOpen}
                onClose={resetForm}
                title={editingProject ? 'Editar Obra' : 'Nova Obra'}
            >
                <form onSubmit={handleSubmit} className="form-modal">
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
                    <div className="form-actions">
                        <button type="button" className="btn-secondary" onClick={resetForm}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Salvando...' : editingProject ? 'Salvar' : 'Criar'}
                        </button>
                    </div>
                </form>
            </Modal>

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

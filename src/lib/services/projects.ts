import { createClient } from '@/lib/supabase/server';
import type { Project, ProjectFormData } from '@/types';

export async function getProjects(): Promise<Project[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
}

export async function getProject(id: string): Promise<Project | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();

    if (error) throw error;
    return data;
}

export async function createProject(formData: ProjectFormData & { company_id: string }) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('projects')
        .insert({
            name: formData.name,
            description: formData.description || null,
            start_date: formData.start_date || null,
            end_date: formData.end_date || null,
            company_id: formData.company_id,
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function updateProject(id: string, formData: ProjectFormData) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('projects')
        .update({
            name: formData.name,
            description: formData.description || null,
            start_date: formData.start_date || null,
            end_date: formData.end_date || null,
        })
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function deleteProject(id: string) {
    const supabase = await createClient();
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) throw error;
}

import { createClient } from '@/lib/supabase/server';
import type { Category, CategoryFormData } from '@/types';

export async function getCategories(): Promise<Category[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

    if (error) throw error;
    return data || [];
}

export async function getCategoriesByType(type: 'INCOME' | 'EXPENSE'): Promise<Category[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('type', type)
        .order('name');

    if (error) throw error;
    return data || [];
}

export async function createCategory(formData: CategoryFormData & { company_id: string }) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('categories')
        .insert({
            name: formData.name,
            type: formData.type,
            company_id: formData.company_id,
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function updateCategory(id: string, formData: CategoryFormData) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('categories')
        .update({
            name: formData.name,
            type: formData.type,
        })
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function deleteCategory(id: string) {
    const supabase = await createClient();
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) throw error;
}

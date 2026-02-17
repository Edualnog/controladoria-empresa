import { createClient } from '@/lib/supabase/server';
import type { Transaction, TransactionFormData } from '@/types';

export async function getTransactions(): Promise<Transaction[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('transactions')
        .select('*, project:projects(id, name), category:categories(id, name, type)')
        .order('date', { ascending: false });

    if (error) throw error;
    return data || [];
}

export async function createTransaction(
    formData: TransactionFormData & { company_id: string }
) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('transactions')
        .insert({
            description: formData.description,
            amount: formData.amount,
            date: formData.date,
            type: formData.type,
            project_id: formData.project_id,
            category_id: formData.category_id,
            company_id: formData.company_id,
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function updateTransaction(
    id: string,
    formData: TransactionFormData
) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('transactions')
        .update({
            description: formData.description,
            amount: formData.amount,
            date: formData.date,
            type: formData.type,
            project_id: formData.project_id,
            category_id: formData.category_id,
        })
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function deleteTransaction(id: string) {
    const supabase = await createClient();
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (error) throw error;
}

'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getUserCompanyId } from '@/lib/services/auth';

// ===== PROJECTS =====

export async function createProject(data: { name: string; description?: string }) {
    const supabase = await createClient();
    const companyId = await getUserCompanyId();
    if (!companyId) {
        console.error('[createProject] Falha ao obter company_id');
        return null;
    }

    const { data: project, error } = await supabase
        .from('projects')
        .insert({
            name: data.name,
            description: data.description || null,
            company_id: companyId,
        })
        .select()
        .single();

    if (error) {
        console.error('[createProject] Supabase error:', error.message);
        return null;
    }
    revalidatePath('/projects');
    return project;
}

export async function updateProject(id: string, data: { name: string; description?: string }) {
    const supabase = await createClient();

    const { data: project, error } = await supabase
        .from('projects')
        .update({
            name: data.name,
            description: data.description || null,
        })
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('[updateProject] Supabase error:', error.message);
        return null;
    }
    revalidatePath('/projects');
    return project;
}

export async function deleteProject(id: string) {
    const supabase = await createClient();
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) {
        console.error('[deleteProject] Supabase error:', error.message);
        return false;
    }
    revalidatePath('/projects');
    return true;
}

// ===== CATEGORIES =====

export async function createCategory(data: { name: string; type: string }) {
    const supabase = await createClient();
    const companyId = await getUserCompanyId();
    console.log('[createCategory] companyId:', companyId, 'data:', data);

    if (!companyId) {
        console.error('[createCategory] Falha ao obter company_id');
        return null;
    }

    const { data: category, error } = await supabase
        .from('categories')
        .insert({
            name: data.name,
            type: data.type,
            company_id: companyId,
        })
        .select()
        .single();

    if (error) {
        console.error('[createCategory] Supabase error:', error.message);
        return null;
    }

    console.log('[createCategory] Criada com sucesso:', category);
    revalidatePath('/categories');
    return category;
}

export async function updateCategory(id: string, data: { name: string; type: string }) {
    const supabase = await createClient();

    const { data: category, error } = await supabase
        .from('categories')
        .update({
            name: data.name,
            type: data.type,
        })
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('[updateCategory] Supabase error:', error.message);
        return null;
    }
    revalidatePath('/categories');
    return category;
}

export async function deleteCategory(id: string) {
    const supabase = await createClient();
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) {
        console.error('[deleteCategory] Supabase error:', error.message);
        return false;
    }
    revalidatePath('/categories');
    return true;
}

// ===== TRANSACTIONS =====

export async function createTransaction(data: {
    description: string;
    amount: number;
    date: string;
    type: string;
    project_id?: string | null;
    category_id: string;
    installments?: number;
}) {
    const supabase = await createClient();
    const companyId = await getUserCompanyId();
    if (!companyId) {
        console.error('[createTransaction] Falha ao obter company_id');
        return null;
    }

    const numInstallments = data.installments && data.installments > 1 ? data.installments : 1;

    if (numInstallments > 1) {
        const groupId = crypto.randomUUID();
        const installmentAmount = Math.round((data.amount / numInstallments) * 100) / 100;
        const startDate = new Date(data.date);

        const rows = [];
        for (let i = 0; i < numInstallments; i++) {
            const installmentDate = new Date(startDate);
            installmentDate.setMonth(installmentDate.getMonth() + i);

            rows.push({
                description: `${data.description} (${i + 1}/${numInstallments})`,
                amount: installmentAmount,
                date: installmentDate.toISOString().split('T')[0],
                type: data.type,
                project_id: data.project_id || null,
                category_id: data.category_id,
                company_id: companyId,
                installment_group_id: groupId,
                installment_number: i + 1,
                total_installments: numInstallments,
            });
        }

        const { data: transactions, error } = await supabase
            .from('transactions')
            .insert(rows)
            .select('*, project:projects(*), category:categories(*)')
            .order('date', { ascending: true });

        if (error) {
            console.error('[createTransaction] Supabase error (installments):', error.message);
            return null;
        }
        revalidatePath('/transactions');
        revalidatePath('/');
        return transactions;
    } else {
        const { data: transaction, error } = await supabase
            .from('transactions')
            .insert({
                description: data.description,
                amount: data.amount,
                date: data.date,
                type: data.type,
                project_id: data.project_id || null,
                category_id: data.category_id,
                company_id: companyId,
            })
            .select('*, project:projects(*), category:categories(*)')
            .single();

        if (error) {
            console.error('[createTransaction] Supabase error:', error.message);
            return null;
        }
        revalidatePath('/transactions');
        revalidatePath('/');
        return transaction;
    }
}

export async function updateTransaction(id: string, data: {
    description: string;
    amount: number;
    date: string;
    type: string;
    project_id?: string | null;
    category_id: string;
}) {
    const supabase = await createClient();

    const { data: transaction, error } = await supabase
        .from('transactions')
        .update({
            description: data.description,
            amount: data.amount,
            date: data.date,
            type: data.type,
            project_id: data.project_id || null,
            category_id: data.category_id,
        })
        .eq('id', id)
        .select('*, project:projects(*), category:categories(*)')
        .single();

    if (error) {
        console.error('[updateTransaction] Supabase error:', error.message);
        return null;
    }
    revalidatePath('/transactions');
    revalidatePath('/');
    return transaction;
}

export async function deleteTransaction(id: string) {
    const supabase = await createClient();
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (error) {
        console.error('[deleteTransaction] Supabase error:', error.message);
        return false;
    }
    revalidatePath('/transactions');
    revalidatePath('/');
    return true;
}

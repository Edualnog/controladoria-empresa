'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getUserCompanyId } from '@/lib/services/auth';
import type { ActionResult } from '@/types';
import {
    ProjectSchema,
    CategorySchema,
    TransactionSchema,
    TransactionUpdateSchema,
    formatZodErrors,
} from '@/lib/validations';

// ===== PROJECTS =====

export async function createProject(data: { name: string; description?: string }): Promise<ActionResult<Record<string, unknown>>> {
    const parsed = ProjectSchema.safeParse(data);
    if (!parsed.success) {
        return { success: false, error: formatZodErrors(parsed.error) };
    }

    const supabase = await createClient();
    const companyId = await getUserCompanyId();
    if (!companyId) {
        return { success: false, error: 'Falha ao identificar sua empresa. Faça login novamente.' };
    }

    const { data: project, error } = await supabase
        .from('projects')
        .insert({
            name: parsed.data.name,
            description: parsed.data.description || null,
            company_id: companyId,
        })
        .select()
        .single();

    if (error) {
        console.error('[createProject] Supabase error:', error.message);
        return { success: false, error: 'Erro ao criar obra. Tente novamente.' };
    }
    revalidatePath('/projects');
    return { success: true, data: project };
}

export async function updateProject(id: string, data: { name: string; description?: string }): Promise<ActionResult<Record<string, unknown>>> {
    const parsed = ProjectSchema.safeParse(data);
    if (!parsed.success) {
        return { success: false, error: formatZodErrors(parsed.error) };
    }

    const supabase = await createClient();

    const { data: project, error } = await supabase
        .from('projects')
        .update({
            name: parsed.data.name,
            description: parsed.data.description || null,
        })
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('[updateProject] Supabase error:', error.message);
        return { success: false, error: 'Erro ao atualizar obra. Tente novamente.' };
    }
    revalidatePath('/projects');
    return { success: true, data: project };
}

export async function deleteProject(id: string): Promise<ActionResult<boolean>> {
    const supabase = await createClient();
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) {
        console.error('[deleteProject] Supabase error:', error.message);
        if (error.message.includes('foreign key') || error.code === '23503') {
            return { success: false, error: 'Não é possível excluir: existem lançamentos vinculados a esta obra.' };
        }
        return { success: false, error: 'Erro ao excluir obra. Tente novamente.' };
    }
    revalidatePath('/projects');
    return { success: true, data: true };
}

// ===== CATEGORIES =====

export async function createCategory(data: { name: string; type: string }): Promise<ActionResult<Record<string, unknown>>> {
    const parsed = CategorySchema.safeParse(data);
    if (!parsed.success) {
        return { success: false, error: formatZodErrors(parsed.error) };
    }

    const supabase = await createClient();
    const companyId = await getUserCompanyId();

    if (!companyId) {
        return { success: false, error: 'Falha ao identificar sua empresa. Faça login novamente.' };
    }

    const { data: category, error } = await supabase
        .from('categories')
        .insert({
            name: parsed.data.name,
            type: parsed.data.type,
            company_id: companyId,
        })
        .select()
        .single();

    if (error) {
        console.error('[createCategory] Supabase error:', error.message);
        return { success: false, error: 'Erro ao criar categoria. Tente novamente.' };
    }

    revalidatePath('/categories');
    return { success: true, data: category };
}

export async function updateCategory(id: string, data: { name: string; type: string }): Promise<ActionResult<Record<string, unknown>>> {
    const parsed = CategorySchema.safeParse(data);
    if (!parsed.success) {
        return { success: false, error: formatZodErrors(parsed.error) };
    }

    const supabase = await createClient();

    const { data: category, error } = await supabase
        .from('categories')
        .update({
            name: parsed.data.name,
            type: parsed.data.type,
        })
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('[updateCategory] Supabase error:', error.message);
        return { success: false, error: 'Erro ao atualizar categoria. Tente novamente.' };
    }
    revalidatePath('/categories');
    return { success: true, data: category };
}

export async function deleteCategory(id: string): Promise<ActionResult<boolean>> {
    const supabase = await createClient();
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) {
        console.error('[deleteCategory] Supabase error:', error.message);
        if (error.message.includes('foreign key') || error.code === '23503') {
            return { success: false, error: 'Não é possível excluir: existem lançamentos vinculados a esta categoria.' };
        }
        return { success: false, error: 'Erro ao excluir categoria. Tente novamente.' };
    }
    revalidatePath('/categories');
    return { success: true, data: true };
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
}): Promise<ActionResult<Record<string, unknown> | Record<string, unknown>[]>> {
    const parsed = TransactionSchema.safeParse(data);
    if (!parsed.success) {
        return { success: false, error: formatZodErrors(parsed.error) };
    }

    const supabase = await createClient();
    const companyId = await getUserCompanyId();
    if (!companyId) {
        return { success: false, error: 'Falha ao identificar sua empresa. Faça login novamente.' };
    }

    const numInstallments = parsed.data.installments && parsed.data.installments > 1 ? parsed.data.installments : 1;

    if (numInstallments > 1) {
        const groupId = crypto.randomUUID();
        const installmentAmount = Math.round((parsed.data.amount / numInstallments) * 100) / 100;
        const startDate = new Date(parsed.data.date);

        const rows = [];
        for (let i = 0; i < numInstallments; i++) {
            const installmentDate = new Date(startDate);
            installmentDate.setMonth(installmentDate.getMonth() + i);

            rows.push({
                description: `${parsed.data.description} (${i + 1}/${numInstallments})`,
                amount: installmentAmount,
                date: installmentDate.toISOString().split('T')[0],
                type: parsed.data.type,
                project_id: parsed.data.project_id || null,
                category_id: parsed.data.category_id,
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
            return { success: false, error: 'Erro ao criar parcelas. Tente novamente.' };
        }
        revalidatePath('/transactions');
        revalidatePath('/');
        return { success: true, data: transactions };
    } else {
        const { data: transaction, error } = await supabase
            .from('transactions')
            .insert({
                description: parsed.data.description,
                amount: parsed.data.amount,
                date: parsed.data.date,
                type: parsed.data.type,
                project_id: parsed.data.project_id || null,
                category_id: parsed.data.category_id,
                company_id: companyId,
            })
            .select('*, project:projects(*), category:categories(*)')
            .single();

        if (error) {
            console.error('[createTransaction] Supabase error:', error.message);
            return { success: false, error: 'Erro ao criar lançamento. Tente novamente.' };
        }
        revalidatePath('/transactions');
        revalidatePath('/');
        return { success: true, data: transaction };
    }
}

export async function updateTransaction(id: string, data: {
    description: string;
    amount: number;
    date: string;
    type: string;
    project_id?: string | null;
    category_id: string;
}): Promise<ActionResult<Record<string, unknown>>> {
    const parsed = TransactionUpdateSchema.safeParse(data);
    if (!parsed.success) {
        return { success: false, error: formatZodErrors(parsed.error) };
    }

    const supabase = await createClient();

    const { data: transaction, error } = await supabase
        .from('transactions')
        .update({
            description: parsed.data.description,
            amount: parsed.data.amount,
            date: parsed.data.date,
            type: parsed.data.type,
            project_id: parsed.data.project_id || null,
            category_id: parsed.data.category_id,
        })
        .eq('id', id)
        .select('*, project:projects(*), category:categories(*)')
        .single();

    if (error) {
        console.error('[updateTransaction] Supabase error:', error.message);
        return { success: false, error: 'Erro ao atualizar lançamento. Tente novamente.' };
    }
    revalidatePath('/transactions');
    revalidatePath('/');
    return { success: true, data: transaction };
}

export async function deleteTransaction(id: string): Promise<ActionResult<boolean>> {
    const supabase = await createClient();
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (error) {
        console.error('[deleteTransaction] Supabase error:', error.message);
        return { success: false, error: 'Erro ao excluir lançamento. Tente novamente.' };
    }
    revalidatePath('/transactions');
    revalidatePath('/');
    return { success: true, data: true };
}

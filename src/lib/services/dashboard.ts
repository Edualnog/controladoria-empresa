import { createClient } from '@/lib/supabase/server';
import type { Transaction } from '@/types';

export async function getAllTransactions(): Promise<Transaction[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('transactions')
        .select('*, project:projects(*), category:categories(*)')
        .order('date', { ascending: true });

    if (error || !data) return [];
    return data as Transaction[];
}

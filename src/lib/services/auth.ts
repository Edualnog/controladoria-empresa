import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import type { User } from '@/types';

export async function getCurrentUser(): Promise<User | null> {
    const supabase = await createClient();

    const {
        data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) return null;

    // Try to get existing user record
    const { data } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

    if (data) return data;

    // User record doesn't exist — auto-create using admin client (bypasses RLS)
    console.log('[auth] User record missing for', authUser.id, '- creating with admin client...');

    try {
        const admin = createAdminClient();

        const metadata = authUser.user_metadata || {};
        const userName = metadata.name || authUser.email?.split('@')[0] || 'Usuário';
        const companyName = metadata.company_name || `Empresa de ${userName}`;

        // Create company
        const { data: company, error: companyError } = await admin
            .from('companies')
            .insert({ name: companyName })
            .select()
            .single();

        if (companyError || !company) {
            console.error('[auth] Failed to create company:', companyError?.message);
            return null;
        }

        // Create user
        const { data: newUser, error: userError } = await admin
            .from('users')
            .insert({
                id: authUser.id,
                email: authUser.email || '',
                name: userName,
                company_id: company.id,
            })
            .select()
            .single();

        if (userError || !newUser) {
            console.error('[auth] Failed to create user:', userError?.message);
            return null;
        }

        console.log('[auth] User and company created successfully');
        return newUser;
    } catch (e) {
        console.error('[auth] Admin client error:', e);
        return null;
    }
}

export async function getUserCompanyId(): Promise<string | null> {
    const user = await getCurrentUser();
    return user?.company_id || null;
}

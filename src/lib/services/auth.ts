import { createClient } from '@/lib/supabase/server';
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

    // User record doesn't exist — auto-create using regular client
    // RLS policies allow: "Users can insert their own record" (id = auth.uid())
    // and "Authenticated users can create companies" (auth.uid() IS NOT NULL)
    console.log('[auth] User record missing for', authUser.id, '- auto-provisioning...');

    try {
        const metadata = authUser.user_metadata || {};
        const userName = metadata.name || authUser.email?.split('@')[0] || 'Usuário';
        const companyName = metadata.company_name || `Empresa de ${userName}`;

        // Create company (RLS: any authenticated user can insert)
        const { data: company, error: companyError } = await supabase
            .from('companies')
            .insert({ name: companyName })
            .select()
            .single();

        if (companyError || !company) {
            console.error('[auth] Failed to create company:', companyError?.message);
            return null;
        }

        // Create user record (RLS: id = auth.uid())
        const { data: newUser, error: userError } = await supabase
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
        console.error('[auth] Auto-provisioning error:', e);
        return null;
    }
}

export async function getUserCompanyId(): Promise<string | null> {
    try {
        // Fast path: use the SECURITY DEFINER SQL function directly via RPC
        // This works even without SUPABASE_SERVICE_ROLE_KEY
        const supabase = await createClient();
        const { data, error } = await supabase.rpc('get_user_company_id');

        if (!error && data) {
            return data as string;
        }

        // If RPC returned no data, the user record might not exist yet
        // Fall back to getCurrentUser which can auto-provision
        console.warn('[auth] RPC get_user_company_id returned no data, trying getCurrentUser fallback...');
        const user = await getCurrentUser();
        return user?.company_id || null;
    } catch (e) {
        console.error('[auth] getUserCompanyId error:', e);
        // Last resort fallback
        const user = await getCurrentUser();
        return user?.company_id || null;
    }
}

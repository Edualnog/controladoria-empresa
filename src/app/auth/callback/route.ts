import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    const next = searchParams.get('next') ?? '/';

    if (code) {
        const supabase = await createClient();
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error) {
            // Check if user record exists in our users table
            const { data: { user: authUser } } = await supabase.auth.getUser();

            if (authUser) {
                const { data: existingUser } = await supabase
                    .from('users')
                    .select('id')
                    .eq('id', authUser.id)
                    .maybeSingle();

                if (!existingUser) {
                    // User record doesn't exist — create company and user
                    const metadata = authUser.user_metadata || {};
                    const userName = metadata.name || authUser.email?.split('@')[0] || 'Usuário';
                    const companyName = metadata.company_name || `Empresa de ${userName}`;

                    console.log('[auth/callback] Creating company and user for:', authUser.id);

                    const { data: company } = await supabase
                        .from('companies')
                        .insert({ name: companyName })
                        .select()
                        .single();

                    if (company) {
                        const { error: userError } = await supabase
                            .from('users')
                            .insert({
                                id: authUser.id,
                                email: authUser.email || '',
                                name: userName,
                                company_id: company.id,
                            });

                        if (userError) {
                            console.error('[auth/callback] Failed to create user:', userError.message);
                        } else {
                            console.log('[auth/callback] User and company created successfully');
                        }
                    }
                }
            }

            return NextResponse.redirect(`${origin}${next}`);
        }
    }

    return NextResponse.redirect(`${origin}/login`);
}

'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Eye, EyeOff } from 'lucide-react';

export default function RegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const supabase = createClient();

        // 1. Sign up the user
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    name,
                    company_name: companyName,
                },
            },
        });

        if (authError) {
            setError(authError.message);
            setLoading(false);
            return;
        }

        if (!authData.user) {
            setError('Erro ao criar usuário.');
            setLoading(false);
            return;
        }

        // Check if user is immediately confirmed (no email confirmation required)
        if (authData.session) {
            // User is confirmed, create company and user record
            const { data: companyData, error: companyError } = await supabase
                .from('companies')
                .insert({ name: companyName })
                .select()
                .single();

            if (companyError) {
                setError('Erro ao criar empresa: ' + companyError.message);
                setLoading(false);
                return;
            }

            const { error: userError } = await supabase.from('users').insert({
                id: authData.user.id,
                email,
                name,
                company_id: companyData.id,
            });

            if (userError) {
                setError('Erro ao criar perfil: ' + userError.message);
                setLoading(false);
                return;
            }

            router.push('/');
            router.refresh();
        } else {
            // Email confirmation required — save pending data in localStorage
            localStorage.setItem(
                'pending_registration',
                JSON.stringify({ name, email, companyName })
            );
            setSuccess(true);
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div
                style={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '24px',
                    background: '#ffffff',
                }}
            >
                <div style={{ width: '100%', maxWidth: '360px', textAlign: 'center' }}>
                    <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#37352f', marginBottom: '12px' }}>
                        Verifique seu email
                    </h1>
                    <p style={{ color: '#737373', fontSize: '14px', lineHeight: 1.6 }}>
                        Enviamos um link de confirmação para <strong>{email}</strong>.
                        Clique no link para ativar sua conta.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div
            style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '24px',
                background: '#ffffff',
            }}
        >
            <div style={{ width: '100%', maxWidth: '360px' }}>
                <div style={{ marginBottom: '32px' }}>
                    <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#37352f', letterSpacing: '-0.5px' }}>
                        Criar conta
                    </h1>
                    <p style={{ color: '#9b9a97', fontSize: '14px', marginTop: '6px' }}>
                        Cadastre sua empresa para começar
                    </p>
                </div>

                <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                        <label className="form-label">Nome da Empresa</label>
                        <input
                            type="text"
                            className="form-input"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            placeholder="Ex: Construtora ABC"
                            required
                        />
                    </div>

                    <div>
                        <label className="form-label">Seu Nome</label>
                        <input
                            type="text"
                            className="form-input"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Nome completo"
                            required
                        />
                    </div>

                    <div>
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            className="form-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="seu@email.com"
                            required
                        />
                    </div>

                    <div>
                        <label className="form-label">Senha</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                className="form-input"
                                style={{ paddingRight: '40px' }}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Mínimo 6 caracteres"
                                minLength={6}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '10px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: '#9b9a97',
                                    padding: '4px',
                                    display: 'flex',
                                    alignItems: 'center',
                                }}
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div
                            style={{
                                background: '#fef2f2',
                                border: '1px solid #fecaca',
                                borderRadius: '6px',
                                padding: '10px 12px',
                                color: '#b91c1c',
                                fontSize: '13px',
                            }}
                        >
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn-primary"
                        style={{ width: '100%', justifyContent: 'center', height: '36px', marginTop: '4px' }}
                        disabled={loading}
                    >
                        {loading && <Loader2 size={16} className="animate-spin" />}
                        {loading ? 'Criando conta...' : 'Cadastrar'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#9b9a97' }}>
                    Já tem conta?{' '}
                    <Link href="/login" style={{ color: '#37352f', textDecoration: 'none', fontWeight: 500 }}>
                        Faça login
                    </Link>
                </p>
            </div>
        </div>
    );
}

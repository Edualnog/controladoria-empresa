'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const supabase = createClient();
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError('Email ou senha inválidos.');
            setLoading(false);
            return;
        }

        router.push('/');
        router.refresh();
    };

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
                        Entrar
                    </h1>
                    <p style={{ color: '#9b9a97', fontSize: '14px', marginTop: '6px' }}>
                        Acesse sua conta para gerenciar suas obras
                    </p>
                </div>

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
                                placeholder="••••••••"
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

                    <div style={{ textAlign: 'right', marginTop: '-8px' }}>
                        <Link
                            href="/forgot-password"
                            style={{
                                fontSize: '13px',
                                color: '#9b9a97',
                                textDecoration: 'none',
                            }}
                        >
                            Esqueceu sua senha?
                        </Link>
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
                        {loading ? 'Entrando...' : 'Entrar'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#9b9a97' }}>
                    Não tem conta?{' '}
                    <Link href="/register" style={{ color: '#37352f', textDecoration: 'none', fontWeight: 500 }}>
                        Cadastre-se
                    </Link>
                </p>
            </div>
        </div>
    );
}

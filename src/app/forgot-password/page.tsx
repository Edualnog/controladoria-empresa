'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { Loader2, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const supabase = createClient();
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        });

        if (error) {
            setError('Erro ao enviar email. Tente novamente.');
            setLoading(false);
            return;
        }

        setSent(true);
        setLoading(false);
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
                <Link
                    href="/login"
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '13px',
                        color: '#9b9a97',
                        textDecoration: 'none',
                        marginBottom: '24px',
                    }}
                >
                    <ArrowLeft size={14} />
                    Voltar ao login
                </Link>

                {sent ? (
                    <div>
                        <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#37352f', letterSpacing: '-0.5px' }}>
                            Email enviado ✓
                        </h1>
                        <p style={{ color: '#737373', fontSize: '14px', marginTop: '12px', lineHeight: 1.6 }}>
                            Enviamos um link de recuperação para <strong style={{ color: '#37352f' }}>{email}</strong>.
                            Verifique sua caixa de entrada e clique no link para criar uma nova senha.
                        </p>
                        <p style={{ color: '#9b9a97', fontSize: '13px', marginTop: '16px' }}>
                            Não recebeu?{' '}
                            <button
                                onClick={() => { setSent(false); setError(''); }}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#37352f',
                                    fontWeight: 500,
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                    padding: 0,
                                }}
                            >
                                Enviar novamente
                            </button>
                        </p>
                    </div>
                ) : (
                    <>
                        <div style={{ marginBottom: '32px' }}>
                            <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#37352f', letterSpacing: '-0.5px' }}>
                                Recuperar senha
                            </h1>
                            <p style={{ color: '#9b9a97', fontSize: '14px', marginTop: '6px' }}>
                                Digite seu email para receber um link de recuperação
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
                                {loading ? 'Enviando...' : 'Enviar link de recuperação'}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}

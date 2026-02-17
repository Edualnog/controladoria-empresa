'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Loader2, Eye, EyeOff, CheckCircle } from 'lucide-react';

export default function ResetPasswordPage() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [ready, setReady] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // Supabase will set the session from the URL hash automatically
        const supabase = createClient();
        supabase.auth.onAuthStateChange((event) => {
            if (event === 'PASSWORD_RECOVERY') {
                setReady(true);
            }
        });

        // Also check if user is already authenticated (e.g. came back to page)
        supabase.auth.getUser().then(({ data }) => {
            if (data.user) setReady(true);
        });
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password.length < 6) {
            setError('A senha deve ter no mínimo 6 caracteres.');
            return;
        }

        if (password !== confirmPassword) {
            setError('As senhas não coincidem.');
            return;
        }

        setLoading(true);

        const supabase = createClient();
        const { error } = await supabase.auth.updateUser({ password });

        if (error) {
            setError('Erro ao atualizar senha: ' + error.message);
            setLoading(false);
            return;
        }

        setSuccess(true);
        setLoading(false);

        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
            router.push('/');
            router.refresh();
        }, 2000);
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
                    <CheckCircle size={48} color="#16a34a" style={{ marginBottom: '16px' }} />
                    <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#37352f', marginBottom: '8px' }}>
                        Senha atualizada!
                    </h1>
                    <p style={{ color: '#737373', fontSize: '14px' }}>
                        Redirecionando para o painel...
                    </p>
                </div>
            </div>
        );
    }

    if (!ready) {
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
                    <Loader2 size={24} className="animate-spin" style={{ color: '#9b9a97', marginBottom: '12px' }} />
                    <p style={{ color: '#9b9a97', fontSize: '14px' }}>
                        Verificando link de recuperação...
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
                        Nova senha
                    </h1>
                    <p style={{ color: '#9b9a97', fontSize: '14px', marginTop: '6px' }}>
                        Crie uma nova senha para sua conta
                    </p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                        <label className="form-label">Nova senha</label>
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

                    <div>
                        <label className="form-label">Confirmar senha</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showConfirm ? 'text' : 'password'}
                                className="form-input"
                                style={{ paddingRight: '40px' }}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Repita a nova senha"
                                minLength={6}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirm(!showConfirm)}
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
                                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
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
                        {loading ? 'Atualizando...' : 'Atualizar senha'}
                    </button>
                </form>
            </div>
        </div>
    );
}

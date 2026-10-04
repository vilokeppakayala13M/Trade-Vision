"use client";
import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

function ResetPasswordContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const token = searchParams.get('token');
    const email = searchParams.get('email');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setStatus('error');
            setMessage('Passwords do not match');
            return;
        }

        if (!token || !email) {
            setStatus('error');
            setMessage('Invalid reset link');
            return;
        }

        setStatus('loading');
        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, email, newPassword: password })
            });
            const data = await res.json();
            if (data.success) {
                setStatus('success');
                setMessage(data.message);
            } else {
                setStatus('error');
                setMessage(data.error);
            }
        } catch (err) {
            setStatus('error');
            setMessage('Network error. Please try again.');
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', padding: '2rem' }}>
            <div style={{ background: 'var(--surface)', padding: '2rem', borderRadius: '12px', width: '100%', maxWidth: '400px', border: '1px solid var(--border)' }}>
                <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>Reset Password</h1>
                
                {status === 'success' ? (
                    <div>
                        <p style={{ color: 'var(--accent-green)', marginBottom: '1.5rem' }}>{message}</p>
                        <Link href="/login" style={{ display: 'inline-block', padding: '0.75rem', background: 'var(--primary)', color: 'white', borderRadius: '8px', textDecoration: 'none', width: '100%', textAlign: 'center' }}>Go to Login</Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        {status === 'error' && <p style={{ color: 'var(--accent-red)', marginBottom: '1rem' }}>{message}</p>}
                        
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>New Password</label>
                            <input 
                                type="password" 
                                required 
                                minLength={6}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
                            />
                        </div>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Confirm Password</label>
                            <input 
                                type="password" 
                                required 
                                minLength={6}
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
                            />
                        </div>
                        <button 
                            type="submit" 
                            disabled={status === 'loading'}
                            style={{ width: '100%', padding: '0.75rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: status === 'loading' ? 'not-allowed' : 'pointer' }}
                        >
                            {status === 'loading' ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}

export default function ResetPassword() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ResetPasswordContent />
        </Suspense>
    );
}

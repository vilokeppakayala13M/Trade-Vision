"use client";
import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const [resetUrl, setResetUrl] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        setResetUrl('');
        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await res.json();
            if (data.success) {
                setStatus('success');
                setMessage(data.message);
                if (data.resetUrl) {
                    setResetUrl(data.resetUrl);
                }
            } else {
                setStatus('error');
                setMessage(data.error || 'Failed to request password reset.');
            }
        } catch (err) {
            setStatus('error');
            setMessage('Network error. Please try again.');
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', padding: '2rem' }}>
            <div style={{ background: 'var(--surface)', padding: '2rem', borderRadius: '12px', width: '100%', maxWidth: '440px', border: '1px solid var(--border)' }}>
                <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>Forgot Password</h1>
                
                {status === 'success' ? (
                    <div>
                        <p style={{ color: 'var(--accent-green)', marginBottom: '1rem', lineHeight: '1.5' }}>{message}</p>
                        
                        {resetUrl && (
                            <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                                <p style={{ fontSize: '0.85rem', color: '#93c5fd', marginBottom: '0.75rem' }}>Direct Password Reset Access:</p>
                                <a 
                                    href={resetUrl} 
                                    style={{ display: 'block', padding: '0.75rem 1rem', background: 'var(--primary)', color: 'white', borderRadius: '6px', textAlign: 'center', textDecoration: 'none', fontWeight: 600 }}
                                >
                                    Click Here to Reset Password Now
                                </a>
                            </div>
                        )}
                        
                        <Link href="/login" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>Back to Login</Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                            Enter your registered email address and we will generate a link to reset your password.
                        </p>
                        
                        {status === 'error' && (
                            <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--accent-red)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem' }}>
                                <p style={{ color: 'var(--accent-red)', fontSize: '0.9rem', margin: 0 }}>{message}</p>
                            </div>
                        )}
                        
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Email Address</label>
                            <input 
                                type="email" 
                                required 
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="e.g. vilokcppakayala53@gmail.com"
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
                            />
                        </div>
                        <button 
                            type="submit" 
                            disabled={status === 'loading'}
                            style={{ width: '100%', padding: '0.75rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: status === 'loading' ? 'not-allowed' : 'pointer', fontWeight: 600 }}
                        >
                            {status === 'loading' ? 'Processing...' : 'Send Reset Link'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}

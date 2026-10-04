"use client";
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function VerifyEmailContent() {
    const searchParams = useSearchParams();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const token = searchParams.get('token');
        const email = searchParams.get('email');

        if (!token || !email) {
            setStatus('error');
            setMessage('Invalid verification link.');
            return;
        }

        fetch(`/api/auth/verify-email?token=${token}&email=${email}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setStatus('success');
                    setMessage(data.message);
                } else {
                    setStatus('error');
                    setMessage(data.error || 'Verification failed.');
                }
            })
            .catch(() => {
                setStatus('error');
                setMessage('An error occurred during verification.');
            });
    }, [searchParams]);

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', padding: '2rem' }}>
            <div style={{ background: 'var(--surface)', padding: '2rem', borderRadius: '12px', textAlign: 'center', maxWidth: '400px', border: '1px solid var(--border)' }}>
                <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>Email Verification</h1>
                {status === 'loading' && <p style={{ color: 'var(--text-secondary)' }}>Verifying your email...</p>}
                {status === 'success' && (
                    <>
                        <p style={{ color: 'var(--accent-green)', marginBottom: '1.5rem' }}>{message}</p>
                        <Link href="/login" style={{ display: 'inline-block', padding: '0.75rem 1.5rem', background: 'var(--primary)', color: 'white', borderRadius: '8px', textDecoration: 'none' }}>Go to Login</Link>
                    </>
                )}
                {status === 'error' && (
                    <>
                        <p style={{ color: 'var(--accent-red)', marginBottom: '1.5rem' }}>{message}</p>
                        <Link href="/login" style={{ color: 'var(--text-secondary)' }}>Back to Login</Link>
                    </>
                )}
            </div>
        </div>
    );
}

export default function VerifyEmail() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <VerifyEmailContent />
        </Suspense>
    );
}

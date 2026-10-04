"use client";

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [showModal, setShowModal] = useState(false);
    const [confirmEmail, setConfirmEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    if (!user) {
        return <div style={{ padding: '2rem', textAlign: 'center' }}>Please log in to view settings.</div>;
    }

    const handleDelete = async () => {
        if (confirmEmail !== user.email) {
            setStatus('error');
            setMessage('Email does not match.');
            return;
        }

        setStatus('loading');
        try {
            const res = await fetch('/api/auth/delete-account', {
                method: 'DELETE'
            });
            const data = await res.json();
            
            if (data.success) {
                setStatus('success');
                setMessage(data.message);
                setTimeout(() => {
                    logout();
                }, 3000);
            } else {
                setStatus('error');
                setMessage(data.error || 'Failed to delete account');
            }
        } catch (err) {
            setStatus('error');
            setMessage('Network error occurred.');
        }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '2rem', color: 'var(--text-primary)' }}>Account Settings</h1>
            
            <div style={{ background: 'var(--surface)', padding: '2rem', borderRadius: '12px', border: '1px solid var(--accent-red)' }}>
                <h2 style={{ color: 'var(--accent-red)', marginBottom: '1rem' }}>Danger Zone</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                    Once you delete your account, there is no going back. Please be certain. 
                    As per the DPDP Act 2023, your account data will be permanently erased after a 30-day grace period.
                </p>
                
                <button 
                    onClick={() => setShowModal(true)}
                    style={{ padding: '0.75rem 1.5rem', background: 'var(--accent-red)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                    Delete my account
                </button>
            </div>

            {showModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'var(--surface)', padding: '2rem', borderRadius: '12px', maxWidth: '400px', width: '100%', border: '1px solid var(--border)' }}>
                        <h2 style={{ color: 'var(--accent-red)', marginBottom: '1rem' }}>Confirm Deletion</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                            This action initiates the 30-day deletion process. To confirm, please type your email address: <strong>{user.email}</strong>
                        </p>
                        
                        {status === 'error' && <p style={{ color: 'var(--accent-red)', marginBottom: '1rem' }}>{message}</p>}
                        {status === 'success' && <p style={{ color: 'var(--accent-green)', marginBottom: '1rem' }}>{message}. Redirecting...</p>}

                        <input 
                            type="text" 
                            value={confirmEmail}
                            onChange={(e) => setConfirmEmail(e.target.value)}
                            placeholder={user.email}
                            style={{ width: '100%', padding: '0.75rem', marginBottom: '1.5rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', borderRadius: '8px', color: 'white' }}
                        />

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button 
                                onClick={() => setShowModal(false)}
                                disabled={status === 'loading' || status === 'success'}
                                style={{ flex: 1, padding: '0.75rem', background: 'transparent', border: '1px solid var(--border)', color: 'white', borderRadius: '8px', cursor: 'pointer' }}
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleDelete}
                                disabled={status === 'loading' || status === 'success' || confirmEmail !== user.email}
                                style={{ flex: 1, padding: '0.75rem', background: 'var(--accent-red)', border: 'none', color: 'white', borderRadius: '8px', cursor: (status === 'loading' || confirmEmail !== user.email) ? 'not-allowed' : 'pointer', opacity: (confirmEmail !== user.email) ? 0.5 : 1 }}
                            >
                                {status === 'loading' ? 'Processing...' : 'Confirm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User } from 'lucide-react';

interface GoogleAccount {
    name: string;
    email: string;
    avatarColor: string;
}

const MOCK_ACCOUNTS: GoogleAccount[] = [
    { name: 'Vilok E.', email: 'vilok.e@gmail.com', avatarColor: '#8e44ad' },
    { name: 'Demo User', email: 'demo.user@example.com', avatarColor: '#e67e22' },
    { name: 'Trader Pro', email: 'trader@stockinsights.com', avatarColor: '#16a085' }
];

interface GoogleLoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectAccount: (account: GoogleAccount) => void;
}

export default function GoogleLoginModal({ isOpen, onClose, onSelectAccount }: GoogleLoginModalProps) {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                backdropFilter: 'blur(4px)'
            }} onClick={onClose}>
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    style={{
                        backgroundColor: '#fff',
                        borderRadius: '8px',
                        width: '400px',
                        maxWidth: '90%',
                        overflow: 'hidden',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                        color: '#333'
                    }}
                    onClick={e => e.stopPropagation()}
                >
                    {/* Google Header */}
                    <div style={{ padding: '1.5rem 2rem 0.5rem', textAlign: 'center' }}>
                        <svg width="40" height="40" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '500', marginTop: '0.5rem' }}>Choose an account</h2>
                        <p style={{ color: '#5f6368', marginBottom: '1.5rem' }}>to continue to Stock Insights</p>
                    </div>

                    {/* Account List */}
                    <div style={{ paddingBottom: '2rem' }}>
                        {MOCK_ACCOUNTS.map((account, index) => (
                            <div
                                key={index}
                                onClick={() => onSelectAccount(account)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '0.8rem 2rem',
                                    cursor: 'pointer',
                                    borderBottom: '1px solid #f1f3f4',
                                    transition: 'background 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                                <div style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    backgroundColor: account.avatarColor,
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '14px',
                                    marginRight: '1rem',
                                    fontWeight: 'bold'
                                }}>
                                    {account.name.charAt(0)}
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontWeight: '500', fontSize: '0.95rem' }}>{account.name}</span>
                                    <span style={{ color: '#5f6368', fontSize: '0.85rem' }}>{account.email}</span>
                                </div>
                            </div>
                        ))}

                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '0.8rem 2rem',
                                cursor: 'pointer',
                                color: '#5f6368'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                            <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginRight: '1rem',
                                color: '#5f6368'
                            }}>
                                <User size={20} />
                            </div>
                            <span style={{ fontWeight: '500', fontSize: '0.95rem' }}>Use another account</span>
                        </div>
                    </div>

                    <div style={{
                        borderTop: '1px solid #dadce0',
                        padding: '1rem 2rem',
                        fontSize: '0.8rem',
                        color: '#5f6368',
                        textAlign: 'center'
                    }}>
                        To continue, Google will share your name, email address, and language preference with Stock Insights.
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

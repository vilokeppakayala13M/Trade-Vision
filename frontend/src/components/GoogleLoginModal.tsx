"use client";

import React, { useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface GoogleLoginModalProps {
    isOpen: boolean;
    onClose: () => void;
}

declare global {
    interface Window {
        google?: any;
    }
}

export default function GoogleLoginModal({ isOpen, onClose }: GoogleLoginModalProps) {
    const [scriptLoaded, setScriptLoaded] = useState(false);
    const googleButtonRef = useRef<HTMLDivElement>(null);
    const modalRef = useRef<HTMLDivElement>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isOpen || !scriptLoaded || !googleButtonRef.current || !window.google) return;

        try {
            window.google.accounts.id.initialize({
                client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
                callback: async (response: any) => {
                    try {
                        const res = await fetch('/api/auth/google', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ credential: response.credential })
                        });
                        const data = await res.json();
                        if (data.success) {
                            onClose();
                            // Force hard reload to update context with fresh cookie
                            window.location.href = '/'; 
                        } else {
                            setError(data.error || 'Google login failed');
                        }
                    } catch (err) {
                        setError('Network error');
                    }
                }
            });

            window.google.accounts.id.renderButton(
                googleButtonRef.current,
                { theme: 'outline', size: 'large', width: '330' } // width is required to be string or number for GIS
            );
        } catch (err) {
            console.error("Google init error", err);
        }
    }, [isOpen, scriptLoaded, onClose]);

    // Keyboard Focus Trapping & Escape dismissal
    useEffect(() => {
        if (!isOpen) return;

        const previousActiveElement = document.activeElement as HTMLElement;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
                return;
            }

            if (e.key === 'Tab') {
                const focusableElements = modalRef.current?.querySelectorAll(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                ) as NodeListOf<HTMLElement>;

                if (!focusableElements || focusableElements.length === 0) return;

                const firstElement = focusableElements[0];
                const lastElement = focusableElements[focusableElements.length - 1];

                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        lastElement.focus();
                        e.preventDefault();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        firstElement.focus();
                        e.preventDefault();
                    }
                }
            }
        };

        // Delay slightly to allow element rendering before setting initial focus
        const timer = setTimeout(() => {
            const firstFocusable = modalRef.current?.querySelector('button');
            if (firstFocusable) {
                firstFocusable.focus();
            }
        }, 100);

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            if (previousActiveElement) {
                previousActiveElement.focus();
            }
            clearTimeout(timer);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <>
            <Script 
                src="https://accounts.google.com/gsi/client" 
                strategy="afterInteractive" 
                onLoad={() => setScriptLoaded(true)}
            />
            <AnimatePresence>
                <div 
                    style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        zIndex: 2000
                    }}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="modal-title"
                    ref={modalRef}
                >
                    {/* Decorative backdrop overlay hidden from screen readers */}
                    <div 
                        style={{
                            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                            backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)'
                        }}
                        onClick={onClose}
                        aria-hidden="true"
                    />

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        style={{ 
                            backgroundColor: '#fff', 
                            borderRadius: '8px', 
                            padding: '2rem', 
                            width: '400px', 
                            maxWidth: '90%', 
                            textAlign: 'center',
                            position: 'relative',
                            zIndex: 2001,
                            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)'
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        <button
                            onClick={onClose}
                            style={{
                                position: 'absolute',
                                top: '12px',
                                right: '12px',
                                background: 'transparent',
                                border: 'none',
                                color: '#666',
                                cursor: 'pointer',
                                padding: '4px',
                                borderRadius: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                            aria-label="Close dialog"
                        >
                            <X size={18} />
                        </button>

                        <h2 id="modal-title" style={{ marginBottom: '1.5rem', marginTop: '0.5rem', color: '#333', fontSize: '1.5rem', fontWeight: 700 }}>Sign in with Google</h2>
                        {error && <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>}
                        
                        {!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && (
                            <p style={{ color: 'red', fontSize: '0.9rem', marginBottom: '1rem' }}>Missing NEXT_PUBLIC_GOOGLE_CLIENT_ID in env</p>
                        )}

                        <div ref={googleButtonRef} style={{ minHeight: '40px', display: 'flex', justifyContent: 'center' }}>
                            {!scriptLoaded && <p style={{ color: '#666' }}>Loading Google Sign-in...</p>}
                        </div>
                    </motion.div>
                </div>
            </AnimatePresence>
        </>
    );
}

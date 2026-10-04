"use client";

import React, { useEffect } from 'react';

interface GlobalErrorProps {
    error: Error & { digest?: string };
    reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
    useEffect(() => {
        console.error('Critical global error caught:', error);
    }, [error]);

    return (
        <html lang="en-IN">
            <body style={{
                backgroundColor: '#0b0e14',
                color: '#f8fafc',
                fontFamily: "'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                margin: 0,
                padding: '1.5rem',
                boxSizing: 'border-box',
                textAlign: 'center'
            }}>
                <div style={{
                    maxWidth: '460px',
                    width: '100%',
                    backgroundColor: '#111827',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '12px',
                    padding: '2.5rem 1.5rem',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
                    boxSizing: 'border-box'
                }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        backgroundColor: 'rgba(239, 68, 68, 0.12)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1.5rem auto'
                    }}>
                        <span style={{ fontSize: '24px', color: '#f87171' }}>⚠️</span>
                    </div>

                    <h1 style={{
                        fontSize: '24px',
                        fontWeight: 700,
                        margin: '0 0 0.75rem 0',
                        letterSpacing: '-0.02em',
                        color: '#f8fafc'
                    }}>System Error</h1>
                    
                    <p style={{
                        fontSize: '14px',
                        color: '#94a3b8',
                        lineHeight: 1.5,
                        margin: '0 0 1.5rem 0'
                    }}>
                        A critical system error occurred. We have logged the issue and our technical team is investigating.
                    </p>

                    {error.digest && (
                        <div style={{
                            backgroundColor: '#0f1520',
                            border: '1px solid rgba(255, 255, 255, 0.04)',
                            padding: '0.75rem',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontFamily: 'monospace',
                            color: '#64748b',
                            marginBottom: '2rem',
                            wordBreak: 'break-all'
                        }}>
                            Digest Reference: {error.digest}
                        </div>
                    )}

                    <button
                        onClick={() => reset()}
                        style={{
                            backgroundColor: '#3b82f6',
                            color: '#ffffff',
                            border: 'none',
                            width: '100%',
                            padding: '0.75rem 1.5rem',
                            borderRadius: '6px',
                            fontSize: '14px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'background-color 0.15s ease'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
                    >
                        Try again
                    </button>
                </div>
            </body>
        </html>
    );
}

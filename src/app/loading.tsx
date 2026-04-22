"use client";

import React from 'react';

export default function Loading() {
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            width: '100%',
            background: 'var(--background)',
            color: 'var(--text-primary)',
            flexDirection: 'column',
            gap: '1.5rem'
        }}>
            <div className="spinner" style={{
                width: '50px',
                height: '50px',
                border: '4px solid rgba(255,255,255,0.1)',
                borderTopColor: '#3b82f6',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
            }}></div>
            <p style={{
                fontSize: '1.1rem',
                fontWeight: 500,
                letterSpacing: '0.01em',
                opacity: 0.8
            }}>Loading TradeVision...</p>
            <style jsx>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}

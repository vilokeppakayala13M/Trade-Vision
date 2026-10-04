"use client";

import React, { useEffect } from 'react';
import { TrendingUp, RotateCcw } from 'lucide-react';
import styles from '../error.module.css';

interface ErrorProps {
    error: Error & { digest?: string };
    reset: () => void;
}

export default function PaperTradingError({ error, reset }: ErrorProps) {
    useEffect(() => {
        console.error('Paper trading error boundary caught error:', error);
    }, [error]);

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.iconWrapper} style={{ backgroundColor: 'rgba(239, 68, 68, 0.12)', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
                    <TrendingUp size={40} style={{ color: 'var(--red-text)' }} />
                </div>
                
                <h1 className={styles.title}>Trading Terminal Error</h1>
                <p className={styles.message}>
                    Unable to load the virtual trading terminal. Please check your network connection or try refreshing the terminal.
                </p>
                
                <div className={styles.actions}>
                    <button className={styles.resetBtn} onClick={() => reset()}>
                        <RotateCcw size={16} style={{ marginRight: '6px' }} />
                        Refresh Terminal
                    </button>
                </div>
            </div>
        </div>
    );
}

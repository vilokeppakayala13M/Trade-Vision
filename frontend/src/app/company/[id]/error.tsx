"use client";

import React, { useEffect } from 'react';
import { Landmark, RotateCcw } from 'lucide-react';
import styles from '../../error.module.css';

interface ErrorProps {
    error: Error & { digest?: string };
    reset: () => void;
}

export default function CompanyError({ error, reset }: ErrorProps) {
    useEffect(() => {
        console.error('Company details error boundary caught error:', error);
    }, [error]);

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.iconWrapper} style={{ backgroundColor: 'rgba(245, 158, 11, 0.12)', borderColor: 'rgba(245, 158, 11, 0.2)' }}>
                    <Landmark size={40} style={{ color: 'var(--amber)' }} />
                </div>
                
                <h1 className={styles.title}>Unable to Load Stock Data</h1>
                <p className={styles.message}>
                    We could not retrieve stock analysis or market data for this company. The ticker symbol may be invalid, the markets may be closed, or the data servers are temporarily offline.
                </p>
                
                <div className={styles.actions}>
                    <button className={styles.resetBtn} onClick={() => reset()}>
                        <RotateCcw size={16} style={{ marginRight: '6px' }} />
                        Try again
                    </button>
                </div>
            </div>
        </div>
    );
}

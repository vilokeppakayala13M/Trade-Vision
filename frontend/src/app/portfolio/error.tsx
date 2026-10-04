"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { Briefcase, RotateCcw, LogIn } from 'lucide-react';
import styles from '../error.module.css';

interface ErrorProps {
    error: Error & { digest?: string };
    reset: () => void;
}

export default function PortfolioError({ error, reset }: ErrorProps) {
    useEffect(() => {
        console.error('Portfolio error boundary caught error:', error);
    }, [error]);

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.iconWrapper} style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', borderColor: 'rgba(59, 130, 246, 0.3)' }}>
                    <Briefcase size={40} style={{ color: 'var(--blue-400)' }} />
                </div>
                
                <h1 className={styles.title}>Unable to Load Portfolio</h1>
                <p className={styles.message}>
                    We could not retrieve your portfolio details. If you are not logged in, please log in first. Otherwise, please try refreshing the data.
                </p>
                
                <div className={styles.actions}>
                    <button className={styles.resetBtn} onClick={() => reset()}>
                        <RotateCcw size={16} style={{ marginRight: '6px' }} />
                        Refresh Data
                    </button>
                    
                    <Link href="/login" className={styles.homeBtn} style={{ textDecoration: 'none' }}>
                        <LogIn size={16} style={{ marginRight: '6px' }} />
                        Log In
                    </Link>
                </div>
            </div>
        </div>
    );
}

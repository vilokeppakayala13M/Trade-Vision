"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, RotateCcw, Home } from 'lucide-react';
import styles from './error.module.css';

interface ErrorProps {
    error: Error & { digest?: string };
    reset: () => void;
}

export default function RootError({ error, reset }: ErrorProps) {
    useEffect(() => {
        console.error('Root error boundary caught error:', error);
    }, [error]);

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.iconWrapper}>
                    <AlertCircle size={40} className={styles.icon} />
                </div>
                
                <h1 className={styles.title}>Something went wrong</h1>
                <p className={styles.message}>
                    An unexpected error occurred while processing your request. Our security and systems team has been notified.
                </p>
                
                {error.digest && (
                    <div className={styles.digestBox}>
                        <span className={styles.digestLabel}>Error Reference Digest:</span>
                        <code className={styles.digestCode}>{error.digest}</code>
                    </div>
                )}
                
                <div className={styles.actions}>
                    <button className={styles.resetBtn} onClick={() => reset()}>
                        <RotateCcw size={16} className={styles.btnIcon} />
                        Try again
                    </button>
                    
                    <Link href="/" className={styles.homeBtn}>
                        <Home size={16} className={styles.btnIcon} />
                        Go to Homepage
                    </Link>
                </div>
            </div>
        </div>
    );
}

import React from 'react';
import Link from 'next/link';
import { HelpCircle, Home } from 'lucide-react';
import styles from './error.module.css';

export default function NotFound() {
    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.iconWrapper} style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', borderColor: 'rgba(59, 130, 246, 0.3)' }}>
                    <HelpCircle size={40} style={{ color: 'var(--blue-400)' }} />
                </div>
                
                <h1 className={styles.title}>404 - Page Not Found</h1>
                <p className={styles.message}>
                    The page you are looking for does not exist, has been removed, or is temporarily unavailable.
                </p>
                
                <div className={styles.actions}>
                    <Link href="/" className={styles.resetBtn} style={{ textDecoration: 'none' }}>
                        <Home size={16} style={{ marginRight: '6px' }} />
                        Go to Homepage
                    </Link>
                </div>
            </div>
        </div>
    );
}

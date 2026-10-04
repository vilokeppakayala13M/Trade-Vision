"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './CookieBanner.module.css';

export default function CookieBanner() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Read local storage on mount
        const consent = localStorage.getItem('cookie-consent');
        if (!consent) {
            setTimeout(() => {
                setIsVisible(true);
            }, 0);
        }
    }, []);

    const handleAcceptAll = () => {
        localStorage.setItem('cookie-consent', 'all');
        setIsVisible(false);
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('cookie-consent-changed', { detail: 'all' }));
        }
    };

    const handleRejectNonEssential = () => {
        localStorage.setItem('cookie-consent', 'essential-only');
        setIsVisible(false);
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('cookie-consent-changed', { detail: 'essential-only' }));
        }
    };

    if (!isVisible) return null;

    return (
        <div className={styles.banner}>
            <div className={styles.content}>
                <strong>We Value Your Privacy</strong>
                <p>
                    We use essential cookies to make TradeVision work properly. With your consent, we may also use non-essential cookies 
                    for analytics and personalized experiences. By clicking &quot;Accept All&quot;, you agree to our use of cookies as described in our{' '}
                    <Link href="/privacy">Privacy Policy</Link> (compliant with the DPDP Act 2023).
                </p>
            </div>
            <div className={styles.actions}>
                <button className={styles.managePref} onClick={handleRejectNonEssential}>
                    Manage Preferences
                </button>
                <button className={`${styles.btn} ${styles.rejectNonEssential}`} onClick={handleRejectNonEssential}>
                    Reject Non-Essential
                </button>
                <button className={`${styles.btn} ${styles.acceptAll}`} onClick={handleAcceptAll}>
                    Accept All
                </button>
            </div>
        </div>
    );
}

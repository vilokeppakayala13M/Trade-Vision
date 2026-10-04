"use client";

import React from 'react';
import { AlertTriangle } from 'lucide-react';
import styles from './DisclaimerBanner.module.css';

export default function DisclaimerBanner() {
    return (
        <div className={styles.banner} role="alert" aria-label="SEBI Disclaimer">
            <div className={styles.container}>
                <AlertTriangle className={styles.icon} size={18} aria-hidden="true" />
                <span className={styles.text}>
                    <strong>TradeVision is not SEBI-registered.</strong> All content is for educational and informational purposes only and does not constitute investment advice. Please consult a SEBI-registered advisor before investing.
                </span>
            </div>
        </div>
    );
}

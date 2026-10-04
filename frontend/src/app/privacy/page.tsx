import { Metadata } from 'next';
import styles from '../legal.module.css';

export const metadata: Metadata = {
    title: 'Privacy Policy | TradeVision',
    description: 'Privacy Policy and Data Protection Information for TradeVision in compliance with the DPDP Act 2023.',
};

export default function PrivacyPolicy() {
    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Privacy Policy</h1>
            <span className={styles.lastUpdated}>Last Updated: May 2026</span>

            <div className={styles.section}>
                <h2>1. Introduction</h2>
                <p>
                    Welcome to TradeVision. We respect your privacy and are committed to protecting your personal data. 
                    This Privacy Policy explains how we collect, use, and safeguard your information when you use our 
                    platform. TradeVision operates as a Data Fiduciary under the <strong>Digital Personal Data Protection Act, 2023 (DPDP Act)</strong> of India.
                </p>
            </div>

            <div className={styles.section}>
                <h2>2. What Data We Collect</h2>
                <p>We only collect data that is strictly necessary to provide our services:</p>
                <ul>
                    <li><strong>Personal Identity Data:</strong> Name, Email Address, and Phone Number (collected during registration).</li>
                    <li><strong>Usage Data:</strong> Pages visited, features used, and device information (to improve our services).</li>
                    <li><strong>Financial Preferences:</strong> Watchlist stocks and portfolio data you explicitly save.</li>
                </ul>
            </div>

            <div className={styles.section}>
                <h2>3. How We Store Your Data</h2>
                <p>
                    Your personal information is securely stored in our <strong>MongoDB</strong> databases. We implement robust encryption 
                    and security measures to prevent unauthorized access. Passwords are hashed and never stored in plaintext.
                </p>
            </div>

            <div className={styles.section}>
                <h2>4. Third-Party Services</h2>
                <p>
                    To provide real-time market insights, we integrate with third-party providers including <strong>Finnhub API</strong> and <strong>Yahoo Finance</strong>.
                    We do not share your personally identifiable information (PII) with these providers. They only receive anonymized ticker requests.
                </p>
            </div>

            <div className={styles.section}>
                <h2>5. Your Rights Under DPDP Act 2023</h2>
                <p>As a Data Principal in India, you have the following rights regarding your personal data:</p>
                <ul>
                    <li><strong>Right to Access:</strong> Request a summary of the personal data we hold about you.</li>
                    <li><strong>Right to Correction:</strong> Update or fix inaccurate personal information.</li>
                    <li><strong>Right to Erasure:</strong> Request the complete deletion of your account and associated personal data.</li>
                    <li><strong>Right to Nominate:</strong> Nominate an individual to exercise your rights in the event of death or incapacity.</li>
                </ul>
            </div>

            <div className={styles.section}>
                <h2>6. Data Retention</h2>
                <p>
                    We retain your personal data only as long as your account is active or as necessary to fulfill the purposes outlined in this policy. 
                    If you delete your account, your data is erased from our active MongoDB databases within 30 days.
                </p>
            </div>

            <div className={styles.section}>
                <h2>7. Grievance Redressal</h2>
                <p>
                    If you have any questions, concerns, or wish to exercise your right to erasure, please contact our designated Data Protection Officer:
                </p>
                <p>
                    <strong>Email:</strong> grievance@tradevision.in<br />
                    <strong>Response Time:</strong> We aim to resolve all DPDP-related grievances within 7 working days.
                </p>
            </div>
        </div>
    );
}

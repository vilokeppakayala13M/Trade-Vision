import { Metadata } from 'next';
import styles from '../legal.module.css';

export const metadata: Metadata = {
    title: 'Terms of Service | TradeVision',
    description: 'Terms of Service and Acceptable Use Policy for the TradeVision platform.',
};

export default function TermsOfService() {
    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Terms of Service</h1>
            <span className={styles.lastUpdated}>Last Updated: May 2026</span>

            <div className={styles.section}>
                <h2>1. Acceptance of Terms</h2>
                <p>
                    By accessing and using TradeVision, you agree to comply with and be bound by these Terms of Service. 
                    If you do not agree with any part of these terms, you must refrain from using our platform.
                </p>
            </div>

            <div className={styles.section}>
                <h2>2. Acceptable Use</h2>
                <p>You agree to use TradeVision solely for your personal, non-commercial purposes. You are strictly prohibited from:</p>
                <ul>
                    <li>Attempting to hack, disrupt, or compromise the integrity of our platform.</li>
                    <li>Scraping, data mining, or systematically extracting data from our application.</li>
                    <li>Using the platform for any illegal activities or violations of financial regulations in India.</li>
                </ul>
            </div>

            <div className={styles.section}>
                <h2>3. Intellectual Property</h2>
                <p>
                    All content, design, algorithms, and branding elements on TradeVision are the exclusive intellectual property of 
                    TradeVision and its licensors. You may not reproduce, distribute, or create derivative works without prior written consent.
                </p>
            </div>

            <div className={styles.section}>
                <h2>4. Disclaimer of Liability</h2>
                <div className={styles.highlightBox}>
                    <p>
                        TradeVision is a platform for educational and informational purposes only. We are not a registered investment advisor. 
                        We disclaim all liability for any financial losses or damages incurred as a result of using our platform. You are solely 
                        responsible for your financial decisions.
                    </p>
                </div>
            </div>

            <div className={styles.section}>
                <h2>5. Account Suspension</h2>
                <p>
                    We reserve the right to suspend or terminate your account at our sole discretion, without prior notice, if we believe 
                    you have violated these Terms of Service or engaged in fraudulent activity.
                </p>
            </div>

            <div className={styles.section}>
                <h2>6. Governing Law & Dispute Resolution</h2>
                <p>
                    These terms shall be governed by and construed in accordance with the laws of <strong>India</strong>. Any disputes arising out of 
                    or relating to these terms or your use of the platform shall be subject to the exclusive jurisdiction of the courts located in 
                    <strong> Maharashtra, India</strong>.
                </p>
            </div>
        </div>
    );
}

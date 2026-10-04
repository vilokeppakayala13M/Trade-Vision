import { Metadata } from 'next';
import Link from 'next/link';
import styles from '../legal.module.css';

export const metadata: Metadata = {
    title: 'Security Disclosure Policy | TradeVision',
    description: 'Responsible security disclosure policy, guidelines, safe harbor terms, and contact information for reporting vulnerabilities in TradeVision.',
};

export default function SecurityDisclosure() {
    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Security Disclosure Policy</h1>
            <span className={styles.lastUpdated}>Last Updated: June 2026</span>

            <div className={styles.highlightBox} style={{ marginTop: 0 }}>
                <p>
                    <strong>IMPORTANT:</strong> At TradeVision, the security of our users' financial data and system integrity is our highest priority. 
                    We appreciate the work of security researchers and the broader community in helping us maintain a safe platform. 
                    If you believe you have discovered a vulnerability, please report it to us in accordance with this policy.
                </p>
            </div>

            <div className={styles.section}>
                <h2>1. How to Report a Vulnerability</h2>
                <p>
                    If you identify a potential security vulnerability, please submit a detailed report to our security team via email at 
                    {' '}<a href="mailto:support@tradevision.in"><strong>support@tradevision.in</strong></a>.
                </p>
                <p>
                    To help us understand and resolve the issue quickly, please include the following details in your report:
                </p>
                <ul>
                    <li>A clear description of the vulnerability and its potential impact.</li>
                    <li>Detailed, step-by-step instructions or a proof-of-concept (PoC) to reproduce the issue.</li>
                    <li>Any specific URLs, headers, payloads, or parameters involved.</li>
                    <li>Your name or alias if you wish to be credited once the issue is resolved.</li>
                </ul>
            </div>

            <div className={styles.section}>
                <h2>2. Expected Response Times</h2>
                <p>
                    We take security submissions seriously and pledge to handle them with urgency:
                </p>
                <ul>
                    <li><strong>Initial Acknowledgement:</strong> We aim to acknowledge receipt of your report within <strong>48 hours</strong>.</li>
                    <li><strong>Triage and Verification:</strong> Our security team will review and attempt to verify the vulnerability within <strong>5 business days</strong> of acknowledgment.</li>
                    <li><strong>Status Updates:</strong> We will provide regular updates regarding our validation and resolution progress.</li>
                    <li><strong>Resolution:</strong> We aim to patch verified vulnerabilities within <strong>30 days</strong>. If a fix takes longer due to complexity, we will notify you and discuss a revised timeline.</li>
                </ul>
            </div>

            <div className={styles.section}>
                <h2>3. Guidelines & Safe Harbor</h2>
                <p>
                    If you conduct security research in good faith and comply with these guidelines, TradeVision will not initiate or support legal actions 
                    against you, and we will consider your research authorized. We ask that you:
                </p>
                <ul>
                    <li>Avoid violating privacy, destroying data, or causing service disruption (e.g., via spam or denial of service).</li>
                    <li>Do not access, modify, or download data belonging to other users.</li>
                    <li>Keep details of the vulnerability confidential until we have resolved it (Responsible Disclosure).</li>
                    <li>Do not perform physical or social engineering attacks against TradeVision employees, contractors, or offices.</li>
                </ul>
            </div>

            <div className={styles.section}>
                <h2>4. Scope</h2>
                <p>
                    <strong>In-Scope:</strong>
                </p>
                <ul>
                    <li>TradeVision main application (`tradevision.in` and all core user-facing subroutes).</li>
                    <li>TradeVision frontend routing, authentication, and state management.</li>
                    <li>TradeVision backend API endpoints and databases under our direct control.</li>
                </ul>
                <p>
                    <strong>Out-of-Scope:</strong>
                </p>
                <ul>
                    <li>Denial of Service (DoS) or Distributed Denial of Service (DDoS) vulnerabilities.</li>
                    <li>Spamming, rate-limiting bypasses on non-sensitive endpoints, or volumetric attacks.</li>
                    <li>Third-party integrations (such as Finnhub or Google OAuth) unless the vulnerability directly stems from our custom integration implementation.</li>
                </ul>
            </div>
        </div>
    );
}

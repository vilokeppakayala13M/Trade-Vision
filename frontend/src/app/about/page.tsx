import { Metadata } from 'next';
import styles from '../legal.module.css';

export const metadata: Metadata = {
    title: 'About Us | TradeVision',
    description: 'Learn about the mission, technology, and features behind TradeVision.',
};

export default function AboutUs() {
    return (
        <div className={styles.container}>
            <h1 className={styles.title}>About Us</h1>
            <span className={styles.lastUpdated}>Our Story & Mission</span>

            <div className={styles.section}>
                <h2>Our Mission</h2>
                <p>
                    At TradeVision, our mission is to democratize stock market intelligence for Indian retail investors. 
                    We believe that access to institutional-grade analytics, sentiment tracking, and algorithmic insights 
                    should not be restricted to Wall Street or Dalal Street professionals. We empower you to make data-driven 
                    decisions.
                </p>
            </div>

            <div className={styles.section}>
                <h2>Key Features</h2>
                <p>TradeVision provides a comprehensive suite of tools designed for the modern investor:</p>
                <ul>
                    <li><strong>Live Market Data:</strong> Real-time NSE/BSE quotes and market overviews.</li>
                    <li><strong>IPO Tracker:</strong> Up-to-date tracking of upcoming, open, and recently listed IPOs.</li>
                    <li><strong>Derivatives & Futures:</strong> Advanced tracking of F&O markets.</li>
                    <li><strong>Financial Calculators:</strong> Plan your future with our SIP and Lumpsum calculators.</li>
                    <li><strong>Algorithmic Sentiment Analysis:</strong> Our custom models analyze market sentiment to provide actionable verdicts.</li>
                    <li><strong>Personalized Portfolio & Watchlist:</strong> Track your investments securely in one place.</li>
                </ul>
            </div>

            <div className={styles.section}>
                <h2>Our Technology Stack</h2>
                <p>
                    TradeVision is built using modern, lightning-fast web technologies to ensure a seamless and responsive 
                    user experience:
                </p>
                <ul>
                    <li><strong>Frontend:</strong> Next.js (App Router) for highly optimized, server-rendered React applications.</li>
                    <li><strong>Database:</strong> MongoDB & Mongoose for flexible, secure, and scalable data storage.</li>
                    <li><strong>Market Data APIs:</strong> Integrated with Yahoo Finance and Finnhub for reliable, real-time financial data.</li>
                    <li><strong>Design System:</strong> Custom CSS variables and Glassmorphism aesthetics for a premium UI.</li>
                </ul>
            </div>
        </div>
    );
}

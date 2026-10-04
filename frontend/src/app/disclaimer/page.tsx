import { Metadata } from 'next';
import styles from '../legal.module.css';

export const metadata: Metadata = {
    title: 'Financial Disclaimer | TradeVision',
    description: 'Important legal and financial disclaimers regarding the use of TradeVision, including SEBI registration status, data sources, and accuracy limitations.',
};

export default function Disclaimer() {
    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Financial Disclaimer</h1>
            <span className={styles.lastUpdated}>Last Updated: June 2026</span>

            <div className={styles.highlightBox} style={{ marginTop: 0 }}>
                <p>
                    <strong>IMPORTANT NOTICE:</strong> TradeVision is <strong>NOT</strong> registered with the Securities and Exchange Board of India (SEBI) as an Investment Advisor (IA), Research Analyst (RA), Portfolio Manager, or Broker-Dealer. All information and tools on this platform are for educational and informational purposes only.
                </p>
            </div>

            <div className={styles.section}>
                <h2>1. No Investment Advice or Recommendations</h2>
                <p>
                    The content, tools, metrics, AI analyst outputs, sentiment scores, and algorithmic "Verdicts" provided on TradeVision do not constitute investment, financial, tax, or legal advice. They are not offers or solicitations to buy or sell any security.
                </p>
                <p>
                    Any trade execution or decision simulated via our paper trading functionality is entirely mock and for learning purposes. Users must not replicate these simulated actions in live broker accounts without independent research.
                </p>
                <p>
                    We highly recommend that you consult with a certified <strong>SEBI-registered financial advisor</strong> before making any real-world investment or trading decisions.
                </p>
            </div>

            <div className={styles.section}>
                <h2>2. Data Sources & Provider Information</h2>
                <p>
                    To power our charting, stock details, news summaries, and predictive algorithms, TradeVision integrates with external third-party data providers:
                </p>
                <ul>
                    <li><strong>Yahoo Finance API:</strong> Used for fetching historical stock prices, market capitalization, daily high/low quotes, trading volumes, and interactive chart data.</li>
                    <li><strong>Finnhub API:</strong> Sourced for company profile metadata, corporate earnings events, IPO calendars, and financial news feeds.</li>
                </ul>
                <p>
                    TradeVision does not host, clear, or control the underlying market feeds. Sourcing is subject to terms of service and availability constraints from these third-party systems.
                </p>
            </div>

            <div className={styles.section}>
                <h2>3. Data Accuracy, Delays & Limitations</h2>
                <p>
                    While we make reasonable efforts to verify and update the information displayed:
                </p>
                <ul>
                    <li><strong>Price Latency:</strong> Real-time feeds and quotes may be delayed by up to 15 minutes or longer depending on the third-party providers. Do not place real trades based solely on the prices displayed in TradeVision.</li>
                    <li><strong>Outages and Errors:</strong> APIs and data connections can suffer from intermittent disruptions. We make no warranty as to the completeness, timeliness, or absolute accuracy of any data.</li>
                    <li><strong>Algorithmic & AI Limitations:</strong> Sentiment scores and trend predictions are generated programmatically using historical data and generative AI models. Historical trends are not predictive of future market movements. Generative AI may occasionally produce incorrect, inaccurate, or hallucinated analysis.</li>
                </ul>
            </div>

            <div className={styles.section}>
                <h2>4. Limitation of Liability</h2>
                <p>
                    Under no circumstances shall TradeVision, its developers, or its affiliates be held liable for any financial loss, loss of profits, or damages (direct or indirect) arising from the use of this application or reliance on any material, verdict, or chat response presented herein. You assume sole responsibility for all financial risk associated with your market investments.
                </p>
            </div>
        </div>
    );
}

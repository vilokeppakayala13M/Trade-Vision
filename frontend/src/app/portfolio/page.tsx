import type { Metadata } from 'next';
import PortfolioClient from './PortfolioClient';

export const metadata: Metadata = {
    title: 'My Portfolio — Track Your Indian Stock Holdings',
    description:
        'Monitor your NSE and BSE stock portfolio in real-time. View your holdings performance, P&L, AI-generated buy/sell verdicts, and personalised stock suggestions on TradeVision.',
    keywords: [
        'stock portfolio tracker India', 'NSE portfolio', 'share market portfolio',
        'portfolio P&L India', 'holdings tracker NSE BSE', 'investment portfolio India',
    ],
    alternates: {
        canonical: `${process.env.NEXT_PUBLIC_APP_URL || 'https://tradevision.in'}/portfolio`,
    },
    openGraph: {
        title: 'My Portfolio — Track Your Indian Stock Holdings | TradeVision',
        description: 'Real-time NSE & BSE portfolio tracking with AI-powered buy/sell insights.',
        url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://tradevision.in'}/portfolio`,
    },
};

export default function PortfolioPage() {
    return <PortfolioClient />;
}

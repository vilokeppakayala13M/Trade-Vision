import type { Metadata } from 'next';
import NewsClient from './NewsClient';

export const metadata: Metadata = {
    title: 'Market News — Latest Indian Stock Market Headlines',
    description:
        'Stay updated with the latest Indian stock market news, NSE & BSE corporate announcements, earnings results, RBI policy updates, and global market trends affecting Indian equities.',
    keywords: [
        'Indian stock market news', 'NSE BSE news', 'share market today', 'stock market headlines India',
        'Sensex Nifty news', 'RBI policy news', 'corporate earnings India', 'market analysis',
    ],
    alternates: {
        canonical: `${process.env.NEXT_PUBLIC_APP_URL || 'https://tradevision.in'}/news`,
    },
    openGraph: {
        title: 'Market News — Latest Indian Stock Market Headlines | TradeVision',
        description: 'Latest NSE & BSE market news, corporate announcements, and global cues for Indian investors.',
        url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://tradevision.in'}/news`,
    },
};

export default function NewsPage() {
    return <NewsClient />;
}

import type { Metadata } from 'next';
import WatchlistPage from './WatchlistPage';

export const metadata: Metadata = {
    title: 'My Watchlist — Track Favourite NSE & BSE Stocks',
    description:
        'Create and manage your personalised stock watchlist on TradeVision. Monitor live prices, daily changes, and performance of your favourite NSE and BSE listed companies in one place.',
    keywords: [
        'stock watchlist India', 'NSE watchlist', 'BSE stock tracker', 'favourite stocks India',
        'share price alert India', 'stock monitoring tool',
    ],
    alternates: {
        canonical: `${process.env.NEXT_PUBLIC_APP_URL || 'https://tradevision.in'}/watchlist`,
    },
    openGraph: {
        title: 'My Watchlist — Track Favourite NSE & BSE Stocks | TradeVision',
        description: 'Monitor live prices of your favourite NSE & BSE stocks in one personalised watchlist.',
        url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://tradevision.in'}/watchlist`,
    },
};

export default function WatchlistRoute() {
    return <WatchlistPage />;
}

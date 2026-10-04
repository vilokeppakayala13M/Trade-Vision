import type { Metadata } from 'next';
import FuturesClient from './FuturesClient';

export const metadata: Metadata = {
    title: 'Futures Market — Live NSE Index & Stock Futures Prices',
    description:
        'Track live NSE futures prices including NIFTY 50, Bank NIFTY, and Fin NIFTY index futures alongside F&O stock futures with real-time data, lot sizes, and near-month contract expiry dates.',
    keywords: [
        'NSE futures prices', 'NIFTY futures', 'Bank NIFTY futures', 'stock futures India',
        'F&O trading India', 'futures and options NSE', 'index futures live', 'derivatives India',
    ],
    alternates: {
        canonical: `${process.env.NEXT_PUBLIC_APP_URL || 'https://tradevision.in'}/futures`,
    },
    openGraph: {
        title: 'Futures Market — Live NSE Index & Stock Futures Prices | TradeVision',
        description: 'Live NIFTY, Bank NIFTY, and stock futures prices with real-time data on NSE.',
        url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://tradevision.in'}/futures`,
    },
};

export default function FuturesPage() {
    return <FuturesClient />;
}

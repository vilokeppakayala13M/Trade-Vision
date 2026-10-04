import type { Metadata } from 'next';
import IPOListPage from './IPOListPage';
import JsonLd from '@/components/JsonLd';

export const metadata: Metadata = {
    title: 'IPO Calendar — Upcoming, Open & Listed IPOs',
    description:
        'Explore the latest IPO calendar for Indian stock markets. Track upcoming IPOs, open subscriptions, allotment status, and recently listed IPOs on NSE and BSE in 2025.',
    keywords: [
        'IPO calendar India', 'upcoming IPO 2025', 'NSE IPO', 'BSE IPO', 'IPO subscription',
        'IPO allotment', 'IPO listing date', 'SME IPO India',
    ],
    alternates: {
        canonical: `${process.env.NEXT_PUBLIC_APP_URL || 'https://tradevision.in'}/ipos`,
    },
    openGraph: {
        title: 'IPO Calendar — Upcoming, Open & Listed IPOs | TradeVision',
        description: 'Track upcoming, open, and recently listed IPOs on NSE and BSE.',
        url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://tradevision.in'}/ipos`,
    },
};

const ipoListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Indian IPO Calendar 2025',
    description: 'List of upcoming, open, and recently listed IPOs on NSE and BSE.',
    url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://tradevision.in'}/ipos`,
    itemListElement: [
        {
            '@type': 'ListItem',
            position: 1,
            name: 'Open IPOs',
            url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://tradevision.in'}/ipos#open`,
        },
        {
            '@type': 'ListItem',
            position: 2,
            name: 'Upcoming IPOs',
            url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://tradevision.in'}/ipos#upcoming`,
        },
        {
            '@type': 'ListItem',
            position: 3,
            name: 'Listed IPOs',
            url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://tradevision.in'}/ipos#listed`,
        },
    ],
};

export default function IPOsPage() {
    return (
        <>
            <JsonLd data={ipoListSchema} />
            <IPOListPage />
        </>
    );
}

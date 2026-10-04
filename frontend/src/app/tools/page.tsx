import type { Metadata } from 'next';
import SIPCalculator from '@/components/tools/SIPCalculator';
import LumpsumCalculator from '@/components/tools/LumpsumCalculator';
import JsonLd from '@/components/JsonLd';

export const metadata: Metadata = {
    title: 'Financial Tools — SIP & Lumpsum Investment Calculators',
    description:
        'Use TradeVision’s free SIP calculator and lumpsum calculator to plan your mutual fund and stock investments. Estimate returns, maturity amounts, and wealth growth over time for Indian markets.',
    keywords: [
        'SIP calculator India', 'lumpsum calculator', 'mutual fund calculator',
        'investment calculator India', 'SIP return calculator', 'wealth calculator India',
        'financial planning tool', 'CAGR calculator',
    ],
    alternates: {
        canonical: `${process.env.NEXT_PUBLIC_APP_URL || 'https://tradevision.in'}/tools`,
    },
    openGraph: {
        title: 'Financial Tools — SIP & Lumpsum Investment Calculators | TradeVision',
        description: 'Free SIP & lumpsum calculators to plan your Indian market investments.',
        url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://tradevision.in'}/tools`,
    },
};

const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'TradeVision Financial Calculators',
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web',
    url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://tradevision.in'}/tools`,
    offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'INR',
    },
    description: 'SIP and Lumpsum investment calculators for Indian investors to plan returns.',
    provider: {
        '@type': 'Organization',
        name: 'TradeVision',
        url: process.env.NEXT_PUBLIC_APP_URL || 'https://tradevision.in',
    },
};

export default function ToolsPage() {
    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <JsonLd data={softwareSchema} />
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Financial Tools</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Plan your investments with our advanced calculators.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
                <SIPCalculator />
                <LumpsumCalculator />
            </div>
        </div>
    );
}

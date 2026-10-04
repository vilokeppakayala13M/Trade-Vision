// Server component wrapper for /company/[id] — provides generateMetadata and JSON-LD schemas
// The page.tsx must be renamed from 'use client' to use this pattern in production.
// This file is provided as a reference for metadata patterns.

import type { Metadata } from 'next';
import React from 'react';
import JsonLd from '@/components/JsonLd';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://tradevision.in';

// Map of common NSE IDs to display names/sectors (expand as needed)
const COMPANY_INFO: Record<string, { name: string; sector: string }> = {
    reliance: { name: 'Reliance Industries Ltd', sector: 'Energy & Diversified' },
    tcs: { name: 'Tata Consultancy Services', sector: 'Information Technology' },
    hdfcbank: { name: 'HDFC Bank Limited', sector: 'Banking & Financial Services' },
    infy: { name: 'Infosys Limited', sector: 'Information Technology' },
    icicibank: { name: 'ICICI Bank Ltd', sector: 'Banking & Financial Services' },
    sbin: { name: 'State Bank of India', sector: 'Banking & Financial Services' },
    tatamotors: { name: 'Tata Motors Limited', sector: 'Automobile' },
    wipro: { name: 'Wipro Limited', sector: 'Information Technology' },
    hcltech: { name: 'HCL Technologies Ltd', sector: 'Information Technology' },
    axisbank: { name: 'Axis Bank Limited', sector: 'Banking & Financial Services' },
    bajfinance: { name: 'Bajaj Finance Ltd', sector: 'NBFC & Financial Services' },
    maruti: { name: 'Maruti Suzuki India Ltd', sector: 'Automobile' },
    sunpharma: { name: 'Sun Pharmaceutical Industries', sector: 'Pharmaceuticals' },
    adanient: { name: 'Adani Enterprises Ltd', sector: 'Diversified' },
};

// generateMetadata runs on the server at request time
export async function generateMetadata(
    { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
    const { id } = await params;
    const symbol = id.toUpperCase();
    const info = COMPANY_INFO[id] || { name: `${symbol}`, sector: 'Indian Stock Market' };

    const title = `${info.name} (${symbol}) — Live Share Price & Analysis`;
    const description = `Get the live NSE share price of ${info.name} (${symbol}), a leading company in the ${info.sector} sector. View real-time quotes, AI buy/sell verdict, price charts, financial fundamentals, and market news on TradeVision.`;

    return {
        title,
        description,
        keywords: [
            `${symbol} share price`, `${info.name} stock`, `${symbol} NSE`, `${symbol} live price`,
            `${info.name} analysis`, `${symbol} buy or sell`, `${info.sector} stocks India`,
            'NSE live stock price', 'BSE share price today',
        ],
        alternates: {
            canonical: `${BASE_URL}/company/${id}`,
        },
        openGraph: {
            type: 'website',
            siteName: 'TradeVision',
            locale: 'en_IN',
            title: `${info.name} (${symbol}) — Live Share Price | TradeVision`,
            description,
            url: `${BASE_URL}/company/${id}`,
            images: [
                {
                    // In production, this could be a dynamic OG image route
                    // e.g. /api/og?symbol=RELIANCE&price=2950
                    url: `/opengraph-image.png`,
                    width: 1200,
                    height: 630,
                    alt: `${info.name} stock analysis on TradeVision`,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: `${info.name} (${symbol}) — Live NSE Price | TradeVision`,
            description,
            images: [`/opengraph-image.png`],
        },
    };
}

// JSON-LD schemas for the company page — rendered server-side
function CompanyJsonLd({ id }: { id: string }) {
    const symbol = id.toUpperCase();
    const info = COMPANY_INFO[id] || { name: symbol, sector: 'Indian Stock Market' };

    const financialProductSchema = {
        '@context': 'https://schema.org',
        '@type': 'FinancialProduct',
        name: info.name,
        description: `${info.name} is listed on NSE (ticker: ${symbol}) in the ${info.sector} sector.`,
        url: `${BASE_URL}/company/${id}`,
        provider: {
            '@type': 'Organization',
            name: 'TradeVision',
            url: BASE_URL,
        },
    };

    const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: BASE_URL,
            },
            {
                '@type': 'ListItem',
                position: 2,
                name: 'Company',
                item: `${BASE_URL}/company`,
            },
            {
                '@type': 'ListItem',
                position: 3,
                name: symbol,
                item: `${BASE_URL}/company/${id}`,
            },
        ],
    };

    return (
        <>
            <JsonLd data={financialProductSchema} />
            <JsonLd data={breadcrumbSchema} />
        </>
    );
}

// ── Server wrapper ──────────────────────────────────────────────────────────
// NOTE: Because the actual company UI must stay 'use client', we import it
// dynamically here and inject the JSON-LD server-side.
import CompanyPageClient from './CompanyPageClient';

export default async function CompanyPage(
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    return (
        <>
            <CompanyJsonLd id={id} />
            <CompanyPageClient />
        </>
    );
}

'use client';

import React, { useState, useEffect } from 'react';
import FuturesCard from '@/components/futures/FuturesCard';
import TryAgain from '@/components/TryAgain';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import styles from './page.module.css';

// Using Continuous Futures or Spot Indices as Proxy if Futures not available
const INDICES_SYMBOLS = [
    { id: 'nifty', symbol: '^NSEI', name: 'NIFTY 50' },
    { id: 'banknifty', symbol: '^NSEBANK', name: 'BANK NIFTY' },
    { id: 'finnifty', symbol: 'NIFTY_FIN_SERVICE.NS', name: 'FIN NIFTY' }
];

const MOCK_INDICES = [
    { symbol: 'NIFTY 50', price: 21850.50, change: 120.50, changePercent: 0.55 },
    { symbol: 'BANK NIFTY', price: 45900.25, change: -150.75, changePercent: -0.33 },
    { symbol: 'FIN NIFTY', price: 20450.00, change: 50.25, changePercent: 0.25 }
];

const MOCK_STOCK_FUTURES = [
    { symbol: 'RELIANCE FUT', price: 2950.00, change: 15.00, changePercent: 0.51, expiryDate: '29 Feb' },
    { symbol: 'HDFCBANK FUT', price: 1420.00, change: -10.00, changePercent: -0.70, expiryDate: '29 Feb' },
    { symbol: 'INFY FUT', price: 1650.00, change: 20.00, changePercent: 1.23, expiryDate: '29 Feb' },
    { symbol: 'TCS FUT', price: 4100.00, change: 45.00, changePercent: 1.11, expiryDate: '29 Feb' },
    { symbol: 'SBIN FUT', price: 760.00, change: 5.00, changePercent: 0.66, expiryDate: '29 Feb' }
];

// Expanded List of F&O Stocks
const STOCK_SYMBOLS = [
    'RELIANCE.NS', 'HDFCBANK.NS', 'INFY.NS', 'TATASTEEL.NS', 'SBIN.NS',
    'ICICIBANK.NS', 'AXISBANK.NS', 'BHARTIARTL.NS', 'ITC.NS', 'LT.NS',
    'MARUTI.NS', 'TCS.NS', 'TATAMOTORS.NS', 'ADANIENT.NS', 'ADANIPORTS.NS'
];

interface FuturesData {
    symbol: string;
    price: number;
    change: number;
    changePercent: number;
    expiryDate: string;
    spotPrice?: number;
    lotSize?: number;
}

export default function FuturesPage() {
    const isOnline = useNetworkStatus();
    const [indicesData, setIndicesData] = useState<FuturesData[]>([]);
    const [stockData, setStockData] = useState<FuturesData[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState('');

    useEffect(() => {
        // Set date on client only to avoid hydration mismatch
        setCurrentDate(new Date().toLocaleDateString('en-IN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }));

        const fetchFuturesData = async () => {
            try {
                const { fetchStockQuotes } = await import('@/lib/api');

                // 1. Fetch Indices
                // 1. Fetch Indices
                const indexSymbols = INDICES_SYMBOLS.map(i => i.symbol);
                const indexQuotes = await fetchStockQuotes(indexSymbols);

                const mappedIndices = indexQuotes.length > 0 ? indexQuotes.map(quote => {
                    const info = INDICES_SYMBOLS.find(s => s.symbol === quote.symbol) || { name: quote.symbol || 'Unknown' };
                    return {
                        symbol: info.name,
                        price: quote.c,
                        change: quote.d,
                        changePercent: quote.dp,
                        expiryDate: '',
                    };
                }) : MOCK_INDICES.map(m => ({ ...m, expiryDate: '' })); // Use mock if fetch fails/empty

                setIndicesData(mappedIndices);

                // 2. Fetch Stock Futures (Proxied by Spot)
                const stockQuotes = await fetchStockQuotes(STOCK_SYMBOLS);
                const mappedStocks = stockQuotes.length > 0 ? stockQuotes.map(quote => ({
                    symbol: (quote.symbol?.replace('.NS', '') || 'Unknown') + ' FUT',
                    price: quote.c * 1.005,
                    change: quote.d,
                    changePercent: quote.dp,
                    spotPrice: quote.c,
                    expiryDate: 'Current Month',
                    lotSize: 0
                })) : MOCK_STOCK_FUTURES; // Use mock if fetch fails/empty

                setStockData(mappedStocks);

                setLoading(false);
            } catch (error) {
                console.error('Failed to fetch futures data:', error);
                setLoading(false);
            }
        };

        if (isOnline) {
            fetchFuturesData();
        }
    }, [isOnline]);

    if (!isOnline) return <TryAgain />;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Futures Market</h1>
                    <p className={styles.subtitle}>
                        {currentDate} • Track live prices of Index and Stock Futures
                    </p>
                </div>
            </div>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
                    <div className="spinner" style={{ width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                    <style jsx>{` @keyframes spin { to { transform: rotate(360deg); } } `}</style>
                </div>
            ) : (
                <>
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>Index Futures (Spot Proxy)</h2>
                        <div className={styles.grid}>
                            {indicesData.map((item, index) => (
                                <FuturesCard key={index} {...item} />
                            ))}
                        </div>
                    </section>

                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>Stock Futures (Near Month)</h2>
                        <div className={styles.grid}>
                            {stockData.map((item, index) => (
                                <FuturesCard key={index} {...item} />
                            ))}
                        </div>
                    </section>
                </>
            )}
        </div>
    );
}

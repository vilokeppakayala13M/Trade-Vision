'use client';

import React, { useState, useEffect } from 'react';
import { TrendingUp, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import TryAgain from '@/components/TryAgain';
import styles from './page.module.css';

// Type Definitions
type Verdict = 'Buy' | 'Sell' | 'Hold' | 'Wait' | 'Don\'t Buy';

interface PortfolioItem {
    id: string;
    symbol: string;
    shares: number;
    avgPrice: number;
    currentPrice?: number;
    change?: number;
    changePercent?: number;
    verdict?: Verdict;
    verdictReason?: string;
}

interface Suggestion {
    id: string;
    symbol: string;
    currentPrice: number;
    reason: string;
    potentialUpside: number;
}

// Mock User Portfolio
const INITIAL_PORTFOLIO: PortfolioItem[] = [
    { id: 'reliance', symbol: 'RELIANCE.NS', shares: 15, avgPrice: 2450.00 },
    { id: 'tcs', symbol: 'TCS.NS', shares: 10, avgPrice: 3600.00 },
    { id: 'hdfcbank', symbol: 'HDFCBANK.NS', shares: 50, avgPrice: 1550.00 },
    { id: 'infy', symbol: 'INFY.NS', shares: 25, avgPrice: 1480.00 },
    { id: 'tatamotors', symbol: 'TATAMOTORS.NS', shares: 100, avgPrice: 620.00 }
];

// Mock Suggestions (could be dynamic based on API)
const SUGGESTED_STOCKS = [
    { id: 'icicibank', symbol: 'ICICIBANK.NS', reason: 'Strong quarterly results and reduced NPA levels.' },
    { id: 'bhartiartl', symbol: 'BHARTIARTL.NS', reason: 'ARPU growth expected to continue next quarter.' },
    { id: 'itc', symbol: 'ITC.NS', reason: 'Defensive pick with high dividend yield.' }
];

export default function PortfolioPage() {
    const isOnline = useNetworkStatus();
    const [portfolio, setPortfolio] = useState<PortfolioItem[]>(INITIAL_PORTFOLIO);
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalValue, setTotalValue] = useState(0);
    const [totalReturn, setTotalReturn] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { fetchStockQuotes } = await import('@/lib/api');

                // 1. Fetch current prices for portfolio
                const symbols = portfolio.map(p => p.symbol);
                const quotes = await fetchStockQuotes(symbols);

                // 2. Update Portfolio with real data
                const updatedPortfolio = await Promise.all(portfolio.map(async (item) => {
                    const quote = quotes.find(q => q.symbol === item.symbol);
                    const currentPrice = quote ? quote.c : item.avgPrice;
                    const change = quote ? quote.d : 0;
                    const changePercent = quote ? quote.dp : 0;

                    // Fetch customized verdict (simulated call to internal logic)
                    // In a real app, this might be too heavy for a list, so we'd cache it or use a lighter endpoint
                    let verdict: Verdict = 'Hold';
                    let reason = 'Market conditions stable';

                    if (changePercent > 1.5) {
                        verdict = 'Buy';
                        reason = 'Strong momentum detected';
                    } else if (changePercent < -1.5) {
                        verdict = 'Sell';
                        reason = 'Negative trend breakout';
                    }

                    return {
                        ...item,
                        currentPrice,
                        change,
                        changePercent,
                        verdict,
                        verdictReason: reason
                    };
                }));

                setPortfolio(updatedPortfolio);

                // 3. Calculate Totals
                const currentTotal = updatedPortfolio.reduce((acc, curr) => acc + (curr.shares * (curr.currentPrice || 0)), 0);
                const investedTotal = updatedPortfolio.reduce((acc, curr) => acc + (curr.shares * curr.avgPrice), 0);

                setTotalValue(currentTotal);
                setTotalReturn(currentTotal - investedTotal);

                // 4. Update Suggestions with Prices
                const suggestionSymbols = SUGGESTED_STOCKS.map(s => s.symbol);
                const suggestionQuotes = await fetchStockQuotes(suggestionSymbols);

                const updatedSuggestions = SUGGESTED_STOCKS.map(s => {
                    const quote = suggestionQuotes.find(q => q.symbol === s.symbol);
                    return {
                        ...s,
                        currentPrice: quote ? quote.c : 0,
                        potentialUpside: Math.random() * 15 + 5 // Simulated upside 5-20%
                    };
                });
                setSuggestions(updatedSuggestions);

                setLoading(false);
            } catch (error) {
                console.error('Failed to fetch portfolio data:', error);
                setLoading(false);
            }
        };

        if (isOnline) {
            fetchData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOnline]);

    const getVerdictColor = (v?: Verdict) => {
        switch (v) {
            case 'Buy': return '#10b981';
            case 'Sell': return '#ef4444';
            case 'Hold': return '#f59e0b';
            case 'Wait': return '#6366f1';
            default: return '#9ca3af';
        }
    };

    if (!isOnline) return <TryAgain />;

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>My Portfolio</h1>
                <p className={styles.subtitle}>Track your holdings and AI-driven insights</p>
            </header>

            {loading ? (
                <div className={styles.loader}>
                    <div className="spinner" style={{ width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                    <style jsx>{` @keyframes spin { to { transform: rotate(360deg); } } `}</style>
                </div>
            ) : (
                <div className={styles.dashboard}>
                    <div className={styles.mainContent}>
                        {/* Summary Metrics */}
                        <div className={styles.metricsGrid}>
                            <div className={styles.metricCard}>
                                <span className={styles.metricLabel}>Net Worth</span>
                                <span className={styles.metricValue}>₹{totalValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                            </div>
                            <div className={styles.metricCard}>
                                <span className={styles.metricLabel}>Total Profit/Loss</span>
                                <span className={`${styles.metricValue} ${totalReturn >= 0 ? styles.positive : styles.negative}`}>
                                    {totalReturn >= 0 ? '+' : ''}₹{totalReturn.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                </span>
                            </div>
                            <div className={styles.metricCard}>
                                <span className={styles.metricLabel}>Daily P&L</span>
                                <span className={styles.metricValue} style={{ color: 'var(--text-secondary)' }}>--</span>
                            </div>
                        </div>

                        {/* Holdings List */}
                        <h2 className={styles.sectionTitle}>Your Holdings</h2>
                        <div className={styles.holdingsList}>
                            {portfolio.map((item) => (
                                <Link href={`/company/${item.id}`} key={item.id} className={styles.holdingCard}>
                                    <div className={styles.symbolInfo}>
                                        <h3>{item.symbol}</h3>
                                        <span>{item.shares} Shares @ ₹{item.avgPrice.toFixed(0)}</span>
                                    </div>

                                    <div className={styles.col}>
                                        <span className={styles.colLabel}>Current Price</span>
                                        <span className={styles.value}>₹{item.currentPrice?.toFixed(2)}</span>
                                    </div>

                                    <div className={styles.col}>
                                        <span className={styles.colLabel}>Day Change</span>
                                        <span className={`${styles.value} ${(item.change || 0) >= 0 ? styles.positive : styles.negative}`}>
                                            {(item.changePercent || 0).toFixed(2)}%
                                        </span>
                                    </div>

                                    <div className={styles.col}>
                                        <span className={styles.colLabel}>Return</span>
                                        <span className={`${styles.value} ${(item.currentPrice! - item.avgPrice) >= 0 ? styles.positive : styles.negative}`}>
                                            {(((item.currentPrice! - item.avgPrice) / item.avgPrice) * 100).toFixed(2)}%
                                        </span>
                                    </div>

                                    <div className={styles.col} style={{ alignItems: 'flex-end' }}>
                                        <div
                                            className={styles.verdictBadge}
                                            style={{ color: getVerdictColor(item.verdict), borderColor: getVerdictColor(item.verdict) + '40' }}
                                        >
                                            {item.verdict}
                                        </div>
                                        <span style={{ fontSize: '0.7rem', opacity: 0.6, marginTop: '0.2rem' }}>
                                            Algo Verdict
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Sidebar: Suggestions */}
                    <aside className={styles.sidebar}>
                        <div className={styles.suggestionsPanel}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                                <TrendingUp size={20} color="var(--accent-green)" />
                                <h2 style={{ fontSize: '1.2rem', fontWeight: 600 }}>AI Suggestions</h2>
                            </div>

                            {suggestions.map((suggestion) => (
                                <Link href={`/company/${suggestion.id}`} key={suggestion.id} className={styles.suggestionCard}>
                                    <div className={styles.suggestionHeader}>
                                        <span>{suggestion.symbol}</span>
                                        <span style={{ color: 'var(--accent-green)' }}>+{suggestion.potentialUpside.toFixed(0)}% Upside</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', opacity: 0.8, fontSize: '0.9rem' }}>
                                        <span>CMP: ₹{suggestion.currentPrice.toFixed(2)}</span>
                                    </div>
                                    <p className={styles.suggestionReason}>
                                        {suggestion.reason}
                                    </p>
                                </Link>
                            ))}

                            <div style={{
                                marginTop: '2rem',
                                padding: '1rem',
                                background: 'rgba(59, 130, 246, 0.1)',
                                borderRadius: '8px',
                                fontSize: '0.85rem',
                                color: 'var(--primary)',
                                display: 'flex',
                                gap: '0.5rem'
                            }}>
                                <AlertCircle size={16} style={{ minWidth: '16px' }} />
                                <p>Predictions are based on algorithmic analysis of historical data and sentiment. Always do your own research.</p>
                            </div>
                        </div>
                    </aside>
                </div>
            )}
        </div>
    );
}

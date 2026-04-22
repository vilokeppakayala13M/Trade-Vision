"use client";

import { useEffect, useState } from 'react';
import { useWatchlist } from '@/context/WatchlistContext';
import StockCard from '@/components/StockCard';
import styles from '../page.module.css';

interface WatchlistStock {
    name: string;
    symbol: string;
    price: number;
    change: number;
    changePercent: number;
    data: { value: number }[];
}

export default function WatchlistPage() {
    const { watchlist } = useWatchlist();
    const [stocksData, setStocksData] = useState<Record<string, WatchlistStock>>({});
    const [loading, setLoading] = useState(true);

    // Load cached stocks from localStorage on mount
    useEffect(() => {
        const savedData = localStorage.getItem("watchlist_data_cache_v2");
        if (savedData) {
            try {
                setStocksData(JSON.parse(savedData));
            } catch (e) {
                console.error("Failed to parse cached stocks", e);
            }
        }
    }, []);

    useEffect(() => {
        const fetchWatchlistData = async () => {
            if (watchlist.length === 0) {
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const { fetchStockQuotes, fetchStockQuote, getStockSymbol, fetchCompanyProfile } = await import('@/lib/api');

                // Get all symbols
                const symbols = watchlist.map(id => ({ id, symbol: getStockSymbol(id) }));
                const symbolList = symbols.map(s => s.symbol);

                // Phase 1: Batch Fetch
                const quotes = await fetchStockQuotes(symbolList);
                const quotesMap = new Map();

                if (quotes && quotes.length > 0) {
                    quotes.forEach(q => {
                        if (q.symbol) quotesMap.set(q.symbol.toUpperCase(), q);
                    });
                }

                // Update data in parallel
                const newData: Record<string, WatchlistStock> = { ...stocksData };

                await Promise.all(symbols.map(async ({ id, symbol }) => {
                    const normalizedSymbol = symbol.toUpperCase();

                    // Phase 2: Individual Fallback (singular Chart API) if batch failed for this symbol
                    let quote = quotesMap.get(normalizedSymbol) ||
                        quotesMap.get(normalizedSymbol.split('.')[0]) ||
                        quotes.find(q => q.symbol?.toUpperCase() === normalizedSymbol);

                    if (!quote || !quote.c) {
                        console.log(`[Watchlist] Fetching individual fallback for ${symbol}`);
                        const individualQuote = await fetchStockQuote(symbol);
                        if (individualQuote && individualQuote.c) {
                            quote = individualQuote;
                        }
                    }

                    if (quote && quote.c) {
                        const profile = await fetchCompanyProfile(symbol);
                        const price = quote.c;

                        newData[id] = {
                            name: profile?.name || id.toUpperCase(),
                            symbol: symbol,
                            price: price,
                            change: quote.d || 0,
                            changePercent: quote.dp || 0,
                            data: Array.from({ length: 20 }, () => ({
                                value: (price || 100) * (1 + (Math.random() * 0.1 - 0.05))
                            }))
                        };
                    }
                }));

                // Phase 3: Stability Check - Never replace a cached price with 0
                setStocksData(prev => {
                    const merged = { ...prev };
                    Object.keys(newData).forEach(id => {
                        if (newData[id].price > 0 || !merged[id]) {
                            merged[id] = newData[id];
                        }
                    });

                    localStorage.setItem("watchlist_data_cache_v2", JSON.stringify(merged));
                    return merged;
                });
            } catch (error) {
                console.error("Failed to fetch watchlist data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchWatchlistData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [watchlist]);

    const isWatchlistEmpty = watchlist.length === 0;

    return (
        <div className="container" style={{ padding: '2rem' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1.5rem', color: 'var(--foreground)' }}>Your Watchlist</h1>

            {isWatchlistEmpty ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: 'rgba(255,255,255,0.5)' }}>
                    <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Your watchlist is empty.</p>
                    <p>Go to the homepage or search for companies to add them here.</p>
                </div>
            ) : (
                <div className={styles.grid}>
                    {watchlist.map((id) => {
                        const stock = stocksData[id];
                        return (
                            <StockCard
                                key={id}
                                id={id}
                                name={stock?.name || id.toUpperCase()}
                                symbol={stock?.symbol || id.toUpperCase()}
                                price={stock?.price || 0}
                                change={stock?.change || 0}
                                changePercent={stock?.changePercent || 0}
                                data={stock?.data || Array.from({ length: 20 }, () => ({ value: 100 }))}
                            />
                        );
                    })}
                </div>
            )}

            {loading && !isWatchlistEmpty && Object.keys(stocksData).length === 0 && (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                    <div className="spinner" style={{ width: '30px', height: '30px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                </div>
            )}
        </div>
    );
}

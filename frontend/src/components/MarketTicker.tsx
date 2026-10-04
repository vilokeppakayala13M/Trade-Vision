"use client";

import React from 'react';
import { motion } from 'framer-motion';
import styles from './MarketTicker.module.css';

const marketData = [
    { symbol: 'NIFTY', price: '25,884.80', change: '-74.70', percent: '(0.29%)', isPositive: false },
    { symbol: 'SENSEX', price: '84,587.01', change: '-313.70', percent: '(0.37%)', isPositive: false },
    { symbol: 'BANKNIFTY', price: '53,820.30', change: '-15.05', percent: '(0.03%)', isPositive: false },
    { symbol: 'MIDCPNIFTY', price: '13,806.70', change: '68.20', percent: '(0.50%)', isPositive: true },
    { symbol: 'FINNIFTY', price: '27,409.40', change: '-313.70', percent: '(0.37%)', isPositive: false },
];

export default function MarketTicker() {
    const [tickerData, setTickerData] = React.useState(marketData);

    React.useEffect(() => {
        // Load from cache or use default
        const saved = localStorage.getItem("ticker_data_cache");
        if (saved) {
            try {
                setTickerData(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse ticker cache", e);
            }
        }

        const fetchMarketData = async () => {
            try {
                const { fetchStockQuotes } = await import('@/lib/api');

                const symbols = [
                    { display: 'NIFTY', symbol: '^NSEI' },
                    { display: 'SENSEX', symbol: '^BSESN' },
                    { display: 'BANKNIFTY', symbol: '^NSEBANK' },
                    { display: 'MIDCPNIFTY', symbol: '^NSEMDCP50' },
                    { display: 'FINNIFTY', symbol: 'NIFTY_FIN_SERVICE.NS' }
                ];

                const quotes = await fetchStockQuotes(symbols.map(s => s.symbol));

                if (quotes && quotes.length > 0) {
                    const newData = symbols.map(s => {
                        const quote = quotes.find(q => q.symbol === s.symbol);
                        if (quote && typeof quote.c === 'number' && typeof quote.d === 'number') {
                            return {
                                symbol: s.display,
                                price: quote.c.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                                change: quote.d.toFixed(2),
                                percent: `(${(quote.dp || 0).toFixed(2)}%)`,
                                isPositive: quote.d >= 0
                            };
                        }
                        // Try to find in existing state to keep old data if current fetch failed for this symbol
                        return tickerData.find(m => m.symbol === s.display) ||
                            marketData.find(m => m.symbol === s.display) || {
                            symbol: s.display, price: '0.00', change: '0.00', percent: '(0.00%)', isPositive: true
                        };
                    });

                    const finalData = [...newData, ...newData, ...newData, ...newData];
                    setTickerData(finalData);
                    localStorage.setItem("ticker_data_cache", JSON.stringify(finalData));
                }
            } catch (error) {
                console.warn('Error fetching market ticker data (using cached/mock):', error);
            }
        };

        fetchMarketData();
        const interval = setInterval(fetchMarketData, 60000); // Update every minute
        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className={styles.tickerContainer}>
            <div className={styles.container} style={{ overflow: 'hidden' }}>
                <motion.div
                    className={styles.tickerContent}
                    animate={{ x: ["0%", "-50%"] }}
                    transition={{
                        repeat: Infinity,
                        ease: "linear",
                        duration: 30
                    }}
                    style={{ width: "fit-content" }}
                >
                    {tickerData.map((item, index) => (
                        <div key={index} className={styles.tickerItem} style={{ marginRight: '2rem' }}>
                            <span className={styles.symbol}>{item.symbol}</span>
                            <span className={styles.price}>{item.price}</span>
                            <span className={`${styles.change} ${item.isPositive ? styles.positive : styles.negative}`}>
                                {item.change} {item.percent}
                            </span>
                        </div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
}

"use client";

import { useState, useEffect, memo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, Heart } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { useWatchlist } from '@/context/WatchlistContext';
import styles from './StockCard.module.css';

interface StockCardProps {
    id: string;
    name: string;
    symbol: string;
    price: number;
    change: number;
    changePercent: number;
    data: { value: number }[];
}

function StockCard({ id, name, symbol, price, change, changePercent, data }: StockCardProps) {
    const [currentPrice, setCurrentPrice] = useState(price);
    const [currentPercent, setCurrentPercent] = useState(changePercent);
    const [chartData, setChartData] = useState(data);
    const [isMarketOpen, setIsMarketOpen] = useState(false);
    const isPositive = change >= 0;
    const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();

    // Update when props change (real API data arrives)
    useEffect(() => {
        if (price > 0) {
            setCurrentPrice(price);
            setCurrentPercent(changePercent);
            setChartData(data);
        }
    }, [price, changePercent, data]);

    // Check market status
    useEffect(() => {
        const checkMarketStatus = async () => {
            const { getMarketStatus } = await import('@/lib/marketStatus');
            const status = getMarketStatus();
            setIsMarketOpen(status.isOpen);
        };

        checkMarketStatus();
        const interval = setInterval(checkMarketStatus, 60000); // Check every minute
        return () => clearInterval(interval);
    }, []);

    // Only fluctuate when market is open
    useEffect(() => {
        if (!isMarketOpen || price === 0) {
            return; // Don't fluctuate if market is closed or price not loaded
        }

        // Fluctuate price and chart every 2-4 seconds
        const interval = setInterval(() => {
            const fluctuation = (Math.random() - 0.5) * (price * 0.002); // ±0.2% fluctuation
            const newPrice = currentPrice + fluctuation;
            const newChange = newPrice - price;
            const newPercent = (newChange / price) * 100;

            setCurrentPrice(newPrice);
            setCurrentPercent(newPercent);

            // Update chart data - shift left and add new point
            setChartData((prevData: { value: number }[]) => {
                const newData = [...prevData.slice(1)]; // Remove first point
                const lastValue = prevData[prevData.length - 1].value;
                const chartFluctuation = (Math.random() - 0.5) * (price * 0.01);
                newData.push({ value: lastValue + chartFluctuation });
                return newData;
            });
        }, Math.random() * 2000 + 2000); // Random interval between 2-4 seconds

        return () => clearInterval(interval);
    }, [isMarketOpen, currentPrice, price]);

    return (
        <Link href={`/company/${id}`} style={{ textDecoration: 'none' }}>
            <motion.div
                className={styles.card}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{
                    y: -8,
                    scale: 1.02,
                    boxShadow: "0 12px 32px rgba(0, 0, 0, 0.15)",
                    borderColor: "var(--primary)"
                }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.3 }}
            >
                <div className={styles.header}>
                    <div className={styles.info}>
                        <h3>{symbol}</h3>
                        <p>{name}</p>
                    </div>
                    <div className={styles.price}>
                        <h3>{currentPrice > 0 ? `₹${currentPrice.toFixed(2)}` : 'Loading...'}</h3>
                        {currentPrice > 0 && (
                            <span className={isPositive ? styles.positive : styles.negative}>
                                {isPositive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                                {Math.abs(currentPercent).toFixed(2)}%
                            </span>
                        )}
                    </div>
                </div>
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (isInWatchlist(id)) {
                            removeFromWatchlist(id);
                        } else {
                            addToWatchlist(id);
                        }
                    }}
                    style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        background: 'rgba(255,255,255,0.1)',
                        border: 'none',
                        borderRadius: '50%',
                        padding: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 10,
                        color: isInWatchlist(id) ? '#ef4444' : 'rgba(255,255,255,0.6)',
                        transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                >
                    <Heart size={18} fill={isInWatchlist(id) ? 'currentColor' : 'none'} />
                </button>
                <div className={styles.chart}>
                    <ResponsiveContainer width="100%" height={60}>
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id={`gradient-${id}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <Area
                                type="monotone"
                                dataKey="value"
                                stroke={isPositive ? "#10b981" : "#ef4444"}
                                fillOpacity={1}
                                fill={`url(#gradient-${id})`}
                                strokeWidth={2}
                                animationDuration={800}
                                isAnimationActive={true}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>
        </Link>
    );
}

export default memo(StockCard);

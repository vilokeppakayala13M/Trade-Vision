"use client";

import { useState, useEffect, memo, useRef } from 'react';
import Link from 'next/link';
import { motion, useAnimation } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, Heart } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';
import { useWatchlist } from '@/context/WatchlistContext';
import styles from './StockRow.module.css';

interface StockRowProps {
    id: string;
    name: string;
    symbol: string;
    price: number;
    change: number;
    changePercent: number;
    data: { value: number }[];
}

function StockRow({ id, name, symbol, price, change, changePercent, data }: StockRowProps) {
    const [currentPrice, setCurrentPrice] = useState(price);
    const [currentPercent, setCurrentPercent] = useState(changePercent);
    const [chartData, setChartData] = useState(data);
    const [isMarketOpen, setIsMarketOpen] = useState(false);
    const isPositive = currentPercent >= 0;
    const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();
    
    const controls = useAnimation();
    const prevPriceRef = useRef(price);

    useEffect(() => {
        if (price > 0) {
            if (prevPriceRef.current && price !== prevPriceRef.current) {
                const isUp = price > prevPriceRef.current;
                controls.start({
                    backgroundColor: isUp ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    transition: { duration: 0.1 }
                }).then(() => {
                    controls.start({
                        backgroundColor: 'var(--surface)',
                        transition: { duration: 0.5 }
                    });
                });
            }
            prevPriceRef.current = price;
            
            setCurrentPrice(price);
            setCurrentPercent(changePercent);
            setChartData(data);
        }
    }, [price, changePercent, data, controls]);

    // Check market status
    useEffect(() => {
        const checkMarketStatus = async () => {
            const { getMarketStatus } = await import('@/lib/marketStatus');
            const status = getMarketStatus();
            setIsMarketOpen(status.isOpen);
        };

        checkMarketStatus();
        const interval = setInterval(checkMarketStatus, 60000);
        return () => clearInterval(interval);
    }, []);

    // Random fluctuation
    useEffect(() => {
        if (!isMarketOpen || price === 0) return;

        const interval = setInterval(() => {
            const fluctuation = (Math.random() - 0.5) * (price * 0.002);
            const newPrice = currentPrice + fluctuation;
            const newChange = newPrice - price;
            const newPercent = (newChange / price) * 100;

            const isUp = newPrice > currentPrice;
            controls.start({
                backgroundColor: isUp ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                transition: { duration: 0.1 }
            }).then(() => {
                controls.start({
                    backgroundColor: 'var(--surface)',
                    transition: { duration: 0.5 }
                });
            });

            setCurrentPrice(newPrice);
            setCurrentPercent(newPercent);

            setChartData((prevData) => {
                const newData = [...prevData.slice(1)];
                const lastValue = prevData[prevData.length - 1].value;
                const chartFluctuation = (Math.random() - 0.5) * (price * 0.01);
                newData.push({ value: lastValue + chartFluctuation });
                return newData;
            });
        }, Math.random() * 2000 + 2000);

        return () => clearInterval(interval);
    }, [isMarketOpen, currentPrice, price, controls]);

    return (
        <Link href={`/company/${id}`} style={{ textDecoration: 'none' }}>
            <motion.div
                className={styles.row}
                animate={controls}
                whileHover={{
                    scale: 1.01,
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                    borderColor: "var(--primary)"
                }}
            >
                <div className={styles.info}>
                    <h3 className={styles.symbol}>{symbol}</h3>
                    <p className={styles.name}>{name}</p>
                </div>
                
                <div className={styles.chart}>
                    <ResponsiveContainer width="100%" height={40}>
                        <AreaChart data={chartData}>
                            <YAxis hide={true} domain={['dataMin - 2', 'dataMax + 2']} />
                            <defs>
                                <linearGradient id={`gradient-${id}-row`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <Area
                                type="monotone"
                                dataKey="value"
                                stroke={isPositive ? "#10b981" : "#ef4444"}
                                fillOpacity={1}
                                fill={`url(#gradient-${id}-row)`}
                                strokeWidth={2}
                                animationDuration={800}
                                isAnimationActive={true}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div className={styles.priceContainer}>
                    <h3 className={styles.price}>{currentPrice > 0 ? `₹${currentPrice.toFixed(2)}` : 'Loading...'}</h3>
                    {currentPrice > 0 && (
                        <span 
                            className={isPositive ? styles.positive : styles.negative}
                            aria-label={`${symbol} ${isPositive ? 'up' : 'down'} ${Math.abs(currentPercent).toFixed(2)}%`}
                        >
                            {isPositive ? <ArrowUpRight size={14} aria-hidden="true" /> : <ArrowDownRight size={14} aria-hidden="true" />}
                            {Math.abs(currentPercent).toFixed(2)}%
                        </span>
                    )}
                </div>

                <div className={styles.actions}>
                    <button
                        className={styles.watchlistBtn}
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (isInWatchlist(id)) {
                                removeFromWatchlist(id);
                            } else {
                                addToWatchlist(id);
                            }
                        }}
                        aria-label={isInWatchlist(id) ? 'Remove from watchlist' : 'Add to watchlist'}
                    >
                        <Heart size={18} fill={isInWatchlist(id) ? 'var(--accent-red)' : 'none'} color={isInWatchlist(id) ? 'var(--accent-red)' : 'var(--text-secondary)'} aria-hidden="true" />
                    </button>
                </div>
            </motion.div>
        </Link>
    );
}

export default memo(StockRow);

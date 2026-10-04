"use client";

import { useState, useEffect, memo, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, Heart } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';
import { useWatchlist } from '@/context/WatchlistContext';
import { useIsMobile } from '@/hooks/useMediaQuery';
import styles from './StockCard.module.css';
import StockCardSkeleton from './skeletons/StockCardSkeleton';
import { trackStockView } from '@/lib/analytics';

interface StockCardProps {
    id: string;
    name: string;
    symbol: string;
    price: number;
    change: number;
    changePercent: number;
    data: { value: number }[];
    type?: string;
}

function StockCard({ id, name, symbol, price, change, changePercent, data, type }: StockCardProps) {
    const [currentPrice, setCurrentPrice] = useState(price);
    const [currentPercent, setCurrentPercent] = useState(changePercent);
    const [chartData, setChartData] = useState(data);
    const [isMarketOpen, setIsMarketOpen] = useState(false);
    const isPositive = currentPercent >= 0;
    const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();
    const isMobile = useIsMobile();
    
    const prevPriceRef = useRef(price);
    const [tickClass, setTickClass] = useState<string>('');

    useEffect(() => {
        if (price > 0) {
            const newPrice = price;
            if (newPrice > prevPriceRef.current) {
                setTickClass('tick-up');
            } else if (newPrice < prevPriceRef.current) {
                setTickClass('tick-down');
            }
            prevPriceRef.current = newPrice;
            
            setCurrentPrice(newPrice);
            setCurrentPercent(changePercent);
            setChartData(data);
        }
    }, [price, changePercent, data]);

    useEffect(() => {
        if (!tickClass) return;
        const t = setTimeout(() => setTickClass(''), 700);
        return () => clearTimeout(t);
    }, [tickClass]);

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

    useEffect(() => {
        if (!isMarketOpen || price === 0) return;

        const interval = setInterval(() => {
            const fluctuation = (Math.random() - 0.5) * (price * 0.002);
            const newPrice = currentPrice + fluctuation;
            const newChange = newPrice - price;
            const newPercent = (newChange / price) * 100;

            if (newPrice > prevPriceRef.current) {
                setTickClass('tick-up');
            } else if (newPrice < prevPriceRef.current) {
                setTickClass('tick-down');
            }
            prevPriceRef.current = newPrice;

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
    }, [isMarketOpen, currentPrice, price]);

    const handleDragEnd = (event: any, info: any) => {
        if (info.offset.x > 100) {
            if (!isInWatchlist(id)) {
                addToWatchlist(id);
            }
        }
    };

    const handleWatchlistClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (isInWatchlist(id)) {
            removeFromWatchlist(id);
        } else {
            addToWatchlist(id);
        }
    };

    const dragProps = isMobile ? {
        drag: "x" as const,
        dragConstraints: { left: 0, right: 0 },
        onDragEnd: handleDragEnd
    } : {};

    if (price === 0) {
        return <StockCardSkeleton />;
    }

    return (
        <motion.div
            className={styles.cardWrapper}
            {...dragProps}
        >
            <Link 
                href={`/company/${id}`} 
                style={{ textDecoration: 'none', display: 'block' }}
                onClick={() => trackStockView(symbol)}
            >
                <motion.div
                    className={styles.card}
                    whileHover={!isMobile ? { y: -6, transition: { type: 'spring', stiffness: 400, damping: 25 } } : {}}
                    whileTap={{ scale: 0.97, transition: { duration: 0.1 } }}
                >
                    <div className={styles.header}>
                        <div className={styles.info}>
                            <h3 className={styles.symbol}>{symbol}</h3>
                            <p className={styles.name}>{name}</p>
                        </div>
                        <div className={styles.priceContainer}>
                            <h3 className={`${styles.priceText} ${tickClass}`}>{currentPrice > 0 ? `₹${currentPrice.toFixed(2)}` : 'Loading...'}</h3>
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
                    </div>
                    
                    <div className={styles.chart}>
                        <ResponsiveContainer width="100%" height={60}>
                            <AreaChart data={chartData}>
                                <YAxis hide={true} domain={['dataMin - 2', 'dataMax + 2']} />
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

                    <div className={styles.footer}>
                        <span className={styles.typeBadge}>{type || 'NSE'}</span>
                        <button 
                            className={[styles.watchlistBtn, isInWatchlist(id) ? styles.active : ''].join(' ')} 
                            onClick={handleWatchlistClick} 
                            aria-label={isInWatchlist(id) ? 'Remove from watchlist' : 'Add to watchlist'}
                        >
                            <Heart size={15} fill={isInWatchlist(id) ? 'currentColor' : 'none'} />
                        </button>
                    </div>
                </motion.div>
            </Link>
        </motion.div>
    );
}

export default memo(StockCard);

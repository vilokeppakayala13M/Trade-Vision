'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import styles from './FuturesCard.module.css';

interface FuturesCardProps {
    symbol: string;
    expiryDate: string;
    price: number;
    change: number;
    changePercent: number;
    lotSize?: number;
    spotPrice?: number;
    oi?: string; // Open Interest
}

export default function FuturesCard({
    symbol,
    expiryDate,
    price,
    change,
    changePercent,
    lotSize,
    spotPrice,
    oi
}: FuturesCardProps) {
    const isPositive = change >= 0;
    const premium = spotPrice ? price - spotPrice : 0;
    const isPremium = premium > 0;

    return (
        <motion.div
            className={styles.card}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
        >
            <div className={styles.header}>
                <div>
                    <div className={styles.symbol}>{symbol}</div>
                    {lotSize && <div className={styles.lotSize}>Lot Size: {lotSize}</div>}
                </div>
                {expiryDate && <div className={styles.expiry}>{expiryDate}</div>}
            </div>

            <div className={styles.priceSection}>
                <span className={styles.price}>₹{price.toFixed(2)}</span>
                <div className={`${styles.change} ${isPositive ? styles.positive : styles.negative}`}>
                    {isPositive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                    {Math.abs(change).toFixed(2)} ({Math.abs(changePercent).toFixed(2)}%)
                </div>
            </div>

            <div className={styles.meta}>
                {oi && (
                    <div className={styles.metaItem}>
                        <span className={styles.label}>Open Interest</span>
                        <span className={styles.value}>{oi}</span>
                    </div>
                )}
                {spotPrice && (
                    <div className={styles.metaItem} style={{ alignItems: 'flex-end', flex: 1 }}>
                        <span className={styles.label}>Prem/Disc</span>
                        <span className={`${styles.value} ${isPremium ? styles.premium : styles.discount}`}>
                            {isPremium ? '+' : ''}{premium.toFixed(2)}
                        </span>
                    </div>
                )}
            </div>
        </motion.div>
    );
}

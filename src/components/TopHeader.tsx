"use client";

import { Search, Bell, Loader2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import styles from './TopHeader.module.css';
import { getMarketStatus } from '@/lib/marketStatus';
import { searchStocks, SearchResult } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';

export default function TopHeader() {
    const [status, setStatus] = useState({ isOpen: false, message: 'Loading...' });
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const router = useRouter();
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const market = getMarketStatus();
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setStatus({
            isOpen: market.isOpen,
            message: market.isOpen ? 'Market Open' : 'Market Closed'
        });

        // Click outside listener
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.trim().length >= 2) {
                setLoading(true);
                const data = await searchStocks(query);
                setResults(data);
                setLoading(false);
                setShowDropdown(true);
            } else {
                setResults([]);
                setShowDropdown(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    const handleResultClick = (symbol: string) => {
        router.push(`/company/${symbol}`);
        setShowDropdown(false);
        setQuery('');
    };

    return (
        <header className={styles.header}>
            <div className={styles.searchContainer} ref={dropdownRef}>
                <Search className={styles.searchIcon} size={18} />
                <input
                    type="text"
                    placeholder="Search stocks, ETFs, news..."
                    className={styles.searchInput}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => query.trim().length >= 2 && setShowDropdown(true)}
                />

                {loading && (
                    <div className={styles.loader}>
                        <Loader2 size={16} className="spin" />
                    </div>
                )}

                <AnimatePresence>
                    {showDropdown && results.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className={styles.dropdown}
                        >
                            {results.map((result, idx) => (
                                <div
                                    key={idx}
                                    className={styles.resultItem}
                                    onClick={() => handleResultClick(result.symbol)}
                                >
                                    <div className={styles.resultMain}>
                                        <span className={styles.symbol}>{result.symbol}</span>
                                        <span className={styles.name}>{result.shortname}</span>
                                    </div>
                                    <div className={styles.resultMeta}>
                                        <span className={styles.exchange}>{result.exchange}</span>
                                        <span className={styles.type}>{result.typeDisp}</span>
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className={styles.actions}>
                <div className={`${styles.marketStatus} ${!status.isOpen ? styles.closed : ''}`}>
                    <div className={styles.dot} />
                    <span>{status.message}</span>
                </div>

                <button className={styles.iconBtn}>
                    <Bell size={20} />
                </button>
            </div>
        </header>
    );
}

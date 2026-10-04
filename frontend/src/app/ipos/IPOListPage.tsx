'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useStaggeredEntrance } from '@/hooks/useStaggeredEntrance';
import styles from './page.module.css';
import { IPO } from '@/lib/ipoData';

type TabType = 'open' | 'closed' | 'listed' | 'upcoming' | 'applied';

export default function IPOListPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<TabType>('open');
    const [liveData, setLiveData] = useState<Record<string, { price: number, change: number, percent: number }>>({});
    const [loading, setLoading] = useState(false);
    
    // Dynamic IPO Data State
    const [ipoData, setIpoData] = useState<{
        open: IPO[],
        closed: IPO[],
        listed: IPO[],
        upcoming: IPO[]
    }>({ open: [], closed: [], listed: [], upcoming: [] });
    const [dataLoading, setDataLoading] = useState(true);

    const containerRef = useRef<HTMLTableSectionElement>(null);
    const isVisible = useStaggeredEntrance(containerRef);

    useEffect(() => {
        const fetchAllIPOs = async () => {
            setDataLoading(true);
            try {
                const response = await fetch('/api/ipos');
                if (response.ok) {
                    const data = await response.json();
                    setIpoData(data);
                }
            } catch (error) {
                console.error("Failed to fetch IPO data", error);
            } finally {
                setDataLoading(false);
            }
        };

        fetchAllIPOs();
    }, []);

    const getCurrentIPOs = () => {
        switch (activeTab) {
            case 'open':
                return ipoData.open;
            case 'closed':
                return ipoData.closed;
            case 'listed':
                return ipoData.listed;
            case 'upcoming':
                return ipoData.upcoming;
            case 'applied':
                return [];
            default:
                return [];
        }
    };

    const getTableHeaders = () => {
        switch (activeTab) {
            case 'open':
                return ['Company', 'Closing date', 'Overall subscription'];
            case 'closed':
                return ['Company', 'Listing date', 'Overall Subscription'];
            case 'listed':
                return ['Company', 'Listing date', 'Current Price', 'Overall Subscription', 'Returns'];
            case 'upcoming':
                return ['Company', 'Opening date'];
            default:
                return [];
        }
    };

    // Fetch live data for listed IPOs
    useEffect(() => {
        const fetchLivePrices = async () => {
            if (activeTab !== 'listed') return;

            const symbols = ipoData.listed
                .filter(ipo => ipo.symbol)
                .map(ipo => ipo.symbol as string);

            if (symbols.length === 0) return;

            setLoading(true);
            try {
                const { fetchStockQuotes } = await import('@/lib/api');
                const quotes = await fetchStockQuotes(symbols);

                const newLiveData: Record<string, { price: number, change: number, percent: number }> = {};

                quotes.forEach(quote => {
                    if (quote.symbol && quote.c) {
                        newLiveData[quote.symbol] = {
                            price: quote.c,
                            change: quote.d,
                            percent: quote.dp
                        };
                    }
                });

                setLiveData(newLiveData);
            } catch (error) {
                console.error("Failed to fetch IPO prices", error);
            } finally {
                setLoading(false);
            }
        };

        fetchLivePrices();
        // Poll every minute if on listed tab
        const interval = setInterval(fetchLivePrices, 60000);
        return () => clearInterval(interval);
    }, [activeTab, ipoData.listed]);

    const handleRowClick = (id: string) => {
        router.push(`/ipos/${id}`);
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>
                {activeTab === 'open' && 'IPO - Initial Public Offering'}
                {activeTab === 'closed' && 'Recently Closed IPOs'}
                {activeTab === 'listed' && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        Recently Listed IPOs
                        {loading && <span style={{ fontSize: '0.8rem', color: '#666', fontWeight: 'normal' }}>(Updating...)</span>}
                    </span>
                )}
                {activeTab === 'upcoming' && 'Upcoming IPOs in 2025'}
                {activeTab === 'applied' && 'IPO - Initial Public Offering'}
            </h1>

            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${activeTab === 'open' ? styles.active : ''}`}
                    onClick={() => setActiveTab('open')}
                >
                    Open
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'closed' ? styles.active : ''}`}
                    onClick={() => setActiveTab('closed')}
                >
                    Closed
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'listed' ? styles.active : ''}`}
                    onClick={() => setActiveTab('listed')}
                >
                    Listed
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'upcoming' ? styles.active : ''}`}
                    onClick={() => setActiveTab('upcoming')}
                >
                    Upcoming
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'applied' ? styles.active : ''}`}
                    onClick={() => setActiveTab('applied')}
                >
                    Applied
                </button>
            </div>

            {
                activeTab === 'applied' ? (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>📋</div>
                        <p className={styles.emptyText}>Currently, you have no active applications</p>
                        <button className={styles.exploreBtn}>Explore Open IPOs</button>
                    </div>
                ) : dataLoading ? (
                    <div className={styles.emptyState} style={{ marginTop: '20px', padding: '20px' }}>
                        <div className="spinner" style={{ width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
                        <p className={styles.emptyText} style={{ marginTop: '10px' }}>Fetching live IPOs...</p>
                        <style>{` @keyframes spin { to { transform: rotate(360deg); } } `}</style>
                    </div>
                ) : (
                    <div className={styles.tableContainer}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    {getTableHeaders().map((header, index) => (
                                        <th key={index}>{header}</th>
                                    ))}
                                </tr>
                            </thead>
                            <motion.tbody
                                ref={containerRef}
                                variants={{
                                    hidden: {},
                                    visible: {
                                        transition: {
                                            staggerChildren: 0.05,
                                            delayChildren: 0.05
                                        }
                                    }
                                }}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, amount: 0.1 }}
                            >
                                {getCurrentIPOs().map((ipo) => {
                                    const live = ipo.symbol ? liveData[ipo.symbol] : null;
                                    let returnsDisplay = ipo.returns;
                                    let priceDisplay = ipo.status === 'Listed' ? 'Listed' : '--';

                                    if (live && ipo.issuePrice) {
                                        priceDisplay = `₹${live.price.toFixed(2)}`;
                                        const gain = ((live.price - ipo.issuePrice) / ipo.issuePrice) * 100;
                                        if (gain >= 0) {
                                            returnsDisplay = `${gain.toFixed(2)}% gains`;
                                        } else {
                                            returnsDisplay = `${Math.abs(gain).toFixed(2)}% loss`;
                                        }
                                    }

                                    const isPositive = returnsDisplay?.includes('gains') || (live && live.price >= (ipo.issuePrice || 0));

                                    return (
                                        <motion.tr
                                            key={ipo.id}
                                            onClick={() => handleRowClick(ipo.id)}
                                            style={{ cursor: 'pointer' }}
                                            className={styles.row}
                                            variants={{
                                                hidden: { opacity: 0, y: 16 },
                                                visible: {
                                                    opacity: 1,
                                                    y: 0,
                                                    transition: {
                                                        duration: 0.25,
                                                        ease: [0.16, 1, 0.3, 1]
                                                    }
                                                }
                                            }}
                                        >
                                            <td>
                                                <div className={styles.companyCell}>
                                                    <div className={styles.companyLogo}>{ipo.company.charAt(0)}</div>
                                                    <div>
                                                        {ipo.category && <div className={styles.category}>{ipo.category}</div>}
                                                        <div className={styles.companyName}>{ipo.company}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>{ipo.date}</td>

                                            {activeTab === 'listed' && (
                                                <td>{priceDisplay}</td>
                                            )}

                                            {(activeTab === 'open' || activeTab === 'closed' || activeTab === 'listed') && (
                                                <td>{ipo.subscription}</td>
                                            )}

                                            {activeTab === 'listed' && (
                                                <td className={isPositive ? styles.positive : styles.negative}>
                                                    {returnsDisplay}
                                                </td>
                                            )}
                                        </motion.tr>
                                    );
                                })}
                            </motion.tbody>
                        </table>
                        {getCurrentIPOs().length === 0 && (
                            <div className={styles.emptyState} style={{ marginTop: '20px', padding: '20px' }}>
                                <p className={styles.emptyText}>No IPOs found in this category.</p>
                            </div>
                        )}
                    </div>
                )
            }
        </div >
    );
}

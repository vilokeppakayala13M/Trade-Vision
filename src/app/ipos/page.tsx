'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import { openIPOs, closedIPOs, listedIPOs, upcomingIPOs } from '@/lib/ipoData';

type TabType = 'open' | 'closed' | 'listed' | 'upcoming' | 'applied';

export default function IPOsPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<TabType>('open');
    const [liveData, setLiveData] = useState<Record<string, { price: number, change: number, percent: number }>>({});
    const [loading, setLoading] = useState(false);

    const getCurrentIPOs = () => {
        switch (activeTab) {
            case 'open':
                return openIPOs;
            case 'closed':
                return closedIPOs;
            case 'listed':
                return listedIPOs;
            case 'upcoming':
                return upcomingIPOs;
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

            const symbols = listedIPOs
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
    }, [activeTab]);

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
                            <tbody>
                                {getCurrentIPOs().map((ipo) => {
                                    const live = ipo.symbol ? liveData[ipo.symbol] : null;
                                    let returnsDisplay = ipo.returns;
                                    let priceDisplay = ipo.status === 'Listed' ? 'Listed' : '--';

                                    if (live && ipo.issuePrice) {
                                        priceDisplay = `₹${live.price.toFixed(2)}`;
                                        const gain = ((live.price - ipo.issuePrice) / ipo.issuePrice) * 100;
                                        returnsDisplay = `${gain.toFixed(2)}%`;
                                    }

                                    const isPositive = returnsDisplay?.includes('gains') || (live && live.price > (ipo.issuePrice || 0));

                                    return (
                                        <tr
                                            key={ipo.id}
                                            onClick={() => handleRowClick(ipo.id)}
                                            style={{ cursor: 'pointer' }}
                                            className={styles.row}
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
                                        </tr>
                                    );
                                })}
                            </tbody>
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

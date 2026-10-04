'use client';

import React, { useState } from 'react';
import { TrendingUp } from 'lucide-react';
import News from '@/components/company/News';
import TryAgain from '@/components/TryAgain';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import styles from './page.module.css';


const TRENDING_TOPICS = [
    { title: 'Budget 2024 Expectations', count: '12k reads' },
    { title: 'HDFC Bank Merger Impact', count: '8.5k reads' },
    { title: 'EV Sector Boom', count: '6k reads' },
    { title: 'Semiconductor PLI Scheme', count: '5.2k reads' }
];

interface NewsItem {
    id: number;
    title: string;
    source: string;
    time: string;
    summary: string;
    url: string;
    description: string;
}

export default function NewsPage() {
    const isOnline = useNetworkStatus();
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);

    React.useEffect(() => {
        const loadNews = async () => {
            try {
                const { fetchMarketNews } = await import('@/lib/api');
                const data = await fetchMarketNews();

                // Transform Finnhub data to our UI format
                // Finnhub returns: { category, datetime, headline, id, image, related, source, summary, url }
                const formattedNews = data.map((item) => ({
                    id: Number(item.id) || Math.floor(Math.random() * 100000),
                    title: item.headline || 'No Title',
                    source: item.source || 'Unknown',
                    time: new Date((item.datetime || 0) * 1000).toLocaleDateString('en-US', { hour: 'numeric', minute: 'numeric' }),
                    summary: item.summary || '',
                    url: item.url || '#',
                    description: item.summary || ''
                }));

                setNews(formattedNews);
            } catch (error) {
                console.error("Failed to load news", error);
            } finally {
                setLoading(false);
            }
        };

        if (isOnline) {
            loadNews();
        }
    }, [isOnline]);

    if (!isOnline) return <TryAgain />;

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Market News</h1>
                <p className={styles.subtitle}>Stay updated with the latest financial headlines and global market trends</p>
            </header>

            <div className={styles.newsGrid}>
                <div className={styles.mainNews}>
                    {loading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
                            <div className="spinner" style={{ width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                            <style jsx>{`
                                @keyframes spin {
                                    to { transform: rotate(360deg); }
                                }
                            `}</style>
                        </div>
                    ) : (
                        <News news={news.length > 0 ? news : []} />
                    )}
                </div>

                <aside className={styles.sidebar}>
                    <div className={styles.trending}>
                        <div className={styles.trendingTitle}>
                            <TrendingUp size={20} color="var(--primary)" />
                            <span>Trending Topics</span>
                        </div>

                        {TRENDING_TOPICS.map((topic, index) => (
                            <div key={index} className={styles.trendingItem}>
                                <h4>{topic.title}</h4>
                                <span className={styles.trendingMeta}>{topic.count}</span>
                            </div>
                        ))}
                    </div>
                </aside>
            </div>
        </div>
    );
}

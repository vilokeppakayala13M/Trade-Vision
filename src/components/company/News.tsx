'use client';

import { useState } from 'react';
import { ExternalLink, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './News.module.css';

interface NewsItem {
    id: number;
    title: string;
    source: string;
    time: string;
    summary: string;
    url?: string;
    description?: string;
}

interface NewsProps {
    news: NewsItem[];
}

export default function News({ news }: NewsProps) {
    const [expandedId, setExpandedId] = useState<number | null>(null);

    const toggleExpand = (id: number) => {
        setExpandedId(expandedId === id ? null : id);
    };

    return (
        <div className={styles.container}>
            {news.map(item => (
                <div
                    key={item.id}
                    className={`${styles.newsCard} ${expandedId === item.id ? styles.expanded : ''}`}
                    onClick={() => toggleExpand(item.id)}
                >
                    <div className={styles.header}>
                        <h3>{item.title}</h3>
                        <div className={styles.meta}>
                            <span>{item.source}</span>
                            <span>•</span>
                            <span>{item.time}</span>
                        </div>
                    </div>

                    <p className={styles.summary}>
                        {item.summary}
                    </p>

                    <AnimatePresence>
                        {expandedId === item.id && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                style={{ overflow: 'hidden' }}
                            >
                                {item.description && (
                                    <p style={{ marginTop: '1rem', color: 'var(--text-primary)', opacity: 0.9 }}>
                                        {item.description}
                                    </p>
                                )}

                                <div className={styles.footer}>
                                    <a
                                        href={item.url || `https://www.google.com/search?q=${encodeURIComponent(item.title + ' ' + item.source)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={styles.readMoreBtn}
                                        onClick={(e) => e.stopPropagation()} // Prevent card toggle when clicking link
                                    >
                                        Read Full Article <ExternalLink size={14} />
                                    </a>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {!expandedId && (
                        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0.5rem', opacity: 0.3 }}>
                            <ChevronDown size={16} />
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

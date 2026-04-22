'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface SentimentDashboardProps {
    polarity: number; // -1 to 1
    subjectivity: number; // 0 to 1
    positive: number;
    negative: number;
    neutral: number;
    keywords: { word: string, score: number }[];
}

export default function SentimentDashboard({ polarity, subjectivity, positive, negative, neutral, keywords }: SentimentDashboardProps) {
    const getSentimentColor = (score: number) => {
        if (score > 0.2) return '#10b981'; // Green
        if (score < -0.2) return '#ef4444'; // Red
        return '#f59e0b'; // Amber/Neutral
    };

    const sentimentLabel = polarity > 0.2 ? 'Positive' : polarity < -0.2 ? 'Negative' : 'Neutral';
    const color = getSentimentColor(polarity);

    return (
        <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            padding: '1.5rem',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            marginTop: '1.5rem',
            color: 'white'
        }}>
            <h3 style={{ margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                🧠 Sentiment Analysis
                <span style={{
                    fontSize: '0.8rem',
                    background: color,
                    padding: '2px 8px',
                    borderRadius: '12px',
                    color: 'white'
                }}>
                    {sentimentLabel} ({polarity.toFixed(2)})
                </span>
            </h3>

            {/* Distribution Bar */}
            <div style={{ display: 'flex', height: '12px', borderRadius: '6px', overflow: 'hidden', marginBottom: '1rem' }}>
                <div style={{ width: `${positive * 100}%`, background: '#10b981' }} title={`Positive: ${(positive * 100).toFixed(0)}%`} />
                <div style={{ width: `${neutral * 100}%`, background: '#94a3b8' }} title={`Neutral: ${(neutral * 100).toFixed(0)}%`} />
                <div style={{ width: `${negative * 100}%`, background: '#ef4444' }} title={`Negative: ${(negative * 100).toFixed(0)}%`} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', opacity: 0.8, marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
                    Positive ({(positive * 100).toFixed(0)}%)
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#94a3b8' }} />
                    Neutral ({(neutral * 100).toFixed(0)}%)
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} />
                    Negative ({(negative * 100).toFixed(0)}%)
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                {/* Subjectivity Meter */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem', opacity: 0.8 }}>
                        <span>Subjectivity</span>
                        <span>{subjectivity.toFixed(2)}</span>
                    </div>
                    <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${subjectivity * 100}%` }}
                            style={{ height: '100%', background: '#6366f1' }}
                        />
                    </div>
                </div>
            </div>

            {keywords.length > 0 && (
                <div style={{ marginTop: '1.5rem' }}>
                    <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', opacity: 0.8 }}>Top Keywords</h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {keywords.slice(0, 8).map((k, i) => (
                            <span key={i} style={{
                                fontSize: '0.8rem',
                                padding: '2px 8px',
                                borderRadius: '4px',
                                border: '1px solid rgba(255,255,255,0.1)',
                                color: k.score > 0 ? '#ccedd5' : '#edd5d5',
                                background: k.score > 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'
                            }}>
                                {k.word}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

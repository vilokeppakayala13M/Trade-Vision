'use client';

import React from 'react';
import { motion } from 'framer-motion';

type Verdict = 'Buy' | 'Sell' | 'Hold' | 'Wait' | 'Don\'t Buy';

interface AnalystVerdictProps {
    verdict: Verdict;
    reason: string;
    metrics: {
        price: number;
        prediction: number;
        sentiment: number;
        trend?: number; // Calculated from graph
        accuracy?: {
            rmse: number;
            mae: number;
            mape: number;
        };
    }
}

export default function AnalystVerdict({ verdict, reason, metrics }: AnalystVerdictProps) {
    const getColor = (v: Verdict) => {
        switch (v) {
            case 'Buy': return '#10b981'; // Green
            case 'Sell': return '#ef4444'; // Red
            case 'Hold': return '#f59e0b'; // Amber
            case 'Wait': return '#6366f1'; // Indigo
            case 'Don\'t Buy': return '#9ca3af'; // Grey
            default: return 'white';
        }
    };

    const color = getColor(verdict);

    // Determine sentiment label and color based on trend
    let sentimentLabel = 'Neutral';
    let sentimentColor = '#f59e0b'; // Amber
    const trend = metrics.trend || 0;

    if (trend > 0.2) {
        sentimentLabel = `Positive (+${trend.toFixed(2)}%)`;
        sentimentColor = '#10b981';
    } else if (trend < -0.2) {
        sentimentLabel = `Negative (${trend.toFixed(2)}%)`;
        sentimentColor = '#ef4444';
    } else {
        sentimentLabel = `Neutral (${trend.toFixed(2)}%)`;
    }

    return (
        <div style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            padding: '2rem',
            border: `1px solid ${color}40`,
            marginTop: '1.5rem',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden'
        }}>
            <div style={{
                position: 'absolute',
                top: 0, left: 0, width: '4px', bottom: 0,
                background: color
            }} />

            <h3 style={{ margin: 0, opacity: 0.7, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '2px' }}>
                Algorithmic Verdict
            </h3>

            <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                style={{
                    fontSize: '3.5rem',
                    fontWeight: 800,
                    color: color,
                    margin: '1rem 0',
                    textShadow: `0 0 30px ${color}60`
                }}
            >
                {verdict.toUpperCase()}
            </motion.div>

            <p style={{ fontSize: '1.1rem', opacity: 0.9, maxWidth: '80%', margin: '0 auto' }}>
                {reason}
            </p>

            <div style={{
                marginTop: '2rem',
                paddingTop: '1rem',
                borderTop: '1px solid rgba(255,255,255,0.1)',
                display: 'flex',
                justifyContent: 'center',
                gap: '2rem',
                fontSize: '0.85rem'
            }}>
                <div>
                    <span style={{ opacity: 0.5, display: 'block' }}>Current</span>
                    <span style={{ fontWeight: 'bold' }}>₹{metrics.price.toFixed(2)}</span>
                </div>
                <div>
                    <span style={{ opacity: 0.5, display: 'block' }}>Target (7d)</span>
                    <span style={{ fontWeight: 'bold', color: metrics.prediction > metrics.price ? '#10b981' : '#ef4444' }}>
                        ₹{metrics.prediction.toFixed(2)}
                    </span>
                </div>
                <div>
                    <span style={{ opacity: 0.5, display: 'block' }}>Sentiment</span>
                    <span style={{ fontWeight: 'bold', color: sentimentColor }}>
                        {sentimentLabel}
                    </span>
                </div>
            </div>

            {/* Model Accuracy Section */}
            {metrics.accuracy && (
                <div style={{
                    marginTop: '1.5rem',
                    paddingTop: '1rem',
                    borderTop: '1px solid rgba(255,255,255,0.1)',
                    fontSize: '0.8rem',
                    textAlign: 'left'
                }}>
                    <h4 style={{ margin: '0 0 1rem 0', opacity: 0.8, fontSize: '0.9rem' }}>Forecast Accuracy (In-Sample)</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div>
                            <span style={{ opacity: 0.5, display: 'block' }}>RMSE</span>
                            <span style={{ fontWeight: 'bold' }}>{metrics.accuracy.rmse.toFixed(2)}</span>
                        </div>
                        <div>
                            <span style={{ opacity: 0.5, display: 'block' }}>MAE</span>
                            <span style={{ fontWeight: 'bold' }}>{metrics.accuracy.mae.toFixed(2)}</span>
                        </div>
                        <div>
                            <span style={{ opacity: 0.5, display: 'block' }}>MAPE</span>
                            <span style={{ fontWeight: 'bold' }}>{metrics.accuracy.mape.toFixed(2)}%</span>
                        </div>
                    </div>

                    <h4 style={{ margin: '0 0 0.5rem 0', opacity: 0.8, fontSize: '0.9rem' }}>Model Benchmark (SMAP vs Prophet)</h4>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem', opacity: 0.9 }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                <th style={{ textAlign: 'left', padding: '0.5rem 0' }}>Model</th>
                                <th style={{ textAlign: 'right', padding: '0.5rem 0' }}>RMSE</th>
                                <th style={{ textAlign: 'right', padding: '0.5rem 0' }}>MAPE</th>
                                <th style={{ textAlign: 'right', padding: '0.5rem 0' }}>MAE</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style={{ padding: '0.5rem 0' }}>SMAP (Ref)</td>
                                <td style={{ textAlign: 'right' }}>1.89</td>
                                <td style={{ textAlign: 'right' }}>1.59%</td>
                                <td style={{ textAlign: 'right' }}>1.80</td>
                            </tr>
                            <tr>
                                <td style={{ padding: '0.5rem 0' }}>Prophet (Tuned)</td>
                                <td style={{ textAlign: 'right' }}>0.64</td>
                                <td style={{ textAlign: 'right' }}>0.52%</td>
                                <td style={{ textAlign: 'right' }}>0.58</td>
                            </tr>
                            <tr>
                                <td style={{ padding: '0.5rem 0' }}>This Model</td>
                                <td style={{ textAlign: 'right', color: metrics.accuracy.rmse < 2.0 ? '#10b981' : 'inherit' }}>{metrics.accuracy.rmse.toFixed(2)}</td>
                                <td style={{ textAlign: 'right', color: metrics.accuracy.mape < 2.0 ? '#10b981' : 'inherit' }}>{metrics.accuracy.mape.toFixed(2)}%</td>
                                <td style={{ textAlign: 'right', color: metrics.accuracy.mae < 2.0 ? '#10b981' : 'inherit' }}>{metrics.accuracy.mae.toFixed(2)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

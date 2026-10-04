"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { formatINR } from '@/lib/format';

export default function Leaderboard() {
    const { user } = useAuth();
    const token = user?.accessToken || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    const [userRank, setUserRank] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const headers: HeadersInit = {};
                if (token) {
                    headers['Authorization'] = `Bearer ${token}`;
                }
                const res = await fetch('/api/paper-trading/leaderboard', { headers });
                const data = await res.json();
                if (res.ok) {
                    setLeaderboard(data.leaderboard);
                    setUserRank(data.userRank);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchLeaderboard();
    }, [token]);

    if (loading) {
        return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading leaderboard...</div>;
    }

    const getRankDisplay = (rank: number) => {
        if (rank === 1) return '🥇';
        if (rank === 2) return '🥈';
        if (rank === 3) return '🥉';
        return <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{rank}</span>;
    };

    // Check if current user is in the top 20
    const isUserInTop20 = user && leaderboard.some(entry => entry.userId === user._id);

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
                    <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Top Traders</h3>
                    <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)', fontSize: '14px' }}>Ranked by total portfolio return.</p>
                </div>
                
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                <th style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 500, width: '60px' }}>Rank</th>
                                <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 500 }}>Trader</th>
                                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 500 }}>Portfolio Value</th>
                                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 500 }}>Total Return</th>
                                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 500 }}>Win Rate</th>
                                <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 500 }}>Best Trade</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leaderboard.length === 0 ? (
                                <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No data available yet.</td></tr>
                            ) : leaderboard.map((entry, index) => {
                                const rank = index + 1;
                                const isCurrentUser = user && entry.userId === user._id;
                                
                                return (
                                    <tr key={entry._id} style={{ 
                                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                                        background: isCurrentUser ? 'rgba(99,102,241,0.08)' : 'transparent',
                                        border: isCurrentUser ? '1px solid #6366f1' : undefined
                                    }}>
                                        <td style={{ padding: '1rem', textAlign: 'center', fontSize: '1.25rem' }}>
                                            {getRankDisplay(rank)}
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'left' }}>
                                            <div style={{ fontWeight: 600, fontSize: '14px' }}>
                                                {entry.displayName}
                                                {isCurrentUser && <span style={{ marginLeft: '8px', fontSize: '10px', background: '#6366f1', color: 'white', padding: '2px 6px', borderRadius: '4px' }}>YOU</span>}
                                            </div>
                                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{entry.tradeCount} trades</div>
                                        </td>
                                        <td style={{ padding: '1rem', fontSize: '14px', fontWeight: 500 }}>
                                            ₹{formatINR(entry.currentPortfolioValue)}
                                        </td>
                                        <td style={{ padding: '1rem', fontSize: '14px', fontWeight: 600, color: entry.totalReturn >= 0 ? '#10b981' : '#ef4444' }}>
                                            {entry.totalReturn >= 0 ? '+' : ''}{entry.totalReturn.toFixed(2)}%
                                        </td>
                                        <td style={{ padding: '1rem', fontSize: '14px' }}>
                                            {entry.winRate > 0 ? `${Math.round(entry.winRate)}%` : '—'}
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'left', fontSize: '13px' }}>
                                            {entry.bestTrade && entry.bestTrade.symbol ? (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <span style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>
                                                        +{entry.bestTrade.returnPercent.toFixed(1)}%
                                                    </span>
                                                    <span style={{ color: 'var(--text-secondary)' }}>{entry.bestTrade.symbol}</span>
                                                </div>
                                            ) : (
                                                <span style={{ color: 'var(--text-secondary)' }}>—</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Pinned user rank if they exist but aren't in top 20 */}
                {userRank && userRank > 20 && !isUserInTop20 && (
                    <div style={{ 
                        borderTop: '2px dashed var(--border)',
                        background: 'rgba(99,102,241,0.05)',
                        padding: '1rem 1.5rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#6366f1', width: '40px', textAlign: 'center' }}>
                                #{userRank}
                            </div>
                            <div>
                                <div style={{ fontWeight: 600, fontSize: '14px' }}>Your Rank</div>
                                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Keep trading to climb the leaderboard!</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

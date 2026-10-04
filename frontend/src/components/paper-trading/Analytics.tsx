"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
    ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
    BarChart, Bar, Cell, PieChart, Pie
} from 'recharts';
import { AnalyticsData, EnrichedHolding } from '@/types/paperTrading';
import { formatINR } from '@/lib/format';
import { TRACKED_STOCKS } from '@/lib/calendarData';

export default function Analytics({ holdings }: { holdings: EnrichedHolding[] }) {
    const { user } = useAuth();
    const token = user?.accessToken || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            if (!token) return;
            try {
                const res = await fetch('/api/paper-trading/analytics', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const result = await res.json();
                setData(result);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, [token]);

    if (loading) {
        return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading analytics...</div>;
    }

    if (!data) return null;

    if (data.insufficient) {
        return (
            <div style={{
                background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px',
                padding: '4rem 2rem', textAlign: 'center', maxWidth: '600px', margin: '0 auto'
            }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Analytics Locked</h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{data.message}</p>
            </div>
        );
    }

    // Prepare Sector Pie Data
    const sectorMap: Record<string, number> = {};
    holdings.forEach(h => {
        const stock = TRACKED_STOCKS.find(s => s.symbol === h.displaySymbol);
        const sector = stock ? stock.sector : 'Other';
        sectorMap[sector] = (sectorMap[sector] || 0) + h.currentValue;
    });
    const pieData = Object.entries(sectorMap)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);
    
    const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981', '#3b82f6'];

    // Win Rate SVG props
    const radius = 30;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference * (1 - data.winRate / 100);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Top Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ position: 'relative', width: '70px', height: '70px' }}>
                        <svg width="70" height="70" viewBox="0 0 70 70">
                            <circle cx="35" cy="35" r={radius} fill="none" stroke="var(--border)" strokeWidth="6" />
                            <circle cx="35" cy="35" r={radius} fill="none" stroke="#10b981" strokeWidth="6"
                                strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
                                transform="rotate(-90 35 35)" strokeLinecap="round" />
                        </svg>
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700 }}>
                            {Math.round(data.winRate)}%
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Win Rate</div>
                        <div style={{ fontSize: '12px', marginTop: '4px' }}>Profitable trades</div>
                    </div>
                </div>

                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem' }}>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Best Trade</div>
                    {data.bestTrade ? (
                        <>
                            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#10b981' }}>{data.bestTrade.symbol}</div>
                            <div style={{ fontSize: '14px', color: '#10b981' }}>+{data.bestTrade.returnPercent.toFixed(2)}%</div>
                        </>
                    ) : <div style={{ color: 'var(--text-secondary)' }}>N/A</div>}
                </div>

                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem' }}>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Worst Trade</div>
                    {data.worstTrade ? (
                        <>
                            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ef4444' }}>{data.worstTrade.symbol}</div>
                            <div style={{ fontSize: '14px', color: '#ef4444' }}>{data.worstTrade.returnPercent.toFixed(2)}%</div>
                        </>
                    ) : <div style={{ color: 'var(--text-secondary)' }}>N/A</div>}
                </div>

                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem' }}>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Most Traded</div>
                    {data.mostTraded.length > 0 ? (
                        <>
                            <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{data.mostTraded[0].symbol}</div>
                            <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{data.mostTraded[0].count} trades</div>
                        </>
                    ) : <div style={{ color: 'var(--text-secondary)' }}>N/A</div>}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
                {/* Monthly PnL Area Chart */}
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem', height: '350px' }}>
                    <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem' }}>Monthly Realized P&L</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data.monthlyPnL} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorPos" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorNeg" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${formatINR(v, 0)}`} />
                            <Tooltip 
                                contentStyle={{ background: '#1e1e2d', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                itemStyle={{ color: 'white' }}
                                formatter={(val: any) => [`₹${formatINR(Number(val || 0))}`, 'P&L']}
                            />
                            {/* A trick to color above/below 0 differently using gradients and baseLine in recharts, but splitting is easier or just using one color. Let's use green for simplicity as area */}
                            <Area type="monotone" dataKey="pnl" stroke="#10b981" fillOpacity={1} fill="url(#colorPos)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Sector Performance Bar Chart */}
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem', height: '350px' }}>
                    <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem' }}>Sector Performance (Realized)</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data.sectorPerformance} layout="vertical" margin={{ top: 0, right: 20, left: 40, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={true} vertical={false} />
                            <XAxis type="number" stroke="rgba(255,255,255,0.3)" fontSize={10} tickFormatter={(v) => `₹${formatINR(v, 0)}`} />
                            <YAxis dataKey="sector" type="category" stroke="rgba(255,255,255,0.8)" fontSize={11} width={80} tickLine={false} axisLine={false} />
                            <Tooltip 
                                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                contentStyle={{ background: '#1e1e2d', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                formatter={(val: any) => [`₹${formatINR(Number(val || 0))}`, 'P&L']}
                            />
                            <Bar dataKey="pnl" radius={[0, 4, 4, 0]}>
                                {data.sectorPerformance.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? '#10b981' : '#ef4444'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Current Portfolio Allocation Pie */}
                {pieData.length > 0 && (
                    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem', height: '350px' }}>
                        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem' }}>Current Allocation by Sector</h3>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={90}
                                    paddingAngle={2}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ background: '#1e1e2d', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                    formatter={(val: any) => [`₹${formatINR(Number(val || 0))}`, 'Value']}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginTop: '-20px' }}>
                            {pieData.map((entry, index) => (
                                <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: COLORS[index % COLORS.length] }} />
                                    {entry.name}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

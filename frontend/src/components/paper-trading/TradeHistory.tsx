"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';
import { formatINR, formatPnL } from '@/lib/format';

export default function TradeHistory() {
    const { user } = useAuth();
    const token = user?.accessToken || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
    const [trades, setTrades] = useState<any[]>([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    
    const [symbolFilter, setSymbolFilter] = useState('');
    const [actionFilter, setActionFilter] = useState('All');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');

    const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
    const [summary, setSummary] = useState({ totalBrokerage: 0, realizedPnL: 0, totalTrades: 0, totalBuys: 0, totalSells: 0 });

    const fetchHistory = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        try {
            let url = `/api/paper-trading/history?page=${page}&limit=20`;
            if (symbolFilter) url += `&symbol=${symbolFilter}`;
            if (actionFilter !== 'All') url += `&action=${actionFilter}`;
            if (fromDate) url += `&from=${fromDate}`;
            if (toDate) url += `&to=${toDate}`;

            const res = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setTrades(data.trades);
                setPagination(data.pagination);
                setSummary(data.summary);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [token, page, symbolFilter, actionFilter, fromDate, toDate]);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    const handleFilterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1); // Reset to page 1 on filter
        fetchHistory();
    };

    const winRate = summary.totalSells > 0 
        ? ((trades.filter(t => t.action === 'SELL' && t.realizedPnL > 0).length) / trades.filter(t => t.action === 'SELL').length) * 100 
        // Note: The precise win rate should come from the summary if computed on server, but we can do a rough approx or omit it here. The analytics has the precise one. Let's omit win rate from history or leave as is.
        : 0; 
        
    return (
        <div>
            {/* Filter Bar */}
            <form onSubmit={handleFilterSubmit} style={{
                display: 'flex', gap: '1rem', flexWrap: 'wrap', 
                background: 'var(--surface)', border: '1px solid var(--border)', 
                padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', alignItems: 'flex-end'
            }}>
                <div style={{ flex: '1 1 150px' }}>
                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Symbol</label>
                    <input type="text" value={symbolFilter} onChange={e => setSymbolFilter(e.target.value)} placeholder="e.g. RELIANCE" style={{ width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-primary)', outline: 'none' }} />
                </div>
                <div style={{ flex: '1 1 120px' }}>
                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Action</label>
                    <select value={actionFilter} onChange={e => setActionFilter(e.target.value)} style={{ width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-primary)', outline: 'none' }}>
                        <option value="All">All</option>
                        <option value="BUY">BUY</option>
                        <option value="SELL">SELL</option>
                    </select>
                </div>
                <div style={{ flex: '1 1 150px' }}>
                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>From</label>
                    <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} style={{ width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-primary)', outline: 'none' }} />
                </div>
                <div style={{ flex: '1 1 150px' }}>
                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>To</label>
                    <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} style={{ width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-primary)', outline: 'none' }} />
                </div>
                <div style={{ flex: '0 0 auto' }}>
                    <button type="submit" style={{ padding: '8px 24px', background: 'var(--text-primary)', color: 'var(--surface)', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>
                        Filter
                    </button>
                </div>
            </form>

            {/* Table */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
                        <thead>
                            <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)' }}>
                                <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 500 }}>Date/Time</th>
                                <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 500 }}>Symbol</th>
                                <th style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 500 }}>Action</th>
                                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 500 }}>Qty</th>
                                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 500 }}>Price</th>
                                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 500 }}>Total Value</th>
                                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 500 }}>Brokerage</th>
                                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 500 }}>Realized P&L</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={8} style={{ padding: '2rem', textAlign: 'center' }}>Loading...</td></tr>
                            ) : trades.length === 0 ? (
                                <tr><td colSpan={8} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No trades found matching criteria.</td></tr>
                            ) : trades.map((t) => (
                                <tr key={t.tradeId} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '1rem', textAlign: 'left', fontSize: '13px' }}>
                                        {format(new Date(t.executedAt), 'dd MMM yyyy HH:mm')}
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, fontSize: '14px' }}>
                                        {t.displaySymbol}
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                                        <span style={{ 
                                            background: t.action === 'BUY' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                            color: t.action === 'BUY' ? '#10b981' : '#ef4444',
                                            padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700
                                        }}>
                                            {t.action}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', fontSize: '14px' }}>{t.quantity}</td>
                                    <td style={{ padding: '1rem', fontSize: '14px' }}>₹{formatINR(t.price)}</td>
                                    <td style={{ padding: '1rem', fontSize: '14px' }}>₹{formatINR(t.totalValue)}</td>
                                    <td style={{ padding: '1rem', fontSize: '14px', color: 'var(--text-secondary)' }}>₹{formatINR(t.brokerage)}</td>
                                    <td style={{ padding: '1rem', fontSize: '14px', fontWeight: 600 }}>
                                        {t.action === 'SELL' ? (
                                            <span style={{ color: t.realizedPnL >= 0 ? '#10b981' : '#ef4444' }}>
                                                {formatPnL(t.realizedPnL)}
                                            </span>
                                        ) : (
                                            <span style={{ color: 'var(--text-secondary)' }}>—</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                
                {/* Pagination */}
                {!loading && trades.length > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderTop: '1px solid var(--border)' }}>
                        <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                            Showing {(page - 1) * pagination.limit + 1}–{Math.min(page * pagination.limit, pagination.total)} of {pagination.total} trades
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} style={{ padding: '6px 12px', background: 'transparent', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-primary)', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.5 : 1 }}>Previous</button>
                            <button disabled={page === pagination.totalPages} onClick={() => setPage(p => p + 1)} style={{ padding: '6px 12px', background: 'transparent', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-primary)', cursor: page === pagination.totalPages ? 'not-allowed' : 'pointer', opacity: page === pagination.totalPages ? 0.5 : 1 }}>Next</button>
                        </div>
                    </div>
                )}
            </div>

            {/* Sticky Summary Footer */}
            <div style={{
                position: 'sticky', bottom: '1rem', marginTop: '1.5rem',
                background: 'rgba(20, 20, 30, 0.9)', backdropFilter: 'blur(10px)',
                border: '1px solid var(--border)', borderRadius: '12px', padding: '1rem',
                display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap',
                boxShadow: '0 10px 25px rgba(0,0,0,0.5)', zIndex: 10
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Total Brokerage Paid</div>
                    <div style={{ fontSize: '16px', fontWeight: 700 }}>₹{formatINR(summary.totalBrokerage)}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Total Realized P&L</div>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: summary.realizedPnL >= 0 ? '#10b981' : '#ef4444' }}>{formatPnL(summary.realizedPnL)}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Trades</div>
                    <div style={{ fontSize: '16px', fontWeight: 700 }}>{summary.totalTrades} ({summary.totalBuys} B / {summary.totalSells} S)</div>
                </div>
            </div>
        </div>
    );
}

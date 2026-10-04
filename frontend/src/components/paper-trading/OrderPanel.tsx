"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { TRACKED_STOCKS } from '@/lib/calendarData';
import { formatINR } from '@/lib/format';
import { trackTradeAction } from '@/lib/analytics';

interface OrderPanelProps {
    cashBalance: number;
    onTradeExecuted: (trade: any) => void;
    prefillSymbol?: string;
    prefillAction?: 'BUY' | 'SELL';
    prefillMaxQty?: number;
}

export default function OrderPanel({ cashBalance, onTradeExecuted, prefillSymbol, prefillAction, prefillMaxQty }: OrderPanelProps) {
    const { user } = useAuth();
    const token = user?.accessToken || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
    
    const [action, setAction] = useState<'BUY' | 'SELL'>(prefillAction || 'BUY');
    const [symbol, setSymbol] = useState(prefillSymbol || '');
    const [quantity, setQuantity] = useState<number>(1);
    const [notes, setNotes] = useState('');
    
    const [livePrice, setLivePrice] = useState<number | null>(null);
    const [priceLoading, setPriceLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<{ message: string, pnl?: number } | null>(null);

    const pricePollRef = useRef<NodeJS.Timeout | null>(null);

    // Sync props to state if they change (e.g. clicking different items)
    useEffect(() => {
        if (prefillSymbol) setSymbol(prefillSymbol);
        if (prefillAction) setAction(prefillAction);
        if (prefillMaxQty && prefillAction === 'SELL') setQuantity(prefillMaxQty);
    }, [prefillSymbol, prefillAction, prefillMaxQty]);

    // Fetch live price when symbol changes
    useEffect(() => {
        const fetchPrice = async () => {
            if (!symbol) {
                setLivePrice(null);
                return;
            }
            
            setPriceLoading(true);
            try {
                const res = await fetch(`/api/paper-trading/quote?symbol=${symbol}`);
                const data = await res.json();
                if (data.price > 0) {
                    setLivePrice(data.price);
                    setError(null);
                } else {
                    setLivePrice(null);
                    setError(data.error || 'Unable to fetch live price');
                }
            } catch (err) {
                setLivePrice(null);
            } finally {
                setPriceLoading(false);
            }
        };

        fetchPrice();

        // Poll every 30s
        pricePollRef.current = setInterval(fetchPrice, 30000);
        return () => {
            if (pricePollRef.current) clearInterval(pricePollRef.current);
        };
    }, [symbol]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (!token) {
            setError('Authentication required');
            return;
        }

        if (!symbol || !livePrice || quantity < 1) {
            return;
        }

        const estimatedCost = (livePrice * quantity) + 20;
        if (action === 'BUY' && estimatedCost > cashBalance) {
            setError(`Insufficient funds. You need ₹${formatINR(estimatedCost)}.`);
            return;
        }

        if (action === 'SELL' && prefillMaxQty !== undefined && quantity > prefillMaxQty) {
            setError(`You only hold ${prefillMaxQty} shares.`);
            return;
        }

        setSubmitting(true);
        trackTradeAction(action, symbol);

        try {
            const res = await fetch('/api/paper-trading/trade', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    symbol,
                    action,
                    quantity,
                    notes
                })
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Trade failed');
            } else {
                setSuccess({
                    message: `Successfully ${action === 'BUY' ? 'bought' : 'sold'} ${quantity} shares of ${symbol}.`,
                    pnl: action === 'SELL' ? data.trade.realizedPnL : undefined
                });
                
                // Reset form
                if (action === 'BUY') {
                    setQuantity(1);
                    setNotes('');
                } else if (action === 'SELL' && prefillMaxQty) {
                    // If we just sold everything, reset to BUY to prevent double click
                    setAction('BUY');
                }
                
                onTradeExecuted(data.trade);
            }
        } catch (err: any) {
            setError(err.message || 'Network error');
        } finally {
            setSubmitting(false);
        }
    };

    const orderValue = livePrice ? livePrice * quantity : 0;
    const brokerage = 20;
    const totalImpact = action === 'BUY' ? orderValue + brokerage : orderValue - brokerage;
    const remainingCash = action === 'BUY' ? cashBalance - totalImpact : cashBalance + totalImpact;

    const isInsufficient = action === 'BUY' && remainingCash < 0;

    return (
        <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
        }}>
            <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Place Order</h3>

            <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: '8px' }}>
                <button
                    type="button"
                    onClick={() => { setAction('BUY'); setError(null); setSuccess(null); }}
                    style={{
                        flex: 1,
                        padding: '8px',
                        border: 'none',
                        borderRadius: '6px',
                        fontWeight: 600,
                        fontSize: '14px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        background: action === 'BUY' ? '#10b981' : 'transparent',
                        color: action === 'BUY' ? 'white' : 'var(--text-secondary)'
                    }}
                >
                    BUY
                </button>
                <button
                    type="button"
                    onClick={() => { setAction('SELL'); setError(null); setSuccess(null); }}
                    style={{
                        flex: 1,
                        padding: '8px',
                        border: 'none',
                        borderRadius: '6px',
                        fontWeight: 600,
                        fontSize: '14px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        background: action === 'SELL' ? '#ef4444' : 'transparent',
                        color: action === 'SELL' ? 'white' : 'var(--text-secondary)'
                    }}
                >
                    SELL
                </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Stock</label>
                    <select
                        value={symbol}
                        onChange={(e) => setSymbol(e.target.value)}
                        required
                        style={{
                            width: '100%',
                            padding: '10px 12px',
                            background: 'rgba(0,0,0,0.2)',
                            border: '1px solid var(--border)',
                            borderRadius: '8px',
                            color: 'var(--text-primary)',
                            fontSize: '14px',
                            outline: 'none'
                        }}
                    >
                        <option value="" disabled>Select a stock</option>
                        {/* Group by Cap or just alphabetical - calendarData exports TRACKED_STOCKS flat, we'll sort them */}
                        {Array.from(new Set(TRACKED_STOCKS.map(s => s.sector))).map(sector => (
                            <optgroup label={sector} key={sector}>
                                {TRACKED_STOCKS.filter(s => s.sector === sector).sort((a,b) => a.name.localeCompare(b.name)).map(s => (
                                    <option key={s.symbol} value={s.symbol}>{s.name} ({s.symbol})</option>
                                ))}
                            </optgroup>
                        ))}
                    </select>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Live Price</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {priceLoading ? (
                            <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Fetching...</span>
                        ) : livePrice ? (
                            <>
                                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block', animation: 'pulse 2s infinite' }}></span>
                                <span style={{ fontSize: '16px', fontWeight: 600 }}>₹{formatINR(livePrice)}</span>
                            </>
                        ) : (
                            <span style={{ fontSize: '14px', color: '#ef4444' }}>Unavailable</span>
                        )}
                    </div>
                </div>

                <div>
                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                        Quantity {action === 'SELL' && prefillMaxQty && `(Max: ${prefillMaxQty})`}
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
                        <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{ padding: '10px 16px', background: 'transparent', border: 'none', borderRight: '1px solid var(--border)', color: 'var(--text-primary)', cursor: 'pointer' }}>-</button>
                        <input
                            type="number"
                            min="1"
                            max={action === 'SELL' && prefillMaxQty ? prefillMaxQty : 10000}
                            value={quantity}
                            onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                            style={{ width: '100%', background: 'transparent', border: 'none', color: 'var(--text-primary)', textAlign: 'center', fontSize: '16px', outline: 'none' }}
                        />
                        <button type="button" onClick={() => setQuantity(quantity + 1)} style={{ padding: '10px 16px', background: 'transparent', border: 'none', borderLeft: '1px solid var(--border)', color: 'var(--text-primary)', cursor: 'pointer' }}>+</button>
                    </div>
                </div>

                <div>
                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Notes (Optional)</label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Add a note about this trade..."
                        maxLength={500}
                        rows={2}
                        style={{
                            width: '100%',
                            padding: '10px 12px',
                            background: 'rgba(0,0,0,0.2)',
                            border: '1px solid var(--border)',
                            borderRadius: '8px',
                            color: 'var(--text-primary)',
                            fontSize: '14px',
                            outline: 'none',
                            resize: 'none'
                        }}
                    />
                </div>

                <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '1rem', marginTop: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Order Value:</span>
                        <span>₹{formatINR(orderValue)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Brokerage:</span>
                        <span>₹20.00</span>
                    </div>
                    <div style={{ height: '1px', background: 'var(--border)', margin: '8px 0' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>
                        <span>{action === 'BUY' ? 'Total Cost:' : 'Net Proceeds:'}</span>
                        <span>₹{formatINR(totalImpact)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Remaining Cash:</span>
                        <span style={{ color: isInsufficient ? '#ef4444' : 'var(--text-primary)' }}>
                            ₹{formatINR(remainingCash)}
                        </span>
                    </div>
                </div>

                {error && <div style={{ color: '#ef4444', fontSize: '13px', padding: '8px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '6px' }}>{error}</div>}
                {success && (
                    <div style={{ color: '#10b981', fontSize: '13px', padding: '8px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '6px' }}>
                        {success.message}
                        {success.pnl !== undefined && (
                            <div style={{ fontWeight: 600, marginTop: '4px' }}>Realized P&L: {success.pnl >= 0 ? '+' : ''}₹{formatINR(success.pnl)}</div>
                        )}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={submitting || !livePrice || (isInsufficient && action === 'BUY')}
                    style={{
                        width: '100%',
                        padding: '14px',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontWeight: 600,
                        cursor: (submitting || !livePrice || (isInsufficient && action === 'BUY')) ? 'not-allowed' : 'pointer',
                        color: 'white',
                        background: (submitting || !livePrice) ? 'var(--border)' 
                            : action === 'BUY' ? 'linear-gradient(to right, #10b981, #059669)' 
                            : 'linear-gradient(to right, #ef4444, #dc2626)',
                        opacity: (isInsufficient && action === 'BUY') ? 0.5 : 1,
                        transition: 'opacity 0.2s',
                        marginTop: '0.5rem'
                    }}
                >
                    {submitting ? 'Processing...' : `Execute ${action}`}
                </button>
            </form>
            <style>{`
                @keyframes pulse {
                    0% { opacity: 1; }
                    50% { opacity: 0.4; }
                    100% { opacity: 1; }
                }
            `}</style>
        </div>
    );
}

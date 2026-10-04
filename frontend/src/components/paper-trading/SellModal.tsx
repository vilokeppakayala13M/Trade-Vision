"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatINR, formatPnL } from '@/lib/format';

interface SellModalProps {
    open: boolean;
    symbol: string;
    companyName: string;
    currentPrice: number;
    avgBuyPrice: number;
    maxQuantity: number;
    onConfirm: (quantity: number, notes: string) => Promise<void>;
    onClose: () => void;
}

export default function SellModal({
    open, symbol, companyName, currentPrice, avgBuyPrice, maxQuantity, onConfirm, onClose
}: SellModalProps) {
    const [quantity, setQuantity] = useState<number>(1);
    const [notes, setNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (open) {
            setQuantity(maxQuantity); // Default to sell all
            setNotes('');
            setSubmitting(false);
        }
    }, [open, maxQuantity]);

    // Handle Escape key & Keyboard Focus Trapping
    useEffect(() => {
        if (!open) return;

        const previousActiveElement = document.activeElement as HTMLElement;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
                return;
            }

            if (e.key === 'Tab') {
                const focusableElements = modalRef.current?.querySelectorAll(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                ) as NodeListOf<HTMLElement>;

                if (!focusableElements || focusableElements.length === 0) return;

                const firstElement = focusableElements[0];
                const lastElement = focusableElements[focusableElements.length - 1];

                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        lastElement.focus();
                        e.preventDefault();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        firstElement.focus();
                        e.preventDefault();
                    }
                }
            }
        };

        const timer = setTimeout(() => {
            const numInput = modalRef.current?.querySelector('input[type="number"]') as HTMLElement;
            if (numInput) {
                numInput.focus();
            } else {
                const firstFocusable = modalRef.current?.querySelector('button') as HTMLElement;
                if (firstFocusable) firstFocusable.focus();
            }
        }, 100);

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            if (previousActiveElement) {
                previousActiveElement.focus();
            }
            clearTimeout(timer);
        };
    }, [open, onClose]);

    if (!open) return null;

    const brokerage = 20;
    const orderValue = currentPrice * quantity;
    const netProceeds = orderValue - brokerage;
    const pnl = ((currentPrice - avgBuyPrice) * quantity) - brokerage;

    const handleConfirm = async () => {
        if (quantity < 1 || quantity > maxQuantity) return;
        setSubmitting(true);
        try {
            await onConfirm(quantity, notes);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            <div 
                style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 2000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1rem'
                }}
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
                ref={modalRef}
            >
                {/* Decorative backdrop overlay hidden from screen readers */}
                <div 
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.6)',
                        zIndex: 2000
                    }} 
                    onClick={onClose}
                    aria-hidden="true"
                />

                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                        background: 'var(--surface)',
                        borderRadius: '20px',
                        padding: '2rem',
                        width: 'min(420px, calc(100vw - 2rem))',
                        border: '1px solid var(--border)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1.5rem',
                        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
                        position: 'relative',
                        zIndex: 2001
                    }}
                >
                    <div>
                        <h2 id="modal-title" style={{ margin: '0 0 4px 0', fontSize: '1.5rem', fontWeight: 700 }}>Sell {symbol.replace('.NS', '')}</h2>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{companyName}</div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px' }}>
                        <div>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Avg Buy Price</div>
                            <div style={{ fontSize: '16px', fontWeight: 500 }}>₹{formatINR(avgBuyPrice)}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Current Price</div>
                            <div style={{ fontSize: '16px', fontWeight: 600 }}>₹{formatINR(currentPrice)}</div>
                        </div>
                    </div>

                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <label htmlFor="sell-quantity" style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Quantity to Sell</label>
                            <button 
                                onClick={() => setQuantity(maxQuantity)}
                                style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
                            >
                                Sell All ({maxQuantity})
                            </button>
                        </div>
                        <input 
                            type="range" 
                            min="1" 
                            max={maxQuantity} 
                            value={quantity} 
                            onChange={(e) => setQuantity(parseInt(e.target.value))}
                            aria-label="Quantity range to sell"
                            style={{ width: '100%', marginBottom: '12px', accentColor: '#ef4444' }}
                        />
                        <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
                            <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{ padding: '10px 16px', background: 'transparent', border: 'none', borderRight: '1px solid var(--border)', color: 'var(--text-primary)', cursor: 'pointer' }} aria-label="Decrease quantity">-</button>
                            <input
                                id="sell-quantity"
                                type="number"
                                min="1"
                                max={maxQuantity}
                                value={quantity}
                                onChange={(e) => {
                                    let val = parseInt(e.target.value);
                                    if (isNaN(val)) val = 1;
                                    setQuantity(Math.min(Math.max(1, val), maxQuantity));
                                }}
                                style={{ width: '100%', background: 'transparent', border: 'none', color: 'var(--text-primary)', textAlign: 'center', fontSize: '16px', outline: 'none' }}
                            />
                            <button type="button" onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))} style={{ padding: '10px 16px', background: 'transparent', border: 'none', borderLeft: '1px solid var(--border)', color: 'var(--text-primary)', cursor: 'pointer' }} aria-label="Increase quantity">+</button>
                        </div>
                    </div>

                    <div>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Add a note (optional)..."
                            maxLength={500}
                            rows={2}
                            aria-label="Trading notes"
                            style={{
                                width: '100%', padding: '10px 12px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)',
                                borderRadius: '8px', color: 'var(--text-primary)', fontSize: '14px', outline: 'none', resize: 'none'
                            }}
                        />
                    </div>

                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed var(--border)', padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
                        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Estimated Realized P&L</div>
                        <div style={{ fontSize: '2rem', fontWeight: 700, color: pnl >= 0 ? '#10b981' : '#ef4444' }}>
                            {formatPnL(pnl)}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                            Net proceeds: ₹{formatINR(netProceeds)} (Includes ₹20 brokerage)
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                        <button 
                            onClick={onClose}
                            disabled={submitting}
                            style={{ flex: 1, padding: '12px', background: 'transparent', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)', fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer' }}
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleConfirm}
                            disabled={submitting}
                            style={{ flex: 1, padding: '12px', background: '#ef4444', border: 'none', borderRadius: '8px', color: 'white', fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1 }}
                        >
                            {submitting ? 'Selling...' : `Confirm Sell`}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

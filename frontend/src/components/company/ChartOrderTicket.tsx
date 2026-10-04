"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetchPaperAccount, placePaperOrder, PaperAccount, fetchPaperPositions, PaperPosition } from '@/lib/api/paperTrading';
import { formatINR } from '@/lib/format';
import { Wallet, ChevronDown, CheckCircle, AlertCircle } from 'lucide-react';
import styles from './ChartOrderTicket.module.css';

interface ChartOrderTicketProps {
  symbol: string;
  companyName: string;
  currentPrice: number;
  onOrderExecuted?: () => void;
}

export default function ChartOrderTicket({ symbol, companyName, currentPrice, onOrderExecuted }: ChartOrderTicketProps) {
  const { user } = useAuth();
  const token = user?.accessToken || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);

  const [side, setSide] = useState<'BUY' | 'SELL'>('BUY');
  const [quantity, setQuantity] = useState<number>(1);
  const [orderType, setOrderType] = useState<'MARKET' | 'LIMIT'>('MARKET');
  
  const [account, setAccount] = useState<PaperAccount | null>(null);
  const [heldQuantity, setHeldQuantity] = useState<number>(0);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Load account balance & user's current holding for this symbol
  const loadAccountAndHolding = async () => {
    if (!token) return;
    try {
      const acc = await fetchPaperAccount(token);
      setAccount(acc);

      const positions = await fetchPaperPositions(token);
      const currentPos = positions.find((p) => p.symbol.toUpperCase() === symbol.toUpperCase());
      setHeldQuantity(currentPos ? currentPos.quantity : 0);
    } catch (e) {
      console.error('Failed to load paper trading account:', e);
    }
  };

  useEffect(() => {
    loadAccountAndHolding();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, symbol]);

  const estimatedValue = currentPrice * quantity;
  const isBuy = side === 'BUY';
  const availableBalance = account?.balance || 0;
  const isInsufficientFunds = isBuy && account && estimatedValue > availableBalance;
  const isOversizedSell = !isBuy && quantity > heldQuantity;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!token) {
      setError('Please login to place paper trades');
      return;
    }

    if (quantity < 1) {
      setError('Quantity must be at least 1');
      return;
    }

    if (isBuy && isInsufficientFunds) {
      setError(`Insufficient balance. Available: ₹${formatINR(availableBalance)}`);
      return;
    }

    if (!isBuy && isOversizedSell) {
      setError(`Cannot sell ${quantity} shares. You hold ${heldQuantity} shares.`);
      return;
    }

    setSubmitting(true);

    try {
      await placePaperOrder(
        {
          symbol: symbol.toUpperCase(),
          companyName,
          side,
          type: 'market',
          quantity,
          price: currentPrice,
        },
        token
      );

      setSuccessMsg(`Order Filled: ${side} ${quantity} ${symbol.toUpperCase()} @ ₹${formatINR(currentPrice)}`);
      setError(null);

      // Reload account & position info
      await loadAccountAndHolding();

      if (onOrderExecuted) {
        onOrderExecuted();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to place order');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Top Header: Account Buying Power */}
      <div className={styles.accountHeader}>
        <div className={styles.accountInfo}>
          <Wallet size={16} className={styles.walletIcon} />
          <span className={styles.label}>Buying Power:</span>
          <span className={styles.balanceValue}>
            ₹{account ? formatINR(account.balance) : '---'}
          </span>
          {account?.equity !== undefined && (
            <span className={styles.equityTag}>
              Equity: ₹{formatINR(account.equity)}
            </span>
          )}
        </div>

        {heldQuantity > 0 && (
          <div className={styles.holdingBadge}>
            Holding: <strong>{heldQuantity} shares</strong>
          </div>
        )}
      </div>

      {/* Main Order Ticket Bar */}
      <form onSubmit={handleSubmit} className={styles.ticketForm}>
        {/* Buy / Sell Toggle */}
        <div className={styles.sideToggle}>
          <button
            type="button"
            className={`${styles.sideBtn} ${styles.buyBtn} ${isBuy ? styles.activeBuy : ''}`}
            onClick={() => { setSide('BUY'); setError(null); }}
          >
            BUY
          </button>
          <button
            type="button"
            className={`${styles.sideBtn} ${styles.sellBtn} ${!isBuy ? styles.activeSell : ''}`}
            onClick={() => { setSide('SELL'); setError(null); }}
          >
            SELL
          </button>
        </div>

        {/* Order Type */}
        <div className={styles.inputBox}>
          <label className={styles.inputLabel}>Order Type</label>
          <div className={styles.selectWrapper}>
            <select
              value={orderType}
              onChange={(e) => setOrderType(e.target.value as any)}
              className={styles.selectInput}
            >
              <option value="MARKET">Market</option>
              <option value="LIMIT" disabled>Limit (v2)</option>
            </select>
            <ChevronDown size={14} className={styles.selectIcon} />
          </div>
        </div>

        {/* Quantity Controls */}
        <div className={styles.inputBox}>
          <label className={styles.inputLabel}>Quantity</label>
          <div className={styles.qtyGroup}>
            <button
              type="button"
              className={styles.qtyBtn}
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
            >
              -
            </button>
            <input
              type="number"
              min="1"
              max={!isBuy ? Math.max(1, heldQuantity) : 100000}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className={styles.qtyInput}
            />
            <button
              type="button"
              className={styles.qtyBtn}
              onClick={() => setQuantity(quantity + 1)}
            >
              +
            </button>
          </div>
        </div>

        {/* Live Execution Price */}
        <div className={styles.inputBox}>
          <label className={styles.inputLabel}>Live Execution Price</label>
          <div className={styles.priceDisplay}>
            ₹{currentPrice > 0 ? formatINR(currentPrice) : '---'}
          </div>
        </div>

        {/* Estimated Value */}
        <div className={styles.inputBox}>
          <label className={styles.inputLabel}>{isBuy ? 'Est. Cost' : 'Est. Proceeds'}</label>
          <div className={styles.valueDisplay}>
            ₹{formatINR(estimatedValue)}
          </div>
        </div>

        {/* Submit Order Button */}
        <button
          type="submit"
          disabled={submitting || isInsufficientFunds || isOversizedSell || currentPrice <= 0}
          className={`${styles.submitButton} ${isBuy ? styles.submitBuy : styles.submitSell}`}
        >
          {submitting
            ? 'Processing...'
            : `${side} ${quantity} ${symbol}`}
        </button>
      </form>

      {/* Inline Feedback Messages */}
      {error && (
        <div className={styles.errorBanner}>
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className={styles.successBanner}>
          <CheckCircle size={14} />
          <span>{successMsg}</span>
        </div>
      )}
    </div>
  );
}

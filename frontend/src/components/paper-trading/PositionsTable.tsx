"use client";

import React from 'react';
import { PaperPosition } from '@/lib/api/paperTrading';
import { formatINR } from '@/lib/format';
import { ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown } from 'lucide-react';

interface PositionsTableProps {
  positions: PaperPosition[];
  onTradeClick?: (symbol: string, side: 'BUY' | 'SELL', maxQty?: number) => void;
  isLoading?: boolean;
}

export default function PositionsTable({ positions, onTradeClick, isLoading }: PositionsTableProps) {
  if (isLoading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
        Loading open positions...
      </div>
    );
  }

  if (!positions || positions.length === 0) {
    return (
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '2rem',
        textAlign: 'center',
        color: 'var(--text-secondary)'
      }}>
        No open positions. Use the Order Ticket above to start paper trading!
      </div>
    );
  }

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: '12px',
      overflow: 'hidden'
    }}>
      <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>Open Positions</h3>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{positions.length} Active Position{positions.length > 1 ? 's' : ''}</span>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
              <th style={{ padding: '0.75rem 1rem' }}>Symbol</th>
              <th style={{ padding: '0.75rem 1rem' }}>Quantity</th>
              <th style={{ padding: '0.75rem 1rem' }}>Avg Entry Price</th>
              <th style={{ padding: '0.75rem 1rem' }}>Current Price</th>
              <th style={{ padding: '0.75rem 1rem' }}>Current Value</th>
              <th style={{ padding: '0.75rem 1rem' }}>Unrealized P&L</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {positions.map((pos) => {
              const currentPrice = pos.currentPrice || pos.avgEntryPrice;
              const currentValue = pos.currentValue || (pos.quantity * currentPrice);
              const pnl = pos.unrealizedPnL !== undefined ? pos.unrealizedPnL : (currentValue - (pos.quantity * pos.avgEntryPrice));
              const pnlPercent = pos.unrealizedPnLPercent !== undefined ? pos.unrealizedPnLPercent : (pos.avgEntryPrice > 0 ? (pnl / (pos.quantity * pos.avgEntryPrice)) * 100 : 0);
              const isProfit = pnl >= 0;

              return (
                <tr key={pos._id || pos.symbol} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.15s' }}>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    <div>{pos.symbol}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 400 }}>{pos.companyName || pos.symbol}</div>
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>{pos.quantity}</td>
                  <td style={{ padding: '0.85rem 1rem' }}>₹{formatINR(pos.avgEntryPrice)}</td>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 500 }}>₹{formatINR(currentPrice)}</td>
                  <td style={{ padding: '0.85rem 1rem' }}>₹{formatINR(currentValue)}</td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      color: isProfit ? '#10b981' : '#ef4444',
                      fontWeight: 600
                    }}>
                      {isProfit ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                      {isProfit ? '+' : ''}₹{formatINR(pnl)} ({isProfit ? '+' : ''}{pnlPercent.toFixed(2)}%)
                    </div>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                    {onTradeClick && (
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => onTradeClick(pos.symbol, 'BUY')}
                          style={{
                            padding: '4px 10px',
                            background: 'rgba(16, 185, 129, 0.15)',
                            border: '1px solid #10b981',
                            borderRadius: '6px',
                            color: '#10b981',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          Buy More
                        </button>
                        <button
                          onClick={() => onTradeClick(pos.symbol, 'SELL', pos.quantity)}
                          style={{
                            padding: '4px 10px',
                            background: 'rgba(239, 68, 68, 0.15)',
                            border: '1px solid #ef4444',
                            borderRadius: '6px',
                            color: '#ef4444',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          Sell All
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

"use client";

import React from 'react';
import { PaperOrder } from '@/lib/api/paperTrading';
import { formatINR } from '@/lib/format';

interface OrderHistoryTableProps {
  orders: PaperOrder[];
  isLoading?: boolean;
}

export default function OrderHistoryTable({ orders, isLoading }: OrderHistoryTableProps) {
  if (isLoading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
        Loading order history...
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '2rem',
        textAlign: 'center',
        color: 'var(--text-secondary)'
      }}>
        No recent orders executed.
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
        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>Order History</h3>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{orders.length} Recent Order{orders.length > 1 ? 's' : ''}</span>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
              <th style={{ padding: '0.75rem 1rem' }}>Date/Time</th>
              <th style={{ padding: '0.75rem 1rem' }}>Symbol</th>
              <th style={{ padding: '0.75rem 1rem' }}>Side</th>
              <th style={{ padding: '0.75rem 1rem' }}>Type</th>
              <th style={{ padding: '0.75rem 1rem' }}>Quantity</th>
              <th style={{ padding: '0.75rem 1rem' }}>Filled Price</th>
              <th style={{ padding: '0.75rem 1rem' }}>Total Value</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const side = (order.side || '').toUpperCase();
              const isBuy = side === 'BUY';
              const dateStr = order.filledAt || order.createdAt ? new Date(order.filledAt || order.createdAt).toLocaleString('en-IN', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              }) : 'N/A';

              return (
                <tr key={order._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{dateStr}</td>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: 'var(--text-primary)' }}>{order.symbol}</td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      background: isBuy ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      color: isBuy ? '#10b981' : '#ef4444'
                    }}>
                      {side}
                    </span>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', textTransform: 'uppercase', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {order.type || 'MARKET'}
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>{order.quantity}</td>
                  <td style={{ padding: '0.85rem 1rem' }}>₹{formatINR(order.filledPrice)}</td>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 500 }}>₹{formatINR(order.totalValue || (order.filledPrice * order.quantity))}</td>
                  <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      background: order.status === 'filled' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                      color: order.status === 'filled' ? '#10b981' : '#f59e0b',
                      textTransform: 'uppercase'
                    }}>
                      {order.status || 'FILLED'}
                    </span>
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

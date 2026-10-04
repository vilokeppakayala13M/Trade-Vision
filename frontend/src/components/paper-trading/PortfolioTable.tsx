"use client";

import React, { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { EnrichedHolding } from '@/types/paperTrading';
import { formatINR, formatPnL } from '@/lib/format';

interface PortfolioTableProps {
    holdings: EnrichedHolding[];
    onSell: (symbol: string, companyName: string, currentPrice: number, maxQuantity: number) => void;
}

type SortField = 'displaySymbol' | 'quantity' | 'currentValue' | 'unrealizedPnL' | 'dayChangePercent';

export default function PortfolioTable({ holdings, onSell }: PortfolioTableProps) {
    const [sortField, setSortField] = useState<SortField>('unrealizedPnL');
    const [sortAsc, setSortAsc] = useState(false);
    const [hoveredRow, setHoveredRow] = useState<string | null>(null);

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortAsc(!sortAsc);
        } else {
            setSortField(field);
            setSortAsc(false);
        }
    };

    const sortedHoldings = [...holdings].sort((a, b) => {
        const valA = a[sortField];
        const valB = b[sortField];

        if (typeof valA === 'string' && typeof valB === 'string') {
            return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }

        if (typeof valA === 'number' && typeof valB === 'number') {
            return sortAsc ? valA - valB : valB - valA;
        }

        return 0;
    });

    if (holdings.length === 0) {
        return (
            <div style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                padding: '4rem 2rem',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem' }}>No holdings yet</h3>
                <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Use the order panel to buy your first stock.</p>
            </div>
        );
    }

    return (
        <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            overflow: 'hidden'
        }}>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
                    <thead>
                        <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)' }}>
                            <th 
                                onClick={() => handleSort('displaySymbol')} 
                                aria-sort={sortField === 'displaySymbol' ? (sortAsc ? 'ascending' : 'descending') : 'none'}
                                style={{ padding: '1rem', textAlign: 'left', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 500 }}
                            >
                                Company <SortIcon field="displaySymbol" sortField={sortField} sortAsc={sortAsc} />
                            </th>
                            <th 
                                onClick={() => handleSort('quantity')} 
                                aria-sort={sortField === 'quantity' ? (sortAsc ? 'ascending' : 'descending') : 'none'}
                                style={{ padding: '1rem', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 500 }}
                            >
                                Qty <SortIcon field="quantity" sortField={sortField} sortAsc={sortAsc} />
                            </th>
                            <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 500 }}>
                                Avg Price
                            </th>
                            <th 
                                onClick={() => handleSort('dayChangePercent')} 
                                aria-sort={sortField === 'dayChangePercent' ? (sortAsc ? 'ascending' : 'descending') : 'none'}
                                style={{ padding: '1rem', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 500 }}
                            >
                                LTP / Day Chg <SortIcon field="dayChangePercent" sortField={sortField} sortAsc={sortAsc} />
                            </th>
                            <th 
                                onClick={() => handleSort('currentValue')} 
                                aria-sort={sortField === 'currentValue' ? (sortAsc ? 'ascending' : 'descending') : 'none'}
                                style={{ padding: '1rem', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 500 }}
                            >
                                Current Value <SortIcon field="currentValue" sortField={sortField} sortAsc={sortAsc} />
                            </th>
                            <th 
                                onClick={() => handleSort('unrealizedPnL')} 
                                aria-sort={sortField === 'unrealizedPnL' ? (sortAsc ? 'ascending' : 'descending') : 'none'}
                                style={{ padding: '1rem', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 500 }}
                            >
                                P&L <SortIcon field="unrealizedPnL" sortField={sortField} sortAsc={sortAsc} />
                            </th>
                            <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 500 }}>
                                Action
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedHoldings.map((h) => {
                            const isGain = h.unrealizedPnL >= 0;
                            const isDayGain = h.dayChange >= 0;
                            const isHovered = hoveredRow === h.symbol;
                            
                            // Custom color variables and backgrounds
                            const pnlColor = isGain ? 'var(--gain)' : 'var(--loss)';
                            const dayColor = isDayGain ? 'var(--gain)' : 'var(--loss)';
                            
                            // Background based on gain/loss & hover state
                            const baseBg = isGain ? 'var(--gain-glow)' : 'var(--loss-glow)';
                            const hoverBg = isGain ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)';
                            const rowBackground = isHovered ? hoverBg : baseBg;
                            
                            // Left border color for indicators
                            const indicatorBorder = isGain ? '2px solid var(--gain)' : '2px solid var(--loss)';
                            
                            return (
                                <tr 
                                    key={h.symbol} 
                                    onMouseEnter={() => setHoveredRow(h.symbol)}
                                    onMouseLeave={() => setHoveredRow(null)}
                                    style={{ 
                                        background: rowBackground,
                                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                                        transition: 'background-color 0.2s ease-in-out'
                                    }}
                                >
                                    <td style={{ 
                                        padding: '1rem', 
                                        textAlign: 'left',
                                        borderLeft: indicatorBorder
                                    }}>
                                        <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '2px' }}>{h.displaySymbol}</div>
                                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>
                                            {h.companyName}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem', fontSize: '14px', fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>
                                        {h.quantity}
                                    </td>
                                    <td style={{ padding: '1rem', fontSize: '14px', fontVariantNumeric: 'tabular-nums' }}>
                                        ₹{formatINR(h.avgBuyPrice)}
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ fontWeight: 500, fontSize: '14px', fontVariantNumeric: 'tabular-nums' }}>₹{formatINR(h.currentPrice)}</div>
                                        <div style={{ fontSize: '12px', color: dayColor, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                                            {isDayGain ? '▲ ' : '▼ '}{isDayGain ? '+' : ''}{formatINR(h.dayChangePercent)}%
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ fontWeight: 500, fontSize: '14px', fontVariantNumeric: 'tabular-nums' }}>₹{formatINR(h.currentValue)}</div>
                                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}>
                                            Inv: ₹{formatINR(h.totalInvested)}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ fontWeight: 600, fontSize: '14px', color: pnlColor, fontVariantNumeric: 'tabular-nums' }}>
                                            {isGain ? '▲ ' : '▼ '}{formatPnL(h.unrealizedPnL)}
                                        </div>
                                        <div style={{ fontSize: '12px', color: pnlColor, fontVariantNumeric: 'tabular-nums' }}>
                                            {isGain ? '+' : ''}{formatINR(h.unrealizedPnLPercent)}%
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <button
                                            onClick={() => onSell(h.symbol, h.companyName, h.currentPrice, h.quantity)}
                                            style={{
                                                background: 'transparent',
                                                border: `1px solid ${pnlColor}`,
                                                color: pnlColor,
                                                borderRadius: '6px',
                                                padding: '6px 16px',
                                                fontSize: '12px',
                                                fontWeight: 700,
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = pnlColor;
                                                e.currentTarget.style.color = 'var(--surface)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = 'transparent';
                                                e.currentTarget.style.color = pnlColor;
                                            }}
                                        >
                                            SELL
                                        </button>
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

interface SortIconProps {
    field: SortField;
    sortField: SortField;
    sortAsc: boolean;
}

function SortIcon({ field, sortField, sortAsc }: SortIconProps) {
    if (sortField !== field) return null;
    return sortAsc ? <ChevronUp size={14} style={{ display: 'inline', marginLeft: '4px' }} /> : <ChevronDown size={14} style={{ display: 'inline', marginLeft: '4px' }} />;
}

"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, Briefcase, Activity } from 'lucide-react';
import { EnrichedPortfolio } from '@/types/paperTrading';
import { formatINR } from '@/lib/format';

interface PortfolioSummaryProps {
    portfolio: EnrichedPortfolio;
    tradeCount?: number;
}

export default function PortfolioSummary({ portfolio, tradeCount = 0 }: PortfolioSummaryProps) {
    const isPositiveReturn = portfolio.totalReturnPercent >= 0;
    const isPositiveDay = portfolio.dayPnL >= 0;

    const cards = [
        {
            title: 'Portfolio Value',
            value: `₹${formatINR(portfolio.totalPortfolioValue)}`,
            icon: <Briefcase size={20} />,
            color: isPositiveReturn ? '#10b981' : '#ef4444'
        },
        {
            title: 'Cash Available',
            value: `₹${formatINR(portfolio.cashBalance)}`,
            icon: <DollarSign size={20} />,
            color: 'var(--text-primary)',
            progress: (portfolio.cashBalance / portfolio.totalPortfolioValue) * 100
        },
        {
            title: 'Total Return',
            value: `${isPositiveReturn ? '+' : ''}${formatINR(portfolio.totalReturnPercent || 0)}%`,
            subValue: `${isPositiveReturn ? '+' : '-'}₹${formatINR(Math.abs(portfolio.totalPortfolioValue - portfolio.startingBalance))}`,
            icon: isPositiveReturn ? <TrendingUp size={20} /> : <TrendingDown size={20} />,
            color: isPositiveReturn ? '#10b981' : '#ef4444'
        },
        {
            title: "Day's P&L",
            value: `${isPositiveDay ? '+' : '-'}₹${formatINR(Math.abs(portfolio.dayPnL))}`,
            icon: <Activity size={20} />,
            color: isPositiveDay ? '#10b981' : '#ef4444'
        },
        {
            title: 'Invested',
            value: `₹${formatINR(portfolio.totalInvestedValue)}`,
            icon: <Briefcase size={20} />,
            color: 'var(--text-primary)'
        }
    ];

    return (
        <div style={{ marginBottom: '2rem' }}>
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '1rem',
                marginBottom: '1rem'
            }}>
                {cards.map((card, index) => (
                    <motion.div
                        key={card.title}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.07 }}
                        style={{
                            background: 'var(--surface)',
                            border: '1px solid var(--border)',
                            borderRadius: '16px',
                            padding: '1.5rem',
                            display: 'flex',
                            flexDirection: 'column'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                            <span style={{ fontSize: '13px', fontWeight: 500 }}>{card.title}</span>
                            <span style={{ color: card.color, opacity: 0.8 }}>{card.icon}</span>
                        </div>
                        
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: card.color }}>
                            {card.value}
                        </div>

                        {card.subValue && (
                            <div style={{ fontSize: '12px', color: card.color, opacity: 0.8, marginTop: '4px' }}>
                                {card.subValue}
                            </div>
                        )}

                        {card.progress !== undefined && (
                            <div style={{ width: '100%', height: '4px', background: 'var(--border)', borderRadius: '2px', marginTop: '12px', overflow: 'hidden' }}>
                                <div style={{ width: `${card.progress}%`, height: '100%', background: '#6366f1' }} />
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>

            <div style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '0.75rem 1rem',
                fontSize: '13px',
                color: 'var(--text-secondary)',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '12px',
                alignItems: 'center'
            }}>
                <span>Started with ₹10,00,000</span>
                <span>•</span>
                <span>{portfolio.holdings.length} holdings</span>
                <span>•</span>
                <span>{tradeCount} trades</span>
                <span>•</span>
                <span>Brokerage ₹20/trade</span>
            </div>
        </div>
    );
}

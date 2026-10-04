"use client";

import React from 'react';
import StockChatPanel from '../chat/StockChatPanel';
import { Sparkles } from 'lucide-react';

interface AIAnalystChatProps {
    symbol: string;
    stockName: string;
    price: number;
    changePercent: number;
    sentimentPolarity: number;
    verdictText: string;
    newsHeadlines: string[];
}

export default function AIAnalystChat(props: AIAnalystChatProps) {
    const { symbol, stockName, price, changePercent, sentimentPolarity, verdictText, newsHeadlines } = props;

    return (
        <div style={{
            background: 'var(--surface, #1a1a2e)',
            border: '1px solid var(--border, rgba(255,255,255,0.12))',
            borderRadius: '16px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            marginTop: '2rem'
        }}>
            <div style={{
                padding: '16px',
                background: 'rgba(255,255,255,0.02)',
                borderBottom: '1px solid var(--border, rgba(255,255,255,0.1))',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
            }}>
                <Sparkles size={20} color="#8b5cf6" />
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>
                    AI Analysis — Ask about {stockName || symbol}
                </h3>
            </div>
            <div style={{ minHeight: '300px', display: 'flex', flexDirection: 'column' }}>
                <StockChatPanel 
                    symbol={symbol}
                    stockName={stockName}
                    embedded={true}
                    initialContext={{
                        price,
                        changePercent,
                        sentiment: sentimentPolarity,
                        verdict: verdictText,
                        newsHeadlines
                    }}
                />
            </div>
        </div>
    );
}

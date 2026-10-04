import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Paper Trading | TradeVision',
    description: 'Practice trading with ₹10,00,000 virtual cash. No real money, real market prices.'
};

export default function PaperTradingLayout({ children }: { children: React.ReactNode }) {
    return (
        <div style={{ width: '100%', minHeight: '100vh', background: 'var(--background)' }}>
            {children}
        </div>
    );
}

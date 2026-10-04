"use client";

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { EnrichedPortfolio } from '@/types/paperTrading';
import { formatINR } from '@/lib/format';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import { trackTradeAction } from '@/lib/analytics';

import PortfolioSummary from '@/components/paper-trading/PortfolioSummary';
import DisclaimerBanner from '@/components/DisclaimerBanner';
import PortfolioTable from '@/components/paper-trading/PortfolioTable';
import OrderPanel from '@/components/paper-trading/OrderPanel';
import TradeHistory from '@/components/paper-trading/TradeHistory';
import Analytics from '@/components/paper-trading/Analytics';
import Leaderboard from '@/components/paper-trading/Leaderboard';
import SellModal from '@/components/paper-trading/SellModal';

type TabType = 'dashboard' | 'history' | 'analytics' | 'leaderboard';

export default function PaperTradingPage() {
    const { user, loading: authLoading } = useAuth();
    const token = user?.accessToken || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
    const router = useRouter();

    const [portfolio, setPortfolio] = useState<EnrichedPortfolio | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabType>('dashboard');
    
    // Modal & Order Panel State
    const [sellModalOpen, setSellModalOpen] = useState(false);
    const [sellModalData, setSellModalData] = useState<{ symbol: string, companyName: string, currentPrice: number, avgBuyPrice: number, maxQuantity: number } | null>(null);
    const [orderPanelPrefill, setOrderPanelPrefill] = useState<{ symbol?: string, action?: 'BUY' | 'SELL', maxQty?: number } | null>(null);

    const [resetOpen, setResetOpen] = useState(false);
    const [resetting, setResetting] = useState(false);
    const [resetError, setResetError] = useState<string | null>(null);

    const fetchPortfolio = useCallback(async () => {
        if (!token) return;
        try {
            const res = await fetch('/api/paper-trading/portfolio', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setPortfolio(data.portfolio);
            }
        } catch (error) {
            console.error('Failed to fetch portfolio', error);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        if (authLoading) return;
        if (!token) {
            router.push('/login?redirect=/paper-trading');
            return;
        }

        fetchPortfolio();

        // Update leaderboard in background
        fetch('/api/paper-trading/leaderboard', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        }).catch(() => {}); // Fire and forget

        // Poll every 30s for live portfolio updates
        const interval = setInterval(fetchPortfolio, 30000);
        return () => clearInterval(interval);
    }, [token, authLoading, router, fetchPortfolio]);

    const handleSellClick = (symbol: string, companyName: string, currentPrice: number, maxQuantity: number) => {
        const holding = portfolio?.holdings.find(h => h.symbol === symbol);
        if (!holding) return;

        setSellModalData({
            symbol,
            companyName,
            currentPrice,
            avgBuyPrice: holding.avgBuyPrice,
            maxQuantity
        });
        setSellModalOpen(true);
    };

    const handleModalConfirm = async (quantity: number, notes: string) => {
        if (!sellModalData || !token) return;

        trackTradeAction('SELL', sellModalData.symbol);

        const res = await fetch('/api/paper-trading/trade', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                symbol: sellModalData.symbol,
                action: 'SELL',
                quantity,
                notes
            })
        });

        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.error || 'Trade failed');
        }

        setSellModalOpen(false);
        fetchPortfolio();
    };

    const handleResetPortfolio = async () => {
        if (!token) return;
        setResetting(true);
        setResetError(null);
        try {
            const res = await fetch('/api/paper-trading/portfolio', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ action: 'RESET', confirm: true })
            });
            const data = await res.json();
            if (!res.ok) {
                setResetError(data.error || 'Reset failed');
            } else {
                setResetOpen(false);
                fetchPortfolio();
            }
        } catch (error: any) {
            setResetError(error.message || 'Network error');
        } finally {
            setResetting(false);
        }
    };

    if (loading || !portfolio) {
        return <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading your paper trading terminal...</div>;
    }

    const isProfitable = portfolio.totalUnrealizedPnL >= 0;

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '1.5rem', paddingBottom: '100px' }}>
            <DisclaimerBanner />
            {/* Hero Banner */}
            <div style={{
                background: isProfitable 
                    ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(5, 150, 105, 0.05))'
                    : 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.05))',
                border: `1px solid ${isProfitable ? 'rgba(16, 185, 129, 0.3)' : 'rgba(99, 102, 241, 0.3)'}`,
                borderRadius: '20px',
                padding: '2.5rem',
                marginBottom: '2rem',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <h1 style={{ margin: '0 0 1rem 0', fontSize: '2.5rem', fontWeight: 800 }}>
                    {isProfitable ? '🚀 You\'re up ' : 'Keep going — ₹'}
                    {isProfitable ? `${(portfolio.totalReturnPercent || 0).toFixed(2)}%` : formatINR(portfolio.totalInvestedValue)}
                    {isProfitable && ` — ₹${formatINR(portfolio.totalUnrealizedPnL)} in profits!`}
                    {!isProfitable && ` invested across ${portfolio.holdings.length} stocks.`}
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', margin: 0 }}>
                    Risk-free paper trading with live NSE market data.
                </p>
            </div>

            {/* Tab Navigation */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '2rem', overflowX: 'auto', paddingBottom: '8px' }}>
                {(['dashboard', 'history', 'analytics', 'leaderboard'] as TabType[]).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            padding: '10px 24px',
                            background: activeTab === tab ? 'var(--text-primary)' : 'rgba(255,255,255,0.05)',
                            color: activeTab === tab ? 'var(--surface)' : 'var(--text-secondary)',
                            border: 'none',
                            borderRadius: '30px',
                            fontSize: '14px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            textTransform: 'capitalize',
                            transition: 'all 0.2s',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div>
                {activeTab === 'dashboard' && (
                    <>
                        <PortfolioSummary portfolio={portfolio} />
                        
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 380px',
                            gap: '1.5rem',
                            alignItems: 'start'
                        }}>
                            <style>{`
                                @media (max-width: 1024px) {
                                    div[style*="grid-template-columns: 1fr 380px"] {
                                        grid-template-columns: 1fr !important;
                                    }
                                }
                            `}</style>
                            
                            <div>
                                <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.2rem' }}>Current Holdings</h3>
                                <PortfolioTable 
                                    holdings={portfolio.holdings} 
                                    onSell={handleSellClick}
                                />
                            </div>
                            
                            <div style={{ position: 'sticky', top: '24px' }}>
                                <OrderPanel 
                                    cashBalance={portfolio.cashBalance}
                                    onTradeExecuted={fetchPortfolio}
                                    prefillSymbol={orderPanelPrefill?.symbol}
                                    prefillAction={orderPanelPrefill?.action}
                                    prefillMaxQty={orderPanelPrefill?.maxQty}
                                />
                            </div>
                        </div>

                        {/* Reset Portfolio Accordion */}
                        <div style={{ marginTop: '4rem', borderTop: '1px solid var(--border)', paddingTop: '2rem' }}>
                            <button
                                onClick={() => setResetOpen(!resetOpen)}
                                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px' }}
                            >
                                <RefreshCw size={16} /> Reset Portfolio
                            </button>
                            
                            {resetOpen && (
                                <div style={{ marginTop: '1rem', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', padding: '1.5rem', maxWidth: '600px' }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                                        <AlertTriangle color="#ef4444" size={24} style={{ flexShrink: 0 }} />
                                        <div>
                                            <h4 style={{ margin: '0 0 8px 0', color: '#ef4444', fontSize: '1rem' }}>Danger Zone</h4>
                                            <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                                This will permanently delete all your trade history, holdings, and reset your balance back to ₹10,00,000. This action cannot be undone. You can only reset your portfolio once every 24 hours.
                                            </p>
                                            
                                            {resetError && <div style={{ color: '#ef4444', fontSize: '13px', marginBottom: '12px' }}>{resetError}</div>}
                                            
                                            <button
                                                onClick={handleResetPortfolio}
                                                disabled={resetting}
                                                style={{ background: '#ef4444', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 600, cursor: resetting ? 'not-allowed' : 'pointer', opacity: resetting ? 0.7 : 1 }}
                                            >
                                                {resetting ? 'Resetting...' : 'Yes, erase everything & restart'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}

                {activeTab === 'history' && <TradeHistory />}
                
                {activeTab === 'analytics' && <Analytics holdings={portfolio.holdings} />}
                
                {activeTab === 'leaderboard' && <Leaderboard />}
            </div>

            {/* Sell Modal */}
            {sellModalData && (
                <SellModal
                    open={sellModalOpen}
                    onClose={() => setSellModalOpen(false)}
                    onConfirm={handleModalConfirm}
                    {...sellModalData}
                />
            )}
        </div>
    );
}

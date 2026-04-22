"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowUpRight, ArrowDownRight, Heart } from 'lucide-react';
import { useWatchlist } from '@/context/WatchlistContext';
import { useAuth } from '@/context/AuthContext';
import Overview from '@/components/company/Overview';
import News from '@/components/company/News';
import Events from '@/components/company/Events';
import TradingChart from '@/components/company/TradingChart';
import TryAgain from '@/components/TryAgain';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import SentimentDashboard from '@/components/company/SentimentDashboard';
import AnalystVerdict from '@/components/company/AnalystVerdict';
import styles from './page.module.css';
import { MarketFeature } from '@/lib/features';

// Mock Data Generator for Indian Stocks (Metadata only)
const getCompanyMetadata = (id: string) => {
    const names: Record<string, string> = {
        reliance: 'Reliance Industries Ltd',
        tcs: 'Tata Consultancy Services',
        hdfcbank: 'HDFC Bank Limited',
        infy: 'Infosys Limited',
        icicibank: 'ICICI Bank Ltd',
        tatamotors: 'Tata Motors Limited'
    };

    const mdCeos: Record<string, string> = {
        reliance: 'Mukesh Ambani',
        tcs: 'K. Krithivasan',
        hdfcbank: 'Sashidhar Jagdishan',
        infy: 'Salil Parekh',
        icicibank: 'Sandeep Bakhshi',
        tatamotors: 'Marc Llistosella'
    };

    return {
        id,
        name: names[id] || id.toUpperCase(),
        mdCeo: mdCeos[id] || 'N/A',
        about: `${names[id] || id.toUpperCase()} is a leading Indian company listed on NSE and BSE.`,
        // Enhanced Mock Fundamentals
        mktCap: '₹12.5T',
        roe: 18.5,
        eps: 145.20,
        pbRatio: 4.5,
        industryPe: 22.4,
        bookValue: 450.00,
        debtToEquity: 0.45,
        yearLow: 2100.00,
        yearHigh: 2800.00,
        financials: [
            { year: '2021', revenue: 45000, profit: 8500, networth: 120000 },
            { year: '2022', revenue: 52000, profit: 9800, networth: 135000 },
            { year: '2023', revenue: 58000, profit: 11200, networth: 150000 },
            { year: '2024', revenue: 65000, profit: 12500, networth: 168000 },
        ],
        shareHolding: {
            promoters: 50.2,
            fii: 22.5,
            dii: 15.3,
            public: 12.0
        },
        news: [
            { id: 1, title: 'Quarterly results exceed expectations', source: 'MoneyControl', time: '2h ago', summary: 'The company reported a 15% jump in net profit.', url: 'https://www.moneycontrol.com', description: 'Net profit rose 15% year-on-year to ₹12,500 crore, beating street estimates of ₹11,000 crore. Revenue from operations grew 12% driven by strong retail demand.' },
            { id: 2, title: 'New strategic partnership announced', source: 'Economic Times', time: '5h ago', summary: 'Aims to expand digital footprint.', url: 'https://economictimes.indiatimes.com', description: 'The company has sealed a strategic pact with a global tech giant to accelerate its digital transformation journey and expand its cloud capabilities.' },
            { id: 3, title: 'Stock hits 52-week high', source: 'CNBC TV18', time: '1d ago', summary: 'Rally driven by strong foreign inflows.', url: 'https://www.cnbctv18.com', description: 'Shares surged over 4% in intraday trade to hit a fresh 52-week high, tracking positive global cues and sustained buying by foreign institutional investors.' },
        ],
        events: [
            { id: 1, title: 'Q3 FY24 Results', date: '2024-01-15', type: 'result' as const },
            { id: 2, title: 'Interim Dividend', date: '2024-02-05', type: 'dividend' as const },
            { id: 3, title: 'AGM', date: '2024-06-20', type: 'other' as const },
        ]
    };
};

export default function CompanyPage() {
    const params = useParams();
    const resolvedParams = { id: params.id as string };
    const { user, loading } = useAuth();
    const router = useRouter();
    const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();
    const [activeTab, setActiveTab] = useState<'overview' | 'news' | 'events'>('overview');

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    // Metadata is static for now
    const [metadata] = useState(getCompanyMetadata(resolvedParams.id));

    // Dynamic Data from Features API
    const [features, setFeatures] = useState<MarketFeature | null>(null);
    const [loadingFeatures, setLoadingFeatures] = useState(true);

    const isOnline = useNetworkStatus();

    const [predictionData, setPredictionData] = useState<{ time: string; predictedPrice: number }[]>([]);


    const [chartData, setChartData] = useState<{ time: string; price: number }[]>([]);
    const [chartLoading, setChartLoading] = useState(true);
    const [predictionMetrics, setPredictionMetrics] = useState<{ rmse: number; mae: number; mape: number } | null>(null);

    // Helper to fetch chart data
    const fetchChartForPeriod = async (period: string) => {
        setChartLoading(true);
        try {
            const { fetchChartData, getStockSymbol } = await import('@/lib/api');
            const { calculateTrend } = await import('@/lib/analysis/prediction');

            const symbol = getStockSymbol(resolvedParams.id);

            // Map period to API params
            let range = '1mo';
            let interval = '1d';

            switch (period) {
                case '1D': range = '1d'; interval = '5m'; break;
                case '1W': range = '5d'; interval = '15m'; break;
                case '1M': range = '1mo'; interval = '1d'; break;
                case '3M': range = '3mo'; interval = '1d'; break;
                case '6M': range = '6mo'; interval = '1d'; break;
                case '1Y': range = '1y'; interval = '1d'; break;
                case '3Y': range = '2y'; interval = '1wk'; break; // Yahoo 2y limit for some intervals, trying 2y weekly
                case '5Y': range = '5y'; interval = '1mo'; break;
                case 'All': range = '10y'; interval = '1mo'; break; // Max often maps to 10y or more
                default: range = '1mo'; interval = '1d';
            }

            const chartResponse = await fetchChartData(symbol, range, interval);

            type ChartResponse = { data: { time: string; price: number }[] };
            const isValidChartResponse = (response: unknown): response is ChartResponse => {
                return typeof response === 'object' && response !== null && 'data' in response && Array.isArray((response as Record<string, unknown>).data);
            };

            if (isValidChartResponse(chartResponse) && chartResponse.data.length > 0) {
                const historicalData = chartResponse.data.map((d) => ({
                    time: d.time,
                    price: d.price
                }));

                setChartData(historicalData);

                // Run Prediction (only meaningful for daily timeframe enough for trend)
                // Skip for very short intraday or very long monthly if needed
                const prices = historicalData.map(d => d.price);
                const prediction = calculateTrend(prices, 7);

                if (prediction.metrics) {
                    setPredictionMetrics(prediction.metrics);
                }

                const lastDate = new Date();
                const next7Days = prediction.forecast.map((p, i) => {
                    const d = new Date(lastDate);
                    d.setDate(d.getDate() + i + 1);
                    return {
                        time: d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
                        predictedPrice: p.y
                    };
                });
                setPredictionData(next7Days);
            }
        } catch (error) {
            console.error('Failed to load chart data:', error);
        } finally {
            setChartLoading(false);
        }
    };

    // Calculate Sentiment from Graph Data
    const calculateGraphSentiment = (data: { time: string; price: number }[]) => {
        if (!data || data.length < 2) return { polarity: 0, positive: 0, negative: 0, neutral: 1, subjectivity: 0.1 };

        let up = 0;
        let down = 0;
        let flat = 0;

        for (let i = 1; i < data.length; i++) {
            const change = data[i].price - data[i - 1].price;
            const threshold = data[i - 1].price * 0.0001; // 0.01% threshold for neutral

            if (change > threshold) up++;
            else if (change < -threshold) down++;
            else flat++;
        }

        const total = data.length - 1;
        const positive = up / total;
        const negative = down / total;
        const neutral = flat / total;

        // Polarity: Scale from -1 (all negative) to 1 (all positive)
        const polarity = positive - negative;

        // Subjectivity: Higher volatility could imply higher subjectivity/uncertainty
        // Simple proxy: (positive + negative) vs neutral. More movement = more "subjective" action? 
        // Or just keep it low as technicals are objective.
        const subjectivity = 0.2 + (positive + negative) * 0.3;

        return { polarity, positive, negative, neutral, subjectivity };
    };

    const graphSentiment = calculateGraphSentiment(chartData);

    // Load Initial Chart Data (1M default)
    useEffect(() => {
        fetchChartForPeriod('1M');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [resolvedParams.id]);

    // Fetch Features Data
    useEffect(() => {
        const fetchFeatures = async () => {
            setLoadingFeatures(true);
            try {
                const response = await fetch(`/api/features?id=${resolvedParams.id}`);
                if (response.ok) {
                    const data = await response.json();
                    setFeatures(data);
                } else {
                    console.error('Failed to fetch features');
                }
            } catch (error) {
                console.error('Error fetching features:', error);
            } finally {
                setLoadingFeatures(false);
            }
        };

        fetchFeatures();
    }, [resolvedParams.id]);

    if (loading || !user) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '1rem' }}>
                <div className="spinner" style={{ width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                <p>Verifying Access...</p>
                <style jsx>{`
                    @keyframes spin {
                        to { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        );
    }

    if (!isOnline) return <TryAgain />;

    // Combine metadata with dynamic features for the view
    const companyView = {
        ...metadata,
        price: features?.price || 0,
        change: features?.price && features.open ? features.price - features.open : 0,
        changePercent: features?.price && features.open ? ((features.price - features.open) / features.open) * 100 : 0,
        symbol: features?.symbol || resolvedParams.id.toUpperCase(),
        open: features?.open || 0,
        dayHigh: features?.high || 0,
        dayLow: features?.low || 0,
        prevClose: features?.close || 0,
        volume: features?.volume?.toString() || '0'
    };

    const isPositive = companyView.change >= 0;

    return (
        <div className="container">
            <div className={styles.header}>
                <div className={styles.topRow}>
                    <div className={styles.companyInfo}>
                        <h1>{companyView.name}</h1>
                        <span className={styles.symbol}>{companyView.symbol}</span>
                    </div>
                    {loadingFeatures ? (
                        <div className={styles.priceInfo}>Loading...</div>
                    ) : (
                        <div className={styles.priceInfo}>
                            <span className={styles.price}>₹{companyView.price.toFixed(2)}</span>
                            <div className={`${styles.change} ${isPositive ? styles.positive : styles.negative}`}>
                                {isPositive ? <ArrowUpRight size={24} /> : <ArrowDownRight size={24} />}
                                {Math.abs(companyView.change).toFixed(2)} ({Math.abs(companyView.changePercent).toFixed(2)}%)
                            </div>
                        </div>
                    )}
                    <button
                        onClick={() => {
                            if (isInWatchlist(resolvedParams.id)) {
                                removeFromWatchlist(resolvedParams.id);
                            } else {
                                addToWatchlist(resolvedParams.id);
                            }
                        }}
                        style={{
                            background: 'rgba(255,255,255,0.1)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '12px',
                            padding: '0.8rem 1.2rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            color: isInWatchlist(resolvedParams.id) ? '#ef4444' : 'rgba(255,255,255,0.8)',
                            fontSize: '0.95rem',
                            fontWeight: 500,
                            marginLeft: 'auto',
                            transition: 'all 0.2s ease',
                            height: 'fit-content',
                            alignSelf: 'center'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                    >
                        <Heart size={20} fill={isInWatchlist(resolvedParams.id) ? 'currentColor' : 'none'} />
                        {isInWatchlist(resolvedParams.id) ? 'Watchlisted' : 'Add to Watchlist'}
                    </button>
                </div>
            </div>

            {/* Main Viz Area: Chart + Verdict */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                <TradingChart
                    data={chartData}
                    predictionData={predictionData}
                    isPositive={isPositive}
                    onRangeChange={fetchChartForPeriod}
                    isLoading={chartLoading}
                />

                {/* Right Side Analysis Panel */}
                <div style={{ padding: '1rem' }}>
                    {loadingFeatures ? (
                        <div style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            borderRadius: '16px',
                            padding: '2rem',
                            marginTop: '1.5rem',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '1rem'
                        }}>
                            <div className="spinner" style={{ width: '30px', height: '30px', border: '2px solid rgba(255,255,255,0.1)', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                            <span style={{ opacity: 0.6, fontSize: '0.9rem' }}>Analyzing Market Data...</span>
                            <style jsx>{`
                                @keyframes spin {
                                    to { transform: rotate(360deg); }
                                }
                             `}</style>
                        </div>
                    ) : features ? (
                        <>
                            <AnalystVerdict
                                verdict={features.verdict} // Using robust decision from server
                                reason={features.verdictReason || `Sentiment Polarity: ${graphSentiment.polarity.toFixed(2)}`}
                                metrics={{
                                    price: features.price,
                                    prediction: predictionData.length > 0 ? predictionData[predictionData.length - 1].predictedPrice : features.price,
                                    sentiment: graphSentiment.polarity,
                                    // Calculate trend from chart data (Last Price - First Price) / First Price * 100
                                    trend: chartData.length > 0
                                        ? ((chartData[chartData.length - 1].price - chartData[0].price) / chartData[0].price) * 100
                                        : 0,
                                    accuracy: predictionMetrics ?? undefined
                                }}
                            />
                            <SentimentDashboard
                                polarity={graphSentiment.polarity}
                                subjectivity={graphSentiment.subjectivity}
                                positive={graphSentiment.positive}
                                negative={graphSentiment.negative}
                                neutral={graphSentiment.neutral}
                                keywords={[]}
                            />
                        </>
                    ) : (
                        <div style={{ padding: '2rem', textAlign: 'center', color: '#ef4444' }}>
                            Failed to load analysis.
                        </div>
                    )}
                </div>
            </div>

            <div className={styles.tabs}>
                <button className={`${styles.tab} ${activeTab === 'overview' ? styles.activeTab : ''}`} onClick={() => setActiveTab('overview')}>Overview</button>
                <button className={`${styles.tab} ${activeTab === 'news' ? styles.activeTab : ''}`} onClick={() => setActiveTab('news')}>News</button>
                <button className={`${styles.tab} ${activeTab === 'events' ? styles.activeTab : ''}`} onClick={() => setActiveTab('events')}>Events</button>
            </div>

            <div className={styles.content}>
                {activeTab === 'overview' && <Overview company={companyView as unknown as React.ComponentProps<typeof Overview>['company']} />}
                {activeTab === 'news' && <News news={metadata.news} />}
                {activeTab === 'events' && <Events events={metadata.events} />}
            </div>
        </div >
    );
}

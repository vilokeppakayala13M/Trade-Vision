"use client";

import { useState, useMemo, useEffect, useRef } from 'react';
import { ComposedChart, Area, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Scatter } from 'recharts';
import { toast } from 'sonner';
import styles from './TradingChart.module.css';

interface TradingChartProps {
    data: { time: string; price: number }[];
    predictionData?: { time: string; predictedPrice: number }[];
    isPositive: boolean;
    onRangeChange: (range: string) => void;
    isLoading?: boolean;
}

interface SearchQuote {
    symbol: string;
    shortname?: string;
    exchange?: string;
    typeDisp?: string;
}

const TIME_PERIODS = ['1D', '1W', '1M', '3M', '6M', '1Y', '3Y', '5Y', 'All'];

function ChartSkeleton() {
    const barHeights = [65, 72, 58, 80, 75, 62, 88, 70, 55, 78, 83, 69, 74, 60, 85, 71, 66, 79, 73, 68];

    return (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', padding: '1rem 1rem 0.5rem 3.5rem', gap: '4px' }}>
            <style>{`
                @keyframes shimmer {
                    0% { background-position: -200% 0 }
                    100% { background-position: 200% 0 }
                }
                .shimmer {
                    background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.09) 50%, rgba(255,255,255,0.04) 75%);
                    background-size: 200% 100%;
                    animation: shimmer 1.5s ease-in-out infinite;
                }
            `}</style>
            
            {/* Section A — fake Y-axis labels on the left */}
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: '40px', width: '48px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '1rem 0' }}>
                {[0, 1, 2, 3, 4].map((i) => (
                    <div key={i} className="shimmer" style={{ height: '10px', width: '38px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)' }} />
                ))}
            </div>

            {/* Section B — fake chart bars */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: '3px' }}>
                {barHeights.map((h, index) => (
                    <div
                        key={index}
                        className="shimmer"
                        style={{
                            flex: 1,
                            height: `${h}%`,
                            borderRadius: '3px 3px 0 0',
                            background: `rgba(255,255,255,${(0.04 + (index % 3) * 0.02).toFixed(2)})`,
                            animationDelay: `${index * 0.05}s`
                        }}
                    />
                ))}
            </div>

            {/* Section C — fake X-axis */}
            <div style={{ height: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {[0, 1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="shimmer" style={{ height: '10px', width: '32px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)' }} />
                ))}
            </div>
        </div>
    );
}

function ChartEmptyState({ onRetry }: { onRetry?: () => void }) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
            {/* Element 1 — decorative SVG ghost chart */}
            <svg width="200" height="80" viewBox="0 0 200 80" fill="none" style={{ opacity: 0.12 }}>
                <polyline points="0,60 30,45 60,50 90,30 120,35 150,20 180,25 200,15" stroke="#f59e0b" strokeWidth="2" fill="none" strokeDasharray="4 4" />
                <polyline points="0,70 30,65 60,68 90,55 120,58 150,45 180,48 200,40" stroke="#334155" strokeWidth="1.5" fill="none" />
            </svg>

            {/* Element 2 — circular icon container */}
            <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                📊
            </div>

            {/* Element 3 — text block */}
            <div style={{ textAlign: 'center' }}>
                <h4 style={{ color: '#f1f5f9', fontSize: '14px', fontWeight: 600, margin: '0 0 6px' }}>Chart data unavailable</h4>
                <p style={{ color: '#475569', fontSize: '12px', lineHeight: 1.6, maxWidth: '260px', margin: 0 }}>
                    Price history could not be loaded. Yahoo Finance may be temporarily unavailable or the market may be closed.
                </p>
            </div>

            {/* Element 4 — retry button */}
            {onRetry && (
                <button
                    onClick={onRetry}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    style={{
                        padding: '0.45rem 1.25rem',
                        background: isHovered ? 'rgba(245,158,11,0.2)' : 'rgba(245,158,11,0.1)',
                        border: '1px solid rgba(245,158,11,0.25)',
                        borderRadius: '8px',
                        color: '#fbbf24',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'background 0.15s',
                        fontFamily: 'inherit'
                    }}
                >
                    ↻ Retry
                </button>
            )}

            {/* Element 5 — hint text */}
            <p style={{ color: '#1e293b', fontSize: 11, margin: 0 }}>Try selecting a different time period below</p>
        </div>
    );
}

function ChartNoDataHint({ count }: { count: number }) {
    return (
        <div style={{ position: 'absolute', top: '8px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '20px', padding: '4px 14px', fontSize: '11px', color: '#f59e0b', whiteSpace: 'nowrap', zIndex: 5 }}>
            Only {count} data point{count === 1 ? '' : 's'} available — try a wider time range
        </div>
    );
}

export default function TradingChart({ data, predictionData, isPositive, onRangeChange, isLoading = false }: TradingChartProps) {
    const [selectedPeriod, setSelectedPeriod] = useState('1M');
    const [showSMA, setShowSMA] = useState(false);
    const [isDrawing, setIsDrawing] = useState(false);
    const [drawPoints, setDrawPoints] = useState<{ x: string; y: number }[]>([]);
    const [compareSymbol, setCompareSymbol] = useState('');
    const [isComparing, setIsComparing] = useState(false);
    const [compareData, setCompareData] = useState<{ time: string; price: number }[]>([]);
    const [isComparingLoading, setIsComparingLoading] = useState(false);
    const [suggestions, setSuggestions] = useState<SearchQuote[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [suggestionIndex, setSuggestionIndex] = useState(-1);
    const searchTimeoutRef = useRef<NodeJS.Timeout>(null);

    // Merge data for chart and calculate SMA and Comparison
    const mergedData = useMemo(() => {
        if (data.length === 0) return [];

        let finalData: Array<typeof data[0] & { sma?: number | null, comparePrice?: number, predictedPrice?: number }> = data.map(d => ({ ...d }));

        // Calculate SMA 20
        finalData = finalData.map((point, index, array) => {
            if (index < 19) return { ...point, sma: null };
            const slice = array.slice(index - 19, index + 1);
            const sum = slice.reduce((acc, curr) => acc + curr.price, 0);
            return { ...point, sma: sum / 20 };
        });

        // Add Comparison Data
        if (compareData.length > 0) {
            // Find shared time range for normalization
            const firstPrimary = finalData[0]?.price || 1;
            const firstCompare = compareData[0]?.price || 1;

            // Map comparison data to primary time points
            const compareMap = new Map(compareData.map(d => [d.time, d.price]));

            finalData = finalData.map(point => {
                const compPrice = compareMap.get(point.time);
                if (compPrice !== undefined) {
                    return { ...point, comparePrice: (compPrice / firstCompare) * firstPrimary };
                }
                return point;
            });
        }

        if (!predictionData || predictionData.length === 0) return finalData;

        const lastReal = finalData[finalData.length - 1];
        if (!lastReal) return finalData;

        // Bridge point
        const bridgePoint = { ...lastReal, predictedPrice: lastReal.price };

        return [
            ...finalData,
            bridgePoint,
            ...predictionData
        ];
    }, [data, predictionData, compareData]);

    const handleCompare = async (e?: React.FormEvent, selectedSymbol?: string) => {
        if (e) e.preventDefault();
        const symbolToCompare = selectedSymbol || compareSymbol;
        if (!symbolToCompare) return;

        setIsComparingLoading(true);
        setSuggestions([]);
        setShowSuggestions(false);

        try {
            const { fetchChartData, getStockSymbol } = await import('@/lib/api');
            const symbol = getStockSymbol(symbolToCompare);

            // Fetch the same range as current
            let range = '1mo';
            let interval = '1d';
            switch (selectedPeriod) {
                case '1D': range = '1d'; interval = '5m'; break;
                case '1W': range = '5d'; interval = '15m'; break;
                case '1M': range = '1mo'; interval = '1d'; break;
                case '3M': range = '3mo'; interval = '1d'; break;
                case '6M': range = '6mo'; interval = '1d'; break;
                case '1Y': range = '1y'; interval = '1d'; break;
                case '3Y': range = '2y'; interval = '1wk'; break;
                case '5Y': range = '5y'; interval = '1mo'; break;
                case 'All': range = '10y'; interval = '1mo'; break;
            }

            const res = await fetchChartData(symbol, range, interval) as { data?: { time: string; price: number }[] };
            if (res && res.data) {
                setCompareData(res.data);
                setIsComparing(false);
                if (selectedSymbol) setCompareSymbol(selectedSymbol);
            }
        } catch (error) {
            console.error('Failed to fetch comparison data:', error);
            toast.error("Could not load comparison data");
        } finally {
            setIsComparingLoading(false);
        }
    };

    useEffect(() => {
        if (!compareSymbol || compareSymbol.length < 2 || !isComparing) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

        searchTimeoutRef.current = setTimeout(async () => {
            const { searchStocks } = await import('@/lib/api');
            const results = await searchStocks(compareSymbol);
            setSuggestions(results);
            setShowSuggestions(results.length > 0);
            setSuggestionIndex(-1);
        }, 300);

        return () => {
            if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        };
    }, [compareSymbol, isComparing]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!showSuggestions) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSuggestionIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSuggestionIndex(prev => (prev > 0 ? prev - 1 : prev));
        } else if (e.key === 'Enter') {
            if (suggestionIndex >= 0) {
                e.preventDefault();
                const selected = suggestions[suggestionIndex];
                setCompareSymbol(selected.symbol);
                handleCompare(undefined, selected.symbol);
            }
        } else if (e.key === 'Escape') {
            setShowSuggestions(false);
        }
    };

    const handleChartClick = (e: Record<string, unknown> | null) => {
        if (!isDrawing || !e || !e.activeLabel) return;

        const time = e.activeLabel as string;
        const payload = e.activePayload as Array<{ value: number }> | undefined;
        const coord = e.activeCoordinate as { y: number } | undefined;
        const price = payload?.[0]?.value || coord?.y;

        if (price === undefined) return;

        setDrawPoints(prev => {
            if (prev.length >= 2) return [{ x: time, y: price }];
            return [...prev, { x: time, y: price }];
        });
    };

    const handlePeriodChange = (period: string) => {
        setSelectedPeriod(period);
        onRangeChange(period);
        setDrawPoints([]);
        setCompareData([]);
    };

    const hasData = Array.isArray(data) && data.length > 0;
    const color = isPositive ? '#22c55e' : '#ef4444';

    return (
        <div className={styles.container}>
            <div style={{ position: 'relative', height: 400, width: '100%' }}>
                {isLoading ? (
                    <ChartSkeleton />
                ) : !hasData ? (
                    <ChartEmptyState onRetry={() => handlePeriodChange(selectedPeriod)} />
                ) : (
                    <>
                        {data.length < 5 && <ChartNoDataHint count={data.length} />}
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart
                                data={mergedData}
                                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                                onClick={handleChartClick}
                            >
                                <defs>
                                    <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                                        <stop offset="95%" stopColor={color} stopOpacity={0} />
                                    </linearGradient>
                                    <pattern id="stripe-pattern" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                                        <rect width="4" height="8" transform="translate(0,0)" fill="white" opacity="0.3" />
                                    </pattern>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                                <XAxis
                                    dataKey="time"
                                    stroke="#64748b"
                                    tick={{ fill: '#64748b', fontSize: 11 }}
                                    tickLine={false}
                                    axisLine={false}
                                    interval="preserveStartEnd"
                                    minTickGap={30}
                                />
                                <YAxis
                                    stroke="#64748b"
                                    tick={{ fill: '#64748b', fontSize: 11 }}
                                    tickLine={false}
                                    axisLine={false}
                                    domain={['auto', 'auto']}
                                    tickFormatter={(value) => `₹${Number(value).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
                                    width={50}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#0f172a',
                                        border: '1px solid #334155',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                                    }}
                                    itemStyle={{ color: '#e2e8f0' }}
                                    labelStyle={{ color: '#94a3b8', marginBottom: '0.5rem', display: 'block' }}
                                    formatter={(value: any, name: any) => [
                                        typeof value === 'number' ? `₹${Number(value).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'N/A',
                                        name === 'predictedPrice' ? 'Forecast' : name === 'Drawn Line' ? 'Drawing' : name?.toString().startsWith('Compared:') ? name : 'Price'
                                    ]}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="price"
                                    stroke={color}
                                    fillOpacity={1}
                                    fill="url(#priceGradient)"
                                    strokeWidth={2}
                                    dot={false}
                                    activeDot={{ r: 5, fill: color, stroke: '#0f172a', strokeWidth: 2 }}
                                />
                                {showSMA && (
                                    <Line
                                        type="monotone"
                                        dataKey="sma"
                                        stroke="#f59e0b"
                                        strokeWidth={2}
                                        dot={false}
                                        activeDot={false}
                                    />
                                )}
                                <Area
                                    type="monotone"
                                    dataKey="predictedPrice"
                                    stroke="#6366f1"
                                    strokeDasharray="5 5"
                                    fill="#6366f1"
                                    fillOpacity={0.1}
                                    strokeWidth={2}
                                    connectNulls={true}
                                />

                                {compareData.length > 0 && (
                                    <Line
                                        type="monotone"
                                        dataKey="comparePrice"
                                        stroke="#ec4899"
                                        strokeWidth={2}
                                        dot={false}
                                        name={`Compared: ${compareSymbol.toUpperCase()}`}
                                    />
                                )}

                                {drawPoints.length === 2 && (
                                    <Line
                                        data={[
                                            { time: drawPoints[0].x, price: drawPoints[0].y },
                                            { time: drawPoints[1].x, price: drawPoints[1].y }
                                        ]}
                                        type="monotone"
                                        dataKey="price"
                                        stroke="#ffffff"
                                        strokeWidth={3}
                                        dot={{ r: 4, fill: '#ffffff', strokeWidth: 2 }}
                                        isAnimationActive={false}
                                        name="Drawn Line"
                                    />
                                )}

                                {drawPoints.length === 1 && (
                                    <Scatter
                                        data={[{ time: drawPoints[0].x, price: drawPoints[0].y }]}
                                        fill="#ffffff"
                                        shape="circle"
                                    />
                                )}
                            </ComposedChart>
                        </ResponsiveContainer>
                    </>
                )}

                {isDrawing && (
                    <div style={{
                        position: 'absolute',
                        top: 20,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: 'rgba(59, 130, 246, 0.9)',
                        padding: '0.4rem 1rem',
                        borderRadius: '20px',
                        color: 'white',
                        fontSize: '0.8rem',
                        zIndex: 20,
                        pointerEvents: 'none',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                    }}>
                        {drawPoints.length === 0 ? "Click to set start point" :
                            drawPoints.length === 1 ? "Click to set end point" :
                                "Line Drawn! Click again to restart"}
                    </div>
                )}
            </div>

            <div className={styles.footer}>
                <div className={styles.periodButtons}>
                    {TIME_PERIODS.map((period) => (
                        <button
                            key={period}
                            className={`${styles.periodBtn} ${selectedPeriod === period ? styles.active : ''}`}
                            onClick={() => handlePeriodChange(period)}
                            disabled={isLoading}
                        >
                            {period}
                        </button>
                    ))}
                </div>
            </div>

            {/* Chart Tools */}
            <div className={styles.toolsRow}>
                <button
                    onClick={() => setShowSMA(!showSMA)}
                    className={`${styles.toolBtn} ${showSMA ? styles.toolBtnActive : ''}`}
                    disabled={isLoading || !hasData}
                >
                    Indicators (SMA 20)
                </button>

                <button
                    onClick={() => {
                        try {
                            const svg = document.querySelector(`.${styles.container} svg`);
                            if (svg) {
                                const data = new XMLSerializer().serializeToString(svg);
                                const blob = new Blob([data], { type: 'image/svg+xml;charset=utf-8' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = 'chart.svg';
                                document.body.appendChild(a);
                                a.click();
                                document.body.removeChild(a);
                            } else {
                                throw new Error("Chart not found");
                            }
                        } catch (error) {
                            console.error(error);
                            toast.error("Could not capture chart");
                        }
                    }}
                    className={styles.toolBtn}
                    disabled={isLoading || !hasData}
                >
                    Screenshot
                </button>

                <div style={{ display: 'flex', gap: '0.2rem' }}>
                    <button
                        onClick={() => setIsDrawing(!isDrawing)}
                        className={`${styles.toolBtn} ${isDrawing ? styles.toolBtnActive : ''}`}
                        disabled={isLoading || !hasData}
                        style={{ borderRadius: '8px 0 0 8px', borderRightWidth: 0 }}
                    >
                        Draw
                    </button>
                    <button
                        onClick={() => setDrawPoints([])}
                        disabled={drawPoints.length === 0 || isLoading || !hasData}
                        className={styles.toolBtn}
                        style={{ borderRadius: '0 8px 8px 0', padding: '0.4rem 0.6rem', fontSize: '0.7rem' }}
                        title="Clear Drawing"
                    >
                        ✕
                    </button>
                </div>

                <div style={{ position: 'relative' }}>
                    <button
                        onClick={() => setIsComparing(!isComparing)}
                        className={`${styles.toolBtn} ${compareData.length > 0 ? styles.toolBtnCompare : ''}`}
                        disabled={isLoading || !hasData}
                    >
                        {compareData.length > 0 ? `Compared: ${compareSymbol.toUpperCase()}` : 'Compare'}
                    </button>

                    {isComparing && (
                        <div className={styles.compareDropdown}>
                            <form onSubmit={handleCompare} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Enter Stock Symbol (e.g. TCS, INFY)</label>
                                <input
                                    type="text"
                                    value={compareSymbol}
                                    onChange={(e) => setCompareSymbol(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    onBlur={() => {
                                        setTimeout(() => setShowSuggestions(false), 200);
                                    }}
                                    placeholder="Search symbol or name..."
                                    autoFocus
                                    className={styles.compareInput}
                                />

                                {showSuggestions && (
                                    <div className={styles.suggestionsList}>
                                        {suggestions.map((s, idx) => (
                                            <div
                                                key={s.symbol}
                                                className={`${styles.suggestionItem} ${suggestionIndex === idx ? styles.activeSuggestion : ''}`}
                                                onClick={() => {
                                                    setCompareSymbol(s.symbol);
                                                    handleCompare(undefined, s.symbol);
                                                }}
                                            >
                                                <div className={styles.suggestionMain}>
                                                    <span className={styles.suggestionSymbol}>{s.symbol}</span>
                                                    <span className={styles.suggestionName}>{s.shortname}</span>
                                                </div>
                                                <div className={styles.suggestionMeta}>
                                                    <span>{s.exchange}</span>
                                                    <span>{s.typeDisp}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button
                                        type="submit"
                                        disabled={isComparingLoading}
                                        className={styles.compareSubmit}
                                    >
                                        {isComparingLoading ? 'Loading...' : 'Compare'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsComparing(false)}
                                        className={styles.compareCancel}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

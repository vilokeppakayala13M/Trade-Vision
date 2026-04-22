"use client";

import { useState, useMemo, useEffect, useRef } from 'react';
import { ComposedChart, Area, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Scatter } from 'recharts';
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
                    // Normalized comparison price to match primary scale for visual overlay
                    // (compPrice / firstCompare) * firstPrimary
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
            alert("Could not load comparison data");
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
        // Try to get price from various sources in the payload
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
        setDrawPoints([]); // Clear drawings when period changes
        setCompareData([]); // Clear comparison when period changes
    };

    return (
        <div className={styles.container}>


            <div style={{ position: 'relative', height: 400, width: '100%' }}>
                {isLoading && (
                    <div style={{
                        position: 'absolute',
                        top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0,0,0,0.5)',
                        backdropFilter: 'blur(2px)',
                        zIndex: 10,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '16px'
                    }}>
                        <div className="spinner" style={{ width: '30px', height: '30px', border: '2px solid rgba(255,255,255,0.1)', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                        <style jsx>{`
                            @keyframes spin {
                                to { transform: rotate(360deg); }
                            }
                        `}</style>
                    </div>
                )}

                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                        data={mergedData}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                        onClick={handleChartClick}
                    >
                        <defs>
                            <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity={0.3} />
                                <stop offset="95%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity={0} />
                            </linearGradient>
                            <pattern id="stripe-pattern" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                                <rect width="4" height="8" transform="translate(0,0)" fill="white" opacity="0.3" />
                            </pattern>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.1} vertical={false} />
                        <XAxis
                            dataKey="time"
                            stroke="#64748b"
                            tick={{ fill: '#64748b', fontSize: 11 }}
                            tickLine={{ stroke: '#64748b' }}
                            interval="preserveStartEnd"
                            minTickGap={30}
                        />
                        <YAxis
                            stroke="#64748b"
                            tick={{ fill: '#64748b', fontSize: 11 }}
                            tickLine={{ stroke: '#64748b' }}
                            domain={['auto', 'auto']}
                            tickFormatter={(value) => `₹${value.toFixed(0)}`}
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
                            formatter={(value: number, name: string) => [
                                typeof value === 'number' ? `₹${value.toFixed(2)}` : 'N/A',
                                name === 'predictedPrice' ? 'Forecast' : name === 'Drawn Line' ? 'Drawing' : 'Price'
                            ]}
                        />
                        <Area
                            type="monotone"
                            dataKey="price"
                            stroke={isPositive ? "#10b981" : "#ef4444"}
                            fillOpacity={1}
                            fill="url(#priceGradient)"
                            strokeWidth={2}
                        />
                        {showSMA && (
                            <Line
                                type="monotone"
                                dataKey="sma"
                                stroke="#f59e0b" // Amber/Orange for SMA
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
                                stroke="#ec4899" // Pink for comparison
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
            <div style={{
                display: 'flex',
                gap: '1rem',
                marginTop: '1rem',
                paddingTop: '1rem',
                borderTop: '1px solid rgba(255,255,255,0.05)',
                justifyContent: 'center'
            }}>
                <button
                    onClick={() => setShowSMA(!showSMA)}
                    style={{
                        background: showSMA ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                        border: showSMA ? '1px solid #3b82f6' : '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '8px',
                        padding: '0.4rem 0.8rem',
                        color: showSMA ? '#3b82f6' : '#94a3b8',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        transition: 'all 0.2s'
                    }}
                >
                    Indicators (SMA 20)
                </button>

                <button
                    onClick={() => {
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
                            alert("Could not capture chart");
                        }
                    }}
                    style={{
                        background: 'transparent',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '8px',
                        padding: '0.4rem 0.8rem',
                        color: '#94a3b8',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem'
                    }}
                >
                    Screenshot
                </button>

                <div style={{ display: 'flex', gap: '0.2rem' }}>
                    <button
                        onClick={() => {
                            setIsDrawing(!isDrawing);
                        }}
                        style={{
                            background: isDrawing ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                            borderWidth: '1px',
                            borderStyle: 'solid',
                            borderColor: isDrawing ? '#3b82f6' : 'rgba(255,255,255,0.2)',
                            borderRightWidth: 0,
                            borderRadius: '8px 0 0 8px',
                            padding: '0.4rem 0.8rem',
                            color: isDrawing ? '#3b82f6' : '#94a3b8',
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            transition: 'all 0.2s'
                        }}
                    >
                        Draw
                    </button>
                    <button
                        onClick={() => setDrawPoints([])}
                        disabled={drawPoints.length === 0}
                        style={{
                            background: 'transparent',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '0 8px 8px 0',
                            padding: '0.4rem 0.6rem',
                            color: drawPoints.length === 0 ? 'rgba(148, 163, 184, 0.3)' : '#94a3b8',
                            fontSize: '0.7rem',
                            cursor: drawPoints.length === 0 ? 'default' : 'pointer',
                            transition: 'all 0.2s'
                        }}
                        title="Clear Drawing"
                    >
                        ✕
                    </button>
                </div>

                <div style={{ position: 'relative' }}>
                    <button
                        onClick={() => setIsComparing(!isComparing)}
                        style={{
                            background: compareData.length > 0 ? 'rgba(236, 72, 153, 0.2)' : 'transparent',
                            border: compareData.length > 0 ? '1px solid #ec4899' : '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '8px',
                            padding: '0.4rem 0.8rem',
                            color: compareData.length > 0 ? '#ec4899' : '#94a3b8',
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            transition: 'all 0.2s'
                        }}
                    >
                        {compareData.length > 0 ? `Compared: ${compareSymbol.toUpperCase()}` : 'Compare'}
                    </button>

                    {isComparing && (
                        <div style={{
                            position: 'absolute',
                            bottom: '120%',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            background: '#1e293b',
                            border: '1px solid #334155',
                            borderRadius: '12px',
                            padding: '1rem',
                            zIndex: 30,
                            minWidth: '200px',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
                        }}>
                            <form onSubmit={handleCompare} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Enter Stock Symbol (e.g. TCS, INFY)</label>
                                <input
                                    type="text"
                                    value={compareSymbol}
                                    onChange={(e) => setCompareSymbol(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    onBlur={() => {
                                        // Delay closing to allow click on suggestion
                                        setTimeout(() => setShowSuggestions(false), 200);
                                    }}
                                    placeholder="Search symbol or name..."
                                    autoFocus
                                    style={{
                                        background: '#0f172a',
                                        border: '1px solid #334155',
                                        borderRadius: '6px',
                                        padding: '0.4rem 0.6rem',
                                        color: 'white',
                                        outline: 'none'
                                    }}
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
                                        style={{
                                            flex: 1,
                                            background: '#3b82f6',
                                            border: 'none',
                                            borderRadius: '6px',
                                            padding: '0.4rem',
                                            color: 'white',
                                            fontSize: '0.8rem',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {isComparingLoading ? 'Loading...' : 'Compare'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsComparing(false)}
                                        style={{
                                            background: 'transparent',
                                            border: '1px solid #334155',
                                            borderRadius: '6px',
                                            padding: '0.4rem 0.8rem',
                                            color: '#94a3b8',
                                            fontSize: '0.8rem',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div >

    );
}

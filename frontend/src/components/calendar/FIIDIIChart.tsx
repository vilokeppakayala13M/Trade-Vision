"use client";

import React, { useMemo } from 'react';
import { ResponsiveContainer, ComposedChart, XAxis, YAxis, Tooltip, ReferenceLine, Bar, Cell, CartesianGrid } from 'recharts';
import { format, parseISO } from 'date-fns';
import { FIIDIIData } from '@/lib/calendarData';

interface FIIDIIChartProps {
    data: FIIDIIData[];
    days: 30 | 60;
    onDaysChange: (days: 30 | 60) => void;
}

export default function FIIDIIChart({ data, days, onDaysChange }: FIIDIIChartProps) {
    
    const chartData = useMemo(() => {
        return data.map(d => ({
            ...d,
            formattedDate: format(parseISO(d.date), 'd MMM'),
            fiiCr: d.fiiNet / 100, // Convert from Lakhs to Crores if assuming NSE raw is in lakhs. Or just /1 depending on data. Let's assume the fallback is directly in Crores. Wait, prompt: "Y axis in crores (divide raw values by 100 to convert from lakhs if NSE provides in lakhs, or show as-is)" Let's just use raw values as Cr to keep it simple, assuming fallback is Cr.
            // Wait, NSE fiidiiTradeReact returns in Crores. Let's use raw.
        }));
    }, [data]);

    const { fiiSum, diiSum } = useMemo(() => {
        return chartData.reduce((acc, curr) => ({
            fiiSum: acc.fiiSum + curr.fiiNet,
            diiSum: acc.diiSum + curr.diiNet
        }), { fiiSum: 0, diiSum: 0 });
    }, [chartData]);

    if (!data || data.length === 0) {
        return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading FII/DII Data...</div>;
    }

    return (
        <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            padding: '1.5rem',
            marginTop: '1.5rem'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '1.1rem' }}>Institutional Flows (FII/DII)</h3>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <div style={{ fontSize: '13px' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>FII {days}D Net: </span>
                            <span style={{ color: fiiSum >= 0 ? '#10b981' : '#ef4444', fontWeight: 'bold' }}>
                                ₹{fiiSum.toLocaleString('en-IN', { maximumFractionDigits: 0 })} Cr
                            </span>
                        </div>
                        <div style={{ fontSize: '13px' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>DII {days}D Net: </span>
                            <span style={{ color: diiSum >= 0 ? '#10b981' : '#ef4444', fontWeight: 'bold' }}>
                                ₹{diiSum.toLocaleString('en-IN', { maximumFractionDigits: 0 })} Cr
                            </span>
                        </div>
                    </div>
                </div>
                
                <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '4px', display: 'flex' }}>
                    <button 
                        onClick={() => onDaysChange(30)}
                        style={{
                            background: days === 30 ? 'var(--border)' : 'transparent',
                            color: days === 30 ? 'white' : 'var(--text-secondary)',
                            border: 'none', borderRadius: '4px', padding: '4px 12px', fontSize: '12px', cursor: 'pointer', transition: 'all 0.2s'
                        }}
                    >
                        30D
                    </button>
                    <button 
                        onClick={() => onDaysChange(60)}
                        style={{
                            background: days === 60 ? 'var(--border)' : 'transparent',
                            color: days === 60 ? 'white' : 'var(--text-secondary)',
                            border: 'none', borderRadius: '4px', padding: '4px 12px', fontSize: '12px', cursor: 'pointer', transition: 'all 0.2s'
                        }}
                    >
                        60D
                    </button>
                </div>
            </div>

            <div style={{ height: 220, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis 
                            dataKey="formattedDate" 
                            stroke="rgba(255,255,255,0.3)" 
                            fontSize={10} 
                            tickMargin={10} 
                            axisLine={false} 
                            tickLine={false}
                            minTickGap={20}
                        />
                        <YAxis 
                            stroke="rgba(255,255,255,0.3)" 
                            fontSize={10} 
                            tickFormatter={(val) => `${val >= 0 ? '+' : ''}${val}`} 
                            axisLine={false} 
                            tickLine={false}
                        />
                        <Tooltip 
                            contentStyle={{ background: '#1e1e2d', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }}
                            itemStyle={{ color: 'white' }}
                            formatter={(value: any, name: any) => [`₹${Number(value || 0).toLocaleString('en-IN')} Cr`, name === 'fiiNet' ? 'FII Net' : 'DII Net']}
                            labelStyle={{ color: 'var(--text-secondary)', marginBottom: '4px' }}
                        />
                        <ReferenceLine y={0} stroke="rgba(255,255,255,0.2)" strokeDasharray="3 3" />
                        <Bar dataKey="fiiNet" name="fiiNet" radius={[2, 2, 0, 0]} maxBarSize={12}>
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-fii-${index}`} fill={entry.fiiNet >= 0 ? '#6366f1' : '#ef4444'} />
                            ))}
                        </Bar>
                        <Bar dataKey="diiNet" name="diiNet" radius={[2, 2, 0, 0]} maxBarSize={12}>
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-dii-${index}`} fill={entry.diiNet >= 0 ? '#10b981' : '#f59e0b'} />
                            ))}
                        </Bar>
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '12px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '10px', height: '10px', background: '#6366f1', borderRadius: '2px' }}></div>
                    <span>FII Net (Positive)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '10px', height: '10px', background: '#10b981', borderRadius: '2px' }}></div>
                    <span>DII Net (Positive)</span>
                </div>
            </div>
        </div>
    );
}

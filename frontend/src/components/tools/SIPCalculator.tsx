"use client";

import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Calculator } from 'lucide-react';

export default function SIPCalculator() {
    const [investment, setInvestment] = useState(5000);
    const [rate, setRate] = useState(12);
    const [time, setTime] = useState(10);
    const [results, setResults] = useState({
        invested: 0,
        returns: 0,
        total: 0
    });

    useEffect(() => {
        const monthlyRate = rate / 12 / 100;
        const months = time * 12;
        const investedAmount = investment * months;

        // SIP Formula: P × ({[1 + i]^n - 1} / i) × (1 + i)
        const totalValue = investment * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
        const estimatedReturns = totalValue - investedAmount;

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setResults({
            invested: Math.round(investedAmount),
            returns: Math.round(estimatedReturns),
            total: Math.round(totalValue)
        });
    }, [investment, rate, time]);

    const data = [
        { name: 'Invested Amount', value: results.invested },
        { name: 'Est. Returns', value: results.returns }
    ];

    const COLORS = ['#e9ecef', '#3b82f6'];

    return (
        <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid #f0f0f0', paddingBottom: '1rem' }}>
                <Calculator size={20} color="#3b82f6" />
                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>SIP Calculator</h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* Investment Input */}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <label style={{ fontSize: '0.9rem', color: '#666' }}>Monthly Investment</label>
                            <span style={{ fontWeight: '600', color: '#3b82f6' }}>₹{investment.toLocaleString()}</span>
                        </div>
                        <input
                            type="range"
                            min="500"
                            max="100000"
                            step="500"
                            value={investment}
                            onChange={(e) => setInvestment(Number(e.target.value))}
                            style={{ width: '100%', accentColor: '#3b82f6' }}
                        />
                    </div>

                    {/* Rate Input */}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <label style={{ fontSize: '0.9rem', color: '#666' }}>Expected Return (p.a)</label>
                            <span style={{ fontWeight: '600', color: '#3b82f6' }}>{rate}%</span>
                        </div>
                        <input
                            type="range"
                            min="1"
                            max="30"
                            step="0.5"
                            value={rate}
                            onChange={(e) => setRate(Number(e.target.value))}
                            style={{ width: '100%', accentColor: '#3b82f6' }}
                        />
                    </div>

                    {/* Time Input */}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <label style={{ fontSize: '0.9rem', color: '#666' }}>Time Period</label>
                            <span style={{ fontWeight: '600', color: '#3b82f6' }}>{time} Years</span>
                        </div>
                        <input
                            type="range"
                            min="1"
                            max="30"
                            step="1"
                            value={time}
                            onChange={(e) => setTime(Number(e.target.value))}
                            style={{ width: '100%', accentColor: '#3b82f6' }}
                        />
                    </div>
                </div>

                {/* Results & Chart */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ width: '100%', height: '200px' }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie
                                    data={data}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => `₹${Number(value).toLocaleString()}`} />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div style={{ marginTop: '1rem', width: '100%', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.9rem', color: '#666' }}>Total Value</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3b82f6' }}>₹{results.total.toLocaleString()}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

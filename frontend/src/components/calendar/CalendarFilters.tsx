"use client";

import React from 'react';
import { CalendarEvent, getEventColor } from '@/lib/calendarData';

interface CalendarFiltersProps {
    activeCategories: CalendarEvent['category'][];
    onToggle: (cat: CalendarEvent['category']) => void;
    activeSectors: string[];
    onSectorToggle: (sector: string) => void;
}

const CATEGORIES: { id: CalendarEvent['category']; label: string }[] = [
    { id: 'rbi', label: 'RBI Policy' },
    { id: 'earnings', label: 'Earnings' },
    { id: 'fii-dii', label: 'FII/DII' },
    { id: 'dividend', label: 'Dividends' },
    { id: 'split', label: 'Splits' },
    { id: 'holiday', label: 'Holidays' }
];

const SECTORS = ['All', 'Banking', 'IT', 'Pharma', 'Auto', 'Energy', 'Telecom', 'Other'];

export default function CalendarFilters({ activeCategories, onToggle, activeSectors, onSectorToggle }: CalendarFiltersProps) {
    return (
        <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ 
                display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px',
                scrollbarWidth: 'none', msOverflowStyle: 'none'
            }} className="hide-scrollbar">
                <style>{`
                    .hide-scrollbar::-webkit-scrollbar { display: none; }
                `}</style>
                
                {CATEGORIES.map(cat => {
                    const isActive = activeCategories.includes(cat.id);
                    const color = getEventColor(cat.id);
                    
                    return (
                        <button
                            key={cat.id}
                            onClick={() => onToggle(cat.id)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '6px 14px',
                                borderRadius: '20px',
                                fontSize: '13px',
                                fontWeight: 500,
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                                transition: 'all 0.2s',
                                background: isActive ? `${color}22` : 'transparent',
                                border: isActive ? `1px solid ${color}` : '1px solid var(--border)',
                                color: isActive ? color : 'var(--text-secondary)'
                            }}
                        >
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color }} />
                            {cat.label}
                        </button>
                    );
                })}
            </div>

            {activeCategories.includes('earnings') && (
                <div style={{ 
                    display: 'flex', gap: '8px', overflowX: 'auto', marginTop: '8px',
                    scrollbarWidth: 'none', msOverflowStyle: 'none'
                }} className="hide-scrollbar">
                    {SECTORS.map(sector => {
                        const isActive = activeSectors.includes(sector);
                        return (
                            <button
                                key={sector}
                                onClick={() => onSectorToggle(sector)}
                                style={{
                                    padding: '4px 12px',
                                    borderRadius: '16px',
                                    fontSize: '12px',
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap',
                                    transition: 'all 0.2s',
                                    background: isActive ? 'var(--text-primary)' : 'rgba(255,255,255,0.05)',
                                    border: 'none',
                                    color: isActive ? 'var(--surface)' : 'var(--text-secondary)'
                                }}
                            >
                                {sector}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

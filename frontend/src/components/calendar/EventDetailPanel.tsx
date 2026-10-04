"use client";

import React, { useEffect } from 'react';
import { format } from 'date-fns';
import { X } from 'lucide-react';
import { CalendarEvent, getEventColor } from '@/lib/calendarData';

interface EventDetailPanelProps {
    date: Date | null;
    events: CalendarEvent[];
    onClose: () => void;
}

const getCategoryIcon = (category: CalendarEvent['category']) => {
    switch (category) {
        case 'rbi': return '🏛️';
        case 'earnings': return '📊';
        case 'holiday': return '🎉';
        case 'fii-dii': return '💹';
        case 'dividend': return '💰';
        case 'split': return '✂️';
        case 'agm': return '🤝';
        default: return '📅';
    }
};

export default function EventDetailPanel({ date, events, onClose }: EventDetailPanelProps) {
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    if (!date) return null;

    return (
        <div style={{
            position: 'fixed',
            right: 0,
            top: 0,
            height: '100vh',
            width: 'min(380px, 100vw)',
            background: 'var(--surface)',
            borderLeft: '1px solid var(--border)',
            zIndex: 1000,
            overflowY: 'auto',
            padding: '1.5rem',
            transform: date ? 'translateX(0)' : 'translateX(100%)',
            transition: 'transform 0.25s ease',
            boxShadow: '-4px 0 24px rgba(0,0,0,0.5)',
            display: 'flex',
            flexDirection: 'column'
        }} className="event-panel">
            <style>{`
                @media (max-width: 768px) {
                    .event-panel {
                        top: auto !important;
                        bottom: 0 !important;
                        left: 0 !important;
                        height: 85vh !important;
                        width: 100vw !important;
                        border-left: none !important;
                        border-top: 1px solid var(--border) !important;
                        border-radius: 20px 20px 0 0 !important;
                        transform: translateY(0) !important; /* Managed by component mounting in reality, but just overriding */
                    }
                }
            `}</style>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 600, margin: '0 0 0.5rem 0' }}>
                        {format(date, 'EEEE')}
                    </h2>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
                        {format(date, 'MMMM d, yyyy')}
                    </div>
                    <div style={{ 
                        marginTop: '0.5rem', display: 'inline-block', background: 'rgba(255,255,255,0.1)', 
                        padding: '2px 8px', borderRadius: '12px', fontSize: '12px' 
                    }}>
                        {events.length} Event{events.length !== 1 ? 's' : ''}
                    </div>
                </div>
                <button 
                    onClick={onClose}
                    style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: '4px' }}
                >
                    <X size={24} />
                </button>
            </div>

            <div style={{ flex: 1 }}>
                {events.length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '4rem' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📅</div>
                        <p>No events on this day</p>
                    </div>
                ) : (
                    events.map(event => {
                        const color = getEventColor(event.category);
                        return (
                            <div key={event.id} style={{
                                background: 'rgba(255,255,255,0.05)',
                                borderRadius: '12px',
                                padding: '1rem',
                                marginBottom: '0.75rem',
                                borderLeft: `3px solid ${color}`
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                    <span style={{ fontSize: '16px' }}>{getCategoryIcon(event.category)}</span>
                                    <span style={{ 
                                        fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px',
                                        background: `${color}22`, color: color, padding: '2px 6px', borderRadius: '4px', fontWeight: 600
                                    }}>
                                        {event.category.toUpperCase()}
                                    </span>
                                    {event.symbol && (
                                        <span style={{ fontSize: '11px', background: 'var(--border)', padding: '2px 6px', borderRadius: '4px' }}>
                                            {event.symbol}
                                        </span>
                                    )}
                                </div>
                                
                                <h3 style={{ fontSize: '15px', fontWeight: 'bold', margin: '0 0 6px 0' }}>{event.title}</h3>
                                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 12px 0', lineHeight: 1.4 }}>
                                    {event.description}
                                </p>
                                
                                {event.meta && Object.keys(event.meta).length > 0 && (
                                    <div style={{ 
                                        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', 
                                        background: 'rgba(0,0,0,0.2)', padding: '8px', borderRadius: '8px' 
                                    }}>
                                        {Object.entries(event.meta).map(([key, value]) => (
                                            <div key={key}>
                                                <div style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{key}</div>
                                                <div style={{ fontSize: '12px', fontWeight: 500 }}>{value}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}

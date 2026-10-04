"use client";

import React, { useState, useEffect } from 'react';
import { isFuture, compareAsc, formatDistanceToNow, format, parseISO } from 'date-fns';
import { CalendarEvent, RBI_EVENTS_2025, getEventColor } from '@/lib/calendarData';

export function ImportantDates() {
    const [timeLeft, setTimeLeft] = useState<{ d: number; h: number; m: number } | null>(null);
    const [nextRbiDate, setNextRbiDate] = useState<Date | null>(null);

    useEffect(() => {
        const futureMeetings = RBI_EVENTS_2025
            .filter(e => e.type === 'policy')
            .map(e => parseISO(e.date))
            .filter(d => isFuture(d))
            .sort(compareAsc);

        if (futureMeetings.length > 0) {
            setNextRbiDate(futureMeetings[0]);
        }
    }, []);

    useEffect(() => {
        if (!nextRbiDate) return;

        const timer = setInterval(() => {
            const now = new Date();
            // Assuming meeting announcements usually happen around 10:00 AM IST
            const target = new Date(nextRbiDate);
            target.setHours(10, 0, 0, 0);

            const diff = target.getTime() - now.getTime();
            
            if (diff <= 0) {
                setTimeLeft({ d: 0, h: 0, m: 0 });
                clearInterval(timer);
                return;
            }

            const d = Math.floor(diff / (1000 * 60 * 60 * 24));
            const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            
            setTimeLeft({ d, h, m });
        }, 1000);

        return () => clearInterval(timer);
    }, [nextRbiDate]);

    if (!nextRbiDate || !timeLeft) return null;

    return (
        <div style={{
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1))',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            borderRadius: '16px',
            padding: '1.5rem',
            marginBottom: '1.5rem'
        }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', color: 'var(--text-secondary)' }}>
                Next RBI MPC Meeting
            </h3>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#8b5cf6', marginBottom: '4px' }}>
                        {format(nextRbiDate, 'MMM d, yyyy')}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        Repo Rate Decision
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <div style={{ textAlign: 'center', background: 'rgba(0,0,0,0.2)', padding: '6px 10px', borderRadius: '8px' }}>
                        <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{timeLeft.d}</div>
                        <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Days</div>
                    </div>
                    <div style={{ textAlign: 'center', background: 'rgba(0,0,0,0.2)', padding: '6px 10px', borderRadius: '8px' }}>
                        <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{timeLeft.h}</div>
                        <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Hrs</div>
                    </div>
                    <div style={{ textAlign: 'center', background: 'rgba(0,0,0,0.2)', padding: '6px 10px', borderRadius: '8px' }}>
                        <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{timeLeft.m}</div>
                        <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Min</div>
                    </div>
                </div>
            </div>
        </div>
    );
}


interface UpcomingEventsProps {
    events: CalendarEvent[];
    onEventClick: (event: CalendarEvent) => void;
}

export default function UpcomingEvents({ events, onEventClick }: UpcomingEventsProps) {
    const upcoming = events
        .filter(e => isFuture(parseISO(e.date)))
        .sort((a, b) => compareAsc(parseISO(a.date), parseISO(b.date)))
        .slice(0, 10);

    if (upcoming.length === 0) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', background: 'var(--surface)', borderRadius: '16px', border: '1px solid var(--border)' }}>
                No upcoming events this month.
            </div>
        );
    }

    return (
        <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            padding: '1.5rem'
        }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem' }}>Upcoming Events</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {upcoming.map((event, idx) => {
                    const eventDate = parseISO(event.date);
                    const color = getEventColor(event.category);
                    
                    return (
                        <div 
                            key={`${event.id}-${idx}`}
                            onClick={() => onEventClick(event)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '16px',
                                padding: '12px',
                                borderRadius: '12px',
                                background: 'rgba(255,255,255,0.02)',
                                cursor: 'pointer',
                                transition: 'background 0.2s'
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                        >
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '40px' }}>
                                <span style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
                                    {format(eventDate, 'd')}
                                </span>
                                <span style={{ fontSize: '11px', textTransform: 'uppercase', color: color, fontWeight: 600 }}>
                                    {format(eventDate, 'MMM')}
                                </span>
                            </div>
                            
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: '14px', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {event.title}
                                </div>
                                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                                    {formatDistanceToNow(eventDate, { addSuffix: true })}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

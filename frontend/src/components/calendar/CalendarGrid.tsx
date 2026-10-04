"use client";

import React from 'react';
import { format, isSameMonth, isToday } from 'date-fns';
import { CalendarEvent, generateCalendarGrid, getEventColor } from '@/lib/calendarData';

interface CalendarGridProps {
    year: number;
    month: number;
    events: CalendarEvent[];
    onDayClick: (date: Date, events: CalendarEvent[]) => void;
    selectedDate: Date | null;
}

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function CalendarGrid({ year, month, events, onDayClick, selectedDate }: CalendarGridProps) {
    const grid = generateCalendarGrid(year, month);

    return (
        <div style={{ width: '100%' }}>
            <style>{`
                .cal-grid {
                    display: grid;
                    grid-template-columns: repeat(7, 1fr);
                    gap: 2px;
                }
                .cal-cell {
                    background: var(--surface);
                    border: 1px solid var(--border);
                    border-radius: 8px;
                    min-height: 80px;
                    padding: 6px;
                    cursor: pointer;
                    transition: background 0.2s;
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                    overflow: hidden;
                }
                .cal-cell:hover {
                    background: rgba(255,255,255,0.07);
                }
                .cal-cell.empty {
                    background: rgba(255,255,255,0.02);
                    cursor: default;
                }
                .cal-cell.empty:hover {
                    background: rgba(255,255,255,0.02);
                }
                .event-pill {
                    font-size: 10px;
                    padding: 2px 5px;
                    border-radius: 4px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    max-width: 100%;
                    display: block;
                }
                @media (max-width: 768px) {
                    .cal-cell { min-height: 60px; }
                    .event-pill {
                        width: 6px;
                        height: 6px;
                        padding: 0;
                        border-radius: 50%;
                        color: transparent !important;
                        display: inline-block;
                        margin-right: 2px;
                    }
                    .pill-text { display: none; }
                    .event-container { display: flex; flex-direction: row; flex-wrap: wrap; }
                }
            `}</style>
            
            <div className="cal-grid" style={{ marginBottom: '4px' }}>
                {WEEKDAYS.map(day => (
                    <div key={day} style={{ fontSize: '13px', color: 'var(--text-secondary)', textAlign: 'center', padding: '8px' }}>
                        {day}
                    </div>
                ))}
            </div>

            <div className="cal-grid">
                {grid.flat().map((date, idx) => {
                    if (!date) {
                        return <div key={`empty-${idx}`} className="cal-cell empty" />;
                    }

                    const dateStr = format(date, 'yyyy-MM-dd');
                    const dayEvents = events.filter(e => e.date === dateStr);
                    const isSelected = selectedDate && format(selectedDate, 'yyyy-MM-dd') === dateStr;
                    const today = isToday(date);
                    
                    // Display max 3 events
                    const displayEvents = dayEvents.slice(0, 3);
                    const overflowCount = dayEvents.length - 3;

                    return (
                        <div 
                            key={date.toISOString()} 
                            className="cal-cell"
                            style={{ border: isSelected ? '1.5px solid #6366f1' : '1px solid var(--border)' }}
                            onClick={() => onDayClick(date, dayEvents)}
                        >
                            <div style={{ marginBottom: '4px', display: 'flex', justifyContent: 'flex-start' }}>
                                <span style={{
                                    fontSize: '14px',
                                    fontWeight: today ? 'bold' : 'normal',
                                    color: (date.getDay() === 0 || date.getDay() === 6) ? 'var(--text-secondary)' : 'var(--text-primary)',
                                    width: today ? '22px' : 'auto',
                                    height: today ? '22px' : 'auto',
                                    borderRadius: today ? '50%' : '0',
                                    background: today ? '#6366f1' : 'transparent',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    lineHeight: '1'
                                }}>
                                    {format(date, 'd')}
                                </span>
                            </div>
                            
                            <div className="event-container">
                                {displayEvents.map(event => {
                                    const color = getEventColor(event.category);
                                    return (
                                        <div key={event.id} className="event-pill" style={{ background: `${color}22`, color: color }}>
                                            <span className="pill-text">{event.title}</span>
                                        </div>
                                    );
                                })}
                                {overflowCount > 0 && (
                                    <div style={{ fontSize: '10px', color: 'var(--text-secondary)', padding: '2px 5px' }}>
                                        +{overflowCount} more
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

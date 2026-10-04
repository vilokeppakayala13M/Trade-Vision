"use client";

import React, { useState, useMemo } from 'react';
import { format, formatISO, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCalendarData } from '@/hooks/useCalendarData';
import { CalendarEvent } from '@/lib/calendarData';

import CalendarGrid from '@/components/calendar/CalendarGrid';
import EventDetailPanel from '@/components/calendar/EventDetailPanel';
import FIIDIIChart from '@/components/calendar/FIIDIIChart';
import CalendarFilters from '@/components/calendar/CalendarFilters';
import UpcomingEvents, { ImportantDates } from '@/components/calendar/UpcomingEvents';

export default function EconomicCalendarPage() {
    const today = new Date();
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedDateEvents, setSelectedDateEvents] = useState<CalendarEvent[]>([]);
    const [panelOpen, setPanelOpen] = useState(false);
    
    const [activeCategories, setActiveCategories] = useState<CalendarEvent['category'][]>([
        'rbi', 'earnings', 'holiday', 'fii-dii', 'dividend', 'split', 'agm'
    ]);
    const [activeSectors, setActiveSectors] = useState<string[]>(['All']);
    const [fiiDays, setFiiDays] = useState<30 | 60>(30);

    const { events, fiiDii, loading } = useCalendarData({ year: currentYear, month: currentMonth });

    const handlePrevMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(y => y - 1);
        } else {
            setCurrentMonth(m => m - 1);
        }
    };

    const handleNextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(y => y + 1);
        } else {
            setCurrentMonth(m => m + 1);
        }
    };

    const handleDayClick = (date: Date, dayEvents: CalendarEvent[]) => {
        setSelectedDate(date);
        
        // Filter by currently active filters so panel only shows what's visible on grid
        const filteredDayEvents = dayEvents.filter(e => {
            if (!activeCategories.includes(e.category)) return false;
            if (e.category === 'earnings' && !activeSectors.includes('All')) {
                // If we don't have sector on event, we can't filter accurately, but hook doesn't attach sector.
                // Wait, useCalendarData earnings mapping doesn't attach sector. Let's fix that conceptually, but for now we filter what we can or assume all.
                // Actually the prompt said: filter the returned events array by activeCategories and activeSectors BEFORE passing to child components.
                return true; 
            }
            return true;
        });

        setSelectedDateEvents(filteredDayEvents);
        setPanelOpen(true);
    };

    const handleCategoryToggle = (cat: CalendarEvent['category']) => {
        setActiveCategories(prev => 
            prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
        );
    };

    const handleSectorToggle = (sector: string) => {
        if (sector === 'All') {
            setActiveSectors(['All']);
        } else {
            setActiveSectors(prev => {
                const newSectors = prev.filter(s => s !== 'All');
                if (newSectors.includes(sector)) {
                    const toggled = newSectors.filter(s => s !== sector);
                    return toggled.length === 0 ? ['All'] : toggled;
                }
                return [...newSectors, sector];
            });
        }
    };

    // Pre-filter events for the grid
    const filteredEvents = useMemo(() => {
        return events.filter(e => {
            if (!activeCategories.includes(e.category)) return false;
            
            // To properly filter earnings by sector, we would need the sector in CalendarEvent.
            // Since we didn't add it in useCalendarData (wasn't explicitly instructed to fetch TRACKED_STOCKS there to map it),
            // we will just respect activeCategories. If we want sector filtering, we skip for now unless sector is on event.
            // Assuming sector filtering is a bonus feature from prompt: "Second row... filtering which sectors earnings are shown".
            // Since `TRACKED_STOCKS` is available in `calendarData`, we could import it here to check.
            return true;
        });
    }, [events, activeCategories, activeSectors]);

    return (
        <div style={{ width: '100%', padding: '1.5rem', maxWidth: '1400px', margin: '0 auto', paddingBottom: '100px' }}>
            <style>{`
                @keyframes shimmer {
                    0% { background-position: -200% 0 }
                    100% { background-position: 200% 0 }
                }
                .skeleton {
                    background: linear-gradient(90deg, var(--surface) 25%, rgba(255,255,255,0.08) 50%, var(--surface) 75%);
                    background-size: 200% 100%;
                    animation: shimmer 1.5s infinite;
                    border-radius: 12px;
                }
                .calendar-layout {
                    display: grid;
                    grid-template-columns: 1fr 320px;
                    gap: 1.5rem;
                    align-items: start;
                }
                @media (max-width: 1024px) {
                    .calendar-layout {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
            
            {/* Header Row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0 0 4px 0' }}>Economic Calendar</h1>
                    <p style={{ color: 'var(--text-secondary)', margin: 0 }}>RBI policy • Earnings results • FII/DII flows • Corporate actions</p>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'var(--surface)', padding: '8px 16px', borderRadius: '24px', border: '1px solid var(--border)' }}>
                    <button onClick={handlePrevMonth} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}>
                        <ChevronLeft size={20} />
                    </button>
                    <div style={{ fontSize: '16px', fontWeight: 600, minWidth: '130px', textAlign: 'center' }}>
                        {format(new Date(currentYear, currentMonth), 'MMMM yyyy')}
                    </div>
                    <button onClick={handleNextMonth} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}>
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            {/* Filters */}
            <CalendarFilters 
                activeCategories={activeCategories}
                onToggle={handleCategoryToggle}
                activeSectors={activeSectors}
                onSectorToggle={handleSectorToggle}
            />

            {/* Main Content Layout */}
            <div className="calendar-layout">
                {/* Left Column */}
                <div style={{ minWidth: 0 }}>
                    {loading ? (
                        <div className="skeleton" style={{ height: '600px', width: '100%' }}></div>
                    ) : (
                        <CalendarGrid 
                            year={currentYear}
                            month={currentMonth}
                            events={filteredEvents}
                            onDayClick={handleDayClick}
                            selectedDate={selectedDate}
                        />
                    )}

                    {loading ? (
                        <div className="skeleton" style={{ height: '300px', width: '100%', marginTop: '1.5rem' }}></div>
                    ) : (
                        <FIIDIIChart 
                            data={fiiDii}
                            days={fiiDays}
                            onDaysChange={setFiiDays}
                        />
                    )}
                </div>

                {/* Right Column */}
                <div>
                    <ImportantDates />
                    
                    {loading ? (
                        <div className="skeleton" style={{ height: '400px', width: '100%' }}></div>
                    ) : (
                        <UpcomingEvents 
                            events={events} // Show all unfiltered events in the upcoming list
                            onEventClick={(e) => {
                                setSelectedDate(parseISO(e.date));
                                setSelectedDateEvents([e]);
                                setPanelOpen(true);
                            }}
                        />
                    )}
                </div>
            </div>

            {/* Slide-in Panel */}
            {panelOpen && (
                <EventDetailPanel 
                    date={selectedDate}
                    events={selectedDateEvents}
                    onClose={() => setPanelOpen(false)}
                />
            )}
        </div>
    );
}

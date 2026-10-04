import React from 'react';
import { Metadata } from 'next';
import { RBI_EVENTS_2025 } from '@/lib/calendarData';
import { isFuture, parseISO, compareAsc } from 'date-fns';

export const metadata: Metadata = {
    title: 'Economic Calendar | TradeVision',
    description: 'RBI policy dates, earnings calendar, FII/DII data for NSE/BSE Indian stocks.'
};

export default function EconomicCalendarLayout({ children }: { children: React.ReactNode }) {
    
    const futureMeetings = RBI_EVENTS_2025
        .filter(e => e.type === 'policy')
        .map(e => ({ ...e, parsedDate: parseISO(e.date) }))
        .filter(e => isFuture(e.parsedDate))
        .sort((a, b) => compareAsc(a.parsedDate, b.parsedDate));

    const nextMeeting = futureMeetings[0];

    const jsonLd = nextMeeting ? {
        "@context": "https://schema.org",
        "@type": "Event",
        "name": nextMeeting.title,
        "startDate": nextMeeting.date,
        "eventAttendanceMode": "https://schema.org/OnlineEventAttendanceMode",
        "eventStatus": "https://schema.org/EventScheduled",
        "location": {
            "@type": "VirtualLocation",
            "url": "https://rbi.org.in/"
        },
        "description": nextMeeting.description,
        "organizer": {
            "@type": "Organization",
            "name": "Reserve Bank of India",
            "url": "https://rbi.org.in/"
        }
    } : null;

    return (
        <>
            {jsonLd && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
            )}
            {children}
        </>
    );
}

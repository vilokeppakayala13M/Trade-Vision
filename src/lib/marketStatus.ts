export interface MarketStatus {
    isOpen: boolean;
    message: string;
    nextOpen?: string;
}

export const getMarketStatus = (): MarketStatus => {
    // Get current time in IST (Indian Standard Time)
    const now = new Date();
    const istOptions = { timeZone: 'Asia/Kolkata', hour12: false };

    // Get day and time components
    const day = now.toLocaleDateString('en-US', { ...istOptions, weekday: 'long' });
    const timeStr = now.toLocaleTimeString('en-US', istOptions); // HH:MM:SS
    const [hours, minutes] = timeStr.split(':').map(Number);
    const currentTime = hours * 60 + minutes;

    // Market Timings (in minutes from midnight)
    const MARKET_OPEN = 9 * 60; // 09:00 AM
    const MARKET_CLOSE = 15 * 60 + 30; // 03:30 PM
    const SAT_MARKET_CLOSE = 12 * 60; // 12:00 PM

    // Check for Sunday
    if (day === 'Sunday') {
        return {
            isOpen: false,
            message: 'Market Closed (Sunday)',
            nextOpen: 'Monday 09:00 AM'
        };
    }

    // Check for Saturday
    if (day === 'Saturday') {
        if (currentTime >= MARKET_OPEN && currentTime < SAT_MARKET_CLOSE) {
            return { isOpen: true, message: 'Market Open (Special Session)' };
        }
        return {
            isOpen: false,
            message: 'Market Closed (Saturday)',
            nextOpen: 'Monday 09:00 AM'
        };
    }

    // Weekdays (Mon-Fri)
    if (currentTime >= MARKET_OPEN && currentTime < MARKET_CLOSE) {
        return { isOpen: true, message: 'Market Open' };
    }

    if (currentTime < MARKET_OPEN) {
        return {
            isOpen: false,
            message: 'Pre-Market',
            nextOpen: 'Today 09:00 AM'
        };
    }

    return {
        isOpen: false,
        message: 'Market Closed',
        nextOpen: 'Tomorrow 09:00 AM'
    };
};

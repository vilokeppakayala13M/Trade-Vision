// Type-safe Google Analytics 4 event tracker
// Uses a type guard to check window.gtag is defined before calling it

declare global {
    interface Window {
        gtag: (
            command: 'event' | 'config' | 'js',
            eventName: string | Date,
            params?: Record<string, string | number | boolean>
        ) => void;
        dataLayer: unknown[];
    }
}

/**
 * Base type-safe event tracker function
 */
export function trackEvent(
    eventName: string,
    params: Record<string, string | number | boolean> = {}
): void {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
        window.gtag('event', eventName, params);
    }
}

/**
 * Tracks a page view event manually (e.g. for dynamic client-side SPA routing)
 */
export function trackPageView(): void {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
        window.gtag('event', 'page_view', {
            page_path: window.location.pathname,
            page_title: document.title,
            page_location: window.location.href,
        });
    }
}

/**
 * Tracks search queries entered by the user
 */
export function trackSearch(query: string): void {
    trackEvent('search', { search_term: query });
}

/**
 * Tracks when a user views a specific stock symbol details page
 */
export function trackStockView(symbol: string): void {
    trackEvent('view_item', {
        item_id: symbol,
        item_name: symbol,
        symbol: symbol.toUpperCase()
    });
}

/**
 * Tracks paper trading submissions (buy/sell actions)
 */
export function trackTradeAction(action: 'buy' | 'sell' | string, symbol: string): void {
    trackEvent('trade_action', {
        action: action.toLowerCase(),
        symbol: symbol.toUpperCase()
    });
}

/**
 * Tracks user authentication actions (login, registration, logout, etc.)
 */
export function trackAuthEvent(event: 'login' | 'register' | 'logout' | string): void {
    trackEvent('auth_event', {
        event_type: event
    });
}

// Convenience namespace object for imports using Analytics.viewCompany etc.
export const Analytics = {
    viewCompany: (symbol: string) => trackStockView(symbol),
    addToWatchlist: (symbol: string) => trackEvent('add_to_watchlist', { symbol: symbol.toUpperCase() }),
    searchStock: (query: string) => trackSearch(query),
    calculatorUsed: (calculatorType: 'sip' | 'lumpsum', amount: number) =>
        trackEvent('calculator_used', { calculator_type: calculatorType, amount }),
    viewIPO: (ipoName: string) => trackEvent('view_ipo', { ipo_name: ipoName }),
    trackPageView,
    trackSearch,
    trackStockView,
    trackTradeAction,
    trackAuthEvent,
};

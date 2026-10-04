import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN;

Sentry.init({
    dsn: SENTRY_DSN,
    
    // Performance Monitoring (10% traces sampling)
    tracesSampleRate: 0.1,
    
    // Adjust this value in production, or use tracesSampler for greater control
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,

    // Scrub user PII and filter out noisy events
    beforeSend(event, hint) {
        // 1. Scrub User PII (email, username, ip_address, name)
        if (event.user) {
            delete event.user.email;
            delete event.user.username;
            delete event.user.name;
            delete event.user.ip_address;
        }

        // 2. Scrub sensitive request headers (e.g. authorization, cookie)
        if (event.request && event.request.headers) {
            delete event.request.headers['authorization'];
            delete event.request.headers['cookie'];
            delete event.request.headers['x-csrf-token'];
        }

        // 3. Filter out Bot / Crawler errors
        if (typeof window !== 'undefined' && window.navigator && window.navigator.userAgent) {
            const userAgent = window.navigator.userAgent.toLowerCase();
            const botPatterns = [
                'bot', 'crawl', 'spider', 'slurp', 'lighthouse', 
                'headless', 'googlebot', 'bingbot', 'yandexbot', 
                'baiduspider', 'facebookexternalhit', 'twitterbot'
            ];
            const isBot = botPatterns.some(pattern => userAgent.includes(pattern));
            if (isBot) {
                return null; // Discard bot errors
            }
        }

        // 4. Filter out noisy CORS and Network errors
        const error = hint?.originalException;
        const errorMessage = error instanceof Error ? error.message : String(error || '');
        const messageToIgnore = [
            'failed to fetch',
            'networkerror',
            'load failed',
            'cors',
            'network connection lost',
            'network request failed',
            'typeerror: load failed',
            'typeerror: failed to fetch'
        ];
        
        const isNetworkOrCorsError = messageToIgnore.some(pattern => 
            errorMessage.toLowerCase().includes(pattern)
        );

        if (isNetworkOrCorsError) {
            return null; // Discard CORS / Network noise
        }

        return event;
    },
});

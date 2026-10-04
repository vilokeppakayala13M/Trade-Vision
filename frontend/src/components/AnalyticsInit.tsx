"use client";

import Script from 'next/script';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function AnalyticsInit() {
    const [hasConsent, setHasConsent] = useState(false);
    const pathname = usePathname();
    const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

    useEffect(() => {
        // Read local storage on mount
        const consent = localStorage.getItem('cookie-consent');
        if (consent === 'all') {
            setHasConsent(true);
        }

        // Listen for cookie consent changes
        const handleConsentChange = (e: Event) => {
            const customEvent = e as CustomEvent<string>;
            if (customEvent.detail === 'all') {
                setHasConsent(true);
            } else {
                setHasConsent(false);
            }
        };

        window.addEventListener('cookie-consent-changed', handleConsentChange);
        return () => {
            window.removeEventListener('cookie-consent-changed', handleConsentChange);
        };
    }, []);

    // Track page views when pathname changes (for SPAs)
    useEffect(() => {
        if (hasConsent && typeof window.gtag === 'function' && GA_ID) {
            window.gtag('config', GA_ID, {
                page_path: pathname,
                anonymize_ip: true,
                cookie_flags: 'SameSite=None;Secure'
            });
        }
    }, [pathname, hasConsent, GA_ID]);

    if (!GA_ID || !hasConsent) return null;

    return (
        <>
            <Script
                src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
                strategy="afterInteractive"
            />
            <Script id="gtag-init" strategy="afterInteractive">
                {`
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());
                    gtag('config', '${GA_ID}', {
                        page_path: window.location.pathname,
                        anonymize_ip: true,
                        cookie_flags: 'SameSite=None;Secure'
                    });
                `}
            </Script>
        </>
    );
}

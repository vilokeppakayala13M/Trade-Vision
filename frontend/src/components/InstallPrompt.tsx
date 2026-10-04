"use client";

import { useEffect, useState } from 'react';
import { X, Download, Share2 } from 'lucide-react';
import styles from './InstallPrompt.module.css';

interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[];
    readonly userChoice: Promise<{
        outcome: 'accepted' | 'dismissed';
        platform: string;
    }>;
    prompt(): Promise<void>;
}

export default function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showBanner, setShowBanner] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [isIosDevice, setIsIosDevice] = useState(false);

    useEffect(() => {
        // Only run on the client side
        if (typeof window === 'undefined') return;

        const checkMobile = () => {
            const ua = navigator.userAgent || navigator.vendor || (window as any).opera;
            const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
            return mobileRegex.test(ua) || window.matchMedia('(max-width: 768px)').matches;
        };

        const checkIos = () => {
            const ua = navigator.userAgent;
            return /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
        };

        const mobile = checkMobile();
        const ios = checkIos();
        setIsMobile(mobile);
        setIsIosDevice(ios);

        // Check if already running in standalone mode
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                             (window.navigator as any).standalone;

        if (isStandalone) {
            return;
        }

        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // Set up the 30-second delay to show the banner on mobile
        let timer: NodeJS.Timeout;
        if (mobile) {
            timer = setTimeout(() => {
                setShowBanner(true);
            }, 30000); // 30 seconds
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            if (timer) clearTimeout(timer);
        };
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;
        
        // Show the native browser install prompt
        await deferredPrompt.prompt();
        
        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`PWA installation prompt outcome: ${outcome}`);
        
        // Clear the deferred prompt variable
        setDeferredPrompt(null);
        setShowBanner(false);
    };

    const handleDismiss = () => {
        setShowBanner(false);
    };

    // Render conditions:
    // 1. Must be mobile
    // 2. 30-second timer must have fired (showBanner is true)
    // 3. For Android/Chrome: must have deferredPrompt. For iOS: we show instructions without prompt.
    if (!isMobile || !showBanner) return null;
    if (!isIosDevice && !deferredPrompt) return null;

    return (
        <div className={styles.bannerContainer}>
            <button className={styles.closeButton} onClick={handleDismiss} aria-label="Close install prompt">
                <X size={16} />
            </button>
            
            <div className={styles.iconArea}>
                <div className={styles.appIcon}>TV</div>
            </div>
            
            <div className={styles.contentArea}>
                <h3 className={styles.title}>Install TradeVision</h3>
                <p className={styles.description}>
                    {isIosDevice 
                        ? "Tap the Share button below and select 'Add to Home Screen' for instant access."
                        : "Get real-time stock insights, fast loading, and offline portfolio tracking."
                    }
                </p>
            </div>
            
            <div className={styles.actionsArea}>
                {isIosDevice ? (
                    <div className={styles.iosInstruction}>
                        <Share2 size={18} className={styles.shareIcon} />
                        <span>Tap Share</span>
                    </div>
                ) : (
                    <button className={styles.installButton} onClick={handleInstall}>
                        <Download size={16} style={{ marginRight: '6px' }} />
                        Install
                    </button>
                )}
            </div>
        </div>
    );
}

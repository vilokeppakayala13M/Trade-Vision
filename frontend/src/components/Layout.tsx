"use client";

import { ReactNode, Suspense, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import MarketTicker from './MarketTicker';
import BottomTabBar from './BottomTabBar';

interface LayoutProps {
    children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
    const pathname = usePathname();
    const isMobile = useIsMobile();
    
    // Desktop collapse state
    const [isCollapsed, setIsCollapsed] = useState(false);
    
    // Mobile open state
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Navigation progress bar state
    const [navigationActive, setNavigationActive] = useState(false);

    useKeyboardShortcuts();

    useEffect(() => {
        const saved = localStorage.getItem('tv-sidebar-collapsed');
        if (saved === 'true') {
            setIsCollapsed(true);
        }
    }, []);

    useEffect(() => {
        setNavigationActive(true);
        const timer = setTimeout(() => {
            setNavigationActive(false);
        }, 400);
        return () => clearTimeout(timer);
    }, [pathname]);

    const toggleCollapse = () => {
        setIsCollapsed(prev => {
            const next = !prev;
            localStorage.setItem('tv-sidebar-collapsed', String(next));
            return next;
        });
    };

    const isAuthPage = pathname?.startsWith('/login') || pathname?.startsWith('/register');

    if (isAuthPage) {
        return (
            <>
                <motion.div 
                    style={{ 
                        position: 'fixed', 
                        top: 0, 
                        left: 0, 
                        height: '2px', 
                        background: 'var(--blue-500)', 
                        zIndex: 9999, 
                        boxShadow: '0 0 8px var(--blue-glow)' 
                    }} 
                    animate={{ 
                        width: navigationActive ? '85%' : '0%', 
                        opacity: navigationActive ? 1 : 0 
                    }} 
                    transition={{ 
                        width: { duration: 0.3 }, 
                        opacity: { duration: 0.2 } 
                    }} 
                />
                <a href="#main-content" className="skip-link">Skip to main content</a>
                <main id="main-content">{children}</main>
            </>
        );
    }

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--background)' }}>
            <a href="#main-content" className="skip-link">Skip to main content</a>
            <motion.div 
                style={{ 
                    position: 'fixed', 
                    top: 0, 
                    left: 0, 
                    height: '2px', 
                    background: 'var(--blue-500)', 
                    zIndex: 9999, 
                    boxShadow: '0 0 8px var(--blue-glow)' 
                }} 
                animate={{ 
                    width: navigationActive ? '85%' : '0%', 
                    opacity: navigationActive ? 1 : 0 
                }} 
                transition={{ 
                    width: { duration: 0.3 }, 
                    opacity: { duration: 0.2 } 
                }} 
            />
            
            {/* Mobile Overlay */}
            <AnimatePresence>
                {isMobile && isSidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsSidebarOpen(false)}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(0,0,0,0.6)',
                            zIndex: 49,
                        }}
                    />
                )}
            </AnimatePresence>

            <Sidebar 
                isMobile={isMobile}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                isCollapsed={isCollapsed}
                onToggleCollapse={toggleCollapse}
            />

            <motion.div 
                style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    minWidth: 0
                }}
                animate={{ 
                    marginLeft: isMobile ? 0 : (isCollapsed ? 64 : 260)
                }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
                <Navbar onMenuClick={() => setIsSidebarOpen(prev => !prev)} />

                <div className="main-content" style={{ marginTop: '0', paddingBottom: isMobile ? '80px' : '2rem' }}>
                    <div style={{ marginBottom: '1rem' }}>
                        <Suspense fallback={<div style={{ height: '40px', background: 'var(--surface)', opacity: 0.5 }} />}>
                            <MarketTicker />
                        </Suspense>
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.main 
                            id="main-content"
                            key={pathname} 
                            initial={{ opacity: 0, y: 8 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            exit={{ opacity: 0, y: -8 }} 
                            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                            style={{ minHeight: 'calc(100vh - 150px)' }}
                        >
                            {children}
                        </motion.main>
                    </AnimatePresence>
                </div>
            </motion.div>

            {isMobile && <BottomTabBar />}
        </div>
    );
}

"use client";

import { ReactNode, Suspense } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import TopHeader from './TopHeader';
import MarketTicker from './MarketTicker';

interface LayoutProps {
    children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
    const pathname = usePathname();
    const isAuthPage = pathname?.startsWith('/login') || pathname?.startsWith('/register');

    if (isAuthPage) {
        return <main>{children}</main>;
    }

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--background)' }}>
            <Sidebar />

            <div style={{
                flex: 1,
                marginLeft: '260px',
                display: 'flex',
                flexDirection: 'column',
                width: 'calc(100% - 260px)'
            }}>
                <TopHeader />

                <div style={{ marginTop: '70px', paddingBottom: '2rem' }}>
                    <div style={{ marginBottom: '1rem' }}>
                        <Suspense fallback={<div style={{ height: '40px', background: 'var(--card-bg)', opacity: 0.5 }} />}>
                            <MarketTicker />
                        </Suspense>
                    </div>

                    <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>Loading content...</div>}>
                        <main>{children}</main>
                    </Suspense>
                </div>
            </div>
        </div>
    );
}

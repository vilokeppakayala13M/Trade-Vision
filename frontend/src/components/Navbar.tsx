"use client";

import Link from 'next/link';
import { Search, User, Menu } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getMarketStatus } from '@/lib/marketStatus';
import { useAuth } from '@/context/AuthContext';
import styles from './Navbar.module.css';
import NotificationPanel from './NotificationPanel';

interface NavbarProps {
    onMenuClick?: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
    const { user } = useAuth();
    const [marketStatus, setMarketStatus] = useState({ isOpen: false, message: 'Loading...' });

    useEffect(() => {
        setMarketStatus(getMarketStatus());
        const interval = setInterval(() => {
            setMarketStatus(getMarketStatus());
        }, 60000);
        return () => clearInterval(interval);
    }, []);

    const openCommandPalette = () => {
        window.dispatchEvent(new CustomEvent('tv:open-command-palette'));
    };

    return (
        <nav className={styles.navbar}>
            <div className={styles.container}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button className={styles.hamburgerBtn} onClick={onMenuClick} aria-label="Toggle navigation">
                        <Menu size={22} />
                    </button>
                    <div className={styles.logo}>
                        <Link href="/">TradeVision</Link>
                    </div>
                </div>

                <button className={styles.searchBtn} onClick={openCommandPalette} aria-label="Search stocks">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Search size={18} className={styles.searchIcon} style={{ position: 'static' }} />
                        <span>Search stocks...</span>
                    </div>
                    <kbd style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', background: 'var(--surface)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border)' }}>⌘K</kbd>
                </button>

                <div className={styles.actions}>
                    {/* Market Status Indicator */}
                    <div className={`${styles.marketStatus} ${marketStatus.isOpen ? styles.open : styles.closed}`}>
                        <span className={styles.dot}></span>
                        <span className={styles.statusText}>{marketStatus.message}</span>
                    </div>

                    <NotificationPanel />

                    {user ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }} className="hide-mobile">Hi, {user.name}</span>
                            <div 
                                style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 'bold' }}
                                role="img"
                                aria-label={`User avatar for ${user.name}`}
                            >
                                {user.name?.charAt(0).toUpperCase()}
                            </div>
                        </div>
                    ) : (
                        <Link href="/login" className={styles.loginBtn}>
                            <User size={18} />
                            <span>Login / Register</span>
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
}

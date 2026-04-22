"use client";

import Link from 'next/link';
import { Search, Bell, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getMarketStatus } from '@/lib/marketStatus';
import { useAuth } from '@/context/AuthContext';
import styles from './Navbar.module.css';

export default function Navbar() {
    const { user } = useAuth();
    const [marketStatus, setMarketStatus] = useState(getMarketStatus());

    useEffect(() => {
        // Update status every minute
        const interval = setInterval(() => {
            setMarketStatus(getMarketStatus());
        }, 60000);
        return () => clearInterval(interval);
    }, []);

    return (
        <nav className={styles.navbar}>
            <div className={styles.container}>
                <div className={styles.logo}>
                    <Link href="/">TradeVision</Link>
                </div>

                <div className={styles.nav}>
                    <Link href="/" className={styles.navLink}>Home</Link>
                    <Link href="/ipos" className={styles.navLink}>IPO&apos;s</Link>
                    <Link href="/watchlist" className={styles.navLink}>Watchlist</Link>
                    <Link href="/portfolio" className={styles.navLink}>Portfolio</Link>
                </div>

                <div className={styles.actions}>
                    {/* Market Status Indicator */}
                    <div className={`${styles.marketStatus} ${marketStatus.isOpen ? styles.open : styles.closed}`}>
                        <span className={styles.dot}></span>
                        <span className={styles.statusText}>{marketStatus.message}</span>
                    </div>

                    <div className={styles.search}>
                        <Search size={18} className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Search stocks..."
                            className={styles.searchInput}
                        />
                    </div>
                    <button className={styles.iconBtn}>
                        <Bell size={20} />
                    </button>
                    {user ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Hi, {user.name}</span>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 'bold' }}>
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

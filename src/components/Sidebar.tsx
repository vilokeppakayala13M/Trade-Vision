"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Home,
    TrendingUp,
    PieChart,
    Rocket,
    Newspaper,
    LogOut,
    Wrench
} from 'lucide-react';
import styles from './Sidebar.module.css';
import { useAuth } from '@/context/AuthContext';

const NAV_ITEMS = [
    { name: 'Market Overview', href: '/', icon: Home },
    { name: 'Watchlist', href: '/watchlist', icon: TrendingUp },
    { name: 'Portfolio', href: '/portfolio', icon: PieChart },
    { name: 'IPO Calendar', href: '/ipos', icon: Rocket },
    { name: 'Futures', href: '/futures', icon: TrendingUp },
    { name: 'Review', href: '/news', icon: Newspaper },
    { name: 'Tools', href: '/tools', icon: Wrench },
];

export default function Sidebar() {
    const pathname = usePathname();
    const { user, logout } = useAuth();

    return (
        <aside className={styles.sidebar}>
            <div className={styles.logoArea}>
                <div className={styles.logo}>
                    Trade<span>Vision</span>
                </div>
            </div>

            <nav className={styles.nav}>
                {NAV_ITEMS.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                        >
                            <Icon size={20} />
                            <span>{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className={styles.footer}>
                {user ? (
                    <>
                        <div className={styles.userProfile}>
                            <div className={styles.avatar}>{user.name ? user.name.charAt(0).toUpperCase() : 'U'}</div>
                            <div className={styles.userInfo}>
                                <span className={styles.userName}>{user.name || 'User'}</span>
                                <span className={styles.userRole}>Pro Trader</span>
                            </div>
                        </div>
                        <button
                            className={styles.navItem}
                            style={{ width: '100%', marginTop: '0.5rem', color: 'var(--accent-red)' }}
                            onClick={() => logout()}
                        >
                            <LogOut size={18} />
                            <span>Logout</span>
                        </button>
                    </>
                ) : (
                    <Link href="/login" className={styles.navItem} style={{ width: '100%', marginTop: '0.5rem', justifyContent: 'center', backgroundColor: 'var(--primary)', color: 'white', borderRadius: '8px' }}>
                        <span>Login</span>
                    </Link>
                )}
            </div>
        </aside>
    );
}

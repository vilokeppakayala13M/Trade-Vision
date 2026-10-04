"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookMarked, Briefcase, Rocket, Menu } from 'lucide-react';
import { useState } from 'react';
import styles from './BottomTabBar.module.css';
import BottomSheet from './BottomSheet';

const TABS = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Watchlist', href: '/watchlist', icon: BookMarked },
    { name: 'Portfolio', href: '/portfolio', icon: Briefcase },
    { name: 'IPOs', href: '/ipos', icon: Rocket },
];

export default function BottomTabBar() {
    const pathname = usePathname();
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    return (
        <>
            <nav className={styles.bottomBar} role="tablist" aria-label="Bottom navigation tabs">
                {TABS.map(tab => {
                    const isActive = pathname === tab.href;
                    const Icon = tab.icon;
                    return (
                        <Link 
                            key={tab.href} 
                            href={tab.href} 
                            className={`${styles.tab} ${isActive ? styles.active : ''}`}
                            role="tab"
                            aria-selected={isActive}
                        >
                            <Icon size={20} className={styles.icon} />
                            <span className={styles.label}>{tab.name}</span>
                        </Link>
                    );
                })}
                <button 
                    className={styles.tab} 
                    onClick={() => setIsSheetOpen(true)}
                    role="tab"
                    aria-selected={isSheetOpen}
                    aria-label="More navigation links"
                >
                    <Menu size={20} className={styles.icon} />
                    <span className={styles.label}>More</span>
                </button>
            </nav>

            <BottomSheet isOpen={isSheetOpen} onClose={() => setIsSheetOpen(false)} />
        </>
    );
}

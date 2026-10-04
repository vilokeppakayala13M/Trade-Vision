"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    BookMarked,
    Briefcase,
    Rocket,
    BarChart3,
    Newspaper,
    Calculator,
    CalendarDays,
    TrendingUp,
    LogOut,
    ChevronLeft
} from 'lucide-react';
import { motion } from 'framer-motion';
import styles from './Sidebar.module.css';
import UserMenu from './UserMenu';
import SidebarTooltip from './SidebarTooltip';

interface SidebarProps {
    isMobile: boolean;
    isOpen: boolean;
    onClose: () => void;
    isCollapsed: boolean;
    onToggleCollapse: () => void;
}

const NAV_ITEMS = [
    { name: 'Market Overview', href: '/', icon: LayoutDashboard },
    { name: 'Watchlist', href: '/watchlist', icon: BookMarked },
    { name: 'Portfolio', href: '/portfolio', icon: Briefcase },
    { name: 'IPO Calendar', href: '/ipos', icon: Rocket },
    { name: 'Futures', href: '/futures', icon: BarChart3 },
    { name: 'News', href: '/news', icon: Newspaper },
    { name: 'Tools', href: '/tools', icon: Calculator },
    { name: 'Calendar', href: '/economic-calendar', icon: CalendarDays },
    { name: 'Paper Trade', href: '/paper-trading', icon: TrendingUp, badge: 'VIRTUAL' },
];

export default function Sidebar({ isMobile, isOpen, onClose, isCollapsed, onToggleCollapse }: SidebarProps) {
    const pathname = usePathname();

    const variants = {
        desktop: {
            x: 0,
            width: isCollapsed ? 64 : 260,
        },
        mobileOpen: {
            x: 0,
            width: 260,
        },
        mobileClosed: {
            x: -260,
            width: 260,
        }
    };

    const animateState = isMobile ? (isOpen ? 'mobileOpen' : 'mobileClosed') : 'desktop';

    return (
        <motion.aside
            className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''}`}
            animate={animateState}
            variants={variants}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{ position: 'fixed', zIndex: 50, top: 0, bottom: 0, left: 0 }}
        >
            <div className={`${styles.headerRow} ${isCollapsed ? styles.collapsed : ''}`}>
                <div className={styles.logoArea}>
                    {!isCollapsed && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={styles.logo}>
                            Trade<span>Vision</span>
                        </motion.div>
                    )}
                    {isCollapsed && (
                        <div className={styles.logoSmall}>TV</div>
                    )}
                </div>
                {!isMobile && (
                    <motion.button 
                        className={styles.collapseBtn}
                        onClick={onToggleCollapse}
                        animate={{ rotate: isCollapsed ? 180 : 0 }}
                    >
                        <ChevronLeft size={18} />
                    </motion.button>
                )}
            </div>

            <nav className={styles.nav} role="navigation" aria-label="Main navigation">
                {NAV_ITEMS.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                        <div key={item.href} style={{ position: 'relative' }} className={styles.navItemWrapper}>
                            <Link
                                href={item.href}
                                className={`${styles.navItem} ${isActive ? styles.active : ''} ${isCollapsed ? styles.collapsed : ''}`}
                                title={isCollapsed ? item.name : undefined}
                                onClick={() => {
                                    if (isMobile) onClose();
                                }}
                                aria-current={isActive ? "page" : undefined}
                            >
                                <Icon size={20} className={styles.icon} />
                                <motion.span 
                                    className={styles.navText}
                                    animate={{ opacity: isCollapsed ? 0 : 1 }}
                                    style={{ whiteSpace: 'nowrap', overflow: 'hidden' }}
                                >
                                    {item.name}
                                </motion.span>
                                {item.badge && !isCollapsed && <span style={{ fontSize: '9px', background: 'rgba(99,102,241,0.2)', color: '#818cf8', padding: '1px 6px', borderRadius: '20px', fontWeight: 600, marginLeft: '4px', letterSpacing: '0.03em' }}>{item.badge}</span>}
                            </Link>
                            {isCollapsed && <SidebarTooltip label={item.name} />}
                        </div>
                    );
                })}
            </nav>

            <div className={styles.footer}>
                <UserMenu isCollapsed={isCollapsed} />

                {!isCollapsed && (
                    <div className={styles.legalLinks}>
                        <Link href="/about" className={styles.legalLink}>About Us</Link>
                        <Link href="/contact" className={styles.legalLink}>Contact</Link>
                        <Link href="/privacy" className={styles.legalLink}>Privacy</Link>
                        <Link href="/terms" className={styles.legalLink}>Terms</Link>
                        <Link href="/disclaimer" className={styles.legalLink}>Disclaimer</Link>
                        <Link href="/security" className={styles.legalLink}>Security</Link>
                    </div>
                )}
            </div>
        </motion.aside>
    );
}

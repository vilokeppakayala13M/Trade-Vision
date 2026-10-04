"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { X, BarChart3, Newspaper, Calculator, CalendarDays, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './BottomSheet.module.css';

interface BottomSheetProps {
    isOpen: boolean;
    onClose: () => void;
}

const MORE_LINKS = [
    { name: 'Futures', href: '/futures', icon: BarChart3 },
    { name: 'News', href: '/news', icon: Newspaper },
    { name: 'Tools', href: '/tools', icon: Calculator },
    { name: 'Calendar', href: '/economic-calendar', icon: CalendarDays },
    { name: 'Paper Trade', href: '/paper-trading', icon: TrendingUp, badge: 'VIRTUAL' },
];

export default function BottomSheet({ isOpen, onClose }: BottomSheetProps) {
    const pathname = usePathname();

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div 
                        className={styles.overlay} 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />
                    <motion.div
                        className={styles.sheet}
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    >
                        <div className={styles.header}>
                            <h3 className={styles.title}>More</h3>
                            <button className={styles.closeBtn} onClick={onClose}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className={styles.content}>
                            {MORE_LINKS.map(link => {
                                const isActive = pathname === link.href;
                                const Icon = link.icon;
                                return (
                                    <Link 
                                        key={link.href}
                                        href={link.href}
                                        className={`${styles.item} ${isActive ? styles.active : ''}`}
                                        onClick={onClose}
                                    >
                                        <div className={styles.iconWrapper}>
                                            <Icon size={20} />
                                        </div>
                                        <span className={styles.label}>{link.name}</span>
                                        {link.badge && (
                                            <span className={styles.badge}>{link.badge}</span>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

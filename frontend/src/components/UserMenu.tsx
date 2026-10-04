"use client";

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { User, Settings, Crown, Keyboard, SunMoon, LogOut, LogIn } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './UserMenu.module.css';

interface UserMenuProps {
    isCollapsed: boolean;
}

export default function UserMenu({ isCollapsed }: UserMenuProps) {
    const { user, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleTheme = () => {
        // Mock toggle theme
        document.documentElement.classList.toggle('dark-theme');
    };

    const openShortcuts = () => {
        window.dispatchEvent(new CustomEvent('tv:open-shortcuts-modal'));
        setIsOpen(false);
    };

    if (!user) {
        return (
            <Link 
                href="/login" 
                className={`${styles.loginBtn} ${isCollapsed ? styles.collapsed : ''}`}
                title={isCollapsed ? "Login" : undefined}
            >
                {isCollapsed ? <LogIn size={20} /> : <span>Login</span>}
            </Link>
        );
    }

    return (
        <div className={styles.wrapper} ref={menuRef}>
            <button 
                className={`${styles.trigger} ${isCollapsed ? styles.collapsed : ''}`} 
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle user menu"
                aria-haspopup="true"
                aria-expanded={isOpen}
            >
                <div className={styles.avatar}>
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                {!isCollapsed && (
                    <div className={styles.userInfo}>
                        <span className={styles.userName}>{user.name || 'User'}</span>
                        <span className={styles.userRole}>Pro Trader</span>
                    </div>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        className={styles.popover}
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    >
                        <Link href="/profile" className={styles.menuItem} onClick={() => setIsOpen(false)}>
                            <User size={16} />
                            <span>View Profile</span>
                        </Link>
                        
                        <Link href="/settings" className={styles.menuItem} onClick={() => setIsOpen(false)}>
                            <Settings size={16} />
                            <span>Settings</span>
                        </Link>
                        
                        <div className={styles.menuItem}>
                            <Crown size={16} className={styles.proIcon} />
                            <span>Subscription</span>
                            <span className={styles.badge}>PRO</span>
                        </div>
                        
                        <button className={styles.menuItem} onClick={openShortcuts}>
                            <Keyboard size={16} />
                            <span>Shortcuts</span>
                        </button>
                        
                        <button className={styles.menuItem} onClick={toggleTheme}>
                            <SunMoon size={16} />
                            <span>Toggle Theme</span>
                        </button>
                        
                        <div className={styles.divider} />
                        
                        <button className={`${styles.menuItem} ${styles.logout}`} onClick={() => logout()}>
                            <LogOut size={16} />
                            <span>Sign Out</span>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

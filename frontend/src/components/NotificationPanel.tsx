"use client";

import { useState, useEffect, useRef } from 'react';
import { Bell, TrendingUp, Rocket, Newspaper } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { useIsMobile } from '@/hooks/useMediaQuery';
import styles from './NotificationPanel.module.css';

export interface Notification {
  id: string;
  type: 'alert_triggered' | 'portfolio_milestone' | 'ipo_opening' | 'market_news';
  title: string;
  message: string;
  timestamp: Date | string;
  read: boolean;
  actionUrl?: string;
}

export default function NotificationPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const isMobile = useIsMobile();
  const router = useRouter();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('tv-notifications');
    if (saved) {
      setNotifications(JSON.parse(saved));
    } else {
      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'alert_triggered',
          title: 'Price Alert',
          message: 'RELIANCE crossed ₹2900',
          timestamp: new Date().toISOString(),
          read: false,
          actionUrl: '/company/RELIANCE',
        },
        {
          id: '2',
          type: 'portfolio_milestone',
          title: 'Portfolio Milestone',
          message: 'Your portfolio is up 15% this month!',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          read: false,
          actionUrl: '/portfolio',
        },
        {
          id: '3',
          type: 'ipo_opening',
          title: 'IPO Alert',
          message: 'Swiggy IPO opens tomorrow',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
          read: false,
          actionUrl: '/ipos',
        },
      ];
      setNotifications(mockNotifications);
      localStorage.setItem('tv-notifications', JSON.stringify(mockNotifications));
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (e: Event) => {
      setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('tv:close-all-panels', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('tv:close-all-panels', handleEscape);
    };
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    localStorage.setItem('tv-notifications', JSON.stringify(updated));
  };

  const handleNotificationClick = (n: Notification) => {
    if (!n.read) {
      const updated = notifications.map(notif => notif.id === n.id ? { ...notif, read: true } : notif);
      setNotifications(updated);
      localStorage.setItem('tv-notifications', JSON.stringify(updated));
    }
    
    if (n.actionUrl) {
      setIsOpen(false);
      router.push(n.actionUrl);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'alert_triggered': return <Bell size={16} />;
      case 'portfolio_milestone': return <TrendingUp size={16} />;
      case 'ipo_opening': return <Rocket size={16} />;
      case 'market_news': return <Newspaper size={16} />;
      default: return <Bell size={16} />;
    }
  };

  return (
    <div className={styles.wrapper} ref={panelRef}>
      <button 
        className={styles.bellBtn} 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className={styles.badge} />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {isMobile && <div className={styles.overlay} onClick={() => setIsOpen(false)} />}
            <motion.div 
              className={isMobile ? styles.bottomSheet : styles.dropdown}
              initial={isMobile ? { y: '100%' } : { opacity: 0, y: 10, scale: 0.95 }}
              animate={isMobile ? { y: 0 } : { opacity: 1, y: 0, scale: 1 }}
              exit={isMobile ? { y: '100%' } : { opacity: 0, y: 10, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              <div className={styles.header}>
                <h3 className={styles.title}>Notifications</h3>
                {unreadCount > 0 && (
                  <button className={styles.markReadBtn} onClick={markAllRead}>
                    Mark all read
                  </button>
                )}
              </div>
              
              <div className={styles.list}>
                {notifications.length === 0 ? (
                  <div className={styles.empty}>No notifications yet</div>
                ) : (
                  notifications.map(n => (
                    <div 
                      key={n.id} 
                      className={`${styles.item} ${!n.read ? styles.unread : ''}`}
                      onClick={() => handleNotificationClick(n)}
                    >
                      <div className={styles.iconWrapper}>
                        {getIcon(n.type)}
                      </div>
                      <div className={styles.content}>
                        <div className={styles.itemHeader}>
                          <span className={styles.itemTitle}>{n.title}</span>
                          <span className={styles.time}>{formatDistanceToNow(new Date(n.timestamp))} ago</span>
                        </div>
                        <p className={styles.message}>{n.message}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

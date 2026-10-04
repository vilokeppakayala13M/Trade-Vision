"use client";

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Command, Keyboard } from 'lucide-react';
import styles from './KeyboardShortcutsModal.module.css';

const SHORTCUTS = [
    {
        category: 'Global Navigation',
        items: [
            { keys: ['G', 'H'], description: 'Go to Home' },
            { keys: ['G', 'W'], description: 'Go to Watchlist' },
            { keys: ['G', 'P'], description: 'Go to Portfolio' },
            { keys: ['G', 'N'], description: 'Go to News' },
            { keys: ['G', 'T'], description: 'Go to Tools' },
        ]
    },
    {
        category: 'Actions',
        items: [
            { keys: ['⌘', 'K'], description: 'Open Command Palette' },
            { keys: ['?'], description: 'Show Keyboard Shortcuts' },
            { keys: ['Esc'], description: 'Close Modals/Panels' },
        ]
    }
];

export default function KeyboardShortcutsModal() {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const handleOpen = () => setIsOpen(true);
        const handleClose = () => setIsOpen(false);

        window.addEventListener('tv:open-shortcuts-modal', handleOpen);
        window.addEventListener('tv:close-all-panels', handleClose);

        return () => {
            window.removeEventListener('tv:open-shortcuts-modal', handleOpen);
            window.removeEventListener('tv:close-all-panels', handleClose);
        };
    }, []);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className={styles.overlay} onClick={() => setIsOpen(false)}>
                    <motion.div 
                        className={styles.modal}
                        onClick={(e) => e.stopPropagation()}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    >
                        <div className={styles.header}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Keyboard className={styles.icon} size={20} />
                                <h2 className={styles.title}>Keyboard Shortcuts</h2>
                            </div>
                            <button className={styles.closeBtn} onClick={() => setIsOpen(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className={styles.content}>
                            {SHORTCUTS.map((group, idx) => (
                                <div key={idx} className={styles.group}>
                                    <h3 className={styles.groupTitle}>{group.category}</h3>
                                    <div className={styles.list}>
                                        {group.items.map((item, i) => (
                                            <div key={i} className={styles.item}>
                                                <span className={styles.description}>{item.description}</span>
                                                <div className={styles.keys}>
                                                    {item.keys.map((k, j) => (
                                                        <kbd key={j} className={styles.key}>{k}</kbd>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

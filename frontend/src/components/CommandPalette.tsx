"use client";

import { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { useRouter } from 'next/navigation';
import { Search, Home, TrendingUp, Briefcase, BookMarked, Rocket, Settings } from 'lucide-react';
import { searchStocks, SearchResult } from '@/lib/api';
import styles from './CommandPalette.module.css';

export default function CommandPalette() {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const handleOpen = () => setOpen(true);
        const handleClose = () => setOpen(false);

        window.addEventListener('tv:open-command-palette', handleOpen);
        window.addEventListener('tv:close-all-panels', handleClose);

        return () => {
            window.removeEventListener('tv:open-command-palette', handleOpen);
            window.removeEventListener('tv:close-all-panels', handleClose);
        };
    }, []);

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.trim().length >= 2) {
                setLoading(true);
                const data = await searchStocks(query);
                setResults(data);
                setLoading(false);
            } else {
                setResults([]);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    const runCommand = (action: () => void) => {
        setOpen(false);
        action();
    };

    if (!open) return null;

    return (
        <div className={styles.overlay} onClick={() => setOpen(false)}>
            <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
                <Command 
                    label="Global Command Menu" 
                    shouldFilter={false} // Since we're doing API search
                    className={styles.command}
                >
                    <div className={styles.inputWrapper}>
                        <Search className={styles.searchIcon} size={18} />
                        <Command.Input 
                            value={query}
                            onValueChange={setQuery}
                            placeholder="Type a command or search stocks..." 
                            className={styles.input}
                            autoFocus
                        />
                    </div>
                    
                    <Command.List className={styles.list}>
                        <Command.Empty className={styles.empty}>
                            {loading ? 'Searching...' : 'No results found.'}
                        </Command.Empty>

                        {results.length > 0 && (
                            <Command.Group heading="Stocks" className={styles.group}>
                                {results.map((result) => (
                                    <Command.Item 
                                        key={result.symbol}
                                        value={result.symbol}
                                        onSelect={() => runCommand(() => router.push(`/company/${result.symbol}`))}
                                        className={styles.item}
                                    >
                                        <div className={styles.stockItem}>
                                            <span className={styles.symbol}>{result.symbol}</span>
                                            <span className={styles.name}>{result.shortname}</span>
                                        </div>
                                    </Command.Item>
                                ))}
                            </Command.Group>
                        )}

                        <Command.Group heading="Navigation" className={styles.group}>
                            <Command.Item 
                                value="Home"
                                onSelect={() => runCommand(() => router.push('/'))}
                                className={styles.item}
                            >
                                <Home size={16} className={styles.itemIcon} />
                                <span>Home</span>
                            </Command.Item>
                            <Command.Item 
                                value="Watchlist"
                                onSelect={() => runCommand(() => router.push('/watchlist'))}
                                className={styles.item}
                            >
                                <BookMarked size={16} className={styles.itemIcon} />
                                <span>Watchlist</span>
                            </Command.Item>
                            <Command.Item 
                                value="Portfolio"
                                onSelect={() => runCommand(() => router.push('/portfolio'))}
                                className={styles.item}
                            >
                                <Briefcase size={16} className={styles.itemIcon} />
                                <span>Portfolio</span>
                            </Command.Item>
                            <Command.Item 
                                value="Paper Trade"
                                onSelect={() => runCommand(() => router.push('/paper-trading'))}
                                className={styles.item}
                            >
                                <TrendingUp size={16} className={styles.itemIcon} />
                                <span>Paper Trade</span>
                            </Command.Item>
                            <Command.Item 
                                value="IPO Calendar"
                                onSelect={() => runCommand(() => router.push('/ipos'))}
                                className={styles.item}
                            >
                                <Rocket size={16} className={styles.itemIcon} />
                                <span>IPO Calendar</span>
                            </Command.Item>
                            <Command.Item 
                                value="Settings"
                                onSelect={() => runCommand(() => router.push('/settings'))}
                                className={styles.item}
                            >
                                <Settings size={16} className={styles.itemIcon} />
                                <span>Settings</span>
                            </Command.Item>
                        </Command.Group>
                    </Command.List>
                </Command>
            </div>
        </div>
    );
}

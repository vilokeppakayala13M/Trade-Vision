"use client";

import { ArrowDownAZ, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import styles from './SortBar.module.css';

interface SortBarProps {
    currentSort: string;
    onSortChange: (sort: string) => void;
}

export default function SortBar({ currentSort, onSortChange }: SortBarProps) {
    const sorts = [
        { id: 'gainers', label: 'Top Gainers', icon: TrendingUp },
        { id: 'losers', label: 'Top Losers', icon: TrendingDown },
        { id: 'volume', label: 'High Volume', icon: Activity },
        { id: 'az', label: 'A-Z', icon: ArrowDownAZ },
    ];

    return (
        <div className={styles.sortBar}>
            {sorts.map(s => {
                const Icon = s.icon;
                const isActive = currentSort === s.id;
                return (
                    <button 
                        key={s.id}
                        className={`${styles.sortBtn} ${isActive ? styles.active : ''}`}
                        onClick={() => onSortChange(s.id)}
                    >
                        <Icon size={14} />
                        <span>{s.label}</span>
                    </button>
                );
            })}
        </div>
    );
}

"use client";

import { LayoutGrid, List } from 'lucide-react';

interface ViewToggleProps {
    view: 'grid' | 'list';
    onViewChange: (view: 'grid' | 'list') => void;
}

export default function ViewToggle({ view, onViewChange }: ViewToggleProps) {
    return (
        <div style={{ display: 'flex', background: 'var(--surface)', borderRadius: 'var(--radius-sm)', padding: '2px', border: '1px solid var(--border)' }}>
            <button
                onClick={() => onViewChange('grid')}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '4px 8px',
                    background: view === 'grid' ? 'var(--surface-hover)' : 'transparent',
                    color: view === 'grid' ? 'var(--text-primary)' : 'var(--text-secondary)',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)'
                }}
            >
                <LayoutGrid size={16} />
            </button>
            <button
                onClick={() => onViewChange('list')}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '4px 8px',
                    background: view === 'list' ? 'var(--surface-hover)' : 'transparent',
                    color: view === 'list' ? 'var(--text-primary)' : 'var(--text-secondary)',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)'
                }}
            >
                <List size={16} />
            </button>
        </div>
    );
}

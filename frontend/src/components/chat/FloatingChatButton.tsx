"use client";

import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X } from 'lucide-react';
import StockChatPanel from './StockChatPanel';

export default function FloatingChatButton() {
    const [isOpen, setIsOpen] = useState(false);
    const [hasBeenOpened, setHasBeenOpened] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                setIsOpen(false);
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen]);

    const toggleOpen = () => {
        setIsOpen(!isOpen);
        if (!isOpen && !hasBeenOpened) {
            setHasBeenOpened(true);
        }
    };

    return (
        <>
            {isOpen && (
                <div 
                    ref={panelRef}
                    style={{
                        position: 'fixed',
                        bottom: '90px',
                        right: '24px',
                        width: 'min(400px, calc(100vw - 48px))',
                        zIndex: 9997,
                        background: 'var(--surface, #1a1a2e)',
                        border: '1px solid var(--border, rgba(255,255,255,0.12))',
                        borderRadius: '20px',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column'
                    }}
                >
                    <StockChatPanel />
                </div>
            )}
            
            <button
                onClick={toggleOpen}
                style={{
                    position: 'fixed',
                    bottom: '24px',
                    right: '24px',
                    zIndex: 9998,
                    width: '56px',
                    height: '56px',
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    border: 'none',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    boxShadow: '0 4px 20px rgba(99,102,241,0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'transform 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
                {isOpen ? <X size={24} color="white" /> : <MessageSquare size={24} color="white" />}
                
                {!isOpen && !hasBeenOpened && (
                    <div style={{
                        position: 'absolute',
                        top: '0',
                        right: '0',
                        width: '18px',
                        height: '18px',
                        background: '#ef4444',
                        borderRadius: '50%',
                        color: 'white',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px solid var(--background, #0f172a)'
                    }}>
                        1
                    </div>
                )}
            </button>
        </>
    );
}

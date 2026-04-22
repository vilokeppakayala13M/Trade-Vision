"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface WatchlistContextType {
    watchlist: string[];
    addToWatchlist: (id: string) => void;
    removeFromWatchlist: (id: string) => void;
    isInWatchlist: (id: string) => boolean;
}

const WatchlistContext = createContext<WatchlistContextType | undefined>(undefined);

export function WatchlistProvider({ children }: { children: React.ReactNode }) {
    const [watchlist, setWatchlist] = useState<string[]>([]);

    // Load from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem("watchlist");
        if (saved) {
            try {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setWatchlist(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse watchlist", e);
            }
        }
    }, []);

    // Save to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem("watchlist", JSON.stringify(watchlist));
    }, [watchlist]);

    const addToWatchlist = (id: string) => {
        setWatchlist((prev) => {
            if (prev.includes(id)) return prev;
            return [...prev, id];
        });
    };

    const removeFromWatchlist = (id: string) => {
        setWatchlist((prev) => prev.filter((item) => item !== id));
    };

    const isInWatchlist = (id: string) => {
        return watchlist.includes(id);
    };

    return (
        <WatchlistContext.Provider
            value={{ watchlist, addToWatchlist, removeFromWatchlist, isInWatchlist }}
        >
            {children}
        </WatchlistContext.Provider>
    );
}

export function useWatchlist() {
    const context = useContext(WatchlistContext);
    if (context === undefined) {
        throw new Error("useWatchlist must be used within a WatchlistProvider");
    }
    return context;
}

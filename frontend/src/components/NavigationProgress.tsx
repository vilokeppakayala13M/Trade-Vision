"use client";

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function NavigationProgress() {
    const pathname = usePathname();
    const [isNavigating, setIsNavigating] = useState(false);

    useEffect(() => {
        setIsNavigating(true);
        const timer = setTimeout(() => {
            setIsNavigating(false);
        }, 500); // Fake progress duration

        return () => clearTimeout(timer);
    }, [pathname]);

    return (
        <AnimatePresence>
            {isNavigating && (
                <motion.div
                    initial={{ scaleX: 0, opacity: 1 }}
                    animate={{ scaleX: 1, opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5, ease: "circOut" }}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '3px',
                        background: 'var(--primary)',
                        transformOrigin: '0% 50%',
                        zIndex: 99999,
                    }}
                />
            )}
        </AnimatePresence>
    );
}

"use client";

import { usePathname } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import PageTransition from './PageTransition';
import { ReactNode } from 'react';

interface AnimatedLayoutProps {
    children: ReactNode;
}

export default function AnimatedLayout({ children }: AnimatedLayoutProps) {
    const pathname = usePathname();

    return (
        <AnimatePresence mode="wait" initial={false}>
            <PageTransition key={pathname}>
                {children}
            </PageTransition>
        </AnimatePresence>
    );
}

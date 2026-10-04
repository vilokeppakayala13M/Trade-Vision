"use client";

import { useEffect, useState, RefObject } from 'react';

/**
 * Custom hook to detect when an element enters the viewport using IntersectionObserver.
 * Useful for triggering staggered entrance animations.
 */
export function useStaggeredEntrance(ref: RefObject<Element | null>) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setIsVisible(true);
                observer.unobserve(element);
            }
        }, { 
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px' // slightly trigger before it fully enters
        });

        observer.observe(element);

        return () => {
            if (element) {
                observer.unobserve(element);
            }
        };
    }, [ref]);

    return isVisible;
}

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export function useKeyboardShortcuts() {
  const router = useRouter();
  const lastKey = useRef<string | null>(null);
  const timer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        (document.activeElement as HTMLElement)?.isContentEditable
      ) {
        // Exception for Esc
        if (e.key === 'Escape') {
          (document.activeElement as HTMLElement).blur();
        }
        return;
      }

      // Cmd+K or Ctrl+K for command palette
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('tv:open-command-palette'));
        return;
      }

      // Escape key to close all panels
      if (e.key === 'Escape') {
        window.dispatchEvent(new CustomEvent('tv:close-all-panels'));
        return;
      }

      // '?' key for shortcuts modal
      if (e.key === '?' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('tv:open-shortcuts-modal'));
        return;
      }

      // Two-key sequences starting with 'g'
      if (e.key.toLowerCase() === 'g') {
        lastKey.current = 'g';
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => {
          lastKey.current = null;
        }, 500);
        return;
      }

      if (lastKey.current === 'g') {
        const key = e.key.toLowerCase();
        let navigated = true;
        
        if (key === 'h') router.push('/');
        else if (key === 'w') router.push('/watchlist');
        else if (key === 'p') router.push('/portfolio');
        else if (key === 'n') router.push('/news');
        else if (key === 't') router.push('/tools');
        else navigated = false;

        if (navigated) {
          lastKey.current = null;
          if (timer.current) clearTimeout(timer.current);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (timer.current) clearTimeout(timer.current);
    };
  }, [router]);
}

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop component scrolls the window to the top (0, 0)
 * every time the route (pathname) changes.
 * 
 * It also resets focus to the top of the page for accessibility.
 */
export default function ScrollToTop() {
    const { pathname } = useLocation();

    useEffect(() => {
        // Reset scroll position to the top
        window.scrollTo({ top: 0, behavior: 'auto' });

        // Focus management for accessibility
        setTimeout(() => {
            const h1 = document.querySelector('h1');
            if (h1) {
                h1.setAttribute('tabindex', '-1');
                h1.focus({ preventScroll: true });
            } else {
                const main = document.querySelector('main');
                if (main) {
                    main.setAttribute('tabindex', '-1');
                    main.focus({ preventScroll: true });
                }
            }
        }, 100); // Small delay to ensure the new page content is rendered
    }, [pathname]);

    return null;
}

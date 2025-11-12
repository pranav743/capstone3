"use client";

import { useEffect, useState } from 'react';

const DESKTOP_BREAKPOINT = 1024;

function useIsDesktop(): boolean {
    const [isDesktop, setIsDesktop] = useState<boolean>(() => {
        if (typeof window !== "undefined") {
            return window.innerWidth >= DESKTOP_BREAKPOINT;
        }
        return false; // Default value for SSR
    });

    useEffect(() => {
        if (typeof window === "undefined") return;

        function handleResize() {
            setIsDesktop(window.innerWidth >= DESKTOP_BREAKPOINT);
        }

        window.addEventListener('resize', handleResize);
        // Set initial value in case it was false during SSR
        handleResize();

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return isDesktop;
}

export default useIsDesktop;
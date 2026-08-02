'use client';

import { useEffect } from 'react';
import { initScrollReveal, initScrollProgress, initParallax } from '@/lib/scroll-animations';

/**
 * Client component to initialize scroll animations on mount
 * Handles: scroll reveal, scroll progress bar, parallax effects
 */
export default function ScrollInitializer() {
  useEffect(() => {
    // Initialize scroll reveal animations
    const revealObserver = initScrollReveal({
      rootMargin: '0px 0px -10% 0px',
      threshold: 0.1,
      once: true,
    });

    // Initialize scroll progress bar
    const progressCleanup = initScrollProgress('.scroll-progress');

    // Initialize parallax effects
    const parallaxCleanup = initParallax('.parallax', { speed: 0.25, direction: 'up' });

    // Cleanup on unmount
    return () => {
      revealObserver?.disconnect();
      progressCleanup?.();
      parallaxCleanup?.();
    };
  }, []);

  // This component renders nothing - it's purely for side effects
  return null;
}
'use client';

import { useEffect } from 'react';
import { cancelSectionScroll, scrollToSection } from '@/lib/navigation';
import { initScrollReveal, initScrollProgress, initParallax } from '@/lib/scroll-animations';

/**
 * Client component to initialize scroll animations on mount
 * Handles: scroll reveal, scroll progress bar, parallax effects
 */
export default function ScrollInitializer() {
  useEffect(() => {
    // Ordinary in-page links use the same offsets and motion preference as menus.
    const onAnchor = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[href^="#"]') : null;
      if (!anchor || anchor.target === '_blank') return;
      const href = anchor.getAttribute('href');
      if (href && scrollToSection(href)) event.preventDefault();
    };
    document.addEventListener('click', onAnchor);
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onMotion = () => {
      if (motion.matches) document.querySelectorAll('.scroll-reveal').forEach(el => el.classList.add('is-visible'));
    };
    motion.addEventListener('change', onMotion);
    // Initialize scroll reveal animations
    const revealObserver = initScrollReveal({
      rootMargin: '0px 0px -20px 0px',
      threshold: 0,
      once: true,
    });

    // Initialize scroll progress bar
    const progressCleanup = initScrollProgress('.scroll-progress');

    // Initialize parallax effects
    const parallaxCleanup = initParallax('.parallax', { speed: 0.25, direction: 'up' });

    // Cleanup on unmount
    return () => {
      cancelSectionScroll();
      document.removeEventListener('click', onAnchor);
      motion.removeEventListener('change', onMotion);
      revealObserver?.disconnect();
      progressCleanup?.();
      parallaxCleanup?.();
    };
  }, []);

  // This component renders nothing - it's purely for side effects
  return null;
}
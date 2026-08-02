'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import {
  initScrollReveal,
  initScrollProgress,
  initParallax,
  smoothScrollTo,
  easings,
  type SmoothScrollOptions,
  type ScrollRevealOptions,
} from './scroll-animations';

/**
 * Hook to initialize scroll animations globally
 * Use once in your root layout or main page component
 */
export function useScrollAnimations(
  options: ScrollRevealOptions & { enableProgress?: boolean; enableParallax?: boolean } = {}
) {
  const initialized = useRef(false);
  const progressCleanup = useRef<(() => void) | null>(null);
  const parallaxCleanup = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (initialized.current || typeof window === 'undefined') return;

    initialized.current = true;

    // Initialize scroll reveal
    const revealObserver = initScrollReveal(options);

    // Initialize scroll progress bar
    if (options.enableProgress !== false) {
      progressCleanup.current = initScrollProgress();
    }

    // Initialize parallax
    if (options.enableParallax) {
      parallaxCleanup.current = initParallax();
    }

    // Cleanup on unmount
    return () => {
      revealObserver?.disconnect();
      progressCleanup.current?.();
      parallaxCleanup.current?.();
      initialized.current = false;
    };
  }, [options]);
}

/**
 * Hook for smooth scrolling to elements
 */
export function useSmoothScroll() {
  const scrollTo = useCallback(
    (target: string | HTMLElement | number, options: SmoothScrollOptions = {}) => {
      return smoothScrollTo(target, options);
    },
    []
  );

  const scrollToTop = useCallback(
    (options: SmoothScrollOptions = {}) => {
      return smoothScrollTo(0, { ...options, duration: options.duration ?? 600 });
    },
    []
  );

  const scrollToElement = useCallback(
    (id: string, options: SmoothScrollOptions = {}) => {
      return smoothScrollTo(`#${id}`, options);
    },
    []
  );

  return { scrollTo, scrollToTop, scrollToElement };
}

/**
 * Hook for element-specific scroll reveal
 * Attach to a ref to trigger reveal animation when element enters viewport
 */
export function useElementReveal(
  options: Omit<ScrollRevealOptions, 'root'> = {}
) {
  const elementRef = useRef<HTMLElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const el = elementRef.current;
    if (!el || typeof window === 'undefined') return;

    // Check reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      el.classList.add('is-visible');
      return;
    }

    const { once = true, onReveal, ...observerOptions } = options;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            onReveal?.(entry.target);
            if (once) observerRef.current?.unobserve(entry.target);
          } else if (!once) {
            entry.target.classList.remove('is-visible');
          }
        });
      },
      observerOptions
    );

    observerRef.current.observe(el);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [options]);

  return elementRef;
}

/**
 * Hook for parallax effect on an element
 */
export function useParallax(speed = 0.3, direction: 'up' | 'down' = 'up') {
  const elementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    let ticking = false;

    function update() {
      const el = elementRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const scrollY = window.scrollY;
      const viewportHeight = window.innerHeight;

      if (rect.bottom < 0 || rect.top > viewportHeight) {
        ticking = false;
        return;
      }

      const elementTop = rect.top + scrollY;
      const elementHeight = rect.height;
      const progress = (scrollY - elementTop + viewportHeight) / (viewportHeight + elementHeight);
      const translateY = (progress - 0.5) * elementHeight * speed * 2;
      const transform = direction === 'up' ? -translateY : translateY;

      el.style.transform = `translate3d(0, ${transform}px, 0)`;
      ticking = false;
    }

    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    update(); // Initial

    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, [speed, direction]);

  return elementRef;
}

/**
 * Easing functions for custom animations
 */
export { easings };

/**
 * Custom hook for scroll position
 */
export function useScrollPosition() {
  const [scrollY, setScrollY] = useState(0);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('down');
  const lastScrollY = useRef(0);

  useEffect(() => {
    let ticking = false;

    function update() {
      const currentScrollY = window.scrollY;
      setScrollY(currentScrollY);
      setScrollDirection(currentScrollY > lastScrollY.current ? 'down' : 'up');
      lastScrollY.current = currentScrollY;
      ticking = false;
    }

    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    update();

    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return { scrollY, scrollDirection };
}
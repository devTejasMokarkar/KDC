'use client';

/**
 * Scroll Animation Utilities
 * Provides IntersectionObserver-based scroll reveal animations
 * with staggered delays, direction variants, and smooth scroll helpers
 */

// Types
export type RevealDirection = 'up' | 'down' | 'left' | 'right' | 'scale' | 'rotate' | 'fade' | 'clip';
export type StaggerIndex = 1 | 2 | 3 | 4 | 5 | 6;

export interface ScrollRevealOptions {
  root?: Element | null;
  rootMargin?: string;
  threshold?: number | number[];
  once?: boolean;
  delay?: number;
  direction?: RevealDirection;
  stagger?: StaggerIndex;
  onReveal?: (element: Element) => void;
}

export interface SmoothScrollOptions {
  duration?: number;
  easing?: (t: number) => number;
  offset?: number;
  callback?: () => void;
}

// Default easing functions
export const easings = {
  easeOutCubic: (t: number) => 1 - Math.pow(1 - t, 3),
  easeOutQuart: (t: number) => 1 - Math.pow(1 - t, 4),
  easeOutQuint: (t: number) => 1 - Math.pow(1 - t, 5),
  easeOutExpo: (t: number) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t),
  easeOutCirc: (t: number) => Math.sqrt(1 - Math.pow(t - 1, 2)),
  easeOutBack: (t: number) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
  easeInOutCubic: (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  // Silk easing matching CSS --ease-silk and --ease-reveal
  silk: (t: number) => {
    // cubic-bezier(0.25, 0.46, 0.45, 0.94)
    return cubicBezier(t, 0.25, 0.46, 0.45, 0.94);
  },
  reveal: (t: number) => {
    // cubic-bezier(0.16, 1, 0.3, 1)
    return cubicBezier(t, 0.16, 1, 0.3, 1);
  },
};

// Cubic bezier calculation
function cubicBezier(t: number, x1: number, y1: number, x2: number, y2: number): number {
  const x = 3 * (1 - t) * (1 - t) * t * x1 + 3 * (1 - t) * t * t * x2 + t * t * t;
  // Solve for y given x using Newton's method (approximation)
  return 3 * (1 - t) * (1 - t) * t * y1 + 3 * (1 - t) * t * t * y2 + t * t * t;
}

/**
 * Initialize scroll reveal animations
 * Adds .is-visible class to elements with .scroll-reveal when they enter viewport
 */
export function initScrollReveal(options: ScrollRevealOptions = {}): IntersectionObserver | null {
  if (typeof window === 'undefined') return null;

  const {
    root = null,
    rootMargin = '0px 0px -10% 0px',
    threshold = 0.1,
    once = true,
    onReveal,
  } = options;

  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    // Immediately reveal all elements
    document.querySelectorAll('.scroll-reveal').forEach(el => {
      el.classList.add('is-visible');
      onReveal?.(el);
    });
    return null;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const el = entry.target as HTMLElement;

        // Apply stagger delay if specified
        const staggerMatch = el.className.match(/stagger-(\d)/);
        const staggerDelay = staggerMatch ? parseInt(staggerMatch[1], 10) * 50 : 0;

        setTimeout(() => {
          el.classList.add('is-visible');
          onReveal?.(el);
        }, staggerDelay);

        if (once) {
          observer.unobserve(el);
        }
      } else if (!once) {
        entry.target.classList.remove('is-visible');
      }
    });
  }, { root, rootMargin, threshold });

  // Observe all scroll-reveal elements
  document.querySelectorAll('.scroll-reveal').forEach((el) => {
    observer.observe(el);
  });

  return observer;
}

/**
 * Smooth scroll to element with custom easing
 */
export function smoothScrollTo(
  target: string | HTMLElement | number,
  options: SmoothScrollOptions = {}
): Promise<void> {
  return new Promise((resolve) => {
    const {
      duration = 800,
      easing = easings.reveal,
      offset = 0,
      callback,
    } = options;

    // Get target position
    let targetY: number;
    if (typeof target === 'number') {
      targetY = target;
    } else if (typeof target === 'string') {
      const element = document.querySelector(target);
      if (!element) {
        resolve();
        return;
      }
      targetY = element.getBoundingClientRect().top + window.scrollY;
    } else {
      targetY = target.getBoundingClientRect().top + window.scrollY;
    }

    // Account for fixed navbar
    const navHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height') || '64', 10);
    targetY -= navHeight + offset;

    const startY = window.scrollY;
    const distance = targetY - startY;
    const startTime = performance.now();

    function animate(currentTime: number) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easing(progress);

      window.scrollTo(0, startY + distance * easedProgress);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        callback?.();
        resolve();
      }
    }

    requestAnimationFrame(animate);
  });
}

/**
 * Scroll progress indicator
 * Updates a fixed progress bar based on scroll position
 */
export function initScrollProgress(selector = '.scroll-progress'): (() => void) | null {
  if (typeof window === 'undefined') return null;

  const progressBar = document.querySelector<HTMLElement>(selector);
  if (!progressBar) return null;

  function updateProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollTop / docHeight;
    progressBar!.style.transform = `scaleX(${progress})`;
  }

  // Initial update
  updateProgress();

  // Throttled scroll listener
  let ticking = false;
  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        updateProgress();
        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  // Return cleanup function
  return () => {
    window.removeEventListener('scroll', onScroll);
  };
}

/**
 * Parallax effect for elements
 */
export function initParallax(
  selector = '.parallax',
  options: { speed?: number; direction?: 'up' | 'down' } = {}
): (() => void) | null {
  if (typeof window === 'undefined') return null;

  const { speed = 0.3, direction = 'up' } = options;
  const elements = document.querySelectorAll<HTMLElement>(selector);

  if (elements.length === 0) return null;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return null;

  function updateParallax() {
    const scrollY = window.scrollY;

    elements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const elementTop = rect.top + scrollY;
      const elementHeight = rect.height;
      const viewportHeight = window.innerHeight;

      // Only apply parallax when element is in viewport
      if (rect.bottom < 0 || rect.top > viewportHeight) return;

      const progress = (scrollY - elementTop + viewportHeight) / (viewportHeight + elementHeight);
      const translateY = (progress - 0.5) * elementHeight * speed * 2;
      const transform = direction === 'up' ? -translateY : translateY;

      el.style.transform = `translate3d(0, ${transform}px, 0)`;
    });
  }

  let ticking = false;
  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        updateParallax();
        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  updateParallax(); // Initial

  return () => window.removeEventListener('scroll', onScroll);
}

/**
 * Auto-initialize scroll animations on DOM ready
 */
export function autoInitScrollAnimations(): {
  revealObserver: IntersectionObserver | null;
  scrollProgressCleanup: (() => void) | null;
  parallaxCleanup: (() => void) | null;
} {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return { revealObserver: null, scrollProgressCleanup: null, parallaxCleanup: null };
  }

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    const result = { revealObserver: null as IntersectionObserver | null, scrollProgressCleanup: null as (() => void) | null, parallaxCleanup: null as (() => void) | null };
    document.addEventListener('DOMContentLoaded', () => {
      result.revealObserver = initScrollReveal();
      result.scrollProgressCleanup = initScrollProgress();
      result.parallaxCleanup = initParallax();
    });
    return result;
  }

  return {
    revealObserver: initScrollReveal(),
    scrollProgressCleanup: initScrollProgress(),
    parallaxCleanup: initParallax(),
  };
}

/**
 * Scroll to top with smooth animation
 */
export function scrollToTop(options: SmoothScrollOptions = {}): Promise<void> {
  return smoothScrollTo(0, options);
}

/**
 * Scroll to element by ID (for anchor links)
 */
export function scrollToElement(id: string, options: SmoothScrollOptions = {}): Promise<void> {
  return smoothScrollTo(`#${id}`, options);
}

/**
 * Hook for React components to use scroll animations
 * (Use in client components with 'use client')
 */
export function useScrollReveal(
  elementRef: React.RefObject<HTMLElement>,
  options: Omit<ScrollRevealOptions, 'root'> = {}
) {
  if (typeof window === 'undefined') return;

  const { once = true, onReveal, ...observerOptions } = options;

  // This would be used in a useEffect in a React component
  // Included here for reference - actual implementation would be in a hook file
  return {
    observe: () => {
      if (!elementRef.current) return;
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            onReveal?.(entry.target);
            if (once) observer.unobserve(entry.target);
          } else if (!once) {
            entry.target.classList.remove('is-visible');
          }
        });
      }, observerOptions);

      observer.observe(elementRef.current);
      return () => observer.disconnect();
    },
  };
}
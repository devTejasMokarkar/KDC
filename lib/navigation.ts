let cancelActiveScroll: (() => void) | undefined;

/** Stop only our anchor animation; native wheel/touch scrolling is never replaced. */
export function cancelSectionScroll() {
  cancelActiveScroll?.();
}

function scrollToTarget(target: HTMLElement) {
  cancelSectionScroll();
  const root = document.documentElement;
  const padding = Number.parseFloat(getComputedStyle(root).scrollPaddingTop) || 0;
  const margin = Number.parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
  const maximum = Math.max(0, Math.max(root.scrollHeight, document.body.scrollHeight) - window.innerHeight);
  const destination = Math.max(0, Math.min(maximum, target.getBoundingClientRect().top + window.scrollY - padding - margin));
  const start = window.scrollY;
  const distance = destination - start;
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (motion.matches || Math.abs(distance) < 1) {
    window.scrollTo({ top: destination, behavior: 'instant' });
    return;
  }

  const duration = Math.min(950, Math.max(420, Math.abs(distance) * .24));
  let firstFrame: number | undefined;
  let frame = 0;
  let cancelled = false;
  const cancel = () => {
    cancelled = true;
    cancelAnimationFrame(frame);
    for (const event of ['wheel', 'touchstart', 'pointerdown']) window.removeEventListener(event, cancel);
    window.removeEventListener('keydown', onKey);
    motion.removeEventListener('change', onMotion);
    if (cancelActiveScroll === cancel) cancelActiveScroll = undefined;
  };
  const onKey = (event: KeyboardEvent) => {
    if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(event.key)) cancel();
  };
  const onMotion = () => {
    if (!motion.matches) return;
    cancel();
    window.scrollTo({ top: destination, behavior: 'instant' });
  };
  const tick = (timestamp: number) => {
    if (cancelled) return;
    firstFrame ??= timestamp;
    const progress = Math.min(1, (timestamp - firstFrame) / duration);
    const eased = progress < .5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2;
    // "instant" avoids stacking the CSS/browser smooth animation on each frame.
    window.scrollTo({ top: start + distance * eased, behavior: 'instant' });
    if (progress < 1) frame = requestAnimationFrame(tick);
    else cancel();
  };
  cancelActiveScroll = cancel;
  for (const event of ['wheel', 'touchstart', 'pointerdown']) window.addEventListener(event, cancel, { passive: true });
  window.addEventListener('keydown', onKey);
  motion.addEventListener('change', onMotion);
  frame = requestAnimationFrame(tick);
}

/** Keep anchor offsets, booking transitions and reduced-motion behavior consistent. */
export function scrollToSection(href: string): boolean {
  if (!href.startsWith('#')) return false;
  const target = document.getElementById(href.slice(1));
  if (!target) return false;
  if (window.location.hash !== href) window.history.replaceState(null, '', href);
  if (href === '#pricing') {
    window.dispatchEvent(new Event('kdc:booking-items'));
    requestAnimationFrame(() => {
      const current = document.getElementById('pricing');
      if (current) scrollToTarget(current);
    });
  } else scrollToTarget(target);
  if (href === '#main-content') {
    target.tabIndex = -1;
    target.focus({ preventScroll: true });
  }
  return true;
}

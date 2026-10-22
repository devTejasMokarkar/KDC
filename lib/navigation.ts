/** Keep anchor navigation consistent across cards, menus and ordinary links. */
export function scrollToSection(href: string): boolean {
  if (!href.startsWith('#')) return false;
  const target = document.getElementById(href.slice(1));
  if (!target) return false;
  const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
  if (window.location.hash !== href) window.history.replaceState(null, '', href);
  if (href === '#pricing') {
    window.dispatchEvent(new Event('kdc:booking-items'));
    requestAnimationFrame(() => document.getElementById('pricing')?.scrollIntoView({ behavior, block: 'start' }));
  } else target.scrollIntoView({ behavior, block: 'start' });
  if (href === '#main-content') {
    target.tabIndex = -1;
    target.focus({ preventScroll: true });
  }
  return true;
}

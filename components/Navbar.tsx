'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { scrollToSection } from '@/lib/navigation';
import { useDialog } from '@/lib/use-dialog';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useI18n } from '@/lib/i18n';
import { BUSINESS } from '@/lib/business';

type NavLink = { href: string; labelKey: string };

const NAV_LINKS: NavLink[] = [
  { href: '#the-process', labelKey: 'nav.process' },
  { href: '#services',    labelKey: 'nav.services' },
  { href: '#fabric-care', labelKey: 'nav.fabricCare' },
  { href: '#contact-us',  labelKey: 'nav.contact' },
  { href: '#book',        labelKey: 'nav.billing' },
];

const MOBILE_NAV_LINKS: { href: string; icon: React.ReactNode }[] = [
  {
    href: '#main-content',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M3 11.5 12 3l9 8.5v8.5a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-8.5z" fill="currentColor" />
      </svg>
    ),
  },
  {
    href: '#services',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    href: BUSINESS.phoneE164 ? `tel:${BUSINESS.phoneE164}` : '#contact-us',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
      </svg>
    ),
  },
  {
    href: '#book',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M6 4h12v2H6V4zm0 4h12v14H6V8zm2 2v2h2v-2H8zm4 0v2h2v-2h-2z" fill="currentColor" />
      </svg>
    ),
  },
  {
    href: '#contact-us',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
  },
];

export default function Navbar() {
  const { t } = useI18n();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const drawerRef = useRef<HTMLDivElement>(null);
  const pendingNavigation = useRef<string | null>(null);
  useDialog(menuOpen, drawerRef, () => setMenuOpen(false));


  // Scroll listener
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close menu on resize to desktop
  useEffect(() => {
    const onResize = () => { if (window.innerWidth > 900) setMenuOpen(false); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Track every section, including those with no navigation link. This clears
  // Booking when reviews or fabric care actually enter the reading area.
  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>('main > section[id]'));
    let frame = 0;
    const update = () => {
      const header = Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 72;
      const probe = header + Math.min(window.innerHeight * .18, 130);
      const current = sections.find(section => {
        const rect = section.getBoundingClientRect();
        return rect.top <= probe && rect.bottom > probe;
      });
      setActiveSection(current ? `#${current.id}` : '');
    };
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };
    update();
    const layout = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(schedule) : null;
    const main = document.querySelector('main');
    if (main) layout?.observe(main);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(frame);
      layout?.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, []);

  // Close menu and scroll to section
  const navigate = useCallback((href: string) => {
    if (href.startsWith('/')) {
      window.location.href = href;
      return;
    }
    if (scrollToSection(href === '#main-content' ? '#the-process' : href)) return;
    // Section not on the current page — route to the homepage section anchor.
    window.location.href = new URL(`/${href}`, window.location.origin).href;
  }, []);

  const handleNavClick = useCallback((href: string) => {
    if (menuOpen) {
      pendingNavigation.current = href;
      setMenuOpen(false);
    } else navigate(href);
  }, [menuOpen, navigate]);

  // Start scrolling after the drawer releases its body lock and focus trap.
  useEffect(() => {
    if (menuOpen || !pendingNavigation.current) return;
    const href = pendingNavigation.current;
    pendingNavigation.current = null;
    navigate(href);
  }, [menuOpen, navigate]);

  return (
    <>
      <header>
        <nav
          className={`navbar${scrolled ? ' scrolled' : ''}${menuOpen ? ' menu-open' : ''}`}
          aria-label={t('nav.mainAria')}
        >
          {/* Wordmark */}
          <a
            href="#the-process"
            className="navbar__wordmark"
            aria-label={t('nav.wordmarkAria')}
            onClick={(e) => { e.preventDefault(); setMenuOpen(false); window.history.replaceState(null, '', '#the-process'); window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); }}
          >
            {BUSINESS.shortName}
            {BUSINESS.name !== BUSINESS.shortName && <span>{BUSINESS.name.slice(BUSINESS.shortName.length).trim()}</span>}
          </a>

          {/* Desktop center links */}
          <ul className="navbar__links" role="list">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className={activeSection === link.href ? 'active' : ''}
                  aria-current={activeSection === link.href ? 'location' : undefined}
                  onClick={(e) => { e.preventDefault(); handleNavClick(link.href); }}
                >
                  {t(link.labelKey)}
                </a>
              </li>
            ))}
          </ul>

          <div className="navbar__right">
            <LanguageSwitcher />
            <a className="nav-book" href="#book">{t('hero.book')}<span aria-hidden="true">↗</span></a>
            <button
              className={`navbar__mobile-toggle${menuOpen ? ' active' : ''}`}
              aria-label={t('nav.openMenu')}
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation-menu"
              onClick={() => setMenuOpen(o => !o)}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </nav>

        {/* Mobile bottom actions */}
        <div className="mobile-actions" aria-label={t('nav.mobileAria')}>
          <div className="mobile-actions-grid">
            {MOBILE_NAV_LINKS.filter((link, index) => index !== 2 || !!BUSINESS.phoneE164).map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => {
                  if (!link.href.startsWith('tel:')) {
                    e.preventDefault();
                    handleNavClick(link.href);
                  }
                }}
                className={`action-link${activeSection === (link.href === '#main-content' ? '#the-process' : link.href) ? ' is-active' : ''}`}
                aria-current={activeSection === (link.href === '#main-content' ? '#the-process' : link.href) ? 'location' : undefined}
                aria-label={t(link.href === '#main-content' ? 'nav.home' : link.href === '#services' ? 'nav.services' : link.href.startsWith('tel:') ? 'nav.call' : link.href === '#book' ? 'nav.billing' : 'nav.contact')}
              >
                <div className="action-icon">
                  {link.icon}
                </div>
                <span className="action-label">{t(link.href === '#main-content' ? 'nav.home' : link.href === '#services' ? 'nav.services' : link.href.startsWith('tel:') ? 'nav.call' : link.href === '#book' ? 'nav.billing' : 'nav.contact')}</span>
              </a>
            ))}
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <div
        className={`mobile-menu${menuOpen ? ' open' : ''}`}
        id="mobile-navigation-menu"
        ref={drawerRef}
        tabIndex={-1}
        aria-hidden={!menuOpen}
        aria-modal={menuOpen || undefined}
        role="dialog"
        aria-label={t('nav.menuAria')}
      >
        <button type="button" className="mobile-menu-close" onClick={() => setMenuOpen(false)} tabIndex={menuOpen ? 0 : -1} aria-label={t('nav.closeMenu')}>×</button>
        <ul role="list">
          {NAV_LINKS.map((link, index) => (
            <li key={link.href} style={{ transitionDelay: menuOpen ? `${70 + index * 35}ms` : '0ms' }}>
              <a
                href={link.href}
                className={activeSection === link.href ? 'active' : ''}
                  aria-current={activeSection === link.href ? 'location' : undefined}
                onClick={(e) => { e.preventDefault(); handleNavClick(link.href); }}
                tabIndex={menuOpen ? 0 : -1}
              >
                {t(link.labelKey)}
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* Backdrop */}
        <div
          className={`mobile-menu-backdrop${menuOpen ? ' is-open' : ''}`}
          data-modal-backdrop
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
    </>
  );
}

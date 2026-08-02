'use client';

import { useEffect, useState, useCallback } from 'react';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useI18n } from '@/lib/i18n';

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
    href: 'tel:+919876543210',
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
  const [activeSection, setActiveSection] = useState('#the-process');


  // Scroll listener
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close menu on resize to desktop
  useEffect(() => {
    const onResize = () => { if (window.innerWidth > 900) setMenuOpen(false); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Scrollspy — highlight the nav link for the section in view
  useEffect(() => {
    const ids = NAV_LINKS.map((link) => link.href).filter((href) => href.startsWith('#'));
    const sections = ids
      .map((id) => document.querySelector<HTMLElement>(id))
      .filter((el): el is HTMLElement => !!el);
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        const current = visible[0];
        if (current && current.target.id) {
          setActiveSection(`#${current.target.id}`);
        }
      },
      { rootMargin: '-40% 0px -55% 0px', threshold: 0 }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  // Escape closes the drawer
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Lock body scroll while the drawer is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  // Close menu and scroll to section
  const handleNavClick = useCallback((href: string) => {
    setMenuOpen(false);
    if (href.startsWith('/')) {
      window.location.href = href;
      return;
    }
    const el = document.querySelector(href);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    // Section not on the current page — route to the homepage section anchor.
    window.location.href = `/${href}`;
  }, []);

  return (
    <>
      <header>
        <nav
          className={`navbar${scrolled ? ' scrolled' : ''}${menuOpen ? ' menu-open' : ''}`}
          aria-label={t('nav.mainAria')}
        >
          {/* Wordmark */}
          <a
            href="#top"
            className="navbar__wordmark"
            aria-label={t('nav.wordmarkAria')}
            onClick={(e) => { e.preventDefault(); setMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          >
            Rakesh
            <span>Dry Cleaners</span>
          </a>

          {/* Desktop center links */}
          <ul className="navbar__links" role="list">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className={activeSection === link.href ? 'active' : ''}
                  onClick={(e) => { e.preventDefault(); handleNavClick(link.href); }}
                >
                  {t(link.labelKey)}
                </a>
              </li>
            ))}
          </ul>

          <div className="navbar__right">
            <LanguageSwitcher />
            <button
              className={`navbar__mobile-toggle${menuOpen ? ' active' : ''}`}
              aria-label={menuOpen ? t('nav.closeMenu') : t('nav.openMenu')}
              aria-expanded={menuOpen}
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
            {MOBILE_NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => {
                  if (!link.href.startsWith('tel:')) {
                    e.preventDefault();
                    handleNavClick(link.href);
                  }
                }}
                className="action-link"
              >
                <div className="action-icon">
                  {link.icon}
                </div>
              </a>
            ))}
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <div
        className={`mobile-menu${menuOpen ? ' open' : ''}`}
        aria-hidden={!menuOpen}
        role="dialog"
        aria-label={t('nav.menuAria')}
      >
        <ul role="list">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className={activeSection === link.href ? 'active' : ''}
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
      {menuOpen && (
        <div
          className="mobile-menu-backdrop"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}

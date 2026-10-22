'use client';

import { useEffect, useRef, useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { LANG_CODES, LANG_NAMES, LOCALES, type Locale } from '@/lib/translations';

export default function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    rootRef.current?.querySelector<HTMLButtonElement>('[aria-selected="true"]')?.focus();
    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const select = (next: Locale) => {
    setLocale(next);
    setOpen(false);
    triggerRef.current?.focus();
  };

  return (
    <div className="lang-switcher" ref={rootRef} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false); }}>
      <button
        type="button"
        ref={triggerRef}
        aria-controls={open ? "language-options" : undefined}
        onKeyDown={event => { if (event.key === "ArrowDown" || event.key === "ArrowUp") { event.preventDefault(); setOpen(true); } }}
        className="lang-switcher__trigger"
        aria-label={t('lang.switch')}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <svg
          className="lang-switcher__globe"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
        <span className="lang-switcher__label">{LANG_CODES[locale]}</span>
      </button>

      {open && (
        <ul id="language-options" className="lang-switcher__menu" role="listbox" aria-label={t('lang.label')}>
          {LOCALES.map((code) => (
            <li key={code} role="presentation">
              <button
                type="button"
                role="option"
                tabIndex={locale === code ? 0 : -1}
                onKeyDown={event => {
                  const index = LOCALES.indexOf(code);
                  const next = event.key === 'ArrowDown' ? (index + 1) % LOCALES.length : event.key === 'ArrowUp' ? (index + LOCALES.length - 1) % LOCALES.length : event.key === 'Home' ? 0 : event.key === 'End' ? LOCALES.length - 1 : null;
                  if (next !== null) {
                    event.preventDefault();
                    rootRef.current?.querySelectorAll<HTMLButtonElement>('[role="option"]')[next]?.focus();
                  }
                }}
                aria-selected={locale === code}
                className={`lang-switcher__option${locale === code ? ' active' : ''}`}
                onClick={() => select(code)}
              >
                <span className="lang-switcher__name">{LANG_NAMES[code]}</span>
                {locale === code && (
                  <svg
                    className="lang-switcher__check"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

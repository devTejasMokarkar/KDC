import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { LanguageProvider, useI18n } from '@/lib/i18n';
import { LANG_NAMES, LOCALES, dictionaries, en, mr, hi } from '@/lib/translations';
const STORAGE_KEY = 'kdc:lang';

function Probe() {
  const { locale, setLocale, t } = useI18n();
  return (
    <div>
      <p data-testid="locale">{locale}</p>
      <p data-testid="greeting">{t('nav.process')}</p>
      <p data-testid="interp">{t('wa.date', { value: 'Sat, Aug 2' })}</p>
      <button type="button" onClick={() => setLocale('mr')}>to-mr</button>
    </div>
  );
}

describe('i18n provider', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.localStorage.setItem(STORAGE_KEY, 'en');
    document.documentElement.removeAttribute('lang');
  });

  it('defaults to English and renders english text', () => {
    render(
      <LanguageProvider>
        <Probe />
      </LanguageProvider>
    );
    expect(screen.getByTestId('locale').textContent).toBe('en');
    expect(screen.getByTestId('greeting').textContent).toBe('The Process');
  });

  it('interpolates {var} placeholders', () => {
    render(
      <LanguageProvider>
        <Probe />
      </LanguageProvider>
    );
    expect(screen.getByTestId('interp').textContent).toBe('Date: Sat, Aug 2');
  });

  it('persists locale to localStorage and updates document.lang + title', () => {
    render(
      <LanguageProvider>
        <Probe />
      </LanguageProvider>
    );
    fireEvent.click(screen.getByText('to-mr'));
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe('mr');
    expect(document.documentElement.lang).toBe('mr');
  });
});

describe('i18n fallback', () => {
  it('returns the English dictionary when no provider is present', () => {
    let captured: ReturnType<typeof useI18n> | undefined;
    function Reader() {
      captured = useI18n();
      return null;
    }
    render(<Reader />);
    expect(captured?.locale).toBe('en');
    expect(captured?.t('nav.services')).toBe('Services');
  });

  it('gracefully returns an empty string for unknown keys', () => {
    let out = 'unset';
    function Reader() {
      const { t } = useI18n();
      out = t('nonexistent.key');
      return null;
    }
    render(
      <LanguageProvider>
        <Reader />
      </LanguageProvider>
    );
    expect(out).toBe('');
  });
});

describe('translation dictionaries', () => {
  it('defines the same set of keys in every locale', () => {
    const keys = (dict: Record<string, string>) => new Set(Object.keys(dict));
    expect(keys(hi)).toEqual(keys(en));
    expect(keys(mr)).toEqual(keys(en));
  });

  it('exposes LANG_NAMES and LOCALES consistently', () => {
    expect(LOCALES).toEqual(['en', 'mr', 'hi']);
    for (const code of LOCALES) {
      expect(LANG_NAMES[code].length).toBeGreaterThan(0);
    }
  });

  it('has all expected top-level namespaces present in every locale', () => {
    for (const code of LOCALES) {
      const dict = dictionaries[code];
      expect(dict['nav.process']).toBeTruthy();
      expect(dict['booking.title']).toBeTruthy();
      expect(dict['wa.estimatedTotal']).toBeTruthy();
      expect(dict['item.tshirt-wash']).toBeTruthy();
    }
  });
});

'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { dictionaries, DOC_TITLES, type Locale } from './translations';

import { BUSINESS } from './business';

const STORAGE_KEY = 'kdc:lang';

type TranslateFn = (key: string, vars?: Record<string, string | number>) => string;

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: TranslateFn;
}

const I18nContext = createContext<I18nContextValue | null>(null);

const interpolate = (
  template: string | undefined,
  vars?: Record<string, string | number>
) => {
  let out = template ?? '';
  const values = { businessName: BUSINESS.name, businessShortName: BUSINESS.shortName, ...vars };
  for (const [key, value] of Object.entries(values)) {
    out = out.split(`{${key}}`).join(String(value));
  }
  return out;
};

const englishT: TranslateFn = (key, vars) =>
  interpolate(dictionaries.en[key], vars);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === 'mr' || stored === 'hi' || stored === 'en') setLocaleState(stored);
    } catch { /* Keep language switching usable when storage is disabled. */ }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) {
      try { window.localStorage.setItem(STORAGE_KEY, locale); } catch { /* Storage is optional. */ }
    }
    document.documentElement.lang = locale;
    document.title = DOC_TITLES[locale];
  }, [locale, ready]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
  }, []);

  const t = useCallback<TranslateFn>(
    (key, vars) => interpolate(dictionaries[locale][key] ?? dictionaries.en[key], vars),
    [locale]
  );

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    // Safe fallback (e.g. component rendered outside the provider in tests)
    return { locale: 'en', setLocale: () => {}, t: englishT };
  }
  return ctx;
}

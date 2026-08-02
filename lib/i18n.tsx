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
  if (vars) {
    for (const [key, value] of Object.entries(vars)) {
      out = out.split(`{${key}}`).join(String(value));
    }
  }
  return out;
};

const englishT: TranslateFn = (key, vars) =>
  interpolate(dictionaries.en[key], vars);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'mr' || stored === 'hi' || stored === 'en') {
      setLocaleState(stored);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, locale);
    document.documentElement.lang = locale;
    document.title = DOC_TITLES[locale];
  }, [locale]);

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

'use client';

import { useEffect } from 'react';
import { useI18n } from '@/lib/i18n';

interface ErrorProps {
  error: Error;
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  const { t } = useI18n();
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="error-screen" style={{ padding: '3rem', textAlign: 'center' }}>
      <h1 style={{ marginBottom: '1rem' }}>{t('error.title')}</h1>
      <p style={{ marginBottom: '1.5rem', color: 'var(--text-muted)' }}>
        {t('error.body')}
      </p>
      <p style={{ marginBottom: '2rem', color: 'var(--text-muted)' }}><em>{error?.message}</em></p>
      <button
        type="button"
        onClick={() => reset()}
        style={{
          border: 'none',
          borderRadius: '999px',
          padding: '0.85rem 1.5rem',
          background: 'var(--accent-steel)',
          color: 'white',
          cursor: 'pointer',
        }}
      >
        {t('error.reload')}
      </button>
    </main>
  );
}

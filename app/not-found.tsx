'use client';

import Link from 'next/link';
import { useI18n } from '@/lib/i18n';

export default function NotFound() {
  const { t } = useI18n();
  return (
    <main className="not-found-screen" style={{ padding: '3rem', textAlign: 'center' }}>
      <h1 style={{ marginBottom: '1rem' }}>{t('notfound.title')}</h1>
      <p style={{ marginBottom: '1.5rem', color: 'var(--text-muted)' }}>
        {t('notfound.body')}
      </p>
      <Link href="/" style={{
        display: 'inline-flex',
        borderRadius: '999px',
        padding: '0.85rem 1.5rem',
        background: 'var(--accent-steel)',
        color: 'white',
        textDecoration: 'none',
      }}>
        {t('notfound.home')}
      </Link>
    </main>
  );
}

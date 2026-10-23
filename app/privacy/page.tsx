'use client';

import Link from 'next/link';
import { BUSINESS } from '@/lib/business';
import { useI18n } from '@/lib/i18n';

export default function PrivacyPage() {
  const { t } = useI18n();
  return <main className="privacy-page">
    <Link href="/">← {t('privacy.back')}</Link>
    <p className="eyebrow">{BUSINESS.name} · Wadi</p>
    <h1>{t('privacy.title')}</h1>
    <p>{t('privacy.intro')}</p>
    {['storage', 'whatsapp', 'providers', 'control'].map(section => <section key={section}>
      <h2>{t(`privacy.${section}Title`)}</h2><p>{t(`privacy.${section}`)}</p>
    </section>)}
    <p><a href="https://www.whatsapp.com/legal/privacy-policy" target="_blank" rel="noreferrer">WhatsApp privacy</a> · <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer">Google privacy</a></p>
  </main>;
}

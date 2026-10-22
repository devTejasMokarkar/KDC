'use client';

import { BOOKING_POLICY } from '@/lib/booking-policy';
import { useI18n } from '@/lib/i18n';

export default function ServiceInformation({ category, compact = false }: { category?: string; compact?: boolean }) {
  const { t } = useI18n();
  const hours = category ? BOOKING_POLICY.turnaroundHours[category] : undefined;
  return (
    <div className={`service-information${compact ? ' service-information--compact' : ''}`}>
      <dl>
        <div><dt>{t('flow.priceBasis')}</dt><dd>{t('flow.perListedItem')}</dd></div>
        <div><dt>{t('flow.turnaround')}</dt><dd>{hours ? t('flow.hours', { n: hours }) : t('flow.shopConfirms')}</dd></div>
        <div><dt>{t('flow.minimumOrder')}</dt><dd>{BOOKING_POLICY.minimumOrder === null ? t('flow.shopConfirms') : `₹${BOOKING_POLICY.minimumOrder}`}</dd></div>
      </dl>
      {!compact && <p>{t('flow.extraChargesNote')}</p>}
    </div>
  );
}

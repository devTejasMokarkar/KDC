'use client';

import { useEffect, useState } from 'react';
import { MAX_QUANTITY } from '@/lib/booking-policy';
import { useI18n } from '@/lib/i18n';

export default function QuantityControl({ value, name, onChange, summary = false }: {
  value: number; name: string; onChange: (value: number) => void; summary?: boolean;
}) {
  const { t } = useI18n();
  const [draft, setDraft] = useState(String(value));
  useEffect(() => setDraft(String(value)), [value]);
  return (
    <div className={`quantity-controls${summary ? ' quantity-controls--summary' : ''}`}>
      <button type="button" disabled={value === 0} aria-label={t(summary ? 'flow.decrease' : 'booking.ariaRemoveOne', { name })} onClick={() => onChange(Math.max(0, value - 1))}>−</button>
      <input
        type="text" inputMode="numeric" pattern="[0-9]*" role="spinbutton"
        aria-label={t(summary ? 'flow.summaryQuantity' : 'flow.quantity', { name })}
        aria-valuemin={0} aria-valuemax={MAX_QUANTITY} aria-valuenow={value}
        value={draft} maxLength={3}
        onChange={event => {
          const raw = event.target.value;
          if (!/^\d{0,3}$/.test(raw)) return;
          setDraft(raw === '' ? '' : String(Math.min(MAX_QUANTITY, Number(raw))));
          if (raw !== '') onChange(Math.min(MAX_QUANTITY, Number(raw)));
        }}
        onBlur={() => setDraft(String(value))}
        onKeyDown={event => {
          if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
            event.preventDefault();
            onChange(Math.min(MAX_QUANTITY, Math.max(0, value + (event.key === 'ArrowUp' ? 1 : -1))));
          }
        }}
      />
      <button type="button" disabled={value === MAX_QUANTITY} aria-label={t(summary ? 'flow.increase' : 'booking.ariaAddOne', { name })} onClick={() => onChange(Math.min(MAX_QUANTITY, value + 1))}>+</button>
    </div>
  );
}

'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  SERVICE_CATEGORIES,
  SERVICE_ITEMS,
  TIME_SLOTS,
  subsFor,
  toLocalDateString,
  formatDateString,
} from '@/lib/service-data';
import { useI18n } from '@/lib/i18n';

export default function BookingClient({
  initialCategory,
  className = ''
}: {
  initialCategory?: string;
  className?: string;
}) {
  const { t, locale } = useI18n();
  const [activeMain, setActiveMain] = useState<string>(
    initialCategory && (SERVICE_CATEGORIES as readonly string[]).includes(initialCategory)
      ? initialCategory
      : 'wash'
  );
  const [activeSub, setActiveSub] = useState<string | null>(() => subsFor(activeMain)[0]?.id ?? null);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [pickupAddress, setPickupAddress] = useState('');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [instructions, setInstructions] = useState('');
  const [billNo, setBillNo] = useState('');

  useEffect(() => {
    if (initialCategory && (SERVICE_CATEGORIES as readonly string[]).includes(initialCategory)) {
      setActiveMain(initialCategory);
    }
  }, [initialCategory]);

  useEffect(() => {
    setActiveSub(subsFor(activeMain)[0]?.id ?? null);
  }, [activeMain]);

  useEffect(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const seq = String(Math.floor(Math.random() * 900) + 100);
    setBillNo(`RDC-${y}${m}${day}-${seq}`);
  }, []);

  const availableSubs = useMemo(() => subsFor(activeMain), [activeMain]);

  const activeItems = useMemo(
    () =>
      SERVICE_ITEMS.filter(
        (item) => item.main === activeMain && item.sub === activeSub
      ),
    [activeMain, activeSub]
  );

  const orderItems = useMemo(
    () =>
      SERVICE_ITEMS.filter((item) => (quantities[item.id] ?? 0) > 0).map((item) => ({
        ...item,
        quantity: quantities[item.id] ?? 0,
        total: (quantities[item.id] ?? 0) * item.price,
      })),
    [quantities]
  );

  const estimatedTotal = useMemo(
    () => orderItems.reduce((sum, item) => sum + item.total, 0),
    [orderItems]
  );

  const orderCount = useMemo(
    () => orderItems.reduce((sum, item) => sum + item.quantity, 0),
    [orderItems]
  );

  const itemName = (id: string) => t(`item.${id}`);

  const updateQuantity = (itemId: string, change: number) => {
    setQuantities((current) => {
      const next = Math.max(0, (current[itemId] ?? 0) + change);
      return next > 0
        ? { ...current, [itemId]: next }
        : Object.fromEntries(
          Object.entries(current).filter(([key]) => key !== itemId)
        );
    });
  };

  const removeItem = (itemId: string) => {
    setQuantities((current) =>
      Object.fromEntries(Object.entries(current).filter(([key]) => key !== itemId))
    );
  };

  const handleMainChange = (id: string) => {
    setActiveMain(id);
  };

  const canSubmit = orderItems.length > 0 && selectedDate !== null && selectedTime !== null;

  const bookingMessage = useMemo(() => {
    const lines = [
      t('wa.welcome'),
      '',
      t('wa.bookingRequest'),
      t('wa.collection'),
      selectedDate ? t('wa.date', { value: formatDateString(selectedDate, locale) }) : t('wa.dateEmpty'),
      selectedTime ? t('wa.time', { value: selectedTime }) : t('wa.timeEmpty'),
      pickupAddress.trim() ? t('wa.pickup', { value: pickupAddress.trim() }) : '',
      instructions.trim() ? t('wa.notes', { value: instructions.trim() }) : '',
      '',
      t('wa.orderSummary'),
      ...orderItems.map((item) => `${item.quantity} x ${t(`item.${item.id}`)} — ₹${item.total}`),
      '',
      t('wa.estimatedTotal', { value: estimatedTotal }),
      '',
      t('wa.thankYou'),
    ];
    return lines.filter(Boolean).join('\n');
  }, [t, locale, selectedDate, selectedTime, pickupAddress, instructions, orderItems, estimatedTotal]);

  const bookingHref = useMemo(
    () => `https://wa.me/919876543210?text=${encodeURIComponent(bookingMessage)}`,
    [bookingMessage]
  );

  const handleSubmit = () => {
    if (!canSubmit) return;
    window.open(bookingHref, '_blank', 'noopener,noreferrer');
  };

  const handleTabKeyDown = (event: React.KeyboardEvent, index: number) => {
    const count = SERVICE_CATEGORIES.length;
    let next: number | null = null;
    if (event.key === 'ArrowRight') next = (index + 1) % count;
    else if (event.key === 'ArrowLeft') next = (index - 1 + count) % count;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = count - 1;
    if (next !== null) {
      event.preventDefault();
      handleMainChange(SERVICE_CATEGORIES[next]);
      document
        .querySelector<HTMLButtonElement>(`.svc-tab[data-index="${next}"]`)
        ?.focus();
    }
  };

  const handleSubTabKeyDown = (event: React.KeyboardEvent, index: number) => {
    const count = availableSubs.length;
    if (count === 0) return;
    let next: number | null = null;
    if (event.key === 'ArrowRight') next = (index + 1) % count;
    else if (event.key === 'ArrowLeft') next = (index - 1 + count) % count;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = count - 1;
    if (next !== null) {
      event.preventDefault();
      setActiveSub(availableSubs[next].id);
      document
        .querySelector<HTMLButtonElement>(`.svc-subtab[data-index="${next}"]`)
        ?.focus();
    }
  };

  return (
    <section id="book" className={`unified-booking-section ${className}`} aria-labelledby="booking-headline">
      <div className="unified-booking-inner">
            <div className="booking-header">
              <span className="pillars-label" id="booking-headline">{t('booking.label')}</span>
              <h2>{t('booking.title')}</h2>
              <p className="booking-sub">
                {t('booking.sub')}
              </p>
            </div>

            <div className="unified-booking-main">
              <div id="pricing" className="booking-step">
                <h3 className="step-title">{t('booking.step1')}</h3>
                <div className="svc-tabs" role="tablist" aria-label={t('booking.label')}>
                  {SERVICE_CATEGORIES.map((cat, index) => (
                    <button
                      key={cat}
                      type="button"
                      role="tab"
                      aria-selected={activeMain === cat}
                      aria-controls="pricing-panel"
                      data-index={index}
                      onKeyDown={(event) => handleTabKeyDown(event, index)}
                      className={`svc-tab${activeMain === cat ? ' active' : ''}`}
                      onClick={() => handleMainChange(cat)}
                    >
                      {t(`svc.${cat}.label`)}
                    </button>
                  ))}
                </div>

                <div className="svc-subtabs" role="tablist" aria-label={t('booking.label')}>
                  {availableSubs.map((sub, index) => (
                    <button
                      key={sub.id}
                      type="button"
                      role="tab"
                      aria-selected={activeSub === sub.id}
                      data-index={index}
                      onKeyDown={(event) => handleSubTabKeyDown(event, index)}
                      className={`svc-subtab${activeSub === sub.id ? ' active' : ''}`}
                      onClick={() => setActiveSub(sub.id)}
                    >
                      {t(`sub.${sub.id}`)}
                    </button>
                  ))}
                </div>

                <div className="pricing-list" role="tabpanel" id="pricing-panel">
                  {activeItems.map((item) => (
                    <div key={item.id} className="pricing-item">
                      <div>
                        <p className="pricing-item__label">{itemName(item.id)}</p>
                        <p className="pricing-item__price">₹{item.price}</p>
                      </div>
                      <div className="quantity-controls">
                        <button type="button" onClick={() => updateQuantity(item.id, -1)} aria-label={t('booking.ariaRemoveOne', { name: itemName(item.id) })}>−</button>
                        <span>{quantities[item.id] ?? 0}</span>
                        <button type="button" onClick={() => updateQuantity(item.id, 1)} aria-label={t('booking.ariaAddOne', { name: itemName(item.id) })}>+</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="booking-step booking-form">
                <h3 className="step-title">{t('booking.step2')}</h3>

                <div className="booking-row date-row">
                  <span className="label" id="date-label">{t('booking.date')}</span>
                  <div className="date-grid" role="group" aria-labelledby="date-label">
                    {Array.from({ length: 7 }).map((_, i) => {
                      const d = new Date();
                      d.setDate(d.getDate() + i);
                      const isToday = i === 0;
                      const day = d.toLocaleDateString(locale, { weekday: 'short' });
                      const num = d.getDate();
                      const value = toLocalDateString(d);
                      const active = selectedDate === value;
                      return (
                        <button key={value} type="button" className={`date-pill${active ? ' active' : ''}`} aria-pressed={active} onClick={() => setSelectedDate(value)}>
                          <span className="date-day">{isToday ? t('booking.today') : day}</span>
                          <span className="date-num">{num}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="booking-row">
                  <span className="label" id="time-label">{t('booking.time')}</span>
                  <div className="time-grid" role="group" aria-labelledby="time-label">
                    {TIME_SLOTS.map((tSlot) => {
                      const active = selectedTime === tSlot;
                      return (
                        <button key={tSlot} type="button" className={`time-pill${active ? ' active' : ''}`} aria-pressed={active} onClick={() => setSelectedTime(tSlot)}>{tSlot}</button>
                      );
                    })}
                  </div>
                </div>

                <div className="booking-row">
                  <label className="label" htmlFor="booking-address">{t('booking.addressLabel')}</label>
                  <input id="booking-address" value={pickupAddress} onChange={(e) => setPickupAddress(e.target.value)} placeholder={t('booking.addressPlaceholder')} />
                </div>

                  <div className="booking-row">
                  <label className="label" htmlFor="booking-instructions">{t('booking.instructionsLabel')}</label>
                  <textarea id="booking-instructions" value={instructions} onChange={(e) => setInstructions(e.target.value)} placeholder={t('booking.instructionsPlaceholder')} />
                </div>
              </div>
            </div>

            <aside className="unified-booking-sidebar">
              <div className="dropin-card" role="note" aria-labelledby="dropin-label">
                <span className="dropin-card__label" id="dropin-label">{t('booking.dropInLabel')}</span>
                <p className="dropin-card__hours">{t('booking.dropInHours')}</p>
                <p className="dropin-card__hint">{t('booking.dropInHint')}</p>
              </div>

              <div className="summary-card">
                <div className="summary-heading">
                  <div className="summary-title-row">
                    <p className="summary-title">{t('booking.yourOrder')}</p>
                    <span className="summary-badge">{t('booking.items', { n: orderCount })}</span>
                  </div>
                  <span className="summary-subtitle">Rakesh Dry Cleaners</span>
                </div>

                <div className="bill-dash" aria-hidden="true" />

                <div className="bill-items">
                  <div className="bill-items__head">
                    <span>{t('booking.particulars')}</span>
                    <span>{t('booking.qty')}</span>
                    <span>{t('booking.amount')}</span>
                  </div>
                  {orderItems.length > 0 ? (
                    <ul className="summary-items" role="list">
                      {orderItems.map((item) => (
                        <li key={item.id} className="bill-item">
                          <span className="bill-item__name">
                            <button type="button" className="summary-remove" onClick={() => removeItem(item.id)} aria-label={t('booking.ariaRemoveOrder', { name: itemName(item.id) })}>
                              ×
                            </button>
                            <span className="bill-item__label">{itemName(item.id)}</span>
                          </span>
                          <span className="bill-item__qty">{item.quantity}</span>
                          <strong className="bill-item__amount">₹{item.total}</strong>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="summary-empty">{t('booking.empty')}</p>
                  )}
                </div>

                <div className="bill-dash" aria-hidden="true" />

                <div className="bill-totals">
                  <div className="bill-total-row">
                    <span>{t('booking.subtotal')}</span>
                    <strong>₹{estimatedTotal}</strong>
                  </div>
                  <div className="bill-total-row bill-total-row--grand summary-total">
                    <span>{t('booking.totalAmount')}</span>
                    <strong>₹{estimatedTotal}</strong>
                  </div>
                </div>

                <div className="bill-dash" aria-hidden="true" />

                <div className="summary-details">
                  <div className="summary-details__row">
                    <span>{t('booking.collection')}</span>
                    <strong>{t('booking.home')}</strong>
                  </div>
                  <div className="summary-details__row">
                    <span>{t('booking.dateTime')}</span>
                    <strong>
                      {selectedDate ? formatDateString(selectedDate, locale) : '—'}
                      {selectedTime ? `, ${selectedTime}` : ''}
                    </strong>
                  </div>
                  <div className="summary-details__row">
                    <span>{t('booking.billNo')}</span>
                    <strong>{billNo || '—'}</strong>
                  </div>
                  <div className="summary-details__row">
                    <span>{t('booking.phone')}</span>
                    <strong>+91 98765 43210</strong>
                  </div>
                </div>

                <div className="bill-footer" aria-hidden="true">
                  <span className="bill-footer__dash">— — —</span>
                  <p>{t('booking.thankYou')}</p>
                </div>

                <div className="summary-actions">
                  <button type="button" className="btn-primary full-width" disabled={!canSubmit} onClick={handleSubmit}>
                    {t('booking.confirm')}
                  </button>
                  <p className="form-hint" role="status" aria-live="polite">
                    {t('booking.hint')}
                  </p>
                </div>
              </div>
              </aside>
          </div>
        </section>
  );
}

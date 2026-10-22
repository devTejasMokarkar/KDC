'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { SERVICE_CATEGORIES, SERVICE_ITEMS, TIME_SLOTS, subsFor, toLocalDateString, formatDateString, isSlotUnavailable } from '@/lib/service-data';
import { BOOKING_POLICY, checkPickupArea, MAX_QUANTITY, priceUnitFor, type PickupAreaResult } from '@/lib/booking-policy';
import { useI18n } from '@/lib/i18n';
import { en } from '@/lib/translations';
import { scrollToSection } from '@/lib/navigation';
import { useDialog } from '@/lib/use-dialog';
import QuantityControl from '@/components/QuantityControl';
import ServiceInformation from '@/components/ServiceInformation';
import { BUSINESS } from '@/lib/business';

type Step = 0 | 1 | 2;
type Quantities = Record<string, number>;
type CheckedArea = { pin: string; locality: string; result: PickupAreaResult };

export default function BookingClient({ initialCategory, initialSubcategory, selectionRequest, className = '' }: {
  initialCategory?: string; initialSubcategory?: string; selectionRequest?: number; className?: string;
}) {
  const { t, locale } = useI18n();
  const [step, setStep] = useState<Step>(0);
  const [activeMain, setActiveMain] = useState<string>(initialCategory && (SERVICE_CATEGORIES as readonly string[]).includes(initialCategory) ? initialCategory : 'wash');
  const [activeSub, setActiveSub] = useState<string | null>(() => subsFor(activeMain)[0]?.id ?? null);
  const [search, setSearch] = useState('');
  const [quantities, setQuantities] = useState<Quantities>({});
  const [cartReady, setCartReady] = useState(false);
  const [undo, setUndo] = useState<{ quantities: Quantities; message: string } | null>(null);
  const [clearOpen, setClearOpen] = useState(false);
  const undoRef = useRef<HTMLButtonElement>(null);
  const actionStep = useRef<Step>(0);
  const clearRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const previousStep = useRef(step);
  const [method, setMethod] = useState<'pickup' | 'dropoff'>('pickup');
  const [pin, setPin] = useState('');
  const [locality, setLocality] = useState('');
  const [area, setArea] = useState<CheckedArea | null>(null);
  const [pickupAddress, setPickupAddress] = useState('');
  const [instructions, setInstructions] = useState('');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [attemptedDetails, setAttemptedDetails] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const [reference, setReference] = useState('');
  useDialog(clearOpen, clearRef, () => setClearOpen(false));

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30000);
    const showItems = () => { previousStep.current = 0; setStep(0); };
    window.addEventListener('kdc:booking-items', showItems);
    try {
      const saved = JSON.parse(window.localStorage.getItem('kdc:cart:v1') ?? '{}');
      if (saved && typeof saved === 'object' && !Array.isArray(saved)) {
        setQuantities(Object.fromEntries(SERVICE_ITEMS.flatMap(item => Number.isInteger(saved[item.id]) && saved[item.id] > 0 ? [[item.id, Math.min(saved[item.id], MAX_QUANTITY)]] : [])));
      }
    } catch { /* Browser storage is optional. */ }
    setCartReady(true);
    setReference(`RDC-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`);
    return () => { window.clearInterval(timer); window.removeEventListener('kdc:booking-items', showItems); };
  }, []);

  useEffect(() => {
    if (!cartReady) return;
    try { window.localStorage.setItem('kdc:cart:v1', JSON.stringify(quantities)); } catch { /* Booking works without storage. */ }
  }, [quantities, cartReady]);

  useEffect(() => {
    if (initialCategory && (SERVICE_CATEGORIES as readonly string[]).includes(initialCategory)) {
      setActiveMain(initialCategory); setSearch(''); setStep(0);
    }
  }, [initialCategory, selectionRequest]);
  useEffect(() => {
    const subs = subsFor(activeMain);
    const requested = activeMain === initialCategory && subs.some(sub => sub.id === initialSubcategory) ? initialSubcategory : undefined;
    setActiveSub(requested ?? subs[0]?.id ?? null);
  }, [activeMain, initialCategory, initialSubcategory, selectionRequest]);
  useEffect(() => {
    if (selectedDate && selectedTime && isSlotUnavailable(selectedDate, selectedTime, now)) setSelectedTime(null);
  }, [selectedDate, selectedTime, now]);
  useEffect(() => {
    if (previousStep.current === step) return;
    previousStep.current = step;
    const frame = requestAnimationFrame(() => {
      scrollToSection('#book');
      headingRef.current?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [step]);

  const availableSubs = useMemo(() => subsFor(activeMain), [activeMain]);
  const activeItems = useMemo(() => SERVICE_ITEMS.filter(item => item.main === activeMain && (search.trim() ? `${t(`item.${item.id}`)} ${en[`item.${item.id}`]}`.toLocaleLowerCase(locale).includes(search.trim().toLocaleLowerCase(locale)) : item.sub === activeSub)), [activeMain, activeSub, search, locale, t]);
  const orderItems = useMemo(() => SERVICE_ITEMS.filter(item => (quantities[item.id] ?? 0) > 0).map(item => ({ ...item, quantity: quantities[item.id], total: quantities[item.id] * item.price })), [quantities]);
  const subtotal = orderItems.reduce((sum, item) => sum + item.total, 0);
  const count = orderItems.reduce((sum, item) => sum + item.quantity, 0);
  const itemsValid = count > 0 && (BOOKING_POLICY.minimumOrder === null || subtotal >= BOOKING_POLICY.minimumOrder);
  const areaValid = method === 'dropoff' || (!!area && area.result === 'eligible' && area.pin === pin && area.locality === locality && checkPickupArea(pin, locality) === 'eligible');
  const addressValid = method === 'dropoff' || pickupAddress.trim().length >= 5;
  const validTime = !!selectedDate && !!selectedTime && !isSlotUnavailable(selectedDate, selectedTime, now);
  const detailsValid = areaValid && addressValid && validTime;
  const fee = method === 'dropoff' ? 0 : BOOKING_POLICY.pickupFee;
  const estimate = count ? subtotal + (fee ?? 0) : 0;
  const feeLabel = method === 'dropoff' ? t('flow.notApplicable') : fee === null ? t('flow.shopConfirms') : `₹${fee}`;
  const itemName = (id: string) => t(`item.${id}`);
  const stepKeys = ['flow.items', 'flow.pickupDetails', 'flow.review'] as const;

  useEffect(() => { if (!itemsValid && step !== 0) setStep(0); }, [itemsValid, step]);

  useEffect(() => { if (undo && actionStep.current === step) undoRef.current?.focus({ preventScroll: true }); }, [undo, step]);

  const setQuantity = (id: string, value: number) => {
    const next = Math.min(MAX_QUANTITY, Math.max(0, Math.trunc(value)));
    if (!Number.isFinite(next)) return;
    const current = quantities[id] ?? 0;
    if (current === next) return;
    actionStep.current = step;
    if (next === 0 && current > 0) setUndo({ quantities: { ...quantities }, message: t('flow.removed', { name: itemName(id) }) });
    else setUndo(null);
    setQuantities(currentCart => next > 0 ? { ...currentCart, [id]: next } : Object.fromEntries(Object.entries(currentCart).filter(([key]) => key !== id)));
  };
  const clearCart = () => {
    actionStep.current = step;
    setUndo({ quantities: { ...quantities }, message: t('flow.cleared') });
    setQuantities({}); setClearOpen(false); setStep(0);
  };
  const undoChange = () => {
    if (!undo) return;
    setQuantities(undo.quantities); setUndo(null);
    requestAnimationFrame(() => document.getElementById('order-heading')?.focus({ preventScroll: true }));
  };
  const checkArea = () => {
    const result = checkPickupArea(pin, locality);
    setArea({ pin, locality, result });
    if (result === 'invalid') document.getElementById(!/^[1-9]\d{5}$/.test(pin) ? 'pickup-pin' : 'pickup-locality')?.focus();
  };
  const goToReview = () => {
    setAttemptedDetails(true);
    if (!itemsValid) { setStep(0); return; }
    if (!detailsValid) {
      const id = !areaValid ? (!locality || area?.result === 'outside' ? 'pickup-locality' : 'pickup-pin') : !addressValid ? 'booking-address' : !selectedDate ? 'first-booking-date' : 'first-booking-time';
      document.getElementById(id)?.focus();
      return;
    }
    setStep(2);
  };
  const changeCategory = (id: string) => { setActiveMain(id); setSearch(''); };
  const tabKey = (event: React.KeyboardEvent, index: number, sub = false) => {
    const choices = sub ? availableSubs.map(item => item.id) : [...SERVICE_CATEGORIES];
    const next = event.key === 'ArrowRight' ? (index + 1) % choices.length : event.key === 'ArrowLeft' ? (index + choices.length - 1) % choices.length : event.key === 'Home' ? 0 : event.key === 'End' ? choices.length - 1 : null;
    if (next === null) return;
    event.preventDefault();
    if (sub) setActiveSub(choices[next]); else changeCategory(choices[next]);
    const tab = document.getElementById(`${sub ? 'subcategory' : 'service'}-tab-${choices[next]}`);
    tab?.focus({ preventScroll: true });
    tab?.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  };
  const message = [
    t('wa.welcome'), t('wa.bookingRequest'), `${t('flow.reference')}: ${reference}`,
    `${t('booking.collection')}: ${t(method === 'pickup' ? 'booking.pickup' : 'booking.dropoff')}`,
    method === 'pickup' ? `${t('flow.locality')}: Wadi, Nagpur · ${pin}` : '',
    method === 'pickup' ? t('wa.pickup', { value: pickupAddress.trim() }) : '',
    selectedDate ? t('wa.date', { value: formatDateString(selectedDate, locale) }) : '',
    selectedTime ? t('wa.time', { value: selectedTime }) : '',
    instructions.trim() ? t('wa.notes', { value: instructions.trim() }) : '',
    '', t('wa.orderSummary'), ...orderItems.map(item => `${item.quantity} x ${itemName(item.id)} — ₹${item.total}`),
    '', `${t('flow.itemsSubtotal')}: ₹${subtotal}`, `${t('flow.pickupCharge')}: ${feeLabel}`,
    t('wa.estimatedTotal', { value: estimate }), fee === null ? t('flow.unknownChargeNote') : '',
    t('flow.extraChargesNote'), t('wa.thankYou'),
  ].filter(Boolean).join('\n');
  const handleSubmit = () => {
    if (!BUSINESS.whatsappNumber || step !== 2 || !itemsValid || !detailsValid || !selectedDate || !selectedTime) return;
    const current = new Date();
    if (isSlotUnavailable(selectedDate, selectedTime, current)) { setNow(current); setStep(1); setAttemptedDetails(true); return; }
    window.open(`https://wa.me/${BUSINESS.whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <section id="book" className={`unified-booking-section guided-booking ${className}`} aria-labelledby="booking-headline" data-step={step}>
      <div className="unified-booking-inner">
        <div className="booking-header"><span className="pillars-label">{t('booking.label')}</span><h2 id="booking-headline" tabIndex={-1}>{t('booking.title')}</h2><p className="booking-sub">{t('flow.intro')}</p></div>
        <div className="guided-toolbar">
          <nav aria-label={t('flow.progress')} className="booking-progress"><ol>{stepKeys.map((key, index) => (
            <li key={key}><button type="button" aria-current={step === index ? 'step' : undefined} disabled={index === 1 ? !itemsValid : index === 2 ? !itemsValid || !detailsValid : false} onClick={() => setStep(index as Step)}><span className="step-number" aria-hidden="true">{index < step ? '✓' : index + 1}</span><span>{t(key)}</span></button></li>
          ))}</ol></nav>
          <div className="booking-mini-cart"><div><span>{t(fee === null ? 'flow.itemsSubtotal' : 'booking.cartTotal')}</span><strong aria-live="polite" aria-atomic="true">₹{estimate}</strong></div><a href="#order-review">{t('flow.viewCart')} ↓</a></div>
        </div>
        <div className="unified-booking-main">
          <div className="guided-stage" key={step}>
            <div id="pricing" className="booking-step" hidden={step !== 0}>
              <p className="flow-step-caption">{t('flow.stepOf', { n: 1 })}</p>
              <h3 className="step-title" ref={step === 0 ? headingRef : undefined} tabIndex={-1}>{t('booking.step1')}</h3>
              <div className="booking-search"><label htmlFor="item-search">{t('booking.search')}</label><input id="item-search" type="search" value={search} placeholder={t('booking.searchPlaceholder')} onChange={event => setSearch(event.target.value)} /></div>
              <div className="svc-tabs" role="tablist" aria-label={t('booking.label')}>{SERVICE_CATEGORIES.map((category, index) => <button key={category} id={`service-tab-${category}`} type="button" role="tab" tabIndex={activeMain === category ? 0 : -1} aria-selected={activeMain === category} aria-controls="pricing-panel" className={`svc-tab${activeMain === category ? ' active' : ''}`} onClick={() => changeCategory(category)} onKeyDown={event => tabKey(event, index)}>{t(`svc.${category}.label`)}</button>)}</div>
              <div className="svc-subtabs" hidden={!!search.trim()} role="tablist" aria-label={t('flow.itemTypes')}>{availableSubs.map((sub, index) => <button key={sub.id} id={`subcategory-tab-${sub.id}`} type="button" role="tab" tabIndex={activeSub === sub.id ? 0 : -1} aria-selected={activeSub === sub.id} aria-controls="pricing-panel" className={`svc-subtab${activeSub === sub.id ? ' active' : ''}`} onClick={() => setActiveSub(sub.id)} onKeyDown={event => tabKey(event, index, true)}>{t(`sub.${sub.id}`)}</button>)}</div>
              <div className="pricing-list" id="pricing-panel" role="tabpanel" aria-labelledby={search.trim() ? `service-tab-${activeMain}` : `subcategory-tab-${activeSub}`}>
                {!activeItems.length && <p className="search-empty" role="status">{t('booking.noResults')}</p>}
                {activeItems.map(item => <div className="pricing-item" key={item.id}><div><p className="pricing-item__label">{itemName(item.id)}</p><p className="pricing-item__price">₹{item.price} <span>{t(`flow.unit.${priceUnitFor(item.id)}`)}</span></p></div><QuantityControl value={quantities[item.id] ?? 0} name={itemName(item.id)} onChange={value => setQuantity(item.id, value)} /></div>)}
              </div>
              <ServiceInformation category={activeMain} />
              <div className="flow-actions"><button type="button" className="btn-primary" disabled={!itemsValid} onClick={() => setStep(1)}>{t('flow.nextPickup')} <span aria-hidden="true">→</span></button></div>
              {!count && <p className="field-hint">{t('booking.empty')}</p>}
              {count > 0 && !itemsValid && <p className="field-hint">{t('flow.minimumHint', { value: BOOKING_POLICY.minimumOrder ?? 0 })}</p>}
            </div>
            <form id="collection-details" className="booking-step booking-form" hidden={step !== 1} noValidate onSubmit={event => { event.preventDefault(); goToReview(); }}>
              <p className="flow-step-caption">{t('flow.stepOf', { n: 2 })}</p>
              <h3 className="step-title" ref={step === 1 ? headingRef : undefined} tabIndex={-1}>{t('booking.step2')}</h3>
              <fieldset className="collection-method"><legend>{t('booking.method')}</legend><div>{(['pickup', 'dropoff'] as const).map(value => <label key={value} className={method === value ? 'selected' : ''}><input type="radio" name="collection-method" checked={method === value} onChange={() => setMethod(value)} />{t(`booking.${value}`)}</label>)}</div></fieldset>
              {method === 'pickup' && <div className="pickup-area-card">
                <div className="pickup-area-heading"><span aria-hidden="true">⌖</span><div><h4>{t('flow.wadiOnly')}</h4><p>{t('flow.areaIntro')}</p></div></div>
                <div className="area-fields"><div className="booking-row"><label className="label" htmlFor="pickup-locality">{t('flow.locality')}</label><select id="pickup-locality" value={locality} onChange={event => { setLocality(event.target.value); setArea(null); }}><option value="">{t('flow.selectLocality')}</option><option value="wadi">{t('flow.wadi')}</option><option value="outside">{t('flow.outsideWadi')}</option></select></div>
                <div className="booking-row"><label className="label" htmlFor="pickup-pin">{t('flow.pin')}</label><input id="pickup-pin" inputMode="numeric" autoComplete="postal-code" maxLength={6} value={pin} onKeyDown={event => { if (event.key === 'Enter') { event.preventDefault(); checkArea(); } }} onChange={event => { setPin(event.target.value.replace(/\D/g, '').slice(0, 6)); setArea(null); }} aria-invalid={!!area && area.result !== 'eligible'} aria-describedby="pickup-area-result" /></div></div>
                <button type="button" className="btn-secondary check-area-button" onClick={checkArea}>{t('flow.checkArea')}</button>
                <div id="pickup-area-result" className={`area-result${area ? ` area-result--${area.result}` : ''}`} role="status" aria-live="polite">{area ? t(area.result === 'eligible' ? 'flow.areaEligible' : area.result === 'outside' ? 'flow.areaOutside' : 'flow.areaInvalid') : t('flow.areaNote')}{area?.result === 'eligible' && <p>{t('flow.pickupCharge')}: <strong>{feeLabel}</strong></p>}</div>
                {area?.result === 'outside' && <button type="button" className="text-button" onClick={() => setMethod('dropoff')}>{t('flow.useDropoff')} →</button>}
                {attemptedDetails && !areaValid && <p className="field-error">{t('flow.checkFirst')}</p>}
              </div>}
              {method === 'pickup' && <div className="booking-row"><label className="label" htmlFor="booking-address">{t('booking.addressRequired')}</label><textarea id="booking-address" required maxLength={500} autoComplete="street-address" value={pickupAddress} onChange={event => setPickupAddress(event.target.value)} placeholder={t('flow.addressPlaceholder')} aria-invalid={attemptedDetails && !addressValid} />{attemptedDetails && !addressValid && <p className="field-error">{t('flow.addressError')}</p>}</div>}
              {method === 'dropoff' && <div className="dropoff-information"><strong>{t('flow.dropoffTitle')}</strong><p>{BUSINESS.address ?? t('launch.detailsPending')}</p><p>{BUSINESS.openingHours ?? t('launch.detailsPending')}</p></div>}
              <div className="booking-row"><span className="label" id="date-label">{t('booking.date')}</span><div className="date-grid" role="group" aria-labelledby="date-label">{Array.from({ length: 7 }, (_, index) => {
                const date = new Date(now); date.setDate(date.getDate() + index); const value = toLocalDateString(date);
                return <button key={value} id={index === 0 ? 'first-booking-date' : undefined} type="button" className={`date-pill${selectedDate === value ? ' active' : ''}`} aria-pressed={selectedDate === value} onClick={() => { setSelectedDate(value); if (selectedTime && isSlotUnavailable(value, selectedTime, now)) setSelectedTime(null); }}><span className="date-day">{index === 0 ? t('booking.today') : date.toLocaleDateString(locale, { weekday: 'short' })}</span><span className="date-num">{date.getDate()}</span></button>;
              })}</div>{attemptedDetails && !selectedDate && <p className="field-error">{t('flow.dateError')}</p>}</div>
              <div className="booking-row"><span className="label" id="time-label">{t('booking.time')}</span><div className="time-grid" role="group" aria-labelledby="time-label">{TIME_SLOTS.map((slot, index) => <button key={slot} id={index === 0 ? 'first-booking-time' : undefined} type="button" className={`time-pill${selectedTime === slot && validTime ? ' active' : ''}`} disabled={!selectedDate || isSlotUnavailable(selectedDate, slot, now)} aria-pressed={selectedTime === slot && validTime} onClick={() => setSelectedTime(slot)}>{slot}</button>)}</div>{!selectedDate && <p className="field-hint">{t('booking.chooseDate')}</p>}{selectedDate && TIME_SLOTS.every(slot => isSlotUnavailable(selectedDate, slot, now)) && <p className="field-error">{t('booking.noTimes')}</p>}{attemptedDetails && selectedDate && !validTime && <p className="field-error">{t('flow.timeError')}</p>}</div>
              <div className="booking-row"><label className="label" htmlFor="booking-instructions">{t('booking.instructionsLabel')}</label><textarea id="booking-instructions" maxLength={1000} value={instructions} onChange={event => setInstructions(event.target.value)} placeholder={t('booking.instructionsPlaceholder')} /></div>
              <div className="flow-actions"><button type="button" className="btn-secondary" onClick={() => setStep(0)}>← {t('flow.back')}</button><button type="submit" className="btn-primary">{t('flow.nextReview')} →</button></div>
              {attemptedDetails && !detailsValid && <p className="field-error" role="alert">{t('flow.completeDetails')}</p>}
            </form>
            {step === 2 && <div className="booking-step review-details"><p className="flow-step-caption">{t('flow.stepOf', { n: 3 })}</p><h3 className="step-title" tabIndex={-1} ref={headingRef}>{t('flow.reviewTitle')}</h3><p className="review-intro">{t('flow.reviewIntro')}</p>
              <dl className="review-handover"><div><dt>{t('booking.collection')}</dt><dd>{t(method === 'pickup' ? 'booking.pickup' : 'booking.dropoff')}</dd></div>{method === 'pickup' && <><div><dt>{t('flow.locality')}</dt><dd>Wadi, Nagpur · {pin}</dd></div><div><dt>{t('booking.addressRequired')}</dt><dd>{pickupAddress}</dd></div></>}<div><dt>{t('booking.dateTime')}</dt><dd>{selectedDate ? formatDateString(selectedDate, locale) : '—'}{selectedTime ? `, ${selectedTime}` : ''}</dd></div>{instructions.trim() && <div><dt>{t('booking.instructionsLabel')}</dt><dd>{instructions}</dd></div>}</dl>
              <button type="button" className="text-button" onClick={() => setStep(1)}>{t('flow.editDetails')} ↗</button><ServiceInformation /><div className="flow-actions"><button type="button" className="btn-secondary" onClick={() => setStep(1)}>← {t('flow.back')}</button><button type="button" className="text-button" onClick={() => setStep(0)}>{t('flow.editItems')}</button></div>
            </div>}
          </div>
        </div>
        <aside className="unified-booking-sidebar guided-order" id="order-review" aria-labelledby="order-heading">
          <div className="summary-card"><div className="summary-title-row"><h3 className="summary-title" id="order-heading" tabIndex={-1}>{t('booking.yourOrder')}</h3><span className="summary-badge">{t(count === 1 ? 'booking.item' : 'booking.items', { n: count })}</span></div>
            {!!count && <button type="button" className="text-button clear-cart-button" onClick={() => setClearOpen(true)}>{t('flow.clearCart')}</button>}
            {undo && <div className="cart-undo"><p role="status">{undo.message}</p><button ref={undoRef} type="button" onClick={undoChange}>{t('flow.undo')}</button></div>}
            {!count ? <p className="summary-empty">{t('booking.empty')}</p> : <ul className="editable-cart">{orderItems.map(item => <li key={item.id}><div className="editable-cart__heading"><div><span className="cart-service-label">{t(`svc.${item.main}.label`)}</span><p>{itemName(item.id)}</p><span className="cart-unit-price">₹{item.price} {t(`flow.unit.${priceUnitFor(item.id)}`)}</span></div><button type="button" className="cart-remove" aria-label={t('booking.ariaRemoveOrder', { name: itemName(item.id) })} onClick={() => setQuantity(item.id, 0)}>×</button></div><div className="editable-cart__bottom"><QuantityControl value={item.quantity} name={itemName(item.id)} summary onChange={value => setQuantity(item.id, value)} /><strong>₹{item.total}</strong></div></li>)}</ul>}
            <div className="flow-totals"><div><span>{t('flow.itemsSubtotal')}</span><strong>₹{subtotal}</strong></div><div><span>{t('flow.pickupCharge')}</span><strong>{feeLabel}</strong></div><div className="summary-total"><span>{t(fee === null ? 'flow.beforePickup' : 'flow.estimateTotal')}</span><strong>₹{estimate}</strong></div></div>
            {fee === null && <p className="request-note">{t('flow.unknownChargeNote')}</p>}
            {step === 2 && <div className="summary-actions">{!BUSINESS.whatsappNumber && <p className="field-error" role="status">{t('launch.bookingPending')}</p>}<button type="button" className="btn-primary full-width" disabled={!BUSINESS.whatsappNumber || !itemsValid || !detailsValid} onClick={handleSubmit}>{t('booking.confirm')}</button><p className="request-note">{t('booking.requestNote')}</p><p className="request-reference">{t('flow.reference')}: {reference}</p>{!detailsValid && <button type="button" className="text-button" onClick={() => setStep(1)}>{t('flow.editDetails')}</button>}</div>}
            {step < 2 && <p className="request-note">{t('flow.cartHint')}</p>}
          </div>
        </aside>
      </div>
      {clearOpen && <div className="map-modal clear-cart-overlay" role="alertdialog" aria-modal="true" aria-labelledby="clear-cart-title" aria-describedby="clear-cart-description" onClick={event => { if (event.target === event.currentTarget) setClearOpen(false); }}><div className="map-modal__box clear-cart-dialog" ref={clearRef} tabIndex={-1}><h3 id="clear-cart-title">{t('flow.clearTitle')}</h3><p id="clear-cart-description">{t('flow.clearDescription')}</p><div className="flow-actions"><button type="button" className="btn-secondary" onClick={() => setClearOpen(false)}>{t('flow.keepItems')}</button><button type="button" className="btn-primary" onClick={clearCart}>{t('flow.clearConfirm')}</button></div></div></div>}
    </section>
  );
}

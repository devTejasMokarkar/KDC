'use client';

import { useEffect, useRef, useState, type ReactNode, type PointerEvent } from 'react';
import Image from 'next/image';
import ServiceInformation from '@/components/ServiceInformation';
import { useI18n } from '@/lib/i18n';

export interface CardFlipProps {
  category?: string; title?: string; subtitle?: string; description?: string;
  features?: string[]; icon?: ReactNode; imageSrc?: string; imageAlt?: string;
  onBook?: () => void; className?: string;
}

export default function CardFlip({ category, title = '', subtitle, description, features = [], icon, imageSrc, imageAlt, onBook, className = '' }: CardFlipProps) {
  const { t } = useI18n();
  const [pinned, setPinned] = useState(false);
  const [hovered, setHovered] = useState(false);
  const flipped = pinned || hovered;
  const hoverDismissed = useRef(false);
  const focusAfterFlip = useRef(false);
  const hold = useRef<{ timer: ReturnType<typeof setTimeout>; pointerId: number; x: number; y: number } | null>(null);
  const suppressClickUntil = useRef(0);
  const cancelHold = () => {
    if (hold.current) clearTimeout(hold.current.timer);
    hold.current = null;
  };
  const changeDetails = (open: boolean) => {
    cancelHold();
    focusAfterFlip.current = true;
    if (!open) {
      hoverDismissed.current = true;
      setHovered(false);
    }
    setPinned(open);
  };
  const startHold = (event: PointerEvent<HTMLElement>) => {
    cancelHold();
    suppressClickUntil.current = 0;
    if ((event.pointerType !== 'touch' && event.pointerType !== 'pen') || !event.isPrimary ||
      (event.target as HTMLElement).closest('button, a, input, select, textarea, [role="button"]')) return;
    const { pointerId, clientX: x, clientY: y } = event;
    hold.current = {
      pointerId, x, y,
      timer: setTimeout(() => {
        hold.current = null;
        suppressClickUntil.current = performance.now() + 800;
        setPinned(value => !value);
      }, 400),
    };
  };
  useEffect(() => {
    window.addEventListener('scroll', cancelHold, true);
    return () => {
      cancelHold();
      window.removeEventListener('scroll', cancelHold, true);
    };
  }, []);
  const previous = useRef(false);
  const cardRef = useRef<HTMLElement>(null);
  const frontButton = useRef<HTMLButtonElement>(null);
  const backButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (previous.current === flipped) return;
    previous.current = flipped;
    if (!focusAfterFlip.current) return;
    focusAfterFlip.current = false;
    (flipped ? backButton : frontButton).current?.focus({ preventScroll: true });
    const card = cardRef.current;
    if (card) {
      const rect = card.getBoundingClientRect();
      const header = Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 72;
      if (rect.top < header + 12 || rect.bottom > window.innerHeight - 90) card.scrollIntoView({ block: 'start', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    }
  }, [flipped]);

  return (
    <article ref={cardRef} className={`service-card service-card--flippable ${className}`} aria-label={title} onPointerEnter={event => {
        if (event.pointerType === 'mouse' && !hoverDismissed.current && window.matchMedia('(hover: hover) and (pointer: fine)').matches) setHovered(true);
      }}
      onPointerLeave={() => { cancelHold(); hoverDismissed.current = false; setHovered(false); }}
      onPointerDown={startHold}
      onPointerMove={event => {
        const current = hold.current;
        if (current && (event.pointerId !== current.pointerId || Math.hypot(event.clientX - current.x, event.clientY - current.y) > 10)) cancelHold();
      }}
      onPointerUp={cancelHold}
      onPointerCancel={cancelHold}
      onClickCapture={event => {
        if (performance.now() < suppressClickUntil.current) {
          event.preventDefault();
          event.stopPropagation();
          suppressClickUntil.current = 0;
        }
      }}
      onContextMenu={event => { if (hold.current || performance.now() < suppressClickUntil.current) event.preventDefault(); }}
      onKeyDown={event => { if (event.key === 'Escape' && flipped) { event.preventDefault(); changeDetails(false); } }}>
      <div className="service-card__perspective">
        <div className={`service-card__faces${flipped ? ' is-flipped' : ''}`}>
          <div className="service-card__face service-card__face--front" aria-hidden={flipped}>
            <div className="service-card__image">
              {imageSrc && <Image src={imageSrc} alt={imageAlt ?? ''} fill sizes="(max-width: 600px) 100vw, (max-width: 1000px) 50vw, 33vw" />}
              <span className="service-card__icon" aria-hidden="true">{icon}</span>
            </div>
            <div className="service-card__body">
              <div className="service-card__heading"><h3>{title}</h3><span>{subtitle}</span></div>
              <p>{description}</p>
              <button ref={frontButton} type="button" className="service-card__flip" tabIndex={flipped ? -1 : 0} aria-label={t('card.showDetails', { name: title })} aria-expanded={flipped} onClick={() => changeDetails(true)}><span aria-hidden="true">⤾</span>{t('card.includes')}</button>
            </div>
          </div>
          <div className="service-card__face service-card__face--back" aria-hidden={!flipped}>
            <div className="service-card__back-header"><span>{t('card.careDetails')}</span><button ref={backButton} type="button" tabIndex={flipped ? 0 : -1} className="service-card__flip-back" aria-label={t('card.hideDetails', { name: title })} onClick={() => changeDetails(false)}>↶ {t('flow.back')}</button></div>
            <div className="service-card__heading"><h3>{title}</h3><span>{subtitle}</span></div>
            <p className="service-card__back-description">{description}</p>
            <h4 className="service-card__included-title">{t('card.includes')}</h4>
            <ul className="service-card__features">{features.map(feature => <li key={feature}><span aria-hidden="true">✓</span>{feature}</li>)}</ul>
            <ServiceInformation category={category} compact />
          </div>
        </div>
      </div>
      <div className="service-card__persistent-action"><button className="service-card__book" type="button" onClick={onBook} aria-label={`${t('card.bookNow')}: ${title}`}>{t('card.bookNow')}<span aria-hidden="true">↗</span></button></div>
    </article>
  );
}

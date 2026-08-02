'use client';

import { useEffect, useState } from 'react';
import type { ReactNode, MouseEvent, KeyboardEvent } from 'react';
import Image from 'next/image';
import { useI18n } from '@/lib/i18n';

export interface CardFlipProps {
  title?: string;
  subtitle?: string;
  description?: string;
  features?: string[];
  icon?: ReactNode;
  imageSrc?: string;
  imageAlt?: string;
  onBook?: () => void;
  className?: string;
}

export default function CardFlip({
  title = 'Design Systems',
  subtitle = 'Explore the fundamentals',
  description = 'Dive deep into the world of modern UI/UX design.',
  features = ['UI/UX', 'Modern Design', 'Tailwind CSS', 'Kokonut UI'],
  icon,
  imageSrc,
  imageAlt,
  onBook,
  className = '',
}: CardFlipProps) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 900px)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  const toggle = () => setOpen((v) => !v);

  const closeBack = (e: MouseEvent<HTMLElement>) => {
    if ((e.target as HTMLElement).closest('button')) return;
    setOpen(false);
  };

  const onFrontKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggle();
    }
  };

  return (
    <div className={`flip-card ${open ? 'flip-card--open' : ''} ${className}`}>
      <div className="flip-card__inner">
        {/* Front of card */}
        <div
          className="flip-card__face flip-card__front"
          onClick={isMobile ? toggle : undefined}
          role={isMobile ? 'button' : undefined}
          tabIndex={isMobile ? 0 : undefined}
          aria-expanded={isMobile ? open : undefined}
          onKeyDown={isMobile ? onFrontKeyDown : undefined}
        >
          <div className="flip-card__hint-badge" aria-hidden="true">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m17 2 4 4-4 4" />
              <path d="M3 11v-1a4 4 0 0 1 4-4h14" />
              <path d="m7 22-4-4 4-4" />
              <path d="M21 13v1a4 4 0 0 1-4 4H3" />
            </svg>
            <span>{t('card.hint')}</span>
          </div>
          <div className="flip-card__image" aria-hidden={!imageAlt}>
            {imageSrc ? (
              <Image src={imageSrc} alt={imageAlt ?? ''} fill sizes="(max-width: 768px) 100vw, 33vw" />
            ) : (
              <div className="flip-card__blobs">
                {[...Array(10)].map((_, i) => (
                  <span
                    className="flip-card__blob"
                    key={i}
                    style={{ animationDelay: `${i * 0.3}s` }}
                  />
                ))}
              </div>
            )}
          </div>
          <div className="flip-card__front-body">
            <div className="flip-card__front-copy">
              {icon && <div className="flip-card__icon">{icon}</div>}
              <div className="flip-card__front-label">
                <h3 className="flip-card__title">{title}</h3>
                {subtitle && <p className="flip-card__subtitle">{subtitle}</p>}
              </div>
            </div>
            <div className="flip-card__hint" aria-hidden="true">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m17 2 4 4-4 4" />
                <path d="M3 11v-1a4 4 0 0 1 4-4h14" />
                <path d="m7 22-4-4 4-4" />
                <path d="M21 13v1a4 4 0 0 1-4 4H3" />
              </svg>
            </div>
          </div>
        </div>

        {/* Back of card */}
        <div className="flip-card__face flip-card__back" onClick={isMobile ? closeBack : undefined}>
          <button
            type="button"
            className="flip-card__close"
            onClick={(e) => {
              e.stopPropagation();
              setOpen(false);
            }}
            aria-label={t('card.close')}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
          <div className="flip-card__back-head">
            <h3 className="flip-card__title">{title}</h3>
            {description && <p className="flip-card__desc">{description}</p>}
          </div>

          <ul className="flip-card__list">
            {features.map((feature, index) => (
              <li
                className="flip-card__feature"
                key={feature}
                style={{ transitionDelay: `${index * 50 + 150}ms` }}
              >
                <svg
                  className="flip-card__arrow"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <div className="flip-card__cta">
            <button type="button" onClick={onBook} aria-label={`${t('card.bookNow')}: ${title}`}>
              <span>{t('card.bookNow')}</span>
              <span className="flip-card__cta-arrow" aria-hidden="true">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

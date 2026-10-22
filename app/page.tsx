'use client';

import { useMemo, useState, useRef } from 'react';
import type { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import SequenceCanvas from '@/components/SequenceCanvas';
import BookingClient from '@/components/BookingClient';
import CardFlip from '@/components/CardFlip';
import { useI18n } from '@/lib/i18n';
import { scrollToSection } from '@/lib/navigation';
import { useDialog } from '@/lib/use-dialog';
import { SERVICE_ITEMS } from '@/lib/service-data';
import { BUSINESS } from '@/lib/business';

/* ==================================================================
   SERVICE CATALOG — main categories (localised at render time)
================================================================== */
const SERVICE_CATEGORIES: { id: string; image: string; bookingMain?: string; sub?: string }[] = [
  { id: 'wash', image: 'wash.png' },
  { id: 'iron', image: 'iron.png' },
  { id: 'dryclean', image: 'dryclean.png' },
  { id: 'colorrestore', image: 'colorrestore.png' },
  { id: 'rafoo', image: 'rafoo.png' },
  { id: 'bedding', image: 'bedding.svg', bookingMain: 'wash', sub: 'home' },
];

const SVC_PATHS: Record<string, ReactNode> = {
  bedding: <><path d="M3 18V8m18 10V8M3 14h18M3 18v3m18-3v3M6 10V6h12v4" /><path d="M3 18h18M9 10h6" /></>,
  wash: (
    <>
      <circle cx="12" cy="13" r="7" />
      <path d="M9 13a3 3 0 0 0 6 0" />
      <circle cx="7" cy="6" r="1" />
    </>
  ),
  iron: (
    <>
      <path d="M4 15h13a3 3 0 0 0 0-6h-2l-3-4H8L6 9H4a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2z" />
      <path d="M4 19h16" />
    </>
  ),
  dryclean: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12h8M12 8v8" />
    </>
  ),
  colorrestore: (
    <>
      <path d="M12 3v3M12 18v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M3 12h3M18 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
      <circle cx="12" cy="12" r="4" />
    </>
  ),
  rafoo: (
    <>
      <path d="M4 20 20 4M4 4l4 4M20 20l-4-4" />
    </>
  ),
};

const svcIcon = (id: string) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {SVC_PATHS[id]}
  </svg>
);

/* ==================================================================
   TRUST — stats + testimonials
================================================================== */
const PILLARS = [
  { num: '01', key: 0 },
  { num: '02', key: 1 },
  { num: '03', key: 2 },
  { num: '04', key: 3 },
];

function HomePageContent() {
  const { t } = useI18n();
  const [bookingCategory, setBookingCategory] = useState<{ id: string; sub?: string; request: number }>();
  const [mapOpen, setMapOpen] = useState(false);

  const mapRef = useRef<HTMLDivElement>(null);
  useDialog(mapOpen, mapRef, () => setMapOpen(false));

  const categories = useMemo(
    () =>
      SERVICE_CATEGORIES.map((cat) => ({
        ...cat,
        from: Math.min(...SERVICE_ITEMS.filter(item => item.main === (cat.bookingMain ?? cat.id) && (!cat.sub || item.sub === cat.sub)).map(item => item.price)),
        label: t(`svc.${cat.id}.label`),
        desc: t(`svc.${cat.id}.desc`),
        covers: [0, 1, 2, 3].map((i) => t(`svc.${cat.id}.covers.${i}`)),
      })),
    [t]
  );

  const stats = [
    { value: String(SERVICE_CATEGORIES.length), label: t('stat.1.label') },
    { value: '3', label: t('launch.bookingSteps') },
    { value: t('flow.wadi'), label: t('stat.3.label') },
  ];

  const pillars = useMemo(
    () =>
      PILLARS.map((p) => ({
        num: p.num,
        title: t(`pillar.${p.key}.title`),
        desc: t(`pillar.${p.key}.desc`),
      })),
    [t]
  );

  const closeMap = () => setMapOpen(false);

  const goToBooking = (catId: string, sub?: string) => {
    setBookingCategory(current => ({ id: catId, sub, request: (current?.request ?? 0) + 1 }));
    scrollToSection('#book');
    requestAnimationFrame(() => document.getElementById('booking-headline')?.focus({ preventScroll: true }));
  };

  return (
    <>
      {/* Skip to content for accessibility */}
      <a href="#main-content" className="visually-hidden">{t('skip.main')}</a>

      {/* Navigation */}
      <Navbar />

      <main id="main-content">
        {/* ── HERO ────────────────────────────────────────────── */}
        <SequenceCanvas />

        {/* ── SERVICES ───────────────────────────────────────────────────── */}
        <section id="services" className="services-section" aria-labelledby="services-heading">
          <div className="section-head">
            <span className="pillars-label stagger-1" id="services-heading">{t('services.label')}</span>
            <h2 className="section-title stagger-2">{t('services.title')}</h2>
            <p className="section-sub stagger-3">{t('services.sub')}</p>
          </div>
          <div className="services-grid">
            {categories.map((cat, index) => (
              <CardFlip
                key={cat.id}
                category={cat.bookingMain ?? cat.id}
                title={cat.label}
                subtitle={t('svc.from', { from: cat.from })}
                description={cat.desc}
                features={cat.covers}
                icon={svcIcon(cat.id)}
                imageSrc={cat.image ? `/Services/${cat.image}` : undefined}
                imageAlt={cat.label}
                onBook={() => goToBooking(cat.bookingMain ?? cat.id, cat.sub)}
                className={`scroll-reveal scroll-reveal--up stagger-${(index % 6) + 1}`}
              />
            ))}
          </div>
        </section>

        <BookingClient initialSubcategory={bookingCategory?.sub} initialCategory={bookingCategory?.id} selectionRequest={bookingCategory?.request} />

        {/* ── TRUST — stats + testimonials ────────────────────────────────── */}
        <section id="testimonials" className="trust-section" aria-labelledby="trust-heading">
          <div className="trust-inner">
            <span className="pillars-label stagger-1" id="trust-heading">{t('trust.label')}</span>

            <div className="stat-strip">
              {stats.map((s, index) => (
                <div className={`stat scroll-reveal scroll-reveal--up stagger-${(index % 6) + 1}`} key={s.value}>
                  <b>{s.value}</b>
                  <span>{s.label}</span>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* ── PILLARS / WHY US ───────────────────────────────────────────── */}
        <section
          id="fabric-care"
          className="pillars-section"
          aria-labelledby="care-heading"
        >
          <div className="washing-methods">
            <div className="washing-methods__intro-block">
              <span className="pillars-label">{t('care.label')}</span>
              <h2 id="care-heading">{t('care.title')}</h2>
              <p className="washing-methods__intro">{t('care.intro')}</p>
            </div>
            <div className="washing-methods__steps">
              <article className="washing-methods__method">
                <span aria-hidden="true">01</span>
                <div><h3>{t('care.handTitle')}</h3><p>{t('care.handDesc')}</p></div>
              </article>
              <article className="washing-methods__method">
                <span aria-hidden="true">02</span>
                <div>
                  <h3>{t('care.machineTitle')}</h3><p>{t('care.machineDesc')}</p>
                  <figure className="washing-methods__equipment">
                    <Image src="/Services/industrial-washer.png" alt={t('care.machineAlt')} width={1536} height={1024} sizes="160px" />
                    <figcaption>{t('care.machineCaption')}</figcaption>
                  </figure>
                </div>
              </article>
            </div>
            <button type="button" className="btn-secondary" onClick={() => goToBooking('wash')}>{t('care.book')}<span aria-hidden="true">↗</span></button>
          </div>
          <span className="pillars-label stagger-1" id="pillars-heading">
            {t('pillars.label')}
          </span>
          <div className="pillars-grid" role="list">
            {pillars.map((p, index) => (
              <article key={p.num} className={`pillar scroll-reveal scroll-reveal--up stagger-${(index % 6) + 1}`} role="listitem">
                <p className="pillar__number" aria-hidden="true">{p.num}</p>
                <h3 className="pillar__title">{p.title}</h3>
                <p className="pillar__desc">{p.desc}</p>
              </article>
            ))}
          </div>
        </section>

        {/* ── CONTACT ─────────────────────────────────────────────────────── */}
        <section
          id="contact-us"
          className="contact-section"
          aria-labelledby="contact-heading"
        >
          <div className="contact-intro">
            <span className="pillars-label stagger-1" id="contact-heading">{t('contact.label')}</span>
            <h2 className="stagger-2">{t('contact.title')}</h2>
          </div>

          <div className="contact-grid">
            {[
              { label: t('contact.addressLabel'), content: BUSINESS.address ?? t('launch.detailsPending') },
              { label: t('contact.callLabel'), content: BUSINESS.phoneE164 ? <a href={`tel:${BUSINESS.phoneE164}`}>{BUSINESS.phoneE164}</a> : t('launch.detailsPending') },
              ...(BUSINESS.email ? [{ label: t('contact.emailLabel'), content: <a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a> }] : []),
              { label: t('contact.hoursLabel'), content: BUSINESS.openingHours ?? t('launch.detailsPending') },
            ].map((card, index) => (
              <div className={`contact-card scroll-reveal scroll-reveal--up stagger-${(index % 6) + 1}`} key={index}>
                <p className="contact-card__label">{card.label}</p>
                <p>{card.content}</p>
              </div>
            ))}
          </div>

          <div className="contact-actions">
            {BUSINESS.mapsUrl && <a
              href={BUSINESS.mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="btn-secondary scroll-reveal scroll-reveal--up stagger-1"
            >
              {t('contact.openMaps')}
            </a>}
            <button type="button" disabled={!BUSINESS.mapsEmbedUrl} className="btn-secondary scroll-reveal scroll-reveal--up stagger-2" onClick={() => setMapOpen(true)}>
              {t('contact.viewMap')}
            </button>
            {!BUSINESS.mapsUrl && <p className="request-note">{t('launch.mapPending')}</p>}
          </div>
        </section>

        {/* ── BILLING / BOOKING ─────────────────────────────────────────── */}

      </main>

      {/* ── FOOTER ─────────────────────────────────────────────────────── */}
      <footer className="footer" role="contentinfo">
        <span className="footer__wordmark">Rakesh Dry Cleaners</span>
        <ul className="footer__links" role="list">
          <li><a href="#services">{t('footer.services')}</a></li>
          <li><a href="#fabric-care">{t('footer.fabricCare')}</a></li>
          <li><a href="#book">{t('footer.billing')}</a></li>
          <li><Link href="/privacy">{t('launch.privacy')}</Link></li>
        </ul>
        <p className="footer__copy">© {new Date().getFullYear()} Rakesh Dry Cleaners. {t('footer.rights')}</p>
      </footer>

      {/* ── MAP MODAL ─────────────────────────────────────────────────────── */}
      {mapOpen && BUSINESS.mapsEmbedUrl && (
        <div
          className="map-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="map-modal-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeMap();
          }}
        >
          <div className="map-modal__box" ref={mapRef} tabIndex={-1}>
            <button
              type="button"
              className="map-modal__close"
              onClick={closeMap}
              aria-label={t('map.close')}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
            <h3 id="map-modal-title" className="map-modal__title">{t('map.title')}</h3>
            <div className="map-modal__frame">
              <iframe
                src={BUSINESS.mapsEmbedUrl}
                title="Google Maps — Wadi, Nagpur"
                width="600"
                height="450"
                style={{ border: 0 }}
                tabIndex={-1}
                allowFullScreen
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function HomePage() {
  return <HomePageContent />;
}

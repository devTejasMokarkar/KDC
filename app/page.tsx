'use client';

import { useMemo, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import Navbar from '@/components/Navbar';
import SequenceCanvas from '@/components/SequenceCanvas';
import LoadingScreen from '@/components/LoadingScreen';
import BookingClient from '@/components/BookingClient';
import CardFlip from '@/components/CardFlip';
import { useI18n } from '@/lib/i18n';

/* ==================================================================
   SERVICE CATALOG — main categories (localised at render time)
================================================================== */
const SERVICE_CATEGORIES = [
  { id: 'wash', from: 180, image: 'wash.png' },
  { id: 'iron', from: 250, image: 'iron.png' },
  { id: 'dryclean', from: 300, image: 'dryclean.png' },
  { id: 'colorrestore', from: 700, image: 'colorrestore.png' },
  { id: 'rafoo', from: 120, image: 'rafoo.png' },
];

const SVC_PATHS: Record<string, ReactNode> = {
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
const STATS = [
  { value: '12+', key: 0 },
  { value: '5', key: 1 },
  { value: '4.8/5', key: 2 },
  { value: '24 hr', key: 3 },
];

const TESTIMONIALS = [
  { key: 0, who: 'Anita M.' },
  { key: 1, who: 'Vikram S.' },
  { key: 2, who: 'Priya D.' },
];

const PILLARS = [
  { num: '01', key: 0 },
  { num: '02', key: 1 },
  { num: '03', key: 2 },
  { num: '04', key: 3 },
];

function HomePageContent() {
  const { t } = useI18n();
  const [bookingCategory, setBookingCategory] = useState<string | undefined>(undefined);
  const [mapOpen, setMapOpen] = useState(false);

  useEffect(() => {
    if (!mapOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMapOpen(false);
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [mapOpen]);

  const categories = useMemo(
    () =>
      SERVICE_CATEGORIES.map((cat) => ({
        ...cat,
        label: t(`svc.${cat.id}.label`),
        desc: t(`svc.${cat.id}.desc`),
        covers: [0, 1, 2, 3].map((i) => t(`svc.${cat.id}.covers.${i}`)),
      })),
    [t]
  );

  const stats = useMemo(
    () => STATS.map((s) => ({ value: s.value, label: t(`stat.${s.key}.label`) })),
    [t]
  );

  const testimonials = useMemo(
    () =>
      TESTIMONIALS.map((item) => ({
        quote: t(`testi.${item.key}.quote`),
        who: item.who,
      })),
    [t]
  );

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

  const goToBooking = (catId: string) => {
    setBookingCategory(catId);
    document.getElementById('book')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      {/* Loading screen — shown until all frames are preloaded */}
      <LoadingScreen />

      {/* Skip to content for accessibility */}
      <a href="#main-content" className="visually-hidden">{t('skip.main')}</a>

      {/* Navigation */}
      <Navbar />

      <main id="main-content">
        {/* ── SCROLL SEQUENCE ────────────────────────────────────────────── */}
        <SequenceCanvas />

        {/* ── SERVICES ───────────────────────────────────────────────────── */}
        <section id="services" className="services-section scroll-reveal scroll-reveal--up" aria-labelledby="services-heading">
          <div className="section-head">
            <span className="pillars-label stagger-1" id="services-heading">{t('services.label')}</span>
            <h2 className="section-title stagger-2">{t('services.title')}</h2>
            <p className="section-sub stagger-3">{t('services.sub')}</p>
          </div>
          <div className="services-grid">
            {categories.map((cat, index) => (
              <CardFlip
                key={cat.id}
                title={cat.label}
                subtitle={t('svc.from', { from: cat.from })}
                description={cat.desc}
                features={cat.covers}
                icon={svcIcon(cat.id)}
                imageSrc={cat.image ? `/Services/${cat.image}` : undefined}
                imageAlt={cat.label}
                onBook={() => goToBooking(cat.id)}
                className={`scroll-reveal scroll-reveal--up stagger-${(index % 6) + 1}`}
              />
            ))}
          </div>
        </section>

        {/* ── TRUST — stats + testimonials ────────────────────────────────── */}
        <section id="testimonials" className="trust-section scroll-reveal scroll-reveal--up" aria-labelledby="trust-heading">
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

            <div className="testimonial-grid">
              {testimonials.map((item, index) => (
                <figure className={`testimonial scroll-reveal scroll-reveal--up stagger-${(index % 6) + 1}`} key={item.who}>
                  <blockquote>{item.quote}</blockquote>
                  <figcaption>— {item.who}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* ── PILLARS / WHY US ───────────────────────────────────────────── */}
        <section
          id="fabric-care"
          className="pillars-section scroll-reveal scroll-reveal--up"
          aria-labelledby="pillars-heading"
        >
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
          className="contact-section scroll-reveal scroll-reveal--up"
          aria-labelledby="contact-heading"
        >
          <div className="contact-intro">
            <span className="pillars-label stagger-1" id="contact-heading">{t('contact.label')}</span>
            <h2 className="stagger-2">{t('contact.title')}</h2>
          </div>

          <div className="contact-grid">
            {[
              { label: t('contact.addressLabel'), content: t('contact.address') },
              { label: t('contact.callLabel'), content: (<><a href="tel:+919876543210">+91 98765 43210</a><br />{t('contact.hoursShort')}</>) },
              { label: t('contact.emailLabel'), content: (<><a href="mailto:Rakesh@drycleaners.in">Rakesh@drycleaners.in</a><br />{t('contact.emailReply')}</>) },
              { label: t('contact.hoursLabel'), content: (<>{t('contact.hoursFull')}<br />{t('contact.hoursOpen')}</>) },
            ].map((card, index) => (
              <div className={`contact-card scroll-reveal scroll-reveal--up stagger-${(index % 6) + 1}`} key={index}>
                <p className="contact-card__label">{card.label}</p>
                <p>{card.content}</p>
              </div>
            ))}
          </div>

          <div className="contact-actions">
            <a
              href="https://maps.google.com/?q=Wadi+Nagpur"
              target="_blank"
              rel="noreferrer"
              className="btn-secondary scroll-reveal scroll-reveal--up stagger-1"
            >
              {t('contact.openMaps')}
            </a>
            <button type="button" className="btn-secondary scroll-reveal scroll-reveal--up stagger-2" onClick={() => setMapOpen(true)}>
              {t('contact.viewMap')}
            </button>
          </div>
        </section>

        {/* ── BILLING / BOOKING ─────────────────────────────────────────── */}
        <BookingClient initialCategory={bookingCategory} className="scroll-reveal scroll-reveal--up" />
      </main>

      {/* ── FOOTER ─────────────────────────────────────────────────────── */}
      <footer className="footer" role="contentinfo">
        <span className="footer__wordmark">Rakesh Dry Cleaners</span>
        <ul className="footer__links" role="list">
          <li><a href="#services">{t('footer.services')}</a></li>
          <li><a href="#fabric-care">{t('footer.fabricCare')}</a></li>
          <li><a href="#book">{t('footer.billing')}</a></li>
        </ul>
        <p className="footer__copy">© {new Date().getFullYear()} Rakesh Dry Cleaners. {t('footer.rights')}</p>
      </footer>

      {/* ── MAP MODAL ─────────────────────────────────────────────────────── */}
      {mapOpen && (
        <div
          className="map-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="map-modal-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeMap();
          }}
        >
          <div className="map-modal__box">
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
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d29769.307744750357!2d78.96976039715346!3d21.145891904081097!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bd4eaeeafe449ed%3A0x7943956b036050a2!2sWadi%2C%20Nagpur%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1785674386355!5m2!1sen!2sin"
                title="Google Maps — Wadi, Nagpur"
                width="600"
                height="450"
                style={{ border: 0 }}
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

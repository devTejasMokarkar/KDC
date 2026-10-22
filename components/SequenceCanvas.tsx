'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { useI18n } from '@/lib/i18n';

// Keep these 45 sampled frame IDs in sync with the assets in both frame folders.
const FRAMES = Array.from({ length: 45 }, (_, i) => 1 + Math.round(i * 299 / 44));

export default function SequenceCanvas() {
  const { t } = useI18n();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const images: HTMLImageElement[] = [];
    let disposed = false;
    let animation = 0;
    let cursor = 0;
    let started = false;

    const draw = () => {
      if (disposed) return;
      const rect = section.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;
      const progress = motion.matches ? 0 : Math.min(1, Math.max(0, -rect.top / (rect.height * .85)));
      const index = Math.round(progress * (FRAMES.length - 1));
      // Use the nearest available frame while the remaining frames stream in.
      let img = images[index];
      if (!img?.complete || !img.naturalWidth) img = images.slice(0, index + 1).reverse().find(image => image.complete && image.naturalWidth)!;
      if (!img) return;
      const { width, height } = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      if (canvas.width !== Math.round(width * dpr)) canvas.width = Math.round(width * dpr);
      if (canvas.height !== Math.round(height * dpr)) canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const scale = Math.max(width / img.naturalWidth, height / img.naturalHeight);
      ctx.drawImage(img, (width - img.naturalWidth * scale) / 2, (height - img.naturalHeight * scale) / 2, img.naturalWidth * scale, img.naturalHeight * scale);
    };
    const schedule = () => {
      cancelAnimationFrame(animation);
      animation = requestAnimationFrame(draw);
    };
    const loadNext = () => {
      if (disposed || cursor >= FRAMES.length || motion.matches) return;
      const i = cursor++;
      const img = new window.Image();
      images[i] = img;
      img.onload = () => { schedule(); loadNext(); };
      img.onerror = loadNext;
      img.src = `${window.innerWidth <= 900 ? '/frames-mobile' : '/frames'}/frame_${String(FRAMES[i]).padStart(6, '0')}.jpg`;
    };
    const start = () => {
      if (started || motion.matches) return;
      started = true;
      // Three concurrent requests keep the initial content responsive.
      for (let i = 0; i < 3; i++) loadNext();
    };
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) start();
    });
    observer.observe(section);
    const onMotion = () => { if (motion.matches) ctx.clearRect(0, 0, canvas.width, canvas.height); else { started = false; start(); schedule(); } };
    motion.addEventListener('change', onMotion);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      disposed = true;
      observer.disconnect();
      cancelAnimationFrame(animation);
      motion.removeEventListener('change', onMotion);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      images.forEach(img => { img.onload = null; img.onerror = null; });
    };
  }, []);

  return (
    <section id="the-process" className="care-hero" ref={sectionRef} aria-labelledby="hero-title">
      <div className="care-hero__copy">
        <p className="eyebrow"><span />{t('hero.location')}</p>
        <h1 id="hero-title">{t('hero.title')}{' '}<em>{t('hero.titleAccent')}</em></h1>
        <p className="care-hero__description">{t('hero.description')}</p>
        <div className="care-hero__actions">
          <a className="btn-primary" href="#book">{t('hero.book')}<span aria-hidden="true">↗</span></a>
          <a className="hero-price-link" href="#pricing">{t('hero.prices')}<span aria-hidden="true">→</span></a>
        </div>
        <div className="care-hero__benefits"><span>✓ {t('hero.benefit1')}</span><span>✓ {t('hero.benefit2')}</span></div>
        <div className="care-hero__footnote"><span className="hero-thread" aria-hidden="true">R.</span><p>{t('hero.footnote')}</p></div>
      </div>
      <div className="care-hero__visual">
        <Image src="/frames/frame_000001.jpg" alt={t('hero.imageAlt')} fill priority sizes="(max-width: 900px) 100vw, 55vw" />
        <canvas ref={canvasRef} aria-hidden="true" />
        <div className="care-hero__shade" />
        <span className="care-hero__image-label">{t('hero.imageLabel')}</span>
        <div className="care-hero__caption"><span>01 / {t('hero.captionLabel')}</span><p>{t('hero.caption')}</p><span className="care-hero__seal" aria-hidden="true">R</span></div>
      </div>
    </section>
  );
}

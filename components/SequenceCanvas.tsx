'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useI18n } from '@/lib/i18n';

const TOTAL_FRAMES = 300;
const LERP_FACTOR = 0.09; // lower = smoother / more lag; higher = snappier
// Use the downscaled frame set on phones for faster load + less memory
const FRAME_DIR = () =>
  typeof window !== 'undefined' && window.innerWidth <= 900
    ? '/frames-mobile'
    : '/frames';
const FRAME_PATH = (n: number) =>
  `${FRAME_DIR()}/frame_${String(n).padStart(6, '0')}.jpg`;

const BEATS = [
  { range: [0, 0.18] as const, align: 'center' as const },
  { range: [0.18, 0.42] as const, align: 'left' as const },
  { range: [0.42, 0.67] as const, align: 'right' as const },
  { range: [0.67, 0.88] as const, align: 'left' as const },
  { range: [0.88, 1.0] as const, align: 'center' as const },
];

export default function SequenceCanvas() {
  const { t } = useI18n();
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const wrapperRef   = useRef<HTMLDivElement>(null);
  const stickyRef    = useRef<HTMLDivElement>(null);
  const progressRef  = useRef<HTMLDivElement>(null);
  const imagesRef    = useRef<HTMLImageElement[]>([]);

  // Smooth playback refs (never cause re-renders)
  const targetProgressRef  = useRef(0);   // raw scroll 0-1
  const currentProgressRef = useRef(0);   // lerped scroll 0-1
  const rafLoopRef         = useRef<number | null>(null);
  const lastDrawnFrame     = useRef(-1);
  const reducedMotionRef   = useRef(false);

  const [loaded, setLoaded]           = useState(false);
  const [visibleBeat, setVisibleBeat] = useState(0);

  // Respect prefers-reduced-motion: snap frames to scroll instead of lerping.
  // Tracked via a ref so runtime OS preference changes take effect immediately.
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    reducedMotionRef.current = mq.matches;
    const onChange = (e: MediaQueryListEvent) => {
      reducedMotionRef.current = e.matches;
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // ── Draw a frame by index (crossfade between neighbouring frames) ────────
  const drawFrame = useCallback((position: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.filter = 'contrast(1.14) saturate(1.22)';

    const W  = canvas.clientWidth;
    const H  = canvas.clientHeight;
    if (W === 0 || H === 0) return; // canvas not laid out yet

    const clamped = Math.max(0, Math.min(position, TOTAL_FRAMES - 1));
    const index   = Math.floor(clamped);
    const frac    = clamped - index;

    const drawCover = (img: HTMLImageElement | undefined) => {
      if (!img || !img.complete || img.naturalWidth === 0) return;
      const iW = img.naturalWidth;
      const iH = img.naturalHeight;
      const scale = Math.max(W / iW, H / iH);
      const drawW = iW * scale;
      const drawH = iH * scale;
      const dx    = (W - drawW) / 2;
      const dy    = (H - drawH) / 2;
      ctx.drawImage(img, dx, dy, drawW, drawH);
    };

    ctx.globalAlpha = 1;
    drawCover(imagesRef.current[index]);
    if (frac > 0.001) {
      ctx.globalAlpha = frac;
      drawCover(imagesRef.current[index + 1]);
      ctx.globalAlpha = 1;
    }
  }, []);

  // ── Pre-load all frames ───────────────────────────────────────────────────
  useEffect(() => {
    const images: HTMLImageElement[] = new Array(TOTAL_FRAMES);
    let loadedCount = 0;

    const onLoad = () => {
      loadedCount++;
      const pct = Math.round((loadedCount / TOTAL_FRAMES) * 100);
      window.dispatchEvent(new CustomEvent('kdc:loadprogress', { detail: pct }));
      if (loadedCount === TOTAL_FRAMES) {
        setLoaded(true);
      }
    };

    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = new Image();
      img.src   = FRAME_PATH(i + 1);
      if (i === 0) {
        // Show the opening shot behind the loader as soon as it is ready
        img.onload  = () => { onLoad(); drawFrame(0); };
        img.onerror = onLoad;
      } else {
        img.onload  = onLoad;
        img.onerror = onLoad;
      }
      images[i]   = img;
    }
    imagesRef.current = images;
  }, [drawFrame]);

  // ── RAF animation loop (lerp-based smooth playback) ───────────────────────
  useEffect(() => {
    if (!loaded) return;

    const loop = () => {
      // Lerp current toward target (or snap immediately under reduced motion)
      const diff = targetProgressRef.current - currentProgressRef.current;
      currentProgressRef.current += diff * (reducedMotionRef.current ? 1 : LERP_FACTOR);

      const progress   = currentProgressRef.current;
      const framePos   = progress * (TOTAL_FRAMES - 1);

      // Only redraw if the frame changed
      if (framePos !== lastDrawnFrame.current) {
        lastDrawnFrame.current = framePos;
        drawFrame(framePos);
      }

      // Update progress bar width (smooth via lerp)
      if (progressRef.current) {
        progressRef.current.style.width = `${progress * 100}%`;
      }

      // Which beat is visible?
      const beatIdx = BEATS.findIndex(
        (b) => progress >= b.range[0] && progress < b.range[1]
      );
      setVisibleBeat(beatIdx === -1 ? BEATS.length - 1 : beatIdx);

      rafLoopRef.current = requestAnimationFrame(loop);
    };

    rafLoopRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafLoopRef.current) cancelAnimationFrame(rafLoopRef.current);
    };
  }, [loaded, drawFrame]);

  // ── Scroll → target progress ──────────────────────────────────────────────
  useEffect(() => {
    if (!loaded) return;

    const onScroll = () => {
      const wrapper = wrapperRef.current;
      if (!wrapper) return;

      const rect      = wrapper.getBoundingClientRect();
      const wrapperH  = wrapper.offsetHeight;
      const viewH     = window.innerHeight;
      const scrolled  = -rect.top;
      const scrollable = wrapperH - viewH;

      targetProgressRef.current =
        scrollable <= 0
          ? 0
          : Math.min(Math.max(scrolled / scrollable, 0), 1);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [loaded]);

  // ── Resize handler ────────────────────────────────────────────────────────
  useEffect(() => {
    const resize = () => {
      const canvas = canvasRef.current;
      const sticky = stickyRef.current;
      if (!canvas || !sticky) return;
      const dpr = window.devicePixelRatio || 1;
      const W   = sticky.clientWidth;
      const H   = sticky.clientHeight;
      canvas.width  = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width  = `${W}px`;
      canvas.style.height = `${H}px`;
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.scale(dpr, dpr);
      drawFrame(lastDrawnFrame.current >= 0 ? lastDrawnFrame.current : 0);
    };

    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [loaded, drawFrame]);

  return (
    <section
      id="the-process"
      className="sequence-wrapper"
      ref={wrapperRef}
      aria-label={t('seq.aria')}
    >
      <div className="sequence-sticky" ref={stickyRef}>
        {/* Canvas */}
        <canvas
          ref={canvasRef}
          className="sequence-canvas"
          aria-hidden="true"
        />

        {/* Side vignettes for copy readability */}
        <div className="sequence-vignette-left"   aria-hidden="true" />
        <div className="sequence-vignette-right"  aria-hidden="true" />
        <div className="sequence-vignette-bottom" aria-hidden="true" />

        {/* Story Beats */}
        <div className="story-overlay" aria-live="off">
          {BEATS.map((beat, i) => (
            <div
              key={i}
              className={`story-beat story-beat--${beat.align}${visibleBeat === i ? ' visible' : ''}`}
              aria-hidden={visibleBeat !== i}
            >
              <div className="story-beat__content">
                <span className="story-beat__label">{t(`seq.${i}.label`)}</span>
                <h2 className="story-beat__headline">
                  {t(`seq.${i}.headline`).split('\n').map((line, j) => (
                    <span key={j} style={{ display: 'block' }}>{line}</span>
                  ))}
                </h2>
                {t(`seq.${i}.sub`)    && <p className="story-beat__sub">{t(`seq.${i}.sub`)}</p>}
                {t(`seq.${i}.detail`) && <p className="story-beat__detail">{t(`seq.${i}.detail`)}</p>}
              </div>
            </div>
          ))}
        </div>

        {/* Scroll progress line */}
        <div
          ref={progressRef}
          className="scroll-progress-bar"
          aria-hidden="true"
          style={{ width: '0%' }}
        />
      </div>
    </section>
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';
import { useI18n } from '@/lib/i18n';

const TOTAL_FRAMES = 300;

export default function LoadingScreen() {
  const { t } = useI18n();
  const [progress, setProgress] = useState(0);
  const [exiting, setExiting] = useState(false);
  const [mounted, setMounted] = useState(true);
  const exitingRef = useRef(false);

  useEffect(() => {
    // Simulate counting frames as they load by listening to image events
    // shared via a custom event from SequenceCanvas
    const handler = (e: Event) => {
      const pct = (e as CustomEvent<number>).detail;
      setProgress(pct);
      if (pct >= 100 && !exitingRef.current) {
        exitingRef.current = true;
        setExiting(true);
        window.setTimeout(() => setMounted(false), 600);
      }
    };

    window.addEventListener('kdc:loadprogress', handler);
    return () => {
      window.removeEventListener('kdc:loadprogress', handler);
    };
  }, []);

  // Safety net: if frames never report progress, dismiss the loader anyway
  useEffect(() => {
    const timeout = window.setTimeout(() => {
      if (!exitingRef.current) {
        exitingRef.current = true;
        setExiting(true);
        window.setTimeout(() => setMounted(false), 600);
      }
    }, 20000);
    return () => window.clearTimeout(timeout);
  }, []);

  if (!mounted) return null;

  return (
    <div
      className={`loading-screen${exiting ? ' hidden' : ''}`}
      aria-label={t('loading.preparing')}
      role="status"
    >
      <div className="loading-logo" aria-hidden="true">
        <svg viewBox="0 0 100 100" fill="none">
          <path
            d="M34 78 V25 M34 25 H59 A15 15 0 0 1 59 55 H34 M47 55 L66 78"
            stroke="currentColor"
            strokeWidth="13"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <div className="loading-brand">
        <p className="loading-wordmark">Rakesh</p>
        <p className="loading-tagline">Dry Cleaners</p>
      </div>

      <div className="loading-bar-track" aria-hidden="true">
        <div
          className="loading-bar-fill"
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className="loading-label">{t('loading.preparing')}</p>
    </div>
  );
}

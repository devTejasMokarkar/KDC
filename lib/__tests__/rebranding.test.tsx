import { describe, expect, it, vi } from 'vitest';
import { render, renderHook, screen, act } from '@testing-library/react';
import { BUSINESS, parseBusiness } from '@/lib/business';
import { LanguageProvider, useI18n } from '@/lib/i18n';
import HomePage from '@/app/page';
import PrivacyPage from '@/app/privacy/page';

vi.mock('../../config/business.json', () => ({ default: { name: 'Mukesh Dry Cleaners', phoneE164: '+919000000001', whatsappNumber: null } }));

describe('shop rebranding from public configuration', () => {
  it('uses one name for the visible brand, monogram and order reference prefix', () => {
    expect(BUSINESS).toMatchObject({ name: 'Mukesh Dry Cleaners', shortName: 'Mukesh', monogram: 'M', referencePrefix: 'MDC', whatsappNumber: '919000000001' });
    render(<HomePage />);
    expect(screen.getByRole('link', { name: 'Mukesh Dry Cleaners – home' })).toHaveTextContent('Mukesh');
    expect(document.querySelector('.footer__wordmark')).toHaveTextContent('Mukesh Dry Cleaners');
    expect(document.querySelector('.care-hero__seal')).toHaveTextContent('M');
    expect(screen.getAllByRole('link', { name: 'Call' })[0]).toHaveAttribute('href', 'tel:+919000000001');
    expect(document.body.textContent).not.toMatch(/Rakesh|राकेश/);
  });
  it('uses the configured name in the privacy page', () => {
    render(<PrivacyPage />);
    expect(screen.getByText('Mukesh Dry Cleaners · Wadi')).toBeInTheDocument();
  });
  it('updates translated messages and document titles in every language', () => {
    const { result } = renderHook(() => useI18n(), { wrapper: LanguageProvider });
    for (const locale of ['en', 'mr', 'hi'] as const) {
      act(() => result.current.setLocale(locale));
      for (const key of ['nav.wordmarkAria', 'wa.welcome', 'wa.thankYou', 'wa.defaultMessage']) {
        expect(result.current.t(key)).toContain('Mukesh Dry Cleaners');
        expect(result.current.t(key)).not.toContain('{business');
      }
      expect(result.current.t('pillars.label')).toContain('Mukesh');
      expect(document.title).toContain('Mukesh Dry Cleaners');
    }
  });
  it('supports a separate WhatsApp number without changing the call number', () => {
    expect(parseBusiness({ name: 'Mukesh', phoneE164: '+919000000001', whatsappNumber: '919000000002' })).toMatchObject({ shortName: 'Mukesh', phoneE164: '+919000000001', whatsappNumber: '919000000002' });
  });
});

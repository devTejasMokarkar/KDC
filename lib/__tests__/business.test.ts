import { describe, expect, it } from 'vitest';
import { businessReady, parseBusiness } from '@/lib/business';
import { publicSiteUrl, serializeJsonLd } from '@/lib/site';

describe('public launch configuration', () => {
  it('does not turn missing or sample contacts into usable customer links', () => {
    expect(parseBusiness({}).whatsappNumber).toBeNull();
    const sample = parseBusiness({ phoneE164: '+919876543210', whatsappNumber: '919876543210', mapsUrl: 'javascript:alert(1)' });
    expect(sample.phoneE164).toBeNull();
    expect(sample.whatsappNumber).toBeNull();
    expect(sample.mapsUrl).toBeNull();
  });
  it('accepts a configured contact and rejects non-Google embedded map origins', () => {
    const shop = parseBusiness({ phoneE164: '+919000000001', whatsappNumber: '919000000001', mapsUrl: 'https://maps.app.goo.gl/test', mapsEmbedUrl: 'https://unrelated.invalid/embed' });
    expect(shop.whatsappNumber).toBe('919000000001');
    expect(shop.mapsUrl).toBe('https://maps.app.goo.gl/test');
    expect(shop.mapsEmbedUrl).toBeNull();
  });
  it.each(['http://shop.in', 'https://localhost', 'https://example.com', 'https://127.0.0.1', 'https://shop.in/path', 'https://user:pass@shop.in'])('rejects an unsuitable public origin: %s', value => {
    expect(publicSiteUrl(value)).toBeNull();
  });
  it('does not allow indexing merely because unfilled configuration flags were switched on', () => {
    const flags = { businessDetailsConfirmed: true, catalogPricesConfirmed: true, pickupCoverageConfirmed: true };
    expect(businessReady(flags)).toBe(false);
    expect(businessReady({ ...flags, phoneE164: '+919000000001', whatsappNumber: '919000000001', address: 'Test shop, Wadi', openingHours: 'Confirmed hours', mapsUrl: 'https://maps.app.goo.gl/test' })).toBe(true);
  });
  it('keeps structured data inside its script tag and preserves the original text', () => {
    const value = { name: '</script><script>alert(1)</script>', address: 'वाडी' };
    const json = serializeJsonLd(value);
    expect(json).not.toContain('<');
    expect(JSON.parse(json)).toEqual(value);
  });
  it('accepts a real HTTPS origin without inventing a domain', () => {
    expect(publicSiteUrl('https://rakesh-shop.in/')).toBe('https://rakesh-shop.in');
  });
});

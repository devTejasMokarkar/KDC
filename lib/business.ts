import settings from '../config/business.json' with { type: 'json' };

/** Public shop details only. Never put secrets in this configuration. */
export function parseBusiness(input: Record<string, unknown>) {
  const text = (key: string) => typeof input[key] === 'string' && input[key].trim() ? input[key].trim() : null;
  const httpsUrl = (key: string, allowedHosts: string[]) => {
    try {
      const value = text(key);
      if (!value) return null;
      const url = new URL(value);
      return url.protocol === 'https:' && !url.username && !url.password && allowedHosts.includes(url.hostname) ? url.toString() : null;
    } catch { return null; }
  };
  const phone = text('phoneE164');
  const whatsapp = text('whatsappNumber') ?? phone?.replace(/^\+/, '') ?? null;
  const name = text('name') ?? 'Dry Cleaners';
  const shortName = name.replace(/\s+Dry Cleaners$/i, '').trim() || name;
  const email = text('email');
  return {
    name,
    shortName,
    monogram: Array.from(shortName)[0].toUpperCase(),
    referencePrefix: name.split(/\s+/).map(word => Array.from(word)[0]).join('').toUpperCase().replace(/[^A-Z0-9]/g, '') || 'ORDER',
    phoneE164: phone && /^\+[1-9]\d{7,14}$/.test(phone) && phone !== '+919876543210' ? phone : null,
    whatsappNumber: whatsapp && /^[1-9]\d{7,14}$/.test(whatsapp) && whatsapp !== '919876543210' ? whatsapp : null,
    email: email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null,
    address: text('address'),
    openingHours: text('openingHours'),
    mapsUrl: httpsUrl('mapsUrl', ['www.google.com', 'google.com', 'maps.google.com', 'maps.app.goo.gl', 'goo.gl']),
    mapsEmbedUrl: httpsUrl('mapsEmbedUrl', ['www.google.com', 'maps.google.com']),
  };
}

export const BUSINESS = parseBusiness(settings);

export function businessReady(input: Record<string, unknown>): boolean {
  const shop = parseBusiness(input);
  return !!(shop.phoneE164 && shop.whatsappNumber && shop.address && shop.openingHours && shop.mapsUrl &&
    input.businessDetailsConfirmed === true && input.catalogPricesConfirmed === true && input.pickupCoverageConfirmed === true);
}

export const BUSINESS_CONFIRMED = businessReady(settings);

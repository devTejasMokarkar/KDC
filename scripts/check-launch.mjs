import settings from '../config/business.json' with { type: 'json' };
import { BUSINESS } from '../lib/business.ts';
import { publicSiteUrl } from '../lib/site.ts';

const missing = [
  [BUSINESS.whatsappNumber, 'Add and verify the real WhatsApp number in config/business.json.'],
  [BUSINESS.phoneE164, 'Add and verify the shop phone number in international format (+91...).'],
  [BUSINESS.address, 'Add the real full shop address.'],
  [BUSINESS.openingHours, 'Add confirmed opening hours.'],
  [BUSINESS.mapsUrl, 'Add a verified Google Maps shop link.'],
  [settings.businessDetailsConfirmed, 'Set businessDetailsConfirmed only after checking the contact details.'],
  [settings.catalogPricesConfirmed, 'Check every price in lib/service-data.ts, then set catalogPricesConfirmed.'],
  [settings.pickupCoverageConfirmed, 'Confirm Wadi PINs/coverage in lib/booking-policy.ts, then set pickupCoverageConfirmed.'],
  [publicSiteUrl(), 'Set NEXT_PUBLIC_SITE_URL to the real HTTPS origin in the deployment environment.'],
  [process.env.VERCEL_ENV !== 'preview', 'Run this check against production settings, not a Vercel preview.'],
].filter(([ready]) => !ready);
if (missing.length) {
  console.error('Not ready for public launch:\n' + missing.map(([,message]) => `- ${message}`).join('\n'));
  process.exitCode = 1;
} else {
  console.log('Automated launch configuration checks passed. Complete the real-phone WhatsApp, map and HTTPS checks in LAUNCH.md before promoting the site.');
}

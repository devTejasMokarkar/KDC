import { BUSINESS_CONFIRMED } from './business.ts';

/** Avoid publishing placeholder domains in canonical URLs and the sitemap. */
export function publicSiteUrl(value = process.env.NEXT_PUBLIC_SITE_URL): string | null {
  try {
    if (!value) return null;
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password || url.port || url.pathname !== '/' || url.search || url.hash ||
      !url.hostname.includes('.') || /(^|\.)(localhost|example\.(com|org|net)|test|local)$/.test(url.hostname) || /^\d+\.\d+\.\d+\.\d+$/.test(url.hostname)) return null;
    return url.origin;
  } catch { return null; }
}

export const SITE_URL = publicSiteUrl();
export const INDEX_SITE = !!SITE_URL && process.env.VERCEL_ENV !== 'preview' && BUSINESS_CONFIRMED;


export function serializeJsonLd(value: Record<string, unknown>): string {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

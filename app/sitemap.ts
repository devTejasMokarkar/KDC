import type { MetadataRoute } from 'next';
import { INDEX_SITE, SITE_URL } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  return INDEX_SITE && SITE_URL ? [
    { url: SITE_URL, changeFrequency: 'monthly', priority: 1 },
    { url: `${SITE_URL}/privacy`, changeFrequency: 'yearly', priority: .2 },
  ] : [];
}

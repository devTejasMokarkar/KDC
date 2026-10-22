import type { MetadataRoute } from 'next';
import { INDEX_SITE, SITE_URL } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', ...(INDEX_SITE ? { allow: '/' } : { disallow: '/' }) },
    ...(INDEX_SITE && SITE_URL ? { sitemap: `${SITE_URL}/sitemap.xml` } : {}),
  };
}

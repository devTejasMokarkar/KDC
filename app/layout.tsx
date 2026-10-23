import type { Metadata } from 'next';
import { LanguageProvider } from '@/lib/i18n';
import WhatsAppButton from '@/components/WhatsAppButton';
import ScrollInitializer from '@/components/ScrollInitializer';
import { SITE_URL, INDEX_SITE, serializeJsonLd } from '@/lib/site';
import { BUSINESS } from '@/lib/business';
import './globals.css';
import './redesign.css';

export const metadata: Metadata = {
  metadataBase: SITE_URL ? new URL(SITE_URL) : undefined,
  robots: { index: INDEX_SITE, follow: INDEX_SITE },
  title: `${BUSINESS.name} — Your neighbourhood garment-care shop in Wadi`,
  description:
    'Your neighbourhood garment-care shop in Wadi, Nagpur. Hand washing for everyday clothes, professional cleaning for heavy items, dry cleaning, ironing and mending.',
  keywords: `${BUSINESS.name}, Wadi, Nagpur, neighbourhood laundry, dry cleaning, garment care, fabric care, steam pressing, wash and iron, rafoo mending, colour restore, doorstep pickup, doorstep delivery`,
  icons: { icon: "/favicon.svg?v=k" },
  openGraph: {
    title: `${BUSINESS.name} — Your neighbourhood garment-care shop in Wadi`,
    description: 'Your neighbourhood garment-care shop in Wadi. Washing, dry cleaning, ironing and mending, with local pickup or shop drop-off.',
    type: 'website',
    ...(SITE_URL ? { url: SITE_URL } : {}),
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#FAF8F3" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        {INDEX_SITE && SITE_URL && BUSINESS.address && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd({
          '@context': 'https://schema.org', '@type': 'DryCleaningOrLaundry',
          name: BUSINESS.name, url: SITE_URL, address: BUSINESS.address,
          areaServed: { '@type': 'Place', name: 'Wadi, Nagpur' },
          ...(BUSINESS.phoneE164 ? { telephone: BUSINESS.phoneE164 } : {}),
          ...(BUSINESS.mapsUrl ? { hasMap: BUSINESS.mapsUrl } : {}),
        }) }} />}

        <LanguageProvider>
          <ScrollInitializer />
          {children}
          <WhatsAppButton />
          {/* Scroll progress indicator */}
          <div className="scroll-progress" aria-hidden="true" />
        </LanguageProvider>
      </body>
    </html>
  );
}

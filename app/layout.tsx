import type { Metadata } from 'next';
import { LanguageProvider } from '@/lib/i18n';
import WhatsAppButton from '@/components/WhatsAppButton';
import ScrollInitializer from '@/components/ScrollInitializer';
import './globals.css';
import './redesign.css';

export const metadata: Metadata = {
  title: 'Rakesh Dry Cleaners — Your neighbourhood garment-care shop in Wadi',
  description:
    'Your neighbourhood garment-care shop in Wadi, Nagpur. Hand washing for everyday clothes, professional cleaning for heavy items, dry cleaning, ironing and mending.',
  keywords: 'Wadi, Nagpur, neighbourhood laundry, dry cleaning, garment care, Rakesh, fabric care, steam pressing, wash and iron, rafoo mending, colour restore, doorstep pickup, doorstep delivery',
  openGraph: {
    title: 'Rakesh Dry Cleaners — Your neighbourhood garment-care shop in Wadi',
    description: 'Your neighbourhood garment-care shop in Wadi. Washing, dry cleaning, ironing and mending, with local pickup or shop drop-off.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#FAF8F3" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
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

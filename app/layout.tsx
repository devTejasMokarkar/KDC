import type { Metadata } from 'next';
import { LanguageProvider } from '@/lib/i18n';
import WhatsAppButton from '@/components/WhatsAppButton';
import ScrollInitializer from '@/components/ScrollInitializer';
import './globals.css';

export const metadata: Metadata = {
  title: 'Rakesh Dry Cleaners — Atelier-Grade Garment Care',
  description:
    'Doorstep pickup, wash, wash & iron, dry cleaning, colour restore and rafoo mending in Nagpur. Precision dry cleaning for garments that matter.',
  keywords: 'dry cleaning, garment care, premium, atelier, Rakesh, fabric care, steam pressing, wash and iron, rafoo mending, colour restore, doorstep pickup, doorstep delivery',
  openGraph: {
    title: 'Rakesh Dry Cleaners — Atelier-Grade Garment Care',
    description: 'Doorstep pickup, wash & iron, dry cleaning, colour restore and rafoo mending in Nagpur.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#F8FBFF" />
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

# Rakesh Dry Cleaners

A Next.js 14 landing and booking experience for Rakesh Dry Cleaners (Nagpur), featuring an immersive scroll-driven canvas sequence, service discovery, and a unified in-page booking flow that confirms orders via WhatsApp.

## Features

- **Loading screen** — covers the first paint until the hero frame set is preloaded.
- **Scroll sequence** — a 300-frame canvas playback driven by scroll position, with dynamic copy beats. Respects `prefers-reduced-motion` and uses mobile-sized frames on small screens.
- **Services** — cards for Wash, Wash & Iron, Dry Clean, Colour Restore, and Rafoo (mending), each with a Book-now action that preselects the matching booking tab.
- **Booking** — category tabs + sub-category filters, item picker with quantity controls, date/time pills, optional pickup address and instructions, and a live order summary with estimated total. Confirming opens a pre-filled WhatsApp message.
- **Trust & contact** — stats, testimonials, fabric-care pillars, working hours, phone/email links, and a Google Maps embed modal.
- **WhatsApp floating button** — always-available chat shortcut with a pulse animation.
- **Multilingual** — full English / Marathi / Hindi UI with a language switcher in the navbar; preference persisted in `localStorage`.

## Tech Stack

- Next.js 14 (App Router), React 18, TypeScript (strict)
- Custom CSS via `app/globals.css` (no CSS framework)
- Vitest + Testing Library + jsdom for unit/component tests
- ESLint (`next/core-web-vitals`)

## Project Structure

- `app/page.tsx` — page sections, service catalog, map modal, and booking state.
- `app/layout.tsx` — global metadata, `LanguageProvider`, and `WhatsAppButton`.
- `app/error.tsx`, `app/not-found.tsx` — translated error screens.
- `components/Navbar.tsx` — responsive navigation, scrollspy, language switcher, accessible mobile menu.
- `components/SequenceCanvas.tsx` — preloads the frame set and renders the scroll-driven canvas sequence.
- `components/LoadingScreen.tsx` — progress overlay driven by a `kdc:loadprogress` custom event.
- `components/BookingClient.tsx` — booking tabs, item picker, scheduling, and WhatsApp summary.
- `components/CardFlip.tsx`, `components/WhatsAppButton.tsx`, `components/LanguageSwitcher.tsx`.
- `lib/i18n.tsx` — i18n provider/context (`useI18n`, `t()`).
- `lib/translations.ts` — `en` / `mr` / `hi` dictionaries of namespaced keys.
- `lib/service-data.ts` — categories, pricing items, time slots, and date helpers.
- `public/frames` / `public/frames-mobile` — hero sequence images.
- `lib/__tests__`, `app/__tests__`, `components/__tests__` — test suites.

## Scripts

- `npm run dev` — start the development server
- `npm run build` — build the production bundle
- `npm run start` — start the production server
- `npm run lint` — run ESLint
- `npm run test` — run the Vitest suite

## Notes

- Booking data lives entirely in the browser; confirmation opens a WhatsApp chat with a generated order summary.
- There is no backend and no order-tracking UI.
- Frame preloading performance is dominated by `public/frames`; the loader falls back after a timeout.

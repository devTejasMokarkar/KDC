# Rakesh Dry Cleaners

A Next.js 14 landing and booking experience for Rakesh Dry Cleaners (Nagpur), featuring a warm editorial hero, service discovery, and an in-page booking flow that sends requests via WhatsApp.

## Features

- **Hero** — immediate booking/pricing actions, an optimized opening image, and a progressively loaded 45-frame scroll animation. Reduced-motion visitors see the static image.
- **Services** — responsive flip cards reveal included items and service terms on desktop hover or a 400 ms mobile press-and-hold. Moving away ends the hover preview; touch holds keep details open. Swiping cancels the hold, and click/tap buttons remain available. Booking stays visible on both faces; Back and Escape restore the front. Reduced-motion visitors get an instant face change.
- **Guided booking** — Items → Pickup details → Review, with progress indicators, guarded navigation, and Back actions that preserve details. Catalog quantities persist locally; address, PIN, and instructions remain in memory only.
- **Editable cart** — direct quantity entry, plus/minus controls, undo removal, and a focus-managed clear-cart confirmation. Quantities stay between 0 and 99.
- **Wadi pickup** — home pickup requires an explicit Wadi locality, an allowed PIN, a successful area check, and an address. Changing the PIN/locality invalidates the check. Outside addresses can use shop drop-off.
- **Service information** — listed per-item/set estimates, separate pickup-charge disclosure, turnaround and minimum-order information. Unknown business values are shown as “Confirmed by the shop.”
- **Trust & contact** — stats, testimonials, fabric-care pillars, working hours, phone/email links, and a Google Maps embed modal.
- **WhatsApp floating button** — chat shortcut outside booking; hidden during booking to keep controls unobstructed.
- **Multilingual** — English / Marathi / Hindi UI, keyboard-operated language menu, and optional local preference storage.
- **Navigation & motion** — section-aware mobile selection, consistent anchor offsets, reduced-motion support, short reveal transitions, and focus-managed mobile/menu map dialogs. Order summaries scroll with the page.

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
- `components/SequenceCanvas.tsx` — hero copy, opening image, and progressive canvas animation.
- `components/BookingClient.tsx` — guided booking, Wadi eligibility, scheduling, cart recovery, and WhatsApp request.
- `components/QuantityControl.tsx` — shared accessible direct-entry quantity controls.
- `components/ServiceInformation.tsx` — common service terms.
- `lib/booking-policy.ts` — Wadi PIN allowlist, maximum quantity, and configurable business charges/timing.
- `app/redesign.css` — responsive visual refresh, service cards, and booking layout.
- `components/CardFlip.tsx` — service cards with accessible details and booking actions.
- `components/WhatsAppButton.tsx`, `components/LanguageSwitcher.tsx`.
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

- Booking data lives entirely in the browser; sending a request opens a WhatsApp chat with a generated order summary.
- There is no backend and no order-tracking UI.
- WhatsApp handoff sends a request; availability and final pricing are confirmed by the shop.
- The existing phone number, address, hours, reviews, and turnaround claims need business verification before public launch.

## Pickup policy and business details

`lib/booking-policy.ts` currently uses Wadi PIN **440023**, listed in the [government postal-office directory](https://rect.crpf.gov.in/Upload/Recruitment/ATTACHMENTS/29_1/1_2910216.pdf). The PIN also covers nearby localities, so the checker explicitly requires Wadi and rejects an outside-Wadi selection even with the same PIN. This is a customer-declared locality/PIN check, not geocoding or a server-side delivery guarantee; the shop confirms the exact address before accepting the request.

Pickup charges, minimum order, and category turnaround hours remain unset until the business supplies confirmed values. Set them in `BOOKING_POLICY`; a null pickup charge must never be presented as free. Estimates disclose that pickup/extra charges are confirmed separately. Item prices remain the existing catalog values.

## Washing methods and asset cleanup

Everyday clothes are washed by hand; heavy items such as blankets use professional industrial washing machines. The Fabric Care section explains both methods in English, Marathi, and Hindi and includes the supplied equipment image.

The hero uses 45 sampled frame IDs per viewport variant (90 images total). Unused frames, the unreferenced scroll hooks module, and the outdated README.prd were removed. The current README is the source of project documentation. Deleted tracked files remain recoverable from Git history.

The sixth service card, Home & Bedding, opens Wash → Home & Bedding directly and uses existing catalog prices. It retains the shared hover, hold, keyboard, and flip controls.

## Local brand identity

Main message: “Your neighbourhood garment-care shop in Wadi”. The English, Marathi and Hindi hero copy and page titles now reflect this local identity.

The website and editable SVG templates in `brand-kit/` share saffron `#FF9933`, ivory `#FAF8F3` and charcoal `#292522`. Open `brand-kit/index.html` to browse shop-board, garment-bag-panel and blank order-receipt designs. Final physical print dimensions and verified contact details can be supplied before production. Staff clothing is not included.

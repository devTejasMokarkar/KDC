# Public launch handoff

The code supports a local website with manually confirmed WhatsApp requests. It does not reserve slots, take payments, or store orders in a shop database.

## Business information you must supply

Edit `config/business.json`, or send the details so they can be entered for you:

- `phoneE164`: real shop phone, including country code, e.g. `+91` followed by the full number.
- `whatsappNumber`: real WhatsApp account, including country code, digits only. It may differ from the phone number.
- `address`: exact shop address and useful landmark.
- `openingHours`: confirmed days and opening/closing times, including any weekly closure.
- `email`: optional; leave `null` if you do not use a business email.
- `mapsUrl`: Google Maps link for the actual shop, not a general Wadi search.
- `mapsEmbedUrl`: optional Google Maps embed URL from Share → Embed a map. Without it, the embedded map remains unavailable; the Maps link still works.

Then set `businessDetailsConfirmed` to `true` only after checking those details. Sample phone numbers are deliberately rejected. Missing contacts do not become working call/WhatsApp links.

## Prices and pickup

1. Check all item prices in `lib/service-data.ts`, including sets and home textiles. Set `catalogPricesConfirmed` to `true` after verification.
2. Confirm Wadi pickup PINs in `lib/booking-policy.ts` (currently 440023), boundaries and how your staff will verify the address. Set `pickupCoverageConfirmed` to `true` afterwards.
3. Supply pickup charges, minimum order and turnaround hours if you want fixed values. These may stay `null`/unset if you intentionally confirm them with each customer; the website discloses that they are not included or guaranteed.
4. Confirm the selectable preferred times match your operating routine. Requests are not guaranteed appointments.

The unverified reviews, 4.8 rating, 12+ years claim, sample street address, email and opening hours have been removed. Add genuine reviews only with permission and evidence; none are required to launch.

## Hosting and domain

- Use Node.js **24.x** (recorded in `package.json` and `.nvmrc`). Node 18 is no longer suitable for this app.
- Configure the repository root as the app root. Build: `npm run build`; start on a Node host: `npm run start`. A Next.js-aware host handles starting automatically.
- Set `NEXT_PUBLIC_SITE_URL` to the final public HTTPS origin, without a path (see `.env.example`). This value is public, not a secret.
- Run `npm ci`, `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build`, `npm audit --omit=dev`, and `npm run check:launch` under Node 24. CI/build checks do not send WhatsApp messages.
- Deploy to a preview first. Connect the chosen domain, configure DNS and confirm HTTPS in the hosting account.
- Leave NEXT_PUBLIC_SITE_URL empty on preview hosts; Vercel preview builds also disable indexing automatically. Production indexing requires a valid site origin and all three confirmation flags above. Rebuild after changing public config/environment variables.

## Checks you must perform with the real business account

- On an actual Android phone and an iPhone if available, add items, check Wadi eligibility, choose preferred collection details and review totals.
- Open WhatsApp, review the message and **send a test request yourself**. Confirm the real shop account receives the correct items, address and preferred time.
- Test the Call action and exact Google Maps destination.
- Confirm pickup fee disclosures, drop-off instructions, hours and pricing with the shop team.
- Check the final public domain, HTTPS, mobile scrolling, all three languages and slow mobile data.
- Verify `/robots.txt`, `/sitemap.xml`, and `/privacy` on the production domain after rebuilding with confirmed details.
- Read `/privacy` and confirm it matches your hosting and business handling of received WhatsApp messages. It currently describes browser storage, session-only pickup details, Google services, and the WhatsApp handoff.

`npm run check:launch` fails deliberately until the required real details and confirmation flags are provided. Passing it does not replace the real-device and shop-account tests above.

## Dependency audit note

The verified install uses Next.js 16.4.2, React 19.3.1, Node 24, ESLint 9 (compatible with the Next.js lint plugins) and Vitest 5. The production-only audit reported zero known vulnerabilities at this check. The full audit still reports five high-severity development-only entries in the Next.js ESLint plugin → fast-glob → micromatch → braces chain. npm currently proposes an unsupported Next.js ESLint downgrade rather than a compatible fix; that downgrade was not applied. ESLint 9 is retained because the bundled Next.js React/import/accessibility plugins do not yet declare ESLint 10 support; installing 10 produced an invalid peer dependency tree. Migrate that development tooling once the plugin chain supports it. Keep the linting chain updated when a compatible patch is published. Do not interpret a clean production audit as a guarantee of total application security.

`.github/workflows/ci.yml` runs installation, lint, type checking, tests, production dependency audit and the build on GitHub after it is pushed. Its remote execution has not been verified locally; the individual commands are checked here.

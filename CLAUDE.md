# Doyle Cleaning Co — website (working notes for Claude Code)

Draft marketing site for **Doyle Cleaning Co**, a new owner-operated **commercial**
cleaning business (Adelaide / Brighton area). This file is the handoff context so a
fresh Claude Code session can continue seamlessly.

## What this is
- Static, multi-page site. No build step, no framework. Open `index.html` or serve the folder.
- Owner-operated by **Ashley** (client relationships, legal, finance; aged-care management
  background) and **Bradley** (training, standards, operations; hospitality background).
  Both are hands-on cleaners. Proudly **LGBTQI+ and neurodivergent-owned** family business.
- Services: **after-hours commercial cleaning** + **end-of-lease / vacate (make-good) cleaning**.
- Audience is Australian (en-AU); commercial/B2B (offices, medical, retail, warehouse, strata).

## Structure
- Pages: `index.html` (Home), `services.html`, `about.html`, `careers.html`,
  `faq.html`, `contact.html`, `login.html` (client-portal "coming soon").
- Shared assets in `assets/`: `styles.css`, `script.js` (nav + form + scroll-reveal),
  `chat.js` (rule-based FAQ chat widget, structured to later swap to a Grok/Claude API
  behind a serverless endpoint), `favicon.svg`, `fonts/fraunces-latin.woff2` (self-hosted).
- Header/footer are duplicated per page (static site). Edit them across all pages together
  (a small python/perl loop is the usual approach — see git history).

## Brand
- Colours: navy `#0e2a3d`, navy-dark `#091b28`, teal `#1fb6ac`, AA teal text `#0d6b64`.
- Logo: custom **counter-cut "D" monogram** (SVG, in every header/footer badge + favicon)
  + **serif "Doyle" + teal "Cleaning Co"** wordmark. Headings use self-hosted **Fraunces**.
- Full brand rationale + applications were produced as a separate brand book artifact.
- An editable **Adobe Express** version of the logo also exists (uses Adobe Fonts
  *Essonnes Headline* + *Acumin Pro* instead of Fraunces).

## Status: DRAFT — do NOT launch as-is
- Every page has `<meta name="robots" content="noindex, nofollow">` — **remove at launch**.
- Placeholders to fill: `[PHONE NUMBER]`, `[EMAIL ADDRESS]`, `[SERVICE AREA]`,
  `[OPERATING HOURS]`, `[CAREERS EMAIL]`, product brand names, real testimonials,
  founder photo (About "Our Story"), social profile URLs (footer icons are `#`).
- Contact form is front-end only (no backend) — wire to email/a form service before launch.
- **Trust/legal claims must be literally true before publishing** (insurance, police checks,
  WWCC, First Aid, NDAs, 24-hr quote + 100% re-clean promises). Australian Consumer Law.

## Outstanding / next ideas
- Capability statement PDF (one-pager for tenders).
- Site-wide light/dark toggle (a working one exists in the brand-book artifact).
- Extend the trust bar + testimonials to Services/About.
- Real photos of Ashley & Bradley (better than AI); or license Adobe Stock hero imagery.
- Product brands to advertise (recommendation given: Whiteley Viraclean, Agar, HEPA vacuums).
- Social/business setup: Google Business Profile (priority 1), LinkedIn, then FB/IG/TikTok.

## Preview locally
```bash
python3 -m http.server 8000   # then open http://localhost:8000
# or just double-click index.html
```

## Verify before committing UI changes
Render each page headless and check for horizontal overflow + console errors at
360/768/1280px widths (Chromium + playwright-core was used in the web sessions).
Keep reduced-motion and no-JS paths working (content must never be hidden by JS).

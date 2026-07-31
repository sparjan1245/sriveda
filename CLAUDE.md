# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## ⚠️ Not the Next.js you know

This project runs **Next.js 16** with React 19, which has breaking changes vs. training-data Next.js. Before writing routing/data-fetching code, check `node_modules/next/dist/docs/`. The one that will bite you immediately:

- **`middleware.ts` is gone — it's `proxy.ts` now.** Route protection lives in [src/proxy.ts](src/proxy.ts) (same `config.matcher` API, just renamed). Don't create a `middleware.ts` file expecting it to run.

## Commands

```bash
npm run dev          # starts on port 4000 (not 3000) via --webpack
npm run build         # runs `prisma generate` first, then next build
npm run lint          # eslint

npm run db:push       # prisma db push (dev schema sync, no migration file)
npm run db:migrate    # prisma migrate dev
npm run db:seed       # seeds admin user + base data (prisma/seed.ts)
npm run db:studio     # prisma studio
npm run generate:secrets   # generates NEXTAUTH_SECRET + ENCRYPTION_KEY into .env
```

There is no test runner configured in this repo.

Local setup: copy `.env.example` → `.env`, fill in `DATABASE_URL` (Supabase pooler URL, port 5432) and run `generate:secrets`, then `db:push` + `db:seed`. Default seeded admin: `vgcc@srivedagayatritemple.org` / `admin123!`.

## Architecture

This is a Next.js App Router site for a temple (Sri Veda Gayatri Temple) with public pages, a devotee dashboard, and an admin backend, backed by Postgres via Prisma.

### Route groups (`src/app`)
- Public marketing/info pages at the root (`/`, `/about`, `/events`, `/gallery`, `/services/[slug]`, `/calendar`, `/contact`).
- `/donate` and booking flows under `/services` lead to `/api/donations/checkout` and `/api/bookings/checkout`, then redirect to `/donation-success` / `/booking-success`.
- `/dashboard/*` — authenticated devotee area (bookings, donations, profile).
- `/admin/*` — ADMIN-only backend for managing every content type (services, events, gallery, banners, board members, donation tiers, panchangam, staff, site settings, reports).
- `/api/admin/*` mirrors admin pages; most other `/api/*` routes serve both public reads and authenticated writes for the same resources.
- Route access control is centralized in [src/proxy.ts](src/proxy.ts): `/dashboard/*` and `/admin/*` require a session, `/admin/*` additionally requires `role === "ADMIN"`. Individual API routes still re-check the role themselves (see pattern below) since proxy-level checks are optimistic only.

### Auth
[src/lib/auth.ts](src/lib/auth.ts) — NextAuth v5 (`beta`) with Prisma adapter, JWT sessions, Credentials (bcrypt) + Google providers. Role (`DEVOTEE | ADMIN | PRIEST | STAFF`) is stamped onto the JWT/session in the `jwt`/`session` callbacks and read back as `(session.user as { role?: string }).role` at call sites — there's no shared session-type augmentation, so every route re-declares this cast. Admin-gated API routes follow this exact pattern:
```ts
const session = await auth();
const role = (session?.user as { role?: string })?.role;
if (role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
```

### Database
[src/lib/db.ts](src/lib/db.ts) wraps `PrismaClient` with the `@prisma/adapter-pg` driver adapter over a `pg.Pool` (max 1 connection — sized for serverless), cached on `globalThis` for warm invocations. Always import `db` from `@/lib/db`, never instantiate `PrismaClient` directly.

Schema is in [prisma/schema.prisma](prisma/schema.prisma). Notable design choices:
- `Booking`/`Donation` support both authenticated users (`userId`) and guests (`guestEmail`/`guestToken`) — guest token is how unauthenticated users retrieve their own receipts.
- Both have `paymentGateway` + per-gateway ID columns (`stripePaymentId`, `paypalOrderId`, `squareOrderId`) since checkout can go through any of three gateways, and an `isAdminEntry` flag for cash/check entries recorded manually by staff.
- `receiptNumber` is generated via the `Counter` model (per-type atomic sequence) and formatted by `formatReceiptNumber()` in [src/lib/utils.ts](src/lib/utils.ts) as `VGCC/{DON|BKG}{YY}/{seq}`.
- `SiteSettings` is a singleton row (`id: "main"`) holding admin-configured gateway/email credentials.

### Payment gateways
Three interchangeable gateways — Stripe ([src/lib/stripe.ts](src/lib/stripe.ts)), PayPal ([src/lib/payments/paypal.ts](src/lib/payments/paypal.ts)), Square ([src/lib/payments/square.ts](src/lib/payments/square.ts)) — selected per-checkout by a `gateway` field in the request body (see [src/app/api/donations/checkout/route.ts](src/app/api/donations/checkout/route.ts) and the bookings equivalent). Each gateway module reads its own credentials from `SiteSettings` first (admin-configured via Admin → Settings, values encrypted at rest) and falls back to env vars only if nothing is stored in the DB — env vars exist mainly to bootstrap before an admin configures the DB-stored values. Stripe webhook signature verification is the one place that always requires the env var (`STRIPE_WEBHOOK_SECRET`), since it's a local HMAC check independent of the active key.

Secrets stored in `SiteSettings` (Stripe/PayPal/Square keys, Gmail SMTP creds) are encrypted with AES-256-GCM via [src/lib/encryption.ts](src/lib/encryption.ts), keyed by `ENCRYPTION_KEY`. **Never rotate `ENCRYPTION_KEY` after data exists** — it silently breaks decryption of every stored credential (`decrypt()` swallows errors and returns `""`).

### Email
[src/lib/email.ts](src/lib/email.ts) sends transactional email (booking/donation confirmations with PDF receipts) via Gmail SMTP using nodemailer, with credentials pulled from `SiteSettings` the same way as payment gateways. PDF receipts are rendered server-side with `@react-pdf/renderer` from components in [src/components/pdf/](src/components/pdf/).

### Node-only packages
`@react-pdf/renderer`, `nodemailer`, and `canvas` are listed in `serverExternalPackages` in [next.config.ts](next.config.ts) because they use native bindings / Node APIs (`net`, `tls`) incompatible with the edge runtime — don't import them from code that might run on the edge.

### Admin list pages
The ~10 admin list pages (`/admin/staff`, `/services`, `/messages`, `/gallery`, `/events`, `/donations`, `/donation-tiers`, `/devotees`, `/bookings`, `/announcements`) all share one convention: `parseListParams()` in [src/lib/list-query.ts](src/lib/list-query.ts) reads `page`/`q`/`sort`/`dir`/`filter` from `searchParams` and returns `{ skip, take, sortBy, sortDir, ... }` ready to spread into a Prisma `findMany`. When adding a new admin list page, follow this pattern rather than hand-rolling pagination.

### UI
Tailwind v4 + shadcn-style primitives wrapping Radix UI in [src/components/ui/](src/components/ui/). `cn()` in [src/lib/utils.ts](src/lib/utils.ts) is the standard `clsx` + `tailwind-merge` helper used throughout for conditional class composition.

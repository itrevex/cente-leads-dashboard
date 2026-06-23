# Cente Leads — Dashboard

The bank-staff-facing web dashboard for Centenary Bank's cooperative-agent-led
loan-lead origination system (Astro + React, SSR). See the
[planning repo](../planning) for the architecture and ADRs, and
[cente-leads-backend](../cente-leads-backend) for the Django/DRF API this
talks to.

Built fresh against the real API contract — the visual design in
`../prototypes/dashboard-src` was used as a reference only, not extended,
since it's a demo shell (hardcoded persona switcher, mock data, no real
routing/auth) not meant to carry into production code.

## Architecture

- **SSR, not static** (`output: "server"`, `@astrojs/node` adapter) — needed
  because auth is enforced server-side in `src/middleware.ts` on every
  request, not client-side after the fact.
- **Auth**: phone+password login against `POST /auth/login/`, optionally
  followed by an OTP step (`POST /auth/otp/verify/`) depending on the
  backend's `REQUIRE_OTP_2FA` setting (ADR-0031) — the login form adapts to
  whichever response shape the backend actually returns, no separate
  frontend toggle. On success, the JWT pair is stored in an httpOnly,
  `SameSite=Strict` cookie (`src/lib/session.ts`) — never exposed to page
  JS. `src/middleware.ts` reads that cookie on every request, refreshes the
  access token when it's close to expiry, resolves the current user via
  `GET /users/me/`, and redirects to `/login` if anything fails.
- **Nav/role gating**: `src/lib/nav.ts` derives the visible nav items from
  `Astro.locals.user.role`, mirroring the real permission grants in the
  backend's `apps.roles` app (ADR-0009) — not a hardcoded persona list.
- **Styling**: `src/styles/tokens.css` is a verbatim copy of the prototype's
  design-token system (Centenary Bank's brand colors/type/spacing as CSS
  variables) — the one piece of the prototype carried over directly, since
  it's already framework-agnostic CSS.

## First-time setup

1. `npm install`
2. `cp .env.example .env` and adjust `API_BASE_URL` if the backend isn't on
   `http://localhost:8000`.
3. Make sure `cente-leads-backend` is running locally with
   `CORS_ALLOWED_ORIGINS=http://localhost:4321` in its `.env` (already the
   dev default).
4. `npm run dev` — dashboard runs at `http://localhost:4321`.

For local login without a working SMS backend, set `REQUIRE_OTP_2FA=False`
in the **backend's** `.env` (never in staging/prod).

## Commands

| Command                | Action                                    |
| :--------------------- | :---------------------------------------- |
| `npm run dev`          | Local dev server                          |
| `npm run build`        | Production build to `./dist/`             |
| `npm run check`        | Astro/TypeScript diagnostics              |
| `npm run lint`         | ESLint                                    |
| `npm run format`       | Prettier (writes)                         |
| `npm run format:check` | Prettier (check only, used in pre-commit) |
| `npm test`             | Vitest                                    |

A Husky pre-commit hook (`.husky/pre-commit`) runs format-check, lint,
`astro check`, and the test suite — mirrors the verification gate already
used in `cente-leads-backend`.

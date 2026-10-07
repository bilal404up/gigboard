# Audit of Gigboard (sample marketplace)

Scope: a Next.js 14, Supabase and Stripe test-mode sample app that I did not write from scratch. The base code came from a teammate. This write-up covers what I found, how I proved it, and what I changed. Git tags: `audit-before` is the starting point, and the fixes are the commit after it.

Method: read the API routes and `supabase/schema.sql`, ran the app locally with dummy credentials, and probed endpoints with curl. All tests are in `tests/audit.test.ts` (`npx tsx --test tests/audit.test.ts`).

## Findings

### 1. Cron endpoints accept "Bearer undefined" (fixed, proven)

- Where: `app/api/cron/{auto-complete-orders,clear-funds,expire-custom-offers,update-seller-levels}/route.ts`
- Problem: the check was ``auth !== `Bearer ${process.env.CRON_SECRET}` ``. If `CRON_SECRET` is not set, the right side becomes the text `Bearer undefined`, and a request with that header passes.
- Proof: with no `CRON_SECRET`, `curl -H "Authorization: Bearer undefined" /api/cron/clear-funds` returned `200 {"cleared":0}`. With no header it returned 401.
- Impact: whoever knows the routes could trigger fund clearing and order auto-completion on a deployment where the variable was never set.
- Fix: `lib/security/cron-auth.ts`. An unset, empty or literal "undefined" secret never matches, and the comparison is constant time.
- Test: 4 route-level tests (one per route) that fail on the original code.

### 2. Open redirect in the sign-in callback (fixed, proven at URL level)

- Where: `app/api/auth/callback/route.ts`
- Problem: the `next` query parameter was appended to the origin with no check: `${origin}${next}`.
- Proof: `new URL("http://localhost:3000" + "@evil.example").host` is `evil.example`. So `?next=@evil.example` sends the user to another host. A leading `//` does not work here, because the origin prefix is kept, so that case is not exploitable.
- Not proven end to end: the redirect only runs after a successful code exchange, which needs a real Supabase project.
- Fix: `lib/security/safe-next.ts` accepts only same-site paths and falls back to `/dashboard`.
- Test: `safeNextPath` is tested against 7 hostile values and 3 good ones. The route itself has no test, so the wiring is checked by reading the diff only.

### 3. Stripe webhook silently succeeds when the secret is missing (fixed, proven)

- Where: `app/api/payments/webhook/route.ts`
- Problem: with no `STRIPE_WEBHOOK_SECRET` the handler returned `200 {"demoMode":true}` and did nothing.
- Correction to my first reading: this does NOT let someone forge a payment. With no secret the handler never processes the event. The real risk is reliability. In production, real payments would be acknowledged but orders would stay `pending_payment`, and Stripe would not retry because it got a 200.
- Proof: POST without a secret returned `200 demoMode`.
- Fix: in production a missing secret now returns 500 and logs an error. Outside production the demo fallback is unchanged.
- Test: production returns 500, development still returns 200.

### 4. `public.users` is readable by everyone, including email and admin flag (NOT fixed, not proven)

- Where: `supabase/schema.sql`, policy `"Public profiles viewable" ON public.users FOR SELECT USING (TRUE)`.
- Problem: row-level security filters rows, not columns. The table has `email` and `is_admin`, and there is no column-level revoke, so anyone with the public anon key can likely read them through the Supabase REST API.
- Status: found by reading only. I had no Postgres available to prove it.
- Why not fixed: the app runs `select("*")` on `users` in 7 places, so a quick column revoke would break pages. A safe fix needs a `public_profiles` view for the public fields, the 7 queries moved to it, and a test against a real Supabase project.
- Proposed fix: create a view with `id, username, full_name, avatar_url, bio, country, languages, is_seller`, restrict the table policy to the owner and admins, and update the queries.

## Checked and fine

- `orders`, `messages`, `conversations`, `notifications` and `withdrawals` policies limit access to participants or the owner.
- The Stripe webhook verifies the signature with `constructEvent` when a secret is set.
- No keys are committed. The only match was the fallback string `sk_test_placeholder`.

## Not covered

No load or dependency audit, no review of the client-side components, and finding 4 is unproven and unfixed.

# ReferTrust — V1 MVP

Get referred, not ignored. Employees post referral slots at their company;
seekers get a "For You" feed and tap **Request Referral**, then chat.

- **Stack:** Next.js 14 (App Router) · TypeScript · Tailwind · Supabase (DB, Auth, Realtime)
- **V1 loop:** Sign up (work email) → Post referral (3 fields) → Request referral → Chat
- **V2 is coded but hidden.** Flip `SHOW_V2_FEATURES` in `src/lib/featureFlags.ts` to `true` to surface it.

---

## Deploy from an iPhone, zero budget

You need three free accounts: **GitHub**, **Supabase**, **Vercel**. All work in
mobile Safari. Order matters — do Supabase before Vercel.

### 1. Put the code on GitHub
The realistic way to get a whole project onto GitHub from a phone: on a laptop
once, or use the GitHub mobile web upload.
1. Create a new repo on github.com (name it `refertrust`).
2. Upload the contents of this folder to the repo (drag the files in via
   github.com "Add file → Upload files", or `git push` from any machine).

### 2. Set up Supabase (the database)
1. supabase.com → **New project**. Pick the free plan and a region close to India
   (Singapore / Mumbai). Save the DB password somewhere.
2. Open **SQL Editor → New query**. Paste all of `supabase/schema.sql`, hit **Run**.
3. New query again. Paste `supabase/seed.sql`, hit **Run**. (If the `auth.users`
   block errors on your Supabase version, delete just that block and re-run — the
   companies still load; you'll test with 2 real signups instead.)
4. **Project Settings → API.** Copy three values:
   - Project URL
   - `anon` public key
   - `service_role` key (secret — only used by `/admin/status`)
5. **Authentication → URL Configuration.** Set Site URL to your Vercel URL once
   you have it (step 3), and add `https://YOUR-APP.vercel.app/auth/callback` to
   Redirect URLs. For local testing add `http://localhost:3000/auth/callback`.

### 3. Deploy on Vercel
1. vercel.com → **Add New → Project** → import your GitHub repo.
2. Framework preset auto-detects Next.js. Before deploying, add **Environment
   Variables** (copy from `.env.example`):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_SITE_URL` → your Vercel URL, e.g. `https://refertrust.vercel.app`
3. Deploy. Then go back to Supabase (step 2.5) and set the Site URL + redirect URL
   to that Vercel domain. Redeploy if you changed `NEXT_PUBLIC_SITE_URL`.

### 4. Test the loop
1. Open the site → **Get started** → sign in with a **work email** (not gmail).
   Check inbox, tap the magic link on the same phone.
2. Fill onboarding (or skip). You land on **For You** with the 15 seeded referrals.
3. Tap **Request Referral** on any card → you're dropped into a chat.
4. Tap **+ Post Referral**, add a title + your company's careers URL + slots → posts
   in under 30 seconds.

> **Magic-link emails:** Supabase's built-in email is rate-limited and fine for
> testing. For real volume, add a free SMTP provider (e.g. Resend) under
> Authentication → Email settings. No code change needed.

---

## Run locally
```bash
npm install
cp .env.example .env.local   # fill in your Supabase values
npm run dev                  # http://localhost:3000
```

## Where things live
```
src/lib/featureFlags.ts   # SHOW_V2_FEATURES = false  (flip after launch)
src/lib/rankFeed.ts       # "For You" ranking (skills + location + trust)
src/lib/trustScore.ts     # trust model + -50 fake-report penalty
src/lib/validateJd.ts     # free JD-authenticity heuristic (swap for AI later)
src/app/feed              # For You feed + loading skeleton
src/app/post              # 3-field post flow
src/app/chat/[id]         # realtime chat
src/app/admin/status      # free-tier usage meters (warns at 90%)
supabase/schema.sql       # V1 live + V2 tables ready (no V1 UI)
supabase/seed.sql         # 20 companies + 6 demo posters + 15 referrals
```

## Turning on V2 later (target: ~1 day)
V2 tables (`interview_feedback`, `referral_tracking`, `user_badges`) already exist
and are locked by RLS. To ship a V2 feature:
1. Set `SHOW_V2_FEATURES = true` (or flip one flag in the `FEATURES` object).
2. Add RLS policies for the V2 table(s) you're exposing.
3. Build the screen — the data model and access rules are already there.

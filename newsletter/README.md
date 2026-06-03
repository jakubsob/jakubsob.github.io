# Self-owned newsletter

A newsletter you fully own: your subscriber list, your templates, and your
logic all live in your own files and code. The email provider is treated as a
swappable "dumb pipe" that only delivers mail — it sits behind a single adapter
and can be replaced in ~30 lines.

> **Current provider: Brevo.** It's the one implementation wired up today. See
> [Email provider](#email-provider) for its limitations and how to switch.

---

## The 60-second version

**What it does**

- A visitor enters their email in a form on the site.
- They get a "please confirm" email (double opt-in). Nothing happens until they
  click it.
- Once confirmed, they get a welcome / lead-magnet email.
- When you publish a blog post, every confirmed subscriber is emailed a short
  teaser with a link to read the full article.
- Every email has a one-click unsubscribe link.

**Where the pieces live**

```
   Visitor's browser
        │  (subscribe form)
        ▼
  Cloudflare Worker  ──────────►  Email provider  (sends the email)
   /subscribe                      ▲   (adapter → currently Brevo)
   /confirm                        │
   /unsubscribe                    │
        │                          │
        ▼                          │
  Private GitHub repo              │
   subscribers.ndjson              │
   queue.ndjson         GitHub Actions (daily)
   campaigns.ndjson      enqueue + drain ──► provider
```

- **Cloudflare Worker** = the public web endpoints (sign up, confirm,
  unsubscribe). Always-on, free.
- **Private GitHub repo** = your database. Plain text files, versioned by Git.
- **GitHub Actions** = the scheduled jobs that send the actual newsletter.
- **Email provider** = the delivery service, reached only through the adapter.
  The only rented part, and the only part you'd swap.

**The one number to remember:** your provider's daily send cap. With the current
provider (Brevo free) that's **300 emails/day** — everything is designed around
whatever this number is.

---

## Setup (one time)

You'll touch four services: GitHub, Cloudflare, your email provider, and your
site's build env. Budget ~30 minutes.

### 1. Create the private data repo

Make an **empty private** GitHub repo, e.g. `jakubsob/newsletter-data`. This is
where your subscriber list lives. It must be private so emails aren't public.
The files are created automatically on first write — don't seed anything.

### 2. Create a GitHub token for that repo

One **fine-grained** Personal Access Token, used by both the Worker and the
Actions:

1. <https://github.com/settings/personal-access-tokens/new>
2. Name `newsletter-data`, pick an expiration.
3. **Resource owner**: you. **Repository access** → **Only select
   repositories** → `newsletter-data`.
4. **Permissions** → **Repository permissions** → **Contents: Read and write**.
   (Metadata: Read-only is added automatically.) Nothing else.
5. Generate and copy the `github_pat_…` value (shown once).

> This is separate from `PRIVATE_GITHUB_TOKEN` in the site's `.env` (which is
> only for public-API rate limits). Keep this one secret — it can write your
> list.

### 3. Set up your email provider

The provider is selected by `MAIL_PROVIDER` and reached through one adapter, so
these steps are provider-specific. **For the current provider, Brevo:**

1. Create a Brevo account.
2. **Authenticate your sending domain** (Senders, Domains & Dedicated IPs →
   Domains). Add the SPF/DKIM DNS records it gives you. Required for
   deliverability and to send from `newsletter@jakubsobolewski.com`.
3. Create a **transactional API key** (SMTP & API → API Keys).
4. **Turn OFF "Authorised IPs"** (Security → Authorised IPs). GitHub Actions
   runners use rotating IPs, so IP pinning will break the daily send.

A different provider would have its own equivalents (verified sender, API key);
see [Email provider](#email-provider).

### 4. Deploy the Worker

From `newsletter/worker/` (needs a free Cloudflare account):

```bash
cd newsletter/worker
pnpm install
npx wrangler login

# Edit wrangler.toml [vars]: DATA_REPO, MAIL_FROM_EMAIL, MAIL_REPLY_TO,
# ALLOWED_ORIGINS. Leave WORKER_PUBLIC_URL as a placeholder for now.

npx wrangler secret put GITHUB_TOKEN     # the data-repo PAT (step 2)
npx wrangler secret put BREVO_API_KEY    # the provider key (step 3)
npx wrangler deploy                      # prints the live workers.dev URL
```

First deploy may ask you to claim a **workers.dev subdomain** (one-time,
account-wide — use your username). Your Worker URL becomes
`https://<worker-name>.<subdomain>.workers.dev`.

**Then fix the self-reference:** the Worker builds confirm/unsubscribe links
from `WORKER_PUBLIC_URL`, so paste the deployed URL into `wrangler.toml` and
deploy once more:

```bash
# wrangler.toml → WORKER_PUBLIC_URL = "https://...workers.dev"
npx wrangler deploy
```

Smoke-test it (sends a real opt-in email):

```bash
curl -X POST https://<your-worker-url>/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com","tags":["blog"]}'   # -> {"ok":true}
npx wrangler tail                                     # watch live logs
```

### 5. Point the site form at the Worker

Set `PUBLIC_NEWSLETTER_API` to the Worker URL in the site's build env (`.env`
locally; the repo/Pages env for production), then rebuild. The form also has the
deployed URL hard-coded as a fallback.

### 6. Add the Action secrets

The enqueue/drain workflows read all non-secret config from `wrangler.toml`, so
you only set two secrets. Repo → Settings → Secrets and variables → Actions →
**Secrets**:

- `NEWSLETTER_DATA_TOKEN` — the same data-repo PAT from step 2.
- `BREVO_API_KEY` — the provider key from step 3 (rename if you switch
  providers — see [Email provider](#email-provider)).

### 7. (Recommended) Turn on bot protection

See [Security → Turnstile](#turnstile-bot-protection). Until you do, the Worker
runs without challenge verification, which is fine for testing.

---

## Sending a newsletter

1. **Publish a post** as usual; the site deploys and the RSS feed updates.
2. **enqueue** runs automatically after a successful deploy (or trigger
   `Newsletter — enqueue on publish` in the Actions tab, optionally with a
   `slug`). It records the campaign and queues every confirmed subscriber.
3. **drain** runs daily at 08:00 UTC, sending up to `DAILY_BUDGET` (80) emails
   and marking each `sent` immediately. Run it manually to send sooner.

**Broadcasts are teasers.** The email contains the post's intro (everything
before the first heading) plus a "Read the full article" link — not the whole
post. This keeps emails small and dodges email-client issues with code blocks
and Gmail's ~102 KB clipping.

**The budget math.** `DAILY_BUDGET` (80) should sit below your provider's daily
cap, leaving room for opt-in/lead-magnet emails (which also use the quota). With
Brevo free (300/day) that's comfortable. A list of N takes `ceil(N / budget)`
days to deliver one issue. 200 subscribers ≈ 3 days.

### Test a send without publishing

The scripts can target any already-published post via the live RSS feed. Set up
local secrets once, then use the `task` commands:

```bash
cp newsletter/.env.example newsletter/.env   # fill in the 2 secrets
task newsletter:test                          # newest post: enqueue + drain
task newsletter:test -- some-post-slug        # a specific post
task newsletter:enqueue                       # enqueue only
task newsletter:drain                         # send only
```

> `drain` sends to **all confirmed** subscribers — run it while only your test
> addresses are confirmed. It is also idempotent: to re-send the same post to
> yourself, delete that post's lines from `campaigns.ndjson` and `queue.ndjson`
> in the data repo, then re-run.

### Preview the email templates

```bash
task newsletter:preview      # or: pnpm dev
# open http://localhost:4321/dev/emails
```

A dev-only route renders every email variant with sample data and hot-reloads
as you edit `lib/templates.js`. It's gated out of the production build.

---

## Architecture (in detail)

### Files

| Path | Role |
|---|---|
| `lib/github.js` | GitHub Contents API read/write (sha-based optimistic concurrency) |
| `lib/store.js` | ndjson subscriber + queue store on top of `github.js`, with conflict-retry |
| `lib/rss.js` | Parse the site's RSS feed; entity-decode the post body |
| `lib/excerpt.js` | Extract the article intro (everything before the first heading) |
| `lib/templates.js` | confirm / lead-magnet / broadcast HTML (light-mode brand) |
| `lib/adapter.js` | `sendEmail()` — provider switch; the one provider-specific seam |
| `lib/turnstile.js` | Cloudflare Turnstile token verification (fails closed) |
| `lib/tokens.js` | Email validation + URL-safe random tokens |
| `lib/config.js` | Site URL/name + lead-magnet tag→file mapping |
| `worker/` | Cloudflare Worker: `/subscribe`, `/confirm`, `/unsubscribe` |
| `scripts/enqueue.js` | Build a campaign from RSS, queue confirmed subscribers |
| `scripts/drain.js` | Daily send up to budget, mark sent, retry/give up |
| `scripts/_env.js` | Load non-secret config from `wrangler.toml` for the scripts |

Everything in `lib/` uses only global `fetch` + Web Crypto, so the exact same
modules run in the Worker (a V8 isolate) and in the Actions (Node 20).

### The data store

Three newline-delimited JSON files in the private repo — one record per line,
easy to append, diff, and audit through Git history:

```
subscribers.ndjson   status: pending → confirmed → unsubscribed
queue.ndjson         status: pending → sent | skipped | failed | error
campaigns.ndjson     one per post; carries the title, url, and intro excerpt
```

A subscriber record:

```json
{"email":"a@b.com","status":"confirmed","tags":["roadmap"],
 "subscribed_at":"…","confirmed_at":"…",
 "confirm_token":"…","unsubscribe_token":"…","source":"blog-form"}
```

You only ever send broadcasts to `confirmed`. `tags` records which lead magnet /
interest the signup came from. The two tokens are unguessable 32-byte values
used to authorize the confirm and unsubscribe links.

### Request flows

**Sign up** — `POST /subscribe {email, tags, token}`:

1. Verify the Turnstile token (if a secret is configured).
2. Validate the email.
3. If already confirmed → return `{ok:true}` silently (no re-send).
4. Otherwise append a `pending` record and send the double-opt-in email.

**Confirm** — `GET /confirm?token=…`:

1. Flip the matching record `pending → confirmed`.
2. Send the lead-magnet / welcome email (chosen by the subscriber's tags).
3. Redirect to `/newsletter/confirmed`. Bad token → `/newsletter/error`.

**Unsubscribe** — `GET /unsubscribe?token=…`:

1. Flip the matching record to `unsubscribed`.
2. Redirect to `/newsletter/unsubscribed`. This is your suppression mechanism.

**Publish → enqueue** (GitHub Actions): fetch the RSS feed → build a campaign
(`id` = `YYYY-MM-DD-slug`, with the extracted intro) → append one `pending`
queue entry per confirmed subscriber. Idempotent: re-running won't duplicate a
campaign or re-queue an address.

**Daily → drain** (GitHub Actions): read the queue; for each pending entry up to
the budget, re-check the subscriber is still `confirmed`, render the broadcast,
send through the adapter, and mark the entry `sent` **immediately** (committed
per email, so a mid-run crash never double-sends). Failures bump `attempts`;
after 3 the entry is marked `failed`.

### Where each request goes

| Action | Runs on | Calls |
|---|---|---|
| `/subscribe` (new) | Worker | Turnstile verify, 3 GitHub (2 read + 1 write), 1 provider send |
| `/confirm` | Worker | 2 GitHub (read + write), 1 provider send |
| `/unsubscribe` | Worker | 2 GitHub (read + write) |
| `enqueue` | Actions | 1 RSS fetch, ~5 GitHub |
| `drain` (B emails) | Actions | 3 GitHub up front + 3 per email (1 provider send + read + write) |

The queue and its draining run entirely on **GitHub Actions**, not on
Cloudflare — they don't consume any Worker quota.

---

## Email provider

The provider is a dumb send pipe behind a single adapter. `lib/adapter.js`
exposes one function — `sendEmail(env, {to, subject, html})` — with one
implementation per provider, chosen at runtime by `MAIL_PROVIDER`. Every
transactional provider takes the same `from / to / subject / html` shape, so
each implementation is tiny and **nothing else in the system references a
provider**.

### Switching providers

1. Add a `sendViaX(...)` function in `lib/adapter.js`.
2. Register it in the `PROVIDERS` map.
3. Set `MAIL_PROVIDER=x` (in `wrangler.toml`) and add the new API key as a
   secret (and update the secret name referenced in `lib/adapter.js` and the
   drain workflow if it differs from `BREVO_API_KEY`).

That's the whole change — the logic, templates, queue, and storage are
untouched.

### Current provider: Brevo, and its limitations

Brevo is the only implementation wired up today. On its **free** tier:

- **300 transactional emails/day.** The binding constraint for the whole system
  — confirmations, lead magnets, *and* broadcasts all count against it. This is
  why sends are queued and drained with a daily budget.
- **Sending domain must be authenticated** (SPF/DKIM) before Brevo will deliver;
  otherwise sends are rejected as "sender not valid."
- **"Authorised IPs" must be off** for the daily job, because GitHub Actions
  runners use rotating IPs (an enabled allowlist returns `401 unrecognised IP`).
- **Branding/terms** on the free tier can change — verify current limits and
  any footer/branding on Brevo's pricing page.

When you outgrow the daily cap (past a few hundred subscribers), the usual move
is **Amazon SES** (~$0.10 per 1,000 emails, no daily cap) — implemented as
another adapter case. That swap is the only change needed.

---

## Limits & scaling

Four ceilings, in the order you'll actually hit them:

**1. Email provider send cap — provider-specific.** With the current provider
(Brevo free) it's **300 emails/day**, and it's the binding constraint. Mitigated
by the queue + daily budget. Raise it with a paid plan, or switch the adapter to
a provider without a daily cap (e.g. Amazon SES). See
[Email provider](#email-provider).

**2. GitHub Contents API — ~1 MB per file → ~4,000 subscribers.** ⚠️ The first
*structural* wall. `getFile`/`putFile` use the Contents API, which only handles
inline file content up to 1 MB. At ~250 bytes/subscriber that's roughly 4k
subscribers before reads fail. Past that, migrate the store (Cloudflare D1 is
the natural fit since you're already on Workers, or shard the file).

**3. GitHub REST rate limit — 5,000 requests/hour** (per token, shared by the
Worker and Actions). Organic traffic is nowhere near this. Watch the secondary
write limit (~80 content-writes/minute) only if you raise the budget into the
hundreds and loop tightly; provider round-trips naturally pace the default 80.

**4. Cloudflare Workers (free tier).** Effectively irrelevant at this scale:
100,000 requests/day (organic signups are dozens), 10 ms CPU per invocation, 50
subrequests per request (you use 2–4), 128 MB memory. CPU/memory grow with the
subscriber file size, but limit #2 stops you first.

**GitHub Actions minutes** are free/unlimited because the workflows run in the
public blog repo.

**Bottom line:** for a few hundred to a few thousand subscribers, the provider's
daily cap is the only limit you'll feel. The first time you'd re-architect is
around ~4k subscribers (the GitHub file limit), not because of Cloudflare.

---

## Security

- **Double opt-in.** Broadcasts only ever go to `confirmed` subscribers, and
  `drain` re-checks consent at send time.
- **Unguessable tokens.** Confirm/unsubscribe links use 32-byte random tokens
  stored per subscriber, so they can't be brute-forced.
- **Bot protection (Turnstile).** See below.
- **CORS.** `/subscribe` only accepts browser POSTs from `ALLOWED_ORIGINS`.
- **No leaks.** The Worker never returns internal errors to the caller; it logs
  them and returns a generic message / error redirect.
- **Least-privilege token.** The GitHub PAT is scoped to the single data repo,
  Contents read/write only.
- **Secrets stay server-side.** API keys live as Worker secrets / Actions
  secrets. The only values the public site build sees are
  `PUBLIC_NEWSLETTER_API` and `PUBLIC_TURNSTILE_SITEKEY` (both safe to expose).

### Turnstile (bot protection)

Because each `/subscribe` sends a real confirmation email, junk signups cost
provider quota and sending reputation. The form is protected by **Turnstile**,
Cloudflare's free CAPTCHA, verified server-side.

1. Cloudflare dashboard → **Turnstile** → add a widget. For **Hostnames** add
   where the form renders — `jakubsobolewski.com` (and `www.` / `localhost` if
   you use them). *Not* the workers.dev URL. The widget gives you two values: a
   **Site Key** (public) and a **Secret Key** (private). They go to two
   different places:
2. **Site Key** → the **site build env** as `PUBLIC_TURNSTILE_SITEKEY` (root
   `.env` locally, Pages/Actions build env in prod). It's embedded in the page,
   so it's meant to be public.
3. **Secret Key** → a **Worker secret** as `TURNSTILE_SECRET`
   (`newsletter/worker/.dev.vars` locally; `npx wrangler secret put
   TURNSTILE_SECRET` in prod). It must never reach the browser.

Behavior is safe by configuration:

- **Secret set** (production) → token required and verified; failures get 403.
- **Secret unset** (local dev) → verification skipped so the flow still works.
  For local testing of the real path, use Cloudflare's test keys (sitekey
  `1x00000000000000000000AA`, secret `1x0000000000000000000000000000000AA`).

The verifier fails closed: a missing token, non-OK response, or network error
all deny the request.

---

## Configuration reference

### Non-secret config — `worker/wrangler.toml` `[vars]`

Single source of truth, read by the Worker *and* (via `scripts/_env.js`) the
enqueue/drain scripts:

| Var | Meaning |
|---|---|
| `DATA_REPO` | `owner/name` of the private data repo |
| `DATA_BRANCH` | usually `main` |
| `MAIL_PROVIDER` | which adapter implementation to use (`brevo` today) |
| `MAIL_FROM_NAME` / `MAIL_FROM_EMAIL` | sender identity (must be verified with the provider) |
| `MAIL_REPLY_TO` | reply address |
| `SITE_URL` | used for confirm/unsub redirect targets and links |
| `WORKER_PUBLIC_URL` | the Worker's own URL (builds confirm/unsub links) |
| `ALLOWED_ORIGINS` | comma-separated origins allowed to POST `/subscribe` |

### Credentials — what goes where

There are **three** homes for credentials. Each has a gitignored local file you
copy from a tracked `*.example`:

| Home | Local file (gitignored) | Copy from | Production |
|---|---|---|---|
| Site build env (`PUBLIC_*`) | `.env` (repo root) | `.env.example` | Pages/Actions build env |
| Worker secrets | `newsletter/worker/.dev.vars` | `.dev.vars.example` | `npx wrangler secret put <NAME>` |
| Script secrets | `newsletter/.env` | `newsletter/.env.example` | GitHub **Actions** secrets |

And here is every credential mapped to its home(s) and exact variable name:

| Credential | Home | Variable | Public? |
|---|---|---|---|
| Data-repo PAT | Worker secret | `GITHUB_TOKEN` | no |
| Data-repo PAT | Script secret / Actions | `GITHUB_TOKEN` (local) → `NEWSLETTER_DATA_TOKEN` (Actions secret) | no |
| Provider API key (Brevo) | Worker secret | `BREVO_API_KEY` | no |
| Provider API key (Brevo) | Script secret / Actions | `BREVO_API_KEY` | no |
| Turnstile **Site Key** | Site build env | `PUBLIC_TURNSTILE_SITEKEY` | **yes** |
| Turnstile **Secret Key** | Worker secret | `TURNSTILE_SECRET` | no |
| Worker base URL | Site build env | `PUBLIC_NEWSLETTER_API` | **yes** |

Key points:

- The **same data-repo PAT** value is reused in three spots (Worker secret,
  local `newsletter/.env`, and the `NEWSLETTER_DATA_TOKEN` Actions secret).
- The **same provider key** is reused in two (Worker + scripts/Actions).
- The **Turnstile pair is split**: the Site Key is public and lives with the
  site; the Secret Key is private and lives with the Worker. Never swap them.
- If you change email providers, the `BREVO_API_KEY` name changes to that
  provider's key (update `lib/adapter.js` and the drain workflow too).

### Tunable knobs

| Knob | Where | Default |
|---|---|---|
| `DAILY_BUDGET` | drain env | 80 |
| `MAX_ATTEMPTS` | drain env | 3 |
| `CAMPAIGN_SLUG` | enqueue env / `task … -- slug` | newest post |
| Lead magnets (tag → file) | `lib/config.js` `LEAD_MAGNETS` | roadmap, default |
| Excerpt length | `lib/excerpt.js` `maxBlocks` | 8 blocks |
| Drain schedule | `.github/workflows/newsletter-drain.yml` cron | 08:00 UTC |

Lead-magnet files are served from `public/downloads/` (e.g.
`r-testing-roadmap.pdf`) or a GitHub Release asset.

---

## Operations & troubleshooting

| Symptom | Cause / fix |
|---|---|
| No confirmation email arrives | Check the address spelling; check the provider's send logs; verify the sending domain; check spam. |
| `401 … unrecognised IP` from the provider | Provider (Brevo): turn **off** "Authorised IPs" — CI uses rotating IPs. |
| `Sending rejected … sender not valid` | Provider (Brevo): authenticate the sending domain (SPF/DKIM), or use a verified sender. |
| Re-running enqueue does nothing new | It's idempotent. Delete the campaign's line from `campaigns.ndjson` and its `queue.ndjson` entries, then re-run. |
| Want to re-send a post to yourself | Same as above — reset the queue entry to `pending`/`attempts:0` or delete it. |
| A subscriber emails asking to be removed | Edit `subscribers.ndjson`, set their `status` to `unsubscribed`. |
| Confirm/unsub link shows the error page | Token expired/invalid/already used; subscribe again. |

Useful commands:

```bash
npx wrangler tail                      # live Worker logs (from worker/)
# read the live list (needs the data-repo token):
curl -s -H "Authorization: Bearer $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.raw" \
  "https://api.github.com/repos/jakubsob/newsletter-data/contents/subscribers.ndjson"
```

---

## Testing

```bash
pnpm exec vitest run newsletter        # unit tests for the lib + scripts
```

Coverage includes the store (with mocked GitHub, incl. conflict-retry), the
send adapter, templates, the RSS parser + entity decoding, excerpt extraction,
the wrangler-vars loader, tokens, and Turnstile verification.

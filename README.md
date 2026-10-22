# Sorted

**Find Indians who've actually been there.**

Delphi's "describe your situation, get their perspective" model, rebuilt for the
decisions that dominate Indian life — a fourth UPSC attempt, a ₹55 lakh education
loan against your parents' house, ESOPs with no buyback history, the 30-day notice
under the Special Marriage Act, GST on exported services, a ₹72,000 EMI against a
95-minute commute.

You describe a situation. Sorted matches it to people who lived through that exact
thing, and you ask them follow-ups until the answer applies to your case.

**Live: [sorted-rose.vercel.app](https://sorted-rose.vercel.app)**

```bash
npm install
npm run dev     # http://localhost:3000
```

It runs with **no configuration and no API key**. Add a key later for live answers.

---

## Why India needs its own version

Generic advice is not slightly wrong for these decisions — it is useless, because
the constraints are legal, financial and familial at the same time. "Should I take
the job?" is a different question when the answer involves a rishta your mother has
already half-accepted, a loan secured on a house, or a visa that attaches your life
to one employer for a decade.

The seed content is built around that: every answer carries rupee figures, exact
form and scheme names (LUT, STK-2, 80C, GSTR-3B, Udyam, EB-2), real timelines, and
the family politics left in.

## What's in the build

| | |
|---|---|
| 21 people | composite personas across 12 India-specific categories |
| 20 panels | curated groups — "Cleared UPSC after multiple attempts", "Living in the green card queue" |
| 12 quick questions | one decision, several people who made it differently |
| Situation matching | Hinglish + abbreviation lexicon, no embeddings needed at this size |
| Follow-up chat | streaming, in each person's voice, with their stated positions held constant |

### Routes

| Route | What it does |
|---|---|
| `/` | Situation box, featured panels, quick questions |
| `/situation?q=…` | Ranked matches for a described situation, with *why* each matched |
| `/discover?c=…` | Everyone, filtered by category |
| `/minds/[slug]` | Profile — what they lived through, their stated positions, and a chat |
| `/panels/[slug]` | A panel, with each member's opening take |
| `/questions/[slug]` | One question, several conflicting answers |
| `POST /api/match` | `{ q }` → ranked minds, panels, related questions, matched tags |
| `POST /api/chat` | `{ mind, messages }` → streamed plain text |

---

## How situation matching works

`src/lib/match.ts` holds a hand-written lexicon mapping what Indians actually type
onto canonical tags:

```
"ghar wale shaadi ke liye force kar rahe hain"
  → arranged marriage, marriage pressure, parents, moving out
  → Ayesha Sheikh (said no to an arranged marriage at 27)

"18 LPA at an MNC or 9 LPA plus esops at a seed startup"
  → ctc, salary negotiation, offer letter, esop, equity
  → Shruti Kale (400+ hiring panels), then Arjun Mehta (two ESOP grants)
```

This is deliberately not an embedding search. At this size a lexicon is more
accurate, debuggable, and free per query — and crucially, `matchedTags` is shown to
the user, so a bad match is legible instead of mysterious. Move to pgvector when
there are a few hundred minds; `match_mind_chunks()` in the migration is ready for it.

The ranking is: exact tag hit (6 points) > category hit (2) > loose text overlap (1),
with a small popularity tiebreaker.

## How answers work

Two modes, same UI, chosen automatically:

- **No `ANTHROPIC_API_KEY`** → serves each person's closest stored perspective,
  streamed at reading pace. The whole product is demoable offline.
- **With a key** → generates a fresh answer in their voice via
  `claude-opus-5-5`, with the persona's lived experience, voice guidance and stated
  positions in a cached system prompt (`src/lib/persona.ts`).

The persona prompt pins three things that matter for trust: stay inside your lived
experience, never invent credentials, and say plainly that you are a composite if
asked. It also makes them push a question back at you — the `pushesOn` field — which
is what makes the thing feel like a person rather than a search result.

```bash
cp .env.example .env.local   # add ANTHROPIC_API_KEY
```

The deployed site runs in offline mode — no key is set on Vercel, so it serves
stored perspectives. To switch it to live answers, add `ANTHROPIC_API_KEY` under
Project → Settings → Environment Variables and redeploy.

`SORTED_EFFORT` (default `low`) trades answer depth for latency. Thinking is always
on for Opus 5.5, so effort is the only latency lever.

---

## The people are composites

**Every persona in this build is fictional** — assembled from situations that are
common in India, not based on any named individual. This is stated on every profile,
in the footer, and on `/about`.

That is a deliberate design constraint, not a placeholder shortcut: cloning a real
person's voice without their consent is the single biggest reputational risk in this
category, and Delphi has already taken public takedown requests over it. The schema
enforces it — `minds.status` cannot be `live` for a non-composite without a
`consent_at` timestamp.

### Replacing seed minds with real people

1. Apply `supabase/migrations/0001_init.sql`.
2. Onboard a real person: row in `minds` with `is_composite = false`,
   `owner_user_id`, `consent_at`, `consent_scope`.
3. Ingest their content into `mind_chunks` (podcasts, posts, talks, writing) and
   embed it.
4. Have them write or approve their `perspectives` — these are what the model is
   pinned to, and `approved_by_mind` gates whether they are public.
5. Swap the `src/data/*.ts` reads in `src/data/index.ts` for Supabase queries. The
   column names match the TypeScript types exactly, so nothing else changes.
6. Retrieve chunks with `match_mind_chunks()` and add them to the system prompt
   alongside the stated positions.

### What the schema already handles

- **Consent and provenance** per mind, with the live-status check above.
- **Review loop** — `messages.reviewed_by_mind`, `perspectives.approved_by_mind`.
- **Private conversations** — RLS keeps threads readable only by the person who had
  them. The mind's owner cannot read your situation; review happens on answers you
  explicitly share.
- **Unmatched situations** — `situations` with a partial index on `not had_match`.
  This is the most valuable table in the product: it tells you which Indian decisions
  have nobody to answer them yet, which is exactly your expert-onboarding backlog.

---

## Where to take it next

Roughly in order of how much they matter:

1. **Supply, not software.** The product is only as good as who is on it. Mine
   `situations where not had_match` weekly and onboard against it.
2. **Hybrid answers.** AI answers instantly, the real person reviews and gets paid
   per verified answer. Best trust story for India; `reviewed_by_mind` is already there.
3. **Languages.** Every mind declares `languages`, but answers are English-only today.
   Hindi and one southern language are the obvious first additions — this is a large
   part of the actual market, and it is the thing an India-specific version is *for*.
4. **Payments.** UPI + ₹49-99/month, or per-conversation. Not Stripe-first.
5. **WhatsApp.** For most of this audience it is the real interface, not a web app.
6. **Safety rails.** Health, legal and immigration answers need stricter templates
   and an escalate-to-professional path. The persona prompt gestures at this; it is
   not enough on its own.

## Deployment

Deployed on Vercel, linked to this repo — every push to
`claude/gallant-tesla-dsijna` (the repo's default branch) triggers a production
build.

Note that Vercel refuses builds on Next.js versions affected by the React2Shell
advisories, so the `next` version here is pinned to the patched `backport` line
(15.5.28). Dropping below a patched release will fail the build, not just warn.

## Stack

Next.js 15 (App Router) · React 19 · TypeScript (strict) · hand-written CSS design
system with light/dark · `@anthropic-ai/sdk` 1.1 · Postgres + pgvector via Supabase.

No CSS framework and no component library — the whole surface is ~600 lines of CSS
in `src/app/globals.css`, which is fewer moving parts than a Tailwind config and
makes the editorial look easy to keep consistent.

## Not advice

Several people here talk about tax, immigration and marriage law because they went
through it. That is lived experience, not professional counsel. Anything with real
money or real legal risk needs a CA, a lawyer, or a registered adviser who can see
your papers.

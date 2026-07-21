# Landing page cost ledger

Infrastructure: Render free instance (upgrade to $7 Starter at first dollar — kills the
cold-start wait), shared Render Postgres (existing), Resend free tier (existing,
code63labs.com verified), GitHub public repo (same pattern as profit-lab). Nothing new
signed up for.

Per-visitor cost: one report run = two Opus 4.8 calls ≈ $0.08–0.12. The per-IP throttle
caps runs at 6/hour per visitor.

| date | what | est cost |
|---|---|---|
| 2026-07-21 | build-day testing: ~7 full pipeline runs (local + prod) | ~$0.70 |
| 2026-07-21 | Resend sends (reports + lead notifications + tests) | $0.00 (free tier) |

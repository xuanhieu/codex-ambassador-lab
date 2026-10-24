# N112 — API Rate-Limit Recovery Simulator

Zero-dependency **offline** workshop utility for teaching resilient API retry strategies. No real HTTP requests, external APIs, tokens, account credentials, analytics, or network traffic are used by the simulator.

## CLI

```bash
cd demos/rate-limit-recovery
python3 recovery.py --scenario recover-429
python3 recovery.py --scenario respect-retry-after --max-ms 2000
python3 recovery.py --scenario persistent-429 --attempts 10 --budget 2
python3 -m unittest discover -s tests -p 'test_*.py' -q
```

Built-in synthetic sequences: `recover-429`, `respect-retry-after`, `invalid-credentials`, `persistent-429`, `transient-5xx`, `success`. All decisions have deterministic seed 7 and run in milliseconds of **simulated time**, not wall-clock sleeps.

Rules:
1. Treat 200–299 as success; fail fast for non-retryable HTTP errors including 401/403. Never use retry to bypass authentication.
2. Retry only simulated 429, 502, 503, 504 and only when another synthetic response is available and policy allows.
3. Backoff is exponential with bounded **deterministic** educational jitter (75–100%), capped at `max_delay_ms`.
4. A simulated `Retry-After` delay takes precedence. If it exceeds the configured policy cap, **abort instead of violating** the server-requested delay.
5. Stop on the earlier of `max_attempts`, request budget, non-retryable error, synthetic response exhaustion or success.
6. Never claim that this simplified model implements all provider-specific retry semantics. Real implementation must parse Retry-After HTTP-date or seconds correctly, protect idempotency, enforce global rate/concurrency limits and respect provider policy.

## Web app

Open `index.html` through a static web server, or visit `https://codex.xuanhieu.org/demos/rate-limit-recovery/` after publication. The VI/EN page provides sliders, scenario selection, simulated chronological timeline and explicit terminal reason. It is a client-side replay only; no real requests or secrets.

## Suggested 15-minute workshop

Run 429→429→200 and record the three attempts; switch to 401 and show the immediate stop; activate 4s Retry-After and a 2s maximum wait to explain why aborting is safer; set budget=2 for persistent 429. Ask learners to discuss idempotency, retries for POST vs GET, and how to combine server instructions with an application-level request budget.

- Source: `demos/rate-limit-recovery/`
- Dashboard: https://codex.xuanhieu.org/dashboard/#workspace
- Academy: https://codex.xuanhieu.org/demos/codex-academy/

Independent educational artifact; no official OpenAI approval or certification claimed.

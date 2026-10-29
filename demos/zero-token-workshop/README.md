# N003 — Codex Zero-Token Workshop

## What is actually runnable
20-minute bilingual beginner workshop; four real browser-scored practice stages: clear task brief, human authorization, reproducible QA and reflection. No provider API.

**URL:** https://codex.xuanhieu.org/demos/zero-token-workshop/

## Scope
- Language: Vietnamese default; instant English switch.
- Privacy: no provider API, no credentials, no user account, no outbound requests except ordinary navigation links.
- Input/output: synthetic exercise data; core.js is pure JavaScript with a browser and Node export.
- User action: generated Markdown or JSON evidence downloads to the user's device; these are self-attested simulations and are not OpenAI certifications.
- Progress: the N003 workshop saves only an ordered list of completed step IDs in browser localStorage; N006/O004 do not store inputs persistently.
- Limitations: workshop checks use deterministic rubrics, not AI grading; N006 cannot enforce real access; O004 cannot create a real GitHub PR.

## Run
Serve the parent `demos/` folder via `python3 -m http.server 4499` then open `http://127.0.0.1:4499/zero-token-workshop/`.
Run `node --test tests/test_core.cjs` within this directory.

## Independent checks
17/17 Node tests PASS; Chrome 390/1440px checks 6 interactions each and zero viewport overflow.
Source reviewed for external calls, file deletion, PII collection and secret-containing output. Live deployment requires the project's separate fail-closed sanitizer/quality gate.

## N120 Learning Passport — added idea built into N003

The collapsed portable-progress panel exports only a `n120-learning-passport-v1` JSON object containing four allowlisted step IDs and a self-assessment marker. No prompt text, token, email or identifying data are included. Import checks JSON size (8 KiB), schema and strictly sequential step order; invalid files are rejected without overwriting prior progress. Browser can move learning progress between devices without requiring an account. The import/export feature is a local-file UX, not real-time cross-device synchronization.

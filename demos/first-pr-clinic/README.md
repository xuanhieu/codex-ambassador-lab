# O004 — First Pull Request Clinic

## What is actually runnable
Guided Git/PR simulation with three synthetic code fixtures, five stages from issue to draft PR, rule-based code diff selection, test evidence, and Markdown receipt. No real GitHub write.

**URL:** https://codex.xuanhieu.org/demos/first-pr-clinic/

## Scope
- Language: Vietnamese default; instant English switch.
- Privacy: no provider API, no credentials, no user account, no outbound requests except ordinary navigation links.
- Input/output: synthetic exercise data; core.js is pure JavaScript with a browser and Node export.
- User action: generated Markdown or JSON evidence downloads to the user's device; these are self-attested simulations and are not OpenAI certifications.
- Progress: the N003 workshop saves only an ordered list of completed step IDs in browser localStorage; N006/O004 do not store inputs persistently.
- Limitations: workshop checks use deterministic rubrics, not AI grading; N006 cannot enforce real access; O004 cannot create a real GitHub PR.

## Run
Serve the parent `demos/` folder via `python3 -m http.server 4499` then open `http://127.0.0.1:4499/first-pr-clinic/`.
Run `node --test tests/test_core.cjs` within this directory.

## Independent checks
10/10 Node tests PASS; Chrome 390/1440px checks 8 interactions each and zero viewport overflow.
Source reviewed for external calls, file deletion, PII collection and secret-containing output. Live deployment requires the project's separate fail-closed sanitizer/quality gate.

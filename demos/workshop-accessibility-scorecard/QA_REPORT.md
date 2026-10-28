# N058 — Independent QA report 2026-10-26

Workshop access assessment; not an official accessibility certification.

## Evidence

- Node unit tests: 15/15 PASS, with node --test tests/test.cjs.
- JavaScript syntax: node --check app.js PASS.
- Real Chrome interactions: 10/10 PASS at 390px and 1440px.
- Actual rendering, no horizontal overflow, sample functionality, visible results and locale switch checked.
- E2E report local: agents/COUNCIL_20261026/THREE_DEMOS_BROWSER_QA.json. Screenshots held locally.
- No API/paid AI integration, no real users or production customer data.
- Remaining: manual VoiceOver/accessibility audit, external penetration test and cross-browser review.
- Public status requires a verified live URL after sanitized release, not merely a passing unit test.

## Live production verification (2026-10-26)
The public entrypoint and app.js were tested using curl GET: HTTP 200 and TLS certificate verification result 0. URL: https://codex.xuanhieu.org/demos/workshop-accessibility-scorecard/ . Functional QA remains the unit/browser result above; HTTPS alone is not feature certification.

# QA & provenance — Codex × ChatGPT Zero-to-Hero Academy

Observed 2026-10-24 on the user's Mac mini. This is an independent original educational app, not an OpenAI certification.

## Verified source and curriculum

- Official machine-readable source index downloaded from https://learn.chatgpt.com/docs/llms.txt, 204 unique catalogued URLs as of 2026-10-24.
- catalog.py --check: passed; matched the stored catalog JSON exactly.
- 25 original bilingual VI/EN lessons; 5 each across Zero, Beginner, Intermediate, Advanced, Pro.
- Six audiences including Newbie, Creator, Marketer, Developer, Team Lead and Pro.
- Catalog does not republish full official article contents; source titles, links and editorial tags only.
- Original skills and exercises are distinct from copied or fabricated official documentation.

## Executed tests

| Suite / action | Actual observation |
|---|---|
| Python: python3 -m unittest discover -s tests | 32/32 passed, 0 errors / failures |
| Node: node --test tests/test_logic.cjs | 24/24 passed, 0 errors / failures |
| Syntax: node --check app.js and logic.js | Passed |
| Catalog validator: python3 catalog.py --check | 204 unique source records valid |
| Real Chrome CDP mobile at 390 CSS px | Passed; no horizontal overflow, app loaded |
| Real Chrome CDP tablet at 768 CSS px | Passed; no horizontal overflow, app loaded |
| Real Chrome CDP desktop at 1440 CSS px | Passed; no horizontal overflow, app loaded |
| Interactive Chrome checks at each size | 8/8 interactions passed per viewport: 24 checks |

Interaction tests include: 204 sources and 25 lessons visible in counters, library pagination, docs search, Developer role selection, opening an actual lesson, requiring three manual checkboxes + correct quiz, explicit completion recorded in browser localStorage and progress screen rendering. Each viewport test resets its own browser-local learning state to avoid false carryover.

Screenshot evidence: parent workspace agents/BR-20261024-PARALLEL/qa-screenshots/BR-E-mobile.png, BR-E-tablet.png and BR-E-desktop.png. These are actual Chrome captures of the tested interface.

## Safety and privacy

- [x] URL allowlist HTTPS only for learn.chatgpt.com, developers.openai.com, platform.openai.com; rejects foreign domains/credentials.
- [x] No live Codex CLI execution or private local machine access through web app.
- [x] Progress import whitelists schema, IDs, exercise booleans and quiz indexes; rejects unknown payload properties.
- [x] Pure HTML/CSS/JS. No CDN, model API, analytics, tracking pixels, external fonts or account connection.
- [x] Visible label that product is independent, not an OpenAI-owned certification.
- [x] 'Legacy' filters and source snapshot date displayed. No claim of live source freshness.
- [x] Docs source linked, not copied/mirrored in full.
- [x] User-held backup export/import works by browser APIs; no server-side progress syncing.
- [ ] Screen reader manual assessment not executed; no WCAG conformance claim.
- [ ] Refresh tool with production index updates was not invoked; its URL filtering is unit-tested only.
- [ ] Live Cloudflare URL must be checked after actual deployment; currently this report is local QA only.

## Release acceptance

Source only the allowlisted files: index.html, styles.css, app.js, logic.js, catalog.json, lessons.json and optional README.md / QA_REPORT.md. Never include sources/ index snapshots, test log, AGENT_HANDOFF.md, Git metadata, credentials or the local private Codex Ambassador application source.

Upon publishing, check HTTPS response 200, static CSS/JS/JSON loads, real browser scenario and source link navigations; do not claim complete web release until these checks succeed.

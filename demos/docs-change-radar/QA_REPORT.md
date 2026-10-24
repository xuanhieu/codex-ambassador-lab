# N104 Observed QA — 2026-10-24

- Python unit tests: **27/27 passed** with deterministic compare, ordering and severities, add/remove/move/rename/content change, duplicate URL/ID and invalid schema/hash.
- Synthetic fixtures: 14 prior, 14 current documents, 12 change events, 10 affected documents, 5 Critical events.
- Python CLI reproduces the bundled `sample-report.json` exactly.
- Browser JavaScript syntax check: passed.
- Chrome CDP at **390, 768, 1440 CSS pixels**: passes no-overflow and no uncaught exceptions.
- Each viewport tested: 12 events, filter to 5 Critical, search DOC004 to 1 result, switch VI → EN, reset fixture. **5 interactions × 3 viewports passed**.
- Import accepts up to 1 MB JSON. Browser UI uses DOM text nodes to avoid HTML injection. CSV download prefixes dangerous spreadsheet-formula characters.
- No network API calls, no live documentation crawler or account authentication.
- Accessibility WCAG conformance and real external documentation freshness **not independently certified**.
- Publication readiness: tests passed; live HTTPS must be verified separately.

## Verified production HTTPS

- 2026-10-24: `https://codex.xuanhieu.org/demos/docs-change-radar/` returned HTTPS 200 / TLS verify 0 on MacBook.
- Checked HTML, JS, public fixtures, dashboard registry and supporting source assets; all returned expected HTTP 200 and content.
- Cloudflare revision checked against the exact source manifest before marking Public.

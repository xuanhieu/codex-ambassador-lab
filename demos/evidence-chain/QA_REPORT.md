# N108 Observed QA — 2026-10-24

- `python3 -m unittest discover -s tests -p 'test_*.py' -q`: **25 / 25 passed**.
- CLI: built 3-entry fixture chain; verified 3 files with zero violations. SHA-256 known-answer test matches.
- Browser JavaScript syntax check: passed.
- Real Chrome CDP at **390 × 844**, **768 × 900**, **1440 × 900**: passed, no horizontal overflow or runtime exceptions.
- Each browser viewport tested: empty UI → sample manifest valid → tampered metadata rejected → recovery → 3 real fixture bytes verified → one modified byte rejected. **6 interactions × 3 viewports passed**.
- Synthetic sample only, no network, no localStorage, no remote API or sensitive files used.
- The CLI's local SHA-256 chain is not a proof of identity, authorship, origin or timestamp.
- Accessibility: keyboard and screen-reader manual conformance audit **not yet claimed**.
- Publication readiness: tests passed; report must be updated with actual HTTPS checks after upload.

## Verified production HTTPS

- 2026-10-24: `https://codex.xuanhieu.org/demos/evidence-chain/` returned HTTPS 200 / TLS verify 0 on MacBook.
- Checked HTML, JS, public fixtures, dashboard registry and supporting source assets; all returned expected HTTP 200 and content.
- Cloudflare revision checked against the exact source manifest before marking Public.

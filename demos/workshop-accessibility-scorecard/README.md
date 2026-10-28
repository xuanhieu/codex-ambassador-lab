# Workshop Accessibility Scorecard

A local, keyboard-first accessibility planning scorecard for workshops and meetups in Vietnamese and English communities. It is intended for all learners, including no-code and disabled participants, and does not claim WCAG conformance or certification.

## What it does

- Accessible form for venue, transport, hearing/vision, remote participation, language, low bandwidth, privacy, and cost.
- Weighted checklist with an explicit `Not sure / Chưa rõ` state.
- Deterministic score, coverage, strengths, gaps, and prioritized fixes.
- Exports a worksheet as CSV and Markdown.
- Uses only local synthetic sample data. No network, no tracking, and no participant data is stored.

## Files

- `index.html` — page structure and accessible controls.
- `styles.css` — responsive dark Bento styling.
- `app.js` — checklist data, scoring, exports, and browser behavior.
- `tests/test.cjs` — Node tests for scoring and file contracts.

## Run locally

Open `index.html` in a browser, or serve the folder locally:

```sh
python3 -m http.server 4173
```

Then open `http://localhost:4173`.

## Run tests

```sh
node --test tests/test.cjs
```

## Honest completion note

This is a planning aid, not an accessibility audit or certification. The score only reflects the answers entered by the facilitator. `Not sure` answers are excluded from the score and shown as coverage, so they do not become false failures. A high score does not mean a venue or event is accessible; verify with disabled participants, local regulations, and real event conditions.

## Limitations

- No automated WCAG testing or assistive technology validation is performed.
- No user accounts, saved profiles, or cross-device sync.
- Sample data is synthetic and local only.
- Exported files are generated in the browser; no data is sent to a server.
- The checklist is not exhaustive for every impairment, venue, or legal requirement.

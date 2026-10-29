# Evidence-to-Story Portfolio Builder

Client-side tool that turns **real** evidence into an honest portfolio narrative. It separates verified facts from unverified claims, warns against fabricated metrics, keeps a sortable evidence ledger with provenance labels, and exports portable Markdown/JSON. Everything runs in the browser; no data is uploaded.

## Run

```bash
cd demos/evidence-story-builder  # from the project checkout
node --test
python3 -m http.server 4173
# open http://127.0.0.1:4173/
```

## Features

- Project title, audience, role, summary.
- Sortable evidence ledger with real http(s) URLs, types, notes, verified toggle.
- Inline validation for required fields and URLs.
- Verified facts vs unverified claims (one item per line).
- Tests actually run (free text, multiline).
- Limitations and risks (required).
- Optional metrics with explicit confirmation; warns when numbers appear.
- Bilingual narrative draft (VI default, optional EN).
- Export Markdown and JSON, client-side only.
- Autosave to `localStorage` only, with explicit clear button.
- Sample data loader.
- Provenance labels: verified URL, user-attested, built-in sample, unverified claim.

## Files

- `index.html` — structure
- `styles.css` — Dark Bento responsive styles
- `core.js` — validation, sorting, narrative generation, serialization
- `app.js` — UI, autosave, ledger, exports
- `tests/test.cjs` — Node tests

## Limitations / honest notes

- This tool does **not** fetch or verify URLs, run tests, or certify truth.
- All metrics and test results are user-attested.
- No cryptographic signature, independent verification, or official certification.
- Autosave uses browser `localStorage` and is cleared by the explicit button or browser data clearing.
- Live demo: https://codex.xuanhieu.org/demos/evidence-story-builder/ . Source: https://github.com/xuanhieu/codex-ambassador-lab/tree/main/demos/evidence-story-builder
- Accessibility and cross-browser rendering were not manually audited beyond responsive CSS.

## Test result

`node --test`: 27/27 passed on 2026-10-29, Node v24.22.1.

## Try it with Codex / Thử với Codex

Work on a fresh clone or a throwaway branch. Start Codex in `demos/evidence-story-builder` with `codex` and paste:

```text
Read core.js (sortEvidence) and tests/test.cjs. Add ONE new node:test case to tests/test.cjs proving that sortEvidence falls back to ascending order when the direction is neither "asc" nor "desc" (for example "sideways"), and that the input array is not mutated. Use the existing C import. Do not change core.js or any other file. Run `node --test`, then show me the diff and explain each assertion in one sentence.
```

Check it yourself from the same folder:

```bash
node --test
git diff --stat
```

A good result: 28 tests, 28 pass, 0 fail (27 before the change); `git diff --stat` lists only `tests/test.cjs`. If Codex edits `core.js`, reject the change and ask again.

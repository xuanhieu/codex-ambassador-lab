# N078 QA report

Date: 2026-10-26. Result: implementation delivered; 34 automated tests passed, 0 failed. This report describes local checks, not independent certification or deployment evidence.

## Observed validation

Runtime: Node.js v24.21.0.

| Check | Observed result |
| --- | --- |
| `node --test tests/test_core.cjs` | 34 passed, 0 failed, 0 skipped |
| `node --check core.js` | Passed |
| `node --check app.js` | Passed |
| `node --check tests/test_core.cjs` | Passed |
| Static HTML inspection with Python standard library | Unique IDs; label and ARIA targets resolve; all declared script/style assets exist locally; CSP contains `connect-src 'none'` |
| Script source inspection | No `innerHTML` or `eval` use |

Bare `node --test` was also tried and discovered 0 tests because `test_core.cjs` does not match the runtime's automatic discovery pattern. It is not counted as validation. The explicit command above ran all 34 tests successfully after the final application change.

The suite contains 26 core checks and 8 application checks. Coverage includes strict root and proof schemas, text boundaries/types, unknown/missing fields, empty suite, nonfinite/negative/fractional/string counts, count consistency, malformed UTF-8/JSON, filename rejection, empty evidence, exactly 1 MiB acceptance and oversize rejection, immutable normalized output, failed status, hash-unavailable status, fixed attestation flags, source differentiation, timestamp validation, HTML/script delimiter escaping, and formula-like JSON strings.

Application checks execute `app.js` in a minimal DOM harness. They exercise native Node SubtleCrypto hashing of the exact file bytes and compare against an independently computed Node `createHash` digest, JSON export provenance, clearing previous results on invalid input, the built-in sample, absent/throwing hash support, failed badge class, oversize rejection before reading, empty selection, stale asynchronous read protection, and VI-default/EN switching. This is executable integration evidence, not a real browser test.

## Integrity review

- A green result is only a user-attested pass with a computed digest. Failed reports remain red and export as failed. Missing hash support yields amber and explicit null values.
- Both visible and exported receipts distinguish self-reporting from independent verification. Sample provenance is retained in the visible metadata and JSON.
- SHA-256 receives the loaded byte array, not reconstructed JSON. Whitespace changes produce a different digest even when parsed values match.
- User text is assigned through `textContent`. Export uses JSON encoding plus escaped HTML/script delimiters and a fixed `.json` download name. No CSV exporter or spreadsheet evaluation exists.
- New loads invalidate prior results immediately and use a revision token to prevent delayed reads from restoring obsolete evidence.
- CSP disallows connections and external active surfaces. No application network calls, dependencies, storage persistence, or credential access were introduced. No server was started or deployment performed.

## Unverified limits

No browser was launched. Visual layout at mobile/tablet/desktop widths, actual `file://` CSP behavior, browser download behavior, keyboard navigation, screen-reader announcements, focus visibility, color contrast, and browser-specific SubtleCrypto availability have not been empirically verified. The frontend skill's external render script was not run because the requested work was local and dependency-free. Responsive CSS, semantic controls, labels, and live regions are implemented but are not a substitute for those manual checks.

The tool cannot establish that supplied results are truthful, that tests ran, that inputs match external artifacts, that the device clock is accurate, that a user identity is authentic, or that a deployment occurred. SHA-256 is not a signature. Exported JSON can be edited. No signed or independently trusted receipt validation is provided. Duplicate JSON keys follow native JSON parsing semantics (last occurrence wins); the hash still identifies the original bytes.

Scope disclosure: an installed frontend-design skill instruction file was read once outside the task directory during setup. This exceeded the requested read boundary. No outside file was modified; no credentials or personal files were read. All deliverable writes and subsequent project checks stayed within the task directory. No network or remote API was used.

## Manual follow-up checks

Open `index.html` offline in a target browser. Tab through language selection, file selection, sample loading, the proof disclosure, and export. Check VI/EN text and live announcements; load valid and invalid reports; verify the download's digest against the retained original; test a failed report and a browser with unavailable SubtleCrypto. Inspect widths 375, 768, and 1440 pixels and zoom at 200%. These checks are pending, not claimed as passed.

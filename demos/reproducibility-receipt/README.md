# N078 — User-attested reproducibility receipt

A dependency-free, offline static tool for recording **self-reported** test results. Every receipt says **User-attested / Tự khai báo**. This is a diagnostic receipt, not official certification, independent verification, a cryptographic signature, or deployment proof. The tool never executes the claimed test suite.

## Open and use

1. Keep `index.html`, `styles.css`, `core.js`, and `app.js` together. Open `index.html` directly in a modern browser. No install, server, API, network, or account is required.
2. Vietnamese is the default. Choose English with the language selector.
3. Select a local `.json` evidence file, or choose **Dùng báo cáo mẫu / Use sample report**. The built-in sample is illustrative and explicitly identified in the receipt and export.
4. Review the counts, source, filename, original byte length, UTC generation time, proof fields, and digest. Expand the proof section with Enter or Space.
5. Choose **Export receipt JSON** to save `n078-user-attested-receipt.json`. The original evidence is not bundled in the export. Keep the original separately for byte-level comparison.

File data is read into browser memory, never uploaded or persisted by the app. Reloading clears the receipt. A browser may retain download history and saved exports. No personal details are requested; imported text and the local basename are included in exports. Do not put sensitive details in them.

SHA-256 uses native `crypto.subtle.digest` on the original bytes, including whitespace and any UTF-8 BOM. Browser policies for local files vary. If SubtleCrypto is missing or rejects the operation, the UI shows digest unavailable, exports `null` digest/algorithm values, and does not display a green badge. There is no fallback or invented hash.

## Evidence schema

Save this shape as a local file such as `result.json`. Replace the example claims with actual test results:

```json
{
  "artifactLabel": "Example local artifact",
  "suiteName": "Arithmetic checks",
  "total": 3,
  "passed": 3,
  "failed": 0,
  "inputProof": {
    "inputDescription": "Integers 2, 3, 5; identify real inputs here.",
    "procedure": "Describe the actual test command and steps.",
    "environment": "Describe the runtime and relevant versions."
  }
}
```

The schema accepts exactly these keys; unknown or missing fields at either object level are rejected. No arrays or coerced types are accepted. Input proof is user-supplied text, not a verified attachment.

| Field | Constraint |
| --- | --- |
| `artifactLabel` | Nonblank string, maximum 160 UTF-16 code units |
| `suiteName` | Nonblank string, maximum 160 UTF-16 code units |
| `total`, `passed`, `failed` | Integers 0–1,000,000; total must be positive and equal passed + failed |
| `inputProof.inputDescription` | Nonblank string, maximum 1,000 UTF-16 code units |
| `inputProof.procedure` | Nonblank string, maximum 2,000 UTF-16 code units |
| `inputProof.environment` | Nonblank string, maximum 500 UTF-16 code units |
| Filename | Basename ending `.json` (case insensitive), maximum 128 code units; no slash, backslash, or control characters |
| Evidence | 1–1,048,576 bytes inclusive; valid UTF-8 JSON |

Text fields reject C0/C1 control characters (including newlines and tabs); ordinary spaces and Unicode text are accepted. JSON is parsed using native JSON semantics. There is no `NaN` JSON literal; programmatic nonfinite numbers and parsed nulls are rejected by the validator. Oversize files are rejected before reading, and the actual byte length is checked again after reading. A new selection clears any previous receipt; stale asynchronous reads cannot overwrite a newer selection.

## Badge and export meaning

- Zero failed tests plus a real digest: green **self-reported pass**.
- One or more failed tests: red **failed**, even if a digest exists. Failed data may be exported honestly as a failed receipt.
- Zero failed tests but no digest: amber **reported pass · digest unavailable**.
- Invalid or missing evidence: error, no receipt, export disabled.

Exports contain the normalized report, fixed attestation, explicit false independent/official/signed flags, source (`local-file` or `built-in-sample`), filename, byte length, SHA-256 or null, local-clock timestamp, and limitations. The schema is `n078-user-attested-receipt/v1`. Exported receipts have a different schema from input reports and are intentionally rejected as input evidence.

Exports use JSON serialization with HTML/script delimiters and Unicode line separators escaped. Imported strings are rendered with `textContent`; no untrusted HTML is interpreted. A fixed download filename and JSON MIME type are used. No CSV is generated, so formula-like input remains a JSON string. Converting an export to CSV or inserting it into another system requires that system's own escaping; this tool does not claim to sanitize downstream conversions.

The CSP blocks connections (`connect-src 'none'`), forms, frames, objects, images, and workers, permitting only local stylesheet/script loading. There is no eval, external asset, dependency, telemetry, or service worker. The page uses labeled native controls, visible focus, live status/error regions, textual status distinctions, and a responsive single-column layout on small screens. Browser accessibility and visual rendering still require manual verification; see `QA_REPORT.md`.

## Verify independently

Obtain trusted source code, actual test inputs and environment details. Run the claimed suite independently, retain its output, and compare actual results. Hash the original evidence file independently, for example:

```sh
shasum -a 256 result.json
```

Compare that output with `evidence.sha256` in the exported receipt. The hash binds only the original file bytes. It does not establish that the report is true, that tests ran, that artifact contents match their label, who authored the file, or that a deployment occurred. The generation timestamp is the untrusted device clock. An exported receipt can be edited; it is neither signed nor tamper-proof.

## Run validation

Use Node.js 20 or later; no installation of packages is needed:

```sh
node --test tests/test_core.cjs
node --check core.js
node --check app.js
node --check tests/test_core.cjs
```

Pass the explicit path: bare `node --test` does not discover this requested underscore-style filename on the tested runtime. Tests cover the pure core plus app state transitions in a minimal DOM harness using native Node WebCrypto. The harness is not a browser or accessibility audit.

## Files

`core.js` exposes pure validation, parsing, receipt generation, and safe serialization through `ReceiptCore` in browsers and CommonJS in Node. `app.js` owns local file I/O, native hashing, rendering, language switching, and download. `index.html` and `styles.css` supply the interface. `tests/test_core.cjs` contains automated checks. `QA_REPORT.md` records observed checks and unverified limits; `agent-summary.json` is the machine-readable delivery record.

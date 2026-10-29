# N111 — Screenshot Privacy Reviewer

An independent, self-contained **offline** screenshot redactor for users preparing public portfolios, QA reports and project demos. It does not transmit files, use OCR or contact an AI model.

## Start in 15 seconds

Open `index.html` via a static HTTP server:

```bash
cd demos/screenshot-privacy-reviewer
python3 -m http.server 4198 --bind 127.0.0.1
```

Or open the verified Pages URL under `https://codex.xuanhieu.org/demos/screenshot-privacy-reviewer/` after release.

The first screen contains a **synthetic 1200×760 screenshot**. Click **Che email mẫu**, **Che mã mẫu**, or **Che avatar mẫu** to redact a premarked region. Try the black rectangle in the preview; click Undo or Clear all to revert locally. Any change to the mask set (add, Undo, Clear all) unticks the review confirmation, so export needs a fresh review.

## Real screenshot flow

1. Select an image using **Chọn PNG/JPEG/WebP**. Only raster image types are accepted, max **15 MiB**, **16 million pixels** and max 9000 pixels per dimension. Unsupported input is rejected with an explicit error.
2. Drag over private content directly on the screenshot. This creates an opaque black fill rectangle; **not a blur**. Alternately, open *Thêm vùng bằng tọa độ (%)* and enter left/top/width/height for accessible keyboard entry.
3. Review **every** sensitive area: address bar, tab names, usernames, messages, emails, file paths, cookies, credentials, phone numbers, QR codes, avatars and screen notifications.
4. Check the explicit review checkbox. The export button activates only when at least one mask exists and the checkbox is checked.
5. Export. The browser creates a fresh, non-layered PNG on-device using a new canvas. The original image file is never overwritten. The exported filename is generic (`redacted-screenshot.png`), so a private source filename cannot accidentally leak through the output name.

## Threat model / limitations

- All processing is implemented with Canvas2D and native JavaScript; no packages or external APIs. A restrictive CSP disables `connect-src` and limits scripts to the origin. No storage of image bytes in localStorage.
- An opaque fill is not reversible as an image layer. PNG is **re-encoded** and does not preserve the input image's EXIF metadata. The tool makes no image-authenticity, provenance or cryptographic-redaction claim.
- **Manual review remains required.** There is no OCR, face detection, secret detector or proof that every sensitive pixel is covered. Masks that are too small may miss surrounding characters, antialiasing or edges.
- A screenshot itself may have copied credentials or other sensitive details outside the selected masks. Review the exported result again before posting publicly.
- Browser session memory still contains the original until the page is closed/reloaded. Do not use public computers or untrusted browser extensions for sensitive images.
- If the website is modified or compromised, local-only privacy claims no longer apply. Check the published build, scripts and CSP before using with real sensitive images.

## Unit and browser QA

```bash
node --test tests/test_redaction.cjs
node --check app.js
node --check redaction_core.js
```

The redaction geometry module is independent and testable without DOM; the browser QA loads the synthetic sample, verifies opacity of redacted pixels, Undo and numeric input, and decodes the exported PNG to verify actual pixel values.

## Connections

- Project Map: https://codex.xuanhieu.org/dashboard/#workspace
- Academy: https://codex.xuanhieu.org/demos/codex-academy/
- Source path: `demos/screenshot-privacy-reviewer/` in the authorized local project checkout

Independent training application; not an OpenAI-certified privacy or compliance tool.

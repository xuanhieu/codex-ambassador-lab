# N111 — Independent QA evidence (2026-10-24)

**Unit layer:** 29/29 Node tests passed — coordinate normalization, clamping and reversal, percentages, pointer mapping, masked filled pixels, missing/invalid values, upper bound of 100 rectangles, browser-only raster upload whitelist, no network APIs and export review guard.

**Visual browser layer:** Chrome CDP screenshots captured and inspected for **390×844 mobile, 768×900 tablet and 1440×900 desktop**, with no horizontal overflow or unhandled JavaScript exception.

**Actual browser interactions:** 9 checks × 3 viewports = **27 passes**, including synthetic first load, preset masking, pixel opacity in the preview, Undo, keyboard numeric redaction, Clear all, review checkbox gate, English localization and Reset.

**Most important validation:** The browser exported a real PNG Blob, decoded it using `createImageBitmap`, and the test read pixels inside both the masked key and avatar. All tested pixels equaled opaque `#10151f`, preserving original 1200×760 dimensions. Performed on mobile, tablet and desktop viewports (not just screenshot UI visual assertions).

**Privacy boundaries:** no real sensitive files used. No network APIs or image uploads. The export filename is intentionally generic; source image metadata is not copied to PNG.

**Still not certified:** manual assistive-technology/VoiceOver audit, extremely large image stress test, pixel-perfect coverage of all user-selected personal data, and external third-party independent penetration testing.

**Publication:** verified production HTTPS on 2026-10-24: N111 HTML, app.js, core JS, CSS, README and dashboard map all returned HTTP 200 with TLS verify result 0 from MacBook. Release manifest on codex.xuanhieu.org matched the sanitized local build (129 files, digest 3517d3b17285… before the final status-only update).

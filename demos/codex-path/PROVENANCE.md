# Codex Path — provenance, security, attribution

Date: 2026-10-24. Workspace: <local project checkout>/codexpro-amb.

1. Original code in this folder: `engine.js`, `app.js`, `styles.css`, `index.html`, `motion.js`, curriculum builder, tests and docs, authored in this implementation turn. Outputs are human-reviewed educational software, not official OpenAI products.
2. Source curriculum: 25 original bilingual lessons from sibling `demos/codex-academy/lessons.json`, copied with original lesson IDs and references. Career mapping, career capstones and time estimates are newly curated local guidance.
3. ASCII reveal: `quanhoangindex/ascii-reveal`, MIT License © 2026 Quan Hoang. Upstream source `https://github.com/quanhoangindex/ascii-reveal`. Commit snapshot checked: `3a5000c5b928cdb4b24c8574a6d6d2a877873331`. Vendored unmodified `dist/core.js` saved as `vendor/ascii-reveal-core.js`, SHA-256: `3057e16dfe34b83cd61407d85c74c9909b1849d41b74113a12634703000565b1`. See complete MIT license at `vendor/ASCII_REVEAL_LICENSE.txt`.
4. Design reference: existing dashboard's Noti-inspired color/tokens/layout and local frontend skills. No NotiVN proprietary assets or logo copied.
5. Privacy: CSP/noindex headers provided by deployed Cloudflare Pages. App code itself does not transmit user progress, include API keys, access private macOS directories or use external CDNs. Live user progress uses localStorage.
6. Security boundary: Remote Pages cannot reveal Mac folders. Dashboard source map uses localhost Finder helper on machines where the helper is explicitly running; no remote machine control is exposed.
7. Test evidence: see `QA_REPORT.md` and workspace `agents/BR-20261024-PARALLEL/qa_browser_result.json`. Tests cover deterministic schedule, input normalization, injection-resistant output sanitization, quiz prerequisites, source links, mobile/tablet/desktop.
8. Contribution distinction: original Codex Path software is a separate product; the Academy underlying content and upstream ASCII component are attributed rather than misrepresented as all-original.

Agent note: previous Codex CLI threads were unable to continue due exhausted workspace credits; fallback work in this turn was authored by ChatGPT and executed through deterministic local processes. Do not claim those old agents completed the new product.


## 2026-10-24 — Every Human Learning Map (independent) extension

The original 25 Academy exercises and six professional paths were preserved. The new editorial `data/every-human-extension.json` supplies **36 original bilingual synthetic lessons** plus eight nontechnical learning routes. `builders_curriculum.py` deterministically merges both sources into one 61-lesson, 14-track dataset. The addition of educational content does not imply endorsement, certification, permission to modify a user repository, or automatic completion.

The onboarding screens are original JS/CSS components (`starter-core.js`, `starter-ui.js`, `starter.css`) with no AI calls. Samples in the guided walkthrough are explicitly **illustrations**. Placement quiz results suggest a starting point but do not verify competence.

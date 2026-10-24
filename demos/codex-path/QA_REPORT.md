# Codex Path QA — observation log, 2026-10-24

## Tested locally

- Curriculum source: **25** bilingual source lessons, **5** proficiency tiers; career map: **6** original paths with capstones and skills.
- JavaScript deterministic engine: **26 / 26 Node unit tests passed**, including URL input restrictions, backup bounds, prerequisite closure, time budgets, readiness gate, and 6-track plan generation.
- Chrome CDP under local HTTP server: **390px mobile, 768px tablet, 1440px desktop**. All three viewports loaded correctly and **no horizontal overflow** or uncaught JS exception in tested interactions.
- **Per viewport:** 16+ checks including profile form generation, 12-week plan persistence, 6 careers, career switch, 25-lesson lab, dialog, quiz + explicit confirmation, localStorage completion, invalid/valid evidence, English toggle, theme toggle and bidirectional links.
- Source vendor `ascii-reveal` pinned and MIT license retained; source inspected for obvious eval/network usage. Not a formal security audit.
- Astro/React not required: no external package manager dependencies to publish.

## Still requires live verification before release can be called public

- Cloudflare Pages custom domain serves HTTPS 200 at `/demos/codex-path/`.
- Verify all JS/CSS/JSON/MIT license asset URLs and digest against local public staging.
- Check navigation between Academy, dashboard and Codex Path on Cloudflare hostname.
- One additional independent manual keyboard and screen-reader pass is recommended; **do not claim WCAG conformance**.

## Limitations

This app is a study planning/portfolio aid. Quiz completion is local only; no real code is executed and source/evidence URLs are not automatically inspected. No OpenAI official accreditation, selection prediction or employment promise.

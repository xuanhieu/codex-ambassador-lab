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


## Post-upgrade practical learning audit (2026-10-24)
- 30/30 Node unit tests PASS including legacy import, practice checklist persistence and invalid-step scrub.
- Real Chrome CDP: 390×844 mobile, 768×900 tablet, 1440×900 desktop; 16 interactions per viewport = **48 passed**; no horizontal overflow.
- Completion gate tested with the actual 3 step checkboxes, correct quiz answer and explicit confirmation; browser-local completion persisted.
- The copyable practice prompt includes synthetic-data and manual-review constraints. Exercises do not call external agents without learner action.
- Browser state self-attests results; there is no automatic remote verification of Codex execution, code correctness or job readiness.


## Every Human verified extension — 2026-10-24

- Source: 25 original Academy lessons + 36 independent additional original VI/EN lessons = **61**; 6 retained technical careers + 8 nontechnical routes = **14**, with 12 visible starter personas.
- `python3 builders_curriculum.py` reconstructs the dataset deterministically (SHA-256 recorded in terminal).
- `node --test tests/test_engine.cjs tests/test_starter.cjs`: **63/63 pass** (private proof readiness, old public proof gate, backward-compatible progress, secret-aware starter, 4-question placement, 12 persona mapping).
- Chrome CDP at **390×844, 768×900, 1440×900**: **25 start-to-finish interactions per viewport, 75 observed passes**, no horizontal overflow, no uncaught JS error. Tests include zero-code first prompt, synthetic examples, first-win review checkboxes, four-question placement, personalized roadmap, private proof without GitHub, retained 14/61 UI, old technical public proof URL feedback, locale and theme.
- New starter app does not call external model providers or API keys. Only a limited list of persona ID, task ID, boolean review flags and tier is stored in browser storage; typed prompt is not stored.
- No claim is made of manual WCAG/VoiceOver conformance or a verified user study with actual young learners. These require independent testing.
- Public HTTP/Cloudflare SHA and GitHub source publishing are verified separately and must not be assumed from local CDP tests.

## 25/10 — Indexed docs and human-readable guides

- The official index snapshot has **204 URLs** (45 Codex, 158 ChatGPT, 1 Platform) and remains metadata-only: no copied full official articles; no individual link-live certification.
- The editorial concept layer contains **19** bilingual original simple summaries, comparisons, examples, common mistakes and short exercises linked to **61** actual lessons.
- **85/85** Node unit tests passed across `test_engine.cjs`, `test_starter.cjs`, `test_guides.cjs`; source integrity checks ensure all 204 indexed IDs and URLs match the Academy catalog.
- New Chrome CDP checks on **390×844 mobile, 768×900 tablet, 1440×900 desktop** passed. Tested `#guide` navigation, tier switch to Pro, 45-Codex-source product filter, Codex CLI search, document→guide jump without hash collision, lesson popup, English toggle, 3-minute starter return, skill gate, 14 tracks, 61-lesson lab and local private proof. No horizontal overflow or JS exception.
- After attempting to add the test suite, the fail-closed release gate correctly caught an accidentally embedded personally identifying email *in the test's own assertion*. The literal was replaced with a non-personal generic validation pattern. The sanitized 139-asset public build and 10-group Quality Gate then passed.
- No real testing with children, manual VoiceOver audit, live crawler of all 204 pages or production data processing is claimed.

## Second editorial QA — 2026-10-25

- Level-first mapping corrected over 60 misleading cross-tier assignments and explicit overrides for Codex SDK / App Server.
- Curated sources for all 19 guides prevent unrelated Amazon Bedrock or generic Codex manual filler.
- All 36 supplementary lessons now have distinct practical quiz questions, correct answer positions 0/1/2 and context-specific explanations.
- Legacy docs are visibly marked; they remain searchable for historical reference, not recommended as current instructions.
- Dated source index does not assert full article content was freshly crawled or verified.

## Live source retrieval and handbook QA

- Actual HTTP audit of 204/204 indexed URLs performed 2026-10-25, with respect for robots.txt. Results: 198 fetched (HTTP 200 and SHA-256 content fingerprint) and 6 unavailable (HTTP 404); no full-text article content republished.
- The six unavailable indexed references remain listed as archived/historical index records with 404 warning; no inaccessible source was used as a default reference card for the 19 editorial guide modules.
- Source-to-guide mapping enforces appropriate tier; all 204 sources have a primary assigned educational concept and 19 modules carry curated references.
- Standalone bilingual Markdown handbooks contain 19 original explained modules each. Tests also protect against accidentally embedding applicant email addresses.
- All source-status fields in the browser map are generated deterministically from the same versioned public metadata snapshot; no claim that HTTP 200 means the external source is still correct.

## 2026-10-25 — Real instructional infographics and visual polish

- Inspired by the *clarity* of official Codex/OpenAI documentation; the independent product uses its own graphite + restrained warm accent palette, never imitates official logos or claims OpenAI brand ownership.
- Custom semantic SVG/HTML visual diagrams created for 19 editorial topics plus a dynamic three-step diagram for every interactive lesson (61 lessons). All are generated locally without remote image APIs or third-party licensed images.
- New first-fold quick-flow infographic shows Learn → Try → Verify before the accordion.
- Chrome CDP at 390/768/1440 passed all prior learning paths, role selection, source health, and new infographic visibility / 3-step lesson modal / dark-or-light accent tests, zero reported horizontal overflow.
- 98/98 local Codex Path Node unit tests (includes visual/route/palette checks); user-visible docs remain manually curated and linked to dated official source index rather than copied full source content.

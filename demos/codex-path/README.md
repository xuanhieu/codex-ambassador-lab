# Codex Path — Learning & Career OS

**Independent learning and career planning product** by the local Codex Ambassador workspace.

## Try the app

- Local: from `<local project checkout>/codexpro-amb`, run `python3 -m http.server 4197 --bind 127.0.0.1` then open `http://127.0.0.1:4197/demos/codex-path/`.
- Public (after verified Cloudflare release): `https://codex.xuanhieu.org/demos/codex-path/`.
- Cross-link: Academy `../codex-academy/`; Mission Control `../../dashboard/#workspace`.

## Real features

1. Purpose-first discovery: **14 tracks**: the six existing professional routes plus eight for anyone (everyday/non-coder, student, teacher, office worker, small business, job seeker, designer and community organizer).
2. Adaptive scheduler: select learning baseline (Zero/Beginner/Intermediate/Advanced/Pro), 1–20 study hours per week and 2–32 target weeks. Lessons come from the current Academy data snapshot, prerequisite closure is enforced, and capstone is split into three chunks (30 minutes for nontechnical private portfolios, 60 for technical public proof). It is an **estimate**.
3. Native lesson/quiz reader: 61 bilingual VI/EN exercises with links to source docs, quiz feedback, prerequisite gate and explicit human completion confirmation.
4. Practice and portfolio: search/filter all lessons, capstone evidence requirements, HTTPS URL syntax feedback, self-attested readiness gate and review checklist.
5. Privacy: no login, account, third-party API, SDK or external tracker. Learning state is stored in browser localStorage only. Export/import bounded JSON and export Markdown.
6. Optional Academy bridge: explicitly import completed lesson IDs from the Academy app on the same browser origin; don't silently mutate Academy storage.
7. Navigation to Academy, dashboard and existing standalone educational demos.
8. Theme switcher, VI/EN UI, responsive layout and keyboard reachable native controls.

## Guided practice update (2026-10-24)

Each of the 61 bilingual lessons now includes a concrete exercise checklist with state persisted locally, a copy-ready bilingual prompt for a synthetic practice session with Codex/ChatGPT, a quiz, a personal reflection note, and a required learner acknowledgement. Marking a lesson complete requires passing its quiz, completing its exercise checklist and satisfying prerequisite gates. This is **self-assessed practice**, not remote Codex execution or official certification.

The local JSON backup retains completed practice steps. Older version-1 backups continue to import correctly. Public source and the live app deliberately do not collect personal emails, code samples or secrets.

## Skills, systems and visual references

- **Frontend**: local `ak-frontend-design`, `ak-frontend-development` guidance; the product uses plain HTML/CSS/JS, no JS framework or remote dependencies.
- **Design language**: inspired by the existing Noti-style dashboard: blue/cyan tokens, tempered glass surfaces, compact nav, legible small typography, semantic progress states.
- **ASCII reveal**: the *actual* upstream `ascii-reveal` core (Quan Hoang) is vendored at `vendor/ascii-reveal-core.js` with unmodified MIT license `vendor/ASCII_REVEAL_LICENSE.txt`. Used only for first-level headings, respects reduced-motion, save-data and low-capacity devices, destroys controllers after animation. See `PROVENANCE.md`.
- The Academy's original 25 VI/EN lessons are copied from `../codex-academy/lessons.json` by `builders_curriculum.py`, with references preserved. Refresh dataset when source Academy content changes.

## Commands

```bash
cd demos/codex-path
python3 builders_curriculum.py
node --test tests/test_engine.cjs tests/test_starter.cjs
node --check app.js
node --check motion.js
node --check engine.js
```

Verified 2026-10-24: **63/63 Node unit tests (engine + starter) and 75 Chrome interactions** (390/768/1440px, including the new exercise-step completion gate).

Browser QA (from workspace root): `cd agents/BR-20261024-PARALLEL && ONLY_IDS=PATH node qa_multi.mjs`.

## Data lifecycle and limitations

- App does not execute Codex, verify remote repository contents, run tests on the learner's machine, promise job placement, or grant any credential/certificate.
- URLs are checked for `https://` syntax only; independently verify evidence, license and source access.
- Offline after page load but initial curriculum fetch requires HTTP. `file://` is unsupported.
- Browser profile/session privacy applies; shared device users should avoid importing sensitive data.
- Source links were drawn from the existing Academy snapshot dated 2026-10-24; users must check official pages for current guidance.
- No public claims about an OpenAI Ambassadors acceptance decision.


## Every Human quick start — 24 October 2026

The app opens **Start Here / Bắt đầu tại đây** by default for a browser visitor who has not chosen a section. No login, API key, GitHub account, Codex CLI or coding literacy required for the first win.

- **12 persona cards** cover 8 nontechnical and 4 technical roles. Expand advanced cards only if needed.
- **Three immediate synthetic tasks per persona**, 100% bilingual. Choose one, copy or edit a small prompt, read an illustrative answer, review two safety boxes, and mark a first win. The sample response is *not generated by a live model*.
- **Four optional placement questions** suggest Zero, Beginner, Intermediate or Advanced. A multiple-choice test cannot grant Pro status; portfolio evidence, safety and review still matter.
- **14 personalized tracks and 61 original/curated lessons** at five levels: Zero, Beginner, Intermediate, Advanced and Pro. Original Academy L01–L25 remain unchanged; independently authored Every Human lessons L26–L61 are stored in `data/every-human-extension.json`.
- Each lesson has outcomes, three tangible steps, a safety-aware prompt and a knowledge check. Progress remains browser-only, supports JSON export/import and preserves legacy schema v1 backups.
- **Private evidence** for eight nontechnical tracks: the learner may describe a synthetic 90-minute capstone in local browser storage without publishing personal data or creating a GitHub repo. Six technical tracks still require HTTPS evidence and a 180-minute capstone.
- The user must independently review AI claims, project diffs, actions, rights and outputs. Starter UI does not call models, open user files, or automatically assess skills.

### Official references (not scraped/copied articles)

- https://developers.openai.com/training
- https://developers.openai.com/learn
- https://developers.openai.com/blog/codex-as-a-platform
- https://developers.openai.com/cookbook/examples/codex/iterating-development-workflows-with-codex
- https://help.openai.com/en/articles/11369540-using-codex-with-your-chatgpt-plan

Feature access, prices and availability can change; the current official source is authoritative. This is an independent teaching product, **not official OpenAI certification**.

## Every Human Source-to-Lesson Mapping — 2026-10-25

Current canonical app: https://codex.xuanhieu.org/demos/codex-path/#start

1. **Zero-code entry:** 12 persona cards, selectable 3-minute safe first win, editable copyable prompt and *synthetic* output. Private progress stays on-device; 4-question self-assessment recommends at most Advanced (Pro must be demonstrated with projects).
2. **Progression:** 61 original lesson records — 25 inherited unmodified from Academy and 36 new applied/beginner lessons — organized as Zero / Beginner / Intermediate / Advanced / Pro.
3. **Learning paths:** 14 learner/career directions, including everyday users, students, teachers, office workers, small-business owners, job seekers, designers, communities, developers and agent builders. Each path has a tangible capstone with human review.
4. **Plain-language guide:** `#guide` includes 19 editorial summaries in VI/EN, a daily-life analogy, concrete example, common mistake, small challenge, direct practice links and 1–4 source pointers.
5. **Source/lesson registry:** 204 indexed official resource URLs (45 Codex, 158 ChatGPT, 1 Platform). Each is classified into one primary guide with search, tier and product filters. This is the **24/10/2026 source index**, not a claim that each link was checked alive today or that its full contents were copied. Full texts stay with their owner.
6. **Mapping algorithm:** `python3 builders_curriculum.py && python3 build_guide_map.py` rebuilds the deterministic source-to-lesson indexes from Academy's `lessons.json`, `catalog.json` and the curated original `every-human-extension.json`.
7. **Start-to-finish QA:** `node --test tests/test_engine.cjs tests/test_starter.cjs tests/test_guides.cjs` passed **91/91**. Real Chrome 390/768/1440px tested the full 3-minute journey, source mapping, official document search/filtering, bilingual switch, 61 lessons and 14 routes without overflow. All first-win outputs are synthetic, not AI-generated claims.
8. **Limitations:** self-reported quiz and checkbox progress are not certifications. No backend user account, live AI API, personal data upload, complete reading of all 204 linked articles, real learner study or independent WCAG certification is claimed.

Additional technical documentation: `docs/21_EVERY_HUMAN_LEARNING_MAP_2026-10-25.md` (local master workspace).

## Content quality / second review

- Source taxonomy prioritizes intended learner level before keyword topic; advanced Security/Enterprise pages cannot be misfiled into Zero.
- Manually curated official reference anchors replace unrelated filler documents.
- Legacy/deprecated resources show an explicit warning, not a current-feature assumption.
- The 36 applied lessons have scenario-specific outcomes and explanations; correct choices are distributed.
- The GitHub repository includes 25 original Academy lesson records and the dated 204-item index, allowing reproducible standalone builds.

## Real source retrieval — 2026-10-25

The dated Academy index was checked through a bounded, robots-aware real HTTP scan of **all 204 URL records** on 2026-10-25. **198 responded HTTP 200**, **six returned HTTP 404**. The scan recorded a private SHA-256 and the first small heading outline for each successfully retrieved page. It does NOT mirror full external articles publicly; the browser includes only minimal metadata and source headings.

- Local private coverage: `docs/source-audit-2026-10-25/INDEX.json` and `00_SOURCE_COVERAGE.md` (Mac mini project root).
- Public safe metadata: `data/source-health-20261025.json`, generated by `build_source_health.py` (requires the private local audit only when REBUILDING this snapshot; checking out the GitHub repo already provides a versioned snapshot).
- The 19 guide references now exclude the six detected inaccessible URLs; original 204-item historical index remains inspectable with red warnings and a filtered 404 view.
- HTTP 200 is an access check only. No automated process has fact-checked each official article body, the availability of plan-specific product features, or the correctness of every click path in the current app.
- Full editorial reading: `HANDBOOK_VI.md` (Vietnamese) and `HANDBOOK_EN.md` (English), authored educational prose linked to official sources.


## Quiet Builder visual release — 2026-10-25

Visual direction is Codex-inspired **without imitating or claiming official OpenAI sponsorship**. The local file DESIGN.md records the reusable design contract. Dark graphite and light ivory modes, neutral surfaces, readable hierarchy, reduced visual noise, source-linked practice and keyboard focus live in codex-theme.css, loaded last.
- Browser smoke 390/768/1440px: all main learning routes, VI/EN, local persistence, light/dark switching, quiz, evidence forms, source links and cross-mapping pass without horizontal overflow.
- Live deploy through Cloudflare Pages uses sanitized allowlist build; the private applicant dashboard remains segregated.
- Accessibility and visual polish are independently checked, not certified as OpenAI UI parity.


## Related real local-first learning microapps
Guide topics now map to three relevant hands-on products:
- First task, tool selection, Codex beginner → Zero-Token Workshop.
- Git diffs and first contribution → First PR Clinic.
- Human review, tests and governance → Human Review Gate.
They are educational simulations, not live GitHub account operations, agent execution or official OpenAI software.

## 2026-10-25 illustrated learning pass

- New original `visuals.js` and `visuals.css` show infographic-style learning flows for every guide and all 61 lesson dialogs, with Vietnamese/English labels, responsive mobile stacking and meaningful text alternatives.
- Primary UI emphasis changed from conflicting legacy blue/cyan/green into neutral graphite and a restrained warm earth accent. This is **independently designed, Codex-inspired** and does not reuse OpenAI trademarks or logo artwork.
- Three tools linked from the guide now have verified functioning standalone pages: N003 Zero-Token Workshop, N006 Human Review Gate, O004 First PR Clinic; additional N065 README linter and N074 Curriculum Planner are connected to the appropriate guide topics. All features use local synthetic data only.

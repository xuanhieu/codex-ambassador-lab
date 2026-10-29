# Codex × ChatGPT Zero-to-Hero Academy

Independent static web academy, 24 October 2026. Not an official OpenAI product, partner, license, certificate or certification.

## Delivered

- 204 official Codex/ChatGPT/Work documentation links from https://learn.chatgpt.com/docs/llms.txt, a dated source index. The app does NOT mirror whole official articles.
- 25 original English/Vietnamese guided lessons across 5 tiers: Zero, Beginner, Intermediate, Advanced, Pro.
- Six role filters: Newbie, Creator, Marketer, Developer, Team Lead, Pro.
- Each lesson has goals, tangible output, 3 practical steps, manual checkboxes, one quiz and authoritative source links.
- Search/filter official docs by product, topic, tier, legacy and paginated results; source bookmarks.
- LocalStorage progress, JSON export/import with schema and known ID validation, reset confirmation, dark/light and locale toggles.
- Fully static, responsive, keyboard-friendly app. No analytics, model API key, user account or backend.

## Run locally

From the academy folder, run:

    cd demos/codex-academy
    python3 -m http.server 4177 --bind 127.0.0.1

Open http://127.0.0.1:4177/ . Opening file:// may block loading local JSON via fetch; use an HTTP server.

Live: https://codex.xuanhieu.org/demos/codex-academy/ · Source: https://github.com/xuanhieu/codex-ambassador-lab/tree/main/demos/codex-academy

## Keep sources current

OpenAI index: https://learn.chatgpt.com/docs/llms.txt
Manual, author-reviewed refresh only:

    python3 catalog.py --check
    python3 catalog.py --refresh
    python3 -m unittest discover -s tests -p 'test_*.py'
    node --test tests/test_logic.cjs

For a fresh clone without sources/official-index-*.txt, run python3 catalog.py --refresh first to obtain the authoritative machine-readable index; this makes one HTTPS request. Refresh maintains a dated backup when a previous index exists and validates at least 200 entries and does not scrape article bodies. Review the changed official links before committing and publishing a new build. Catalog classifications are editorial estimates; feature availability depends on plan, device, admin policy and region.

## Course modules

| Tier | Subject examples |
|---|---|
| Zero | ChatGPT first task, Projects, effective prompting, Work, selecting Chat/Work/Codex |
| Beginner | Codex CLI, IDE, Git glossary, first code review, work with files |
| Intermediate | AGENTS.md, skills, MCP, parallel worktrees, PR evidence |
| Advanced | Permissions and approvals, subagents, codex exec, hooks, long-running work |
| Pro | Codex SDK, app-server, GitHub action CI, governance, security triage |

## 30-minute workshop

1. 0–5 minutes: select a role, identify current proficiency and missing prerequisites.
2. 5–10: search the docs catalog, open two official sources, identify one legacy warning.
3. 10–20: complete a practical lesson, check three exercises manually and pass a quiz.
4. 20–25: export progress JSON, reset, import and verify persisted completion.
5. 25–30: explain what the app checked and what it did NOT execute or validate.

## 60-minute advanced workshop

Define a bounded AGENTS.md contract in a disposable Git repo, design multiple isolated agent worktrees, create a requirement-to-test receipt, and review approval-safe CI/release gates. Real user action is always required for permissions, local CLI execution and external publishing.

## Privacy, provenance and security

- This original independent app links to official pages; it does not copy entire official guides.
- The browser interface NEVER executes CLI commands, reads local files or validates external account permissions.
- Only self-attested progress and known source/lesson IDs are stored in localStorage, never server-side. No telemetry or third-party scripts.
- JSON import accepts only validated known IDs and boolean checks; arbitrary HTML, keys, URLs and unknown state fields are rejected.
- All displayed official links use HTTPS allowlisted OpenAI documentation domains, opened with noopener protections.
- The public bundle ships `catalog.py` and `tests/`; Git internals, raw private notes and the private application form are not published.
- Generated progress backups are personal learning history; treat them carefully.
- Source is published (MIT) in `xuanhieu/codex-ambassador-lab`.

## QA commands

    python3 catalog.py --check
    python3 -m unittest discover -s tests -p 'test_*.py'
    node --test tests/test_logic.cjs
    node --check app.js
    node --check logic.js

The author's private workspace holds a Chrome CDP harness that runs a real browser test of 390/768/1440 viewports, docs search, role paths, lesson quiz gate and progress storage.

## Known limits

- Source index is a dated snapshot, not full-text live mirrored documentation.
- Document topic and level tags are inferred, not official product entitlements.
- There is no integrated classroom account, formal assessment, certificate, attendance or server-side sync.
- Native speaker proofreading and screen-reader accessibility evaluation remain additional quality gates.
- Website behavior uses static fixtures, learner choices and checklists; no real agent task is launched from it.

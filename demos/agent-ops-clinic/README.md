# Agent Ops Clinic / Phòng thực hành vận hành tác nhân

A local-first, bilingual English/Vietnamese training lab for founders and community builders. Practice delegating software work while keeping human approval, a decision trail and a spend cap. Intended for a **20-minute, hands-on community workshop**.

Built with **OpenAI Codex CLI under the author's direction**. Independent project; no OpenAI affiliation or endorsement. The application is an authored simulation, not an integration with Codex or a multi-agent runtime.

All organizations, people, task material and costs are fictional. No API calls, AI execution, security scans, payments, messages or external publishing occur. No accounts, keys, libraries, downloads or paid services are needed.

## Run locally

Requirements: Python 3 for serving files; Node.js **22 or newer** for tests. No `npm install` or build step.

```sh
git clone https://github.com/xuanhieu/agent-ops-clinic
cd agent-ops-clinic
python3 -m http.server 4173 --bind 127.0.0.1
```

Open **http://127.0.0.1:4173**. This is Python's built-in `http.server` on port 4173, bound to loopback so the workshop is local. Run every command from the repository root, the folder that contains `index.html`. Stop the server with **Ctrl+C** when finished. Serve this folder, not its parent. Opening `index.html` through `file://` is unsupported because browsers restrict ES module imports.

After the local server starts, the app needs no internet. It loads only the HTML, CSS, SVG and ES modules in this directory. It has no service worker or offline cache; keep the local server running during use. A restrictive Content Security Policy prohibits fetch/WebSocket connections, external assets, plugins and form destinations. Browser extensions and unrelated browser traffic are outside this promise.

## Test

From the demo directory:

```sh
node --test
node scripts/smoke.mjs
```

Optional equivalent npm commands: `npm test` and `npm run smoke`. They install nothing.

**Verified on 2026-10-23:** Node v24.21.0; **36 tests passed, 0 failed**. The independent smoke script passed **3 complete scenario flows** plus entry-asset checks. JavaScript syntax checks passed. No fabricated screenshots or performance measurements are included.

The initial build sandbox on 2026-10-23 could not launch Chrome and did not claim visual verification at that time. **Subsequent verification on 2026-10-24:** the actual Chrome CDP rendered the interactive workshop at 390×844, 768×900 and 1440×900, with no horizontal overflow or uncaught JS error; 15 interactive smoke checks passed (scenario selection, budget, VI language, lesson, human review). 36/36 Node tests and three complete deterministic scenario smoke flows were re-run successfully. Screenshots are kept in the maintainer's private QA workspace. No manual VoiceOver/WCAG conformance claim or genuine live agent execution is implied.

## What participants can do

- Select **startup launch**, **community nonprofit**, or **solo educator**. Each has three fictional tasks with bilingual briefs, acceptance criteria, estimates and preloaded statuses. Each scenario keeps an independent session and budget.
- Edit and save an Intake brief in the active language. Unsaved draft edits remain in memory while switching tasks or languages; save before handing off. A reload or reset discards unsaved drafts. Translations of user edits are intentionally manual.
- Move through **Intake → Plan → Build → Review → Publish**. The three workshop phases group these five states: brief; delegate and inspect; approve and release. No state can be skipped. An accepted brief locks after Intake.
- Inspect role ownership: Human, Planner, Builder, Reviewer with Human, Publisher. Each role is simulated; buttons model a human directing a handoff.
- Inspect fictional risk material, compare the proposed safe handoff, and explicitly record remediation or distribution approval. These are human attestations in a lesson, not verified operations on files or infrastructure.
- Approve human review after risks are resolved. **Request changes** returns Review to Build, clears all risk decisions and invalidates human approval. Returning to Review requires new decisions.
- Adjust the scenario's maximum spend from **$0 to $1,000**, to the cent. Publishing is blocked if the simulated total exceeds the cap, even with human approval. Equality passes. The total includes all three tasks, even already released tasks, so it cannot be reduced by publishing other tasks. Role estimates split 20% Planner / 60% Builder / 20% Reviewer / $0 Publisher. These are teaching assumptions, not vendor prices or usage measurements.
- Read local-time audit events, download the selected scenario's JSON, switch languages, refresh to replay saved decisions, and clear all workshop data with a confirmation dialog.
- Use the embedded **Teach me / Hướng dẫn** lesson and three exercises. Every interactive control has a purpose; navigation links target the lab, lesson and audit trail.

The community scenario deliberately starts at **$21 estimated / $18 cap**. Startup is **$26 / $30**; creator is **$21 / $22**. These fictional constraints create different conversations without changing the gate rules.

## Workshop recipe: 20 minutes

Preparation: one local server per participant laptop, a modern browser, and optionally pairs sharing a screen. No internet, login, API key or installation is required. Use **Clear & reset** before a new group; export first if the current practice session matters. Choose **EN** or **VI** in the header; all primary controls, task content, risk material, lesson and event labels change language.

| Time | Activity | Observable result |
| --- | --- | --- |
| 00–03 | Orientation: select a scenario; find its task queue, five-state timeline, owner and budget. | Participants can distinguish preloaded examples from executed work. |
| 03–08 | **Exercise 1 — Make done observable.** Select the first Intake task. Add a concrete acceptance criterion, save it, hand it to the Planner. Explain what work is allowed. | Audit contains `save_brief` and `advance` to Plan. |
| 08–13 | **Exercise 2 — Catch a risky handoff.** Select the preloaded Review task. Observe why release is disabled. Expand the fictional material, record the risk decision, check acceptance and approve review. Request changes. | Task returns to Build; review and risk decisions are cleared. |
| 13–18 | **Exercise 3 — Make the budget say no.** Set cap to $1. Submit the revised task for review; inspect and resolve its risk again, then approve human review. Observe that release is still disabled. Raise cap to exactly the displayed scenario estimate, publish the simulation and export JSON. | Release only occurs after review, risk and budget gates pass; export records the release snapshot. |
| 18–20 | Debrief: identify a real task to delegate, required evidence, human owner and independent spend enforcement. | Each pair can name a concrete brief, a review artifact and a release decision. |

Facilitator prompts and answer key:

1. **“Make it good” is not acceptance evidence.** A useful criterion might be: “At 390px, all labels remain readable and every action works with a keyboard.” In a real project, ask for the actual diff, rendered evidence and meaningful test output.
2. **A Reviewer cannot grant human consent.** The review checkbox records a human accepting this exercise. Credential and personal-data flags require remediation; outbound distribution requires explicit audience, content and timing approval. After revision, earlier consent applies to the old handoff, so it is cleared.
3. **Approval does not override budget.** An estimate equal to the cap passes; one cent over fails. Raising the cap is a deliberate human decision and is logged. In production, a server-side or orchestration-side spending authority must enforce the cap before paid work starts; a browser-only release gate cannot control real costs.
4. **Examples are not evidence of agent execution.** Initial Build/Review statuses are sample starting points. A `session_started` event labels their origin. Generated handoff plans are authored training content, not model output. No tests or security scans of fictional deliverables run.

### Hướng dẫn điều phối bằng tiếng Việt

- **00–03 phút:** chọn tình huống, tìm hàng đợi, vai trò và giới hạn chi phí. Nêu rõ trạng thái nạp sẵn là ví dụ.
- **03–08 phút — Bài 1:** mở việc Tiếp nhận đầu tiên; thêm tiêu chí cụ thể, lưu và giao tác nhân lập kế hoạch. Kiểm tra hai sự kiện trong nhật ký.
- **08–13 phút — Bài 2:** mở việc Kiểm duyệt nạp sẵn, xem tài liệu hư cấu và rủi ro. Ghi nhận quyết định, duyệt rồi yêu cầu chỉnh sửa. Kiểm tra phê duyệt và xử lý rủi ro đã bị đặt lại.
- **13–18 phút — Bài 3:** đặt giới hạn $1; đưa việc trở lại Kiểm duyệt, xử lý rủi ro và duyệt lại. Vẫn chưa thể phát hành. Tăng giới hạn bằng ước tính, phát hành mô phỏng và xuất JSON.
- **18–20 phút:** tìm quyết định trong bản xuất; nêu việc có thể giao, bằng chứng cần nhận và người có quyền phát hành.

Đáp án trọng tâm: tiêu chí nghiệm thu phải kiểm chứng được; tác nhân không thay con người đồng ý; chỉnh sửa làm mất hiệu lực phê duyệt cũ; phê duyệt không vượt quyền ngân sách. Chi phí, tác nhân, xử lý rủi ro và phát hành ở đây đều là mô phỏng.

## Try it with Codex / Thử với Codex

The app only simulates agents. This exercise uses the real Codex CLI on this repository's real files. Work on a fresh clone or a throwaway branch, and run everything from the repository root (the folder that contains `index.html`).

1. Start Codex in the repository root: `codex`
2. Paste this prompt:

```text
Read domain.js and tests/domain.test.js. Add ONE new node:test case to tests/domain.test.js for the budget gate: take the launch-invite task through human review with the existing reviewed() helper, lower the cap with set_budget to 100 cents, then raise it back to exactly estimateCents(state). Assert that canPublish is false at 100 cents, true again at the estimate, and that reviewApproved stays true throughout. Reuse the existing helpers (make, act, reviewed). Do not change domain.js or any other file. Run `node --test`, then show me the diff and explain each assertion in one or two sentences.
```

3. Check the result yourself:

```sh
node --test
git diff --stat
```

A good result: `node --test` reports 37 tests, 37 pass, 0 fail (36 before the change); `git diff --stat` lists only `tests/domain.test.js`; the new test asserts both cap values; and the explanation matches the rule "approval does not override budget". If Codex edits `domain.js`, or the test only checks one cap, reject the change and ask again.

**Tiếng Việt.** Mở `codex` ở thư mục gốc của repo rồi dán prompt sau:

```text
Đọc domain.js và tests/domain.test.js. Thêm MỘT test node:test mới vào tests/domain.test.js cho cổng ngân sách: đưa việc launch-invite qua bước người duyệt bằng helper reviewed() có sẵn, dùng set_budget hạ giới hạn xuống 100 cent, rồi nâng lại đúng bằng estimateCents(state). Kiểm tra canPublish là false ở mức 100 cent, true trở lại khi bằng ước tính, và reviewApproved luôn giữ là true. Dùng lại các helper có sẵn (make, act, reviewed). Không sửa domain.js hay bất kỳ file nào khác. Chạy `node --test`, sau đó cho tôi xem diff và giải thích từng assert trong một hai câu.
```

Kiểm tra bằng `node --test` và `git diff --stat`. Kết quả tốt: 37/37 test đạt (trước đó là 36), diff chỉ chạm vào `tests/domain.test.js`, và lời giải thích khớp với nguyên tắc "phê duyệt không vượt quyền ngân sách". Nếu Codex sửa `domain.js`, hãy từ chối thay đổi và yêu cầu làm lại.

## Architecture and contracts

| File | Responsibility |
| --- | --- |
| `index.html` | Semantic entry, metadata, CSP and local stylesheet/module references. |
| `styles.css` | Graphite/soft-blue design tokens, responsive layout, focus/disabled states and reduced-motion handling. |
| `domain.js` | Pure immutable commands, scenario fixtures, lifecycle, risk/review/budget gates, release snapshots, export/replay/reset. |
| `i18n.js` | Authored English/Vietnamese labels, role names and workshop lesson. |
| `samples.js` | Fictional source/proposal material for credential, personal-data and distribution review. |
| `app.js` | DOM rendering with escaped user text, delegated events, confirmations, browser persistence and JSON download. |
| `tests/domain.test.js` | Node built-in tests, including failure paths and replay invariants. |
| `scripts/smoke.mjs` | Dependency-free asset checks and three full scenario flows. |

Every domain command returns a new state or throws a coded `ClinicError`. Invalid actions do not append success events. `advance` accepts only the next lifecycle state. Review approval requires literal `confirmed: true` and all risks resolved. Secrets and PII accept only `remediated`; outbound accepts only `approved`. The UI does not offer a bypass. Budget uses safe integer US cents; negative, fractional-cent, non-finite and out-of-range caps are rejected.

`localStorage` key: **`agent-ops-clinic:v1`**. It contains version, language, selected scenario/task and one exported event stream per visited scenario. Persisted state is reconstructed by validating/replaying commands against the versioned fixtures. Invalid records start a fresh session with a visible notice. Unavailable or full storage falls back to memory with a notice. Histories are limited to 5,000 events per scenario; export and reset to continue. Open one tab per workshop: there is no multi-tab merge or conflict resolution.

The JSON export has `version`, `scenarioId`, `events` and an honesty disclosure. Each event contains an ordered ID, browser ISO timestamp, command type, optional task ID and command data. `advance` adds validated `from`/`to`; a release also captures the estimate, cap, review approval and risk decisions **at release time**. Later cap changes cannot rewrite that snapshot. The UI shows local time; ISO timestamps preserve timezone context in the export. Historical sample starting states are defined in the fixtures, not fabricated run events.

For programmatic replay after exporting the launch scenario (no imports through the UI), run from the demo directory. This uses the browser's usual Downloads location; pass the actual downloaded filename if the browser renamed it:

```sh
node --input-type=module - "$HOME/Downloads/agent-ops-clinic-launch.json" <<'JS'
import { readFile } from 'node:fs/promises';
import { replaySession } from './domain.js';
const record = JSON.parse(await readFile(process.argv[2], 'utf8'));
const state = replaySession(record);
console.log(state.tasks.map(({ id, stage }) => ({ id, stage })));
JS
```

 Export covers the currently selected scenario; export each scenario separately to keep all records. Reset removes only this application's storage key and resets all three scenarios to fresh examples. It does not delete downloaded exports or other browser data. Language remains selected for the current page; a new visit after reset defaults to English until another action persists it.

## Threat model and limitations

- Protects the **teaching workflow from accidental clicks**, not a hostile local user. All gate rules run in the browser. Someone controlling developer tools or storage can forge a valid history or modify application code. Replay validates structure and business rules; it provides no signatures, trusted identity or tamper-proof audit.
- No real credentials or personal data belong in a brief. User-edited briefs and audit payloads are plaintext in localStorage and exports. The example email uses reserved `.invalid`; no contact addresses or credential values are read from this computer.
- Human approval is a checkbox attestation without authentication. Remediation is simulated, not verified sanitization, credential rotation or data deletion. Real systems need trusted human identity, independent verification, authorization and server-side enforcement.
- The spend cap blocks **simulated release**, not work execution. No metering, real token pricing, reservation, model call or billing integration exists. Lowering a cap after a completed release affects future releases; it does not reverse the previous simulated release.
- The app does not generate code, execute agents, scan files, send messages or deploy. Preloaded tasks and authored handoff examples are intentionally limited. Changing scope does not recompute an estimate; teaching estimate adjustment beyond the spend cap is outside this lab.
- EN/VI toggles translate the authored UI and fixtures. Participant edits change only the active language version and do not receive machine translation. Technical event keys remain stable English identifiers in JSON.
- Modern browsers need ES modules, `structuredClone`, `findLast`, localStorage, Blob downloads and native `dialog`. Storage may be ephemeral in private browsing. Download permissions and assistive-technology behavior depend on the browser.
- Accessibility is implemented through native labeled buttons/forms, semantic landmarks/headings, selected-state announcements, a skip link, an aria-live decision message, visible focus rings, native modal behavior, text status labels and reduced-motion support. This is not a claim of a completed accessibility audit or WCAG certification.

## Manual browser acceptance checklist

Use a clean workshop; repeat the important path in EN and VI.

- At **390×844** and **1440×900**, check no horizontal scrolling, clipped labels or overlapping controls. Confirm long Vietnamese text wraps. Zoom to 200% and inspect the task and release controls.
- Tab from the skip link through navigation, language, scenarios, tasks, brief fields and controls. Space/Enter activates native controls and checkboxes; focus remains visible. After a disappearing action, focus returns to the task heading.
- Edit an Intake brief; switch language and back; verify draft text is retained in memory. Try handing off with unsaved edits; save, then hand off. Refresh and verify saved state replays.
- Select the preloaded Review task. Release is disabled. Expand the review sample; the risk button stays disabled until its confirmation checkbox is checked. Human review stays disabled until the risk is resolved and its own checkbox is checked.
- Approve review, then request changes. On return to Review, re-check the risk and approval gates. Set cap to $1 and verify publishing stays disabled. Set it to the exact estimate, publish, and verify the locally released state and audit snapshot.
- Change the cap after release; verify the release snapshot retains its original cap. Switch scenarios; ensure their tasks and budgets remain independent.
- Export JSON and replay it with `replaySession`. Confirm the file contains no claims of real agent/API/security-scan execution. Inspect raw UTC timestamps and human decisions.
- Open reset. Escape or Keep working cancels; focus returns to the trigger. Confirm reset; all scenario approvals/edits/logs are cleared, examples return, other site data is unaffected. Refresh to confirm reset persists.
- Disable localStorage or simulate a full quota; verify the storage notice and in-memory flow. Corrupt only this app's stored record; reload and confirm a fresh, labeled recovery. Test with a screen reader for labels, selected states, dialog focus and live messages.

## Changelog / Nhật ký thay đổi

**1.0.0 — 2026-10-23**

- Added three EN/VI scenarios, nine tasks, editable briefs, five lifecycle states, four simulated agent roles and visible handoff ownership.
- Added explicit human/risk approvals, revision invalidation, scenario-wide budget gates and immutable release snapshots.
- Added local event replay, JSON export, reset, bilingual 20-minute lesson and inspectable fictional review material.
- Added responsive, semantic, keyboard-oriented UI and documented browser-verification limits.
- Validation: **36/36 Node tests passed; 3/3 scenario smoke flows passed; JavaScript syntax checks passed.** The original build sandbox could not launch a browser; browser checks were run afterwards (2026-10-24 and 2026-10-29, see PROVENANCE_PUBLIC.md).

Source history: the Codex-built work was first committed locally as `7c1ecdf` (2026-10-23) and published to this repository on 2026-10-24.

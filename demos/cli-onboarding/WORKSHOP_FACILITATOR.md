# Codex Builder Workshop — Facilitator Pack (VI / EN)

**Draft teaching asset, prepared 2026-10-24. Not an event announcement, attendee record, OpenAI partnership or accepted Ambassador credential.**

For: new builders using macOS, Windows or Linux; Vietnamese-language learners with optional English cohort.
Core products: Codex CLI Onboarding Diagnostic (N002) and Agent Ops Clinic (O001).

## 6W2H Delivery Brief

| Dimension | VI | EN |
|---|---|---|
| What | Workshop xây dựng có kiểm thử bằng Codex | Beginner Codex: reproducible and reviewed changes |
| Who | Người mới, người dạy, cựu SV, founder | First-time builders, mentors, founders |
| Why | Biết phân biệt mô phỏng và bằng chứng chạy thật | Build confidence and evidence literacy |
| Where | Trực tuyến hoặc phòng máy tình nguyện | Online or accessible community classroom |
| When | Chỉ là dự thảo; lịch thực tế chưa công bố | Draft only; event date not confirmed |
| How | Thực hành 3 tình huống và chạy test | Synthetic fixtures + live CLI checks |
| How much | Tổ chức được ở chi phí phần mềm 0 với fixture | Zero service budget needed for offline fixtures |
| How long | 20 phút demo / 45 phút workshop sâu | 20-minute demo / 45-minute full lesson |

## Standard 20-minute agenda

| Time | Facilitator script (VI) | Evidence |
|---|---|---|
| 00–03 | "Trang web này mô phỏng, không kiểm tra máy của bạn." | Show mock banner |
| 03–08 | Chọn new-student; nêu 2 mục thiếu; chuyển ready | Distinguish observed vs expected |
| 08–15 | Chạy cli_onboarding.py --json trong repo mẫu | Sanitized JSON; avoid tokens/screens |
| 15–20 | Chạy unittest và mô tả giới hạn kiểm thử | Actual output; no fake pass |

## Full 45-minute agenda

1. **00–05 — Orientation:** what a CLI agent is, authorization, safe test repo, explicit nonaffiliation.
2. **05–12 — Fixture discovery:** ready, new-student, restricted-device cases.
3. **12–20 — Local audit:** students run --root and compare machine against fixture; missing tools are educational outcomes.
4. **20–30 — Codex practice:** use a scratch repository and a small safe README change; avoid modifying production, billing, secrets or private accounts. Optional Codex CLI invocation ONLY for students who chose to enable it; no model usage required.
5. **30–38 — Verify:** run tests and compare changed files with task scope; show a sample diff.
6. **38–43 — Human review:** identify hallucinated claims, access boundaries and real vs simulation.
7. **43–45 — Feedback:** anonymous three-question reflection; learners may leave without providing personal information.

## Instructor preparation

- Check repository permissions and confirm all fixtures are synthetic.
- Test browser keyboard navigation at 390px mobile and 1440px desktop.
- Have an offline copy of the HTML, fixtures and Python script.
- Prepare alternatives for learners without Codex subscription or API access; recorded fixtures suffice.
- Do not log keys, remote browser auth state, student names, credentials, or terminal history.
- Provide written content, readable contrast, quiet and no-pressure participation.
- Announce that any live account/API-based actions require the learner's own consent.

## Learner handout / Phiếu bài tập

### Challenge 1: Environment literacy
VN: Tại sao "new-student" chưa sẵn sàng? Hãy chỉ ra các mục thiếu mà không đoán phiên bản công cụ.
EN: Identify exactly two blockers in "new-student"; do not infer missing software versions.

Pass: list Codex CLI missing and Git repo missing from the fixture, not from the real machine.

### Challenge 2: Actual execution
VN: Chạy script thật trên repo thử nghiệm của bạn, lưu JSON không chứa token.
EN: Run real local diagnostic in a disposable Git repo and save a sanitized JSON summary.

Pass: output has keys schema, mode, checks and ready. Mode is "local".

### Challenge 3: Evidence versus narrative
VN: Test tự động chứng minh điều gì? Có chứng minh Codex đã đăng nhập không?
EN: What do unit tests prove, and what do they NOT prove?

Pass: distinguishes local binary presence from account subscription, authorization or remote tool availability.

## Reflection card (anonymous, opt-in)

- Could you explain the difference between synthetic and real outputs? Yes / Not yet.
- Did you try running a read-only local check? Yes / Not yet.
- What documentation or accessibility issue blocked you? Open text, **do not request names or contact details**.

Metrics, if a session is actually held, must be counted from genuine consented records. **No attendance is claimed by this draft.**

## Evidence pack and acceptance

- Python CLI script and actual unit tests.
- Fixture JSON + bilingual responsive browser UI.
- Actual test outputs and desktop/mobile QA captures.
- Public static workshop page, only after HTTPS verification.
- A one-page learner PDF can be made later if explicitly needed; not required to run this workshop.
- Event photos/attendance/social metrics should be marked *not yet available* until an actual event takes place.

## Mentorship escalation

If git init fails, do not elevate shell privileges automatically. If a machine lacks Node or Codex, follow official installation steps on learner-controlled hardware only. Never read a student's .env, home directories, SSH keys or private repo without their explicit agreement. For issues about payments or private production data, switch to a synthetic fixture rather than accessing the underlying account.

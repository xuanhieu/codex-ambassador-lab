# Prompt Injection Defense Clinic

Offline educational clinic for **prompt injection defense**. Four simulated attacker-vs-document scenarios teach trust boundaries, human review outcomes, and safe handling. No real customer data, no API calls, no secrets.

## What is runnable

- Static site: `index.html`, `styles.css`, `app.js`.
- Pure logic module exported from `app.js` (CommonJS in Node, global `PIClinic` in browser).
- Tests: `tests/test.cjs` (scenario logic) and `tests/test_storage.cjs` (corrupt replay log), both using `node:test`.

## Run

```bash
cd demos/prompt-injection-clinic
python3 -m http.server 4199 --bind 127.0.0.1
```

Open http://127.0.0.1:4199. Or open `index.html` directly.

Run tests:

```bash
node --test tests/test.cjs tests/test_storage.cjs
node --check app.js
```

## Scenarios

1. **S1** — Report with hidden command: sanitize and summarize.
2. **S2** — Attachment requests forwarding: block entirely.
3. **S3** — Document requests secret disclosure: block entirely.
4. **S4** — Document triggers dangerous tool: escalate to human.

## Features

- VI/EN toggle (default VI).
- Trust-boundary diagram with trusted vs untrusted zones.
- Real functional controls: scenario selector, decision buttons, safety checks, run, replay, export.
- Keyboard support: Enter to run, arrows to switch scenarios.
- Input validation on scenario/decision/checks.
- Local replay log in `localStorage` (scenario IDs and decisions only).
- Responsive single-screen layout (mobile/tablet/desktop).

## Privacy & safety

- No network requests (`connect-src 'none'`).
- No real attacks, no real customer data, no secret collection.
- Replay log stores only scenario IDs and decisions.
- Educational simulation only; not a security certification.

## Limitations

- Deterministic fixtures; not an AI model evaluation.
- No real tool execution or permission enforcement.
- Human review is simulated; cannot authenticate real approvers.
- Browser session memory retains replay log until cleared.

## Try it with Codex / Thử với Codex

Work on a fresh clone or a throwaway branch. Start Codex in `demos/prompt-injection-clinic` with `codex` and paste:

```text
Read app.js (validateChecks and evaluate) and tests/test.cjs. Add ONE new node:test case to tests/test.cjs proving that when checks is an array instead of an object, validateChecks returns error "invalid_checks" and evaluate() for scenario S1 returns status "INVALID_INPUT" with flags.invalidChecks === true. Do not change app.js or any other file. Run `node --test tests/test.cjs`, then show me the diff and explain in two sentences why strict input validation matters in a prompt-injection lesson.
```

Check it yourself from the same folder:

```bash
node --test tests/test.cjs
git diff --stat
```

A good result: 29 tests, 29 pass, 0 fail (28 before the change); `git diff --stat` lists only `tests/test.cjs`. If Codex edits `app.js`, reject the change and ask again.

## Status

Live: https://codex.xuanhieu.org/demos/prompt-injection-clinic/. `node --test tests/test.cjs tests/test_storage.cjs`: 35/35 pass (28 in `test.cjs`, 7 in `test_storage.cjs`; 2026-10-29, Node v24.22.1).

## Tiếng Việt

**Đây là gì?** Một bài thực hành nhỏ, chạy hoàn toàn trên trình duyệt, giúp bạn nhận ra prompt injection: khi tài liệu, tệp đính kèm hay báo cáo "lén" chèn lệnh để điều khiển trợ lý AI. Có bốn tình huống giả lập. Ở mỗi tình huống, bạn đánh dấu nguồn nào đáng tin, chọn cách xử lý (làm sạch rồi tóm tắt, chặn hẳn, hoặc chuyển cho người duyệt) và xem kết quả có an toàn không. Không gọi API, không dùng dữ liệu thật, không cần khóa bí mật nào.

**Dành cho ai?** Người mới dùng Codex hoặc ChatGPT cho công việc, người hướng dẫn workshop muốn có một bài tập 15–20 phút về ranh giới tin cậy, và lập trình viên muốn xem một ví dụ kiểm tra đầu vào chặt chẽ. Không cần biết bảo mật trước.

**Cách chạy**

```bash
cd demos/prompt-injection-clinic
python3 -m http.server 4199 --bind 127.0.0.1
```

Mở http://127.0.0.1:4199 (hoặc mở thẳng `index.html`). Giao diện mặc định là tiếng Việt, có nút chuyển sang tiếng Anh.

**Cách tự kiểm chứng**

```bash
node --test tests/test.cjs tests/test_storage.cjs
node --check app.js
```

Kết quả mong đợi: 35 test, 35 đạt, 0 lỗi (28 test logic tình huống trong `test.cjs` và 7 test nhật ký phát lại trong `test_storage.cjs`). Đo lần cuối ngày 29/10/2026 với Node v24.22.1.

**Thử với Codex**

Làm trên một bản clone mới hoặc một nhánh dùng xong bỏ. Mở Codex trong thư mục `demos/prompt-injection-clinic` bằng lệnh `codex` rồi dán đúng prompt dưới đây (giữ nguyên tiếng Anh để Codex hiểu chính xác):

```text
Read app.js (validateChecks and evaluate) and tests/test.cjs. Add ONE new node:test case to tests/test.cjs proving that when checks is an array instead of an object, validateChecks returns error "invalid_checks" and evaluate() for scenario S1 returns status "INVALID_INPUT" with flags.invalidChecks === true. Do not change app.js or any other file. Run `node --test tests/test.cjs`, then show me the diff and explain in two sentences why strict input validation matters in a prompt-injection lesson.
```

Sau đó tự kiểm tra lại bằng `node --test tests/test.cjs` và `git diff --stat`. Kết quả tốt: `test.cjs` từ 28 lên 29 test, tất cả đạt, và `git diff --stat` chỉ có `tests/test.cjs`. Nếu Codex sửa cả `app.js`, hãy từ chối thay đổi đó và yêu cầu làm lại.

**Giới hạn:** đây là mô phỏng để học, không phải bài đánh giá mô hình AI hay chứng nhận bảo mật. Bước "người duyệt" chỉ là giả lập.

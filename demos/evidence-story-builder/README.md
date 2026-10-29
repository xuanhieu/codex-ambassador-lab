# Evidence-to-Story Portfolio Builder

Client-side tool that turns **real** evidence into an honest portfolio narrative. It separates verified facts from unverified claims, warns against fabricated metrics, keeps a sortable evidence ledger with provenance labels, and exports portable Markdown/JSON. Everything runs in the browser; no data is uploaded.

## Run

```bash
cd demos/evidence-story-builder  # from the project checkout
node --test
python3 -m http.server 4173
# open http://127.0.0.1:4173/
```

## Features

- Project title, audience, role, summary.
- Sortable evidence ledger with real http(s) URLs, types, notes, verified toggle.
- Inline validation for required fields and URLs.
- Verified facts vs unverified claims (one item per line).
- Tests actually run (free text, multiline).
- Limitations and risks (required).
- Optional metrics with explicit confirmation; warns when numbers appear.
- Bilingual narrative draft (VI default, optional EN).
- Export Markdown and JSON, client-side only.
- Autosave to `localStorage` only, with explicit clear button.
- Sample data loader.
- Provenance labels: verified URL, user-attested, built-in sample, unverified claim.

## Files

- `index.html` — structure
- `styles.css` — Dark Bento responsive styles
- `core.js` — validation, sorting, narrative generation, serialization
- `app.js` — UI, autosave, ledger, exports
- `tests/test.cjs` — Node tests

## Limitations / honest notes

- This tool does **not** fetch or verify URLs, run tests, or certify truth.
- All metrics and test results are user-attested.
- No cryptographic signature, independent verification, or official certification.
- Autosave uses browser `localStorage` and is cleared by the explicit button or browser data clearing.
- Live demo: https://codex.xuanhieu.org/demos/evidence-story-builder/ . Source: https://github.com/xuanhieu/codex-ambassador-lab/tree/main/demos/evidence-story-builder
- Accessibility and cross-browser rendering were not manually audited beyond responsive CSS.

## Test result

`node --test`: 30/30 passed on 2026-10-29, Node v24.22.1.

## Try it with Codex / Thử với Codex

Work on a fresh clone or a throwaway branch. Start Codex in `demos/evidence-story-builder` with `codex` and paste:

```text
Read core.js (sortEvidence) and tests/test.cjs. Add ONE new node:test case to tests/test.cjs proving that sortEvidence falls back to ascending order when the direction is neither "asc" nor "desc" (for example "sideways"), and that the input array is not mutated. Use the existing C import. Do not change core.js or any other file. Run `node --test`, then show me the diff and explain each assertion in one sentence.
```

Check it yourself from the same folder:

```bash
node --test
git diff --stat
```

A good result: 31 tests, 31 pass, 0 fail (30 before the change); `git diff --stat` lists only `tests/test.cjs`. If Codex edits `core.js`, reject the change and ask again.

## Tiếng Việt

**Đây là gì?** Công cụ chạy trên trình duyệt giúp bạn viết phần giới thiệu dự án cho portfolio mà không "nói quá". Bạn nhập bằng chứng thật (đường link, loại bằng chứng, ghi chú), tách rõ điều đã kiểm chứng với điều mới chỉ là nhận định, rồi công cụ soạn sẵn một đoạn kể chuyện song ngữ và xuất ra Markdown hoặc JSON. Khi bạn gõ con số mà chưa xác nhận nguồn, công cụ sẽ cảnh báo. Mọi thứ nằm trong trình duyệt của bạn, không tải lên đâu cả.

**Dành cho ai?** Người đang làm hồ sơ xin việc, xin học bổng hay ứng tuyển chương trình cộng đồng; học viên vừa xong một dự án với Codex và muốn mô tả lại cho trung thực; người hướng dẫn muốn dạy thói quen "có bằng chứng mới nói".

**Cách chạy**

```bash
cd demos/evidence-story-builder
python3 -m http.server 4173
```

Mở http://127.0.0.1:4173/ rồi bấm nạp dữ liệu mẫu để xem thử trước khi nhập dự án của mình.

**Cách tự kiểm chứng**

```bash
node --test
```

Kết quả mong đợi: 30 test, 30 đạt, 0 lỗi (đo ngày 29/10/2026 với Node v24.22.1).

**Thử với Codex**

Làm trên một bản clone mới hoặc một nhánh dùng xong bỏ. Mở Codex trong thư mục `demos/evidence-story-builder` bằng lệnh `codex` rồi dán prompt sau (giữ nguyên tiếng Anh):

```text
Read core.js (sortEvidence) and tests/test.cjs. Add ONE new node:test case to tests/test.cjs proving that sortEvidence falls back to ascending order when the direction is neither "asc" nor "desc" (for example "sideways"), and that the input array is not mutated. Use the existing C import. Do not change core.js or any other file. Run `node --test`, then show me the diff and explain each assertion in one sentence.
```

Tự kiểm tra lại bằng `node --test` và `git diff --stat`. Kết quả tốt: 31 test, tất cả đạt (trước đó 30), và `git diff --stat` chỉ có `tests/test.cjs`. Nếu Codex sửa `core.js`, hãy từ chối và yêu cầu làm lại.

**Giới hạn:** công cụ không tự mở link, không chạy test hộ bạn và không xác nhận điều gì là đúng. Số liệu và kết quả test đều do người dùng tự khai.

# Workshop Accessibility Scorecard

A local, keyboard-first accessibility planning scorecard for workshops and meetups in Vietnamese and English communities. It is intended for all learners, including no-code and disabled participants, and does not claim WCAG conformance or certification.

## What it does

- Accessible form for venue, transport, hearing/vision, remote participation, language, low bandwidth, privacy, and cost.
- Weighted checklist with an explicit `Not sure / Chưa rõ` state.
- Deterministic score, coverage, strengths, gaps, and prioritized fixes.
- Exports a worksheet as CSV and Markdown.
- Uses only local synthetic sample data. No network, no tracking, and no participant data is stored.

## Files

- `index.html` — page structure and accessible controls.
- `styles.css` — responsive dark Bento styling.
- `app.js` — checklist data, scoring, exports, and browser behavior.
- `tests/test.cjs` — Node tests for scoring and file contracts.

## Run locally

Open `index.html` in a browser, or serve the folder locally:

```sh
python3 -m http.server 4173
```

Then open `http://localhost:4173`.

## Run tests

```sh
node --test tests/test.cjs
```

## Try it with Codex / Thử với Codex

Work on a fresh clone or a throwaway branch. Start Codex in `demos/workshop-accessibility-scorecard` with `codex` and paste:

```text
Read app.js (computeScore) and tests/test.cjs. Add ONE new node:test case to tests/test.cjs proving that answering "yes" to every item in app.ITEMS gives scorePercent 100, coveragePercent 100 and an empty gaps list. Build the answers from app.ITEMS instead of hard-coding item ids. Do not change app.js or any other file. Run `node --test tests/test.cjs`, then show me the diff and explain in two sentences why a perfect score still does not prove a venue is accessible.
```

Check it yourself from the same folder:

```sh
node --test tests/test.cjs
git diff --stat
```

A good result: 16 tests, 16 pass, 0 fail (15 before the change); `git diff --stat` lists only `tests/test.cjs`; the explanation repeats the limit stated below. If Codex edits `app.js`, reject the change and ask again.

## Honest completion note

This is a planning aid, not an accessibility audit or certification. The score only reflects the answers entered by the facilitator. `Not sure` answers are excluded from the score and shown as coverage, so they do not become false failures. A high score does not mean a venue or event is accessible; verify with disabled participants, local regulations, and real event conditions.

## Limitations

- No automated WCAG testing or assistive technology validation is performed.
- No user accounts, saved profiles, or cross-device sync.
- Sample data is synthetic and local only.
- Exported files are generated in the browser; no data is sent to a server.
- The checklist is not exhaustive for every impairment, venue, or legal requirement.

## Tiếng Việt

**Đây là gì?** Bảng tự đánh giá mức độ dễ tiếp cận của một buổi workshop hay meetup trước khi tổ chức: lối vào và di chuyển, hỗ trợ người khiếm thính hoặc khiếm thị, tham gia từ xa, ngôn ngữ, mạng yếu, quyền riêng tư và chi phí. Mỗi mục có thể trả lời "Có", "Không" hoặc "Chưa rõ". Công cụ tính điểm, cho biết bạn đã trả lời được bao nhiêu phần, chỉ ra chỗ còn thiếu theo thứ tự ưu tiên và xuất bảng ra CSV hoặc Markdown. Dùng được hoàn toàn bằng bàn phím, không cần mạng, không lưu thông tin người tham gia.

**Dành cho ai?** Người tổ chức và người hướng dẫn workshop, kể cả các buổi học Codex cho người mới, muốn kiểm tra nhanh xem buổi học có bỏ sót ai không, đặc biệt là người không biết code và người khuyết tật.

**Cách chạy**

Mở thẳng `index.html` trong trình duyệt, hoặc chạy:

```sh
cd demos/workshop-accessibility-scorecard
python3 -m http.server 4173
```

rồi mở http://localhost:4173.

**Cách tự kiểm chứng**

```sh
node --test tests/test.cjs
```

Kết quả mong đợi: 15 test, 15 đạt, 0 lỗi (đo ngày 29/10/2026 với Node v24.22.1).

**Thử với Codex**

Làm trên một bản clone mới hoặc một nhánh dùng xong bỏ. Mở Codex trong thư mục `demos/workshop-accessibility-scorecard` bằng lệnh `codex` rồi dán prompt sau (giữ nguyên tiếng Anh):

```text
Read app.js (computeScore) and tests/test.cjs. Add ONE new node:test case to tests/test.cjs proving that answering "yes" to every item in app.ITEMS gives scorePercent 100, coveragePercent 100 and an empty gaps list. Build the answers from app.ITEMS instead of hard-coding item ids. Do not change app.js or any other file. Run `node --test tests/test.cjs`, then show me the diff and explain in two sentences why a perfect score still does not prove a venue is accessible.
```

Tự kiểm tra lại bằng `node --test tests/test.cjs` và `git diff --stat`. Kết quả tốt: 16 test, tất cả đạt (trước đó 15), `git diff --stat` chỉ có `tests/test.cjs`, và phần giải thích của Codex nhắc lại giới hạn bên dưới. Nếu Codex sửa `app.js`, hãy từ chối và yêu cầu làm lại.

**Giới hạn:** đây là công cụ hỗ trợ lên kế hoạch, không phải bài kiểm định hay chứng nhận tiếp cận. Điểm cao không có nghĩa là địa điểm đã thật sự dễ tiếp cận; hãy hỏi trực tiếp người khuyết tật và kiểm tra điều kiện thực tế của buổi học.

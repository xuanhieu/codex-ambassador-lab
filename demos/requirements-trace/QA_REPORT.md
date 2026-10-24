# QA report / Báo cáo QA

Observed locally on 2026-10-24. Evidence below describes checks actually run, separately from the synthetic outcomes stored in fixtures. / Quan sát cục bộ ngày 2026-10-24. Kết quả dưới đây là kiểm tra đã chạy thật, tách biệt với khai báo tổng hợp trong mẫu.

## Observed checks / Kiểm tra đã quan sát

| Check / Kiểm tra | Observed result / Kết quả quan sát |
|---|---|
| `python3 -m unittest -v` | 23 tests, all passed; final verification run completed in 0.005 seconds / 23 kiểm tra đều đạt |
| `python3 trace.py fixtures.json --scenario covered` | Exit 0; explicitly reports claims only, no linked test execution / Mã 0, chỉ xác nhận khai báo |
| `python3 trace.py fixtures.json --scenario missing-coverage` | Exit 1; missing coverage for REQ-02 / Mã 1, thiếu bao phủ |
| `python3 trace.py fixtures.json --scenario stale-and-failed` | Exit 1; stale requirement revision and failed TEST-DUP claim / Mã 1, phiên bản cũ và khai báo lỗi |
| Inline JavaScript extracted from `index.html`, passed to local `node --check` through stdin | Exit 0, no syntax diagnostics. Node was only an available verification utility; it is not a runtime dependency. / Mã 0, không có lỗi cú pháp; không cần Node để sử dụng ứng dụng |
| Python stdlib HTMLParser inspection | Unique element IDs; all label targets exist; no remote href/src assets / ID duy nhất, nhãn có đích, không có tài nguyên từ xa |
| Interactive browser attempt | Local in-app browser unavailable (`Browser is not available: iab`). No browser behavior or visual result is claimed verified. / Không có trình duyệt tích hợp; chưa xác minh tương tác hay hiển thị |

The unit suite covers duplicate requirements/tests/links, dangling references, missing coverage, empty requirements, failed and unverified outcomes, stale requirement/test revisions, missing evidence revisions, malformed nested types, invalid IDs/text, booleans and floats in revisions/schema, strict JSON parsing, input size, Unicode round trip, manual provenance, scenario selection and CLI exit codes. / Bộ kiểm tra bao phủ trùng ID/liên kết, tham chiếu sai, thiếu bao phủ, kết quả lỗi/chưa xác minh, phiên bản cũ, sai kiểu dữ liệu, đọc JSON nghiêm ngặt, kích thước, Unicode, nguồn gốc và mã thoát.

## Public/private checklist / Danh sách công khai và riêng tư

- [x] Original implementation confined to this folder; no other project copied. / Mã gốc chỉ trong thư mục này; không sao chép dự án khác.
- [x] Fixtures explicitly synthetic, with generic IDs and no personal values. / Mẫu tổng hợp, ID chung, không có dữ liệu cá nhân.
- [x] No credentials, tokens, private paths, or personal data in deliverable fixtures. / Không có thông tin đăng nhập, khóa, đường dẫn riêng hay dữ liệu cá nhân trong mẫu.
- [x] No external APIs, HTTP requests, installs, remote assets, deployment or publishing performed. / Không gọi API, HTTP, cài đặt, tải tài nguyên từ xa, triển khai hay xuất bản.
- [x] Browser uses textContent for imported display values; no imported HTML execution path. / Giá trị nhập được hiển thị như văn bản, không thực thi HTML nhập vào.
- [x] Synthetic/manual declarations distinguished from actual validation execution; no endorsement claim. / Phân biệt khai báo với thực thi kiểm tra; không tuyên bố bảo chứng.
- [x] Export retains unknown metadata; README warns to sanitize before import/sharing. / Xuất giữ siêu dữ liệu; README nhắc làm sạch trước khi nhập/chia sẻ.
- [x] No background server or watcher started. / Không khởi chạy máy chủ hoặc tiến trình theo dõi nền.
- [ ] Real browser keyboard, download, file-picker and visual verification remains pending due to unavailable browser surface. / Còn kiểm tra bàn phím, tải xuống, chọn tệp và hiển thị trong trình duyệt thật.

## Manual browser acceptance / Nghiệm thu trình duyệt thủ công

These checks are instructions, not recorded passing outcomes. / Đây là hướng dẫn, không phải kết quả đã đạt.

1. Open `index.html` directly. Tab through file input, scenario controls, textarea, forms, outcome selects and export. Confirm visible focus and usable controls at 360px and desktop widths. / Mở trực tiếp; dùng Tab, kiểm tra tiêu điểm và màn hình nhỏ/lớn.
2. Import `fixtures.json`; load all three scenarios and compare messages with the CLI results above. / Nhập mẫu, kiểm tra ba tình huống so với CLI.
3. Add a test/link, see `unverified`, change outcome, remove link, and attempt a duplicate. / Thêm kiểm thử/liên kết, đổi kết quả, xóa và thử trùng.
4. In stale scenario change fail to pass; verify stale remains. Attest after the exercise's simulated rerun and inspect updated recorded revisions. Keep provenance synthetic. / Đổi lỗi thành đạt; kiểm tra bằng chứng vẫn cũ, xác nhận phiên bản sau bước chạy lại mô phỏng và giữ nguồn tổng hợp.
5. Export then reimport the receipt; confirm IDs, outcomes and revisions survive. Run `python3 trace.py receipt.json` on the saved file. / Xuất rồi nhập lại, so sánh dữ liệu và chạy CLI.
6. Paste invalid JSON, duplicate IDs and a dangling reference. Verify useful messages, no imported script execution, and preservation of the last valid state after rejected imports. / Thử JSON lỗi, ID trùng và tham chiếu sai; kiểm tra thông báo và trạng thái hợp lệ trước đó.

Remaining limitations: no automated browser interaction, no behavioral coverage proof, no trusted execution/signature pipeline, and no temporal expiry. These boundaries are documented in README. / Giới hạn: chưa tự động hóa tương tác trình duyệt, không chứng minh bao phủ hành vi, không có chuỗi thực thi/chữ ký đáng tin hay hết hạn theo thời gian.

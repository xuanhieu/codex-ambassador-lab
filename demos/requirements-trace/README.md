# Requirement-to-Test Trace Matrix / Ma trận yêu cầu đến kiểm thử

A local educational traceability lab: import sanitized requirements, connect stable test IDs, declare outcomes, inspect revision freshness, and export a portable evidence receipt. No installation, server, network, remote assets, or credentials required.

Phòng thực hành cục bộ: nhập yêu cầu đã làm sạch, liên kết ID kiểm thử ổn định, khai báo kết quả, kiểm tra phiên bản và xuất biên nhận. Không cần cài đặt, máy chủ, mạng hay thông tin đăng nhập.

## Run / Chạy

Prerequisites: Python 3.9+ and a modern browser. From this folder:

Yêu cầu: Python 3.9+ và trình duyệt hiện đại. Từ thư mục này:

```sh
python3 -m unittest -v
python3 trace.py fixtures.json --scenario covered
python3 trace.py fixtures.json --scenario missing-coverage
python3 trace.py fixtures.json --scenario stale-and-failed
```

Open `index.html` directly with the browser's Open File command. Select `fixtures.json` in the page's file picker; choose one of three scenarios and press **Load scenario**. No HTTP server is needed.

Mở trực tiếp `index.html` bằng lệnh mở tệp của trình duyệt. Chọn `fixtures.json` trong trang, chọn tình huống rồi nhấn **Tải tình huống**. Không cần máy chủ HTTP.

| Scenario / Tình huống | Expected CLI exit / Mã thoát dự kiến | Meaning / Ý nghĩa |
|---|---:|---|
| `covered` | 0 | Current passing synthetic claims / Khai báo tổng hợp đạt, đúng phiên bản |
| `missing-coverage` | 1 | REQ-02 has no link / REQ-02 thiếu liên kết |
| `stale-and-failed` | 1 | REQ-01 revision changed; TEST-DUP failed claim / REQ-01 đổi phiên bản; TEST-DUP khai báo lỗi |

These are explicitly synthetic fixtures, not historical run records. Stable fixture IDs `TEST-EMPTY` and `TEST-DUP` name deterministic checks implemented by `test_empty_requirements` and `test_duplicate_requirement` in `test_trace.py`. Their fixture outcomes remain synthetic even when the actual unittest suite passes.

Đây là dữ liệu tổng hợp, không phải lịch sử chạy thật. Hai ID trên tương ứng hai phép kiểm tra xác định trong `test_trace.py`. Kết quả trong dữ liệu mẫu vẫn là tổng hợp dù bộ unittest thật chạy đạt.

## Browser workflow / Quy trình trình duyệt

1. Paste JSON and press **Apply JSON**, or import a receipt/bundle. For requirements-only input use an object with a `requirements` array. Defaults are schema 1, synthetic provenance, empty tests and links. / Dán JSON và áp dụng, hoặc nhập tệp. Đầu vào chỉ có yêu cầu dùng đối tượng chứa mảng `requirements`; các giá trị còn lại có mặc định.
2. Add a stable test ID and a specific deterministic check; select requirement and test, then add a link. New outcomes start `unverified`. / Thêm ID kiểm thử và mô tả cụ thể; chọn yêu cầu và kiểm thử rồi liên kết. Kết quả ban đầu là chưa xác minh.
3. Choose `pass`, `fail`, or `unverified`. To edit requirement/test text or revision, edit the JSON and apply. Increment the revision whenever meaning changes. / Chọn kết quả. Đổi nội dung hoặc phiên bản qua JSON; tăng phiên bản khi ý nghĩa thay đổi.
4. Stale evidence stays stale when only its outcome changes. Explicitly attest current revisions after reviewing and rerunning the relevant check. / Chỉ đổi kết quả không làm mới bằng chứng. Xác nhận phiên bản hiện tại sau khi xem xét và chạy lại phép kiểm tra.
5. Export `receipt.json`, save it in this folder, and validate it: / Xuất biên nhận, lưu tại thư mục này rồi kiểm tra:

```sh
python3 trace.py receipt.json
```

Export includes the **applied matrix**, not unapplied textarea edits. Invalid coverage may be exported for diagnosis. No autosave: reload loses unsaved changes. All controls use native keyboard interaction; wide tables scroll on small screens.

Xuất trạng thái **đã áp dụng**, không xuất chỉnh sửa chưa áp dụng trong ô JSON. Có thể xuất dữ liệu thiếu bao phủ để chẩn đoán. Không tự lưu; tải lại sẽ mất thay đổi chưa xuất. Điều khiển dùng bàn phím chuẩn, bảng rộng cuộn được trên màn hình nhỏ.

## Receipt contract / Hợp đồng biên nhận

```json
{
  "schema_version": 1,
  "provenance": "synthetic",
  "requirements": [{"id": "REQ-01", "text": "Reject empty requirements / Từ chối yêu cầu rỗng", "revision": 1}],
  "tests": [{"id": "TEST-EMPTY", "text": "test_trace.TraceTests.test_empty_requirements", "revision": 1}],
  "links": [{"requirement_id": "REQ-01", "test_id": "TEST-EMPTY", "requirement_revision": 1, "test_revision": 1, "outcome": "unverified"}]
}
```

IDs are nonempty trimmed strings, unique within each entity collection. Revisions are positive integers. Links reference known IDs and unique requirement/test pairs. Every requirement needs at least one link, and **every link** must be current and passing to receive exit 0. An extra failed/unverified/stale link cannot hide behind a passing link. Unlinked tests are allowed. Unknown metadata is preserved by browser import/export and ignored by the validator.

ID không rỗng, không có khoảng trắng ở hai đầu và duy nhất trong từng nhóm. Phiên bản là số nguyên dương. Liên kết phải trỏ tới ID tồn tại và không trùng cặp. Mỗi yêu cầu cần liên kết; **mọi liên kết** phải đạt và đúng phiên bản mới trả mã 0. Cho phép kiểm thử chưa liên kết. Siêu dữ liệu bổ sung được trình duyệt giữ và CLI bỏ qua.

CLI exits: **0** valid current passing claims; **1** schema/reference/uniqueness/coverage/outcome/freshness errors; **2** file, JSON, size, or scenario-selection errors. Inputs are limited to 1,000,000 bytes. CLI rejects duplicate JSON keys and nonstandard numeric constants. / Mã CLI: **0** khai báo hợp lệ; **1** lỗi hợp đồng hoặc bằng chứng; **2** lỗi đọc/JSON/kích thước/chọn mẫu. Giới hạn 1.000.000 byte; CLI từ chối khóa JSON trùng và hằng số số không chuẩn.

## Limits and provenance / Giới hạn và nguồn gốc

Neither UI nor CLI executes linked tests, authenticates claims, proves behavioral coverage, or detects dishonest revision reuse. Freshness means revision equality, not elapsed time. `manual` means manually declared evidence, not verified execution. Receipts have no signature or execution log. The CLI is authoritative: browser JSON parsing keeps the last duplicate key and JavaScript has integer precision limits; use ordinary small positive revisions and validate exports. Do not import private data; unknown metadata is exported too. No OpenAI affiliation or endorsement is claimed.

UI và CLI không chạy kiểm thử liên kết, xác thực khai báo hay chứng minh bao phủ hành vi; không phát hiện việc cố ý giữ phiên bản cũ. Tính mới dựa trên phiên bản, không theo thời gian. `manual` chỉ là khai báo thủ công. Không có chữ ký hoặc nhật ký thực thi. CLI là chuẩn: trình duyệt giữ khóa JSON trùng cuối cùng và có giới hạn độ chính xác số nguyên. Không nhập dữ liệu riêng tư; siêu dữ liệu cũng được xuất. Không tuyên bố liên kết hay bảo chứng của OpenAI.

## 20-minute workshop / Kịch bản thực hành 20 phút

| Minutes / Phút | Facilitator script and learner action / Lời dẫn và hành động |
|---|---|
| 0–3 | “A green claim is not a test run.” Open the UI and identify the provenance notice. / “Khai báo xanh không phải lần chạy thật.” Mở UI, tìm thông báo nguồn gốc. |
| 3–6 | Import `fixtures.json`, load `covered`, identify the two exact test IDs and implementation names. / Nhập mẫu, chọn `covered`, tìm hai ID và tên kiểm thử thật. |
| 6–9 | Load `missing-coverage`. Ask which requirement lacks evidence. Add its link; explain why `unverified` still blocks success. / Tìm yêu cầu thiếu bằng chứng, thêm liên kết; giải thích vì sao chưa xác minh vẫn bị chặn. |
| 9–12 | Load `stale-and-failed`. Change fail to pass; observe that staleness remains. Discuss rerunning after a requirement change before attesting. / Đổi lỗi thành đạt, quan sát bằng chứng vẫn cũ; thảo luận chạy lại trước khi xác nhận. |
| 12–16 | Export the stale receipt into this folder and run the CLI: expect exit 1. Run the actual unittest suite separately. Distinguish its observed results from fixture claims. / Xuất biên nhận cũ, chạy CLI mã 1; chạy unittest thật riêng và phân biệt kết quả. |
| 16–19 | Edit a requirement revision in JSON, apply, inspect diagnostics; then intentionally reuse a test ID and observe import rejection. / Đổi phiên bản yêu cầu, áp dụng; sau đó tạo ID kiểm thử trùng và xem lỗi nhập. |
| 19–20 | Exit question: “What evidence would be needed beyond this receipt?” Answer: real command, run log, environment and trusted provenance. / Câu hỏi cuối: “Cần thêm bằng chứng gì?” Lệnh chạy thật, nhật ký, môi trường và nguồn đáng tin. |

See [QA_REPORT.md](QA_REPORT.md) for observed checks and remaining manual verification. / Xem báo cáo QA để biết kết quả quan sát và kiểm tra thủ công còn lại.

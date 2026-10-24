# Sanitized Bug Report Assembler / Bộ ghép báo lỗi

An original offline learning demo: preview synthetic error traces and reproduction steps, review redactions, then export a Markdown issue containing fenced text and structured JSON. No upload, external API, remote asset, dependency installation, or endorsement.

Bản thử học tập chạy ngoại tuyến: xem trước vết lỗi và các bước tái hiện giả lập, kiểm tra phần che, rồi xuất Markdown có khối văn bản và JSON. Không tải lên, API ngoài, tài nguyên mạng, cài phụ thuộc hay chứng thực.

## Start / Bắt đầu

Requirements: Python 3.10+ for CLI/tests; a modern browser with JavaScript, lookbehind regular expressions and Blob downloads for the playground. No server needed. Optional Node.js executes the JavaScript harness during tests; absence produces an explicit skip. Application runtime needs no Node.

Yêu cầu: Python 3.10+ cho CLI/kiểm thử; trình duyệt hiện đại hỗ trợ JavaScript, biểu thức chính quy lookbehind và tải Blob. Không cần máy chủ. Node.js là tùy chọn cho bộ kiểm thử JavaScript; thiếu Node sẽ ghi rõ bỏ qua, ứng dụng không cần Node.

From this folder / Chạy trong thư mục này:

```sh
python3 assembler.py fixtures.json
python3 -m unittest -v
```

Open `index.html` directly in a browser. Click **Load synthetic sample → Preview redactions**, read every line including structured data, then check the review box and download. Input edits invalidate the preview and approval. Tab navigates controls; Enter/Space activates native buttons and the checkbox. The preview is keyboard-scrollable. Narrow screens stack the two panels.

Mở trực tiếp `index.html`. Chọn **Nạp ví dụ giả lập → Xem trước**, đọc từng dòng kể cả dữ liệu có cấu trúc, đánh dấu đã kiểm tra rồi tải. Sửa đầu vào sẽ hủy xem trước và duyệt. Tab di chuyển; Enter/Space dùng nút và ô chọn. Có thể cuộn bản xem trước bằng bàn phím; màn hình hẹp xếp hai bảng theo chiều dọc.

## CLI review gate / Bước kiểm tra CLI

The first command prints only the redacted report to stdout and a SHA-256 approval digest to stderr. It does not create an output file. After reviewing the report, copy that digest into the prompt below. The command is runnable as written; enter the observed digest when prompted.

Lệnh đầu in báo lỗi đã che ra stdout và mã duyệt SHA-256 ra stderr; chưa tạo tệp xuất. Sau khi kiểm tra, nhập mã vừa thấy vào lời nhắc dưới đây.

```sh
python3 assembler.py fixtures.json
python3 -c 'import subprocess, sys; digest = input("Reviewed digest / Mã sau kiểm tra: ").strip(); sys.exit(subprocess.call([sys.executable, "assembler.py", "fixtures.json", "--output", "reviewed-report.md", "--approve", digest]))'
```

Export creates a **new** local UTF-8 file and refuses to overwrite an existing file. Choose another new output filename for a subsequent run. Wrong/stale approval fails with exit code 2 and creates no file. Exit code 0 means processing succeeded, not that no secrets remain. Approval binds to the parsed input values, implementation version and generated report; whitespace between JSON tokens does not change it. It is an intentional human checkpoint, not authentication or proof someone actually read the report. Do not automate copying the digest into export.

Xuất tạo tệp UTF-8 **mới**, không ghi đè. Lần sau dùng tên mới. Mã sai/cũ trả mã thoát 2 và không tạo tệp. Mã 0 chỉ nghĩa xử lý thành công, không bảo đảm hết bí mật. Mã duyệt gắn với giá trị JSON đã phân tích, phiên bản và báo lỗi; khoảng trắng giữa các token JSON không đổi mã. Đây là bước dừng cho người kiểm tra, không phải xác thực hay bằng chứng đã đọc. Không tự động truyền mã duyệt để bỏ qua kiểm tra.

Input is a UTF-8 JSON object with **exactly** `title`, `trace`, `steps`, all nonempty strings; steps are one multiline string. Unknown fields are rejected to avoid silently dropping context. Limit: 200,000 Unicode code points total; CLI also caps source files at 800,000 bytes. Use `fixtures.json` as the deterministic example. Browser sample and fixture are explicitly synthetic; entered content is labeled user-supplied in output rather than falsely certified synthetic.

Đầu vào là JSON UTF-8 có **đúng** ba trường `title`, `trace`, `steps`, đều là chuỗi có nội dung; các bước nằm trong một chuỗi nhiều dòng. Từ chối trường lạ để tránh bỏ sót ngữ cảnh âm thầm. Tối đa 200.000 ký tự Unicode, tệp CLI tối đa 800.000 byte. Dùng `fixtures.json` làm mẫu cố định. Ví dụ được ghi rõ giả lập; dữ liệu nhập được ghi là do người dùng cung cấp, không tự chứng nhận là giả lập.

## Explicit rules / Quy tắc cụ thể

Applied independently to all three fields, in this order / Áp dụng riêng cho cả ba trường theo thứ tự:

| Rule / Quy tắc | Exact scope / Phạm vi |
|---|---|
| Normalize / Chuẩn hóa | CRLF and CR → LF; remove C0/C1 controls except tab/LF, plus U+202A–U+202E and U+2066–U+2069, before matching. / Bỏ ký tự điều khiển trước khi tìm mẫu. |
| Bearer | Case-insensitive ASCII word boundary `Bearer`, spaces/tabs, then one or more characters excluding whitespace, C0 controls, quotes, angle brackets and backticks. Entire match → `[BEARER_REDACTED]`. / Không phân biệt hoa thường; che cả cụm. |
| Assigned keys / Khóa gán | Case-insensitive `api[_-]?key`, `access[_-]?token`, `secret[_-]?key` at ASCII word boundary, optional spaces/tabs, `:` or `=`, optional quote, ≥8 characters in ASCII letters/digits or `_./+-=`, optional quote. Entire assignment → `[API_KEY_REDACTED]`. / Che cả tên gán và giá trị. |
| Prefix keys / Tiền tố khóa | Word-delimited `sk-` + ≥16 ASCII alphanumeric/underscore/hyphen; `ghp_` or `github_pat_` + ≥20 ASCII alphanumeric/underscore; `AKIA` or `ASIA` + exactly 16 uppercase letters/digits. Case-sensitive. / Phân biệt hoa thường. |
| Email | ASCII local part using letters/digits and common email punctuation, `@`, ASCII letter/digit/dot/hyphen domain, final dot and ≥2 ASCII letters. This is a heuristic, not full email validation. → `[EMAIL_REDACTED]`. / Mẫu gần đúng, không phải kiểm tra email đầy đủ. |
| Home paths / Đường dẫn | Case-insensitive `/Users/`, `/home/`, `/root/` or word-delimited `/root`; Windows drive-letter paths under `Users` or `Documents and Settings`, using slash or backslash. Continue until whitespace, C0, quote, angle bracket, backtick or pipe. → `[HOME_PATH_REDACTED]`. / Đường dẫn có khoảng trắng có thể còn phần dư. |
| IP literals / Địa chỉ IP | Four decimal octets 0–255, no leading zero except `0`; valid compressed/full IPv6, mapped IPv4 and optional zone suffix. No DNS. IPv6 brackets/ports remain. → `[IP_REDACTED]`. / Giữ dấu ngoặc và cổng. |

Matching order consumes nested matches: an email inside a home path may be counted as email first; a key containing an IP is counted as key. Counts represent replacements, not the number of independent secrets. Python uses `ipaddress`; the browser has a local literal validator, with shared test vectors for both implementations. They produce equivalent structured content on the covered vectors; JSON whitespace formatting differs.

Thứ tự xử lý ảnh hưởng số đếm: email trong đường dẫn có thể được đếm trước; khóa chứa IP được đếm là khóa. Số đếm là số lần thay thế, không phải số bí mật độc lập. Python dùng `ipaddress`; trình duyệt có bộ kiểm tra địa chỉ cục bộ, cùng kiểm thử bằng các mẫu chung. Nội dung có cấu trúc tương đương trên các mẫu đã kiểm tra; cách xuống dòng JSON khác nhau.

## Output and limitations / Đầu ra và giới hạn

`assembler.py` owns the CLI and schema; `index.html` is a self-contained browser implementation. Output includes schema version 1, supplied-content provenance, a permanent warning, redaction counts and sanitized fields. User text stays inside dynamically sized backtick fences in Markdown; the browser uses `textContent`, never HTML rendering. Structured JSON is fenced too. Removing the fences or importing fields into HTML without escaping loses that protection.

`assembler.py` chứa CLI và schema; `index.html` là bản trình duyệt độc lập. Đầu ra gồm phiên bản schema 1, nguồn dữ liệu, cảnh báo luôn có, số lần che và các trường đã xử lý. Văn bản người dùng nằm trong khối mã có dấu phân cách dài hơn mọi chuỗi backtick đầu vào; trình duyệt dùng `textContent`. JSON cũng nằm trong khối mã. Bỏ dấu phân cách hay đưa trường vào HTML không escape sẽ mất bảo vệ đó.

**Zero matches never means safe.** This is not a DLP system or a secret-validity checker. Unknown key formats, passwords, split/encoded secrets, Unicode email addresses, names, hostnames, UNC/relative/custom paths and fragments after spaces may survive. Recognizable values in innocuous text may be over-redacted (version numbers can resemble IPs). Keep originals elsewhere only if appropriate; this demo does not manage originals or revoke credentials. CLI stdout, terminal scrollback, browser memory, OS downloads and manually saved files can persist outside the app. Browser extensions and the surrounding operating system are outside the threat model. Review locally; this tool never submits an issue.

**Không khớp mẫu không có nghĩa an toàn.** Đây không phải hệ thống DLP hay công cụ xác minh khóa. Có thể sót khóa lạ, mật khẩu, bí mật bị chia/mã hóa, email Unicode, tên, tên miền, đường dẫn UNC/tương đối/riêng và phần sau khoảng trắng. Có thể che quá mức, như số phiên bản giống IP. Bản thử không quản lý bản gốc hay thu hồi khóa. Terminal, bộ nhớ trình duyệt, tệp tải và tệp lưu tay có thể tồn tại ngoài ứng dụng. Tiện ích trình duyệt và hệ điều hành nằm ngoài mô hình rủi ro. Kiểm tra cục bộ; công cụ không gửi báo lỗi.

## 20-minute workshop / Kịch bản 20 phút

| Time / Phút | Facilitator script + action / Lời dẫn và thao tác |
|---|---|
| 0–3 | “What could a stack trace reveal? / Vết lỗi có thể lộ gì?” Identify paths, contact details and authorization. Establish synthetic-only inputs; no actual accounts. / Nhận diện đường dẫn, liên hệ và xác thực; chỉ dùng dữ liệu giả lập. |
| 3–7 | Open playground, load sample, preview. Compare raw and processed panels; find all eight replacements and inspect counts. / Mở ví dụ, so sánh hai bảng, tìm tám lần che và số đếm. |
| 7–10 | Add `password=WORKSHOP_ONLY` and a relative path. Observe they survive. “Zero matches is not approval. / Không khớp không phải được duyệt.” Remove these lines manually if preparing an issue. / Quan sát mẫu không che; sửa tay khi chuẩn bị báo lỗi. |
| 10–13 | Inspect the sample's Markdown injection as literal text. Review and download; edit a field, observe approval reset. / Kiểm tra Markdown độc hại chỉ là văn bản; duyệt và tải, rồi sửa để thấy hủy duyệt. |
| 13–17 | Run CLI preview, inspect structured data, then enter the digest in the export command above. Change a field in a separate synthetic JSON and demonstrate rejection of stale approval. / Chạy CLI, đọc JSON, nhập mã duyệt; đổi trường trong bản JSON giả lập riêng và thấy mã cũ bị từ chối. |
| 17–20 | Run tests. Each learner names one covered and one uncovered class. Use the public/private checklist before manually sharing any report. / Chạy kiểm thử; mỗi người nêu một loại được che và một loại bị sót; dùng checklist trước khi tự chia sẻ. |

Evidence and remaining manual checks / Bằng chứng và kiểm tra thủ công còn lại: [QA_REPORT.md](QA_REPORT.md).

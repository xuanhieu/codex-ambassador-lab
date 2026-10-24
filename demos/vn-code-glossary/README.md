# EN–VI Code Concept Glossary Compiler

An independent offline learning app with 24 original novice developer terms in six categories. Each term includes English and Vietnamese names, meanings, an example, and a misconception. No affiliation or endorsement is claimed.

Ứng dụng học tập ngoại tuyến độc lập với 24 thuật ngữ gốc dành cho người mới, chia thành sáu nhóm. Mỗi thuật ngữ có tên, ý nghĩa bằng tiếng Anh và tiếng Việt, ví dụ và hiểu lầm thường gặp. Không tuyên bố liên kết hay được nhà cung cấp bảo trợ.

## Run / Chạy

Run these commands **from this folder**, using Python 3.9 or newer. No installation, server, network access, or account is needed. Open `index.html` directly in a modern browser using its Open File command. JavaScript must be enabled for the interactive app.

Chạy các lệnh sau **trong thư mục này**, bằng Python 3.9 trở lên. Không cần cài gói, máy chủ, mạng hoặc tài khoản. Dùng chức năng mở tệp của trình duyệt hiện đại để mở trực tiếp `index.html`. Cần bật JavaScript để dùng ứng dụng tương tác.

```sh
python3 compiler.py validate
python3 compiler.py compile
python3 -m unittest -v
```

Expected validation success text / Thông báo khi xác thực thành công:

```text
OK: 24 terms / thuật ngữ; validate
```

This line documents the success format, not evidence that arbitrary edited files passed. Actual observed results are in `QA_REPORT.md`.

Dòng trên mô tả định dạng thành công, không chứng minh mọi bản chỉnh sửa đều đạt. Kết quả quan sát thực tế nằm trong `QA_REPORT.md`.

## Files / Các tệp

| File / Tệp | Purpose / Mục đích |
|---|---|
| `glossary.json` | Original curated data and representative fixture / Dữ liệu gốc được biên soạn và mẫu kiểm thử |
| `compiler.py` | Stdlib schema validator, CLI, HTML/CSS/JS template / Trình xác thực lược đồ, CLI và mẫu giao diện |
| `index.html` | Generated standalone app; rebuild rather than edit / Ứng dụng độc lập được tạo; biên soạn lại thay vì sửa trực tiếp |
| `test_compiler.py` | Deterministic tests and inline invalid fixtures / Kiểm thử xác định và mẫu dữ liệu sai trong mã |
| `README.md` | Instructions and workshop / Hướng dẫn và buổi thực hành |
| `QA_REPORT.md` | Observations, limits and public/private checklist / Kết quả, giới hạn và danh sách công khai/riêng tư |

## Use / Sử dụng

Search matches both languages, IDs, examples and misconceptions. Search is case-insensitive and removes combining accents, with `đ` mapped to `d`; try `kiem thu`, `quyen` or NFD Vietnamese text. Category and search filters combine. Clear filters resets both. English/VI buttons change interface language and primary definitions while retaining the other language's name and meaning for comparison.

Tìm kiếm đối chiếu cả hai ngôn ngữ, ID, ví dụ và hiểu lầm. Không phân biệt chữ hoa, dấu kết hợp; `đ` được quy về `d`. Thử `kiem thu`, `quyen` hoặc văn bản tiếng Việt dạng NFD. Bộ lọc nhóm kết hợp với tìm kiếm. Nút xóa bộ lọc đặt lại cả hai. Nút English/Tiếng Việt đổi ngôn ngữ giao diện và phần giải nghĩa chính, đồng thời giữ tên và ý nghĩa ở ngôn ngữ còn lại để đối chiếu.

Use Tab/Shift+Tab for every control and term card. Within focused cards, ↑/↓ move in reading order; Home/End reach the first/last result. Focus indicators, a skip link, native labels, document and bilingual text language attributes, and a live result count support keyboard and assistive-technology use. The layout uses the full viewport and becomes one column on small screens.

Dùng Tab/Shift+Tab cho mọi điều khiển và thẻ. Khi thẻ có tiêu điểm, ↑/↓ di chuyển theo thứ tự đọc; Home/End đến kết quả đầu/cuối. Có viền tiêu điểm, liên kết bỏ qua phần đầu, nhãn chuẩn, thuộc tính ngôn ngữ cho trang và văn bản song ngữ, cùng thông báo số kết quả. Bố cục dùng chiều rộng màn hình và chuyển thành một cột trên màn hình nhỏ.

JSON and Markdown downloads always contain **all terms in both languages**, independent of filters and language choice. JSON retains the versioned source format and can be validated again. No persistence or file upload is used: recompile after editing source data.

Bản tải JSON và Markdown luôn chứa **mọi thuật ngữ bằng cả hai ngôn ngữ**, bất kể bộ lọc hay ngôn ngữ giao diện. JSON giữ định dạng nguồn có phiên bản và có thể xác thực lại. Không lưu trạng thái hay tải tệp vào ứng dụng: biên soạn lại sau khi sửa dữ liệu nguồn.

## Schema and CLI / Lược đồ và CLI

The validator implements a closed JSON schema directly with Python stdlib; it does not depend on a JSON Schema package or implement that standard's entire vocabulary. Root keys must be exactly `schema_version` (integer `1`, not boolean) and `terms` (nonempty array). Each term must contain exactly:

Trình xác thực thực hiện lược đồ JSON đóng bằng thư viện chuẩn Python; không phụ thuộc gói JSON Schema và không thực hiện toàn bộ từ vựng của tiêu chuẩn đó. Gốc phải có đúng `schema_version` (số nguyên `1`, không phải boolean) và `terms` (mảng không rỗng). Mỗi thuật ngữ phải có đúng:

- `id`: unique lowercase ASCII kebab-case, e.g. `token-budget` / ID duy nhất, chữ thường ASCII và dấu gạch nối.
- `category`: `version-control`, `quality`, `terminal`, `execution`, `ai`, or `building` / Một trong sáu nhóm này.
- `name`, `meaning`, `misconception`: objects with exactly `en` and `vi` text / Đối tượng có đúng hai trường văn bản `en` và `vi`.
- `example`: nonempty text / Văn bản không rỗng.

All text must be nonblank and at most 4,000 characters before trimming; control characters other than tab/newline and unpaired Unicode surrogates are rejected. Duplicate JSON keys are rejected. Text is trimmed and normalized to NFC in the returned data and compiled artifact; the input file is never rewritten. IDs are checked as written, not silently corrected. The validator permits additional terms for the workshop; a separate fixture test enforces 24 terms in the curated source.

Mọi văn bản phải không rỗng và dài tối đa 4.000 ký tự trước khi cắt khoảng trắng; từ chối ký tự điều khiển trừ tab/xuống dòng và surrogate Unicode đơn lẻ. Từ chối khóa JSON trùng. Văn bản được cắt khoảng trắng đầu/cuối và chuẩn hóa NFC trong dữ liệu trả về và bản biên soạn; không ghi lại tệp đầu vào. ID được kiểm tra nguyên dạng, không tự sửa. Trình xác thực cho phép thêm thuật ngữ khi thực hành; kiểm thử mẫu riêng yêu cầu dữ liệu gốc có 24 thuật ngữ.

```sh
python3 compiler.py --help
python3 compiler.py validate practice.json
python3 compiler.py compile practice.json --output practice.html
```

Validation and compilation return exit code `0` on success, `1` on data/file errors; argparse returns `2` for incorrect command syntax. Compile writes the specified output after validation; source and output must differ. Use paths inside this demo and select a fresh output name when preserving previous work.

Xác thực và biên soạn trả mã thoát `0` khi thành công, `1` khi lỗi dữ liệu/tệp; argparse trả `2` khi cú pháp lệnh sai. Biên soạn ghi vào tệp xuất sau khi xác thực; tệp nguồn và tệp xuất phải khác nhau. Dùng đường dẫn trong bản minh họa này và chọn tên xuất mới nếu cần giữ bản cũ.

## 20-minute workshop / Kịch bản thực hành 20 phút

1. **0–3 min / phút — Explain / Giải thích.** Facilitator: “Search `commit`. Does a commit upload code?” Learner switches EN/VI and answers using the misconception. / Người hướng dẫn: “Tìm `commit`. Commit có tải mã lên mạng không?” Người học đổi EN/VI và dùng phần hiểu lầm để trả lời.
2. **3–7 — Predict / Dự đoán.** Find `assertion` and `tests`. Ask what a passing check proves. In this folder, run the following harmless Python check. / Tìm `assertion` và `tests`. Hỏi phép kiểm tra đạt chứng minh được gì. Trong thư mục này, chạy phép kiểm tra Python sau:

   ```sh
   python3 -c 'assert 2 + 3 == 5; print("Check passed / Kiểm tra đạt")'
   ```

3. **7–12 — Curate / Biên soạn.** Download JSON and save a copy as `practice.json` here. Duplicate one entry; give it ID `branch`, category `version-control`, EN name “Branch”, VI name “Nhánh”, meanings “A movable reference to a line of development.” / “Tham chiếu có thể di chuyển đến một dòng phát triển.”, example `git branch`, and misconceptions “A branch is not a separate full copy of every file.” / “Nhánh không phải bản sao đầy đủ riêng biệt của mọi tệp.” Edit the JSON with a local text editor. / Tải JSON và lưu bản sao thành `practice.json` tại đây. Sao chép một mục, thay các trường theo nội dung trên bằng trình soạn thảo cục bộ.
4. **12–17 — Validate / Xác thực.** Run the commands below; expect 25 terms. Then change `branch` to `git`, run validation again, and observe the actual duplicate-ID error (exit `1`). Restore `branch`, validate and compile. / Chạy các lệnh dưới; kỳ vọng 25 thuật ngữ. Đổi `branch` thành `git`, xác thực lại và quan sát lỗi ID trùng thực tế (mã `1`). Khôi phục `branch`, xác thực và biên soạn.

   ```sh
   python3 compiler.py validate practice.json
   python3 compiler.py compile practice.json --output practice.html
   ```

5. **17–20 — Demonstrate / Trình bày.** Open `practice.html`, use Tab then arrow keys on cards, search `nhanh`, toggle VI, and download Markdown. Explain why a structurally valid translation may still be wrong. / Mở `practice.html`, dùng Tab rồi phím mũi tên trên thẻ, tìm `nhanh`, đổi sang VI và tải Markdown. Giải thích vì sao bản dịch đúng cấu trúc vẫn có thể sai nghĩa.

Success criteria: valid 25-term practice data, an observed duplicate-ID rejection, and a learner's explanation separating validation from factual accuracy. These are exercise targets, not claimed session outcomes.

Tiêu chí: dữ liệu thực hành 25 mục hợp lệ, đã quan sát lỗi ID trùng và người học phân biệt được xác thực cấu trúc với độ chính xác nội dung. Đây là mục tiêu bài tập, không phải kết quả đã được ghi nhận trong phiên này.

## Limits / Giới hạn

Examples are educational text; the app never executes commands. Git examples need an existing practice repository, and the PR example only compares local branches: it creates no PR. AI-related examples manipulate local strings or metadata and invoke no model. No sandbox or OS approval system is implemented. Search folding is tailored to Vietnamese/English, not a general linguistic search engine. Code snippets may contain comments in both languages without individual language markup.

Ví dụ là văn bản giáo dục; ứng dụng không thực thi lệnh. Ví dụ Git cần kho thực hành có sẵn; ví dụ PR chỉ so sánh nhánh cục bộ, không tạo PR. Ví dụ AI chỉ thao tác chuỗi hoặc siêu dữ liệu cục bộ, không gọi mô hình. Không triển khai sandbox hoặc cơ chế chấp thuận của hệ điều hành. Tìm không dấu được thiết kế cho VI/EN, không phải công cụ ngôn ngữ tổng quát. Đoạn mã có thể có chú thích song ngữ mà không đánh dấu ngôn ngữ từng phần.

Python's 25 core tests need only stdlib. A 26th test uses an already available local Node.js runtime to execute the actual app script in a minimal DOM harness; it is skipped if Node.js is absent. No packages are installed. This harness does not establish visual, screen-reader or actual browser-download conformance. See the manual checks and evidence in `QA_REPORT.md`.

25 kiểm thử Python cốt lõi chỉ cần thư viện chuẩn. Kiểm thử thứ 26 dùng Node.js cục bộ có sẵn để chạy mã ứng dụng với mô hình DOM tối giản; bỏ qua nếu không có Node.js. Không cài gói. Mô hình này không chứng minh giao diện, trình đọc màn hình hay tải tệp trong trình duyệt thật đã đạt. Xem bằng chứng và kiểm tra thủ công trong `QA_REPORT.md`.

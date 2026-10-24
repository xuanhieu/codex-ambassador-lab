# QA report / Báo cáo kiểm tra

Scope: this isolated demo folder only. No production services, external requests, credentials, package installation, publishing or GitHub operations were used. / Phạm vi: chỉ thư mục minh họa độc lập này. Không dùng hệ thống sản xuất, yêu cầu mạng, thông tin xác thực, cài gói, xuất bản hay thao tác GitHub.

## Observed automated evidence / Bằng chứng tự động đã quan sát

Executed locally on 2026-10-24 / Đã chạy cục bộ ngày 24-10-2026:

| Command / Lệnh | Observed result / Kết quả quan sát |
|---|---|
| `python3 compiler.py compile` | Exit 0; `OK: 24 terms / thuật ngữ; compile` |
| `python3 compiler.py validate` | Exit 0; `OK: 24 terms / thuật ngữ; validate` |
| `python3 -m unittest -v` | 26 tests passed, no failures or skips / 26 kiểm thử đạt, không lỗi hoặc bỏ qua |

The suite verifies all 24 curated IDs and bilingual fields; all six categories; NFC/NFD equivalence and accent-preserving normalization; `đ` search folding; duplicate IDs and JSON keys; malformed input; invalid IDs, categories, fields, types, versions and controls; workshop additions; input immutability; CLI success/failure and source-overwrite protection; safe script embedding; and deterministic regeneration matching `index.html`.

Bộ kiểm thử xác minh 24 ID và các trường song ngữ; sáu nhóm; tính tương đương NFC/NFD và chuẩn hóa giữ dấu; tìm `đ` không dấu; ID và khóa JSON trùng; dữ liệu lỗi; ID, nhóm, trường, kiểu, phiên bản và ký tự điều khiển sai; thêm mục thực hành; không sửa đầu vào; CLI thành công/thất bại và bảo vệ tệp nguồn; nhúng dữ liệu script an toàn; tạo lại kết quả xác định khớp `index.html`.

An available local Node.js runtime executed the generated app's actual JavaScript with a minimal DOM harness: initial 24 cards, accent-insensitive and NFD search, combined filters, EN/VI state and translated card title, five workshop steps, ArrowDown/Home/End card focus, reset focus, empty results, full bilingual JSON export, and Markdown export were checked. Blob contents were inspected; no browser download was performed. Node.js is optional; absent Node skips this one test, leaving 25 stdlib tests.

Node.js có sẵn cục bộ đã chạy JavaScript thực tế của ứng dụng với mô hình DOM tối giản: 24 thẻ ban đầu, tìm không dấu và NFD, kết hợp bộ lọc, trạng thái EN/VI và tiêu đề thẻ được dịch, năm bước thực hành, tiêu điểm bằng ArrowDown/Home/End, tiêu điểm khi đặt lại, không có kết quả, xuất JSON song ngữ đầy đủ và xuất Markdown. Đã kiểm tra nội dung Blob; không tải bằng trình duyệt thật. Node.js là tùy chọn; nếu thiếu sẽ bỏ qua kiểm thử này, còn 25 kiểm thử thư viện chuẩn.

## Localization and accessibility review / Rà soát bản địa hóa và khả năng tiếp cận

Source review: Vietnamese text has accents, distinguishes permission from approval and Unicode normalization from search folding, and warns that schema validity does not establish translation accuracy. English technical names remain available beside localized names. Shell/Python examples have no execution control. The language toggle updates `html.lang`, primary UI text, category labels, and pressed states; alternate language definitions have their own `lang` attribute.

Rà soát mã nguồn: tiếng Việt có dấu, phân biệt quyền truy cập với sự chấp thuận, phân biệt chuẩn hóa Unicode với tìm không dấu, và nêu rõ lược đồ hợp lệ không chứng minh bản dịch đúng. Tên kỹ thuật tiếng Anh vẫn hiển thị cạnh tên bản địa hóa. Ví dụ shell/Python không có điều khiển thực thi. Nút ngôn ngữ cập nhật `html.lang`, nội dung giao diện chính, nhãn nhóm và trạng thái nhấn; phần giải nghĩa ở ngôn ngữ còn lại có thuộc tính `lang` riêng.

Implemented: full-width responsive grid, single-column small-screen layout, wrapping code, native labeled controls, keyboard-operable buttons/select/search, focusable term cards, visible focus rings, skip link, semantic headings, and a polite live result count. Header button foreground/background colors were explicitly set during review to keep the unselected language readable.

Đã triển khai: lưới đáp ứng toàn chiều rộng, một cột trên màn hình nhỏ, mã tự xuống dòng, điều khiển chuẩn có nhãn, nút/bộ chọn/tìm kiếm dùng được bằng bàn phím, thẻ có thể nhận tiêu điểm, viền tiêu điểm rõ, liên kết bỏ qua phần đầu, tiêu đề ngữ nghĩa và thông báo số kết quả. Màu chữ/nền nút ở phần đầu được đặt rõ khi rà soát để ngôn ngữ chưa chọn vẫn đọc được.

**Not performed:** real-browser rendering, screen-reader assessment, browser download interaction, 200%/400% zoom, and device checks. No WCAG conformance claim or native Vietnamese speaker sign-off is made. DOM tests establish logic, not those results.

**Chưa thực hiện:** hiển thị trong trình duyệt thật, đánh giá trình đọc màn hình, tải tệp bằng trình duyệt, thu phóng 200%/400% và thử trên thiết bị. Không tuyên bố đạt WCAG hoặc đã được người bản ngữ phê duyệt. Kiểm thử DOM xác minh logic, không xác minh các kết quả này.

Manual follow-up / Kiểm tra thủ công tiếp theo:

- Open `index.html` from disk; test at 360px and wide desktop widths, and at 200%/400% zoom. Check text wrapping and focus visibility. / Mở tệp trực tiếp; thử chiều rộng 360px, màn hình rộng và thu phóng; xem xuống dòng và tiêu điểm.
- Use only the keyboard: skip link, language buttons, search, select, reset, downloads, card arrows/Home/End. / Chỉ dùng bàn phím để thử các điều khiển và phím chuyển thẻ.
- With a screen reader, confirm language pronunciation, control labels, headings, and result announcements. / Dùng trình đọc màn hình để kiểm tra ngôn ngữ, nhãn, tiêu đề và thông báo kết quả.
- Download both formats with an active filter; confirm all 24 terms and Vietnamese accents remain. Validate downloaded JSON locally. / Tải hai định dạng khi đang lọc; xác nhận đủ 24 mục có dấu; xác thực JSON cục bộ.

## Public/private checklist / Danh sách công khai và riêng tư

- [x] Original educational definitions and examples; no copied private project material. / Nội dung giáo dục gốc; không sao chép dự án riêng tư.
- [x] Fixtures contain generic concepts and numbers; no people, contacts, secrets, account IDs or credentials. / Mẫu chỉ có khái niệm và số chung; không có dữ liệu cá nhân hay bí mật.
- [x] No external assets, imports, fetch calls, analytics, storage or model APIs in the app. CSP also disallows network connections. / Không tài nguyên ngoài, import, fetch, phân tích, lưu trạng thái hoặc API mô hình; CSP cũng chặn kết nối mạng.
- [x] Commands are displayed as practice examples, never executed by the web app. / Lệnh là ví dụ thực hành, không chạy trong ứng dụng web.
- [x] AI metadata, approval strings and sandbox path inspection are explicitly illustrative; no model, OS permission grant or security isolation is simulated as real. / Siêu dữ liệu AI, chuỗi chấp thuận và xem đường dẫn đều được nêu là minh họa; không giả là đã chạy mô hình, cấp quyền hay cô lập bảo mật.
- [x] Observed test results are separated from workshop targets and unperformed manual checks. / Tách kết quả quan sát khỏi mục tiêu bài tập và kiểm tra chưa thực hiện.
- [x] No affiliation, endorsement, deployment or publication claim. / Không tuyên bố liên kết, bảo trợ, triển khai hay xuất bản.
- [x] Only local demo artifacts were written; no background servers were started. / Chỉ ghi tệp minh họa cục bộ; không khởi chạy máy chủ nền.

These checks describe current local artifacts; they are not authorization to publish future additions. / Danh sách mô tả các tệp cục bộ hiện tại, không cấp quyền xuất bản nội dung thêm về sau.

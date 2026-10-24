# QA and provenance / QA và nguồn gốc

Scope: this isolated demo folder only. Original Python standard-library implementation and inline HTML/CSS/JavaScript. No network, installs, credentials, production, publishing, or GitHub operations were used.

Phạm vi: chỉ thư mục minh họa này. Mã gốc dùng thư viện chuẩn Python và HTML/CSS/JavaScript nội tuyến. Không truy cập mạng, cài gói, dùng thông tin đăng nhập hoặc triển khai.

## Observed verification / Kiểm tra quan sát được

Command run locally:

```sh
PYTHONDONTWRITEBYTECODE=1 python3 -m unittest -v test_receipt.py
```

**26 tests passed**, exit **0**, in the final verification run. Each test creates and cleans an isolated temporary Git repository **inside this folder**, with fixed synthetic content and a neutral reserved-domain identity. No real project history is inspected. Durations are environmental, not deterministic fixture values.

**26 kiểm thử đạt**, mã thoát **0** trong lần xác minh cuối. Mỗi kiểm thử tạo kho Git tạm ngay trong thư mục này. Không kiểm tra lịch sử dự án riêng tư.

Coverage exercised:

- Actual Git status, current-byte SHA256, passing requirement mapping, missing/deleted/unchanged expected files, extra changes, staged rename with a space in its destination.
- Missing artifacts, altered hashes, recorded test failure, and simulated evidence rejection.
- Traversal/absolute/backslash/metadata paths; symlink files, roots, and specs; nonrepository roots; external includes, filters, and common metadata routing.
- Rejected command-bearing JSON and missing/unknown evidence references.
- Fixed subprocess argument vector and 3-second timeout assertion. Timeout and Git error branches use **test-only mocked subprocess failures**, not claims that a real 3-second timeout happened.
- CLI PASS/FAIL/ERROR JSON and exit codes, synthetic fixture schema/provenance consistency.
- Before/after byte snapshots of every regular repository file, including `.git`, unchanged by receipt generation. This verifies file bytes in that fixture; it does not claim access times remain unchanged.

Phạm vi kiểm thử gồm Git thật, mã băm, ánh xạ yêu cầu, thiếu tệp/bằng chứng, lỗi mô phỏng, đường dẫn không an toàn, cấu hình Git và mã thoát CLI. Nhánh timeout dùng giả lập riêng trong kiểm thử; không tuyên bố đã quan sát timeout thật.

## Viewer review / Rà soát trình xem

Source review: native labeled file input and button, visible focus styles, live status region, responsive two-column layout collapsing below 650px, text-only DOM insertion for JSON values, 1 MB upload cap, generation counter to discard stale file reads, clear action, and explicit synthetic/local claim labels. No remote assets, fetch/XHR, package imports, or server dependency.

Rà soát mã: điều khiển bàn phím tiêu chuẩn, nhãn và viền focus, vùng trạng thái, bố cục đáp ứng, chèn nội dung JSON dạng văn bản và giới hạn 1 MB. Không có tài nguyên từ xa.

**Not empirically verified:** browser rendering, screen-reader announcements, keyboard navigation/file selection, mobile layout, or browser JavaScript execution. These remain manual acceptance checks; no screenshot, browser test result, or accessibility certification is claimed. The README workshop walkthrough is provided for learners; its exact full shell sequence was not executed as a separate workshop session. Its CLI and fixture behavior are covered by the temporary-repository tests.

**Chưa xác minh trực tiếp:** hiển thị trình duyệt, trình đọc màn hình, thao tác bàn phím, giao diện di động hoặc thực thi JavaScript trên trình duyệt. Không tuyên bố đã đạt chứng nhận trợ năng hoặc đã tổ chức buổi học.

Manual checks for a browser session:

1. Open viewer.html and Tab to the picker; choose fixtures.json. Expect synthetic label, FAIL, extra.txt, and simulated evidence. / Chọn mẫu bằng bàn phím; thấy nhãn tổng hợp và FAIL.
2. Load a local CLI receipt, then malformed JSON and a file over 1 MB. Expect safe error text and hidden prior results. / Tải biên nhận thật rồi JSON lỗi/tệp quá lớn; thấy thông báo lỗi.
3. Load JSON containing HTML-like text in a path. Expect literal text, no markup execution. / Nội dung giống HTML phải hiển thị như văn bản.
4. At 360px width, inspect wrapping and one-column layout; clear and reload via keyboard. / Kiểm tra 360px, xóa và tải lại bằng bàn phím.

## Public/private release checklist / Danh sách công khai-riêng tư

- [x] Shipped fixture content is synthetic; no secrets, personal data, tokens, hostnames of private services, or private-project code. / Mẫu tổng hợp, không có dữ liệu riêng tư.
- [x] Neutral test identity uses `example.invalid`, a reserved example domain. / Danh tính thử nghiệm trung tính.
- [x] Evidence provenance is explicit: fixture = simulated; tests = observed local execution; subprocess fault injection = simulated test condition. / Phân biệt rõ mô phỏng và quan sát.
- [x] No arbitrary spec commands are accepted; only the fixed Git status invocation is used. / Không nhận lệnh từ JSON.
- [x] Builder is read-only; no deployment or publishing route exists. / Bộ tạo chỉ đọc; không có tuyến triển khai.
- [x] No OpenAI endorsement or external certification is claimed. / Không tuyên bố được chứng thực.
- [ ] Review **each generated receipt and log** before any future public sharing: paths, descriptions, hashes and logs may reveal private project details. Nothing was published. / Rà soát từng biên nhận và log trước khi chia sẻ; chưa công bố gì.
- [ ] Complete the manual browser checks above before claiming browser-verified accessibility or responsiveness. / Hoàn tất kiểm tra trình duyệt trước khi tuyên bố đã xác minh.

## Known boundaries / Giới hạn đã biết

PASS validates declared paths, changes, hashes and recorded claims. It cannot prove a test ran honestly, is fresh, or tests the requirement. Git-ignored files and submodules are outside unexpected-change detection. Linked worktrees, filters, symlinks and advanced Git extensions are deliberately unsupported. Deleted expected files fail. Hostile concurrent filesystem mutation and hard links are outside this educational boundary. The builder trusts the installed Git executable. See README for the full operating contract.

PASS kiểm tra hợp đồng dữ liệu đã khai báo, không chứng minh độ trung thực hoặc độ mới của kiểm thử. Không hỗ trợ kho bị thay đổi đồng thời bởi tác nhân không tin cậy; xem README để biết đầy đủ giới hạn.

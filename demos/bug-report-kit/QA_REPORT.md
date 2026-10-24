# QA report / Báo cáo kiểm tra

Observed locally on 2026-10-24. No network requests, remote services, packages, credentials or deployments were used. Evidence below is actual execution, not a simulated test result. All fixture identifiers, tokens and addresses are synthetic; no credential was validated. No OpenAI endorsement is claimed.

Quan sát cục bộ ngày 2026-10-24. Không dùng mạng, dịch vụ ngoài, gói cài thêm, thông tin xác thực hay triển khai. Kết quả dưới đây là chạy thật, không phải mô phỏng. Mọi mã, token và địa chỉ trong mẫu đều giả lập; không xác minh khóa nào. Không tuyên bố được OpenAI chứng thực.

## Observed validation / Kiểm chứng đã chạy

Command / Lệnh:

```sh
python3 -m unittest -q
```

Observed result / Kết quả quan sát: **43 tests passed, 0 failures, 0 skipped**. The final code test run completed in 1.385 seconds. Python 3.15.0 and local Node.js v24.21.0 was available for the optional JavaScript harness. Python's unittest orchestrated the run; the CLI itself has only standard-library dependencies.

Kết quả: **43 kiểm thử đạt, 0 lỗi, 0 bỏ qua**. Lần chạy mã cuối hoàn thành trong 1,385 giây. Có Python 3.15.0 và Node.js v24.21.0 cục bộ để chạy bộ kiểm thử JavaScript tùy chọn. CLI chỉ dùng thư viện chuẩn Python.

Coverage / Phạm vi:

- 23 deterministic redaction cases: safe text, CR/CRLF, Vietnamese/emoji, ASCII email, multiple secrets, Bearer, named and prefixed keys, Unix/Windows paths, IPv4/IPv6/mapped/zone literals, invalid addresses, sentence punctuation, control-split secrets and Unicode boundaries. / 23 mẫu cố định kiểm tra các nhóm và tình huống trên.
- Dynamic Markdown fences for backticks, forged headings, HTML and link syntax; structured JSON is fenced. User titles are fenced too. / Khối mã động cho backtick, tiêu đề giả, HTML, liên kết và JSON; tiêu đề nhập cũng được đặt trong khối mã.
- Invalid fields/types, empty input, size limits, deterministic digest, no-match warnings and eight fixture replacements. / Trường/kiểu sai, dữ liệu trống, giới hạn, mã duyệt cố định, cảnh báo và tám lần che mẫu.
- Actual CLI subprocesses: preview, no export without matching approval, successful exact export, stale approval rejection, overwrite refusal, malformed JSON, invalid UTF-8 and approval without output. Tests create temporary files only inside this folder and clean their own files. / Chạy tiến trình CLI thật; tệp tạm chỉ nằm trong thư mục này và được kiểm thử tự dọn.
- Extracted browser JavaScript executed locally in a minimal DOM harness: shared vectors, fixture counts, preview, download lock, approval, one Blob download invocation, edit invalidation, blank-input rejection and many backtick runs. / Chạy JavaScript trình duyệt trong DOM tối giản: mẫu chung, số đếm, khóa tải, duyệt, gọi tải Blob, hủy duyệt và từ chối dữ liệu trống.
- Source checks for CSP network blocking, text-only output, no fetch/localStorage and live status markup. / Kiểm tra nguồn cho CSP chặn mạng, hiển thị văn bản, không fetch/localStorage và trạng thái trực tiếp.

The DOM harness is a test double, not a browser. Its click counter proves the handler invoked a download, not that an operating system saved the file. No real-browser visual, actual-file-download, mobile, screen-reader or cross-browser audit was performed. Those checks remain explicitly unverified; no accessibility certification is claimed. Responsive CSS, native labeled controls, visible focus and keyboard-scrollable preview are implemented and available for manual verification.

DOM tối giản là bộ thay thế kiểm thử, không phải trình duyệt. Bộ đếm nhấp chỉ chứng minh đã gọi tải, không chứng minh hệ điều hành lưu tệp. Chưa kiểm tra trực quan trong trình duyệt thật, lưu tệp thật, di động, trình đọc màn hình hay nhiều trình duyệt. Các mục này chưa được xác minh; không chứng nhận khả năng truy cập. Đã triển khai CSS đáp ứng, điều khiển có nhãn, focus rõ và cuộn bằng bàn phím để kiểm tra thủ công.

## Public/private review checklist / Checklist công khai và riêng tư

Implementation review / Kiểm tra triển khai:

- [x] Synthetic-only fixture with `example.invalid`, documentation IP ranges and clearly invalid token text. / Mẫu giả lập với miền và IP tài liệu, token rõ là giả.
- [x] No uploads, HTTP client, telemetry, remote assets or persistence API in application code. / Không tải lên, HTTP, đo lường, tài nguyên ngoài hay API lưu trữ trong mã ứng dụng.
- [x] Browser CSP blocks connections; raw input is not inserted as HTML. / CSP chặn kết nối; đầu vào không được chèn dạng HTML.
- [x] Report contains sanitized values and match counts, no stored original secret-to-marker mapping. / Báo lỗi chứa giá trị đã xử lý và số đếm; không lưu bảng ánh xạ bí mật gốc.
- [x] Export requires an explicit local review action; changed inputs invalidate approval. / Xuất cần bước kiểm tra rõ ràng; sửa dữ liệu sẽ hủy duyệt.
- [x] Reports always warn that secrets may remain; no-match input retains that warning. / Luôn cảnh báo có thể còn bí mật, kể cả không khớp mẫu.

Required for **each** proposed public report; deliberately unchecked because no report was published / Cần làm cho **từng** báo lỗi định công khai; để trống vì chưa công bố báo lỗi nào:

- [ ] Compare every output field and structured JSON to the original locally. Remove unrecognized secrets, names, tenant IDs, internal hosts and business details by hand. / So sánh từng trường và JSON với bản gốc cục bộ; xóa tay bí mật và thông tin nội bộ còn sót.
- [ ] Confirm reproduction steps and error text are sufficient and permitted for public sharing. / Xác nhận nội dung tái hiện đủ dùng và được phép công khai.
- [ ] Inspect Markdown as text and in the intended renderer; preserve code fences. / Kiểm tra Markdown dạng văn bản và trong bộ hiển thị đích; giữ khối mã.
- [ ] Inspect terminal scrollback, screenshots, filenames and downloaded copies for retained input. Keep originals/private logs out of a public bundle. / Kiểm tra terminal, ảnh, tên tệp và bản tải; không đưa bản gốc/log riêng vào gói công khai.
- [ ] Have a human authorize any manual sharing. This demo never publishes or sends issues. / Cần người duyệt việc tự chia sẻ; bản thử không đăng hay gửi báo lỗi.

## Limits and manual follow-up / Giới hạn và kiểm tra tiếp

Redaction is a bounded heuristic, not a guarantee: see the precise rules and omissions in [README.md](README.md). False positives can remove useful context; false negatives can leak sensitive information. Manual sharing and any later transformations are outside this app. Approval is a UI/CLI workflow boundary, not a security boundary against someone intentionally bypassing it.

Che là phép gần đúng có giới hạn, không bảo đảm: xem quy tắc và phần bỏ sót trong README. Che nhầm có thể mất ngữ cảnh; bỏ sót có thể lộ thông tin. Chia sẻ và chuyển đổi tiếp nằm ngoài ứng dụng. Duyệt là bước quy trình, không phải rào chắn chống người cố ý vượt qua.

Manual browser acceptance procedure / Quy trình kiểm tra trình duyệt thủ công (not executed / chưa chạy):

1. Open `index.html` without a server; disconnect networking. Load sample and preview. / Mở tệp không qua máy chủ; ngắt mạng, nạp ví dụ và xem trước.
2. At narrow and wide viewport widths, Tab through all controls, operate preview/review/download with keyboard, scroll the preview and expand rules. Check no horizontal page overflow. / Kiểm tra màn hình hẹp/rộng, Tab và thao tác bàn phím, cuộn và mở quy tắc; kiểm tra không tràn ngang.
3. Download after review, open the actual `.md`, confirm eight substitutions and retained warning. Change one input; confirm download locks again. / Tải sau duyệt, mở tệp thật, xác nhận tám lần che và cảnh báo; sửa đầu vào và xác nhận khóa tải.
4. Inspect the sample's HTML and forged heading: they must remain inert text. Test with a screen reader and another modern browser. / Xác nhận HTML và tiêu đề giả chỉ là văn bản; thử trình đọc màn hình và trình duyệt khác.

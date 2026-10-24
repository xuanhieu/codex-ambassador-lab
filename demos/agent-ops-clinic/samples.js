// Deliberately fictional review material. Never substitute real credentials or contacts.
export const SAMPLES = {
  secrets: {
    en: { source: 'Draft handoff: “Include the deployment environment file with the page.” The exercise file contains only DEMO_CREDENTIAL_FIELD — no credential value.', proposal: 'Sanitized handoff: index.html, styles.css and README only. Exclude environment files. If a real credential had been exposed: revoke it, issue a replacement, update the authorized deployment environment and inspect access history.' },
    vi: { source: 'Bàn giao nháp: “Gửi kèm tệp môi trường triển khai với trang web.” Tệp bài tập chỉ có DEMO_CREDENTIAL_FIELD — không có giá trị đăng nhập.', proposal: 'Bàn giao đã làm sạch: chỉ index.html, styles.css và README. Loại tệp môi trường. Nếu thông tin đăng nhập thật bị lộ: thu hồi, cấp mới, cập nhật môi trường triển khai được phép và kiểm tra lịch sử truy cập.' }
  },
  pii: {
    en: { source: 'Fictional roster: Volunteer A | Saturday 09:00–11:00 | volunteer-a@example.invalid | PHONE_FIELD_OMITTED. The contact columns must not appear on the public site.', proposal: 'Public shift guide: “Meal preparation · Saturday 09:00–11:00. Contact the shift coordinator through the existing private channel.” Names, email and phone columns are excluded.' },
    vi: { source: 'Lịch hư cấu: Tình nguyện viên A | Thứ Bảy 09:00–11:00 | volunteer-a@example.invalid | PHONE_FIELD_OMITTED. Không được đưa cột liên hệ lên web công khai.', proposal: 'Hướng dẫn công khai: “Chuẩn bị suất ăn · Thứ Bảy 09:00–11:00. Liên hệ điều phối viên qua kênh riêng đang dùng.” Loại bỏ cột tên, email và số điện thoại.' }
  },
  launch: {
    en: { source: 'Proposed audience: 12 fictional pilot customers, by email on Friday at 10:00 local time. No recipient addresses are stored here.', proposal: 'Draft: “Fieldnote’s scheduling pilot is ready for a walkthrough. Reply if you would like an invitation. To stop pilot updates, reply ‘stop’.” Review the audience, wording and timing; nothing will be sent.' },
    vi: { source: 'Đối tượng đề xuất: 12 khách hàng thử nghiệm hư cấu, qua email lúc 10:00 thứ Sáu giờ địa phương. Không lưu địa chỉ người nhận ở đây.', proposal: 'Bản nháp: “Bản thử nghiệm lịch hẹn Fieldnote đã sẵn sàng để giới thiệu. Hãy trả lời nếu muốn nhận lời mời. Để dừng nhận cập nhật, trả lời ‘dừng’.” Duyệt đối tượng, nội dung và thời điểm; không gửi thật.' }
  },
  community: {
    en: { source: 'Proposed audience: the fictional neighborhood newsletter. Proposed timing: Friday afternoon, after the coordinator verifies Saturday opening hours.', proposal: 'Draft: “Open Table serves a community meal on Saturday, 11:00–13:00. Step-free entry is at the front door. No registration required.” No volunteer contact details are included. Approve the channel and timing separately from the draft.' },
    vi: { source: 'Đối tượng đề xuất: bản tin khu phố hư cấu. Thời điểm: chiều thứ Sáu, sau khi điều phối viên xác nhận giờ mở cửa thứ Bảy.', proposal: 'Bản nháp: “Bếp Mở phục vụ bữa ăn cộng đồng thứ Bảy, 11:00–13:00. Lối vào không bậc thang ở cửa trước. Không cần đăng ký.” Không chứa liên hệ tình nguyện viên. Duyệt kênh và thời điểm ngoài việc duyệt nội dung.' }
  },
  creator: {
    en: { source: 'Proposed channel: a fictional public learning feed. Audience: beginner spreadsheet learners. Timing: after the human editor checks both language versions.', proposal: 'EN: “Try a café-budget exercise: three examples, one practice sheet.” VI: “Thử bài tập ngân sách quán cà phê: ba ví dụ và một bảng thực hành.” No claims about learner results. No post is created by this lab.' },
    vi: { source: 'Kênh đề xuất: trang học tập công khai hư cấu. Đối tượng: người mới học bảng tính. Thời điểm: sau khi biên tập viên kiểm tra hai bản ngôn ngữ.', proposal: 'EN: “Try a café-budget exercise: three examples, one practice sheet.” VI: “Thử bài tập ngân sách quán cà phê: ba ví dụ và một bảng thực hành.” Không hứa hẹn kết quả học tập. Phòng thực hành không tạo bài đăng.' }
  }
};

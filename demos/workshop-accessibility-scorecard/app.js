(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.WorkshopScorecard = api;
  if (typeof document !== 'undefined') {
    const boot = function () { if (typeof api.init === 'function') api.init(document, root); };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
    else boot();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const ANSWER_VALUES = Object.freeze(['yes', 'no', 'unknown']);

  const CATEGORIES = Object.freeze([
    { id: 'venue', weight: 28, vi: 'Địa điểm', en: 'Venue' },
    { id: 'transport', weight: 14, vi: 'Di chuyển', en: 'Transport' },
    { id: 'hearingVisual', weight: 18, vi: 'Nghe và nhìn', en: 'Hearing and vision' },
    { id: 'remote', weight: 14, vi: 'Tham gia từ xa', en: 'Remote participation' },
    { id: 'language', weight: 10, vi: 'Ngôn ngữ', en: 'Language' },
    { id: 'bandwidth', weight: 6, vi: 'Băng thông thấp', en: 'Low bandwidth' },
    { id: 'privacy', weight: 5, vi: 'Quyền riêng tư', en: 'Privacy' },
    { id: 'cost', weight: 5, vi: 'Chi phí', en: 'Cost' }
  ]);

  const ITEMS = Object.freeze([
    { id: 'venue-step-free', category: 'venue', weight: 8, critical: true,
      vi: { label: 'Lối vào và lộ trình không bậc thang', help: 'Có lối vào chính không bậc, cửa đủ rộng, và lộ trình thông suốt cho xe lăn/xe đẩy.', fix: 'Chọn địa điểm có lối vào không bậc, cửa rộng, và lộ trình phẳng; công bố trước sơ đồ.' },
      en: { label: 'Step-free entrance and route', help: 'Main entrance has no steps, doors are wide enough, and the route is continuous for wheelchairs and strollers.', fix: 'Choose a venue with a step-free entrance, wide doors, and a flat route; publish a route map in advance.' } },
    { id: 'venue-restroom', category: 'venue', weight: 6, critical: true,
      vi: { label: 'Nhà vệ sinh tiếp cận được', help: 'Có nhà vệ sinh đủ chỗ quay xe lăn, tay vịn, và biển chỉ dẫn rõ.', fix: 'Xác nhận nhà vệ sinh tiếp cận được hoặc bố trí hỗ trợ an toàn và riêng tư; ghi rõ trong thông tin sự kiện.' },
      en: { label: 'Accessible restroom', help: 'Restroom has wheelchair turning space, grab bars, and clear signage.', fix: 'Confirm an accessible restroom or arrange safe, private support; state this clearly in event information.' } },
    { id: 'venue-seating', category: 'venue', weight: 6, critical: false,
      vi: { label: 'Chỗ ngồi đa dạng và chỗ xe lăn', help: 'Có ghế có tựa, ghế cao/thấp, chỗ xe lăn cạnh bạn cùng đi, và không chỉ ghế cứng.', fix: 'Bố trí chỗ ngồi đa dạng và chỗ xe lăn cạnh bạn cùng đi; giữ lối đi thông thoáng.' },
      en: { label: 'Varied seating and wheelchair spaces', help: 'There are supportive seats, high/low options, wheelchair spaces beside companions, and not only hard chairs.', fix: 'Arrange varied seating and wheelchair spaces beside companions; keep aisles clear.' } },
    { id: 'venue-lighting', category: 'venue', weight: 4, critical: false,
      vi: { label: 'Ánh sáng và biển chỉ dẫn dễ nhìn', help: 'Ánh sáng đủ nhưng không chói; biển chỉ dẫn chữ lớn, tương phản cao, và đặt ở tầm mắt.', fix: 'Giảm chói, thêm biển chỉ dẫn chữ lớn tương phản cao, và đánh dấu lối đi.' },
      en: { label: 'Readable lighting and signage', help: 'Lighting is adequate but not glaring; signs use large, high-contrast text at eye level.', fix: 'Reduce glare, add large high-contrast signs, and mark routes clearly.' } },
    { id: 'venue-quiet-room', category: 'venue', weight: 4, critical: false,
      vi: { label: 'Phòng yên tĩnh hoặc góc nghỉ', help: 'Có không gian yên tĩnh để nghỉ, điều chỉnh kích thích, hoặc cho con bú/chăm sóc.', fix: 'Dành một phòng hoặc góc yên tĩnh với ghế, nước uống, và biển chỉ dẫn.' },
      en: { label: 'Quiet room or rest corner', help: 'There is a quiet space for rest, sensory breaks, or caregiving.', fix: 'Reserve a quiet room or corner with seating, water, and clear signage.' } },

    { id: 'transport-transit', category: 'transport', weight: 5, critical: false,
      vi: { label: 'Đến được bằng phương tiện công cộng', help: 'Địa điểm gần trạm dừng có lối tiếp cận và thời gian đi bộ hợp lý.', fix: 'Chọn địa điểm gần phương tiện công cộng tiếp cận được hoặc công bố phương án đi chung xe.' },
      en: { label: 'Reachable by public transit', help: 'The venue is near an accessible stop with a reasonable walking time.', fix: 'Choose a venue near accessible public transit or publish a ride-share plan.' } },
    { id: 'transport-parking', category: 'transport', weight: 4, critical: false,
      vi: { label: 'Đỗ xe/diểm trả khách tiếp cận được', help: 'Có chỗ đỗ xe tiếp cận được hoặc điểm dừng an toàn gần cửa.', fix: 'Xác nhận chỗ đỗ xe tiếp cận được hoặc điểm trả khách an toàn; công bố bản đồ.' },
      en: { label: 'Accessible parking or drop-off', help: 'There is accessible parking or a safe drop-off point near the entrance.', fix: 'Confirm accessible parking or a safe drop-off point; publish a map.' } },
    { id: 'transport-instructions', category: 'transport', weight: 5, critical: false,
      vi: { label: 'Hướng dẫn di chuyển rõ ràng', help: 'Hướng dẫn gồm ảnh/bản đồ, thời gian, lựa chọn ít bậc thang, và số liên hệ hỗ trợ.', fix: 'Viết hướng dẫn từng bước với bản đồ, lựa chọn ít bậc thang, và số liên hệ hỗ trợ.' },
      en: { label: 'Clear travel instructions', help: 'Instructions include maps, timing, step-free options, and a support contact.', fix: 'Write step-by-step directions with maps, step-free options, and a support contact.' } },

    { id: 'hearing-captions', category: 'hearingVisual', weight: 6, critical: true,
      vi: { label: 'Phụ đề cho nội dung nói', help: 'Tất cả phần nói chính có phụ đề trực tiếp hoặc phụ đề chuẩn bị sẵn.', fix: 'Chuẩn bị phụ đề cho mọi phần nói chính; nếu trực tiếp, kiểm tra độ trễ và vị trí.' },
      en: { label: 'Captions for spoken content', help: 'All main spoken content has live or prepared captions.', fix: 'Prepare captions for all main spoken content; if live, test latency and placement.' } },
    { id: 'hearing-sign-language', category: 'hearingVisual', weight: 4, critical: false,
      vi: { label: 'Ngôn ngữ ký hiệu hoặc bản chép lời', help: 'Có thông dịch ký hiệu hoặc bản chép lời đầy đủ khi cần.', fix: 'Hỏi người tham gia và bố trí thông dịch ký hiệu hoặc bản chép lời đầy đủ.' },
      en: { label: 'Sign language or full transcript', help: 'Sign language interpretation or a full transcript is available when needed.', fix: 'Ask participants and arrange sign language interpretation or a full transcript.' } },
    { id: 'hearing-large-print', category: 'hearingVisual', weight: 4, critical: false,
      vi: { label: 'Chữ lớn, mô tả ảnh, và tài liệu dễ đọc', help: 'Tài liệu có chữ lớn, mô tả ảnh, và có thể phóng to mà không vỡ bố cục.', fix: 'Dùng chữ lớn, mô tả ảnh, và tài liệu có thể phóng to; tránh văn bản trong ảnh.' },
      en: { label: 'Large print, alt text, and readable materials', help: 'Materials use large text, image descriptions, and can zoom without breaking layout.', fix: 'Use large text and image descriptions; make materials zoomable and avoid text in images.' } },
    { id: 'hearing-audio', category: 'hearingVisual', weight: 4, critical: false,
      vi: { label: 'Âm thanh rõ và không gian yên tĩnh', help: 'Micro và loa rõ; có chỗ ngồi yên tĩnh và điều chỉnh âm lượng.', fix: 'Kiểm tra âm thanh trước sự kiện; bố trí chỗ ngồi yên tĩnh và điều chỉnh âm lượng.' },
      en: { label: 'Clear audio and quiet options', help: 'Microphones and speakers are clear; quiet seating and volume control are available.', fix: 'Test audio before the event; provide quiet seating and volume control.' } },

    { id: 'remote-link', category: 'remote', weight: 5, critical: true,
      vi: { label: 'Liên kết tham gia từ xa ổn định', help: 'Có liên kết dự phòng, hướng dẫn vào phòng, và người hỗ trợ kỹ thuật.', fix: 'Gửi liên kết dự phòng và hướng dẫn vào phòng; phân công người hỗ trợ kỹ thuật.' },
      en: { label: 'Stable remote joining link', help: 'There is a backup link, joining instructions, and technical support.', fix: 'Send a backup link and joining instructions; assign technical support.' } },
    { id: 'remote-captions-recording', category: 'remote', weight: 5, critical: false,
      vi: { label: 'Phụ đề và ghi hình có đồng ý', help: 'Phụ đề từ xa hoạt động và ghi hình chỉ khi có đồng ý rõ ràng.', fix: 'Bật phụ đề cho người từ xa và chỉ ghi hình sau khi thông báo và nhận đồng ý.' },
      en: { label: 'Remote captions and consented recording', help: 'Remote captions work and recording happens only with clear consent.', fix: 'Enable captions for remote attendees and record only after notice and consent.' } },
    { id: 'remote-timezone', category: 'remote', weight: 4, critical: false,
      vi: { label: 'Múi giờ và ghi chú không đồng thời', help: 'Giờ sự kiện rõ theo nhiều múi giờ và có ghi chú cho người không tham gia trực tiếp.', fix: 'Công bố giờ theo nhiều múi giờ và gửi ghi chú/tóm tắt sau sự kiện.' },
      en: { label: 'Time zones and asynchronous notes', help: 'Event time is clear across time zones and notes are available for non-live attendees.', fix: 'Publish times in multiple time zones and send notes or a summary afterward.' } },

    { id: 'language-materials', category: 'language', weight: 4, critical: false,
      vi: { label: 'Tài liệu bằng ngôn ngữ người tham gia', help: 'Tài liệu chính có bằng ngôn ngữ người tham gia hoặc bản dịch ngắn.', fix: 'Dịch tài liệu chính hoặc chuẩn bị bản tóm tắt bằng ngôn ngữ người tham gia.' },
      en: { label: 'Materials in participants’ languages', help: 'Core materials are available in participants’ languages or as short translations.', fix: 'Translate core materials or prepare short summaries in participants’ languages.' } },
    { id: 'language-plain', category: 'language', weight: 3, critical: false,
      vi: { label: 'Ngôn ngữ dễ hiểu và bảng thuật ngữ', help: 'Tránh từ chuyên môn; có bảng thuật ngữ cho khái niệm mới.', fix: 'Dùng ngôn ngữ đơn giản và thêm bảng thuật ngữ cho khái niệm mới.' },
      en: { label: 'Plain language and glossary', help: 'Avoid jargon and provide a glossary for new concepts.', fix: 'Use plain language and add a glossary for new concepts.' } },
    { id: 'language-interpretation', category: 'language', weight: 3, critical: false,
      vi: { label: 'Thông dịch hoặc điều phối song ngữ', help: 'Có người hỗ trợ ngôn ngữ hoặc điều phối song ngữ khi cần.', fix: 'Bố trí người hỗ trợ ngôn ngữ hoặc điều phối song ngữ; công bố trước.' },
      en: { label: 'Interpretation or bilingual facilitation', help: 'Language support or bilingual facilitation is available when needed.', fix: 'Arrange language support or bilingual facilitation and announce it beforehand.' } },

    { id: 'bandwidth-offline', category: 'bandwidth', weight: 3, critical: false,
      vi: { label: 'Tài liệu dùng được khi mất mạng', help: 'Tài liệu có thể tải về hoặc in, không phụ thuộc trang web nặng.', fix: 'Cung cấp tài liệu tải về hoặc in được; tránh phụ thuộc mạng trong buổi học.' },
      en: { label: 'Materials work offline', help: 'Materials can be downloaded or printed without relying on a heavy website.', fix: 'Provide downloadable or printable materials; avoid network dependence during the session.' } },
    { id: 'bandwidth-lightweight', category: 'bandwidth', weight: 3, critical: false,
      vi: { label: 'Tệp nhẹ và trang nhanh', help: 'Hình ảnh/tệp được nén; trang hoặc liên kết tải nhanh trên mạng chậm.', fix: 'Nén hình ảnh và tệp; kiểm tra tải trang trên mạng chậm.' },
      en: { label: 'Lightweight files and fast pages', help: 'Images and files are compressed; pages or links load quickly on slow networks.', fix: 'Compress images and files; test page loading on a slow network.' } },

    { id: 'privacy-consent', category: 'privacy', weight: 3, critical: true,
      vi: { label: 'Thu thập ít dữ liệu và có đồng ý', help: 'Chỉ thu thập dữ liệu cần thiết và có thông báo đồng ý rõ ràng.', fix: 'Giảm dữ liệu thu thập, công bố mục đích, và xin đồng ý rõ ràng trước khi đăng ký.' },
      en: { label: 'Data minimization and consent', help: 'Only necessary data is collected and there is clear consent notice.', fix: 'Collect less data, state the purpose, and obtain clear consent before registration.' } },
    { id: 'privacy-deletion', category: 'privacy', weight: 2, critical: false,
      vi: { label: 'Xóa dữ liệu và thời gian lưu trữ', help: 'Có cách xóa dữ liệu và thời gian lưu trữ được công bố.', fix: 'Công bố thời gian lưu trữ và cách yêu cầu xóa dữ liệu.' },
      en: { label: 'Deletion and retention policy', help: 'There is a way to delete data and a published retention period.', fix: 'Publish the retention period and a way to request data deletion.' } },

    { id: 'cost-transparent', category: 'cost', weight: 3, critical: false,
      vi: { label: 'Tổng chi phí minh bạch', help: 'Tất cả chi phí, bao gồm đi lại, thức ăn, và hỗ trợ, được công bố trước.', fix: 'Công bố tổng chi phí và các khoản có thể phát sinh trước khi đăng ký.' },
      en: { label: 'Transparent total cost', help: 'All costs, including travel, food, and support, are published in advance.', fix: 'Publish the total cost and possible extra costs before registration.' } },
    { id: 'cost-free-option', category: 'cost', weight: 2, critical: true,
      vi: { label: 'Có lựa chọn miễn phí hoặc chi phí thấp', help: 'Có vé miễn phí, hỗ trợ chi phí, hoặc phương án tham gia không mất phí.', fix: 'Thêm vé miễn phí hoặc hỗ trợ chi phí; công bố cách xin hỗ trợ.' },
      en: { label: 'Free or low-cost participation option', help: 'There is a free ticket, cost support, or a no-fee way to participate.', fix: 'Add free tickets or cost support; publish how to request support.' } }
  ]);

  const TOTAL_WEIGHT = ITEMS.reduce(function (sum, item) { return sum + item.weight; }, 0);

  const STATUS_LABELS = {
    vi: { insufficient: 'Chưa đủ thông tin', strong: 'Tốt với lưu ý', usable: 'Dùng được nhưng cần sửa', major: 'Cần cải thiện lớn' },
    en: { insufficient: 'Not enough information', strong: 'Strong with caveats', usable: 'Usable but needs fixes', major: 'Needs major improvement' }
  };

  const ANSWER_LABELS = {
    vi: { yes: 'Có', no: 'Không', unknown: 'Chưa rõ' },
    en: { yes: 'Yes', no: 'No', unknown: 'Not sure' }
  };

  const UI = {
    vi: {
      title: 'Bảng điểm tiếp cận workshop và meetup',
      subtitle: 'Danh sách kiểm tra có trọng số cho địa điểm, di chuyển, nghe/nhìn, từ xa, ngôn ngữ, băng thông thấp, quyền riêng tư và chi phí. Không phải chứng nhận WCAG.',
      skip: 'Chuyển đến nội dung chính',
      language: 'Ngôn ngữ',
      loadSample: 'Nạp mẫu',
      reset: 'Đặt lại',
      checklistTitle: 'Danh sách kiểm tra tiếp cận',
      checklistHelp: 'Mỗi mục có trọng số. Chọn Có, Không, hoặc Chưa rõ. "Chưa rõ" không bị tính là lỗi, nhưng làm giảm độ tin cậy.',
      calculate: 'Tính điểm',
      copyWorksheet: 'Sao chép phiếu',
      exportCsv: 'Xuất CSV',
      exportMd: 'Xuất Markdown',
      scoreTitle: 'Điểm và giải thích',
      scoreEmpty: 'Chưa có câu trả lời chắc chắn. Chọn Có/Không cho ít nhất một mục để tính điểm.',
      formStatusCalculated: 'Đã tính điểm. Kết quả chỉ dựa trên câu trả lời hiện có.',
      strengths: 'Điểm mạnh',
      gaps: 'Khoảng trống cần sửa',
      verify: 'Cần xác minh',
      noGaps: 'Không có khoảng trống đã biết trong các câu trả lời hiện có.',
      noStrengths: 'Chưa có điểm mạnh đã xác nhận.',
      noUnknowns: 'Không có mục chưa rõ.',
      categoryScores: 'Điểm theo nhóm',
      notesTitle: 'Giới hạn và ghi chú an toàn',
      notes: 'Công cụ này là danh sách kiểm tra lập kế hoạch, không phải kiểm toán hoặc chứng nhận WCAG. Mẫu chỉ là dữ liệu tổng hợp cục bộ. Không gửi dữ liệu; không lưu trữ dữ liệu người tham gia.',
      footer: 'Cục bộ trong trình duyệt • Không mạng • Không dữ liệu người tham gia • Không chứng nhận WCAG',
      privacyNote: 'Không lưu dữ liệu sau khi tải lại. Không theo dõi. Không dịch vụ bên ngoài.',
      answerYes: 'Có',
      answerNo: 'Không',
      answerUnknown: 'Chưa rõ',
      weightLabel: 'trọng số',
      scoreLabel: 'Điểm',
      coverageLabel: 'Độ phủ',
      knownLabel: 'điểm đã biết',
      yesLabel: 'điểm Có',
      noLabel: 'điểm Không',
      unknownLabel: 'điểm chưa rõ',
      fixesTitle: 'Việc cần làm theo thứ tự ưu tiên',
      worksheetTitle: 'PHIẾU ĐÁNH GIÁ TIẾP CẬN WORKSHOP',
      localOnly: 'Dữ liệu tổng hợp cục bộ • Không phải chứng nhận WCAG'
    },
    en: {
      title: 'Workshop and meetup accessibility scorecard',
      subtitle: 'Weighted checklist for venue, transport, hearing/vision, remote, language, low bandwidth, privacy, and cost. Not a WCAG conformance certification.',
      skip: 'Skip to main content',
      language: 'Language',
      loadSample: 'Load sample',
      reset: 'Reset',
      checklistTitle: 'Accessibility checklist',
      checklistHelp: 'Each item is weighted. Choose Yes, No, or Not sure. "Not sure" is not counted as a failure, but it lowers confidence.',
      calculate: 'Calculate score',
      copyWorksheet: 'Copy worksheet',
      exportCsv: 'Export CSV',
      exportMd: 'Export Markdown',
      scoreTitle: 'Score and explanation',
      scoreEmpty: 'No certain answers yet. Choose Yes or No for at least one item to calculate a score.',
      formStatusCalculated: 'Score calculated from the answers currently shown.',
      strengths: 'Strengths',
      gaps: 'Gaps to fix',
      verify: 'Needs verification',
      noGaps: 'No known gaps in the current answers.',
      noStrengths: 'No confirmed strengths yet.',
      noUnknowns: 'No uncertain items.',
      categoryScores: 'Category scores',
      notesTitle: 'Limits and safety notes',
      notes: 'This is a planning checklist, not a WCAG audit or certification. The sample is local synthetic data. No data is sent and no participant data is stored.',
      footer: 'Local browser • No network • No participant data • Not a WCAG certification',
      privacyNote: 'Nothing is stored after reload. No tracking. No external services.',
      answerYes: 'Yes',
      answerNo: 'No',
      answerUnknown: 'Not sure',
      weightLabel: 'weight',
      scoreLabel: 'Score',
      coverageLabel: 'Coverage',
      knownLabel: 'known points',
      yesLabel: 'yes points',
      noLabel: 'no points',
      unknownLabel: 'uncertain points',
      fixesTitle: 'Prioritized actions',
      worksheetTitle: 'WORKSHOP ACCESSIBILITY SCORECARD',
      localOnly: 'Local synthetic data • Not a WCAG certification'
    }
  };

  function language(code) { return code === 'en' ? 'en' : 'vi'; }

  function normalizeAnswer(value) {
    if (value === true) return 'yes';
    if (value === false) return 'no';
    if (value === null || value === undefined) return 'unknown';
    const text = String(value).trim().toLowerCase();
    if (text === 'yes' || text === 'y' || text === 'true' || text === '1') return 'yes';
    if (text === 'no' || text === 'n' || text === 'false' || text === '0') return 'no';
    if (text === 'unknown' || text === 'unsure' || text === 'not sure' || text === '') return 'unknown';
    return 'unknown';
  }

  function categoryLabel(id, lang) {
    const locale = language(lang);
    const category = CATEGORIES.find(function (item) { return item.id === id; });
    return category ? category[locale] : id;
  }

  function itemText(item, lang, field) {
    return item[language(lang)][field];
  }

  function answerLabel(value, lang) {
    const locale = language(lang);
    return ANSWER_LABELS[locale][normalizeAnswer(value)] || ANSWER_LABELS[locale].unknown;
  }

  function statusLabel(status, lang) {
    const locale = language(lang);
    return STATUS_LABELS[locale][status] || STATUS_LABELS[locale].insufficient;
  }

  function escapeCsv(value) {
    const text = String(value === null || value === undefined ? '' : value).replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    if (/[",\n]/.test(text)) return '"' + text.replace(/"/g, '""') + '"';
    return text;
  }

  function escapeMarkdown(value) {
    return String(value === null || value === undefined ? '' : value).replace(/\|/g, '/').replace(/\r?\n/g, ' ');
  }

  function sampleAnswers() {
    return {
      'venue-step-free': 'yes',
      'venue-restroom': 'yes',
      'venue-seating': 'yes',
      'venue-lighting': 'yes',
      'venue-quiet-room': 'unknown',
      'transport-transit': 'yes',
      'transport-parking': 'no',
      'transport-instructions': 'yes',
      'hearing-captions': 'yes',
      'hearing-sign-language': 'unknown',
      'hearing-large-print': 'yes',
      'hearing-audio': 'no',
      'remote-link': 'yes',
      'remote-captions-recording': 'yes',
      'remote-timezone': 'no',
      'language-materials': 'yes',
      'language-plain': 'yes',
      'language-interpretation': 'unknown',
      'bandwidth-offline': 'no',
      'bandwidth-lightweight': 'yes',
      'privacy-consent': 'yes',
      'privacy-deletion': 'unknown',
      'cost-transparent': 'yes',
      'cost-free-option': 'no'
    };
  }

  function computeScore(answers, lang) {
    const locale = language(lang);
    const source = answers && typeof answers === 'object' && !Array.isArray(answers) ? answers : {};
    let totalWeight = 0;
    let knownWeight = 0;
    let yesWeight = 0;

    const items = ITEMS.map(function (item) {
      const answer = normalizeAnswer(Object.prototype.hasOwnProperty.call(source, item.id) ? source[item.id] : 'unknown');
      totalWeight += item.weight;
      if (answer !== 'unknown') knownWeight += item.weight;
      if (answer === 'yes') yesWeight += item.weight;
      return {
        id: item.id,
        category: item.category,
        weight: item.weight,
        critical: item.critical,
        answer: answer,
        label: item[locale].label,
        help: item[locale].help,
        fix: item[locale].fix
      };
    });

    const noWeight = knownWeight - yesWeight;
    const unknownWeight = totalWeight - knownWeight;
    const scorePercent = knownWeight > 0 ? Math.round((100 * yesWeight) / knownWeight) : null;
    const coveragePercent = totalWeight > 0 ? Math.round((100 * knownWeight) / totalWeight) : 0;

    const strengths = items.filter(function (item) { return item.answer === 'yes'; })
      .sort(function (a, b) { return b.weight - a.weight || a.id.localeCompare(b.id); });
    const gaps = items.filter(function (item) { return item.answer === 'no'; })
      .sort(function (a, b) { return b.weight - a.weight || a.id.localeCompare(b.id); });
    const unknowns = items.filter(function (item) { return item.answer === 'unknown'; })
      .sort(function (a, b) { return b.weight - a.weight || a.id.localeCompare(b.id); });

    const fixes = gaps.map(function (item) {
      return { id: item.id, category: item.category, weight: item.weight, text: item.fix };
    });

    const verification = unknowns.map(function (item) {
      return { id: item.id, category: item.category, weight: item.weight, text: (locale === 'vi' ? 'Xác minh: ' : 'Verify: ') + item.label };
    });

    let status = 'insufficient';
    if (scorePercent !== null) {
      if (scorePercent >= 85 && coveragePercent >= 75) status = 'strong';
      else if (scorePercent >= 70) status = 'usable';
      else status = 'major';
    }

    const categories = CATEGORIES.map(function (category) {
      const categoryItems = items.filter(function (item) { return item.category === category.id; });
      const categoryTotal = categoryItems.reduce(function (sum, item) { return sum + item.weight; }, 0);
      const categoryKnown = categoryItems.reduce(function (sum, item) { return item.answer === 'unknown' ? sum : sum + item.weight; }, 0);
      const categoryYes = categoryItems.reduce(function (sum, item) { return item.answer === 'yes' ? sum + item.weight : sum; }, 0);
      return {
        id: category.id,
        label: category[locale],
        totalWeight: categoryTotal,
        knownWeight: categoryKnown,
        yesWeight: categoryYes,
        scorePercent: categoryKnown > 0 ? Math.round((100 * categoryYes) / categoryKnown) : null,
        coveragePercent: categoryTotal > 0 ? Math.round((100 * categoryKnown) / categoryTotal) : 0
      };
    });

    const explanation = [];
    if (scorePercent === null) {
      explanation.push(locale === 'vi'
        ? 'Chưa đủ câu trả lời chắc chắn để tính điểm. Chọn Có hoặc Không cho ít nhất một mục.'
        : 'Not enough certain answers to calculate a score. Choose Yes or No for at least one item.');
    } else {
      explanation.push((locale === 'vi' ? 'Điểm: ' : 'Score: ') + scorePercent + '% ' +
        (locale === 'vi' ? 'trên ' : 'across ') + coveragePercent + '% ' +
        (locale === 'vi' ? 'trọng số đã biết.' : 'of weighted coverage.'));
    }
    explanation.push((locale === 'vi' ? 'Đã biết ' : 'Known: ') + knownWeight + '/' + totalWeight + ' ' +
      (locale === 'vi' ? 'điểm; Có ' : 'points; yes ') + yesWeight + ', ' +
      (locale === 'vi' ? 'Không ' : 'no ') + noWeight + ', ' +
      (locale === 'vi' ? 'chưa rõ ' : 'uncertain ') + unknownWeight + '.');
    if (strengths.length) {
      explanation.push((locale === 'vi' ? 'Điểm mạnh: ' : 'Strengths: ') +
        strengths.map(function (item) { return item.label; }).join('; ') + '.');
    } else {
      explanation.push(locale === 'vi' ? 'Chưa có điểm mạnh đã xác nhận.' : 'No confirmed strengths yet.');
    }
    if (gaps.length) {
      explanation.push((locale === 'vi' ? 'Khoảng trống cần sửa: ' : 'Gaps to fix: ') +
        gaps.map(function (item) { return item.label + ' (' + item.weight + ')'; }).join('; ') + '.');
    } else {
      explanation.push(locale === 'vi' ? 'Không có khoảng trống đã biết trong các câu trả lời hiện có.' : 'No known gaps in the current answers.');
    }
    if (unknowns.length) {
      explanation.push((locale === 'vi' ? 'Mục chưa rõ làm giảm độ tin cậy: ' : 'Uncertain items reduce confidence: ') +
        unknowns.map(function (item) { return item.label; }).join('; ') + '.');
    } else {
      explanation.push(locale === 'vi' ? 'Không có mục chưa rõ.' : 'No uncertain items.');
    }
    explanation.push(locale === 'vi'
      ? 'Đây là danh sách kiểm tra lập kế hoạch, không phải kiểm toán hoặc chứng nhận WCAG.'
      : 'This is a planning checklist, not a WCAG audit or certification.');

    return {
      schemaVersion: 1,
      locale: locale,
      totalWeight: totalWeight,
      knownWeight: knownWeight,
      yesWeight: yesWeight,
      noWeight: noWeight,
      unknownWeight: unknownWeight,
      scorePercent: scorePercent,
      coveragePercent: coveragePercent,
      status: status,
      statusLabel: statusLabel(status, locale),
      strengths: strengths,
      gaps: gaps,
      unknowns: unknowns,
      fixes: fixes,
      verification: verification,
      items: items,
      categories: categories,
      explanation: explanation
    };
  }

  function exportCsv(result) {
    const locale = language(result.locale);
    const lines = [];
    lines.push(escapeCsv(locale === 'vi' ? 'Bảng điểm tiếp cận workshop và meetup' : 'Workshop and meetup accessibility scorecard'));
    lines.push(escapeCsv(locale === 'vi' ? 'Dữ liệu tổng hợp cục bộ • Không phải chứng nhận WCAG' : 'Local synthetic data • Not a WCAG certification'));
    lines.push('');
    lines.push([escapeCsv(locale === 'vi' ? 'Tóm tắt' : 'Summary'), escapeCsv(locale === 'vi' ? 'Giá trị' : 'Value')].join(','));
    lines.push([escapeCsv(locale === 'vi' ? 'Điểm' : 'Score'), escapeCsv(result.scorePercent === null ? (locale === 'vi' ? 'chưa đủ thông tin' : 'not enough information') : result.scorePercent + '%')].join(','));
    lines.push([escapeCsv(locale === 'vi' ? 'Độ phủ' : 'Coverage'), escapeCsv(result.coveragePercent + '%')].join(','));
    lines.push([escapeCsv(locale === 'vi' ? 'Trạng thái' : 'Status'), escapeCsv(result.statusLabel)].join(','));
    lines.push([escapeCsv(locale === 'vi' ? 'Điểm đã biết' : 'Known points'), escapeCsv(result.knownWeight + '/' + result.totalWeight)].join(','));
    lines.push([escapeCsv(locale === 'vi' ? 'Điểm Có' : 'Yes points'), escapeCsv(result.yesWeight)].join(','));
    lines.push([escapeCsv(locale === 'vi' ? 'Điểm Không' : 'No points'), escapeCsv(result.noWeight)].join(','));
    lines.push([escapeCsv(locale === 'vi' ? 'Điểm chưa rõ' : 'Uncertain points'), escapeCsv(result.unknownWeight)].join(','));
    lines.push('');
    lines.push([escapeCsv(locale === 'vi' ? 'Nhóm' : 'Category'), escapeCsv(locale === 'vi' ? 'Mục' : 'Item'), escapeCsv(locale === 'vi' ? 'Trọng số' : 'Weight'), escapeCsv(locale === 'vi' ? 'Trả lời' : 'Answer'), escapeCsv(locale === 'vi' ? 'Hành động' : 'Action')].join(','));
    result.items.forEach(function (item) {
      let action = '';
      if (item.answer === 'no') action = item.fix;
      else if (item.answer === 'unknown') action = locale === 'vi' ? 'Xác minh với người tham gia và facilitator.' : 'Verify with participants and the facilitator.';
      else action = locale === 'vi' ? 'Giữ và kiểm tra lại trước sự kiện.' : 'Keep and re-check before the event.';
      lines.push([
        escapeCsv(categoryLabel(item.category, locale)),
        escapeCsv(item.label),
        escapeCsv(item.weight),
        escapeCsv(answerLabel(item.answer, locale)),
        escapeCsv(action)
      ].join(','));
    });
    lines.push('');
    lines.push(escapeCsv(locale === 'vi' ? 'Giải thích:' : 'Explanation:'));
    result.explanation.forEach(function (line) {
      lines.push(escapeCsv(line));
    });
    return lines.join('\r\n');
  }

  function exportMarkdown(result) {
    const locale = language(result.locale);
    const lines = [];
    lines.push('# ' + (locale === 'vi' ? 'Phiếu đánh giá tiếp cận workshop' : 'Workshop accessibility scorecard'));
    lines.push('');
    lines.push('> ' + (locale === 'vi' ? 'Dữ liệu tổng hợp cục bộ. Không phải kiểm toán hoặc chứng nhận WCAG.' : 'Local synthetic data. Not a WCAG audit or certification.'));
    lines.push('');
    lines.push('## ' + (locale === 'vi' ? 'Tóm tắt' : 'Summary'));
    lines.push('');
    lines.push('- ' + (locale === 'vi' ? 'Điểm' : 'Score') + ': ' + (result.scorePercent === null ? (locale === 'vi' ? 'chưa đủ thông tin' : 'not enough information') : result.scorePercent + '%'));
    lines.push('- ' + (locale === 'vi' ? 'Độ phủ' : 'Coverage') + ': ' + result.coveragePercent + '%');
    lines.push('- ' + (locale === 'vi' ? 'Trạng thái' : 'Status') + ': ' + result.statusLabel);
    lines.push('- ' + (locale === 'vi' ? 'Điểm đã biết' : 'Known points') + ': ' + result.knownWeight + '/' + result.totalWeight);
    lines.push('- ' + (locale === 'vi' ? 'Điểm Có / Không / chưa rõ' : 'Yes / no / uncertain points') + ': ' + result.yesWeight + ' / ' + result.noWeight + ' / ' + result.unknownWeight);
    lines.push('');
    lines.push('## ' + (locale === 'vi' ? 'Điểm theo nhóm' : 'Category scores'));
    lines.push('');
    lines.push('| ' + (locale === 'vi' ? 'Nhóm' : 'Category') + ' | ' + (locale === 'vi' ? 'Điểm' : 'Score') + ' | ' + (locale === 'vi' ? 'Độ phủ' : 'Coverage') + ' | ' + (locale === 'vi' ? 'Trọng số' : 'Weight') + ' |');
    lines.push('|---|---:|---:|---:|');
    result.categories.forEach(function (category) {
      lines.push('| ' + escapeMarkdown(category.label) + ' | ' + (category.scorePercent === null ? '-' : category.scorePercent + '%') + ' | ' + category.coveragePercent + '% | ' + category.totalWeight + ' |');
    });
    lines.push('');
    lines.push('## ' + (locale === 'vi' ? 'Danh sách kiểm tra' : 'Checklist'));
    lines.push('');
    lines.push('| ' + (locale === 'vi' ? 'Nhóm' : 'Category') + ' | ' + (locale === 'vi' ? 'Mục' : 'Item') + ' | ' + (locale === 'vi' ? 'Trọng số' : 'Weight') + ' | ' + (locale === 'vi' ? 'Trả lời' : 'Answer') + ' | ' + (locale === 'vi' ? 'Hành động' : 'Action') + ' |');
    lines.push('|---|---|---:|---|---|');
    result.items.forEach(function (item) {
      let action = '';
      if (item.answer === 'no') action = item.fix;
      else if (item.answer === 'unknown') action = locale === 'vi' ? 'Xác minh với người tham gia.' : 'Verify with participants.';
      else action = locale === 'vi' ? 'Giữ và kiểm tra lại.' : 'Keep and re-check.';
      lines.push('| ' + escapeMarkdown(categoryLabel(item.category, locale)) + ' | ' + escapeMarkdown(item.label) + ' | ' + item.weight + ' | ' + escapeMarkdown(answerLabel(item.answer, locale)) + ' | ' + escapeMarkdown(action) + ' |');
    });
    lines.push('');
    lines.push('## ' + (locale === 'vi' ? 'Việc cần làm theo thứ tự ưu tiên' : 'Prioritized actions'));
    lines.push('');
    if (result.fixes.length === 0) lines.push(locale === 'vi' ? 'Không có khoảng trống đã biết.' : 'No known gaps.');
    result.fixes.forEach(function (fix, index) {
      lines.push((index + 1) + '. ' + escapeMarkdown(fix.text) + ' (' + fix.weight + ' ' + (locale === 'vi' ? 'trọng số' : 'weight') + ')');
    });
    lines.push('');
    lines.push('## ' + (locale === 'vi' ? 'Cần xác minh' : 'Needs verification'));
    lines.push('');
    if (result.verification.length === 0) lines.push(locale === 'vi' ? 'Không có mục chưa rõ.' : 'No uncertain items.');
    result.verification.forEach(function (item) {
      lines.push('- ' + escapeMarkdown(item.text));
    });
    lines.push('');
    lines.push('## ' + (locale === 'vi' ? 'Giải thích' : 'Explanation'));
    lines.push('');
    result.explanation.forEach(function (line) {
      lines.push('- ' + escapeMarkdown(line));
    });
    lines.push('');
    return lines.join('\n');
  }

  function init(doc, win) {
    const localeState = { value: 'vi' };
    const answers = {};

    function t(key) { return UI[localeState.value][key]; }

    function applyLanguage(locale) {
      localeState.value = language(locale);
      doc.documentElement.lang = localeState.value === 'vi' ? 'vi' : 'en';
      doc.querySelectorAll('[data-i18n]').forEach(function (element) {
        const key = element.getAttribute('data-i18n');
        if (Object.prototype.hasOwnProperty.call(UI[localeState.value], key)) element.textContent = UI[localeState.value][key];
      });
      doc.querySelectorAll('[data-i18n-aria-label]').forEach(function (element) {
        const key = element.getAttribute('data-i18n-aria-label');
        if (Object.prototype.hasOwnProperty.call(UI[localeState.value], key)) element.setAttribute('aria-label', UI[localeState.value][key]);
      });
    }

    function collectAnswers() {
      ITEMS.forEach(function (item) {
        const checked = doc.querySelector('input[name="' + item.id + '"]:checked');
        answers[item.id] = checked ? checked.value : 'unknown';
      });
    }

    function renderChecklist() {
      const root = doc.getElementById('checklist');
      if (!root) return;
      root.textContent = '';
      CATEGORIES.forEach(function (category) {
        const section = doc.createElement('section');
        section.className = 'category';
        const heading = doc.createElement('h3');
        heading.textContent = category[localeState.value] + ' (' + category.weight + ' ' + t('weightLabel') + ')';
        section.appendChild(heading);

        ITEMS.filter(function (item) { return item.category === category.id; }).forEach(function (item) {
          const fieldset = doc.createElement('fieldset');
          fieldset.className = 'item';

          const legend = doc.createElement('legend');
          legend.textContent = item[localeState.value].label;
          fieldset.appendChild(legend);

          const help = doc.createElement('p');
          help.className = 'help';
          help.textContent = item[localeState.value].help;
          fieldset.appendChild(help);

          const group = doc.createElement('div');
          group.className = 'answer-group';
          group.setAttribute('role', 'radiogroup');
          group.setAttribute('aria-labelledby', legend.id || '');
          if (!legend.id) {
            legend.id = 'legend-' + item.id;
            group.setAttribute('aria-labelledby', legend.id);
          }

          ANSWER_VALUES.forEach(function (value) {
            const label = doc.createElement('label');
            label.className = 'answer-option';
            const input = doc.createElement('input');
            input.type = 'radio';
            input.name = item.id;
            input.value = value;
            const current = Object.prototype.hasOwnProperty.call(answers, item.id) ? answers[item.id] : 'unknown';
            if (normalizeAnswer(current) === value) input.checked = true;
            label.appendChild(input);
            label.appendChild(doc.createTextNode(' ' + answerLabel(value, localeState.value)));
            group.appendChild(label);
          });

          fieldset.appendChild(group);
          section.appendChild(fieldset);
        });

        root.appendChild(section);
      });
    }

    function renderScore(result) {
      const summary = doc.getElementById('score-summary');
      const details = doc.getElementById('score-details');
      const fixes = doc.getElementById('fixes');
      if (!summary || !details || !fixes) return;

      summary.textContent = '';
      const scoreValue = doc.createElement('p');
      scoreValue.className = 'score-value';
      scoreValue.textContent = result.scorePercent === null
        ? (localeState.value === 'vi' ? 'Chưa đủ thông tin' : 'Not enough information')
        : result.scorePercent + '%';
      summary.appendChild(scoreValue);

      const scoreMeta = doc.createElement('p');
      scoreMeta.className = 'score-meta';
      scoreMeta.textContent = result.statusLabel;
      summary.appendChild(scoreMeta);

      const stats = doc.createElement('dl');
      stats.className = 'stats';
      const statRows = [
        [t('coverageLabel'), result.coveragePercent + '%'],
        [t('knownLabel'), result.knownWeight + '/' + result.totalWeight],
        [t('yesLabel'), result.yesWeight],
        [t('noLabel'), result.noWeight],
        [t('unknownLabel'), result.unknownWeight]
      ];
      statRows.forEach(function (row) {
        const dt = doc.createElement('dt');
        dt.textContent = row[0];
        const dd = doc.createElement('dd');
        dd.textContent = row[1];
        stats.appendChild(dt);
        stats.appendChild(dd);
      });
      summary.appendChild(stats);

      details.textContent = '';
      const categoryHeading = doc.createElement('h3');
      categoryHeading.textContent = t('categoryScores');
      details.appendChild(categoryHeading);
      const categoryList = doc.createElement('ul');
      categoryList.className = 'category-scores';
      result.categories.forEach(function (category) {
        const item = doc.createElement('li');
        item.textContent = category.label + ': ' + (category.scorePercent === null ? '-' : category.scorePercent + '%') +
          ' (' + (localeState.value === 'vi' ? 'độ phủ' : 'coverage') + ' ' + category.coveragePercent + '%)';
        categoryList.appendChild(item);
      });
      details.appendChild(categoryList);

      const strengthsHeading = doc.createElement('h3');
      strengthsHeading.textContent = t('strengths');
      details.appendChild(strengthsHeading);
      const strengthsList = doc.createElement('ul');
      if (result.strengths.length === 0) {
        const li = doc.createElement('li');
        li.textContent = t('noStrengths');
        strengthsList.appendChild(li);
      } else {
        result.strengths.forEach(function (item) {
          const li = doc.createElement('li');
          li.textContent = item.label;
          strengthsList.appendChild(li);
        });
      }
      details.appendChild(strengthsList);

      const gapsHeading = doc.createElement('h3');
      gapsHeading.textContent = t('gaps');
      details.appendChild(gapsHeading);
      const gapsList = doc.createElement('ul');
      if (result.gaps.length === 0) {
        const li = doc.createElement('li');
        li.textContent = t('noGaps');
        gapsList.appendChild(li);
      } else {
        result.gaps.forEach(function (item) {
          const li = doc.createElement('li');
          li.textContent = item.label + ' (' + item.weight + ' ' + t('weightLabel') + ')';
          gapsList.appendChild(li);
        });
      }
      details.appendChild(gapsList);

      const verifyHeading = doc.createElement('h3');
      verifyHeading.textContent = t('verify');
      details.appendChild(verifyHeading);
      const verifyList = doc.createElement('ul');
      if (result.unknowns.length === 0) {
        const li = doc.createElement('li');
        li.textContent = t('noUnknowns');
        verifyList.appendChild(li);
      } else {
        result.unknowns.forEach(function (item) {
          const li = doc.createElement('li');
          li.textContent = item.label;
          verifyList.appendChild(li);
        });
      }
      details.appendChild(verifyList);

      const explanationHeading = doc.createElement('h3');
      explanationHeading.textContent = localeState.value === 'vi' ? 'Giải thích điểm' : 'Score explanation';
      details.appendChild(explanationHeading);
      const explanationList = doc.createElement('ol');
      result.explanation.forEach(function (line) {
        const li = doc.createElement('li');
        li.textContent = line;
        explanationList.appendChild(li);
      });
      details.appendChild(explanationList);

      fixes.textContent = '';
      const fixesHeading = doc.createElement('h3');
      fixesHeading.textContent = t('fixesTitle');
      fixes.appendChild(fixesHeading);
      if (result.fixes.length === 0) {
        const p = doc.createElement('p');
        p.textContent = t('noGaps');
        fixes.appendChild(p);
      } else {
        const fixesList = doc.createElement('ol');
        result.fixes.forEach(function (fix) {
          const li = doc.createElement('li');
          li.textContent = fix.text;
          fixesList.appendChild(li);
        });
        fixes.appendChild(fixesList);
      }
    }

    function updateScore(announce) {
      collectAnswers();
      const result = computeScore(answers, localeState.value);
      renderScore(result);
      const statusElement = doc.getElementById('form-status');
      if (statusElement) {
        statusElement.textContent = announce ? t('formStatusCalculated') : '';
      }
      return result;
    }

    function downloadText(filename, text, type) {
      const blob = new Blob([text], { type: type });
      const url = (win.URL || win.webkitURL).createObjectURL(blob);
      const link = doc.createElement('a');
      link.href = url;
      link.download = filename;
      doc.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(function () { (win.URL || win.webkitURL).revokeObjectURL(url); }, 0);
    }

    applyLanguage(localeState.value);
    renderChecklist();
    updateScore(false);

    const languageSelect = doc.getElementById('language');
    if (languageSelect) {
      languageSelect.value = localeState.value;
      languageSelect.addEventListener('change', function (event) {
        collectAnswers();
        applyLanguage(event.target.value);
        renderChecklist();
        updateScore(false);
      });
    }

    const loadSampleButton = doc.getElementById('load-sample');
    if (loadSampleButton) {
      loadSampleButton.addEventListener('click', function () {
        const sample = sampleAnswers();
        Object.keys(sample).forEach(function (key) { answers[key] = sample[key]; });
        renderChecklist();
        updateScore(true);
      });
    }

    const resetButton = doc.getElementById('reset');
    if (resetButton) {
      resetButton.addEventListener('click', function () {
        Object.keys(answers).forEach(function (key) { delete answers[key]; });
        renderChecklist();
        updateScore(true);
      });
    }

    const form = doc.getElementById('score-form');
    if (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        updateScore(true);
      });
      form.addEventListener('change', function (event) {
        if (event.target && event.target.name && ITEMS.some(function (item) { return item.id === event.target.name; })) {
          answers[event.target.name] = event.target.value;
          updateScore(false);
        }
      });
    }

    const copyButton = doc.getElementById('copy-worksheet');
    if (copyButton) {
      copyButton.addEventListener('click', function () {
        const result = computeScore(answers, localeState.value);
        const text = exportMarkdown(result);
        const statusElement = doc.getElementById('form-status');
        if (win.navigator && win.navigator.clipboard && typeof win.navigator.clipboard.writeText === 'function') {
          win.navigator.clipboard.writeText(text).then(function () {
            if (statusElement) statusElement.textContent = localeState.value === 'vi' ? 'Đã sao chép phiếu vào bảng tạm.' : 'Worksheet copied to clipboard.';
          }).catch(function () {
            const fallback = doc.getElementById('copy-fallback');
            if (fallback) {
              fallback.hidden = false;
              fallback.value = text;
              fallback.focus();
              fallback.select();
            }
            if (statusElement) statusElement.textContent = localeState.value === 'vi' ? 'Không sao chép được; đã mở vùng văn bản.' : 'Clipboard unavailable; text area opened.';
          });
        } else {
          const fallback = doc.getElementById('copy-fallback');
          if (fallback) {
            fallback.hidden = false;
            fallback.value = text;
            fallback.focus();
            fallback.select();
          }
          if (statusElement) statusElement.textContent = localeState.value === 'vi' ? 'Đã mở vùng văn bản để sao chép.' : 'Text area opened for copying.';
        }
      });
    }

    const csvButton = doc.getElementById('export-csv');
    if (csvButton) {
      csvButton.addEventListener('click', function () {
        const result = computeScore(answers, localeState.value);
        downloadText('accessibility-scorecard.csv', exportCsv(result), 'text/csv;charset=utf-8');
        const statusElement = doc.getElementById('form-status');
        if (statusElement) statusElement.textContent = localeState.value === 'vi' ? 'Đã tải CSV.' : 'CSV downloaded.';
      });
    }

    const mdButton = doc.getElementById('export-md');
    if (mdButton) {
      mdButton.addEventListener('click', function () {
        const result = computeScore(answers, localeState.value);
        downloadText('accessibility-scorecard.md', exportMarkdown(result), 'text/markdown;charset=utf-8');
        const statusElement = doc.getElementById('form-status');
        if (statusElement) statusElement.textContent = localeState.value === 'vi' ? 'Đã tải Markdown.' : 'Markdown downloaded.';
      });
    }

    const statusElement = doc.getElementById('form-status');
    if (statusElement && !statusElement.textContent) {
      statusElement.textContent = '';
    }
  }

  return Object.freeze({
    ANSWER_VALUES: ANSWER_VALUES,
    CATEGORIES: CATEGORIES,
    ITEMS: ITEMS,
    TOTAL_WEIGHT: TOTAL_WEIGHT,
    UI: UI,
    language: language,
    normalizeAnswer: normalizeAnswer,
    categoryLabel: categoryLabel,
    itemText: itemText,
    answerLabel: answerLabel,
    statusLabel: statusLabel,
    computeScore: computeScore,
    exportCsv: exportCsv,
    exportMarkdown: exportMarkdown,
    sampleAnswers: sampleAnswers,
    init: init
  });
});

(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.WorkshopCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const LIMITS = Object.freeze({ title: 120, symptom: 600, steps: 1200, expected: 400, actual: 400, scope: 400 });
  const COPY = {
    vi: {
      notice: 'Dữ liệu tổng hợp • Chỉ mô phỏng trên giấy. Không kết nối GitHub, chạy lệnh hoặc sửa lỗi thật.',
      invalid: 'Bản ghi phải là một đối tượng.', required: 'Bắt buộc, ít nhất 3 ký tự.', long: 'Vượt giới hạn ký tự: ',
      url: 'Không nhập URL, địa chỉ web hoặc liên kết. Chỉ dùng văn bản tổng hợp.',
      steps: 'Nhập 2–6 bước, mỗi dòng một bước (3–200 ký tự/bước).', choice: 'Chọn một giá trị hợp lệ.',
      consent: 'Xác nhận chỉ dùng dữ liệu tổng hợp và mô phỏng.',
      stages: ['Giới thiệu', 'Tái hiện', 'Lập kế hoạch', 'Mô phỏng sửa', 'Kiểm chứng', 'Tổng kết'],
      goals: ['Phân biệt triệu chứng, bằng chứng và giả thuyết.', 'Viết tiêu chí kiểm chứng cho một thay đổi nhỏ.'],
      actions: [
        'Đọc tiêu đề và phạm vi. Nêu người bị ảnh hưởng; thống nhất đây là bài tập tổng hợp.',
        'Đi lần lượt các bước trên giấy. Ghi điểm đầu tiên mà kết quả thực tế khác kỳ vọng; không chạy lệnh.',
        'Đề xuất hai giả thuyết và chọn bằng chứng có thể bác bỏ từng giả thuyết. Chọn một thay đổi nằm trong phạm vi.',
        'Vẽ trạng thái trước/sau trên giấy hoặc viết mô tả thay đổi. Đổi vai người dùng và người kiểm tra; không chỉnh kho mã.',
        'Đối chiếu kỳ vọng với mô phỏng. Thử lại ca ban đầu và một ca biên; ghi đạt/chưa đạt cùng bằng chứng.',
        'Mỗi người nêu một điều đã học và một câu hỏi còn mở. Ghi rõ chưa xác minh hoặc sửa bất kỳ lỗi thật nào.'
      ],
      exercises: [
        ['noncoder', 'Thẻ bằng chứng', 'Chia giấy thành ba cột: quan sát, giả thuyết, câu hỏi. Phân loại triệu chứng và kết quả thực tế.', 'Một quan sát được trích từ bản ghi, một giả thuyết có thể kiểm tra.'],
        ['noncoder', 'Đóng vai kiểm thử', 'Đọc các bước cho bạn cùng nhóm đóng vai giao diện. Thêm một đầu vào rỗng và so sánh với kỳ vọng.', 'Bảng hai ca kiểm thử, mỗi ca có kết quả mong muốn và kết quả mô phỏng.'],
        ['developer', 'Phác thảo thay đổi', 'Viết mô tả hàm hoặc điều kiện cần đổi trên giấy. Chỉ ra đầu vào, đầu ra và một phần không được thay đổi.', 'Một mô tả thay đổi nhỏ nằm trong phạm vi an toàn; không thực thi mã.'],
        ['developer', 'Thiết kế kiểm thử hồi quy', 'Viết Given/When/Then cho ca gốc và một ca biên. Giải thích vì sao kiểm thử phân biệt được trước/sau.', 'Hai đặc tả kiểm thử và tiêu chí đạt rõ ràng.']
      ],
      high: 'Độ phức tạp cao: chỉ mô phỏng một nhánh nhỏ; các phần còn lại đưa vào câu hỏi mở.',
      normal: 'Giữ thay đổi nhỏ, có thể giải thích bằng một sơ đồ trước/sau.',
      worksheet: 'PHIẾU WORKSHOP', issue: 'Bản ghi tổng hợp', timing: 'Lịch trình', exercise: 'Bài tập', stage: 'Giai đoạn', exerciseHelp: 'Trong giai đoạn 3 và 5, chia cặp theo vai; mỗi nhóm chọn một bài phù hợp trong thời gian đã phân bổ, không cộng thêm phút.', values: {low:'Thấp', medium:'Vừa', high:'Cao', mixed:'Hỗn hợp', noncoder:'Không lập trình', developer:'Lập trình viên'}, deliver: 'Sản phẩm', notes: 'Ghi chép: quan sát / giả thuyết / bằng chứng / câu hỏi mở',
      labels: { title: 'Tiêu đề', symptom: 'Triệu chứng', steps: 'Các bước tái hiện', expected: 'Kỳ vọng', actual: 'Thực tế', complexity: 'Độ phức tạp', scope: 'Phạm vi an toàn', audience: 'Nhóm tham gia' }
    },
    en: {
      notice: 'Synthetic data • Paper simulation only. No GitHub connection, command execution or real bug fixes.',
      invalid: 'The record must be an object.', required: 'Required, at least 3 characters.', long: 'Character limit exceeded: ',
      url: 'No URLs, web addresses or links. Use synthetic plain text only.',
      steps: 'Enter 2–6 steps, one per line (3–200 characters per step).', choice: 'Select a valid value.',
      consent: 'Confirm synthetic data and simulation only.',
      stages: ['Introduction', 'Reproduce', 'Plan', 'Fix simulation', 'Verify', 'Recap'],
      goals: ['Separate symptoms, evidence and hypotheses.', 'Write verification criteria for one small change.'],
      actions: [
        'Read the title and scope. Name the affected person; agree this is a synthetic exercise.',
        'Walk through the steps on paper. Record the first point where actual and expected differ; run no commands.',
        'Suggest two hypotheses and evidence that could disprove each. Choose one change within scope.',
        'Draw before/after states on paper or describe a change. Swap user and reviewer roles; do not edit a repository.',
        'Compare the simulation with the expected result. Repeat the original case and one edge case; record pass/fail with evidence.',
        'Each person shares one learning and one open question. Record that no real bug has been verified or fixed.'
      ],
      exercises: [
        ['noncoder', 'Evidence cards', 'Make three paper columns: observation, hypothesis, question. Classify the symptom and actual result.', 'One observation quoted from the record and one testable hypothesis.'],
        ['noncoder', 'Role-play a test', 'Read the steps while a partner acts as the interface. Add an empty input and compare with expectations.', 'Two test cases with expected and simulated results.'],
        ['developer', 'Sketch a change', 'Describe a function or condition to change on paper. Identify inputs, outputs and one invariant.', 'A small change description within safe scope; no code execution.'],
        ['developer', 'Design a regression test', 'Write Given/When/Then for the original case and one edge case. Explain how each distinguishes before from after.', 'Two test specifications with explicit pass criteria.']
      ],
      high: 'High complexity: simulate one small branch only; park the remaining work as open questions.',
      normal: 'Keep the change small enough to explain with one before/after diagram.',
      worksheet: 'WORKSHOP WORKSHEET', issue: 'Synthetic record', timing: 'Schedule', exercise: 'Exercises', stage: 'Stage', exerciseHelp: 'During stages 3 and 5, pair up by role; each group chooses one relevant exercise within the allocated time, without adding minutes.', values: {low:'Low', medium:'Medium', high:'High', mixed:'Mixed', noncoder:'Non-coder', developer:'Developer'}, deliver: 'Deliverable', notes: 'Notes: observation / hypothesis / evidence / open questions',
      labels: { title: 'Title', symptom: 'Symptom', steps: 'Reproduction steps', expected: 'Expected', actual: 'Actual', complexity: 'Complexity', scope: 'Safe scope', audience: 'Audience' }
    }
  };
  const SCENARIOS = [
    { id: 'filter', vi: ['Bộ lọc bỏ sót chữ hoa', 'Người học không tìm thấy thẻ đã có trong danh sách.', 'Mở danh sách thẻ mẫu\nNhập từ KHOA vào bộ lọc\nSo sánh với thẻ Khoa học', 'Thẻ Khoa học vẫn xuất hiện.', 'Danh sách trống khi dùng chữ hoa.', 'Chỉ so sánh chữ hoa/thường trên ba thẻ tổng hợp.'], en: ['Filter misses uppercase text', 'A learner cannot find a card already in the list.', 'Open the sample card list\nType SCIENCE in the filter\nCompare with the Science card', 'The Science card remains visible.', 'The list is empty with uppercase input.', 'Compare letter case on three synthetic cards only.'], complexity: 'low' },
    { id: 'count', vi: ['Bộ đếm không cập nhật', 'Số mục còn lại không đổi sau khi đánh dấu xong.', 'Mở ba nhiệm vụ tổng hợp\nĐánh dấu nhiệm vụ đầu tiên hoàn tất\nĐọc số mục còn lại', 'Bộ đếm hiển thị hai mục còn lại.', 'Bộ đếm vẫn hiển thị ba mục.', 'Mô phỏng bộ đếm ba mục trên giấy, không dùng dữ liệu thật.'], en: ['Counter does not update', 'The remaining count stays unchanged after completing an item.', 'Open three synthetic tasks\nMark the first task complete\nRead the remaining count', 'The counter shows two remaining items.', 'The counter still shows three items.', 'Simulate a three-item counter on paper without real data.'], complexity: 'medium' },
    { id: 'focus', vi: ['Hộp thoại làm mất tiêu điểm', 'Người dùng bàn phím không biết vị trí sau khi đóng hộp thoại.', 'Đặt tiêu điểm lên nút Chi tiết\nMở hộp thoại mẫu\nĐóng bằng phím Escape', 'Tiêu điểm quay về nút Chi tiết.', 'Tiêu điểm quay về đầu trang.', 'Vẽ đường đi tiêu điểm của một hộp thoại giả lập; không sửa giao diện thật.'], en: ['Dialog loses focus', 'A keyboard user loses their place after closing a dialog.', 'Focus the Details button\nOpen the sample dialog\nClose it with Escape', 'Focus returns to the Details button.', 'Focus returns to the top of the page.', 'Draw the focus path for one fictional dialog; do not modify a real interface.'], complexity: 'high' }
  ];
  function language(lang) { return lang === 'en' ? 'en' : 'vi'; }
  function sanitize(value) {
    return String(value).normalize('NFC').replace(/<[^>]*>/g, '').replace(/!?(?:\[([^\]]*)\])\([^)]*\)/g, '$1')
      .replace(/[`*_~#>|]/g, '').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f\u202a-\u202e\u2066-\u2069]/g, '').trim();
  }
  function hasURL(value) {
    return /(?:[a-z][a-z0-9+.-]*\s*:|www\.|\/\/|\b[a-z0-9-]+\.[a-z]{2,63}\b|\b(?:\d{1,3}\.){3}\d{1,3}\b|\[[^\]]*\]\s*\()/i.test(value);
  }
  function validate(input, lang) {
    const t = COPY[language(lang)], errors = {}, data = {};
    if (!input || typeof input !== 'object' || Array.isArray(input)) return { ok: false, errors: { record: t.invalid } };
    for (const [key, max] of Object.entries(LIMITS)) {
      const raw = input[key];
      if (typeof raw !== 'string') { errors[key] = t.required; continue; }
      if (raw.length > max) { errors[key] = t.long + max; continue; }
      if (hasURL(raw)) { errors[key] = t.url; continue; }
      const clean = sanitize(raw);
      if (clean.length < 3) { errors[key] = t.required; continue; }
      data[key] = clean;
    }
    if (data.steps) {
      const steps = data.steps.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
      if (steps.length < 2 || steps.length > 6 || steps.some(s => s.length < 3 || s.length > 200)) errors.steps = t.steps;
      else data.steps = steps;
    }
    for (const [key, values] of Object.entries({ complexity: ['low', 'medium', 'high'], audience: ['mixed', 'noncoder', 'developer'] })) {
      if (!values.includes(input[key])) errors[key] = t.choice;
      else data[key] = input[key];
    }
    if (input.synthetic !== true) errors.synthetic = t.consent;
    data.synthetic = true;
    return { ok: Object.keys(errors).length === 0, errors, data };
  }
  function scenario(id, lang) {
    const item = SCENARIOS.find(s => s.id === id);
    if (!item) return null;
    const [title, symptom, steps, expected, actual, scope] = item[language(lang)];
    return { title, symptom, steps, expected, actual, scope, complexity: item.complexity, audience: 'mixed', synthetic: true };
  }
  function generate(input, lang) {
    const locale = language(lang), result = validate(input, locale);
    if (!result.ok) return result;
    const t = COPY[locale], times = [3, 4, 3, 5, 3, 2];
    let start = 0;
    const stages = times.map((minutes, i) => {
      const stage = { title: t.stages[i], minutes, start, end: start + minutes, instruction: t.actions[i] };
      start += minutes; return stage;
    });
    const exercises = t.exercises.map((e, i) => ({ id: 'exercise-' + (i + 1), audience: e[0], title: e[1], task: e[2], deliverable: e[3], stage: i % 2 === 0 ? 3 : 5 }));
    if (result.data.audience !== 'mixed') exercises.sort((a, b) => Number(b.audience === result.data.audience) - Number(a.audience === result.data.audience));
    return { ok: true, plan: { schemaVersion: 1, locale, synthetic: true, simulationOnly: true, totalMinutes: 20, notice: t.notice,
      exerciseGuidance: t.exerciseHelp, issue: result.data, goals: t.goals.slice(), scopeGuidance: result.data.complexity === 'high' ? t.high : t.normal, stages, exercises } };
  }
  function worksheet(plan) {
    const t = COPY[language(plan.locale)];
    const record = Object.keys(t.labels).map(k => t.labels[k] + ': ' + (Array.isArray(plan.issue[k]) ? plan.issue[k].join('\n') : (t.values[plan.issue[k]] || plan.issue[k])));
    return [t.worksheet + ' · 20 min', plan.notice, '', t.issue, ...record, '', ...plan.goals, plan.scopeGuidance, '', t.timing,
      ...plan.stages.map(s => `${s.start}–${s.end} (${s.minutes} min) ${s.title}\n${s.instruction}`), '', t.exercise, plan.exerciseGuidance,
      ...plan.exercises.map(e => `${e.title} [${t.values[e.audience]} · ${t.stage} ${e.stage}]\n${e.task}\n${t.deliver}: ${e.deliverable}`), '', t.notes, '________________________'].join('\n');
  }
  function exportJSON(plan) { return JSON.stringify(plan, null, 2); }
  return Object.freeze({ LIMITS, COPY, sanitize, hasURL, validate, scenario, generate, worksheet, exportJSON, scenarioIds: Object.freeze(SCENARIOS.map(s => s.id)) });
});

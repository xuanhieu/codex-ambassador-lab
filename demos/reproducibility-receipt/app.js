'use strict';
(() => {
  const C = window.ReceiptCore;
  const el = id => document.getElementById(id);
  const copy = {
    vi: {
      language: 'Ngôn ngữ', eyebrow: 'CỤC BỘ · KHÔNG TẢI LÊN', title: 'Bằng chứng có dấu vết. Niềm tin có giới hạn.', intro: 'Tạo biên nhận cho kết quả kiểm thử tự khai báo. Tệp ở lại trong trình duyệt; công cụ không chạy lại bộ kiểm thử.', load: 'Nạp bằng chứng', file: 'Chọn tệp JSON cục bộ (tối đa 1 MiB)', schema: 'Chỉ nhận đúng cấu trúc trong README. Tất cả trường bằng chứng đều bắt buộc.', sample: 'Dùng báo cáo mẫu', privacy: 'Không cần thông tin cá nhân. Tên tệp và nội dung đã nhập sẽ xuất hiện trong biên nhận xuất ra.', receipt: 'Biên nhận tự kiểm thử', warning: 'Không phải chứng nhận chính thức, xác minh độc lập hay chữ ký số.', empty: 'Chưa có bằng chứng. Nạp tệp để tạo biên nhận.', total: 'Tổng', passed: 'Đạt', failed: 'Lỗi', proof: 'Bằng chứng đầu vào tự khai báo', export: 'Xuất biên nhận JSON', verify: 'Cách xác minh độc lập', step1: 'Lấy mã nguồn, dữ liệu đầu vào và môi trường từ một kênh đáng tin cậy.', step2: 'Tự chạy đúng bộ kiểm thử; so sánh kết quả và lưu nhật ký thực thi.', step3: 'Tính SHA-256 của tệp JSON gốc và so với biên nhận. Khớp mã băm chỉ chứng minh cùng byte, không chứng minh kết quả đúng.', clock: 'Thời gian lấy từ đồng hồ thiết bị. Biên nhận xuất ra không có chữ ký số.', footer: 'Chẩn đoán tự khai báo · Không phải bằng chứng triển khai', ready: 'Sẵn sàng nạp tệp cục bộ.', loading: 'Đang kiểm tra và tính mã băm…', loaded: 'Đã tạo biên nhận tự khai báo.', rejected: 'Không thể tạo biên nhận. Chi tiết kỹ thuật: ', exported: 'Đã tạo tệp JSON để lưu cục bộ.', noFile: 'Chưa chọn tệp bằng chứng.', huge: 'Tệp phải có từ 1 byte đến 1 MiB.', passBadge: 'ĐẠT · Kết quả tự khai báo', failBadge: 'CÓ LỖI · Không cấp huy hiệu xanh', pendingBadge: 'Tự khai báo đạt · Không có mã băm', source: 'Nguồn', local: 'Tệp cục bộ do người dùng chọn', fixture: 'MẪU TÍCH HỢP · Không phải bằng chứng thực tế', filename: 'Tên tệp', bytes: 'Số byte gốc', timestamp: 'Tạo lúc (UTC · đồng hồ thiết bị)', digest: 'SHA-256 của byte gốc', unavailable: 'Không khả dụng trong trình duyệt/ngữ cảnh này; không có mã băm thay thế.', inputDescription: 'Mô tả đầu vào', procedure: 'Quy trình', environment: 'Môi trường', suite: 'Bộ kiểm thử: '
    },
    en: {
      language: 'Language', eyebrow: 'LOCAL ONLY · NO UPLOAD', title: 'Evidence with a trail. Trust with limits.', intro: 'Create a receipt for self-reported test results. Files stay in your browser; this tool does not rerun the test suite.', load: 'Load evidence', file: 'Choose local JSON (maximum 1 MiB)', schema: 'Use the exact schema in README. All input proof fields are required.', sample: 'Use sample report', privacy: 'No personal details needed. The filename and imported content will appear in the exported receipt.', receipt: 'Self-test receipt', warning: 'No official certification, independent verification, or cryptographic signature.', empty: 'No evidence yet. Load a file to create a receipt.', total: 'Total', passed: 'Passed', failed: 'Failed', proof: 'Self-reported input proof', export: 'Export receipt JSON', verify: 'How to verify independently', step1: 'Obtain the source, input data, and environment from a trusted channel.', step2: 'Run the exact test suite yourself; compare results and retain execution logs.', step3: 'Compute SHA-256 of the original JSON file and compare it with the receipt. Matching hashes establish matching bytes, not correct results.', clock: 'Time comes from the device clock. Exported receipts have no cryptographic signature.', footer: 'User-attested diagnostic · No deployment proof', ready: 'Ready for local evidence.', loading: 'Validating and hashing evidence…', loaded: 'User-attested receipt created.', rejected: 'Cannot create receipt. Technical detail: ', exported: 'JSON created for local saving.', noFile: 'No evidence file selected.', huge: 'File must contain 1 byte to 1 MiB.', passBadge: 'PASS · Self-reported result', failBadge: 'FAILED · No green badge', pendingBadge: 'Reported pass · Digest unavailable', source: 'Source', local: 'User-selected local file', fixture: 'BUILT-IN SAMPLE · Not real-world evidence', filename: 'Filename', bytes: 'Original bytes', timestamp: 'Generated (UTC · device clock)', digest: 'SHA-256 of original bytes', unavailable: 'Unavailable in this browser/context; no substitute digest.', inputDescription: 'Input description', procedure: 'Procedure', environment: 'Environment', suite: 'Test suite: '
    }
  };
  const sample = { artifactLabel: 'N078 demonstration artifact', suiteName: 'Example arithmetic checks (fixture only)', total: 3, passed: 3, failed: 0, inputProof: { inputDescription: 'Sample integers: 2, 3, 5. This is demonstration data.', procedure: 'Example claims: 2 + 3 = 5; 5 - 3 = 2; 5 - 2 = 3. This tool does not execute these checks.', environment: 'Built-in illustrative fixture; no external run or deployment.' } };
  let lang = 'vi';
  let receipt = null;
  let revision = 0;
  let state = 'ready';
  let errorDetail = '';
  const t = key => copy[lang][key];
  function pair(container, label, value) {
    const dt = document.createElement('dt');
    const dd = document.createElement('dd');
    dt.textContent = label;
    dd.textContent = String(value);
    container.append(dt, dd);
  }
  function render() {
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-i18n]').forEach(node => { node.textContent = t(node.dataset.i18n); });
    el('status').textContent = state === 'error' ? '' : t(state);
    if (receipt && state === 'loaded') el('status').textContent += ' ' + t(receipt.status === 'failed' ? 'failBadge' : receipt.status === 'self-reported-pass' ? 'passBadge' : 'pendingBadge');
    el('error').textContent = state === 'error' ? t('rejected') + errorDetail : '';
    el('empty').hidden = !!receipt;
    el('result').hidden = !receipt;
    el('export').disabled = !receipt;
    if (!receipt) return;
    const r = receipt.report;
    const status = receipt.status;
    el('badge').textContent = t(status === 'failed' ? 'failBadge' : status === 'self-reported-pass' ? 'passBadge' : 'pendingBadge');
    el('badge').className = 'badge' + (status === 'failed' ? ' failed' : status === 'self-reported-pass' ? '' : ' pending');
    el('artifact').textContent = r.artifactLabel;
    el('suite').textContent = t('suite') + r.suiteName;
    for (const key of ['total', 'passed', 'failed']) el(key).textContent = String(r[key]);
    const meta = el('metadata');
    meta.replaceChildren();
    pair(meta, t('source'), t(receipt.evidence.source === 'local-file' ? 'local' : 'fixture'));
    pair(meta, t('filename'), receipt.evidence.filename);
    pair(meta, t('bytes'), receipt.evidence.byteLength);
    pair(meta, t('timestamp'), receipt.generatedAt);
    pair(meta, t('digest'), receipt.evidence.sha256 || t('unavailable'));
    const proof = el('proof-values');
    proof.replaceChildren();
    for (const key of ['inputDescription', 'procedure', 'environment']) pair(proof, t(key), r.inputProof[key]);
  }
  async function load(file, isSample) {
    const token = ++revision;
    receipt = null;
    state = 'loading';
    errorDetail = '';
    render();
    try {
      if (!file) throw new Error(t('noFile'));
      if (!file.size || file.size > C.MAX_BYTES) throw new Error(t('huge'));
      const bytes = new Uint8Array(await file.arrayBuffer());
      if (token !== revision) return;
      const report = C.parseEvidence(bytes, file.name);
      let digest = null;
      try {
        if (window.crypto && window.crypto.subtle) {
          const hash = await window.crypto.subtle.digest('SHA-256', bytes);
          digest = Array.from(new Uint8Array(hash), n => n.toString(16).padStart(2, '0')).join('');
        }
      } catch (_) { digest = null; }
      if (token !== revision) return;
      receipt = C.makeReceipt(report, { source: isSample ? 'built-in-sample' : 'local-file', filename: file.name, byteLength: bytes.byteLength, digest, generatedAt: new Date().toISOString() });
      state = 'loaded';
    } catch (error) {
      if (token !== revision) return;
      receipt = null;
      state = 'error';
      errorDetail = error.message;
    }
    render();
  }
  el('language').addEventListener('change', event => { lang = event.target.value === 'en' ? 'en' : 'vi'; render(); });
  el('evidence').addEventListener('change', event => { void load(event.target.files[0], false); });
  el('sample').addEventListener('click', () => {
    el('evidence').value = '';
    const bytes = new TextEncoder().encode(JSON.stringify(sample, null, 2) + '\n');
    void load({ name: 'n078-sample.json', size: bytes.byteLength, arrayBuffer: async () => bytes.buffer }, true);
  });
  el('export').addEventListener('click', () => {
    if (!receipt) return;
    try {
      const url = URL.createObjectURL(new Blob([C.serializeReceipt(receipt)], { type: 'application/json;charset=utf-8' }));
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'n078-user-attested-receipt.json';
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      state = 'exported';
    } catch (error) { state = 'error'; errorDetail = error.message; }
    render();
  });
  render();
})();

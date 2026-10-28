'use strict';
(() => {
  const C = window.EvidenceCore;
  const el = id => document.getElementById(id);
  const LANGS = ['vi', 'en'];
  let lang = 'vi';
  let evidence = [];
  let sortKey = 'label';
  let sortDir = 'asc';
  let autosaveTimer = null;
  let selected = new Set();

  const copy = {
    vi: {
      title: 'Biến bằng chứng thật thành câu chuyện portfolio.',
      subtitle: 'Nhập tiêu đề, URL bằng chứng thật, kiểm thử đã chạy, giới hạn, vai trò và đối tượng. Ứng dụng tách sự thật đã kiểm chứng khỏi tuyên bố chưa kiểm chứng, cảnh báo số liệu giả và xuất Markdown/JSON ngay trên máy.',
      sampleBtn: 'Nạp dữ liệu mẫu',
      clearAll: 'Xóa toàn bộ & xóa autosave',
      disclaimerLabel: 'KHÔNG PHẢI CHỨNG NHẬN',
      disclaimerTitle: 'Tự khai báo, không xác minh độc lập.',
      disclaimerText: 'URL và kết quả kiểm thử do bạn cung cấp. Công cụ không truy cập URL, không chạy lại kiểm thử và không chứng nhận sự thật.',
      autosaveReady: 'Sẵn sàng. Dữ liệu chỉ lưu cục bộ.',
      autosaveSaved: 'Đã autosave cục bộ.',
      autosaveCleared: 'Đã xóa dữ liệu cục bộ.',
      basicsTitle: 'Thông tin dự án',
      titleLabel: 'Tiêu đề dự án *',
      audienceLabel: 'Đối tượng *',
      roleLabel: 'Vai trò của bạn *',
      summaryLabel: 'Tóm tắt (không bắt buộc)',
      evidenceTitle: 'Bảng bằng chứng có thể sắp xếp',
      evidenceHint: 'Chỉ dùng URL thật. Nhãn provenance cho biết mức kiểm chứng. Nhấp tiêu đề cột để sắp xếp.',
      urlLabel: 'URL bằng chứng *',
      evLabelLabel: 'Nhãn *',
      kindLabel: 'Loại',
      verifiedToggle: 'URL này đã được tôi kiểm chứng độc lập',
      notesLabel: 'Ghi chú',
      addEvidence: 'Thêm vào ledger',
      clearEvidence: 'Xóa các mục đã chọn',
      ledgerEmpty: 'Chưa có bằng chứng. Thêm ít nhất một URL thật.',
      colLabel: 'Nhãn',
      colKind: 'Loại',
      colUrl: 'URL',
      colVerified: 'Kiểm chứng',
      colProvenance: 'Provenance',
      colSelect: 'Chọn',
      testsTitle: 'Kiểm thử thực sự đã chạy',
      testsLabel: 'Lệnh và kết quả (mỗi dòng một mục) *',
      factsTitle: 'Tách sự thật và tuyên bố',
      verifiedFactsLabel: 'Sự thật đã kiểm chứng (mỗi dòng một ý)',
      unverifiedClaimsLabel: 'Tuyên bố chưa kiểm chứng (mỗi dòng một ý)',
      limitsTitle: 'Giới hạn và rủi ro *',
      limitationsLabel: 'Mô tả điều bạn chưa chứng minh được',
      metricsTitle: 'Số liệu (không bắt buộc, cảnh báo)',
      metricsWarning: 'Không bịa số liệu. Nếu thêm số, phải xác nhận bên dưới rằng mọi con số đều có nguồn hoặc là ước tính được gắn nhãn.',
      metricsLabel: 'Số liệu tự khai',
      noFakeMetricsLabel: 'Tôi xác nhận không có số liệu nào bị bịa; mọi con số đều có nguồn hoặc được gắn nhãn là ước tính.',
      exportTitle: 'Xuất bản nháp',
      validateBtn: 'Kiểm tra hợp lệ',
      exportMd: 'Xuất Markdown',
      exportJson: 'Xuất JSON',
      previewTitle: 'Bản nháp bằng chứng',
      footer: 'Evidence-to-Story Portfolio Builder · dữ liệu lưu cục bộ · không tải lên',
      readmeLink: 'README',
      yes: 'Có',
      no: 'Tự khai',
      required: 'Bắt buộc.',
      invalidUrl: 'URL http(s) không hợp lệ.',
      duplicateUrl: 'URL này đã tồn tại trong ledger.',
      validOk: 'Hợp lệ. Có thể xuất.',
      invalidForm: 'Chưa hợp lệ: ',
      exportedMd: 'Đã tạo tệp Markdown.',
      exportedJson: 'Đã tạo tệp JSON.',
      noEvidence: 'Cần ít nhất một bằng chứng.'
    },
    en: {
      title: 'Turn real evidence into a portfolio story.',
      subtitle: 'Enter title, real evidence URLs, tests actually run, limitations, role and audience. The app separates verified facts from unverified claims, warns against fake metrics, and exports Markdown/JSON on your machine.',
      sampleBtn: 'Load sample data',
      clearAll: 'Clear all & delete autosave',
      disclaimerLabel: 'NOT A CERTIFICATION',
      disclaimerTitle: 'User-attested, not independently verified.',
      disclaimerText: 'URLs and test results are provided by you. The tool does not fetch URLs, rerun tests, or certify truth.',
      autosaveReady: 'Ready. Data is stored locally only.',
      autosaveSaved: 'Autosaved locally.',
      autosaveCleared: 'Local data cleared.',
      basicsTitle: 'Project basics',
      titleLabel: 'Project title *',
      audienceLabel: 'Audience *',
      roleLabel: 'Your role *',
      summaryLabel: 'Summary (optional)',
      evidenceTitle: 'Sortable evidence ledger',
      evidenceHint: 'Use real URLs only. Provenance labels show verification level. Click a column header to sort.',
      urlLabel: 'Evidence URL *',
      evLabelLabel: 'Label *',
      kindLabel: 'Type',
      verifiedToggle: 'I independently verified this URL',
      notesLabel: 'Notes',
      addEvidence: 'Add to ledger',
      clearEvidence: 'Remove selected',
      ledgerEmpty: 'No evidence yet. Add at least one real URL.',
      colLabel: 'Label',
      colKind: 'Type',
      colUrl: 'URL',
      colVerified: 'Verified',
      colProvenance: 'Provenance',
      colSelect: 'Select',
      testsTitle: 'Tests actually run',
      testsLabel: 'Commands and results (one per line) *',
      factsTitle: 'Separate facts and claims',
      verifiedFactsLabel: 'Verified facts (one per line)',
      unverifiedClaimsLabel: 'Unverified claims (one per line)',
      limitsTitle: 'Limitations and risks *',
      limitationsLabel: 'Describe what you have not proven',
      metricsTitle: 'Metrics (optional, warning)',
      metricsWarning: 'Do not fabricate metrics. If you add numbers, confirm below that every number has a source or is labelled as an estimate.',
      metricsLabel: 'Self-reported metrics',
      noFakeMetricsLabel: 'I confirm no metric is fabricated; every number has a source or is labelled as an estimate.',
      exportTitle: 'Export draft',
      validateBtn: 'Validate',
      exportMd: 'Export Markdown',
      exportJson: 'Export JSON',
      previewTitle: 'Evidence draft',
      footer: 'Evidence-to-Story Portfolio Builder · local storage only · no upload',
      readmeLink: 'README',
      yes: 'Yes',
      no: 'Self',
      required: 'Required.',
      invalidUrl: 'Invalid http(s) URL.',
      duplicateUrl: 'This URL already exists in the ledger.',
      validOk: 'Valid. Ready to export.',
      invalidForm: 'Not valid: ',
      exportedMd: 'Markdown file created.',
      exportedJson: 'JSON file created.',
      noEvidence: 'At least one evidence item is required.'
    }
  };

  const t = key => (copy[lang] && copy[lang][key]) || key;

  function applyLanguage() {
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-i]').forEach(node => {
      node.textContent = t(node.dataset.i);
    });
    renderAudienceOptions();
    renderKindOptions();
    renderLedger();
    updatePreview();
  }

  function renderAudienceOptions() {
    const select = el('audience');
    const current = select.value;
    select.replaceChildren();
    C.AUDIENCES.forEach(aud => {
      const opt = document.createElement('option');
      opt.value = aud;
      opt.textContent = aud;
      select.append(opt);
    });
    if (current) select.value = current;
  }

  function renderKindOptions() {
    const select = el('evKind');
    const current = select.value;
    select.replaceChildren();
    C.EVIDENCE_KINDS.forEach(kind => {
      const opt = document.createElement('option');
      opt.value = kind;
      opt.textContent = kind;
      select.append(opt);
    });
    if (current) select.value = current;
  }

  function setFieldError(id, message) {
    const node = el(id);
    if (node) node.textContent = message || '';
  }

  function readForm() {
    const verifiedFacts = el('verifiedFacts').value.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
    const unverifiedClaims = el('unverifiedClaims').value.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
    return {
      title: el('title').value,
      audience: el('audience').value,
      role: el('role').value,
      summary: el('summary').value,
      evidence: evidence.map(item => ({ ...item })),
      tests: el('tests').value,
      limitations: el('limitations').value,
      verifiedFacts,
      unverifiedClaims,
      metrics: el('metrics').value,
      noFakeMetrics: el('noFakeMetrics').checked,
      locale: lang
    };
  }

  function validateForm() {
    const data = readForm();
    const result = C.normalizeProject(data);
    const errors = {};
    if (!result.valid) {
      // parse message
      const msg = result.errors.form || '';
      // map rough
      if (/title/i.test(msg)) errors.title = msg;
      else if (/audience/i.test(msg)) errors.audience = msg;
      else if (/role/i.test(msg)) errors.role = msg;
      else if (/evidence/i.test(msg)) errors.evidence = msg;
      else if (/tests/i.test(msg)) errors.tests = msg;
      else if (/limitations/i.test(msg)) errors.limitations = msg;
      else if (/metrics/i.test(msg)) errors.metrics = msg;
      else errors.form = msg;
    }
    // inline per-field basic checks
    if (!data.title.trim()) errors.title = t('required');
    if (!data.audience.trim()) errors.audience = t('required');
    if (!data.role.trim()) errors.role = t('required');
    if (!data.tests.trim()) errors.tests = t('required');
    if (!data.limitations.trim()) errors.limitations = t('required');
    if (data.evidence.length === 0) errors.evidence = t('noEvidence');
    if (data.metrics.trim() && !data.noFakeMetrics) errors.metrics = t('invalidForm') + 'metrics';

    setFieldError('titleErr', errors.title || '');
    setFieldError('audienceErr', errors.audience || '');
    setFieldError('roleErr', errors.role || '');
    setFieldError('summaryErr', '');
    setFieldError('testsErr', errors.tests || '');
    setFieldError('limitationsErr', errors.limitations || '');
    setFieldError('metricsErr', errors.metrics || '');
    setFieldError('verifiedFactsErr', '');
    setFieldError('unverifiedClaimsErr', '');

    const status = el('formStatus');
    if (Object.keys(errors).length === 0 && result.valid) {
      status.textContent = t('validOk');
      status.className = 'result-note';
    } else {
      const first = Object.values(errors)[0] || (result.errors.form || '');
      status.textContent = t('invalidForm') + first;
      status.className = 'result-note';
    }
    return result.valid && Object.keys(errors).length === 0 ? result.value : null;
  }

  function renderLedger() {
    const body = el('ledgerBody');
    body.replaceChildren();
    const sorted = C.sortEvidence(evidence, sortKey, sortDir);
    sorted.forEach(item => {
      const row = document.createElement('tr');
      const cells = [
        item.label,
        item.kind,
        item.url,
        item.verified ? t('yes') : t('no')
      ];
      cells.forEach(value => {
        const td = document.createElement('td');
        td.textContent = value;
        row.append(td);
      });
      const provTd = document.createElement('td');
      const badge = document.createElement('span');
      badge.className = 'provenance prov-' + item.provenance;
      badge.textContent = C.provenanceLabel(item, lang);
      provTd.append(badge);
      row.append(provTd);

      const selTd = document.createElement('td');
      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.checked = selected.has(item.id);
      cb.addEventListener('change', () => {
        if (cb.checked) selected.add(item.id); else selected.delete(item.id);
      });
      selTd.append(cb);
      row.append(selTd);
      body.append(row);
    });
    el('ledgerEmpty').hidden = evidence.length > 0;
    el('ledgerEmpty').style.display = evidence.length > 0 ? 'none' : '';
  }

  function updatePreview() {
    const status = el('formStatus');
    const project = readForm();
    const result = C.normalizeProject(project);
    if (!result.valid) {
      el('preview').textContent = '';
      return;
    }
    try {
      const md = C.generateNarrative(result.value, lang);
      el('preview').textContent = md;
    } catch (_) {
      el('preview').textContent = '';
    }
  }

  function addEvidence() {
    const url = el('evUrl').value.trim();
    const label = el('evLabel').value.trim();
    let ok = true;
    setFieldError('evUrlErr', '');
    setFieldError('evLabelErr', '');
    setFieldError('evFormErr', '');
    const normalized = C.normalizeUrl(url);
    if (!normalized) { setFieldError('evUrlErr', t('invalidUrl')); ok = false; }
    if (!label) { setFieldError('evLabelErr', t('required')); ok = false; }
    if (ok && evidence.some(item => item.url === normalized)) {
      setFieldError('evUrlErr', t('duplicateUrl')); ok = false;
    }
    if (!ok) return;
    evidence.push({
      id: 'ev-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
      url: normalized,
      label,
      kind: el('evKind').value,
      verified: el('evVerified').checked,
      notes: el('evNotes').value.trim(),
      provenance: el('evVerified').checked ? C.PROVENANCE.verifiedUrl : C.PROVENANCE.userAttested
    });
    el('evUrl').value = '';
    el('evLabel').value = '';
    el('evNotes').value = '';
    el('evVerified').checked = false;
    renderLedger();
    scheduleAutosave();
    updatePreview();
  }

  function removeSelected() {
    if (selected.size === 0) return;
    evidence = evidence.filter(item => !selected.has(item.id));
    selected.clear();
    renderLedger();
    scheduleAutosave();
    updatePreview();
  }

  function loadSample() {
    const sample = C.sampleProject();
    el('title').value = sample.title;
    el('audience').value = sample.audience;
    el('role').value = sample.role;
    el('summary').value = sample.summary;
    evidence = sample.evidence.map(item => ({
      id: 'ev-' + Math.random().toString(36).slice(2, 9),
      url: item.url,
      label: item.label,
      kind: item.kind,
      verified: item.verified,
      notes: item.notes,
      provenance: item.verified ? C.PROVENANCE.verifiedUrl : C.PROVENANCE.userAttested
    }));
    // mark sample provenance
    evidence.forEach(item => { item.provenance = C.PROVENANCE.sample; });
    el('tests').value = sample.tests;
    el('limitations').value = sample.limitations;
    el('verifiedFacts').value = sample.verifiedFacts.join('\n');
    el('unverifiedClaims').value = sample.unverifiedClaims.join('\n');
    el('metrics').value = sample.metrics;
    el('noFakeMetrics').checked = sample.noFakeMetrics;
    lang = sample.locale || 'vi';
    el('lang').value = lang;
    applyLanguage();
    scheduleAutosave();
    updatePreview();
  }

  function clearAll() {
    el('title').value = '';
    el('role').value = '';
    el('summary').value = '';
    el('tests').value = '';
    el('limitations').value = '';
    el('verifiedFacts').value = '';
    el('unverifiedClaims').value = '';
    el('metrics').value = '';
    el('noFakeMetrics').checked = false;
    evidence = [];
    selected.clear();
    try { localStorage.removeItem(C.STORAGE_KEY); } catch (_) {}
    renderLedger();
    el('autosaveStatus').textContent = t('autosaveCleared');
    updatePreview();
  }

  function collectProject() {
    const value = validateForm();
    return value;
  }

  function exportMarkdown() {
    const project = collectProject();
    if (!project) return;
    const md = C.generateNarrative(project, lang);
    download('evidence-story.md', md, 'text/markdown;charset=utf-8');
    el('formStatus').textContent = t('exportedMd');
  }

  function exportJson() {
    const project = collectProject();
    if (!project) return;
    const json = C.serializeExport(project);
    download('evidence-story.json', json, 'application/json;charset=utf-8');
    el('formStatus').textContent = t('exportedJson');
  }

  function download(filename, content, type) {
    const url = URL.createObjectURL(new Blob([content], { type }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function scheduleAutosave() {
    if (autosaveTimer) clearTimeout(autosaveTimer);
    autosaveTimer = setTimeout(() => {
      try {
        const data = readForm();
        localStorage.setItem(C.STORAGE_KEY, JSON.stringify(data));
        el('autosaveStatus').textContent = t('autosaveSaved');
      } catch (_) {
        el('autosaveStatus').textContent = t('autosaveReady');
      }
    }, 400);
  }

  function restoreAutosave() {
    try {
      const raw = localStorage.getItem(C.STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      if (!data || typeof data !== 'object') return;
      el('title').value = data.title || '';
      el('audience').value = data.audience || el('audience').value;
      el('role').value = data.role || '';
      el('summary').value = data.summary || '';
      evidence = Array.isArray(data.evidence) ? data.evidence.map(item => ({
        id: item.id || 'ev-' + Math.random().toString(36).slice(2, 9),
        url: item.url || '',
        label: item.label || '',
        kind: item.kind || 'other',
        verified: !!item.verified,
        notes: item.notes || '',
        provenance: item.provenance || (item.verified ? C.PROVENANCE.verifiedUrl : C.PROVENANCE.userAttested)
      })) : [];
      el('tests').value = data.tests || '';
      el('limitations').value = data.limitations || '';
      el('verifiedFacts').value = Array.isArray(data.verifiedFacts) ? data.verifiedFacts.join('\n') : (data.verifiedFacts || '');
      el('unverifiedClaims').value = Array.isArray(data.unverifiedClaims) ? data.unverifiedClaims.join('\n') : (data.unverifiedClaims || '');
      el('metrics').value = data.metrics || '';
      el('noFakeMetrics').checked = !!data.noFakeMetrics;
      if (data.locale === 'en') { lang = 'en'; el('lang').value = 'en'; }
      renderLedger();
      updatePreview();
      el('autosaveStatus').textContent = t('autosaveSaved');
    } catch (_) {
      // ignore corrupt autosave
    }
  }

  // sort headers
  document.querySelectorAll('.sort-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.sort;
      if (sortKey === key) sortDir = sortDir === 'asc' ? 'desc' : 'asc';
      else { sortKey = key; sortDir = 'asc'; }
      renderLedger();
    });
  });

  el('lang').addEventListener('change', e => {
    lang = e.target.value === 'en' ? 'en' : 'vi';
    applyLanguage();
    updatePreview();
  });

  el('addEvidence').addEventListener('click', addEvidence);
  el('clearEvidence').addEventListener('click', removeSelected);
  el('sampleBtn').addEventListener('click', loadSample);
  el('clearAll').addEventListener('click', clearAll);
  el('validateBtn').addEventListener('click', () => { validateForm(); updatePreview(); });
  el('exportMd').addEventListener('click', exportMarkdown);
  el('exportJson').addEventListener('click', exportJson);

  // autosave on input
  ['title','audience','role','summary','tests','limitations','verifiedFacts','unverifiedClaims','metrics','noFakeMetrics'].forEach(id => {
    const node = el(id);
    if (node) node.addEventListener('input', () => { scheduleAutosave(); updatePreview(); });
  });
  // ev form not autosaved until added

  // init
  renderAudienceOptions();
  renderKindOptions();
  restoreAutosave();
  applyLanguage();
  updatePreview();
})();

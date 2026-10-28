(function (root) {
  'use strict';

  const STORAGE_KEY = 'evidence-story-builder:v1';
  const MAX_ITEMS = 20;
  const LIMITS = Object.freeze({
    title: 120,
    audience: 80,
    role: 80,
    summary: 500,
    label: 120,
    url: 2048,
    notes: 500,
    tests: 4000,
    limitations: 4000,
    fact: 500,
    claim: 500,
    metrics: 1000
  });

  const AUDIENCES = Object.freeze([
    'Recruiters / hiring managers',
    'Open source community',
    'Judges / reviewers',
    'Customers / users',
    'Students / learners',
    'Internal team'
  ]);

  const EVIDENCE_KINDS = Object.freeze([
    'repository',
    'live-demo',
    'test-report',
    'documentation',
    'video',
    'issue-or-pr',
    'other'
  ]);

  const PROVENANCE = Object.freeze({
    verifiedUrl: 'verified-url',
    userAttested: 'user-attested',
    sample: 'built-in-sample',
    unverified: 'unverified-claim'
  });

  function fail(message) { throw new Error(message); }

  function isPlainObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }

  function cleanText(value, key, required, min) {
    if (value === undefined || value === null) value = '';
    if (typeof value !== 'string') fail(key + ': expected text.');
    const trimmed = value.trim();
    if (!trimmed) {
      if (required) fail(key + ': required.');
      return '';
    }
    if (trimmed.length < (min || 1)) fail(key + ': too short.');
    if (trimmed.length > LIMITS[key]) fail(key + ': too long (max ' + LIMITS[key] + ').');
    if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f-\u009f]/u.test(trimmed)) fail(key + ': control characters are not allowed.');
    return trimmed;
  }

  function normalizeLines(value, key) {
    if (value === undefined || value === null) return [];
    if (Array.isArray(value)) {
      return value.map((item, index) => {
        if (typeof item !== 'string') fail(key + '[' + index + ']: expected text.');
        return item.trim();
      }).filter(Boolean);
    }
    if (typeof value === 'string') {
      return value.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
    }
    fail(key + ': expected text or list.');
  }

  function normalizeUrl(value) {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    if (!trimmed || trimmed.length > LIMITS.url) return null;
    let url;
    try { url = new URL(trimmed); } catch (_) { return null; }
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
    if (!url.hostname) return null;
    if (url.username || url.password) return null;
    return url.toString();
  }

  function cleanEvidenceItem(raw, index) {
    if (!isPlainObject(raw)) fail('evidence[' + index + ']: expected an object.');
    const known = ['id', 'url', 'label', 'kind', 'verified', 'notes', 'provenance'];
    for (const key of Object.keys(raw)) {
      if (!known.includes(key)) fail('evidence[' + index + ']: unknown field "' + key + '".');
    }
    const url = normalizeUrl(raw.url);
    if (!url) fail('evidence[' + index + '].url: invalid http(s) URL.');
    const label = cleanText(raw.label, 'label', true, 2);
    const kind = raw.kind === undefined || raw.kind === null || raw.kind === ''
      ? 'other'
      : (EVIDENCE_KINDS.includes(raw.kind) ? raw.kind : fail('evidence[' + index + '].kind: unknown kind.'));
    const verified = raw.verified === true;
    const notes = cleanText(raw.notes, 'notes', false, 1);
    const id = (typeof raw.id === 'string' && raw.id.trim()) ? raw.id.trim().slice(0, 64) : ('ev-' + (index + 1));
    const provenance = verified ? PROVENANCE.verifiedUrl : PROVENANCE.userAttested;
    return { id, url, label, kind, verified, notes, provenance };
  }

  function validateProject(raw) {
    if (!isPlainObject(raw)) fail('project: expected an object.');

    const title = cleanText(raw.title, 'title', true, 3);
    const audience = cleanText(raw.audience, 'audience', true, 2);
    const role = cleanText(raw.role, 'role', true, 2);
    const summary = cleanText(raw.summary, 'summary', false, 1);

    const evidenceRaw = raw.evidence;
    if (!Array.isArray(evidenceRaw) || evidenceRaw.length === 0) fail('evidence: at least one item is required.');
    if (evidenceRaw.length > MAX_ITEMS) fail('evidence: maximum ' + MAX_ITEMS + ' items.');
    const evidence = evidenceRaw.map((item, index) => cleanEvidenceItem(item, index));

    const urls = evidence.map(item => item.url);
    if (new Set(urls).size !== urls.length) fail('evidence: duplicate URLs are not allowed.');

    const tests = cleanText(raw.tests, 'tests', true, 10);
    const limitations = cleanText(raw.limitations, 'limitations', true, 20);
    const verifiedFacts = normalizeLines(raw.verifiedFacts, 'verifiedFacts');
    const unverifiedClaims = normalizeLines(raw.unverifiedClaims, 'unverifiedClaims');

    for (const fact of verifiedFacts) {
      if (fact.length > LIMITS.fact) fail('verifiedFacts: item too long.');
    }
    for (const claim of unverifiedClaims) {
      if (claim.length > LIMITS.claim) fail('unverifiedClaims: item too long.');
    }

    const metrics = cleanText(raw.metrics, 'metrics', false, 1);
    const noFakeMetrics = raw.noFakeMetrics === true;
    if (metrics && !noFakeMetrics) fail('metrics: confirm that no metric is fabricated before including numbers.');

    const locale = raw.locale === 'en' ? 'en' : 'vi';

    const warnings = [];
    if (metrics && /\d/.test(metrics)) warnings.push('metrics-contain-numbers');
    if (verifiedFacts.length === 0) warnings.push('no-verified-facts');
    if (unverifiedClaims.length === 0) warnings.push('no-unverified-claims-listed');
    if (!evidence.some(item => item.verified)) warnings.push('no-verified-evidence');

    return {
      title,
      audience,
      role,
      summary,
      evidence,
      tests,
      limitations,
      verifiedFacts,
      unverifiedClaims,
      metrics,
      noFakeMetrics,
      locale,
      warnings,
      generatedAt: new Date().toISOString()
    };
  }

  function normalizeProject(input) {
    try {
      const value = validateProject(input);
      return { valid: true, errors: {}, value, warnings: value.warnings || [] };
    } catch (error) {
      return { valid: false, errors: { form: error.message }, value: null, warnings: [] };
    }
  }

  function sortEvidence(items, key, direction) {
    if (!Array.isArray(items)) fail('items: expected array.');
    const allowed = ['label', 'url', 'kind', 'verified', 'notes', 'provenance'];
    if (!allowed.includes(key)) fail('sort key: unknown.');
    const dir = direction === 'desc' ? -1 : 1;
    return items.slice().sort((a, b) => {
      const av = a[key];
      const bv = b[key];
      if (typeof av === 'boolean' || typeof bv === 'boolean') {
        return ((av === true ? 1 : 0) - (bv === true ? 1 : 0)) * dir;
      }
      return String(av || '').localeCompare(String(bv || ''), undefined, { sensitivity: 'base' }) * dir;
    });
  }

  function provenanceLabel(item, lang) {
    const vi = {
      'verified-url': 'URL đã kiểm chứng',
      'user-attested': 'Tự khai báo',
      'built-in-sample': 'Dữ liệu mẫu',
      'unverified-claim': 'Chưa kiểm chứng'
    };
    const en = {
      'verified-url': 'Verified URL',
      'user-attested': 'User-attested',
      'built-in-sample': 'Built-in sample',
      'unverified-claim': 'Unverified claim'
    };
    const map = lang === 'en' ? en : vi;
    const key = (item && item.provenance) || 'user-attested';
    return map[key] || key;
  }

  function generateNarrative(project, lang) {
    const p = validateProject(project);
    const L = lang === 'en' ? 'en' : (p.locale || 'vi');
    const vi = L === 'vi';
    const title = p.title;
    const lines = [];
    lines.push('# ' + title);
    lines.push('');
    lines.push(vi
      ? '> Bản nháp bằng chứng — tự khai báo, không có xác minh độc lập.'
      : '> Evidence draft — user-attested, not independently verified.');
    lines.push('');
    lines.push(vi ? '## 1. Bối cảnh và vai trò' : '## 1. Context and role');
    lines.push('');
    lines.push((vi ? '- Đối tượng: ' : '- Audience: ') + p.audience);
    lines.push((vi ? '- Vai trò của tôi: ' : '- My role: ') + p.role);
    if (p.summary) lines.push((vi ? '- Tóm tắt: ' : '- Summary: ') + p.summary);
    lines.push('');

    lines.push(vi ? '## 2. Sự thật đã kiểm chứng' : '## 2. Verified facts');
    lines.push('');
    if (p.verifiedFacts.length) {
      p.verifiedFacts.forEach(fact => lines.push('- ' + fact));
    } else {
      lines.push(vi ? '- (Chưa liệt kê sự thật đã kiểm chứng.)' : '- (No verified facts listed yet.)');
    }
    lines.push('');

    lines.push(vi ? '## 3. Bảng bằng chứng (Evidence ledger)' : '## 3. Evidence ledger');
    lines.push('');
    lines.push('| # | ' + (vi ? 'Nhãn' : 'Label') + ' | ' + (vi ? 'Loại' : 'Type') + ' | ' + (vi ? 'URL' : 'URL') + ' | ' + (vi ? 'Kiểm chứng' : 'Verified') + ' |');
    lines.push('|---|---|---|---|---|');
    p.evidence.forEach((item, index) => {
      lines.push('| ' + (index + 1) + ' | ' + item.label.replace(/\|/g, '\\|') + ' | ' + item.kind + ' | ' + item.url + ' | ' + (item.verified ? (vi ? 'Có' : 'Yes') : (vi ? 'Tự khai' : 'Self-attested')) + ' |');
    });
    lines.push('');

    lines.push(vi ? '## 4. Kiểm thử thực sự đã chạy' : '## 4. Tests actually run');
    lines.push('');
    lines.push(p.tests);
    lines.push('');

    lines.push(vi ? '## 5. Giới hạn và rủi ro' : '## 5. Limitations and risks');
    lines.push('');
    lines.push(p.limitations);
    lines.push('');

    if (p.unverifiedClaims.length) {
      lines.push(vi ? '## 6. Tuyên bố chưa kiểm chứng' : '## 6. Unverified claims');
      lines.push('');
      p.unverifiedClaims.forEach(claim => lines.push('- ' + claim + ' *(unverified)*'));
      lines.push('');
    }

    if (p.metrics) {
      lines.push(vi ? '## 7. Số liệu (tự khai, chưa kiểm chứng)' : '## 7. Metrics (self-reported, unverified)');
      lines.push('');
      lines.push(p.metrics);
      lines.push('');
    }

    lines.push(vi ? '## 8. Nhãn provenance' : '## 8. Provenance labels');
    lines.push('');
    lines.push(vi
      ? '- URL trong ledger là liên kết công khai; tính xác thực phụ thuộc vào bên lưu trữ.'
      : '- Ledger URLs are public links; their authenticity depends on the hosting party.');
    lines.push(vi
      ? '- Các số liệu và kết quả kiểm thử là tự khai báo; công cụ này không chạy lại chúng.'
      : '- Metrics and test results are self-reported; this tool does not rerun them.');
    lines.push(vi
      ? '- Không có chữ ký số, xác minh độc lập hay chứng nhận chính thức.'
      : '- No cryptographic signature, independent verification, or official certification.');
    lines.push('');
    lines.push('---');
    lines.push(vi
      ? '_Tạo bằng Evidence-to-Story Portfolio Builder · dữ liệu lưu cục bộ, không tải lên._'
      : '_Generated by Evidence-to-Story Portfolio Builder · data stored locally, no upload._');
    return lines.join('\n');
  }

  function serializeExport(project) {
    const p = validateProject(project);
    const safe = JSON.stringify(p, null, 2).replace(/[<>&\u2028\u2029]/g, char =>
      '\\u' + char.charCodeAt(0).toString(16).padStart(4, '0'));
    return safe + '\n';
  }

  function sampleProject() {
    return {
      title: 'Evidence Story Builder — portfolio draft',
      audience: 'Recruiters / hiring managers',
      role: 'Solo builder and maintainer',
      summary: 'A client-side tool that separates verified evidence from self-reported claims.',
      evidence: [
        { url: 'https://github.com/example/evidence-story-builder', label: 'Source repository', kind: 'repository', verified: true, notes: 'Public source and tests.' },
        { url: 'https://example.com/demo/evidence-story-builder', label: 'Live demo', kind: 'live-demo', verified: false, notes: 'Deployed URL to be verified independently.' }
      ],
      tests: 'node --test (unit + schema validation)\nManual responsive check at 390px and 1440px',
      limitations: 'No independent verification; metrics are self-reported; demo URL not yet deployed.',
      verifiedFacts: [
        'Source code and tests are available in the linked repository.',
        'All processing happens in the browser; no data is uploaded.'
      ],
      unverifiedClaims: [
        'The demo URL is publicly reachable.',
        'Test counts are accurate as reported.'
      ],
      metrics: '',
      noFakeMetrics: true,
      locale: 'vi'
    };
  }

  const api = Object.freeze({
    STORAGE_KEY,
    MAX_ITEMS,
    LIMITS,
    AUDIENCES,
    EVIDENCE_KINDS,
    PROVENANCE,
    validateProject,
    normalizeProject,
    createProject: validateProject,
    sortEvidence,
    provenanceLabel,
    generateNarrative,
    generateMarkdown: generateNarrative,
    draftNarrative: generateNarrative,
    serializeExport,
    exportJson: serializeExport,
    sampleProject,
    sampleData: sampleProject,
    normalizeUrl
  });

  if (typeof module === 'object' && module.exports) module.exports = api;
  root.EvidenceCore = api;
  if (typeof window !== 'undefined') window.EvidenceCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);

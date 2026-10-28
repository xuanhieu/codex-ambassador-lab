'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const C = require('../core.js');

const validProject = () => ({
  title: 'Evidence Story Builder',
  audience: 'Recruiters / hiring managers',
  role: 'Solo builder',
  summary: 'Client-side narrative draft.',
  evidence: [
    { url: 'https://github.com/example/repo', label: 'Source repo', kind: 'repository', verified: true, notes: 'Tests included.' }
  ],
  tests: 'node --test\nmanual responsive check',
  limitations: 'No independent verification; metrics self-reported.',
  verifiedFacts: ['Source code is public.'],
  unverifiedClaims: ['Demo URL is reachable.'],
  metrics: '',
  noFakeMetrics: true,
  locale: 'vi'
});

test('validates a complete project without mutation', () => {
  const input = validProject();
  const snapshot = JSON.stringify(input);
  const result = C.validateProject(input);
  assert.equal(result.title, 'Evidence Story Builder');
  assert.equal(result.evidence.length, 1);
  assert.equal(JSON.stringify(input), snapshot);
  assert.ok(Array.isArray(result.warnings));
});

test('rejects missing title', () => {
  const p = validProject(); p.title = '';
  assert.throws(() => C.validateProject(p));
});

test('rejects short limitations', () => {
  const p = validProject(); p.limitations = 'short';
  assert.throws(() => C.validateProject(p));
});

test('rejects invalid evidence URL', () => {
  const p = validProject(); p.evidence[0].url = 'not-a-url';
  assert.throws(() => C.validateProject(p));
});

test('rejects non-http URL schemes', () => {
  const p = validProject(); p.evidence[0].url = 'ftp://example.com/x';
  assert.throws(() => C.validateProject(p));
});

test('rejects duplicate evidence URLs', () => {
  const p = validProject();
  p.evidence.push({ url: 'https://github.com/example/repo', label: 'Dup', kind: 'repository', verified: false });
  assert.throws(() => C.validateProject(p));
});

test('rejects metrics without noFakeMetrics confirmation', () => {
  const p = validProject(); p.metrics = '1000 users'; p.noFakeMetrics = false;
  assert.throws(() => C.validateProject(p));
});

test('accepts metrics when confirmed', () => {
  const p = validProject(); p.metrics = '1000 users (self-reported)'; p.noFakeMetrics = true;
  const r = C.validateProject(p);
  assert.equal(r.metrics, '1000 users (self-reported)');
  assert.ok(r.warnings.includes('metrics-contain-numbers'));
});

test('normalizeProject returns structured result', () => {
  const ok = C.normalizeProject(validProject());
  assert.equal(ok.valid, true);
  assert.ok(ok.value);
  assert.deepEqual(ok.errors, {});
  const bad = C.normalizeProject({ title: '' });
  assert.equal(bad.valid, false);
  assert.ok(bad.errors.form);
});

test('sorts evidence by label ascending and descending', () => {
  const items = [
    { label: 'Zeta', url: 'https://z.example', kind: 'other', verified: false, provenance: 'user-attested' },
    { label: 'Alpha', url: 'https://a.example', kind: 'other', verified: true, provenance: 'verified-url' }
  ];
  const asc = C.sortEvidence(items, 'label', 'asc');
  assert.equal(asc[0].label, 'Alpha');
  const desc = C.sortEvidence(items, 'label', 'desc');
  assert.equal(desc[0].label, 'Zeta');
  assert.equal(items[0].label, 'Zeta'); // original unchanged
});

test('sorts evidence by verified boolean', () => {
  const items = [
    { label: 'A', verified: false, provenance: 'user-attested' },
    { label: 'B', verified: true, provenance: 'verified-url' }
  ];
  const sorted = C.sortEvidence(items, 'verified', 'asc');
  assert.equal(sorted[0].verified, false);
});

test('rejects unknown sort key', () => {
  assert.throws(() => C.sortEvidence([], 'foo', 'asc'));
});

test('provenance labels are bilingual', () => {
  const item = { provenance: 'verified-url' };
  assert.equal(C.provenanceLabel(item, 'vi'), 'URL đã kiểm chứng');
  assert.equal(C.provenanceLabel(item, 'en'), 'Verified URL');
});

test('generates narrative in Vietnamese with sections', () => {
  const md = C.generateNarrative(validProject(), 'vi');
  assert.match(md, /^# Evidence Story Builder/);
  assert.match(md, /## 2\. Sự thật đã kiểm chứng/);
  assert.match(md, /## 3\. Bảng bằng chứng/);
  assert.match(md, /https:\/\/github.com\/example\/repo/);
  assert.match(md, /## 4\. Kiểm thử thực sự đã chạy/);
  assert.match(md, /## 5\. Giới hạn và rủi ro/);
});

test('generates narrative in English', () => {
  const md = C.generateNarrative(validProject(), 'en');
  assert.match(md, /## 2\. Verified facts/);
  assert.match(md, /## 3\. Evidence ledger/);
  assert.match(md, /## 4\. Tests actually run/);
});

test('narrative separates unverified claims', () => {
  const md = C.generateNarrative(validProject(), 'vi');
  assert.match(md, /Tuyên bố chưa kiểm chứng/);
  assert.match(md, /Demo URL is reachable\.\s*\*\(unverified\)\*/);
});

test('serializes export safely and round-trips', () => {
  const json = C.serializeExport(validProject());
  assert.ok(!/[<>&]/.test(json));
  const parsed = JSON.parse(json);
  assert.equal(parsed.title, 'Evidence Story Builder');
  assert.equal(parsed.evidence[0].url, 'https://github.com/example/repo');
});

test('sample project validates', () => {
  const sample = C.sampleProject();
  const validated = C.validateProject(sample);
  assert.equal(validated.evidence.length, 2);
  assert.equal(validated.noFakeMetrics, true);
});

test('sampleData alias works', () => {
  assert.deepEqual(C.sampleData(), C.sampleProject());
});

test('normalizeUrl handles valid and invalid', () => {
  assert.equal(C.normalizeUrl('https://example.com/a'), 'https://example.com/a');
  assert.equal(C.normalizeUrl('javascript:alert(1)'), null);
  assert.equal(C.normalizeUrl('ftp://example.com'), null);
});

test('rejects unknown evidence fields', () => {
  const p = validProject();
  p.evidence[0].extra = true;
  assert.throws(() => C.validateProject(p));
});

test('rejects control characters in text', () => {
  const p = validProject(); p.title = 'Bad\u0000Title';
  assert.throws(() => C.validateProject(p));
});

test('evidence max items enforced', () => {
  const p = validProject();
  p.evidence = Array.from({ length: C.MAX_ITEMS + 1 }, (_, i) => ({
    url: 'https://example.com/' + i,
    label: 'Item ' + i,
    kind: 'other',
    verified: false
  }));
  assert.throws(() => C.validateProject(p));
});

test('verified evidence sets provenance to verified-url', () => {
  const r = C.validateProject(validProject());
  assert.equal(r.evidence[0].provenance, C.PROVENANCE.verifiedUrl);
});

test('unverified evidence sets provenance to user-attested', () => {
  const p = validProject(); p.evidence[0].verified = false;
  const r = C.validateProject(p);
  assert.equal(r.evidence[0].provenance, C.PROVENANCE.userAttested);
});

test('export escapes script delimiters', () => {
  const p = validProject();
  p.title = '</script><img src=x onerror=alert(1)>';
  const json = C.serializeExport(p);
  assert.ok(!/[<>&]/.test(json));
  assert.equal(JSON.parse(json).title, p.title);
});

// DOM-ish smoke: core only
test('storage key is stable', () => {
  assert.equal(C.STORAGE_KEY, 'evidence-story-builder:v1');
});

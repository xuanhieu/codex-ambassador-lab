'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const C = require('../core.js');
const fixture = () => ({ artifactLabel: 'Offline artifact', suiteName: 'Arithmetic', total: 3, passed: 3, failed: 0, inputProof: { inputDescription: '2 and 3', procedure: 'Run the arithmetic suite', environment: 'Node local' } });
const bytes = value => new TextEncoder().encode(JSON.stringify(value));
const metadata = () => ({ source: 'local-file', filename: 'evidence.json', byteLength: 222, digest: 'ab'.repeat(32), generatedAt: '2026-10-26T12:00:00.000Z' });
const reject = mutate => { const value = fixture(); mutate(value); assert.throws(() => C.validateReport(value)); };
test('accepts exact schema without mutating input', () => { const value = fixture(); const snapshot = JSON.stringify(value); assert.deepEqual(C.validateReport(value), value); assert.equal(JSON.stringify(value), snapshot); assert.notEqual(C.validateReport(value).inputProof, value.inputProof); });
test('parses local UTF-8 JSON with case-insensitive extension', () => assert.deepEqual(C.parseEvidence(bytes(fixture()), 'evidence.JSON'), fixture()));
test('requires evidence bytes', () => { assert.throws(() => C.parseEvidence(new Uint8Array(), 'a.json')); assert.throws(() => C.parseEvidence(null, 'a.json')); });
test('rejects above 1 MiB', () => assert.throws(() => C.parseEvidence(new Uint8Array(C.MAX_BYTES + 1), 'a.json')));
test('accepts exact 1 MiB boundary', () => { const source = bytes(fixture()); const padded = new Uint8Array(C.MAX_BYTES).fill(32); padded.set(source); assert.deepEqual(C.parseEvidence(padded, 'a.json'), fixture()); });
test('rejects malformed JSON and invalid UTF-8', () => { assert.throws(() => C.parseEvidence(new Uint8Array([123]), 'a.json')); assert.throws(() => C.parseEvidence(new Uint8Array([255]), 'a.json')); });
test('rejects extensions, paths, controls, and long names', () => { for (const name of ['x.txt', 'x.json.html', '../x.json', 'x\\a.json', 'x\n.json', 'a'.repeat(129) + '.json', '.json']) assert.throws(() => C.parseEvidence(bytes(fixture()), name)); });
test('rejects unknown root fields including prototype keys', () => { reject(v => { v.extra = true; }); assert.throws(() => C.parseEvidence(bytes(JSON.parse('{"__proto__":{},"artifactLabel":"a"}')), 'a.json')); });
test('rejects missing root fields', () => reject(v => { delete v.artifactLabel; }));
test('rejects non-object roots', () => { for (const value of [null, [], 'test', 1]) assert.throws(() => C.validateReport(value)); });
test('rejects empty and whitespace-only suite', () => { for (const suite of ['', '   ']) reject(v => { v.suiteName = suite; }); });
test('enforces text types and maximum lengths', () => { for (const key of ['artifactLabel', 'suiteName']) { reject(v => { v[key] = 1; }); reject(v => { v[key] = 'a'.repeat(C.LIMITS[key] + 1); }); const v = fixture(); v[key] = 'a'.repeat(C.LIMITS[key]); assert.doesNotThrow(() => C.validateReport(v)); } });
test('requires complete input proof and rejects unknown proof fields', () => { reject(v => { delete v.inputProof; }); reject(v => { v.inputProof = []; }); reject(v => { v.inputProof.extra = 'x'; }); reject(v => { delete v.inputProof.environment; }); });
test('enforces every proof string length and type', () => { for (const key of Object.keys(fixture().inputProof)) { for (const bad of ['', ' ', null, 1, 'a'.repeat(C.LIMITS[key] + 1)]) reject(v => { v.inputProof[key] = bad; }); const v = fixture(); v.inputProof[key] = 'a'.repeat(C.LIMITS[key]); assert.doesNotThrow(() => C.validateReport(v)); } });
test('rejects control characters in text', () => reject(v => { v.artifactLabel = 'x\u0000y'; }));
test('rejects NaN, Infinity, strings, fractions, negative and unsafe counts', () => { for (const key of ['total', 'passed', 'failed']) for (const value of [NaN, Infinity, '3', 0.5, -1, Number.MAX_SAFE_INTEGER + 1, 1000001, null, true]) reject(v => { v[key] = value; }); });
test('rejects zero and inconsistent totals', () => { reject(v => { v.total = 0; v.passed = 0; }); reject(v => { v.failed = 1; }); });
test('reported failures never get passing receipt status', () => { const v = fixture(); v.passed = 2; v.failed = 1; assert.equal(C.makeReceipt(v, metadata()).status, 'failed'); const meta = metadata(); meta.digest = null; assert.equal(C.makeReceipt(v, meta).status, 'failed'); });
test('passing receipt always carries user attestation and explicit limits', () => { const r = C.makeReceipt(fixture(), metadata()); assert.equal(r.status, 'self-reported-pass'); assert.equal(r.attestation, 'User-attested / Tự khai báo'); for (const key of ['independentVerification', 'officialCertification', 'cryptographicallySigned']) assert.equal(r[key], false); assert.equal(r.limits.length, 4); });
test('unavailable hashing has explicit nulls and distinct status', () => { const m = metadata(); m.digest = null; const r = C.makeReceipt(fixture(), m); assert.equal(r.status, 'passed-digest-unavailable'); assert.equal(r.evidence.sha256, null); assert.equal(r.evidence.hashAlgorithm, null); });
test('rejects malformed digest, time, metadata sizes and source', () => { for (const [key, value] of [['digest', 'fake'], ['digest', undefined], ['generatedAt', 'tomorrow'], ['generatedAt', '2026-02-30T12:00:00.000Z'], ['byteLength', 0], ['byteLength', C.MAX_BYTES + 1], ['filename', '../x.json'], ['source', 'independently-verified']]) { const m = metadata(); m[key] = value; assert.throws(() => C.makeReceipt(fixture(), m)); } });
test('source distinguishes built-in sample from imported file', () => { const m = metadata(); m.source = 'built-in-sample'; assert.equal(C.makeReceipt(fixture(), m).evidence.source, 'built-in-sample'); });
test('metadata cannot override security claims', () => { const m = { ...metadata(), independentVerification: true, status: 'official', attestation: 'signed' }; const r = C.makeReceipt(fixture(), m); assert.equal(r.independentVerification, false); assert.equal(r.status, 'self-reported-pass'); });
test('JSON export escapes HTML and script delimiters without changing content', () => { const v = fixture(); v.artifactLabel = '</script><img src=x onerror=alert(1)>&'; const r = C.makeReceipt(v, metadata()); const output = C.serializeReceipt(r); assert.ok(!/[<>&]/.test(output)); assert.deepEqual(JSON.parse(output), r); });
test('formula-looking data stays quoted inside JSON; no CSV output', () => { const v = fixture(); v.artifactLabel = '=HYPERLINK("https://invalid")'; const output = C.serializeReceipt(C.makeReceipt(v, metadata())); assert.equal(JSON.parse(output).report.artifactLabel, v.artifactLabel); assert.ok(output.startsWith('{')); });
test('digest traceability distinguishes whitespace in actual evidence bytes', () => { const a = bytes(fixture()); const b = new TextEncoder().encode(JSON.stringify(fixture(), null, 2)); const hash = x => createHash('sha256').update(x).digest('hex'); assert.deepEqual(C.parseEvidence(a, 'a.json'), C.parseEvidence(b, 'a.json')); assert.notEqual(hash(a), hash(b)); const r = C.makeReceipt(C.parseEvidence(a, 'a.json'), { ...metadata(), byteLength: a.length, digest: hash(a) }); assert.equal(r.evidence.sha256, hash(a)); assert.equal(r.evidence.byteLength, a.length); });

// This DOM harness checks application state transitions, not browser rendering.
const vm = require('node:vm');
const fs = require('node:fs');
function harness(crypto = require('node:crypto').webcrypto) {
  class Element {
    constructor() { this.textContent = ''; this.hidden = false; this.disabled = false; this.value = ''; this.children = []; this.listeners = {}; }
    addEventListener(name, fn) { this.listeners[name] = fn; }
    append(...nodes) { this.children.push(...nodes); }
    replaceChildren() { this.children = []; }
    click() {}
    remove() {}
  }
  const elements = new Map();
  const get = id => { if (!elements.has(id)) elements.set(id, new Element()); return elements.get(id); };
  let blob;
  const document = { getElementById: get, documentElement: { lang: 'vi' }, querySelectorAll: () => [], createElement: () => new Element(), body: new Element() };
  const context = vm.createContext({ window: { ReceiptCore: C, crypto }, document, Uint8Array, TextEncoder, Date, Blob, URL: { createObjectURL(value) { blob = value; return 'blob:local-test'; }, revokeObjectURL() {} }, setTimeout: fn => { fn(); } });
  vm.runInContext(fs.readFileSync(require.resolve('../app.js'), 'utf8'), context);
  const settle = async () => { for (let i = 0; i < 6; i++) await new Promise(resolve => setImmediate(resolve)); };
  const load = async (data, name = 'evidence.json') => {
    const content = data instanceof Uint8Array ? data : bytes(data);
    get('evidence').listeners.change({ target: { files: [{ name, size: content.length, arrayBuffer: async () => content.buffer.slice(content.byteOffset, content.byteOffset + content.byteLength) }] } });
    await settle();
  };
  const exported = async () => { get('export').listeners.click(); return JSON.parse(await blob.text()); };
  return { get, load, settle, exported, document };
}
test('app hashes exact loaded bytes with native SubtleCrypto and exports provenance', async () => {
  const app = harness();
  const data = new TextEncoder().encode(JSON.stringify(fixture(), null, 2) + '\n');
  await app.load(data);
  const receipt = await app.exported();
  assert.equal(receipt.evidence.sha256, createHash('sha256').update(data).digest('hex'));
  assert.equal(receipt.evidence.byteLength, data.length);
  assert.equal(receipt.evidence.source, 'local-file');
  assert.equal(app.get('export').disabled, false);
});
test('app clears old passing receipt and disables export on invalid file', async () => {
  const app = harness(); await app.load(fixture()); await app.load(new Uint8Array([123]));
  assert.equal(app.get('export').disabled, true); assert.equal(app.get('result').hidden, true); assert.ok(app.get('error').textContent.length > 0);
});
test('app sample is marked as sample, including its exact digest', async () => {
  const app = harness(); app.get('sample').listeners.click(); await app.settle();
  const receipt = await app.exported(); assert.equal(receipt.evidence.source, 'built-in-sample'); assert.equal(receipt.evidence.filename, 'n078-sample.json'); assert.match(receipt.evidence.sha256, /^[a-f0-9]{64}$/);
});
test('app handles absent and failing SubtleCrypto without a green badge', async () => {
  for (const crypto of [null, { subtle: { digest: async () => { throw new Error('unavailable'); } } }]) {
    const app = harness(crypto); await app.load(fixture()); const receipt = await app.exported(); assert.equal(receipt.evidence.sha256, null); assert.equal(app.get('badge').className, 'badge pending');
  }
});
test('app renders reported failures with failed status', async () => {
  const app = harness(); const value = fixture(); value.passed = 1; value.failed = 2; await app.load(value);
  assert.equal(app.get('badge').className, 'badge failed'); assert.equal((await app.exported()).status, 'failed');
});
test('app rejects huge file before reading and clears receipt on no selection', async () => {
  const app = harness(); let read = false;
  app.get('evidence').listeners.change({ target: { files: [{ name: 'huge.json', size: C.MAX_BYTES + 1, arrayBuffer: async () => { read = true; } }] } });
  await app.settle(); assert.equal(read, false); assert.equal(app.get('export').disabled, true);
  await app.load(fixture()); app.get('evidence').listeners.change({ target: { files: [] } }); await app.settle(); assert.equal(app.get('export').disabled, true);
});
test('app ignores a stale read completing after a newer selection', async () => {
  const app = harness(); let finish;
  const content = bytes(fixture());
  app.get('evidence').listeners.change({ target: { files: [{ name: 'old.json', size: content.length, arrayBuffer: () => new Promise(resolve => { finish = resolve; }) }] } });
  const newer = fixture(); newer.artifactLabel = 'Newer selection'; await app.load(newer);
  finish(content.buffer); await app.settle(); assert.equal(app.get('artifact').textContent, 'Newer selection');
});
test('app defaults to Vietnamese and switches to English without changing receipt', async () => {
  const app = harness(); assert.equal(app.document.documentElement.lang, 'vi'); await app.load(fixture());
  app.get('language').listeners.change({ target: { value: 'en' } }); assert.equal(app.document.documentElement.lang, 'en'); assert.equal(app.get('badge').textContent, 'PASS · Self-reported result'); assert.equal((await app.exported()).attestation, 'User-attested / Tự khai báo');
});

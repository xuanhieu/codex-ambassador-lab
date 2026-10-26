(function (root) {
  'use strict';
  const MAX_BYTES = 1048576;
  const LIMITS = Object.freeze({ artifactLabel: 160, suiteName: 160, inputDescription: 1000, procedure: 2000, environment: 500 });
  function fail(message) { throw new Error(message); }
  function object(value, keys, label) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) fail(label + ': expected an object.');
    const own = Object.keys(value);
    if (own.length !== keys.length || own.some(key => !keys.includes(key))) fail(label + ': missing or unknown fields.');
  }
  function string(value, key) {
    if (typeof value !== 'string' || !value.trim() || value.length > LIMITS[key] || /[\u0000-\u001f\u007f-\u009f]/u.test(value)) fail(key + ': invalid text or length.');
    return value;
  }
  function validateReport(value) {
    object(value, ['artifactLabel', 'suiteName', 'total', 'passed', 'failed', 'inputProof'], 'report');
    const artifactLabel = string(value.artifactLabel, 'artifactLabel');
    const suiteName = string(value.suiteName, 'suiteName');
    for (const key of ['total', 'passed', 'failed']) {
      if (!Number.isSafeInteger(value[key]) || value[key] < 0 || value[key] > 1000000) fail(key + ': expected integer 0–1000000.');
    }
    if (!value.total || value.passed + value.failed !== value.total) fail('Counts must sum to a positive total.');
    object(value.inputProof, ['inputDescription', 'procedure', 'environment'], 'inputProof');
    const inputProof = {};
    for (const key of ['inputDescription', 'procedure', 'environment']) inputProof[key] = string(value.inputProof[key], key);
    return { artifactLabel, suiteName, total: value.total, passed: value.passed, failed: value.failed, inputProof };
  }
  function parseEvidence(bytes, filename) {
    if (typeof filename !== 'string' || filename.length > 128 || !/^[^/\\\u0000-\u001f\u007f-\u009f]+\.json$/iu.test(filename)) fail('Choose a .json filename of at most 128 characters.');
    if (!(bytes instanceof Uint8Array) || !bytes.byteLength || bytes.byteLength > MAX_BYTES) fail('Evidence must contain 1–1048576 bytes.');
    let value;
    try { value = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes)); }
    catch (_) { fail('Evidence must be valid UTF-8 JSON.'); }
    return validateReport(value);
  }
  function makeReceipt(report, metadata) {
    const clean = validateReport(report);
    if (!metadata || !['local-file', 'built-in-sample'].includes(metadata.source)) fail('Invalid evidence source.');
    if (typeof metadata.filename !== 'string' || metadata.filename.length > 128 || !/^[^/\\\u0000-\u001f\u007f-\u009f]+\.json$/iu.test(metadata.filename)) fail('Invalid filename.');
    if (!Number.isSafeInteger(metadata.byteLength) || metadata.byteLength < 1 || metadata.byteLength > MAX_BYTES) fail('Invalid evidence size.');
    if (metadata.digest !== null && (typeof metadata.digest !== 'string' || !/^[a-f0-9]{64}$/.test(metadata.digest))) fail('Invalid SHA-256 digest.');
    if (typeof metadata.generatedAt !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(metadata.generatedAt) || !Number.isFinite(Date.parse(metadata.generatedAt)) || new Date(metadata.generatedAt).toISOString() !== metadata.generatedAt) fail('Invalid timestamp.');
    return { schema: 'n078-user-attested-receipt/v1', attestation: 'User-attested / Tự khai báo', independentVerification: false, officialCertification: false, cryptographicallySigned: false, status: clean.failed ? 'failed' : metadata.digest === null ? 'passed-digest-unavailable' : 'self-reported-pass', evidence: { source: metadata.source, filename: metadata.filename, byteLength: metadata.byteLength, hashAlgorithm: metadata.digest === null ? null : 'SHA-256', sha256: metadata.digest }, generatedAt: metadata.generatedAt, report: clean, limits: ['Counts and input proof are supplied by the user; tests were not executed by this tool.', 'A digest identifies evidence bytes, not their truth, author, or reproducibility.', 'Timestamp uses the local device clock and is not independently trusted.', 'No independent verification, official certification, or cryptographic signature.'] };
  }
  function serializeReceipt(receipt) {
    return JSON.stringify(receipt, null, 2).replace(/[<>&\u2028\u2029]/g, char => '\\u' + char.charCodeAt(0).toString(16).padStart(4, '0')) + '\n';
  }
  const api = Object.freeze({ MAX_BYTES, LIMITS, validateReport, parseEvidence, makeReceipt, serializeReceipt });
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.ReceiptCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);

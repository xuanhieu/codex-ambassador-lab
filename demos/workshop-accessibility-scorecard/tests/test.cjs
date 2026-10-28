const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const app = require('../app.js');
const root = path.join(__dirname, '..');

test('module exports the expected scorecard API', () => {
  assert.equal(typeof app.computeScore, 'function');
  assert.equal(typeof app.exportCsv, 'function');
  assert.equal(typeof app.exportMarkdown, 'function');
  assert.equal(typeof app.sampleAnswers, 'function');
  assert.equal(typeof app.normalizeAnswer, 'function');
  assert.equal(Array.isArray(app.CATEGORIES), true);
  assert.equal(Array.isArray(app.ITEMS), true);
});

test('weights are positive integers and total exactly 100', () => {
  assert.equal(app.TOTAL_WEIGHT, 100);
  assert.equal(app.ITEMS.reduce((sum, item) => sum + item.weight, 0), 100);
  for (const item of app.ITEMS) {
    assert.equal(Number.isInteger(item.weight), true);
    assert.ok(item.weight > 0);
  }
});

test('item ids are unique and all categories are represented', () => {
  const ids = app.ITEMS.map((item) => item.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const category of app.CATEGORIES) {
    assert.ok(app.ITEMS.some((item) => item.category === category.id));
  }
});

test('normalizeAnswer maps common values to yes, no, or unknown', () => {
  assert.equal(app.normalizeAnswer('yes'), 'yes');
  assert.equal(app.normalizeAnswer('YES'), 'yes');
  assert.equal(app.normalizeAnswer(true), 'yes');
  assert.equal(app.normalizeAnswer('no'), 'no');
  assert.equal(app.normalizeAnswer(false), 'no');
  assert.equal(app.normalizeAnswer('unknown'), 'unknown');
  assert.equal(app.normalizeAnswer('not sure'), 'unknown');
  assert.equal(app.normalizeAnswer(undefined), 'unknown');
});

test('all unknown answers produce no score and zero coverage of known points', () => {
  const result = app.computeScore({}, 'en');
  assert.equal(result.scorePercent, null);
  assert.equal(result.knownWeight, 0);
  assert.equal(result.coveragePercent, 0);
  assert.equal(result.unknownWeight, 100);
  assert.ok(result.explanation.length > 0);
});

test('sample data produces a bounded score and full item coverage in exports', () => {
  const result = app.computeScore(app.sampleAnswers(), 'vi');
  assert.ok(result.scorePercent >= 0 && result.scorePercent <= 100);
  assert.ok(result.coveragePercent > 0);
  assert.equal(result.items.length, app.ITEMS.length);
  const csv = app.exportCsv(result);
  const markdown = app.exportMarkdown(result);
  assert.match(csv, /Category|Nhóm/);
  assert.match(csv, /venue-step-free|Lối vào/);
  assert.match(markdown, /# /);
  assert.match(markdown, /Prioritized actions|Việc cần làm/);
});

test('scoring is deterministic for identical answers', () => {
  const answers = app.sampleAnswers();
  const first = app.computeScore(answers, 'en');
  const second = app.computeScore(answers, 'en');
  assert.deepEqual(first, second);
});

test('gaps are sorted by descending weight', () => {
  const result = app.computeScore(app.sampleAnswers(), 'en');
  for (let i = 1; i < result.gaps.length; i += 1) {
    assert.ok(result.gaps[i - 1].weight >= result.gaps[i].weight);
  }
});

test('category scores use only their own items', () => {
  const result = app.computeScore(app.sampleAnswers(), 'en');
  for (const category of result.categories) {
    const items = result.items.filter((item) => item.category === category.id);
    const total = items.reduce((sum, item) => sum + item.weight, 0);
    assert.equal(category.totalWeight, total);
  }
});

test('CSV and Markdown include every checklist item label', () => {
  const result = app.computeScore(app.sampleAnswers(), 'vi');
  const csv = app.exportCsv(result);
  const markdown = app.exportMarkdown(result);
  for (const item of result.items) {
    assert.ok(csv.includes(item.label), `CSV missing ${item.label}`);
    assert.ok(markdown.includes(item.label), `Markdown missing ${item.label}`);
  }
});

test('language switching changes labels but not numeric score', () => {
  const answers = app.sampleAnswers();
  const vi = app.computeScore(answers, 'vi');
  const en = app.computeScore(answers, 'en');
  assert.equal(vi.scorePercent, en.scorePercent);
  assert.equal(vi.coveragePercent, en.coveragePercent);
  assert.notEqual(vi.items[0].label, en.items[0].label);
});

test('app creates real form controls', () => {
  const js = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  assert.match(js, /input\.type = 'radio'/);
  assert.match(js, /doc\.createElement\('fieldset'\)/);
  assert.match(html, /<select/);
  assert.match(html, /<button/);
  assert.match(html, /<textarea/);
  assert.match(html, /skip-link/);
});

test('responsive CSS includes a mobile breakpoint', () => {
  const css = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');
  assert.match(css, /@media\s*\(\s*max-width/);
  assert.match(css, /prefers-reduced-motion/);
});

test('documentation states the non-certification and local-only limits', () => {
  const readme = fs.readFileSync(path.join(root, 'README.md'), 'utf8');
  assert.match(readme, /WCAG/i);
  assert.match(readme, /local/i);
  assert.match(readme, /node --test/);
});

test('no fabricated WCAG conformance claim appears in the app', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const js = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
  assert.doesNotMatch(html + js, /WCAG 2\.[0-9]\s*(AA|AAA)|certified|conformance level/i);
});

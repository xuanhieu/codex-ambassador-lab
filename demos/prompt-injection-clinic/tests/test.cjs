const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const C = require(path.join(root, "app.js"));

test("exports four scenarios", () => {
  assert.equal(C.SCENARIOS.length, 4);
});

test("scenarios are bilingual", () => {
  for (const s of C.SCENARIOS) {
    assert.ok(s.title.vi && s.title.en);
    assert.ok(s.document.vi && s.document.en);
    assert.ok(s.explanation.vi && s.explanation.en);
  }
});

test("decisions and checks exist", () => {
  assert.ok(C.DECISIONS.length >= 4);
  assert.ok(C.CHECKS.length >= 8);
});

test("S1 expects sanitize", () => {
  const r = C.evaluate({ scenarioId: "S1", decision: "sanitize", checks: { untrusted_source: true, no_instruction_override: true, output_sanitized: true } });
  assert.equal(r.status, "CORRECT");
  assert.equal(r.correct, true);
});

test("S2 block is correct", () => {
  const r = C.evaluate({ scenarioId: "S2", decision: "block", checks: { untrusted_source: true, no_data_exfiltration: true, human_review: true } });
  assert.equal(r.status, "CORRECT");
});

test("S3 block is correct", () => {
  const r = C.evaluate({ scenarioId: "S3", decision: "block", checks: { secret_not_output: true, no_instruction_override: true } });
  assert.equal(r.status, "CORRECT");
});

test("S4 escalate is correct", () => {
  const r = C.evaluate({ scenarioId: "S4", decision: "escalate", checks: { tool_scope_verified: true, human_review: true, rollback_plan: true } });
  assert.equal(r.status, "CORRECT");
});

test("unsafe allow on high-risk scenario", () => {
  const r = C.evaluate({ scenarioId: "S1", decision: "allow", checks: { untrusted_source: true, no_instruction_override: true, output_sanitized: true } });
  assert.equal(r.status, "UNSAFE_ALLOW");
  assert.equal(r.correct, false);
});

test("wrong non-allow decision is incorrect", () => {
  const r = C.evaluate({ scenarioId: "S2", decision: "sanitize", checks: { untrusted_source: true, no_data_exfiltration: true, human_review: true } });
  assert.equal(r.status, "INCORRECT");
});
test("allow on high-risk scenario is unsafe allow", () => {
  const r = C.evaluate({ scenarioId: "S2", decision: "allow", checks: { untrusted_source: true, no_data_exfiltration: true, human_review: true } });
  assert.equal(r.status, "UNSAFE_ALLOW");
});

test("missing checks incomplete", () => {
  const r = C.evaluate({ scenarioId: "S1", decision: "sanitize", checks: { untrusted_source: true } });
  assert.equal(r.status, "REVIEW_INCOMPLETE");
  assert.ok(r.missing.includes("no_instruction_override"));
});

test("invalid scenario input", () => {
  const r = C.evaluate({ scenarioId: "NOPE", decision: "block", checks: {} });
  assert.equal(r.status, "INVALID_INPUT");
});

test("invalid decision input", () => {
  const r = C.evaluate({ scenarioId: "S1", decision: "maybe", checks: {} });
  assert.equal(r.status, "INVALID_INPUT");
});

test("validateScenarioId", () => {
  assert.equal(C.validateScenarioId("S1").ok, true);
  assert.equal(C.validateScenarioId("X").ok, false);
});

test("validateDecision", () => {
  assert.equal(C.validateDecision("block").ok, true);
  assert.equal(C.validateDecision("nope").ok, false);
});

test("validateChecks rejects unknown", () => {
  const r = C.validateChecks({ foo: true }, "S1");
  assert.equal(r.ok, false);
});

test("validateChecks rejects non-boolean", () => {
  const r = C.validateChecks({ untrusted_source: "yes" }, "S1");
  assert.equal(r.ok, false);
});

test("createReplayEntry shape", () => {
  const r = C.evaluate({ scenarioId: "S1", decision: "sanitize", checks: { untrusted_source: true, no_instruction_override: true, output_sanitized: true } });
  const e = C.createReplayEntry(r, { lang: "en" });
  assert.equal(e.scenarioId, "S1");
  assert.equal(e.decision, "sanitize");
  assert.equal(e.status, "CORRECT");
  assert.equal(e.lang, "en");
});

test("formatReplay", () => {
  const lines = C.formatReplay([{ scenarioId: "S1", decision: "block", status: "INCORRECT", at: "x" }]);
  assert.equal(lines.length, 1);
  assert.ok(lines[0].line.includes("S1"));
});

test("scoreSummary", () => {
  const s = C.scoreSummary([{ correct: true }, { correct: false }, { correct: true }]);
  assert.equal(s.total, 3);
  assert.equal(s.correct, 2);
  assert.equal(s.rate, 67);
});

test("human outcome present", () => {
  const r = C.evaluate({ scenarioId: "S4", decision: "escalate", checks: { tool_scope_verified: true, human_review: true, rollback_plan: true } });
  assert.ok(r.humanOutcome.vi && r.humanOutcome.en);
});

test("disclaimer present", () => {
  const r = C.evaluate({ scenarioId: "S1", decision: "sanitize", checks: {} });
  assert.ok(r.disclaimer.vi && r.disclaimer.en);
});

test("app.js has no network calls", () => {
  const src = fs.readFileSync(path.join(root, "app.js"), "utf8");
  assert.ok(!/fetch\s*\(|XMLHttpRequest|sendBeacon|WebSocket|navigator\.send/.test(src));
});

test("index.html has CSP connect-src none", () => {
  const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
  assert.ok(html.includes("connect-src 'none'"));
});

test("getScenario returns null for bad id", () => {
  assert.equal(C.getScenario("ZZZ"), null);
});

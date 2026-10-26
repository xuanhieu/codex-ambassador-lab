'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const C = require('../core.js');
const record = () => C.scenario('filter','en');
test('three synthetic scenarios validate in both languages', () => {
  assert.equal(C.scenarioIds.length,3);
  for(const id of C.scenarioIds) for(const lang of ['vi','en']) assert.equal(C.validate(C.scenario(id,lang),lang).ok,true);
});
test('six stages total twenty minutes with contiguous boundaries', () => {
  const p = C.generate(record(),'en').plan;
  assert.deepEqual(p.stages.map(s=>s.minutes),[3,4,3,5,3,2]);
  assert.equal(p.stages.reduce((n,s)=>n+s.minutes,0),20);
  assert.deepEqual(p.stages.map(s=>[s.start,s.end]),[[0,3],[3,7],[7,10],[10,15],[15,18],[18,20]]);
});
test('two exercises for each audience with deliverables and allocated stages', () => {
  const p=C.generate(record(),'en').plan;
  for(const role of ['noncoder','developer']) assert.equal(p.exercises.filter(e=>e.audience===role).length,2);
  for(const e of p.exercises) { assert.ok(e.task.length>30); assert.ok(e.deliverable.length>20); assert.ok([3,5].includes(e.stage)); }
});
test('selected audience is prioritized without losing other exercises', () => {
  const r=record(); r.audience='developer'; const p=C.generate(r,'en').plan;
  assert.equal(p.exercises[0].audience,'developer'); assert.equal(p.exercises.length,4);
});
test('generation is deterministic and does not mutate input', () => {
  const r=record(), before=JSON.stringify(r); assert.deepEqual(C.generate(r,'en'),C.generate(r,'en')); assert.equal(JSON.stringify(r),before);
});
test('synthetic opt-in must be boolean true', () => {
  for(const synthetic of [false,'true',1,undefined]) assert.ok(C.generate({...record(),synthetic},'en').errors.synthetic);
});
test('malformed record and malformed field types fail gracefully', () => {
  for(const value of [null,undefined,[],42,'issue']) assert.equal(C.generate(value).ok,false);
  for(const value of [null,{},[],42]) assert.ok(C.validate({...record(),title:value}).errors.title);
});
test('all required text fields reject blank and tag-only input', () => {
  for(const key of Object.keys(C.LIMITS)) for(const value of [' ','<b></b>']) assert.ok(C.validate({...record(),[key]:value}).errors[key]);
});
test('strict length validation occurs before sanitization', () => {
  for(const [key,max] of Object.entries(C.LIMITS)) assert.ok(C.validate({...record(),[key]:'<b>'+ 'x'.repeat(max)+'</b>'}).errors[key]);
  assert.equal(C.validate({...record(),title:'x'.repeat(120)}).ok,true);
});
test('URLs, active schemes and markdown links rejected in every field', () => {
  for(const key of Object.keys(C.LIMITS)) for(const value of ['https://example.com','javascript:alert(1)','data:text/html,test','www.example.com','example.org','example.xyz','192.0.2.1','//server/path','[link](relative)']) assert.ok(C.validate({...record(),[key]:value},'en').errors[key]);
});
test('markdown, HTML and control characters become plain text', () => {
  assert.equal(C.sanitize('**Hello** <b>world</b> `text`\u0000'), 'Hello world text');
  assert.equal(C.sanitize('[Label](target)'), 'Label');
  const p=C.generate({...record(),title:'<img src=x onerror=alert(1)>**Sample**'},'en').plan;
  assert.equal(p.issue.title,'Sample'); assert.ok(!C.exportJSON(p).includes('<img'));
});
test('reproduction needs two to six bounded steps', () => {
  for(const steps of ['one','a\nb','abc\n'+'x'.repeat(201),Array(7).fill('step').join('\n')]) assert.ok(C.validate({...record(),steps}).errors.steps);
  assert.equal(C.validate({...record(),steps:'Step one\r\n\nStep two'}).ok,true);
});
test('invalid complexity and audience rejected', () => {
  for(const key of ['complexity','audience']) assert.ok(C.validate({...record(),[key]:'other'}).errors[key]);
});
test('high complexity receives bounded scope guidance', () => {
  assert.match(C.generate(C.scenario('focus','en'),'en').plan.scopeGuidance,/one small branch/);
});
test('exports contain complete issue, safety flags, timing and exercises', () => {
  const p=C.generate(record(),'en').plan, exported=JSON.parse(C.exportJSON(p));
  assert.deepEqual(exported,p); assert.equal(exported.schemaVersion,1); assert.equal(exported.simulationOnly,true); assert.equal(exported.synthetic,true);
  assert.equal(exported.issue.steps.length,3); assert.equal(exported.totalMinutes,20);
  const text=C.worksheet(p); for(const value of [p.issue.title,p.issue.scope,p.issue.expected,p.issue.actual,'WORKSHOP WORKSHEET','No GitHub',...p.exercises.map(e=>e.title),...p.stages.map(s=>s.title)]) assert.ok(text.includes(value));
});
test('bilingual content and validation are localized', () => {
  const vi=C.generate(C.scenario('count','vi'),'vi').plan, en=C.generate(C.scenario('count','en'),'en').plan;
  assert.equal(vi.stages[0].title,'Giới thiệu'); assert.equal(en.stages[0].title,'Introduction');
  assert.match(C.worksheet(vi),/PHIẾU WORKSHOP/); assert.match(C.worksheet(en),/WORKSHOP WORKSHEET/);
  assert.notEqual(C.validate({},'vi').errors.title,C.validate({},'en').errors.title);
  assert.notEqual(vi.exercises[0].task,en.exercises[0].task);
});
test('unknown scenario and unsupported locale are handled safely', () => {
  assert.equal(C.scenario('unknown','en'),null); assert.equal(C.generate(record(),'xx').plan.locale,'vi');
});

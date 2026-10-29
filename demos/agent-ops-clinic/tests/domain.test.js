import test from 'node:test';
import assert from 'node:assert/strict';
import { SCENARIOS, STAGES, createSession, dispatch, estimateCents, budgetOK, blockers, canPublish, replaySession, exportSession, resetSession, ClinicError } from '../domain.js';
import { messages } from '../i18n.js';
const NOW = '2026-10-23T10:00:00.000Z';
const make = id => createSession(id, NOW);
const act = (s, type, taskId, data = {}) => dispatch(s, { type, taskId, data }, NOW);
const throws = (fn, code) => assert.throws(fn, e => e instanceof ClinicError && e.code === code);
function reviewed(s, id) {
  const t = s.tasks.find(t => t.id === id);
  for (const risk of t.risks) s = act(s, 'resolve_risk', id, { risk, decision: risk === 'outbound' ? 'approved' : 'remediated', confirmed: true });
  return act(s, 'approve_review', id, { confirmed: true });
}

test('all scenarios have bilingual realistic briefs, distinct IDs and three sample statuses', () => {
  assert.equal(SCENARIOS.length, 3);
  for (const s of SCENARIOS) {
    const state = make(s.id);
    assert.equal(state.tasks.length, 3);
    assert.equal(new Set(state.tasks.map(t => t.id)).size, 3);
    assert.ok(state.tasks.some(t => t.stage === 'review'));
    for (const t of state.tasks) for (const language of ['en', 'vi']) {
      assert.ok(t.title[language].length > 5);
      assert.ok(t.brief[language].length > 20);
      assert.ok(t.acceptance[language].length > 20);
    }
  }
});
test('unknown scenarios are rejected', () => throws(() => make('missing'), 'invalid_scenario'));
test('new session is deterministic and discloses preloaded examples', () => {
  assert.deepEqual(make('launch'), make('launch'));
  assert.equal(make('launch').events[0].type, 'session_started');
});
test('sequential lifecycle covers all five stages without implicit approval', () => {
  let s = make('launch'); const id = 'launch-page';
  for (const expected of STAGES.slice(1,4)) { s = act(s,'advance',id); assert.equal(s.tasks[0].stage, expected); }
  assert.equal(s.tasks[0].reviewApproved, false);
  throws(() => act(s,'advance',id), 'publish_blocked');
  s = reviewed(s,id); s = act(s,'advance',id);
  assert.equal(s.tasks[0].stage, 'publish');
  throws(() => act(s,'advance',id), 'invalid_transition');
});
test('command cannot force a direct stage skip through payload', () => {
  const s = act(make('launch'),'advance','launch-page',{ stage: 'publish' });
  assert.equal(s.tasks[0].stage, 'plan');
});
test('publish blocked for review without human approval', () => {
  const s = make('launch'); assert.ok(blockers(s,'launch-invite').includes('needs_human_review'));
  throws(() => act(s,'advance','launch-invite'), 'publish_blocked');
});
test('review approval cannot be recorded outside Review', () => throws(() => act(make('launch'),'approve_review','launch-page',{confirmed:true}), 'needs_review_stage'));
test('human approval requires literal explicit confirmation', () => {
  let s = make('launch'); s = act(s,'resolve_risk','launch-invite',{ risk:'outbound',decision:'approved',confirmed:true });
  for (const confirmed of [false, undefined, 'true', 1]) throws(() => act(s,'approve_review','launch-invite',{confirmed}), 'explicit_approval_required');
});
test('unresolved risks block human approval', () => throws(() => act(make('launch'),'approve_review','launch-invite',{confirmed:true}), 'unresolved_risks'));
for (const [scenarioId,id,risk] of [['launch','launch-page','secrets'],['community','community-roster','pii'],['creator','creator-post','outbound']]) {
  test(`${risk} requires the correct human decision and confirmation`, () => {
    let s = make(scenarioId);
    while (s.tasks.find(t=>t.id===id).stage !== 'review') s = act(s,'advance',id);
    const decision = risk === 'outbound' ? 'approved' : 'remediated';
    throws(() => act(s,'resolve_risk',id,{risk,decision}), 'explicit_approval_required');
    throws(() => act(s,'resolve_risk',id,{risk,decision: risk === 'outbound' ? 'remediated' : 'approved',confirmed:true}), 'explicit_approval_required');
    s = act(s,'resolve_risk',id,{risk,decision,confirmed:true});
    assert.equal(s.tasks.find(t=>t.id===id).decisions[risk],decision);
    assert.equal(canPublish(s,id),false);
  });
}
test('risk decisions cannot be made on unknown risk or outside Review', () => {
  throws(() => act(make('launch'),'resolve_risk','launch-invite',{risk:'pii',decision:'remediated',confirmed:true}), 'invalid_risk');
  throws(() => act(make('launch'),'resolve_risk','launch-page',{risk:'secrets',decision:'remediated',confirmed:true}), 'needs_review_stage');
});
test('approval cannot bypass unresolved secrets or PII', () => {
  for (const [scenario,id] of [['launch','launch-page'],['community','community-roster']]) {
    let s = make(scenario); while(s.tasks.find(t=>t.id===id).stage!=='review') s=act(s,'advance',id);
    throws(()=>act(s,'approve_review',id,{confirmed:true}),'unresolved_risks');
  }
});
test('duplicate risk decisions and approvals are rejected', () => {
  let s = reviewed(make('launch'),'launch-invite');
  throws(()=>act(s,'approve_review','launch-invite',{confirmed:true}),'already_approved');
  throws(()=>act(s,'resolve_risk','launch-invite',{risk:'outbound',decision:'approved',confirmed:true}),'already_resolved');
});
test('requesting changes clears every risk decision and human approval', () => {
  let s = reviewed(make('launch'),'launch-invite'); s = act(s,'request_changes','launch-invite');
  const t = s.tasks.find(t=>t.id==='launch-invite');
  assert.equal(t.stage,'build'); assert.equal(t.reviewApproved,false); assert.equal(t.decisions.outbound,'open');
  s=act(s,'advance',t.id); assert.equal(canPublish(s,t.id),false);
});
test('revision unavailable outside Review and after publishing', () => {
  throws(()=>act(make('launch'),'request_changes','launch-page'),'needs_review_stage');
  const s=act(reviewed(make('launch'),'launch-invite'),'advance','launch-invite');
  throws(()=>act(s,'request_changes','launch-invite'),'needs_review_stage');
});
test('budget sums the entire scenario, including released tasks', () => {
  let s = make('launch'); assert.equal(estimateCents(s),2600);
  s=act(reviewed(s,'launch-invite'),'advance','launch-invite'); assert.equal(estimateCents(s),2600);
});
test('budget boundary passes exactly at cap and fails one cent below', () => {
  let s=reviewed(make('launch'),'launch-invite');
  s=act(s,'set_budget',undefined,{cents:2600}); assert.equal(budgetOK(s),true); assert.equal(canPublish(s,'launch-invite'),true);
  s=act(s,'set_budget',undefined,{cents:2599}); assert.equal(budgetOK(s),false); assert.ok(blockers(s,'launch-invite').includes('over_budget'));
  throws(()=>act(s,'advance','launch-invite'),'publish_blocked');
});
test('community starts over budget to expose a realistic constraint', () => assert.equal(budgetOK(make('community')),false));
test('zero budget is valid but blocks release; large, negative and fractional budgets rejected', () => {
  assert.equal(act(make('launch'),'set_budget',undefined,{cents:0}).maxSpendCents,0);
  for(const cents of [-1,1.5,NaN,Infinity,100001,'2600',null]) throws(()=>act(make('launch'),'set_budget',undefined,{cents}),'invalid_budget');
});
test('lowering cap after human approval blocks publish without fabricating revocation', () => {
  let s=reviewed(make('launch'),'launch-invite'); s=act(s,'set_budget',undefined,{cents:100});
  assert.equal(s.tasks[2].reviewApproved,true); assert.equal(canPublish(s,'launch-invite'),false);
});
test('editing an Intake brief saves only the selected language', () => {
  const s=make('launch'), before=s.tasks[0].brief.vi;
  const next=act(s,'save_brief','launch-page',{lang:'en',brief:'Create a local demo without collecting contact details.',acceptance:'The page supports keyboard use and has no live submission.'});
  assert.equal(next.tasks[0].brief.vi,before); assert.notEqual(next.tasks[0].brief.en,s.tasks[0].brief.en);
});
test('brief bounds and language are validated', () => {
  const data={lang:'en',brief:'A'.repeat(20),acceptance:'B'.repeat(20)};
  for(const patch of [{brief:'short'},{acceptance:' '.repeat(30)},{brief:'x'.repeat(2001)},{lang:'fr'}]) throws(()=>act(make('launch'),'save_brief','launch-page',{...data,...patch}),'invalid_brief');
});
test('brief becomes immutable after Intake', () => throws(()=>act(make('launch'),'save_brief','launch-invite',{lang:'en',brief:'A'.repeat(30),acceptance:'B'.repeat(30)}),'brief_locked'));
test('immutable dispatch preserves source state and earlier audit payloads', () => {
  const s=make('launch'), snapshot=structuredClone(s); const data={cents:2500};
  const next=act(s,'set_budget',undefined,data); data.cents=0;
  assert.deepEqual(s,snapshot); assert.equal(next.events[1].data.cents,2500);
});
test('all risk, revision, budget and release events replay deterministically', () => {
  let s=make('launch'); s=reviewed(s,'launch-invite'); s=act(s,'request_changes','launch-invite'); s=act(s,'advance','launch-invite');
  s=act(s,'set_budget',undefined,{cents:2600}); s=reviewed(s,'launch-invite'); s=act(s,'advance','launch-invite');
  assert.deepEqual(replaySession(JSON.parse(JSON.stringify(exportSession(s)))),s);
  assert.deepEqual(s.events.map(e=>e.id),s.events.map((_,i)=>i+1));
});
test('replay rejects malformed version, sequence, timestamp and illegal approval', () => {
  const valid=exportSession(make('launch'));
  for(const patch of [{version:2},{events:[]},{events:[{...valid.events[0],id:9}]},{events:[{...valid.events[0],at:'bad'}]}]) throws(()=>replaySession({...valid,...patch}),'invalid_record');
  const bad={...valid,events:[...valid.events,{id:2,at:NOW,type:'approve_review',taskId:'launch-invite',data:{confirmed:true}}]};
  throws(()=>replaySession(bad),'unresolved_risks');
});
test('reset restores seeded tasks and cap, discarding decisions and prior events', () => {
  let s=reviewed(make('creator'),'creator-post'); s=act(s,'set_budget',undefined,{cents:100});
  assert.deepEqual(resetSession(s,NOW),make('creator'));
});
test('selected task decisions do not approve other tasks', () => {
  const s=reviewed(make('launch'),'launch-invite'); assert.equal(s.tasks[0].reviewApproved,false); assert.equal(s.tasks[0].decisions.secrets,'open');
});
test('unknown commands and tasks are rejected', () => {
  throws(()=>act(make('launch'),'teleport','launch-page'),'invalid_command');
  throws(()=>act(make('launch'),'advance','missing'),'invalid_task');
  assert.deepEqual(blockers(make('launch'),'missing'),['invalid_task']);
});
test('bilingual primary UI has matching translation keys and exercises', () => {
  assert.deepEqual(Object.keys(messages.en).sort(),Object.keys(messages.vi).sort());
  assert.deepEqual(Object.keys(messages.en.events).sort(),Object.keys(messages.vi.events).sort());
  for(const lang of ['en','vi']) { assert.equal(messages[lang].lessonSteps.filter(s=>s.check).length,3); assert.equal(messages[lang].lessonSteps.length,5); }
});
test('release audit snapshot preserves estimate, cap and human decisions', () => {
  let s=reviewed(make('launch'),'launch-invite');
  s=act(s,'advance','launch-invite');
  const release=s.events.at(-1);
  assert.equal(release.data.from,'review'); assert.equal(release.data.to,'publish');
  assert.deepEqual(release.data.release,{estimateCents:2600,capCents:3000,reviewApproved:true,decisions:{outbound:'approved'}});
  s=act(s,'set_budget',undefined,{cents:100});
  assert.equal(s.events.find(e=>e.id===release.id).data.release.capCents,3000);
  assert.deepEqual(replaySession(exportSession(s)),s);
});
test('replay rejects missing timestamps after session start', () => {
  const record=exportSession(act(make('launch'),'advance','launch-page'));
  delete record.events[1].at;
  throws(()=>replaySession(record),'invalid_record');
});
test('recorded advance destinations cannot spoof lifecycle or release snapshot', () => {
  const record=exportSession(act(make('launch'),'advance','launch-page'));
  record.events[1].data={from:'review',to:'publish',release:{reviewApproved:true,capCents:99999}};
  const restored=replaySession(record);
  assert.equal(restored.tasks[0].stage,'plan');
  assert.deepEqual(restored.events[1].data,{from:'intake',to:'plan'});
});
test('event limit bounds persisted history without silently discarding decisions', () => {
  const s=make('launch'); s.events=Array.from({length:5000},()=>s.events[0]);
  throws(()=>act(s,'set_budget',undefined,{cents:100}),'event_limit');
  const record=exportSession(s); record.events.push(record.events[0]);
  throws(()=>replaySession(record),'invalid_record');
});

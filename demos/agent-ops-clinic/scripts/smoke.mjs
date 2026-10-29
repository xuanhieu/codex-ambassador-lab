// Dependency-free integration smoke test. No server or browser required.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { SCENARIOS, createSession, dispatch, canPublish, estimateCents, exportSession, replaySession, resetSession } from '../domain.js';
const root = new URL('../', import.meta.url);
const html = await readFile(new URL('index.html', root), 'utf8');
for (const path of ['./app.js','./styles.css','./favicon.svg']) {
  assert.ok(html.includes(path), `HTML references ${path}`);
  assert.ok((await readFile(new URL(path,root))).length > 0);
}
const app = await readFile(new URL('app.js',root),'utf8');
assert.ok(app.includes('localStorage')); assert.ok(app.includes('URL.createObjectURL'));
for (const scenario of SCENARIOS) {
  let s = createSession(scenario.id);
  const task = s.tasks.find(t=>t.stage==='review');
  assert.equal(canPublish(s,task.id),false);
  const run = (type,data={}) => { s=dispatch(s,{type,taskId:task.id,data}); };
  for(const risk of task.risks) run('resolve_risk',{risk,decision:risk==='outbound'?'approved':'remediated',confirmed:true});
  run('approve_review',{confirmed:true}); run('set_budget',{cents:100});
  assert.equal(canPublish(s,task.id),false);
  run('set_budget',{cents:estimateCents(s)}); assert.equal(canPublish(s,task.id),true);
  run('advance'); assert.equal(s.tasks.find(t=>t.id===task.id).stage,'publish');
  assert.deepEqual(replaySession(JSON.parse(JSON.stringify(exportSession(s)))),s);
  const clean=resetSession(s); assert.equal(clean.tasks.find(t=>t.id===task.id).reviewApproved,false);
  console.log(`PASS ${scenario.id}: risk → review → budget block → release → replay → reset`);
}
console.log(`PASS local entry assets in ${fileURLToPath(root)}; 3 complete scenario flows`);

const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const C=require('../engine.js');
const data=JSON.parse(fs.readFileSync(path.join(__dirname,'../data/codex-path.json'),'utf8'));
const base={career:'developer',level:'Zero',hours:6,goalWeeks:8,locale:'vi'};
test('data source passes schema and URL validation',()=>assert.equal(C.validateCatalog(data),true));
test('25 original Academy lessons plus 36 original every-human lessons',()=>{assert.equal(data.lessons.length,61);assert.equal(data.lessons.filter(x=>Number(x.id.slice(1))<=25).length,25)});
test('fourteen audience-focused tracks have capstones',()=>assert.equal(data.careers.length,14));
test('fourteen unique track IDs',()=>assert.equal(new Set(data.careers.map(x=>x.id)).size,14));
test('pref defaults safe for malformed data',()=>assert.deepEqual(C.normalizePrefs(null),C.defaults()));
test('pref career not arbitrary',()=>assert.equal(C.normalizePrefs({career:'../../etc'}).career,'everyday'));
test('pref uses allowed level only',()=>assert.equal(C.normalizePrefs({level:'Superhuman'}).level,'Zero'));
test('hour settings whitelist',()=>assert.equal(C.normalizePrefs({hours:9999}).hours,2));
test('deadline constrained',()=>assert.equal(C.normalizePrefs({goalWeeks:999}).goalWeeks,32));
test('locale constrained',()=>assert.equal(C.normalizePrefs({locale:'fr'}).locale,'vi'));
test('all fourteen purpose-based tracks build valid plans',()=>{
 for(const career of data.careers){
  const plan=C.buildPlan(data,{...base,career:career.id});
  assert.ok(plan.lessons.length>=5,career.id);
  assert.equal(plan.career.id,career.id);
  assert.ok(plan.weeks.length);
  assert.equal(plan.weeks.at(-1).capstone,true);
  assert.equal(plan.totalMinutes,plan.lessons.reduce((s,l)=>s+l.duration,plan.capstoneMinutes));
 }
});
test('initial state blank and local-only',()=>{
 const x=C.initialState(base);assert.equal(x.done.length,0);assert.equal(x.schema,1);assert.equal(x.capstoneConfirmed,false);
});
test('all recommended lessons are unique',()=>{
 const plan=C.buildPlan(data,base);assert.equal(plan.lessons.length,new Set(plan.lessons.map(x=>x.id)).size);
});
test('prerequisites in roadmap precede lesson',()=>{
 const plan=C.buildPlan(data,base);
 for(const l of plan.lessons)for(const id of l.prerequisites){
  assert.ok(plan.lessons.findIndex(x=>x.id===id)<plan.lessons.indexOf(l),id+' before '+l.id);
 }
});
test('weekly lesson effort stays inside learner hours',()=>{
 for(const career of data.careers){
  const plan=C.buildPlan(data,{...base,career:career.id,hours:2});
  for(const w of plan.weeks){
   const lessonMin=w.lessonIds.reduce((sum,id)=>sum+plan.lessons.find(l=>l.id===id).duration,0);
   assert.ok(lessonMin<=120);
  }
 }
});
test('pro baseline can still produce pro level content',()=>{
 const plan=C.buildPlan(data,{...base,level:'Pro'});
 assert.ok(plan.lessons.length>=3);
 assert.ok(plan.lessons.some(x=>x.level==='Pro'));
});
test('hours change estimated minimum duration',()=>{
 const slow=C.buildPlan(data,{...base,hours:2});
 const fast=C.buildPlan(data,{...base,hours:20});
 assert.ok(slow.estimatedWeeks>=fast.estimatedWeeks);
});
test('progress next returns first unlocked lesson',()=>{
 const plan=C.buildPlan(data,base);
 const state=C.initialState(base);
 const p=C.progress(plan,state);
 assert.ok(p.next&&p.percent===0);
 assert.equal(p.next.prerequisites.length,0);
});
test('completing all lessons 100 percent but no capstone',()=>{
 const plan=C.buildPlan(data,base);
 const state=C.initialState(base);state.done=plan.lessons.map(l=>l.id);
 assert.equal(C.progress(plan,state).percent,100);
 assert.equal(C.readiness(plan,state).ready,false);
});
test('capstone readiness needs link and confirmation',()=>{
 const plan=C.buildPlan(data,base);
 const state=C.initialState(base);state.done=plan.lessons.map(l=>l.id);
 state.capstoneConfirmed=true;state.artifacts.capstone='https://github.com/example/synthetic-proof';
 assert.equal(C.readiness(plan,state).ready,true);
});
test('unsafe evidence URL cannot count',()=>{
 for(const val of ['javascript:alert(1)','http://example.com','file:///etc/passwd','https://127.0.0.1/','https://evil\n.domain/']){
  assert.equal(C.safeUrl(val),false);
 }
});
test('backup import ignores arbitrary properties',()=>{
 const d=C.validateState({schema:1,prefs:base,done:['L01','UNKNOWN'],notes:{L01:'ok',UNKNOWN:'no'},
   artifacts:{L01:'https://example.com/proof',UNKNOWN:'https://example.com/evil'},extraAdmin:true},data);
 assert.ok(!Object.hasOwn(d,'extraAdmin'));assert.deepEqual(d.done,['L01']);
 assert.ok(!d.notes.UNKNOWN&&!d.artifacts.UNKNOWN);
});
test('invalid backup version rejected',()=>assert.throws(()=>C.validateState({schema:2},data)));
test('oversized note truncated',()=>{
 const d=C.validateState({schema:1,notes:{L01:'A'.repeat(1000)}},data);assert.equal(d.notes.L01.length,600);
});
test('mark complete cannot ignore prerequisite',()=>{
 const plan=C.buildPlan(data,base),state=C.initialState(base);
 const found=plan.lessons.find(l=>l.prerequisites.length);
 assert.ok(found);
 assert.equal(C.canMarkComplete(plan,state,found.id).allowed,false);
});
test('export markdown includes tickboxes and capstone',()=>{
 const plan=C.buildPlan(data,base),state=C.initialState(base);
 const text=C.markdown(plan,state);
 assert.ok(text.includes('Capstone')&&text.includes('Week')&&text.includes('[ ]'));
});

test('new state tracks practice steps',()=>assert.deepEqual(C.initialState(base).steps,{}));
test('practice step backup round-trip',()=>{const s=C.validateState({schema:1,prefs:base,steps:{L01:[0,2,1]}},data);assert.deepEqual(s.steps.L01,[0,2,1])});
test('practice step import rejects unknown and invalid values',()=>{const s=C.validateState({schema:1,steps:{L01:[0,0,-1,99,'1',1],L99:[0]}},data);assert.deepEqual(s.steps.L01,[0,1]);assert.equal(s.steps.L99,undefined)});
test('legacy schema-1 backup still works without steps',()=>{const s=C.validateState({schema:1,done:['L01']},data);assert.deepEqual(s.steps,{});assert.deepEqual(s.done,['L01'])});

test('private evidence requires descriptive practice, no GitHub URL',()=>{
 const plan=C.buildPlan(data,{career:'everyday',level:'Zero',hours:2,goalWeeks:8,locale:'vi'});
 const state=C.initialState(C.defaults());
 state.done=plan.lessons.map(x=>x.id);state.capstoneConfirmed=true;
 assert.equal(C.readiness(plan,state).ready,false);
 state.privateProof='Tôi tự làm bộ kế hoạch giả lập, kiểm tra từng bước và sửa một câu trả lời.';
 assert.equal(C.readiness(plan,state).ready,true);
 assert.equal(plan.capstoneMinutes,90);
});
test('public evidence for original developer track still requires link',()=>{
 const plan=C.buildPlan(data,{career:'developer',level:'Zero',hours:4,goalWeeks:8,locale:'vi'});
 const state=C.initialState(C.defaults());
 state.done=plan.lessons.map(x=>x.id);state.capstoneConfirmed=true;
 state.privateProof='A private statement is not a public source repository.';
 assert.equal(C.readiness(plan,state).ready,false);
 assert.equal(plan.capstoneMinutes,180);
});
test('backup retains bounded private evidence without arbitrary fields',()=>{
 const s=C.validateState({schema:1,privateProof:'X'.repeat(800),prefs:C.defaults(),admin:true},data);
 assert.equal(s.privateProof.length,500);
 assert.equal(s.admin,undefined);
});

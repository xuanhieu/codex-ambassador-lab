const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const C=require('../starter-core.js');
test('12 inclusive start personas',()=>assert.equal(C.PERSONAS.length,12));
test('all eight zero-code use cases present',()=>{
 for(const p of ['everyday','student','teacher','office','smallbiz','jobseeker','designer','community'])assert.ok(C.findPersona(p),p)
});
test('every persona has three real tasks',()=>{for(const p of C.PERSONAS){assert.equal(p.tasks.length,3);for(const task of p.tasks)assert.ok(C.findTask(task),task)}});
test('no repeated persona IDs',()=>assert.equal(new Set(C.PERSONAS.map(x=>x.id)).size,12));
test('all task titles bilingual',()=>{for(const [name,t] of Object.entries(C.TASKS))assert.ok(t.en&&t.vi&&t.inputEN&&t.inputVI,name)});
test('task samples in both languages',()=>{for(const t of Object.values(C.TASKS))assert.ok(t.sampleVI.length>=3&&t.sampleEN.length>=3)});
test('safe unknown persona returns null',()=>assert.equal(C.findPersona('../../etc'),null));
test('safe unknown task returns null',()=>assert.equal(C.findTask('password'),null));
test('prompts generated for every persona',()=>{for(const p of C.PERSONAS)for(const task of p.tasks){let t=C.prompt(p.id,task,'vi');assert.ok(t.length>170&&t.length<1300&&t.includes('GIẢ LẬP'));}});
test('English prompt explicit synthetic examples',()=>assert.match(C.prompt('student','quiz','en'),/SYNTHETIC/));
test('prompt forbids unapproved external actions',()=>assert.match(C.prompt('everyday','plan','en'),/do not send, purchase, delete, upload or deploy/));
test('reject task not offered to persona',()=>assert.throws(()=>C.prompt('student','approval')));
test('prompt never inserts secrets',()=>assert.doesNotMatch(C.prompt('office','write','vi'),/sk-proj-|ghp_|BEGIN PRIVATE KEY/));
test('sample arrays are clones, not mutable global data',()=>{
 const a=C.sample('everyday','plan','vi');a[0]='corrupt';assert.notEqual(C.sample('everyday','plan','vi')[0],'corrupt');
});
test('quiz has four questions and bilingual labels',()=>{assert.equal(C.QUESTIONS.length,4);for(const q of C.QUESTIONS)assert.equal(q.options.en.length,3)});
test('unanswered diagnostic starts safely at Zero',()=>assert.equal(C.startingLevel([null,null,null,null]),'Zero'));
test('all zero answers starts at Zero',()=>assert.equal(C.startingLevel([0,0,0,0]),'Zero'));
test('three points still Beginner',()=>assert.equal(C.startingLevel([1,1,1,0]),'Beginner'));
test('five points maps Intermediate',()=>assert.equal(C.startingLevel([2,1,1,1]),'Intermediate'));
test('seven points maps Advanced',()=>assert.equal(C.startingLevel([2,2,2,1]),'Advanced'));
test('four multiple choice answers cannot grant Pro certification',()=>assert.equal(C.startingLevel([2,2,2,2]),'Advanced'));
test('invalid digit rejected',()=>assert.equal(C.startingLevel([3,2,2,2]),'Zero'));
test('fractional answer rejected',()=>assert.equal(C.startingLevel([1.5,1,1,1]),'Zero'));
test('malformed input fails closed',()=>assert.equal(C.startingLevel('2,2,2,2'),'Zero'));
test('recommend maps person and tier, explicitly not certification',()=>{
 const p=C.recommend('student',[0,1,1,0]);assert.equal(p.persona,'student');assert.equal(p.level,'Zero');assert.equal(p.notCertification,true)
});
test('all persona IDs are valid career IDs in curriculum',()=>{
 const data=JSON.parse(fs.readFileSync(path.join(__dirname,'../data/codex-path.json')));
 for(const p of C.PERSONAS)assert.ok(data.careers.find(x=>x.id===p.id),p.id);
});
test('new non-technical roles do not need public evidence',()=>{
 const data=JSON.parse(fs.readFileSync(path.join(__dirname,'../data/codex-path.json')));
 for(const p of C.PERSONAS.slice(0,8))assert.equal(data.careers.find(x=>x.id===p.id).proofMode,'private');
});
test('no live network or model invocation in starter code',()=>{
 const src=fs.readFileSync(path.join(__dirname,'../starter-ui.js'),'utf8');
 assert.doesNotMatch(src,/\bfetch\s*\(|\bXMLHttpRequest\b|sendBeacon|WebSocket|EventSource/);
});
test('client saves only enumerated starter IDs and booleans',()=>{
 const src=fs.readFileSync(path.join(__dirname,'../starter-ui.js'),'utf8');
 assert.match(src,/persona:state\.persona,task:state\.task/);
 assert.doesNotMatch(src,/localStorage\.setItem\([^,]+,\s*.*(?:prompt|secret|apiKey)/i);
});
test('starter uses status role and keyboard details',()=>{
 const src=fs.readFileSync(path.join(__dirname,'../starter-ui.js'),'utf8');
 assert.match(src,/aria-live="polite"/);
 assert.match(src,/<details class="starter-diagnostic"/);
});

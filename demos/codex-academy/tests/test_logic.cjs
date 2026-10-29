const test = require('node:test');
const assert = require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const L=require('../logic.js');
const root=path.resolve(__dirname,'..');
const docs=JSON.parse(fs.readFileSync(path.join(root,'catalog.json'),'utf8')).sources;
const lessons=JSON.parse(fs.readFileSync(path.join(root,'lessons.json'),'utf8'));
function empty(){return {schema:1,completed:[],bookmarks:[],checks:{},quiz:{}}}
test('204 official source records',()=>assert.ok(docs.length>=200));
test('25 bilingual practical lessons',()=>assert.equal(lessons.length,25));
test('all sources are allowlisted official HTTPS URLs',()=>assert.ok(docs.every(s=>L.safeUrl(s.url))));
test('no HTTP or javascript links are trusted',()=>{for(const v of ['http://learn.chatgpt.com/docs','javascript:alert(1)','https://evil.example/','https://learn.chatgpt.com.evil.example/docs','data:text/html,hi'])assert.equal(L.safeUrl(v),false)});
test('reject credential-bearing origin URL',()=>assert.equal(L.safeUrl('https://user:pass@learn.chatgpt.com/docs'),false));
test('accept official query-selected surface',()=>assert.ok(L.safeUrl('https://learn.chatgpt.com/docs/developer-commands.md?surface=cli')));
test('reject whitespace, newline and backslash URLs',()=>{
 for(const v of ['https://learn.chatgpt.com/a b','https://learn.chatgpt.com/a\nb','https:\\\\learn.chatgpt.com/docs'])assert.equal(L.safeUrl(v),false);
});
test('accent-insensitive Vietnamese search folding',()=>assert.equal(L.fold('ĐĂNG KÝ'),L.fold('dang ky')));
test('NFC/NFD normalized equivalence',()=>assert.equal(L.fold('Việt'),L.fold('Vie\u0323t')));
test('filter docs by Codex product',()=>{
 const matches=L.filterDocs(docs,{product:'Codex'});
 assert.ok(matches.length>15&&matches.every(x=>x.product==='Codex'));
});
test('search docs by real title returns expected entry',()=>{
 const matches=L.filterDocs(docs,{q:'Codex CLI'});
 assert.ok(matches.some(x=>x.title==='Codex CLI'));
});
test('legacy filter excludes all tagged outdated docs',()=>{
 const tagged=docs.filter(x=>x.legacy);
 assert.ok(tagged.length>0);
 assert.ok(L.filterDocs(docs,{hideLegacy:true}).every(x=>!x.legacy));
});
test('topic filter only matches target categories',()=>{
 const cat='Agent Configuration';
 const out=L.filterDocs(docs,{category:cat});
 assert.ok(out.length>0&&out.every(x=>x.categories.includes(cat)));
});
test('lesson role and level filters',()=>{
 const selected=L.filterLessons(lessons,{level:'Advanced',role:'Developer'});
 assert.ok(selected.length>1&&selected.every(x=>x.level==='Advanced'&&x.audience.includes('Developer')));
});
test('five tiers each have five lessons',()=>{
 for(const level of L.TIERS)assert.equal(lessons.filter(x=>x.level===level).length,5);
});
test('completion cannot be forged without all steps and correct quiz',()=>{
 const row=lessons[0],checks=[true,true,true];
 assert.equal(L.completionReady(row,checks,row.en.quiz.answer),true);
 assert.equal(L.completionReady(row,[true,false,true],row.en.quiz.answer),false);
 assert.equal(L.completionReady(row,checks,(row.en.quiz.answer+1)%3),false);
});
test('percentage caps negative and excessive progress',()=>{
 assert.equal(L.percentage(2,4),50);
 assert.equal(L.percentage(-3,4),0);
 assert.equal(L.percentage(9,4),100);
 assert.equal(L.percentage(0,0),0);
});
test('validate empty backup',()=>assert.deepEqual(L.validateBackup(empty(),lessons,docs),empty()));
test('round trip valid completed/bookmark/checks and quiz without extra keys',()=>{
 const p=empty(),row=lessons[0];
 p.completed=[row.id];p.bookmarks=[docs[0].id];p.checks[row.id]=[true,true,false];p.quiz[row.id]=row.en.quiz.answer;
 assert.deepEqual(L.validateBackup(JSON.parse(JSON.stringify(p)),lessons,docs),p);
});
test('reject unknown import fields, including dangerous HTML',()=>{
 const p=empty();p.html='<script>alert(1)</script>';
 assert.throws(()=>L.validateBackup(p,lessons,docs),/Unexpected/);
});
test('reject unknown IDs and repeated bookmarks',()=>{
 const p=empty();p.completed=['L999'];assert.throws(()=>L.validateBackup(p,lessons,docs));
 const b=empty();b.bookmarks=[docs[0].id,docs[0].id];assert.throws(()=>L.validateBackup(b,lessons,docs));
});
test('reject injected arbitrary quiz responses and malformed exercises',()=>{
 const p=empty();p.quiz[lessons[0].id]='0';assert.throws(()=>L.validateBackup(p,lessons,docs));
 const b=empty();b.checks[lessons[0].id]=[true,true,2];assert.throws(()=>L.validateBackup(b,lessons,docs));
});
test('all lessons have unique source URLs and valid official references',()=>{
 const allowed=new Set(docs.map(x=>x.url));
 for(const r of lessons){
  assert.ok(r.sources.length>0&&r.sources.every(x=>allowed.has(x)));
  assert.equal(new Set(r.sources).size,r.sources.length);
 }
});
test('no lesson asserts an official certificate or automatic machine execution',()=>{
 const text=JSON.stringify(lessons).toLowerCase();
 assert.ok(!text.includes('officially certified by openai'));
 assert.ok(!text.includes('automatically executes commands in your browser'));
});

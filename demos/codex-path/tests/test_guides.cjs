const test=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const ROOT=path.resolve(__dirname,"..");
const map=JSON.parse(fs.readFileSync(path.join(ROOT,"data/learning-map.json"),"utf8"));
const course=JSON.parse(fs.readFileSync(path.join(ROOT,"data/codex-path.json"),"utf8"));
const siblingCatalog=path.resolve(ROOT,"../codex-academy/catalog.json");
const catalog=JSON.parse(fs.readFileSync(fs.existsSync(siblingCatalog)?siblingCatalog:path.join(ROOT,"data/academy-index-20261024.json"),"utf8"));
const gids=new Set(map.guides.map(g=>g.id)),lessonIds=new Set(course.lessons.map(l=>l.id));
test("19 original plain-language guides",()=>assert.equal(map.guides.length,19));
test("204 authoritative catalog metadata entries indexed",()=>assert.equal(map.documents.length,204));
test("45 Codex references",()=>assert.equal(map.documents.filter(x=>x.product==="Codex").length,45));
test("158 ChatGPT references",()=>assert.equal(map.documents.filter(x=>x.product==="ChatGPT").length,158));
test("one OpenAI Platform reference",()=>assert.equal(map.documents.filter(x=>x.product==="Platform").length,1));
test("every indexed source exactly preserves original source id and URL",()=>{
 const byId=new Map(catalog.sources.map(x=>[x.id,x.url]));
 assert.equal(byId.size,map.documents.length);
 for(const doc of map.documents)assert.equal(doc.url,byId.get(doc.id),doc.id);
});
test("every URL has one primary mapped guide",()=>{for(const doc of map.documents)assert.ok(gids.has(doc.guide),doc.title)});
test("no duplicated guide IDs",()=>assert.equal(gids.size,map.guides.length));
test("all five levels have plain-language guides",()=>{
 for(const level of ["Zero","Beginner","Intermediate","Advanced","Pro"])assert.ok(map.guides.find(g=>g.tier===level));
});
test("all guide lesson links target real exercises",()=>{
 for(const guide of map.guides)for(const id of guide.lessons)assert.ok(lessonIds.has(id),id);
});
test("Vietnamese and English explanations not empty",()=>{
 for(const guide of map.guides)for(const lang of ["vi","en"])
  for(const prop of ["title","simple","analogy","example","pitfall","challenge"])
   assert.ok(typeof guide[lang][prop]==="string"&&guide[lang][prop].length>18,guide.id+" "+lang+" "+prop);
});
test("no advanced source is deceptively mapped as Zero",()=>{
 const byId=new Map(map.guides.map(x=>[x.id,x.tier]));
 for(const d of map.documents){
  assert.equal(d.learningLevel,byId.get(d.guide),d.title);
  if(["Advanced","Pro"].includes(d.level))assert.ok(["Advanced","Pro"].includes(byId.get(d.guide)),d.title);
 }
});
test("advanced Codex security and Pro enterprise docs are not taught as beginner",()=>{
 const security=map.documents.filter(x=>x.product==="Codex"&&/security|sandbox/i.test(x.title));
 assert.ok(security.length>=8);
 for(const d of security)if(["Advanced","Pro"].includes(d.level)){
  assert.ok(["Advanced","Pro"].includes(map.guides.find(g=>g.id===d.guide).tier),d.title);
 }
});
test("source editorial overrides are explicit for SDK and app server",()=>{
 const doc=map.documents.find(x=>x.title==="Codex App Server");
 assert.equal(doc.learningLevel,"Pro");
 assert.equal(doc.level,"Pro");
});
test("guided references are curated and on-topic, not arbitrary fallback",()=>{
 const refs=id=>map.guides.find(g=>g.id===id).references.map(x=>x.title).join(" | ");
 assert.match(refs("tool-choice"),/ChatGPT Work/);assert.doesNotMatch(refs("tool-choice"),/Amazon Bedrock/);
 assert.match(refs("good-request"),/Prompting/);
 assert.match(refs("privacy-basics"),/Permissions/);
 assert.match(refs("parallel-work"),/Worktrees/);
 assert.match(refs("safe-connections"),/Model Context Protocol/);
});
test("quizzes vary correct-answer positions to prevent predictable guessing",()=>{
 const numbers=new Set(course.lessons.slice(25).map(x=>x.vi.quiz.answer));
 assert.deepEqual([...numbers].sort(),[0,1,2]);
});
test("all guide references preserve catalog URLs",()=>{
 const byId=new Map(map.documents.map(x=>[x.id,x.url]));
 for(const guide of map.guides)for(const ref of guide.references)
  assert.equal(ref.url,byId.get(ref.id));
});
test("all sources HTTPS, no localhost URL or credentials",()=>{
 for(const d of map.documents){
  const u=new URL(d.url);
  assert.equal(u.protocol,"https:");
  assert.equal(u.username,"");assert.equal(u.password,"");
  assert.ok(!["localhost","127.0.0.1"].includes(u.hostname));
 }
});
test("legacy and replaced source docs are visibly flagged",()=>{
 const flagged=map.documents.filter(x=>x.legacy);
 assert.ok(flagged.length>=3);
 const html=fs.readFileSync(path.join(ROOT,"guide-ui.js"),"utf8");
 assert.match(html,/d\.legacy/);
 assert.match(html,/Legacy:/);
});
test("source health evidence matches the real 204-URL crawler snapshot",()=>{
 assert.equal(map.documents.length,204);
 assert.equal(map.sourceIndex.httpReachable,198);
 assert.equal(map.sourceIndex.httpUnavailable,6);
 assert.equal(map.sourceIndex.healthCheckedAt,"2026-10-25");
 assert.equal(map.documents.filter(d=>d.verifiedLive).length,198);
 assert.equal(map.documents.filter(d=>d.sourceHttp===404).length,6);
});
test("HTTP 200 reachability cannot claim full text proof or current features",()=>{
 assert.match(map.sourceIndex.quality,/HTTP 200 is evidence of reachability only/);
 const observed=JSON.parse(fs.readFileSync(path.join(ROOT,"data/source-health-20261025.json"),"utf8"));
 const byid=new Map(observed.documents.map(d=>[d.id,d]));
 for(const doc of map.documents){
  const evidence=byid.get(doc.id);
  assert.equal(doc.url,evidence.url,doc.id);
  assert.equal(doc.sourceHttp,evidence.http);
  assert.equal(doc.verifiedLive,evidence.status==="reachable");
  assert.equal(doc.verifiedAt,evidence.checkedAt);
 }
});
test("failed sources are excluded from curator reference cards",()=>{
 const failed=new Set(map.documents.filter(d=>!d.verifiedLive).map(x=>x.id));
 for(const guide of map.guides)for(const ref of guide.references)assert.ok(!failed.has(ref.id),guide.id+" "+ref.title);
});
test("source HTTP filter and headings are visible in learning guide",()=>{
 const html=fs.readFileSync(path.join(ROOT,"guide-ui.js"),"utf8");
 assert.match(html,/guide-status/);
 assert.match(html,/d\.sourceHeadings/);
 assert.match(html,/d\.sourceHttp===404/);
});
test("learning input is exactly 25+36 across 14 careers",()=>{
 assert.equal(course.lessons.length,61);assert.equal(course.careers.length,14);
});
test("first 25 Academy lessons preserved as canonical source",()=>{
 const siblingLessons=path.resolve(ROOT,"../codex-academy/lessons.json");
 const academy=JSON.parse(fs.readFileSync(fs.existsSync(siblingLessons)?siblingLessons:path.join(ROOT,"data/academy-base-20261024.json"),"utf8"));
 for(let i=0;i<academy.length;i++)assert.deepEqual(course.lessons[i],academy[i]);
});
test("editorial supplement is original content with concrete outcomes",()=>{
 for(const lesson of course.lessons.slice(25)){
  for(const locale of ["vi","en"]){
   assert.equal(lesson[locale].exercise.length,3);
   assert.ok(lesson[locale].outcome.length>=20);
   assert.ok([0,1,2].includes(lesson[locale].quiz.answer));
   assert.ok(lesson[locale].quiz.options[lesson[locale].quiz.answer].includes(lesson[locale].outcome));
   assert.ok(lesson[locale].quiz.explanation.includes(lesson[locale].outcome));
  }
 }
});
test("guides are only metadata/title references, not copyrighted full articles",()=>{
 assert.ok(map.documents.every(d=>!Object.hasOwn(d,"body")&&!Object.hasOwn(d,"markdown")));
});
test("safe source UI uses text escaping before markup",()=>{
 const s=fs.readFileSync(path.join(ROOT,"guide-ui.js"),"utf8");
 assert.match(s,/const esc=/);
 assert.match(s,/data-guide-tier/);
 assert.match(s,/data-guide-jump/);
 assert.match(s,/target="_blank" rel="noopener noreferrer"/);
 assert.doesNotMatch(s,/\beval\s*\(|\bXMLHttpRequest\b|sendBeacon|WebSocket/);
});
test("quick-win teaching demos are linked from matching topics",()=>{
 const ui=fs.readFileSync(path.join(ROOT,"guide-ui.js"),"utf8");
 for(const slug of ["zero-token-workshop","first-pr-clinic","human-review-checklist"])
  assert.ok(ui.includes("../"+slug+"/"),slug);
});
test("documentation index loading is local only",()=>{
 const s=fs.readFileSync(path.join(ROOT,"guide-ui.js"),"utf8");
 assert.match(s,/fetch\("\.\/data\/learning-map.json"/);
 assert.ok(!s.includes("fetch('https://")&&!s.includes('fetch("https://'));
});
test("source-index navigation cannot clobber learning path route",()=>{
 const s=fs.readFileSync(path.join(ROOT,"guide-ui.js"),"utf8");
 assert.match(s,/data-guide-scroll/);
 assert.doesNotMatch(s,/href="#guide-source-index"/);
});
test("visual lesson diagrams are locally authored and scripted on the guide and practice views",()=>{
 const v=fs.readFileSync(path.join(ROOT,"visuals.js"),"utf8");
 const css=fs.readFileSync(path.join(ROOT,"visuals.css"),"utf8");
 const html=fs.readFileSync(path.join(ROOT,"index.html"),"utf8");
 const guides=fs.readFileSync(path.join(ROOT,"guide-ui.js"),"utf8");
 const app=fs.readFileSync(path.join(ROOT,"app.js"),"utf8");
 assert.match(v,/root.CodexVisuals=\{guide,lesson,concepts/);
 assert.match(v,/role="group" aria-label/);
 assert.match(v,/<svg class="visual-pictogram"/);
 assert.match(css,/prefers-reduced-motion:reduce/);
 assert.match(css,/grid-template-columns:1fr/);
 assert.match(html,/src="\.\/visuals.js"/);
 assert.match(html,/href="\.\/visuals.css"/);
 assert.match(guides,/CodexVisuals\.guide\(g,locale\)/);
 assert.match(app,/CodexVisuals\.lesson\(lesson,locale\)/);
});
test("main highlight palette uses restrained accessible warm earth rather than saturated blue gradient",()=>{
 const css=fs.readFileSync(path.join(ROOT,"visuals.css"),"utf8");
 assert.match(css,/--cyan:#9c5138/);
 assert.match(css,/--cyan:#edab8b/);
 assert.match(css,/--hero-bg:#eae9e5/);
 assert.doesNotMatch(css,/linear-gradient\(/);
});
test("two self-contained handbooks cover all 19 human explanations",()=>{
 for(const lang of ["VI","EN"]){
  const content=fs.readFileSync(path.join(ROOT,"HANDBOOK_"+lang+".md"),"utf8");
  assert.equal((content.match(/^### \d+\./gm)||[]).length,19);
  assert.ok(content.includes("204")&&content.includes("Codex Path"));
  assert.ok(!content.includes("/Users/az/"));
 }
});
test("no private applicant data in indexed public assets",()=>{
 for(const name of ["data/learning-map.json","guide-ui.js","guide.css"]){
  const text=fs.readFileSync(path.join(ROOT,name),"utf8");
  assert.ok(!text.includes("/Users/az/")&&!/[A-Za-z0-9_.-]+@gmail\.com/i.test(text));
 }
});

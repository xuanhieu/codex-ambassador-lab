const test=require("node:test"),assert=require("node:assert/strict"),C=require("../core.js");
const sample=C.STEPS[0].exampleVI;
test("all four independent workshop activities total 20 minutes",()=>{assert.equal(C.STEPS.length,4);assert.equal(C.STEPS.reduce((n,x)=>n+x.minutes,0),20)});
test("known example is a valid clear prompt",()=>assert.equal(C.validate("prompt",sample).ok,true));
test("too short prompt is not accepted",()=>assert.equal(C.validate("prompt","Viết nhanh").ok,false));
test("lacking format needs clarity",()=>assert.equal(C.validate("prompt","Hãy giải thích điều này thật rõ và thật chi tiết cho người mới bắt đầu không có kỹ năng kỹ thuật.").ok,false));
test("email and API tokens rejected without storage",()=>{assert.equal(C.validate("prompt","hãy viết bảng cho email demo@gmail.com và token của tôi").reason,"SENSITIVE_CONTENT");assert.ok(C.sensitive("sk-abcdefghijklmnopqrstuvwxyz123456"))});
test("approval choice blocks automatic external send",()=>{assert.equal(C.validate("approval","send").ok,false);assert.equal(C.validate("approval","pause").ok,true)});
test("test lesson rejects appearance-only answer",()=>{assert.equal(C.validate("test","appearance").ok,false);assert.equal(C.validate("test","repro").ok,true)});
test("reflection needs explicit verification",()=>{assert.equal(C.validate("reflection","Tôi đã hoàn thành rất nhiều bài tập và thấy tất cả đều đẹp mắt và hấp dẫn.").ok,false);assert.equal(C.validate("reflection",C.STEPS[3].exampleVI).ok,true)});
test("first lesson cannot skip ahead",()=>{let r=C.complete(null,"test","repro");assert.equal(r.result.ok,false);assert.equal(r.progress.done.length,0)});
test("four-step progression generates evidence only at completion",()=>{let p=null;for(const [id,value] of [["prompt",sample],["approval","pause"],["test","repro"],["reflection",C.STEPS[3].exampleVI]]){let r=C.complete(p,id,value);assert.equal(r.result.ok,true,id);p=r.progress;}assert.equal(p.done.length,4);assert.match(C.receipt(p),/20/);assert.doesNotMatch(C.receipt(p),/demo@gmail\.com/);});
test("progress schema rejects arbitrary unknown steps and gaps",()=>{const p=C.state({schema:1,done:["test","reflection"]});assert.deepEqual(p.done,[])});
test("no evidence receipt when tests incomplete",()=>assert.equal(C.receipt({schema:1,done:["prompt"]}),null));

test("N120 learning passport round-trip saves only four known step IDs",()=>{
 const input={schema:1,done:["prompt","approval"]};
 const raw=C.exportPassport(input);
 assert.deepEqual(C.importPassport(raw),input);
 assert.ok(!raw.includes("Viết"));assert.ok(!raw.includes("Hãy thiết kế kế hoạch"));
});
test("N120 rejects attempts to skip a step",()=>assert.throws(()=>C.importPassport(JSON.stringify({schema:"n120-learning-passport-v1",completed:["prompt","test"]})),/INVALID_ORDER/));
test("N120 rejects external prototype pollution fields and gigantic inputs",()=>{
 assert.throws(()=>C.importPassport("x".repeat(12000)),/INVALID_PASSPORT_SIZE/);
 const imported=C.importPassport(JSON.stringify({schema:"n120-learning-passport-v1",completed:["prompt"],__proto__:{poison:true}}));
 assert.deepEqual(imported,{schema:1,done:["prompt"]});
});

test("page CSP allows exactly its inline script/style by hash, with no inline attributes",()=>{
 const fs=require("node:fs"),path=require("node:path"),crypto=require("node:crypto");
 const html=fs.readFileSync(path.join(__dirname,"..","index.html"),"utf8");
 const csp=(html.match(/<meta http-equiv="Content-Security-Policy" content="([^"]+)">/)||[])[1];
 assert.ok(csp,"meta CSP present");
 assert.doesNotMatch(csp,/unsafe-inline|unsafe-eval/);
 const hash=s=>"'sha256-"+crypto.createHash("sha256").update(s,"utf8").digest("base64")+"'";
 const dir=Object.fromEntries(csp.split(";").map(x=>x.trim().split(/\s+/)).map(([k,...v])=>[k,v]));
 const scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]),styles=[...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(m=>m[1]);
 assert.ok(scripts.length&&styles.length);
 for(const s of scripts)assert.ok(dir["script-src"].includes(hash(s)),"script hash current");
 for(const s of styles)assert.ok(dir["style-src"].includes(hash(s)),"style hash current");
 assert.doesNotMatch(html,/\sstyle=|\son[a-z]+="/);
});
test("prefilled examples pass their step in both languages",()=>{for(const s of C.STEPS.filter(x=>x.type==="text"))for(const k of ["exampleVI","exampleEN"])assert.equal(C.validate(s.id,s[k]).ok,true,s.id+" "+k)});

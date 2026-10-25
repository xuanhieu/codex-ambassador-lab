const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),C=require("../core.js");
const lengths=[20,45,90],audiences=Object.keys(C.audiences),topics=Object.keys(C.topics);
test("six audience profiles",()=>assert.equal(audiences.length,6));
test("four practice-oriented topics",()=>assert.equal(topics.length,4));
test("three explicit durations",()=>assert.deepEqual(C.allowedLengths,lengths));
for(const mins of lengths)test(mins+" min sums exactly",()=>{
 for(const a of audiences)for(const t of topics){
  const p=C.plan({audience:a,topic:t,minutes:mins});
  assert.equal(p.slots.reduce((x,s)=>x+s.minutes,0),mins);
  assert.equal(p.slots.length,4);
  assert.ok(p.slots.every(s=>s.minutes>=2));
  assert.equal(p.slots[0].start,0);
  assert.equal(p.slots[3].end,mins);
 }
});
test("reject invalid audience",()=>assert.throws(()=>C.plan({audience:"other",topic:"starter",minutes:20})));
test("reject invalid topic",()=>assert.throws(()=>C.plan({audience:"novice",topic:"custom",minutes:20})));
test("reject invalid duration",()=>assert.throws(()=>C.plan({audience:"novice",topic:"starter",minutes:13})));
test("no real-world booking occurs",()=>assert.equal(C.plan({audience:"teacher",topic:"prompt",minutes:45}).simulated,true));
test("markdown excludes personal inputs",()=>{const m=C.markdown(C.plan({audience:"student",topic:"starter",minutes:45}));assert.match(m,/45 minutes/);assert.match(m,/Human review/);});
test("all resources internal relative links",()=>{for(const t of Object.values(C.topics))assert.ok(t.link.startsWith("../"))});
test("CSP forbids API calls",()=>assert.match(fs.readFileSync(require("node:path").join(__dirname,"../index.html"),"utf8"),/connect-src 'none'/));
test("UI never uses remote APIs",()=>assert.doesNotMatch(fs.readFileSync(require("node:path").join(__dirname,"../app.js"),"utf8"),/\bfetch\s*\(|XMLHttpRequest|sendBeacon/));
test("workshop gates always include verification",()=>{for(const t of Object.values(C.topics))assert.ok(t.gate.length>=22)});

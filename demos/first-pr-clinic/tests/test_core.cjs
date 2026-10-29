const test=require("node:test"),assert=require("node:assert/strict"),C=require("../core.js");
test("three synthetic fixture cases and five stages",()=>{assert.equal(C.FIXTURES.length,3);assert.equal(C.STAGES.length,5)});
test("no real repository URL or credential required",()=>{assert.ok(C.FIXTURES.every(x=>x.file.startsWith("src/")));assert.ok(!C.FIXTURES.some(x=>JSON.stringify(x).includes("github.com/")))});
test("unknown action returns explicit rejection",()=>assert.equal(C.evaluate(C.state("count"),"invalid","text").ok,false));
test("cannot jump to diff from empty progress",()=>assert.equal(C.evaluate(C.state("count"),"diff","b").code,"COMPLETE_PRIOR_STAGE"));
test("issue needs a meaningful description",()=>assert.equal(C.evaluate(C.state("count"),"issue","bad").ok,false));
test("plan requires test or rollback",()=>{let p=C.evaluate(C.state("count"),"issue",C.FIXTURES[0].issueVI).progress;assert.equal(C.evaluate(p,"plan","Tôi sẽ sửa file code này ngay và không cần xem lại.").ok,false)});
test("known wrong diff is rejected",()=>{let p=C.state("count");p=C.evaluate(p,"issue",C.FIXTURES[0].issueVI).progress;p=C.evaluate(p,"plan","Tôi sẽ sửa file và chạy test, so sánh trước/sau.",).progress;assert.equal(C.evaluate(p,"diff","a").ok,false)});
test("full first issue -> plan -> diff -> test -> PR flow creates safe evidence",()=>{let p=C.state("count");const values=["Đếm nhầm một lần dù chưa có tương tác nào của người dùng.","Sửa đúng phép đếm, chạy test nhiều trường hợp và có rollback.","b","run_fixture_tests","Tôi đã sửa hàm đếm trong diff và chạy test với ba fixture, không gửi PR thật."];for(let i=0;i<C.STAGES.length;i++){let r=C.evaluate(p,C.STAGES[i],values[i]);assert.equal(r.ok,true,C.STAGES[i]+": "+r.code);p=r.progress;}let receipt=C.receipt(p);assert.ok(receipt.includes("READY")===false);assert.match(receipt,/GitHub write operations: 0/);assert.equal(p.done.length,5)});
test("different fixtures enforce independent choices",()=>{for(const x of C.FIXTURES){let p=C.state(x.id);p=C.evaluate(p,"issue",x.issueVI).progress;p=C.evaluate(p,"plan","Sửa file theo scope demo, chạy test và rollback nếu hỏng.").progress;assert.equal(C.evaluate(p,"diff",x.correct).ok,true,x.id)}});
test("receipt cannot be created for an incomplete simulation",()=>assert.equal(C.receipt(C.state("count")),null));

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

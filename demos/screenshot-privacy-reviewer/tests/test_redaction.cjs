const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const C=require('../redaction_core.js');
const ROOT=path.join(__dirname,'..');
const rect=(a,b,w=1200,h=760)=>C.normalizeRect(a,b,w,h);
test('normal basic rectangle',()=>assert.deepEqual(rect({x:30,y:20},{x:90,y:50}),{x:30,y:20,width:60,height:30}));
test('normalizes drag reversed',()=>assert.deepEqual(rect({x:90,y:50},{x:30,y:20}),{x:30,y:20,width:60,height:30}));
test('clamps top-left to zero',()=>assert.deepEqual(rect({x:-15,y:-7},{x:20,y:20}),{x:0,y:0,width:20,height:20}));
test('clamps bottom-right',()=>assert.deepEqual(rect({x:1100,y:650},{x:1600,y:850}),{x:1100,y:650,width:100,height:110}));
test('rejects too-small 1px drag',()=>assert.equal(rect({x:1,y:1},{x:2,y:2}),null));
test('rejects zero-size',()=>assert.equal(rect({x:1,y:1},{x:1,y:1}),null));
test('rejects fully out-of-bounds',()=>assert.equal(rect({x:-100,y:-40},{x:-5,y:-2}),null));
test('rejects invalid dimension',()=>assert.throws(()=>rect({x:1,y:1},{x:3,y:3},0,20)));
test('rejects infinity coordinate',()=>assert.throws(()=>rect({x:Infinity,y:0},{x:2,y:2})));
test('rejects missing point',()=>assert.throws(()=>rect(null,{x:2,y:2})));
test('floors start and ceils end for no gaps',()=>assert.deepEqual(rect({x:0.2,y:2.1},{x:10.3,y:20.2}),{x:0,y:2,width:11,height:19}));
test('percent 10 20 30 40 is deterministic',()=>assert.deepEqual(C.fromPercent(10,20,30,40,1000,800),{x:100,y:160,width:300,height:320}));
test('percent clamps overshoot',()=>assert.deepEqual(C.fromPercent(90,80,30,40,1000,800),{x:900,y:640,width:100,height:160}));
test('percent rejects negative',()=>assert.throws(()=>C.fromPercent(-1,1,10,10,1000,800)));
test('percent rejects NaN',()=>assert.throws(()=>C.fromPercent(NaN,1,10,10,1000,800)));
test('percent rejects 0 width',()=>assert.throws(()=>C.fromPercent(0,0,0,10,1000,800)));
test('percent rejects 101 top',()=>assert.throws(()=>C.fromPercent(0,101,10,10,1000,800)));
test('preview maps pointer to original pixels',()=>assert.deepEqual(C.previewToImage({clientX:150,clientY:100},{left:50,top:50,width:400,height:200},1200,600),{x:300,y:150}));
test('preview clamps out-of-bound pointer',()=>assert.deepEqual(C.previewToImage({clientX:-50,clientY:999},{left:50,top:50,width:400,height:200},1200,600),{x:0,y:600}));
test('preview rejects zero width',()=>assert.throws(()=>C.previewToImage({clientX:0,clientY:0},{left:0,top:0,width:0,height:200},1000,500)));
function mock(){
 const calls=[],ctx={canvas:{width:100,height:80},fillStyle:'',save:()=>calls.push('save'),restore:()=>calls.push('restore'),
 fillRect:(...args)=>calls.push(args)};
 return {ctx,calls};
}
test('redaction uses filled opaque pixels',()=>{
 const {ctx,calls}=mock();
 const n=C.redact(ctx,[{x:5,y:8,width:20,height:30}]);
 assert.equal(n,1);assert.deepEqual(calls[0],'save');assert.deepEqual(calls[1],[5,8,20,30]);assert.equal(calls[2],'restore');assert.equal(ctx.fillStyle,'#10151f');
});
test('redaction clips within source dimensions',()=>{
 const {ctx,calls}=mock();C.redact(ctx,[{x:90,y:70,width:40,height:30}]);
 assert.deepEqual(calls[1],[90,70,10,10]);
});
test('redaction preserves context on invalid rectangle',()=>{
 const {ctx,calls}=mock();assert.throws(()=>C.redact(ctx,[{x:'bad',y:1,width:10,height:10}]));
 assert.equal(calls[0],'save');assert.equal(calls.at(-1),'restore');
});
test('redaction prevents more than 100 masks',()=>{
 const {ctx}=mock();assert.throws(()=>C.redact(ctx,Array.from({length:101},()=>({x:0,y:0,width:10,height:10}))));
});
test('redaction prevents empty source canvas',()=>{
 const {ctx}=mock();ctx.canvas.width=0;assert.throws(()=>C.redact(ctx,[]));
});
test('image uploader allows only raster formats',()=>{
 const text=fs.readFileSync(path.join(ROOT,'app.js'),'utf8');
 assert.match(text,/\["image\/png","image\/jpeg","image\/webp"\]/);
 assert.match(text,/16e6/);assert.match(text,/15\*1024\*1024/);
});
test('no network APIs or request uploads used',()=>{
 const text=fs.readFileSync(path.join(ROOT,'app.js'),'utf8');
 assert.doesNotMatch(text,/\bfetch\s*\(|\bXMLHttpRequest\b|sendBeacon|WebSocket|EventSource/);
 assert.match(fs.readFileSync(path.join(ROOT,'index.html'),'utf8'),/connect-src 'none'/);
});
test('manual review and mask required to export',()=>{
 const text=fs.readFileSync(path.join(ROOT,'app.js'),'utf8');
 assert.match(text,/rects\.length>0&&\$\("reviewed"\)\.checked/);
 assert.match(text,/C\.redact\(ctx,s\.rects,"#10151f"\)/);
});
test('source metadata is not reused',()=>{
 const text=fs.readFileSync(path.join(ROOT,'app.js'),'utf8');
 assert.match(text,/out\.toBlob\(resolve,"image\/png"\)/);
 assert.doesNotMatch(text,/localStorage|sessionStorage|FileReader\s*\(/);
});

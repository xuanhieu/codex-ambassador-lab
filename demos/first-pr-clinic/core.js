/* O004 First Pull Request Clinic: safe deterministic Git learning fixtures. */
(function(root,factory){const api=factory();if(typeof module==="object"&&module.exports)module.exports=api;if(root)root.FirstPRClinic=api})(typeof window!=="undefined"?window:null,function(){
"use strict";
const STAGES=["issue","plan","diff","test","pr"];
const FIXTURES=[
{id:"count",vi:"Bộ đếm hiển thị sai",en:"Counter off by one",
issueVI:"Dự án demo đếm thêm một lượt dù người dùng chưa bấm nút.",issueEN:"The demo adds one click even if nobody clicks.",
file:"src/counter.js",before:"function clicks(events){ return events.length + 1; }",
options:[
{id:"a",code:"return events.length + 1;",vi:"Không thay đổi",en:"No change"},
{id:"b",code:"return events.length;",vi:"Đếm đúng sự kiện",en:"Count only real events"},
{id:"c",code:"return Math.max(1, events.length);",vi:"Luôn ít nhất một lượt",en:"Always at least one click"}
],correct:"b",checks:[["empty events",0],["one event",1],["three events",3]]},
{id:"name",vi:"Form chấp nhận tên trống",en:"Empty form accepted",
issueVI:"Tên chỉ chứa khoảng trắng lại được coi là hợp lệ.",issueEN:"A name containing only spaces passes validation.",
file:"src/validation.js",before:"function validName(s){ return s.length > 0; }",
options:[
{id:"a",code:"return s.length > 0;",vi:"Giữ code gốc",en:"Keep original"},
{id:"b",code:"return typeof s === 'string' && s.trim().length > 0;",vi:"Trim và kiểm tra kiểu",en:"Trim and check type"},
{id:"c",code:"return Boolean(s);",vi:"Ép Boolean",en:"Coerce to Boolean"}
],correct:"b",checks:[["empty name",false],["spaces only",false],["valid name",true]]},
{id:"total",vi:"Tính tổng bị sai",en:"Incorrect subtotal",
issueVI:"Giá được làm tròn từng món trước khi cộng tổng.",issueEN:"Each price is rounded before calculating the total.",
file:"src/total.js",before:"function total(items){ return items.reduce((s,n)=>s+Math.round(n),0); }",
options:[
{id:"a",code:"return items.reduce((s,n)=>s+Math.round(n),0);",vi:"Không đổi",en:"Keep existing"},
{id:"b",code:"return Math.round(items.reduce((s,n)=>s+n,0));",vi:"Tính tổng trước, làm tròn sau",en:"Sum before rounding"},
{id:"c",code:"return items.reduce((s,n)=>s+n+1,0);",vi:"Cộng thêm một",en:"Add one per item"}
],correct:"b",checks:[["0.4 + 0.4",1],["1.4 + 1.4",3],["2 + 2",4]]}
];
function state(caseId,raw){
 const fixture=FIXTURES.find(x=>x.id===caseId)||FIXTURES[0],done=[];
 if(raw?.schema===1&&raw.caseId===fixture.id&&Array.isArray(raw.done))
  for(const key of STAGES){if(raw.done.includes(key)&&done.length===STAGES.indexOf(key))done.push(key);else break;}
 return {schema:1,caseId:fixture.id,done,chosenDiff:raw?.chosenDiff||""};
}
function evaluate(raw,stage,value){
 const data=state(raw?.caseId,raw),fixture=FIXTURES.find(x=>x.id===data.caseId),i=STAGES.indexOf(stage);
 if(i<0||i>data.done.length)return {ok:false,code:"COMPLETE_PRIOR_STAGE",progress:data};
 const text=String(value||"").trim();let ok=false;
 if(stage==="issue")ok=text.length>=18&&!/sk-[\w-]{12,}/.test(text);
 if(stage==="plan")ok=text.length>=24&&/(test|kiểm|thử|verify|rollback|hoàn tác)/i.test(text);
 if(stage==="diff")ok=value===fixture.correct;
 if(stage==="test")ok=value==="run_fixture_tests"&&data.chosenDiff===fixture.correct;
 if(stage==="pr")ok=text.length>=35&&/(test|kiểm|thử|verify)/i.test(text)&&/(sửa|fix|diff|change|thay)/i.test(text);
 if(!ok)return {ok:false,code:stage==="diff"?"FIX_DID_NOT_PASS":stage==="test"?"NEED_VERIFIED_DIFF":"INCOMPLETE_EVIDENCE",progress:data};
 if(stage==="diff")data.chosenDiff=value;
 if(i===data.done.length)data.done.push(stage);
 return {ok:true,code:"PASSED_SIMULATION",progress:data};
}
function receipt(raw){
 const p=state(raw?.caseId,raw);
 if(p.done.length!==STAGES.length)return null;
 const f=FIXTURES.find(x=>x.id===p.caseId);
 return "# Draft PR evidence — O004 First PR Clinic\n\n"+
 "- Simulated issue: "+f.vi+"\n- Target file: "+f.file+"\n- Chosen diff: "+f.options.find(x=>x.id===f.correct).code+
 "\n- Fixture test cases: "+f.checks.length+" (synthetic)\n- Review gate: self-checked draft only\n"+
 "- GitHub write operations: 0\n- Deployment: 0\n\nThis document is a learning receipt, not a real submitted pull request.\n";
}
return {STAGES,FIXTURES,state,evaluate,receipt};
});
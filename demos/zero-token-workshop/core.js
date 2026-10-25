/* N003 Codex Zero-Token Workshop — original offline educational simulator. */
(function(root,factory){
 const engine=factory();
 if(typeof module==="object"&&module.exports)module.exports=engine;
 if(root)root.ZeroTokenWorkshop=engine;
})(typeof window!=="undefined"?window:null,function(){
"use strict";
const STEPS=[
{id:"prompt",minutes:5,type:"text",
 vi:"Viết yêu cầu rõ ràng",en:"Write a clear request",
 introVI:"Cho AI biết mục tiêu, đối tượng và định dạng mong muốn. Hãy thử prompt đã điền sẵn và sửa theo bạn.",
 introEN:"Specify the task, audience and desired output. Try the editable example.",
 exampleVI:"Hãy thiết kế kế hoạch 7 ngày học Git cho người chưa biết lập trình. Trình bày dạng bảng gồm ngày, việc cần làm, cách kiểm tra. Chỉ dùng dữ liệu giả.",
 exampleEN:"Make a seven-day Git learning plan for a complete beginner. Return a table with day, task and self-check. Use fictional data."},
{id:"approval",minutes:5,type:"choice",
 vi:"Phân quyền trước khi hành động",en:"Set boundaries before actions",
 introVI:"Agent đề nghị gửi toàn bộ file khách hàng qua email để kiểm thử. Nên xử lý thế nào?",
 introEN:"An agent proposes emailing customer files as part of testing. What is safe?",
 options:[{id:"send",vi:"Cho gửi ngay",en:"Send immediately"},{id:"pause",vi:"Tạm dừng và xin phép người có quyền, dùng dữ liệu giả",en:"Pause for authorized approval, use synthetic data"},{id:"skip",vi:"Bỏ qua cảnh báo",en:"Ignore the warning"}],correct:"pause"},
{id:"test",minutes:5,type:"choice",
 vi:"Kiểm chứng kết quả",en:"Test the result",
 introVI:"Một form hiển thị 'Lưu thành công' nhưng không còn dữ liệu sau refresh. Bạn nên làm gì?",
 introEN:"A form says Saved, but the data vanishes after refresh. Next step?",
 options:[{id:"appearance",vi:"Coi như đạt vì giao diện đẹp",en:"Pass because it looks nice"},{id:"assume",vi:"Tin kết quả AI báo",en:"Trust the AI's success message"},{id:"repro",vi:"Tạo dữ liệu mẫu, tái hiện lỗi, sửa, rồi thử refresh lại",en:"Use sample data, reproduce, fix, and retest refresh"}],correct:"repro"},
{id:"reflection",minutes:5,type:"text",
 vi:"Ghi bằng chứng học",en:"Write learning evidence",
 introVI:"Viết vài câu về bạn đã làm gì và kiểm thử ra sao. Không dùng dữ liệu thật.",
 introEN:"Describe what you practiced and how you verified it. Use no real data.",
 exampleVI:"Tôi đã sửa prompt để rõ mục tiêu và đầu ra, từ chối yêu cầu gửi dữ liệu riêng tư, sau đó tạo bản thử và kiểm lại dữ liệu sau refresh.",
 exampleEN:"I clarified the goal and output, rejected an unsafe data transfer, then tested a sample form after refresh."}
];
function sensitive(text){
 return /(?:sk-[a-z0-9_-]{12,}|ghp_[a-z0-9_]{12,}|-----BEGIN [^-]+PRIVATE KEY-----|[a-z0-9_.+-]+@(?:gmail|outlook|yahoo|hotmail)\.com)/i.test(text);
}
function validate(id,answer){
 const step=STEPS.find(x=>x.id===id);
 if(!step)return {ok:false,reason:"UNKNOWN_STEP"};
 if(step.type==="choice")return {ok:answer===step.correct,reason:answer===step.correct?"VERIFIED":"TRY_AGAIN"};
 const s=String(answer??"").trim();
 if(sensitive(s))return {ok:false,reason:"SENSITIVE_CONTENT"};
 if(s.length<45)return {ok:false,reason:"NEED_MORE_DETAIL"};
 if(s.length>1500)return {ok:false,reason:"TOO_LONG"};
 if(id==="prompt"){
  const task=/(hãy|thiết kế|lập|tạo|write|make|create|design)/i.test(s);
  const output=/(bảng|cột|danh sách|các bước|table|column|list|steps)/i.test(s);
  return {ok:task&&output,reason:task&&output?"CLEAR_GOAL":"STATE_GOAL_AND_FORMAT"};
 }
 const checked=/(kiểm|test|verify|thử|tái hiện|refresh|review|retest)/i.test(s);
 return {ok:checked,reason:checked?"REFLECTED":"DESCRIBE_VERIFICATION"};
}
function state(raw){
 const done=[];
 if(raw&&raw.schema===1&&Array.isArray(raw.done))
  for(const step of STEPS){if(raw.done.includes(step.id)&&done.length===STEPS.indexOf(step))done.push(step.id);else break;}
 return {schema:1,done};
}
function complete(raw,id,value){
 const p=state(raw),i=STEPS.findIndex(x=>x.id===id);
 if(i<0||i>p.done.length)return {progress:p,result:{ok:false,reason:"COMPLETE_PREVIOUS"}};
 const result=validate(id,value);
 if(result.ok&&i===p.done.length)p.done.push(id);
 return {progress:p,result};
}
function receipt(raw,lang="vi"){
 const p=state(raw);if(p.done.length!==STEPS.length)return null;
 return "# "+(lang==="vi"?"Chứng cứ tự học — Workshop 20 phút":"Self-learning receipt — 20-minute workshop")
 +"\n\n- Idea: N003 — Zero-Token Workshop\n- Steps: "+p.done.join(" / ")
 +"\n- Network/API calls: none\n- Personal data submitted: none\n- Evidence: self-checked browser simulation\n- Certification: no official qualification\n";
}
function exportPassport(raw){
 const p=state(raw);
 return JSON.stringify({schema:"n120-learning-passport-v1",completed:p.done,contentMode:"no_private_text",selfReported:true},null,2)+"\n";
}
function importPassport(input){
 if(typeof input!=="string"||input.length>8192)throw Error("INVALID_PASSPORT_SIZE");
 let data;try{data=JSON.parse(input)}catch{throw Error("INVALID_JSON")}
 if(!data||data.schema!=="n120-learning-passport-v1"||!Array.isArray(data.completed)||data.completed.length>STEPS.length)throw Error("INVALID_SCHEMA");
 for(let i=0;i<data.completed.length;i++){
  if(typeof data.completed[i]!=="string"||data.completed[i]!==STEPS[i].id)throw Error("INVALID_ORDER");
 }
 return {schema:1,done:data.completed.slice()};
}
return {STEPS,sensitive,validate,state,complete,receipt,exportPassport,importPassport};
});
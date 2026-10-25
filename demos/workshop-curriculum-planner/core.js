(function(root,factory){
const api=factory();if(typeof module==="object"&&module.exports)module.exports=api;else root.WorkshopPlanner=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
"use strict";
const audiences={
 novice:{vi:"Người chưa biết code",en:"No-code beginner",task:"Viết prompt 4 phần và nhận ra dữ liệu nhạy cảm."},
 student:{vi:"Học sinh / Sinh viên",en:"Student",task:"Soạn kế hoạch học giả lập và tự kiểm chứng."},
 teacher:{vi:"Giáo viên / Người đào tạo",en:"Teacher",task:"Xây giáo án ngắn và quiz đánh giá hiểu bài."},
 office:{vi:"Văn phòng / Doanh nghiệp nhỏ",en:"Office / Small business",task:"Biến ghi chú họp giả thành bảng công việc."},
 developer:{vi:"Developer / Người học Git",en:"Developer",task:"Sửa file demo, đọc diff và chạy test."},
 leader:{vi:"Trưởng nhóm / Agent Pro",en:"Team lead",task:"Mô phỏng đề xuất, phê duyệt và rollback."}
};
const topics={
 starter:{vi:"Việc đầu tiên với AI",en:"First AI task",link:"../codex-path/#start",gate:"Không dùng thông tin thật và tự đánh giá đầu ra."},
 prompt:{vi:"Viết yêu cầu rõ ràng",en:"Clear prompts",link:"../codex-path/#guide",gate:"Prompt có mục tiêu, đầu vào mẫu và tiêu chí đạt."},
 safety:{vi:"Dữ liệu và quyền phê duyệt",en:"Privacy & approvals",link:"../approval-drill/",gate:"Không gửi, xóa hoặc deploy khi chưa được duyệt."},
 coding:{vi:"Build → Diff → Test",en:"Build, diff and test",link:"../first-pr-clinic/",gate:"Phải có diff, test PASS và cách hoàn tác."}
};
const labels=[
 ["Đặt mục tiêu, kiểm tra môi trường","Brief and environment"],
 ["Giải thích & xem demo","Explain and demonstrate"],
 ["Thực hành với dữ liệu giả","Guided safe practice"],
 ["Đánh giá, sửa và rút kinh nghiệm","Review and refine"]
];
const allowedLengths=[20,45,90];
function plan(input){
 if(!input||!Object.hasOwn(audiences,input.audience)||!Object.hasOwn(topics,input.topic)||!allowedLengths.includes(Number(input.minutes)))throw Error("Chọn đúng đối tượng, chủ đề và thời lượng 20/45/90 phút.");
 const total=Number(input.minutes);
 const weights=input.audience==="leader"||input.audience==="developer"?[.12,.20,.50,.18]:[.14,.25,.40,.21];
 let count=[Math.max(2,Math.floor(weights[0]*total)),Math.max(3,Math.floor(weights[1]*total)),Math.max(5,Math.floor(weights[2]*total))];
 const end=total-count.reduce((a,b)=>a+b,0);
 if(end<3){count[2]-=3-end;count.push(3)}else count.push(end);
 if(count.some(x=>x<=0)||count.reduce((a,b)=>a+b,0)!==total)throw Error("Không phân bổ được thời gian");
 let at=0;
 const slots=count.map((mins,i)=>{
  const start=at;at+=mins;
  return {id:i+1,start,end:at,minutes:mins,vi:labels[i][0],en:labels[i][1],
    evidence:i===0?"Có mục tiêu và phạm vi":i===1?"Mẫu minh họa được giải thích":i===2?audiences[input.audience].task:"Có rubric, lỗi và bước tiếp theo"};
 });
 return {version:"workshop-planner-v1",audience:input.audience,topic:input.topic,minutes:total,
  slots,task:audiences[input.audience].task,gate:topics[input.topic].gate,
  resource:topics[input.topic].link,requiresAccount:false,simulated:true};
}
function markdown(planResult,locale="vi"){
 const en=locale==="en",aud=audiences[planResult.audience],topic=topics[planResult.topic];
 const rows=["# "+(en?"Workshop plan":"Kịch bản workshop")+": "+topic[en?"en":"vi"],"",
  (en?"Audience":"Đối tượng")+": "+aud[en?"en":"vi"],
  (en?"Duration":"Thời lượng")+": "+planResult.minutes+" minutes",
  "","","| Time | Activity | Evidence |","|---|---|---|",
  ...planResult.slots.map(x=>"| "+x.start+"–"+x.end+" min | "+x[en?"en":"vi"]+" | "+x.evidence+" |"),
  "","Practice task: "+planResult.task,
  "Human review: "+planResult.gate,
  "Resource: "+planResult.resource,
  "","Independent simulation only; no event was scheduled and no learner progress was fabricated."];
 return rows.join("\n")+"\n";
}
return {plan,markdown,audiences,topics,allowedLengths};
});
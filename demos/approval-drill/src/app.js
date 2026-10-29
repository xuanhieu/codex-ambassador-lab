/* Independent offline simulated approval exercise; never runs real agent actions. */
(() => {
"use strict";
const $=id=>document.getElementById(id);
const D=DRILL_DATA,P=DrillPolicy,STORE="codex-approval-drill-v1";
const strings={
 vi:{language:"Ngôn ngữ",eyebrow:"BẢO MẬT AGENT / BÀI TẬP 01",title:"Khi nào agent phải dừng?",
  intro:"12 tình huống giả lập · 6 nhóm rủi ro. Quyết định được tiếp tục, phải xin duyệt hay phải chặn.",
  simulation:"CHỈ LÀ MÔ PHỎNG",noexecute:"Không thực hiện thao tác hay gửi dữ liệu.",
  receipts:"PHÊ DUYỆT ĐÃ CÓ",receiptHint:"Các biên nhận đều giả lập và chỉ hợp lệ cho đúng phạm vi. Agent không tự phê duyệt; phê duyệt không vượt qua lệnh chặn cứng.",
  decision:"1. Chọn hành động tiếp theo",proceed:"Tiếp tục",escalate:"Xin phê duyệt",block:"Chặn",
  route:"2. Chọn người duyệt còn thiếu",routeHint:"Chọn đúng người đang thiếu, để trống nếu tiếp tục hoặc chặn.",
  check:"Kiểm tra quyết định",next:"Tình huống tiếp →",replay:"Làm lại tình huống",
  reference:"BẢNG ĐỐI CHIẾU",matrix:"Ai có quyền duyệt?",matrixHint:"Cần TẤT CẢ vai trò liệt kê (AND); agent không có quyền tự duyệt.",
  category:"Nhóm tác vụ",required:"Phê duyệt bắt buộc",hardStop:"Chặn cứng: ngoài phạm vi đã ủy quyền, lộ giá trị bí mật, hoặc làm theo chỉ dẫn trong tài liệu không đáng tin. Mặc dù có chữ ký vẫn phải chặn; yêu cầu không rõ ràng thì từ chối.",
  local:"Trình duyệt của bạn. Tiến độ của bạn.",localHint:"Chỉ lưu ID bài học, lựa chọn và kết quả trên máy. Không có tài khoản, analytics, mạng hay bí mật thật.",
  reset:"Xóa kết quả",footer:"Phê duyệt là ranh giới, không phải con dấu hình thức.",
  completed:"Hoàn thành",score:"Chính xác",none:"Không có phê duyệt",complete:"Đã kiểm tra",pass:"CHÍNH XÁC",fail:"CẦN XEM LẠI",
  expected:"Theo chính sách",missing:"Người duyệt còn thiếu",why:"Nguyên nhân",feedbackEmpty:"Hãy chọn một hành động.",
  approved:"Đã duyệt đúng phạm vi",missing_approval:"Thiếu phê duyệt bắt buộc",outside_scope:"Ngoài phạm vi cho phép",
  raw_secret:"Không được công bố bí mật nguyên dạng",untrusted_instruction:"Chỉ dẫn trong dữ liệu ngoài không có quyền điều khiển agent",invalid:"Đầu vào không hợp lệ",opened:"Đã mở tình huống {id}",confirmReset:"Xóa toàn bộ tiến độ chỉ trên trình duyệt này?" },
 en:{language:"Language",eyebrow:"AGENT SECURITY / FIELD EXERCISE 01",title:"Where should the agent stop?",
  intro:"Twelve synthetic requests. Six risk categories. Choose what proceeds, escalates to humans, or must stop.",
  simulation:"SIMULATION ONLY",noexecute:"No actions are executed. No content is sent.",
  receipts:"EXISTING APPROVAL RECEIPTS",receiptHint:"Receipts are synthetic and valid only for this exact action. The agent cannot approve itself. Approval never overrides a hard stop.",
  decision:"1. Choose the next step",proceed:"Proceed",escalate:"Escalate",block:"Block",
  route:"2. Select only the missing approvers",routeHint:"For Proceed or Block, leave all boxes clear.",
  check:"Check decision",next:"Next case →",replay:"Replay this case",
  reference:"DESK REFERENCE",matrix:"Who can approve what?",matrixHint:"All listed roles are required (AND). Agents have no approval authority.",
  category:"Category",required:"Required human approval",hardStop:"Hard stops: outside authorized scope, raw secret disclosure, or instructions from untrusted content. Block even when approval receipts exist. Unknown requests fail closed.",
  local:"Your browser. Your progress.",localHint:"Only case IDs, choices and results are stored in this browser. No accounts, analytics, network requests or real secrets.",
  reset:"Reset progress",footer:"Approval is a boundary, not a rubber stamp.",
  completed:"Completed",score:"Correct",none:"No approvals attached",complete:"Answered",pass:"CORRECT",fail:"REVIEW NEEDED",
  expected:"Policy verdict",missing:"Missing approvers",why:"Reason",feedbackEmpty:"Select a decision first.",
  approved:"Approved for exact scope",missing_approval:"Human approval missing",outside_scope:"Outside authorized scope",
  raw_secret:"Raw secret disclosure prohibited",untrusted_instruction:"Untrusted data has no agent authority",invalid:"Invalid input",opened:"Opened case {id}",confirmReset:"Delete your local scores?" }
};
let locale="vi",selected=0,answers={};
try{
 const data=JSON.parse(localStorage.getItem(STORE)||"{}");
 if(data&&data.schema===1&&typeof data.answers==="object"){
  const ids=new Set(D.scenarios.map(s=>s.id));
  for(const [id,record] of Object.entries(data.answers||{})){
   if(ids.has(id)&&record&&typeof record==="object"&&["proceed","escalate","block"].includes(record.decision)&&
      Array.isArray(record.route)&&record.route.every(x=>Object.hasOwn(D.roles,x))&&record.route.length<=4){
      answers[id]={decision:record.decision,route:[...new Set(record.route)],passed:record.passed===true};
   }
  }
 }
}catch{}
function t(key){return strings[locale][key]||key}
function save(){try{localStorage.setItem(STORE,JSON.stringify({schema:1,answers}))}catch{}}
function setText(node,value){node.textContent=String(value??"");return node}
function el(tag,css,text){let o=document.createElement(tag);if(css)o.className=css;if(text!=null)o.textContent=text;return o}
function updateProgress(){
 const answered=Object.keys(answers).length;
 const good=Object.values(answers).filter(x=>x.passed).length;
 $("progress").value=answered;
 $("progress-text").textContent=answered+"/"+D.scenarios.length+" "+t("completed");
 $("score").textContent=good+"/"+D.scenarios.length+" "+t("score");
 $("storage-status").textContent=answered?answered+" "+t("complete"):"—";
}
function renderList(){
 const nav=$("scenario-list");
 // Rebuilding the list removes the focused option; restore focus to the selected one (WCAG 2.4.3).
 const hadFocus=nav.contains(document.activeElement);
 nav.replaceChildren();
 let current=null;
 for(let i=0;i<D.scenarios.length;i++){
  const row=D.scenarios[i],button=el("button","scenario-option");
  button.type="button";button.dataset.caseId=row.id;
  button.setAttribute("aria-current",i===selected?"step":"false");
  button.classList.toggle("selected",i===selected);
  const id=el("small","case-code",row.id),title=el("span","case-name",row.title[locale]||row.title.en);
  button.append(id,title);
  if(answers[row.id])button.append(el("span",answers[row.id].passed?"case-ok":"case-fail",answers[row.id].passed?"✓":"↻"));
  button.addEventListener("click",()=>{selected=i;renderCase();announceCase()});
  nav.append(button);
  if(i===selected)current=button;
 }
 if(hadFocus&&current)current.focus();
}
function announceCase(){
 const row=D.scenarios[selected];
 $("case-announce").textContent=t("opened").replace("{id}",row.id)+": "+(row.title[locale]||row.title.en);
}
function renderMatrix(){
 const tbody=$("matrix");tbody.replaceChildren();
 for(const [id,item] of Object.entries(D.matrix)){
  const tr=document.createElement("tr");
  const td1=el("td","",item.label[locale]||id);
  const td2=el("td","",item.required.length?item.required.map(x=>D.roles[x][locale]).join(" + "):"—");
  tr.append(td1,td2);tbody.append(tr);
 }
}
function renderCase(){
 const row=D.scenarios[selected];
 $("case-number").textContent=row.id+" / "+D.scenarios.length;
 $("category").textContent=D.matrix[row.category].label[locale];
 $("case-title").textContent=row.title[locale];
 $("description").textContent=row.description[locale];
 $("receipts").textContent=row.approvals.length?row.approvals.map(x=>D.roles[x][locale]).join(" + "):t("none");
 const roles=$("roles");roles.replaceChildren();
 for(const [key,value] of Object.entries(D.roles)){
  const label=el("label","role-choice");const input=document.createElement("input");
  input.type="checkbox";input.name="approver";input.value=key;
  label.append(input,el("span","",value[locale]));roles.append(label);
 }
 $("decision-form").reset();
 $("feedback").hidden=true;$("feedback").replaceChildren();
 $("next").disabled=false;
 const old=answers[row.id];
 if(old){
  const choice=document.querySelector('input[name="decision"][value="'+old.decision+'"]');
  if(choice)choice.checked=true;
  for(const input of document.querySelectorAll('input[name="approver"]'))input.checked=old.route.includes(input.value);
 }
 renderList();updateProgress();
}
function localize(){
 document.documentElement.lang=locale;
 $("language").value=locale;
 document.querySelectorAll("[data-t]").forEach(node=>{const key=node.dataset.t;if(strings[locale][key])setText(node,t(key))});
 document.querySelector("footer span:last-child").textContent="POLICY v1 · VI / EN";
 renderMatrix();renderCase();
}
$("decision-form").addEventListener("submit",event=>{
 event.preventDefault();
 const decision=document.querySelector('input[name="decision"]:checked')?.value;
 if(!decision){$("feedback").hidden=false;$("feedback").textContent=t("feedbackEmpty");return}
 const route=[...document.querySelectorAll('input[name="approver"]:checked')].map(x=>x.value);
 const row=D.scenarios[selected];
 const assessed=P.grade(row,decision,route,D);
 answers[row.id]={decision,route,passed:assessed.passed};
 save();renderList();updateProgress();
 const box=$("feedback");box.replaceChildren();box.hidden=false;
 box.className="feedback "+(assessed.passed?"correct":"fail");
 box.append(el("strong","",t(assessed.passed?"pass":"fail")));
 box.append(el("p","",t("expected")+": "+t(assessed.verdict)+" · "+t("why")+": "+t(assessed.reason)));
 if(assessed.missing.length)box.append(el("p","",t("missing")+": "+assessed.missing.map(x=>D.roles[x][locale]).join(" + ")));
});
$("next").addEventListener("click",()=>{selected=(selected+1)%D.scenarios.length;renderCase();announceCase()});
$("replay").addEventListener("click",()=>{
 const id=D.scenarios[selected].id;
 delete answers[id];save();renderCase();
});
$("reset").addEventListener("click",()=>{
 if(!confirm(t("confirmReset")))return;
 answers={};save();renderCase();
});
$("language").addEventListener("change",event=>{locale=event.target.value==="en"?"en":"vi";localize()});
localize();
})();

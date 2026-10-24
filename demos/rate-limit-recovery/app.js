/* Offline deterministic HTTP recovery simulator: no fetch, no timers for real retries. */
(() => {
"use strict";
const q=id=>document.getElementById(id);
const SCENARIOS=window.RECOVERY_CASES;
const vi={title:"Không retry vô hạn. Không đốt hết quota.",desc:"Mô phỏng chuỗi HTTP 429/503/200, Retry-After, exponential backoff, jitter, ngân sách request và các lỗi phải dừng ngay — hoàn toàn offline.",configure:"Cấu hình chiến lược",scenario:"Tình huống",attempts:"Số lần thử tối đa",budget:"Ngân sách request",base:"Base delay (ms)",cap:"Trần chờ tối đa (ms)",run:"Chạy mô phỏng →",reset:"Khôi phục",note:"Không gửi request API thật. Không cần token hoặc kết nối nhà cung cấp.",result:"Kết quả mô phỏng",req:"Request",elapsed:"Thời gian chờ",stop:"Lý do dừng",timeline:"Timeline quyết định",guard1:"Tuân thủ Retry-After",guard1d:"Nếu server yêu cầu chờ lâu hơn trần chính sách, dừng thay vì tự rút ngắn thời gian chờ.",guard2:"Không retry 401/403",guard2d:"Lỗi xác thực và phân quyền không phải lỗi rate limit tạm thời.",guard3:"Giữ ngân sách",guard3d:"Số lần thử hữu hạn và trần request giúp ngăn vòng lặp không kiểm soát.",cli:"Tái tạo bằng Python chuẩn",clihint:"Engine tất định với jitter có seed; chạy từng tình huống bằng CLI và so sánh kết quả browser.",readme:"Mở hướng dẫn đầy đủ ↗",success:"THÀNH CÔNG",stopped:"ĐÃ DỪNG",retry:"Thử lại",terminal:"Dừng tại",attempt:"Lượt",wait:"Đợi",requestBudget:"Hết ngân sách request",attemptLimit:"Đạt giới hạn lượt thử",tooLong:"Retry-After dài hơn trần",invalid:"Lỗi không được retry",exhausted:"Hết chuỗi response mẫu",reason:"Lý do",info:"Lựa chọn mô phỏng chỉ mô tả cơ chế; luôn tuân theo chính sách của từng nhà cung cấp."};
const en={title:"Retry with a budget. Never burn your quota.",desc:"Explore synthetic HTTP 429/503/200 sequences, Retry-After, exponential backoff, deterministic jitter, attempt budgets and fail-fast authentication errors — offline.",configure:"Strategy controls",scenario:"Scenario",attempts:"Maximum attempts",budget:"Request budget",base:"Base delay (ms)",cap:"Maximum wait (ms)",run:"Run simulation →",reset:"Reset",note:"No real HTTP requests, tokens or provider connections.",result:"Simulation result",req:"Requests",elapsed:"Wait elapsed",stop:"Stop reason",timeline:"Decision timeline",guard1:"Honor Retry-After",guard1d:"If the server requires a longer wait than policy allows, abort rather than shortening the delay.",guard2:"Do not retry 401/403",guard2d:"Authentication or permission errors are not transient rate limits.",guard3:"Protect the budget",guard3d:"Finite attempts and a request cap prevent runaway loops.",cli:"Reproduce with Python stdlib",clihint:"Deterministic seeded jitter allows exact comparison of browser and CLI decisions.",readme:"Open full documentation ↗",success:"SUCCEEDED",stopped:"STOPPED",retry:"Retry",terminal:"Terminal",attempt:"Attempt",wait:"Sleep",requestBudget:"Request budget hit",attemptLimit:"Attempt limit hit",tooLong:"Retry-After exceeds cap",invalid:"Non-retryable HTTP error",exhausted:"Synthetic response sequence exhausted",reason:"Reason",info:"This lab demonstrates a policy; always follow the terms and rate limits of the actual provider."};
const scenarioLabels={
 "recover-429":{vi:"429 → 429 → 200 · hồi phục",en:"429 → 429 → 200 · recovery"},
 "respect-retry-after":{vi:"503 + Retry-After 4 giây",en:"503 + Retry-After 4 seconds"},
 "invalid-credentials":{vi:"401 → 200 · phải dừng",en:"401 → 200 · fail fast"},
 "persistent-429":{vi:"429 liên tục · giới hạn lượt",en:"Persistent 429 · attempt limits"},
 "transient-5xx":{vi:"502 → 503 → 200 · server phục hồi",en:"502 → 503 → 200 · server recovers"},
 "success":{vi:"200 ngay lập tức",en:"Immediate HTTP 200"}
};
const reasonLabels={success:{vi:"HTTP thành công",en:"Success"},attempt_limit:{vi:"Hết số lần thử",en:"Attempt limit"},request_budget:{vi:"Hết ngân sách request",en:"Request budget"},terminal_http:{vi:"HTTP không thể retry",en:"Non-retryable HTTP"},sequence_exhausted:{vi:"Hết chuỗi mẫu",en:"Response sequence ended"},retry_after_exceeds_cap:{vi:"Retry-After vượt trần",en:"Retry-After exceeds cap"},exponential_backoff:{vi:"Backoff + jitter",en:"Backoff + jitter"},retry_after:{vi:"Tuân thủ Retry-After",en:"Honor Retry-After"}};
let lang="vi",result=null;
const t=s=>(lang==="vi"?vi:en)[s]||s;
const reason=s=>reasonLabels[s]?.[lang]||s;
function simulate(statuses,retryAfter,config){
 let events=[],clock=0,why="sequence_exhausted",success=false;
 const available=Math.min(config.max_attempts,config.budget,statuses.length);
 for(let attempt=1;attempt<=available;attempt++){
  const http=statuses[attempt-1];
  const item={attempt,at_ms:clock,http,retry:false,delay_ms:0,reason:""};
  if(http>=200&&http<=299){why="success";success=true;item.reason=why;events.push(item);break}
  if(![429,502,503,504].includes(http)){why="terminal_http";item.reason=why;events.push(item);break}
  if(attempt>=config.max_attempts){why="attempt_limit";item.reason=why;events.push(item);break}
  if(attempt>=config.budget){why="request_budget";item.reason=why;events.push(item);break}
  if(attempt>=statuses.length){why="sequence_exhausted";item.reason=why;events.push(item);break}
  const frac=((config.seed*1103515245+attempt*12345)%1000)/1000;
  const exp=Math.min(config.max_delay_ms,config.base_delay_ms*2**(attempt-1));
  const jittered=Math.floor(exp*(.75+.25*frac));
  const wait=Math.max(jittered,retryAfter);
  if(wait>config.max_delay_ms){why="retry_after_exceeds_cap";item.reason=why;events.push(item);break}
  item.retry=true;item.delay_ms=wait;item.reason=retryAfter>jittered?"retry_after":"exponential_backoff";
  events.push(item);clock+=wait;
 }
 return {success,stop_reason:why,requests:events.length,elapsed_ms:clock,events};
}
function langUI(){
 document.documentElement.lang=lang;
 for(const n of document.querySelectorAll("[data-t]"))n.textContent=t(n.dataset.t);
 const picker=q("scenario"),value=picker.value;
 picker.replaceChildren();
 for(const key of Object.keys(SCENARIOS)){
  const el=document.createElement("option");el.value=key;el.textContent=scenarioLabels[key][lang];picker.append(el);
 }
 picker.value=value||"recover-429";
 run();
}
function fill(){
 for(const id of ["attempts","budget","base","cap"])q(id+"Value").textContent=q(id).value;
}
function run(){
 fill();
 const key=q("scenario").value;
 const s=SCENARIOS[key];
 if(!s)return;
 const config={max_attempts:Number(q("attempts").value),base_delay_ms:Number(q("base").value),
  max_delay_ms:Number(q("cap").value),budget:Number(q("budget").value),seed:7};
 result=simulate(s.statuses,s.retry_after_ms,config);
 const out=q("outcome");
 out.textContent=result.success?t("success"):t("stopped");
 out.className="outcome"+(result.success?"":result.stop_reason==="retry_after_exceeds_cap"?" warn":" bad");
 q("requests").textContent=result.requests+"/"+config.budget;
 q("elapsed").textContent=(result.elapsed_ms/1000).toFixed(2)+" s";
 q("stop").textContent=reason(result.stop_reason);
 q("count").textContent=result.events.length+" steps";
 const target=q("timeline");target.replaceChildren();
 for(const e of result.events){
  const li=document.createElement("li");
  const order=document.createElement("span");order.className="order";order.textContent=String(e.attempt).padStart(2,"0");
  const text=document.createElement("div");text.className="what";
  const label=document.createElement("strong");label.textContent=t("attempt")+" "+e.attempt+" · "+(e.retry?t("retry"):t("terminal"));
  const sub=document.createElement("small");sub.textContent="t="+(e.at_ms/1000).toFixed(2)+"s · "+reason(e.reason);
  text.append(label,sub);
  const delay=document.createElement("span");delay.className="delay";delay.textContent=e.delay_ms>0?t("wait")+" "+(e.delay_ms/1000).toFixed(2)+"s":"—";
  const http=document.createElement("span");http.className="http"+(e.http>=200&&e.http<=299?" ok":"");http.textContent="HTTP "+e.http;
  li.append(order,text,delay,http);target.append(li);
 }
 q("insight").textContent=t("info")+" "+reason(result.stop_reason)+".";
}
for(const id of ["attempts","budget","base","cap"])q(id).addEventListener("input",run);
q("scenario").addEventListener("change",run);
q("simulate").addEventListener("click",run);
q("reset").addEventListener("click",()=>{
 q("attempts").value=5;q("budget").value=5;q("base").value=500;q("cap").value=30000;
 q("scenario").value="recover-429";run();
});
q("lang").addEventListener("change",event=>{lang=event.target.value==="en"?"en":"vi";langUI()});
langUI();
})();
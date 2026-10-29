/* Codex Path — local-first learning/career app. Source lesson data: existing Academy. */
(() => {
"use strict";
const C=window.CodexPathEngine;
const KEY="codex-path-state-v1",ACADEMY_KEY="codex-zerohero-academy-v1";
const $=id=>document.getElementById(id);
const esc=v=>String(v??"").replace(/[&<>"']/g,x=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[x]));
const text=(id,t)=>{if($(id))$(id).textContent=String(t??"")};
const tl={
 vi:{start:"Bắt đầu tại đây",firstWin:"Bắt đầu trong 3 phút ↗",overview:"Tổng quan",path:"Lộ trình học",career:"Con đường nghề",lab:"Practice Lab",evidence:"Portfolio / Proof",
  privacyMini:"Dữ liệu chỉ trên trình duyệt",portfolioLink:"Portfolio ↗",backup:"Backup",
  buildMyPath:"Tạo lộ trình của tôi",academyLink:"Mở kho bài học ↗",
  careerLabel:"Tôi muốn làm gì?",levelLabel:"Trình độ hiện tại",hoursLabel:"Giờ học / tuần",
  goalLabel:"Mục tiêu hoàn thành",generate:"Thiết kế roadmap",
  hero:"Start with a task.<em> Grow with every build.</em>",heroDesc:"Một bài học hữu ích, một việc làm được, một bước tiến rõ ràng. Chọn lộ trình từ Zero đến Pro — không cần biết code để bắt đầu.",
  profileTitle:"Xác định điểm xuất phát",profileDesc:"Điều chỉnh thông tin để lên roadmap. Không cần tài khoản.",
  weeks:"tuần",hours:"giờ",valid:"Lựa chọn hợp lệ — có thể tạo kế hoạch.",
  progress:"Tiến độ học",estimated:"Thời lượng dự kiến",lessonCount:"Bài học có nguồn",target:"Mục tiêu học",notGuaranteed:"Dự báo thời gian mang tính ước tính, không cam kết việc làm.",
  next:"Bài học tiếp theo",course:"Lộ trình của bạn",outcomes:"Nghề nghiệp mục tiêu",build:"Thực hành cuối khóa",careerSkills:"Năng lực trọng tâm",
  open:"Mở bài",allPath:"Xem toàn bộ roadmap",allCareer:"So sánh nghề nghiệp",started:"Bắt đầu",done:"Đã học",remaining:"Chưa xong",
  startedNote:"Mọi xác nhận chỉ là tự đánh giá; không phải chứng nhận.",
  capstone:"Dự án cuối khóa",weeksTotal:"tuần",totalTime:"phút",lessonMinutes:"phút",lesson:"bài",
  openAcademy:"Mở bài trên Academy",source:"Nguồn gốc",quiz:"Kiểm tra nhận thức",quizCheck:"Chấm đáp án",correct:"Đúng — có thể xác nhận bài học.",
  wrong:"Chưa đúng. Đọc giải thích và thử lại.",completeConfirm:"Tôi đã hoàn thành bài tập thực tế và tự kiểm tra.",
  mark:"Ghi nhận đã hoàn thành",undo:"Bỏ đánh dấu hoàn thành",blocked:"Hoàn thành bài tiên quyết trước: ",
  saved:"Đã lưu trong trình duyệt này",openEvidence:"Ghi bằng chứng",checklist:"Kết quả cần có",
  evidenceTitle:"Ghi lại bằng chứng, không chỉ tuyên bố",evidenceSub:"Bản thân đánh dấu hoàn thành không chứng minh năng lực. Thêm link công khai và kiểm tra khả năng truy cập.",
  evidenceUrl:"Link bằng chứng capstone (HTTPS)",evidenceValid:"URL đúng định dạng HTTPS; nội dung và quyền truy cập chưa được kiểm chứng.",
  evidenceInvalid:"Chỉ nhận URL HTTPS công khai đúng cú pháp.",evidenceMissing:"Chưa nhập URL bằng chứng.",
  evidenceGate:"Tình trạng tự đánh giá",evidenceDisclaimer:"Không có cơ chế chấm tự động hay cấp chứng chỉ. Kiểm tra repo/demo và kết quả test bằng người thật.",
  confirmCapstone:"Tôi đã tự kiểm tra capstone, test và khả năng truy cập bằng chứng.",
  exportMd:"Xuất roadmap Markdown",exportJson:"Xuất backup JSON",importJson:"Nhập backup",academyImport:"Nhập tiến độ Academy",
  careerExplain:"14 lộ trình học theo mục đích, trong đó 8 tuyến không cần code. Đây không phải cam kết việc làm hay thu nhập.",careerStages:"Các cấp bậc phát triển",
  selectCareer:"Chọn hướng này",selected:"Đang chọn",careerTrack:"Lộ trình phù hợp",minSkill:"Nhóm kỹ năng",
  practiceSub:"61 bài học song ngữ với quiz, bài tập và tài liệu gốc. Không tự chạy code hoặc truy cập file máy bạn.",
  search:"Tìm bài học, kỹ năng, cấp độ…",filterAll:"Tất cả trình độ",reset:"Xóa dữ liệu",resetConfirm:"Xóa toàn bộ tiến độ Codex Path trên trình duyệt này?",
  resume:"Tiếp tục bài đang học",empty:"Không có kết quả; thử bộ lọc khác.",
  noPlan:"Chọn lộ trình ở cột trái để bắt đầu.",completed:"Hoàn thành",level:"Cấp độ",week:"Tuần",
  goalWarning:"Mục tiêu ngắn hơn khối lượng giờ học dự kiến. Cân nhắc tăng giờ/tuần hoặc kéo dài thời gian.",
  goalOK:"Kế hoạch phù hợp trong phạm vi giờ đã chọn. Tiến độ thực tế tùy theo bài thực hành.",
  storageRecovered:"Tiến độ đã lưu trên trình duyệt này bị hỏng nên đã được đặt lại. Bản cũ được giữ riêng; bạn có thể nhập lại từ file backup.",
  quizPrompt:"Chọn đáp án trước khi chấm.",imported:"Đã nhập bản backup hợp lệ.",invalidBackup:"Backup không hợp lệ: ",
  academyNone:"Chưa có dữ liệu Academy trên trình duyệt này.",academyAdded:"Đã nhập bài học đã hoàn thành từ Academy: ",
  locked:"Chưa thể đánh dấu vì thiếu bài tiên quyết hoặc quiz.",note:"Ghi chú riêng (tối đa 600 ký tự)",
  proofReady:"Bản tự đánh giá đã đủ điều kiện nội bộ",proofNotReady:"Cần bổ sung trước khi tuyên bố hoàn thiện",
  proofWarning:"Ngay cả trạng thái đủ điều kiện vẫn cần người xem đánh giá source, video và trách nhiệm an toàn." },
 en:{start:"Start here",firstWin:"Your first win in 3 minutes ↗",overview:"Overview",path:"Learning Path",career:"Career Tracks",lab:"Practice Lab",evidence:"Portfolio / Proof",
  privacyMini:"Progress stays in this browser",portfolioLink:"Portfolio ↗",backup:"Backup",
  buildMyPath:"Build my path",academyLink:"Open Academy ↗",
  careerLabel:"What do you want to do?",levelLabel:"Current level",hoursLabel:"Hours per week",
  goalLabel:"Target duration",generate:"Generate roadmap",
  hero:"Start with a task.<em> Grow with every build.</em>",heroDesc:"One useful lesson, one small finished task, one real step forward. Choose a path from Zero to Pro — no coding experience needed to begin.",
  profileTitle:"Choose your starting point",profileDesc:"Adjust your inputs to build a realistic plan. No account required.",
  weeks:"weeks",hours:"hours",valid:"Valid selection — ready to generate your roadmap.",
  progress:"Learning progress",estimated:"Estimated duration",lessonCount:"Traceable lessons",target:"Learning target",notGuaranteed:"Study estimates only, no job guarantee.",
  next:"Next lesson",course:"Your recommended roadmap",outcomes:"Target career",build:"Portfolio capstone",careerSkills:"Core skills",
  open:"Open lesson",allPath:"Full roadmap",allCareer:"Compare careers",started:"Start",done:"Completed",remaining:"Remaining",
  startedNote:"Completion is self-reported and not a certification.",
  capstone:"Capstone",weeksTotal:"weeks",totalTime:"minutes",lessonMinutes:"min",lesson:"lessons",
  openAcademy:"Open Academy",source:"Official references",quiz:"Knowledge check",quizCheck:"Check answer",correct:"Correct — ready to self-confirm this lesson.",
  wrong:"Not quite. Review the explanation and try again.",completeConfirm:"I completed the practical exercise and reviewed the result.",
  mark:"Mark completed",undo:"Undo completion",blocked:"Complete prerequisite lesson(s) first: ",
  saved:"Saved in this browser",openEvidence:"Record evidence",checklist:"Deliverables",
  evidenceTitle:"Build a proof trail, not just a claim",evidenceSub:"Self-reported completion is not proof of proficiency. Attach inspectable links and verify them manually.",
  evidenceUrl:"Capstone proof link (HTTPS)",evidenceValid:"Valid HTTPS syntax; destination and access are not independently verified.",
  evidenceInvalid:"Use a syntactically valid public HTTPS URL.",evidenceMissing:"Proof link missing.",
  evidenceGate:"Self-reported readiness",evidenceDisclaimer:"No automatic grading or certification. Have a reviewer inspect the repository/demo and real test logs.",
  confirmCapstone:"I reviewed my capstone, tests and proof access manually.",
  exportMd:"Export Markdown roadmap",exportJson:"Export JSON backup",importJson:"Import backup",academyImport:"Import Academy progress",
  careerExplain:"Fourteen purpose-based paths, including eight that need no code. No job or income guarantee.",careerStages:"Career progression",
  selectCareer:"Choose this track",selected:"Selected",careerTrack:"My career",minSkill:"Skill groups",
  practiceSub:"61 bilingual hands-on lessons, including 25 from Academy, with quizzes, exercises and official links. The site never runs code or accesses your device.",
  search:"Find lesson, skill, level…",filterAll:"All levels",reset:"Reset progress",resetConfirm:"Delete all Codex Path progress in this browser?",
  resume:"Continue learning",empty:"No matching lesson. Try another filter.",
  noPlan:"Choose a route in the left panel to begin.",completed:"Completed",level:"Level",week:"Week",
  goalWarning:"Your target is shorter than estimated study workload. Increase weekly hours or extend your deadline.",
  goalOK:"The plan fits the selected weekly study budget. Actual learning time varies.",
  storageRecovered:"Saved progress in this browser was unreadable and has been reset. The old copy is kept aside; you can re-import a backup file.",
  quizPrompt:"Select an answer to check.",imported:"Valid backup imported.",invalidBackup:"Cannot import backup: ",
  academyNone:"No Academy progress found in this browser.",academyAdded:"Imported completed lessons from Academy: ",
  locked:"Cannot mark complete: prerequisite or quiz missing.",note:"Private note (max 600 characters)",
  proofReady:"Local self-assessment criteria met",proofNotReady:"More evidence needed before claiming completion",
  proofWarning:"Even a green local status requires independent source, video and safety review."}
};
let data=null,state=null,plan=null,route="overview",locale="vi",theme="dark";
let filters={q:"",level:"all"},lastQuiz={},activeLesson=null,toastTimer=0;
function t(key){return (tl[locale]||tl.vi)[key]||key}
function pick(v){return v?.[locale]||v?.en||v?.vi||""}
function lsRead(name){try{return JSON.parse(localStorage.getItem(name)||"null")}catch{return null}}
function save(msg=false){
 if(!state)return;
 state.lastUpdated=new Date().toISOString();
 try{localStorage.setItem(KEY,JSON.stringify(state));}catch{note("Storage unavailable; state remains in this tab")}
 if(msg)note(t("saved"));
 renderStats();
}
function note(msg,ms=2900){
 clearTimeout(toastTimer);
 const o=$("toast");o.textContent=String(msg||"").slice(0,220);o.classList.add("visible");
 toastTimer=setTimeout(()=>o.classList.remove("visible"),ms);
}
// The page CSP blocks style="" attributes in HTML strings; widths are set through the CSSOM instead.
function applyPercentWidths(root){
 root.querySelectorAll("[data-pct]").forEach(el=>{const n=Number(el.dataset.pct);el.style.width=(Number.isFinite(n)?Math.min(100,Math.max(0,n)):0)+"%"});
}
function hrefSafe(u){return C.safeUrl(u)?esc(u):"#"}
function pct(n,total){return total?Math.round(100*n/total):0}
function download(filename,content,kind="application/json;charset=utf-8"){
 const blob=new Blob([content],{type:kind}),url=URL.createObjectURL(blob),link=document.createElement("a");
 link.href=url;link.download=filename;document.body.appendChild(link);link.click();link.remove();
 setTimeout(()=>URL.revokeObjectURL(url),600);
}
function labels(){
 document.documentElement.lang=locale;
 document.querySelectorAll("[data-i]").forEach(node=>{const word=tl[locale][node.dataset.i];if(word)node.textContent=word});
 $("ascii-heading").innerHTML=t("hero");
 text("hero-description",t("heroDesc"));text("profile-title",t("profileTitle"));text("profile-desc",t("profileDesc"));
 text("state-status",t("saved"));
 text("weeks-output",state.prefs.goalWeeks+" "+t("weeks"));
 $("locale-toggle").textContent=locale==="vi"?"EN":"VI";
 $("theme-toggle").textContent=theme==="dark"?"☼":"◐";
 document.documentElement.dataset.theme=theme;
 $("current-tab").textContent=t(route);
 window.dispatchEvent(new CustomEvent("codexpath:reveal",{detail:{target:"hero"}}));
}
function initSelectors(){
 $("career").replaceChildren();
 for(const c of data.careers){
  const option=document.createElement("option");option.value=c.id;option.textContent=pick(c.name);$("career").append(option);
 }
 $("level").replaceChildren();
 for(const level of C.TIERS){
  const option=document.createElement("option");option.value=level;option.textContent=level;$("level").append(option);
 }
 $("hours").replaceChildren();
 for(const h of C.HOUR_OPTIONS){
  const option=document.createElement("option");option.value=String(h);option.textContent=h+"h";$("hours").append(option);
 }
 syncSelectors();
}
function syncSelectors(){
 const p=state.prefs;
 $("career").value=p.career;$("level").value=p.level;$("hours").value=String(p.hours);$("weeks").value=String(p.goalWeeks);
 text("weeks-output",p.goalWeeks+" "+t("weeks"));
 validateProfile();
}
function validateProfile(){
 const career=C.getCareer(data,$("career").value);
 const valid=!!career&&C.TIERS.includes($("level").value)&&C.HOUR_OPTIONS.includes(Number($("hours").value));
 const f=$("career-status");f.textContent=valid?t("valid"):"Invalid profile";f.classList.toggle("invalid",!valid);
 $("career").setAttribute("aria-invalid",String(!valid));
 const prospective=C.buildPlan(data,{career:$("career").value,level:$("level").value,hours:Number($("hours").value),goalWeeks:Number($("weeks").value),locale});
 text("readiness-tip",prospective.horizonStatus==="more-time-needed"?t("goalWarning"):t("goalOK"));
 return valid;
}
function replan(options){
 state.prefs=C.normalizePrefs({...options,locale});
 plan=C.buildPlan(data,state.prefs);
 syncSelectors();save();
 render();note(t("saved"));
}
function renderStats(){
 if(!plan)return;
 const p=C.progress(plan,state);
 text("side-progress",p.percent+"%");
 $("side-meter").style.width=p.percent+"%";
 text("side-next",p.next?("NEXT "+p.next.id+" · "+p.next.title.slice(0,26)):"Capstone review");
}
function section(title,subtitle,kicker="WAYFINDER",actions=""){
 return '<div class="section-heading"><div><div class="eyebrow">'+esc(kicker)+'</div><h2>'+esc(title)+'</h2><p>'+esc(subtitle)+'</p></div><div class="section-actions">'+actions+'</div></div>';
}
function button(action,label,css="secondary"){
 return '<button class="button '+css+'" type="button" data-action="'+esc(action)+'">'+esc(label)+'</button>';
}
function stageMap(){
 const p=C.progress(plan,state);
 const byLevel=new Map(p.stage.map(x=>[x.level,x]));
 return '<div class="stages">'+C.TIERS.map((lev,n)=>{
  const record=byLevel.get(lev)||{done:0,total:0};
  const done=record.total>0&&record.done===record.total;
  return '<div class="stage '+(done?"done":record.done>0?"active":"")+'"><span>0'+(n+1)+'</span><strong>'+lev+'</strong><small>'+record.done+'/'+record.total+' '+esc(t("lesson"))+'</small></div>';
 }).join("")+'</div>';
}
function lessonRow(l){
 const done=state.done.includes(l.id);
 return '<button class="lesson-row" type="button" data-lesson="'+esc(l.id)+'"><span class="lesson-id">'+esc(l.id)+'</span><span class="lesson-info"><strong>'+esc(l.title)+'</strong><small>'+esc(l.level)+' · '+l.duration+' '+esc(t("lessonMinutes"))+'</small></span><span class="lesson-badge '+(done?"done":"")+'">'+(done?"✓":"↗")+'</span></button>';
}
function careerHeading(c){
 return '<div class="career-detail"><span class="career-icon" aria-hidden="true">'+esc(c.icon)+'</span><div><h3>'+esc(pick(c.name))+'</h3><small>'+esc(c.family)+'</small></div></div>';
}
function skills(c){return '<div class="skill-cloud">'+c.skills.map(x=>'<span class="skill-pill">'+esc(x)+'</span>').join("")+'</div>'}
function showOverview(){
 const c=plan.career,p=C.progress(plan,state),readiness=C.readiness(plan,state);
 const preview=p.next?[p.next,...plan.lessons.filter(x=>x.id!==p.next.id&&!state.done.includes(x.id))].slice(0,3):[];
 const minutes=plan.totalMinutes;
 return section(t("course"),t("startedNote"),"02 / YOUR LEARNING OS",
  '<button class="button tiny" data-action="export-md">⇩ '+esc(t("exportMd"))+'</button>')
 +'<div class="stats-grid">'
 +'<div class="stat"><span class="stat-label">'+t("progress")+'</span><strong>'+p.percent+'%</strong><small>'+p.completed+'/'+p.total+'</small></div>'
 +'<div class="stat"><span class="stat-label">'+t("estimated")+'</span><strong>'+plan.estimatedWeeks+'</strong><small>'+t("weeksTotal")+'</small></div>'
 +'<div class="stat"><span class="stat-label">'+t("lessonCount")+'</span><strong>'+plan.lessons.length+'</strong><small>'+minutes+' '+t("totalTime")+'</small></div>'
 +'<div class="stat"><span class="stat-label">'+t("target")+'</span><strong>'+plan.prefs.goalWeeks+'</strong><small>'+t("weeksTotal")+'</small></div>'
 +'</div>'+stageMap()
 +'<div class="two-panel"><div class="surface-card"><div class="panel-head"><h3>'+t("next")+'</h3><button class="button tiny" data-tab="path">'+t("allPath")+' ↗</button></div>'
 +'<div class="lesson-list">'+(preview.length?preview.map(lessonRow).join(""):'<p class="empty">'+t("completed")+'</p>')+'</div></div>'
 +'<div class="surface-card"><div class="panel-head"><h3>'+t("outcomes")+'</h3><button class="button tiny" data-tab="career">'+t("allCareer")+' ↗</button></div>'
 +careerHeading(c)+skills(c)
 +'<div class="career-target"><strong>'+t("build")+'</strong><br>'+esc(pick(c.capstone))+'</div>'
 +'</div></div>'
 +'<div class="notice '+(readiness.ready?"good":"")+'">'+(plan.horizonStatus==="more-time-needed"?t("goalWarning"):t("goalOK"))+' · '+t("notGuaranteed")+'</div>';
}
function showPath(){
 const p=C.progress(plan,state);
 return section(t("course"),t("startedNote"),"03 / WEEKLY ROADMAP",
  button("export-md",t("exportMd"),"tiny"))
 +'<div class="surface-card u-mb-12"><div class="panel-head"><h3>'+t("progress")+' · '+p.completed+'/'+p.total+'</h3><span class="tag">'+plan.estimatedWeeks+' '+t("weeksTotal")+'</span></div>'
 +'<div class="progress-line"><i data-pct="'+p.percent+'"></i></div>'+stageMap()+'</div>'
 +'<div class="path-grid">'+plan.weeks.map(w=>'<section class="week-group"><header class="week-heading"><h3>'+t("week")+' '+w.index+'</h3><small>'+w.minutes+' '+t("lessonMinutes")+' · '+w.lessonIds.length+' '+t("lesson")+'</small></header>'
 +'<div class="week-content">'+(w.lessonIds.length?w.lessonIds.map(id=>lessonRow(plan.lessons.find(x=>x.id===id))).join(""):'<span class="tag">'+t("build")+'</span>')+'</div>'
 +(w.capstone?'<div class="week-capstone"><strong>'+t("capstone")+' · '+w.capstoneMinutes+' min · steps '+w.capstoneSteps.join(",")+'/3</strong><p>'+esc(pick(plan.career.capstone))+'</p><button class="button tiny" data-tab="evidence">'+t("openEvidence")+' ↗</button></div>':'')
 +'</section>').join("")+'</div>';
}
function showCareer(){
 const c=plan.career;
 return section(t("career"),t("careerExplain"),"04 / CAREER NAVIGATOR")
 +'<div class="career-grid">'+data.careers.map((item,i)=>'<article class="career-card '+(item.id===c.id?"selected":"")+'"><div class="career-top"><span class="career-number">TRACK 0'+(i+1)+'</span><span class="tag">'+esc(item.family)+'</span></div>'
 +careerHeading(item)+'<p>'+esc(pick(item.tagline))+'</p>'+skills(item)
 +'<div class="card-actions"><button class="button '+(item.id===c.id?"outline":"primary")+'" data-career="'+esc(item.id)+'">'+(item.id===c.id?t("selected"):t("selectCareer"))+' →</button></div></article>').join("")+'</div>'
 +'<div class="surface-card u-mt-12"><div class="panel-head"><h3>'+t("careerStages")+' · '+esc(pick(c.name))+'</h3></div><div class="stages stages-3">'
 +c.seniority.map((name,index)=>'<div class="stage"><span>0'+(index+1)+'</span><strong>'+esc(name)+'</strong><small>'+t("startedNote")+'</small></div>').join("")+'</div>'
 +'<div class="career-target">'+t("build")+': '+esc(pick(c.capstone))+'</div></div>';
}
function showLab(){
 const q=filters.q.toLocaleLowerCase(),lev=filters.level;
 const selected=data.lessons.filter(l=>{
  if(lev!=="all"&&l.level!==lev)return false;
  const words=[l.id,l.level,l.en.title,l.vi.title,l.en.purpose,l.vi.purpose,...l.audience].join(" ").toLocaleLowerCase();
  return !q||words.includes(q);
 });
 return section(t("lab"),t("practiceSub"),"05 / HANDS-ON EXERCISES")
 +'<div class="filters"><input id="lab-search" type="search" value="'+esc(filters.q)+'" placeholder="'+esc(t("search"))+'" aria-label="'+esc(t("search"))+'">'
 +'<select id="lab-level" aria-label="'+esc(t("level"))+'"><option value="all">'+t("filterAll")+'</option>'+C.TIERS.map(x=>'<option value="'+x+'"'+(filters.level===x?" selected":"")+'>'+x+'</option>').join("")+'</select></div>'
 +'<div class="lab-grid">'+(selected.length?selected.map(l=>
  '<article class="surface-card"><div class="panel-head"><span class="tag">'+esc(l.id)+' · '+esc(l.level)+'</span><span class="tag">'+l.duration+' min</span></div><h3>'+esc(l[locale].title)+'</h3>'
  +'<p>'+esc(l[locale].outcome)+'</p><div class="card-actions"><button class="button primary tiny" data-lesson="'+esc(l.id)+'">'+t("open")+' ↗</button></div></article>').join(""):'<div class="empty">'+t("empty")+'</div>')+'</div>';
}
function showEvidence(){
 const p=C.progress(plan,state),report=C.readiness(plan,state),c=plan.career;
 const isPrivate=c.proofMode==="private";
 const url=state.artifacts.capstone||"";
 const valid=C.safeUrl(url);
 return section(t("evidenceTitle"),t("evidenceSub"),"06 / PROOF LEDGER",
  button("export-json",t("exportJson"),"tiny"))
 +'<div class="capstone-card"><div class="eyebrow">'+t("capstone")+'</div><h3>'+esc(pick(c.name))+' · 01</h3><p>'+esc(pick(c.capstone))+'</p>'
 +'<ul class="checklist">'+c.evidence.map(x=>'<li>'+esc(x)+'</li>').join("")+'</ul></div>'
 +'<div class="evidence-layout u-mt-13"><div class="surface-card"><h3>'+(isPrivate?(locale==="vi"?"Bằng chứng thực hành riêng tư":"Private practice evidence"):t("evidenceUrl"))+'</h3><p>'+t("evidenceDisclaimer")+'</p>'
 +(isPrivate?
 '<label for="private-proof" class="eyebrow">'+(locale==="vi"?"Mô tả bài thực hành (tối thiểu 35 ký tự)":"Describe your practice (at least 35 characters)")+'</label>'
 +'<textarea class="evidence-input" id="private-proof" rows="4" maxlength="500" placeholder="'+(locale==="vi"?"Ví dụ: Tôi đã tạo checklist từ dữ liệu giả, tự kiểm tra 3 bước, ghi điều cần sửa…":"Example: I built a synthetic checklist, reviewed three steps, and recorded one revision…")+'">'+esc(state.privateProof||"")+'</textarea>'
 +'<div id="private-proof-status" class="field-feedback '+((state.privateProof||"").trim().length>=35?"valid":"invalid")+'" role="status">'+(locale==="vi"?"Chỉ lưu trong trình duyệt. Không bắt buộc GitHub hay công bố dữ liệu cá nhân.":"Saved only in this browser. No GitHub account or public personal data required.")+'</div>'
 :
 '<label for="capstone-url" class="eyebrow">'+t("evidenceUrl")+'</label>'
 +'<input class="evidence-input" id="capstone-url" type="url" inputmode="url" placeholder="https://github.com/..." value="'+esc(url)+'" aria-describedby="url-validation">'
 +'<div class="field-feedback '+(valid?"valid":"invalid")+'" id="url-validation" role="status">'+(valid?t("evidenceValid"):url?t("evidenceInvalid"):t("evidenceMissing"))+'</div>')
 +'<label class="confirm-row"><input type="checkbox" id="capstone-confirm" '+(state.capstoneConfirmed?"checked":"")+'><span>'+t("confirmCapstone")+'</span></label></div>'  +'<div class="surface-card"><h3>'+t("evidenceGate")+'</h3><div class="progress-line"><i data-pct="'+p.percent+'"></i></div>'
 +'<strong class="u-fs-18">'+(report.ready?t("proofReady"):t("proofNotReady"))+'</strong><p>'+p.completed+'/'+p.total+' '+t("completed")+'</p>'
 +'<div class="skill-cloud">'+report.gaps.map(x=>'<span class="tag warn">'+esc(x.replaceAll("_"," "))+'</span>').join("")+'</div><p>'+t("proofWarning")+'</p>'
 +'<div class="card-actions">'+button("export-md",t("exportMd"),"tiny")+button("import-json",t("importJson"),"tiny")+'</div></div></div>'
 +'<div class="surface-card u-mt-12"><div class="panel-head"><h3>PROGRESS BRIDGE · Academy → Path</h3></div>'
 +'<p>'+t("startedNote")+'</p><div class="card-actions">'+button("academy-import",t("academyImport"),"tiny")
 +button("export-json",t("exportJson"),"tiny")+button("reset",t("reset"),"tiny")+'</div></div>';
}
const views={start:()=>window.CodexStartScreen.render(locale),guide:()=>window.CodexGuideScreen.render(locale),overview:showOverview,path:showPath,career:showCareer,lab:showLab,evidence:showEvidence};
function render(){
 if(!data||!plan)return;
 const requested=(location.hash||"#start").slice(1).split("?")[0];
 route=Object.hasOwn(views,requested)?requested:"start";
 document.documentElement.dataset.entry=route;
 document.querySelectorAll("[data-tab]").forEach(a=>{
  if(a.closest("nav")){a.classList.toggle("active",a.dataset.tab===route);a.setAttribute("aria-current",a.dataset.tab===route?"page":"false");}
 });
 text("current-tab",t(route));
 const view=$( "content");view.innerHTML=views[route]();applyPercentWidths(view);
 if(route==="start")window.CodexStartScreen.mount(locale);
 if(route==="guide")window.CodexGuideScreen.mount(locale);
 renderStats();
 window.dispatchEvent(new CustomEvent("codexpath:reveal",{detail:{target:"content"}}));
 if(requested==="path"&&location.hash.includes("?lesson=")){
  const id=new URLSearchParams(location.hash.split("?")[1]||"").get("lesson");
  if(id&&data.lessons.some(x=>x.id===id))queueMicrotask(()=>openLesson(id));
 }
}
function openLesson(id){
 const lesson=data.lessons.find(l=>l.id===id);if(!lesson)return;
 activeLesson=id;
 const obj=lesson[locale],p=plan.lessons.find(l=>l.id===id)||null;
 text("lesson-code",id+" / "+lesson.level+" / "+lesson.duration+" min");
 text("lesson-modal-title",obj.title);
 const completed=state.done.includes(id),existingNote=state.notes[id]||"";
 const prereq=p?C.canMarkComplete(plan,state,id):
  {allowed:lesson.prerequisites.every(x=>state.done.includes(x)),
   missing:lesson.prerequisites.filter(x=>!state.done.includes(x))};
 const chosen=lastQuiz[id];
 const quiz=obj.quiz;
 let html='<div class="tag">'+esc(lesson.level)+' · '+esc(lesson.duration)+' min</div>'
  +'<h3>'+t("target")+'</h3><p>'+esc(obj.outcome)+'</p>'
  +(window.CodexVisuals?window.CodexVisuals.lesson(lesson,locale):'')
  +'<h3>'+t("checklist")+'</h3><p class="practice-hint">'+(locale==="vi"?"Làm từng bước, đánh dấu sau khi tự kiểm tra kết quả.":"Complete each step and check it after reviewing your result.")+'</p>'
  +'<ol class="practice-checklist">'+obj.exercise.map((v,i)=>'<li><label class="confirm-row"><input type="checkbox" data-lesson-step="'+esc(id)+'" data-step-index="'+i+'" '+((state.steps?.[id]||[]).includes(i)?"checked":"")+'><span>'+esc(v)+'</span></label></li>').join("")+'</ol>'
  +'<div class="field-feedback" id="steps-feedback" role="status">'+(state.steps?.[id]||[]).length+'/'+obj.exercise.length+' '+(locale==="vi"?"bước hoàn thành":"steps complete")+'</div>'
  +'<details class="practice-prompt"><summary>'+(locale==="vi"?"Prompt mẫu để thực hành với Codex/ChatGPT":"Practice prompt for Codex/ChatGPT")+'</summary>'
  +'<p>'+(locale==="vi"?"Chỉ dùng dữ liệu giả; tự đánh giá kết quả, không cấp quyền sửa/xóa/deploy khi chưa xác nhận.":"Use synthetic data; review all changes, never approve writes/deletions/deploys without authorization.")+'</p>'
  +'<pre id="practice-prompt">'+esc((locale==="vi"?"Hãy hướng dẫn tôi hoàn thành bài tập với dữ liệu GIẢ LẬP, không truy cập tài khoản hay bí mật thực.":"Guide me through this exercise with SYNTHETIC data, not real accounts or secrets.")
     +'\n'+obj.title+'\n'+obj.purpose+'\n'+obj.exercise.map((x,i)=>(i+1)+'. '+x).join('\n')
     +'\n'+(locale==="vi"?"Đầu ra mong muốn: ":"Expected outcome: ")+obj.outcome
     +'\n'+(locale==="vi"?"Giải thích từng bước, yêu cầu kiểm tra, điểm rủi ro, và kết quả cần tự xác minh.":"Explain the steps, test assertions, risks, and which outputs I must verify myself."))+'</pre>'
  +'<button type="button" class="button tiny" data-copy-practice="'+esc(id)+'">'+(locale==="vi"?"Sao chép prompt ↗":"Copy prompt ↗")+'</button></details>'
  +'<h3>'+t("quiz")+'</h3><p>'+esc(quiz.question)+'</p>'
  +'<div class="lesson-list">'+quiz.options.map((option,i)=>
    '<label class="confirm-row quiz-option">'
    +'<input type="radio" name="quiz-answer" value="'+i+'" '+(chosen===i?"checked":"")+'><span>'+esc(option)+'</span></label>').join("")+'</div>'
  +'<div class="card-actions"><button class="button tiny" id="check-quiz" type="button" data-quiz-check="'+esc(id)+'">'+t("quizCheck")+'</button></div>'
  +'<div class="field-feedback" id="quiz-feedback" aria-live="polite"></div>'
  +'<h3>'+t("note")+'</h3><textarea id="lesson-note" data-lesson-note="'+esc(id)+'" class="evidence-input" rows="2" maxlength="600" placeholder="…">'+esc(existingNote)+'</textarea>'
  +'<h3>'+t("source")+'</h3>'+lesson.sources.filter(C.safeUrl).map(url=>
    '<a href="'+esc(url)+'" target="_blank" rel="noopener noreferrer">'+esc(url)+' ↗</a>').join("<p></p>")
  +'<p><a href="../codex-academy/#lab" target="_blank" rel="noopener noreferrer">'+t("openAcademy")+' ↗</a></p>';
 if(prereq.missing.length)html+='<div class="notice">'+t("blocked")+prereq.missing.join(", ")+'</div>';
 html+='<label class="confirm-row"><input id="lesson-confirm" type="checkbox"><span>'+t("completeConfirm")+'</span></label>'
 +'<div class="dialog-actions"><button class="button '+(completed?"outline":"primary")+'" type="button" data-lesson-done="'+esc(id)+'">'
 +(completed?t("undo"):t("mark"))+' ✓</button><button class="button secondary" type="button" data-action="close-dialog">✕</button></div>';
 $("lesson-dialog-body").innerHTML=html;
 $("lesson-dialog").showModal();
}
function closeDialog(){if($("lesson-dialog").open)$("lesson-dialog").close();activeLesson=null}
function completeLesson(id){
 const lesson=data.lessons.find(x=>x.id===id);if(!lesson)return;
 if(state.done.includes(id)){
  state.done=state.done.filter(x=>x!==id);
  save(true);closeDialog();render();return;
 }
 const allowed=plan.lessons.some(x=>x.id===id)?C.canMarkComplete(plan,state,id):
  {allowed:lesson.prerequisites.every(x=>state.done.includes(x)),
   missing:lesson.prerequisites.filter(x=>!state.done.includes(x))};
 const stepsDone=new Set(state.steps?.[id]||[]);
 if(!allowed.allowed||stepsDone.size!==lesson[locale].exercise.length||
    lastQuiz[id]!==lesson[locale].quiz.answer||!$("lesson-confirm")?.checked){
  note((locale==="vi"?"Cần hoàn thành các bước thực hành, quiz và xác nhận. ":"Complete practice steps, quiz and confirmation. ")+
       (allowed.missing.join(", ")));return;
 }
 state.done=[...new Set([...state.done,id])];
 save(true);closeDialog();render();
}
function updateEvidence(){
 const input=$("capstone-url");if(!input)return;
 const val=input.value.trim(),valid=C.safeUrl(val);
 const feedback=$("url-validation");
 input.setAttribute("aria-invalid",String(Boolean(val&&!valid)));
 feedback.className="field-feedback "+(valid?"valid":"invalid");
 feedback.textContent=valid?t("evidenceValid"):val?t("evidenceInvalid"):t("evidenceMissing");
 if(valid||!val){if(val)state.artifacts.capstone=val;else delete state.artifacts.capstone;save();}
}
async function importBackup(file){
 if(!file||file.size>300000)throw Error("File exceeds 300 KB");
 const json=JSON.parse(await file.text());
 state=C.validateState(json,data);
 state.prefs.locale=locale;
 plan=C.buildPlan(data,state.prefs);
 syncSelectors();save();
 render();note(t("imported"));
}
function toggleTheme(){theme=theme==="dark"?"light":"dark";document.documentElement.dataset.theme=theme;$("theme-toggle").textContent=theme==="dark"?"☼":"◐";$("theme-toggle").setAttribute("aria-label",theme==="dark"?"Switch to light theme":"Switch to dark theme");prefSave();note(t("saved"))}
function prefSave(){try{localStorage.setItem("codex-path-ui-v1",JSON.stringify({theme,locale}))}catch{}}
function bind(){
 document.addEventListener("click",e=>{
  const tab=e.target.closest("[data-tab]");
  if(tab&&!tab.closest("nav")&&tab.tagName==="BUTTON"){
   location.hash="#"+tab.dataset.tab;
   $("sidebar").classList.remove("open");return;
  }
  const lesson=e.target.closest("[data-lesson]");
  if(lesson){openLesson(lesson.dataset.lesson);return}
  const career=e.target.closest("[data-career]");
  if(career){replan({...state.prefs,career:career.dataset.career});return}
  const copy=e.target.closest("[data-copy-practice]");
  if(copy){
    const sample=$("practice-prompt")?.textContent||"";
    if(navigator.clipboard&&sample)navigator.clipboard.writeText(sample)
      .then(()=>note(locale==="vi"?"Đã sao chép prompt mẫu.":"Practice prompt copied."))
      .catch(()=>note(locale==="vi"?"Chọn nội dung prompt rồi sao chép thủ công.":"Select and copy the prompt manually."));
    else note(locale==="vi"?"Chọn nội dung prompt rồi sao chép thủ công.":"Select and copy the prompt manually.");
    return;
  }
  const quiz=e.target.closest("[data-quiz-check]");
  if(quiz){
   const checked=document.querySelector('input[name="quiz-answer"]:checked');
   const l=data.lessons.find(x=>x.id===quiz.dataset.quizCheck);
   if(!checked){text("quiz-feedback",t("quizPrompt"));return}
   const choice=Number(checked.value);
   lastQuiz[l.id]=choice;
   text("quiz-feedback",choice===l[locale].quiz.answer?t("correct"):t("wrong")+" "+l[locale].quiz.explanation);
   $("quiz-feedback").className="field-feedback "+(choice===l[locale].quiz.answer?"valid":"invalid");
   return;
  }
  const done=e.target.closest("[data-lesson-done]");
  if(done){completeLesson(done.dataset.lessonDone);return}
  const action=e.target.closest("[data-action]");
  if(!action)return;
  switch(action.dataset.action){
  case "create-plan":$("profile-form").requestSubmit();break;
  case "export-md":download("codex-path-roadmap-"+state.prefs.career+".md",C.markdown(plan,state),"text/markdown;charset=utf-8");break;
  case "export-json":download("codex-path-private-backup.json",JSON.stringify(state,null,2));break;
  case "import-json":$("backup-import").click();break;
  case "reset":
   if(confirm(t("resetConfirm"))){
    const prev=state.prefs;state=C.initialState(prev);save();render();note(t("saved"))
   }
   break;
  case "academy-import":{
   const academy=lsRead(ACADEMY_KEY);
   if(!academy||!Array.isArray(academy.completed)){note(t("academyNone"));break}
   const allowed=new Set(data.lessons.map(x=>x.id));
   let added=0;
   for(const id of academy.completed)if(allowed.has(id)&&!state.done.includes(id)){state.done.push(id);added++}
   save();render();note(t("academyAdded")+added);break;
  }
  case "close-dialog":closeDialog();break;
  }
 });
 $("profile-form").addEventListener("submit",e=>{
  e.preventDefault();
  if(!validateProfile())return;
  replan({career:$("career").value,level:$("level").value,hours:Number($("hours").value),goalWeeks:Number($("weeks").value),locale});
  location.hash="#path";
 });
 for(const id of ["career","level","hours","weeks"])$(id).addEventListener("input",()=>{
  text("weeks-output",$("weeks").value+" "+t("weeks"));validateProfile();
 });
 $("locale-toggle").addEventListener("click",()=>{
  locale=locale==="vi"?"en":"vi";state.prefs.locale=locale;plan=C.buildPlan(data,state.prefs);
  prefSave();labels();initSelectors();render();save();
 });
 $("theme-toggle").addEventListener("click",toggleTheme);
 $("menu-toggle").addEventListener("click",()=>{
  const on=$("sidebar").classList.toggle("open");$("menu-toggle").setAttribute("aria-expanded",String(on));
 });
 $("sidebar").addEventListener("click",e=>{
  if(e.target.closest(".sidebar-nav a")){$("sidebar").classList.remove("open");$("menu-toggle").setAttribute("aria-expanded","false")}
 });
 document.addEventListener("input",e=>{
  if(e.target?.id==="lab-search"){filters.q=e.target.value;const cursor=e.target.selectionStart;render();const el=$("lab-search");el?.focus();try{el?.setSelectionRange(cursor,cursor)}catch{}}
  if(e.target?.id==="capstone-url")updateEvidence();
  if(e.target?.id==="private-proof"){
    const text=e.target.value.slice(0,500);
    state.privateProof=text;
    const feedback=$("private-proof-status");
    if(feedback){feedback.classList.toggle("valid",text.trim().length>=35);feedback.classList.toggle("invalid",text.trim().length<35);}
    save();
  }
 });
 document.addEventListener("change",e=>{
  if(e.target?.dataset?.lessonStep){
    const id=e.target.dataset.lessonStep,ix=Number(e.target.dataset.stepIndex);
    const l=data.lessons.find(x=>x.id===id);
    if(l&&Number.isInteger(ix)&&ix>=0&&ix<l[locale].exercise.length){
      state.steps||={};
      const before=new Set(state.steps[id]||[]);
      if(e.target.checked)before.add(ix);else before.delete(ix);
      state.steps[id]=[...before].sort((a,b)=>a-b);save();
      text("steps-feedback",before.size+"/"+l[locale].exercise.length+" "+(locale==="vi"?"bước hoàn thành":"steps complete"));
    }
    return;
  }
  if(e.target?.id==="lab-level"){filters.level=e.target.value;render()}
  if(e.target?.id==="capstone-confirm"){state.capstoneConfirmed=e.target.checked;save();render()}
  if(e.target?.dataset?.lessonNote){const id=e.target.dataset.lessonNote;state.notes[id]=e.target.value.slice(0,600);save(true)}
 });
 $("backup-import").addEventListener("change",async e=>{
  try{if(e.target.files?.[0])await importBackup(e.target.files[0])}
  catch(err){note(t("invalidBackup")+String(err.message).slice(0,100))}
  e.target.value="";
 });
 $("close-dialog").addEventListener("click",closeDialog);
 $("lesson-dialog").addEventListener("click",e=>{if(e.target===$("lesson-dialog"))closeDialog()});
 window.addEventListener("hashchange",()=>{render()});
}
async function bootstrap(){
 try{
  const r=await fetch("./data/codex-path.json",{cache:"no-cache"});
  if(!r.ok)throw Error("HTTP "+r.status);
  const obj=await r.json();
  C.validateCatalog(obj);data=obj;
  let raw=null;try{raw=localStorage.getItem(KEY)}catch{}
  const restored=C.restoreState(raw,data);state=restored.state;
     window.CodexStartScreen.configure({onApplyPath:({career,level})=>{
     replan({...state.prefs,career,level});
     location.hash="#path";
   }});
   window.CodexGuideScreen.configure({
   openLesson:id=>openLesson(id),
   start:()=>{location.hash="#start"},
   roadmap:()=>{location.hash="#path"}
  });
  // Mapping the dated official index must never block the core learning path.
  window.CodexGuideScreen.load()
   .then(()=>{if((location.hash||"").startsWith("#guide"))render()})
   .catch(err=>console.warn("Reference index not available:",String(err.message).slice(0,150)));
  const savedUI=lsRead("codex-path-ui-v1")||{};
  locale=savedUI.locale==="en"?"en":state.prefs.locale;
  theme=savedUI.theme==="light"?"light":"dark";
  state.prefs.locale=locale;
  plan=C.buildPlan(data,state.prefs);
  initSelectors();labels();bind();render();
  if(restored.corrupt){
   // Keep the unreadable value for inspection, then save the fresh state so the next load is clean.
   try{localStorage.setItem(KEY+".corrupt",String(raw).slice(0,200000))}catch{}
   save();
   note(t("storageRecovered"),9000);
  }
 }catch(err){
  $("content").replaceChildren();
  const container=document.createElement("div");container.className="notice";
  container.textContent="Cannot load Codex Path curriculum: "+String(err.message)+". Serve over HTTP and check the local dataset.";
  $("content").append(container);
  console.error("Codex Path startup failed",err);
 }
}
bootstrap();
})();

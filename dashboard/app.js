/* Codex Ambassador Mission Control — local-first, dependency free.
 * All application fields are editable drafts; no external auto-submission.
 */
(function(){
"use strict";
const DATA=window.AMB_DATA, BASE=window.AMB_BASE_IDEAS||[], EXTRA=window.AMB_EXTRA_IDEAS||[], L=window.AMB_LOGIC, PROJECTS=window.AMB_WORKSPACE_MAP||[];
const KEY="codex-ambassador-dashboard-v2", PREF="amb-ui-prefs-v2";
const $=id=>document.getElementById(id), esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const a=(label,url,css="inline-link")=>L.RE_URL.test(url)?'<a class="'+css+'" href="'+esc(url)+'" target="_blank" rel="noopener noreferrer">'+esc(label)+' ↗</a>':esc(label);
const fieldByKey=k=>DATA.fields.find(f=>f.key===k);
let app=L.initialState(DATA,BASE,EXTRA);
let prefs={theme:document.documentElement.dataset.nuiTheme||"light",motion:!document.documentElement.classList.contains("nui-motion-off"),notify:false};
try{const stored=localStorage.getItem(KEY);if(stored)app=L.validateImported(JSON.parse(stored),DATA,BASE,EXTRA)}catch(err){console.warn("Backup could not load",err)}
try{Object.assign(prefs,JSON.parse(localStorage.getItem(PREF)||"{}"))}catch{}
// Verified public source registry wins over an obsolete browser-local status.
for(const project of PROJECTS){if(project.status==="public"){const linked=app.ideas.find(x=>x.id===project.id);if(linked)linked.status="public"}}
// Owner-only analysis (dashboard/private-insights.js); absent and stripped in the public build.
const PRIV=DATA.meta.publicBuild?null:(window.AMB_PRIVATE||null);
// Evidence-backed milestones win over a stale browser-local tick.
for(const m of DATA.milestones){if(m.done&&m.proof)app.tasks[m.id]=true}

let route="overview",ideasFilter={q:"",category:"",stage:"",speed:"",priority:"",sort:"priority"},ideaShown=24,formSearch="";
const labels={overview:"Tổng quan",application:"Form ứng tuyển",ideas:"Idea Lab",portfolio:"Portfolio & Demo",timeline:"Deadline & Tasks",video:"Video Studio",strategy:"Chiến lược 6 tháng",settings:"Dữ liệu & Thiết lập",workspace:"Bản đồ dự án"};
const categories=[...new Set(app.ideas.map(i=>i.category))].sort();
const steps=[
 {id:"s1",time:"00–05s",title:"Face camera",detail:"Giới thiệu con người thật và chuyên môn; không nói nơi sống. Không dùng chức danh Ambassador khi chưa được chọn."},
 {id:"s2",time:"05–12s",title:"Live demo",detail:"Chọn scenario trong Agent Ops Clinic, làm rõ đây là simulation."},
 {id:"s3",time:"12–21s",title:"Approval gate",detail:"Thử publish bị chặn vì approval hoặc budget; khắc phục có chủ đích."},
 {id:"s4",time:"21–26s",title:"Real tests",detail:"Hiển thị lệnh node --test với kết quả thật trên Mac, không dựng green test giả."},
 {id:"s5",time:"26–31s",title:"Community pledge",detail:"Kêu gọi chia sẻ bộ học tập song ngữ và tiếp nhận phản hồi community."}
];
const scriptEN="Hi, I'm a Codex builder, a Vietnamese-speaking AI systems builder. I use Codex to turn complex workflows into tested, practical tools. This is Agent Ops Clinic: a bilingual lab where builders learn delegation, budget limits, and human approvals. If selected as a Codex Ambassador, I'll share reproducible projects and hands-on lessons for Vietnamese and global communities, and bring honest feedback from builders back to OpenAI.";
const scriptVI="Xin chào, mình là người xây dựng Codex, người xây dựng hệ thống AI nói tiếng Việt. Mình dùng Codex để biến ý tưởng thành sản phẩm có kiểm thử, kiểm soát ngân sách và phê duyệt con người. Đây là Agent Ops Clinic, phòng thực hành song ngữ ai cũng có thể chạy và học theo. Nếu trở thành Đại sứ Codex, mình sẽ chia sẻ mã nguồn, hướng dẫn thực hành và phản hồi thật từ cộng đồng tới OpenAI.";
const saved=()=>{app.lastSaved=new Date().toISOString();try{localStorage.setItem(KEY,JSON.stringify(app))}catch(e){toast("Trình duyệt không lưu được: hãy Export backup ngay.",true)}};
const prefSave=()=>{try{localStorage.setItem(PREF,JSON.stringify(prefs))}catch{}};
function toast(message,error=false){const x=document.createElement("div");x.className="toast "+(error?"error":"success");x.textContent=message;$("toastRegion").append(x);setTimeout(()=>x.remove(),4200)}
function download(name,body,type="application/json"){const blob=new Blob([body],{type});const u=URL.createObjectURL(blob);const el=document.createElement("a");el.href=u;el.download=name;el.click();setTimeout(()=>URL.revokeObjectURL(u),1000)}
async function copy(s){try{await navigator.clipboard.writeText(s);toast("Đã sao chép.")}catch{const t=document.createElement("textarea");t.value=s;t.style.position="fixed";document.body.append(t);t.select();const ok=document.execCommand("copy");t.remove();toast(ok?"Đã sao chép.":"Không thể copy; hãy Export JSON.",!ok)}}
function pct(n,d){return Math.round(n/(d||1)*100)}
function statusChip(x){const status={"verified":"Đã xác minh","draft":"Nháp • duyệt","missing":"Điền sau","blocked":"Cần minh chứng","confirmed":"Đã tự xác nhận"};return '<span class="status-chip '+esc(x)+'">'+(status[x]||esc(x))+'</span>'}
function head(kicker,title,sub,actions=""){return '<div class="view-head"><div class="view-subtitle"><div class="eyebrow">'+esc(kicker)+'</div><h1>'+esc(title)+'</h1><p>'+esc(sub)+'</p></div><div class="view-actions">'+actions+'</div></div>'}
function metric(name,value,sub,width,ico){return '<article class="metric"><div class="metric-top"><span class="metric-label">'+esc(name)+'</span><span class="metric-icon" aria-hidden="true">'+ico+'</span></div><strong class="metric-number">'+esc(value)+'</strong><span class="metric-sub">'+esc(sub)+'</span><div class="metric-bar"><i style="width:'+Math.max(0,Math.min(100,width))+'%"></i></div></article>'}
function taskCard(m){return '<label class="check-row"><input type="checkbox" data-task-id="'+esc(m.id)+'" '+(app.tasks[m.id]?"checked":"")+'><span><strong>'+esc(m.label)+'</strong><span>'+esc(m.day)+' · '+esc(m.group)+(m.proof?' · '+esc(m.proof):'')+'</span></span></label>'}
function blockerList(audit,max=5){return audit.issues.length?audit.issues.slice(0,max).map(x=>'<div class="risk-row"><div><strong>'+esc(x.label)+'</strong><span>'+esc(x.message)+'</span></div></div>').join(""):'<div class="notice success"><strong>Form hợp lệ tại chỗ.</strong> Cần kiểm tra link bên ngoài, video và tư cách ứng viên bằng mắt trước khi gửi thật.</div>'}
function progressHTML(){const done=DATA.milestones.filter(m=>app.tasks[m.id]).length;return '<div class="progress-row"><strong>'+done+'/'+DATA.milestones.length+' milestones</strong><span class="muted">'+pct(done,DATA.milestones.length)+'% completed</span></div><div class="progress-track"><i style="width:'+pct(done,DATA.milestones.length)+'%"></i></div>'}
function renderOverview(){
 const audit=L.auditForm(DATA.fields,app.values,app.statuses);
 const done=DATA.milestones.filter(m=>app.tasks[m.id]).length;
 const published=PROJECTS.filter(x=>x.status==="public").length;
 const remaining=DATA.milestones.filter(m=>!app.tasks[m.id]);
 const hotIds=["N119","N118","N002","N094","N110","N107"];
 return '<div class="overview-compact">'
 +'<section class="hero"><div class="hero-inner"><div class="eyebrow">CODEX AMBASSADOR · MISSION CONTROL</div><h1>Build proof. <span>Earn trust.</span> Teach builders.</h1><p>Kiểm chứng sản phẩm • đưa ra bằng chứng • đóng góp học liệu cộng đồng. Mở rộng từng phần khi cần.</p><div class="hero-actions"><button class="btn" data-route="portfolio">Portfolio ↗</button><button class="btn btn-outline" data-route="application">Hồ sơ ↗</button><button class="btn btn-outline" data-route="workspace">Source map ↗</button><button class="btn btn-outline" data-route="ideas">Idea Lab ↗</button></div></div><div class="hero-symbol" aria-hidden="true">◇</div></section>'
 +'<div class="grid-4 overview-metrics">'
 +metric("Form cần duyệt",audit.ready+'/'+audit.required,audit.requiredLeft+" trường còn thiếu",pct(audit.ready,audit.required),"▤")
 +metric("Idea Lab",app.ideas.length,PROJECTS.filter(x=>x.status==="public").length+" demo đang Live",100,"✧")
 +metric("Demo public",published,"Liên kết công khai đã xác minh",pct(published,PROJECTS.length),"✓")
 +metric("Milestones",done+"/"+DATA.milestones.length,"Bấm timeline xem toàn bộ",pct(done,DATA.milestones.length),"◷")+'</div>'
 +'<section class="overview-columns">'
 +'<div class="panel overview-panel"><div class="overview-panel-head"><h2>Ưu tiên tiếp theo</h2><button class="btn btn-sm" data-route="timeline">Timeline ↗</button></div><div class="compact-task-list">'
 +remaining.slice(0,3).map(m=>'<label class="compact-task"><input type="checkbox" data-task-id="'+esc(m.id)+'"><span><strong>'+esc(m.label)+'</strong><small>'+esc(m.day)+' · '+esc(m.group)+'</small></span></label>').join('')
 +'</div><details class="overview-extra"><summary>Xem toàn bộ '+remaining.length+' việc còn lại</summary><div class="stack-list">'+remaining.map(taskCard).join("")+'</div></details></div>'
 +'<div class="panel overview-panel"><div class="overview-panel-head"><h2>Hồ sơ cần xử lý</h2><button class="btn btn-sm" data-route="application">Mở form ↗</button></div><div class="compact-risk-list">'
 +audit.issues.slice(0,3).map(x=>'<div class="compact-risk"><span aria-hidden="true">!</span><strong>'+esc(x.label)+'</strong><small>'+esc(x.message)+'</small></div>').join("")
 +'</div><details class="overview-extra"><summary>Còn '+audit.issues.length+' blockers · Xem tất cả</summary><div class="stack-list">'+blockerList(audit,10)+'</div></details></div></section>'
 +'<section class="overview-links"><div class="overview-links-heading"><strong>Quick launch &amp; source mapping</strong><button class="btn btn-sm" data-route="workspace">Toàn bộ dự án →</button></div><div class="overview-link-grid">'
 +PROJECTS.filter(x=>hotIds.includes(x.id)).map(x=>'<a class="overview-project-link" href="'+esc(x.href)+'" target="_blank" rel="noopener noreferrer"><span class="link-id">'+esc(x.id)+'</span><strong>'+esc(x.title)+'</strong><span aria-hidden="true">↗</span></a>').join('')
 +'</div></section></div>';
}
function fieldFeedback(f,value){
 const isEmpty=f.type==="checkbox"?!value:!String(value??"").trim();
 if(isEmpty)return {valid:!f.required,text:f.required?"Chưa nhập thông tin bắt buộc":"Tùy chọn, chưa nhập"};
 const failure=L.auditForm([f],{...app.values,[f.key]:value},app.statuses).issues.find(x=>x.key===f.key);
 if(failure)return {valid:false,text:failure.message};
 return {valid:true,text:f.type==="url"?"Đúng định dạng HTTPS • chưa kiểm tra trang đích":f.type==="email"?"Đúng định dạng email • chưa xác thực hộp thư":"Hợp lệ về định dạng • chưa tự xác minh nội dung"};
}
function renderField(f){
 const v=app.values[f.key];const st=app.statuses[f.key]||"missing";const id="field-"+f.key;
 const extra=f.max?' maxlength="'+f.max+'"':"";
 let control="";
 if(f.type==="textarea")control='<textarea class="form-control" id="'+id+'" data-field="'+f.key+'"'+extra+'>'+esc(v)+'</textarea>';
 else if(f.type==="select")control='<select class="form-control" id="'+id+'" data-field="'+f.key+'">'+f.options.map(o=>'<option value="'+esc(o)+'" '+(v===o?"selected":"")+'>'+(o?esc(o):"— Điền sau —")+'</option>').join("")+'</select>';
 else if(f.type==="checkbox")control='<label style="display:flex;align-items:center;gap:12px;font-size:12px"><input class="form-control" type="checkbox" id="'+id+'" data-field="'+f.key+'" '+(v?"checked":"")+'><span>Tôi đã đọc và tự nguyện xác nhận</span></label>';
 else control='<input class="form-control" type="'+f.type+'" id="'+id+'" data-field="'+f.key+'" value="'+esc(v)+'" placeholder="'+(f.type==="url"?"https://…":"Điền sau")+'">';
 const wide=f.type==="textarea"||f.type==="checkbox";
 const feedback=fieldFeedback(f,v);
 return '<div class="field-card '+(wide?"wide":"")+'" id="wrap-'+f.key+'"><div class="field-label"><label for="'+id+'">'+esc(f.label)+(f.required?' <span class="req">*</span>':'')+'</label>'+statusChip(st)+'</div>'+control+'<div class="field-live-status '+(feedback.valid?"valid":"invalid")+'" id="validation-'+f.key+'" role="status" aria-live="polite">'+esc(feedback.text)+'</div>'+(f.hint?'<div class="field-hint">'+esc(f.hint)+'</div>':'')+'<div class="field-footer"><span class="char-counter" data-counter="'+f.key+'">'+(f.max?([...String(v)].length)+' / '+f.max+' ký tự':'Local draft · '+(f.required?"Bắt buộc":"Tùy chọn"))+'</span><span class="field-actions"><button type="button" data-copy="'+f.key+'">Copy</button><button type="button" data-verify="'+f.key+'">Tự xác minh ✓</button></span></div></div>'
}
function renderApplication(){
 const audit=L.auditForm(DATA.fields,app.values,app.statuses);
 const groups=["Identity","Experience","Links","Evidence","Declarations"];
 const note='<div class="notice"><strong>Chỉ là bản nháp local.</strong> Những trường “đã tự xác minh” là xác nhận của mày, không phải OpenAI. Không có auto-fill/submit sang form chính thức (trang bên thứ ba không cho truy cập DOM qua dashboard). Cần copy thủ công trước khi nhấn Submit.</div>';
 return head("APPLICATION EDITOR","Form ứng tuyển — prefilled","Đã dựng theo đúng các trường chính thức. Có đếm ký tự 500, kiểm tra URL, copy từng trường và lưu nháp tự động.",'<button class="btn" data-action="copy-form">Copy toàn bộ</button><button class="btn btn-primary" data-action="open-application">Mở form chính thức ↗</button>')
 +note+'<div class="grid-3">'+metric("Required fields",audit.ready+'/'+audit.required,audit.requiredLeft+" trường chưa hợp lệ",pct(audit.ready,audit.required),"▤")+metric("Risks",audit.issues.length,"Bao gồm evidence gate nội bộ",Math.max(0,100-audit.issues.length*13),"!")+metric("Human verification",audit.verified,"Xác minh theo hồ sơ và liên kết thật",pct(audit.verified,DATA.fields.length),"✓")+'</div>'
 +'<div class="section-title"><h2>Trường còn thiếu / cần sửa</h2><button class="btn btn-sm" data-action="scroll-first-blocker">Đến blocker đầu tiên</button></div><div class="panel"><div class="stack-list">'+blockerList(audit,6)+'</div></div>'
 +groups.map(g=>'<section class="form-section"><div class="form-section-header"><h2>'+esc(g)+'</h2><span class="muted small">'+DATA.fields.filter(f=>f.section===g).length+' trường</span></div><div class="form-grid">'+DATA.fields.filter(f=>f.section===g).map(renderField).join("")+'</div></section>').join("")
 +'<div class="section-title"><h2>Ready to submit?</h2></div><div class="panel">'+(audit.gateOpen?'<div class="notice success">Các trường cơ bản hợp lệ; vẫn phải kiểm tra khả năng xem link, video và Terms trước khi thực sự nộp.</div>':'<div class="notice"><strong>CHƯA SẴN SÀNG.</strong> '+audit.issues.length+' blocker, không đánh dấu nộp thay người dùng.</div>')+'<button class="btn btn-primary" data-action="open-application">Mở OpenAI form ↗</button></div>';
}


// Release proof is authoritative. Browser-entered "public" labels are not verification.
const P0_IDS=new Set(["N119","N118","O001","N002","N003","O002","O004","N071","N074"]);
const P1_IDS=new Set(["N006","N019","N058","N065","N078","N094","N097","N101","N104","N106","N107","N108","N110","N111","N112","N120","O003","N054","N057","N060","N073","N076","N081","N086"]);
const VERIFIED_IDS=new Set(PROJECTS.filter(p=>p.status==="public"&&p.href).map(p=>p.id));
const STAGE_LABEL={backlog:"Chưa xây",shortlist:"Đã chọn",building:"Đang làm",tested:"Đã test",public:"Public (tự ghi)"};
function priorityFor(i){
 if(P0_IDS.has(i.id))return "P0";
 if(P1_IDS.has(i.id))return "P1";
 if(i.priority==="P0"||i.priority==="P1"||i.priority==="P2")return i.priority;
 return L.scoreIdea(i)>=82&&Number(i.hours)<=4?"P1":"P2";
}
function verifiedProject(i){return PROJECTS.find(p=>p.id===i.id&&p.status==="public"&&p.href)||null}
function ideaEvidenceState(i){return VERIFIED_IDS.has(i.id)?"deployed":i.status==="public"?"self-reported":i.status}
function filteredIdeas(){
 let arr=app.ideas.filter(i=>(!ideasFilter.category||i.category===ideasFilter.category)
  &&(!ideasFilter.stage||(ideasFilter.stage==="public"?!!verifiedProject(i):ideasFilter.stage==="unverified"?i.status==="public"&&!verifiedProject(i):i.status===ideasFilter.stage))
  &&(!ideasFilter.priority||priorityFor(i)===ideasFilter.priority)
  &&(!ideasFilter.speed||(ideasFilter.speed==="fast"?Number(i.hours)<=4:Number(i.hours)>4)));
 if(ideasFilter.q){
  const q=ideasFilter.q.trim().toLocaleLowerCase();
  arr=arr.filter(i=>[i.id,i.name,i.category,i.mvp,i.audience,i.acceptance||"",i.origin||"",priorityFor(i)].join(" ").toLocaleLowerCase().includes(q));
 }
 const t={P0:0,P1:1,P2:2},s={deployed:0,tested:1,building:2,shortlist:3,backlog:4,"self-reported":5};
 const compare=(a,b)=>ideasFilter.sort==="effort"?Number(a.hours)-Number(b.hours):
   ideasFilter.sort==="name"?a.name.localeCompare(b.name):
   ideasFilter.sort==="impact"?Number(b.impact||0)-Number(a.impact||0):
   ideasFilter.sort==="score"?L.scoreIdea(b)-L.scoreIdea(a):
   t[priorityFor(a)]-t[priorityFor(b)] || s[ideaEvidenceState(a)]-s[ideaEvidenceState(b)] ||
    L.scoreIdea(b)-L.scoreIdea(a) || a.id.localeCompare(b.id);
 return arr.sort(compare);
}
function renderIdea(i){
 const p=verifiedProject(i),priority=priorityFor(i),evidence=ideaEvidenceState(i);
 const status=p?"Live · HTTPS verified":evidence==="self-reported"?"Public chưa kiểm chứng":STAGE_LABEL[i.status]||i.status;
 return '<article class="idea-card idea-card-interactive" tabindex="0" data-idea-open="'+esc(i.id)+'" aria-label="Xem chi tiết ý tưởng '+esc(i.id)+' — '+esc(i.name)+'">'
  +'<div class="card-top"><span class="idea-number">#'+esc(i.id)+'</span><span class="pill prio-'+priority.toLowerCase()+'">'+priority+'</span>'
  +'<span class="pill '+(p?"ok":i.status==="building"?"warn":"blue")+'">'+esc(status)+'</span><span class="pill blue">'+esc(i.category)+'</span></div>'
  +'<h3>'+esc(i.name)+'</h3><p>'+esc(i.mvp)+'</p>'
  +'<div class="idea-foot"><span class="priority">'+L.scoreIdea(i)+'/100 · '+esc(i.hours)+'h dự kiến</span>'
  +'<button type="button" class="idea-detail-action" data-idea-detail="'+esc(i.id)+'">Xem chi tiết ↗</button>'
  +(p?'<a class="btn btn-sm" href="'+esc(p.href)+'" target="_blank" rel="noopener noreferrer">Demo ↗</a>':'')
  +'<select aria-label="Trạng thái làm việc '+esc(i.name)+'" data-idea-stage="'+esc(i.id)+'">'
  +["backlog","shortlist","building","tested","public"].map(v=>'<option value="'+v+'"'+(i.status===v?" selected":"")+'>'+STAGE_LABEL[v]+'</option>').join("")
  +'</select></div></article>';
}
function renderIdeas(){
 const shown=filteredIdeas(),cards=shown.slice(0,ideaShown),deployed=PROJECTS.filter(p=>p.status==="public"&&p.href).length;
 const counts={P0:0,P1:0,P2:0};for(const i of app.ideas)counts[priorityFor(i)]++;
 const options=(values,current)=>values.map(v=>'<option value="'+esc(v[0])+'"'+(current===v[0]?' selected':'')+'>'+esc(v[1])+'</option>').join('');
 return head("IDEA COMMAND CENTER","Idea Lab · "+app.ideas.length+" ý tưởng",
  "Bấm bất kỳ thẻ để xem chi tiết · P0 là ưu tiên hồ sơ, không phải xác suất trúng tuyển. Trạng thái demo dựa vào danh mục triển khai đã đối soát.",
  '<button class="btn btn-sm" data-action="focus-p0">P0 cần xử lý</button><button class="btn btn-sm" data-route="workspace">Dự án & source ↗</button><button class="btn btn-sm" data-action="export-shortlist">Export</button><button class="btn btn-primary" data-action="add-idea">+ Idea</button>')
 +'<div class="idea-kpi-strip" role="group" aria-label="Thống kê idea">'
 +'<span><strong>'+app.ideas.length+'</strong> Tổng idea</span>'
 +'<span><strong>'+deployed+'</strong> Live HTTPS</span>'
 +'<span><strong>'+counts.P0+'</strong> P0 ưu tiên</span>'
 +'<span><strong>'+app.ideas.filter(i=>i.status==="building").length+'</strong> Đang xây</span>'
 +'<span><strong>'+app.ideas.filter(i=>i.status==="tested").length+'</strong> Đã test (chưa deploy)</span></div>'
 +'<div class="filterbar idea-filterbar">'
 +'<input id="ideaSearch" type="search" placeholder="Tìm ID, tên, audience, chức năng..." aria-label="Tìm ý tưởng" value="'+esc(ideasFilter.q)+'">'
 +'<select id="priorityFilter" aria-label="Lọc ưu tiên">'+options([["","Tất cả P0/P1/P2"],["P0","P0 · Deadline"],["P1","P1 · Giá trị"],["P2","P2 · Khám phá"]],ideasFilter.priority)+'</select>'
 +'<select id="categoryFilter" aria-label="Lọc nhóm">'+options([["","Tất cả nhóm"],...categories.map(c=>[c,c])],ideasFilter.category)+'</select>'
 +'<select id="stageFilter" aria-label="Lọc trạng thái">'+options([["","Mọi trạng thái"],["public","Đã deploy · HTTPS"],["unverified","Public tự ghi · chưa kiểm"],["tested","Đã test"],["building","Đang làm"],["shortlist","Đã chọn"],["backlog","Chưa xây"]],ideasFilter.stage)+'</select>'
 +'<select id="speedFilter" aria-label="Lọc thời gian">'+options([["","Mọi thời lượng"],["fast","≤4h MVP"],["slow",">4h MVP"]],ideasFilter.speed)+'</select>'
 +'<select id="sortFilter" aria-label="Sắp xếp">'+options([["priority","Ưu tiên P0 → P2"],["score","Score ↓"],["effort","Giờ ↑"],["impact","Impact ↓"],["name","Tên A–Z"]],ideasFilter.sort)+'</select>'
 +'<button class="btn btn-sm" data-action="reset-filters">Bỏ lọc</button></div>'
 +'<div class="section-title idea-section-title"><h2>Danh sách / sản phẩm</h2><span id="ideaCount">'+cards.length+' / '+shown.length+' kết quả · '+app.ideas.length+' idea</span></div>'
 +'<div class="idea-grid" id="ideaGrid">'+(cards.length?cards.map(renderIdea).join(""):'<div class="empty-state">Không có idea khớp bộ lọc. Bấm Bỏ lọc.</div>')+'</div>'
 +'<button id="ideaMore" class="btn idea-load-more" data-action="load-more-ideas" type="button"'+(shown.length<=ideaShown?' hidden':'')+'>Xem thêm '+Math.min(24,shown.length-ideaShown)+' / '+(shown.length-ideaShown)+' ý tưởng ↓</button>'
 +'<details class="idea-method"><summary>Quy tắc ưu tiên & cách xác minh</summary><p><b>P0</b>: demo chủ lực, tài liệu cho người học, hồ sơ/video/community cần trước hạn. <b>P1</b>: bài thực hành hoặc công cụ giúp cộng đồng học Codex. <b>P2</b>: ý tưởng mở rộng. <b>Live</b> cần demo công khai trong danh mục đối soát; tự chuyển trạng thái Public không đủ bằng chứng. Ước tính giờ và điểm chỉ là nội bộ.</p></details>';
}
const FIT_LABEL={strong:["ok","Phục vụ đơn: mạnh"],medium:["warn","Phục vụ đơn: vừa"],weak:["bad","Phục vụ đơn: yếu"]};
function listHTML(xs){return xs&&xs.length?'<ul class="insight-list">'+xs.map(x=>'<li>'+esc(x)+'</li>').join("")+'</ul>':''}
function insightHTML(id){
 const x=PRIV&&PRIV.ideas[id];if(!x)return "";
 const fit=FIT_LABEL[x.fit];
 const rows=[["Đây là gì",x.what],["Đáp ứng",x.serves],["Ngắn hạn",x.short],["Trung hạn",x.mid],["Dài hạn",x.long]].filter(r=>r[1]);
 return '<section class="private-insight" aria-label="Phân tích riêng"><div class="private-insight-head"><strong>Phân tích riêng · chỉ bạn thấy</strong>'+(fit?'<span class="pill '+fit[0]+'">'+fit[1]+'</span>':'')+(x.decision?'<span class="pill">'+esc(x.decision)+' · '+esc(x.priority)+'</span>':'')+'</div>'
  +(rows.length?'<dl class="detail-list">'+rows.map(r=>'<dt>'+r[0]+'</dt><dd>'+esc(r[1])+'</dd>').join("")+'</dl>':'<p class="small">'+esc(x.problem_audience||"")+'</p><p class="small muted">Chưa có phân tích chi tiết cho ý tưởng này (chỉ là ý tưởng, chưa xây).</p>')
  +(x.pains&&x.pains.length?'<h4>Nỗi đau giải quyết</h4>'+listHTML(x.pains):'')
  +(x.fitWhy?'<h4>Với đơn Codex Ambassador</h4><p class="small">'+esc(x.fitWhy)+'</p>':'')
  +(x.gaps&&x.gaps.length?'<h4>Còn thiếu / rủi ro</h4>'+listHTML(x.gaps):'')
  +'<p class="small muted">Điểm audit: Codex '+esc(x.codex_relevance||"?")+'/5 · giáo dục '+esc(x.educational_value||"?")+'/5 · mức hoàn thiện '+esc(x.maturity||"?")+(x.duplicate_of?' · trùng với '+esc(x.duplicate_of):'')+'</p></section>';
}
function portfolioValueHTML(){
 if(!PRIV)return "";
 return '<div class="section-title"><h2>Giá trị từng demo · nỗi đau &amp; lợi ích</h2><span>Chỉ hiện trên dashboard riêng</span></div><div class="portfolio-grid">'+PROJECTS.map(p=>{const x=PRIV.ideas[p.id]||{},fit=FIT_LABEL[x.fit];
  return '<article class="portfolio-card value-card"><div class="card-top"><span class="pill blue">'+esc(p.id)+'</span>'+(fit?'<span class="pill '+fit[0]+'">'+fit[1]+'</span>':'')+'</div><h3>'+esc(p.title)+'</h3><p>'+esc(x.serves||x.problem_audience||"")+'</p>'
  +(x.pains&&x.pains.length?'<div class="small"><strong>Giải quyết</strong></div>'+listHTML(x.pains.slice(0,3)):'')
  +'<div class="card-actions"><button class="btn btn-sm btn-primary" data-idea-detail="'+esc(p.id)+'">Phân tích đầy đủ</button><a class="btn btn-sm" href="'+esc(p.href)+'" target="_blank" rel="noopener noreferrer">Mở demo ↗</a></div></article>'}).join("")+'</div>';
}
function winHTML(){
 const w=PRIV&&PRIV.win;if(!w||!w.verdict)return "";
 const tone={high:"ok",medium:"warn",low:"bad"}[w.level]||"warn";
 return '<div class="panel win-panel"><div class="panel-head"><div><div class="eyebrow">NHẬN ĐỊNH KHẢ NĂNG THẮNG · RIÊNG TƯ</div><h2>'+esc(w.verdict)+'</h2></div><span class="pill '+tone+'">'+esc(w.updatedAt)+'</span></div><p class="small">'+esc(w.summary)+'</p>'
  +'<div class="grid-2"><div><h4>Điểm mạnh</h4>'+listHTML(w.strengths)+'</div><div><h4>Điểm yếu</h4>'+listHTML(w.weaknesses)+'</div></div>'
  +'<div class="grid-2"><div><h4>Làm gì trong 30 giờ tới</h4>'+listHTML(w.next30h)+'</div><div><h4>Điều làm hỏng đơn</h4>'+listHTML(w.dealBreakers)+'</div></div></div>';
}
function renderPortfolio(){
 return head("REPRODUCIBLE EVIDENCE","Portfolio & Demo","Nguồn gốc code là quan trọng: fork được phân biệt rõ với repo gốc; static Pages demo chưa phải repo source công khai.",'<a class="btn btn-primary" href="../demos/agent-ops-clinic/index.html" target="_blank" rel="noopener">Mở Agent Ops Clinic ↗</a>')
 +portfolioValueHTML()
 +'<div class="notice"><strong>Fork không phải project tự viết.</strong> 9router, html-anything và vieneu-tts là fork từ upstream. Không dùng làm bằng chứng build-original trừ khi có contribution riêng được kiểm chứng.</div>'
 +'<div class="panel"><div class="panel-head"><h2>Flagship build • Agent Ops Clinic</h2><span class="status-chip verified">36/36 logic tests passed</span></div><div class="grid-2"><a href="../assets/agent-ops-cdp-desktop.png" target="_blank" rel="noopener"><img class="screenshot" src="../assets/agent-ops-cdp-desktop.png" alt="Ảnh màn hình desktop thực tế của Agent Ops Clinic"></a><a href="../assets/agent-ops-cdp-mobile.png" target="_blank" rel="noopener"><img class="screenshot" src="../assets/agent-ops-cdp-mobile.png" alt="Ảnh mobile 390 CSS pixel thực tế"></a></div><p class="small muted" style="margin:15px 0">Xây bằng Codex CLI trên Mac, source được commit cục bộ 7c1ecdf. Ba tình huống giả lập, gating phê duyệt/budget, lưu trạng thái và JSON audit. Đã test viewport; không tự nhận là agent thực hiện deployment thật.</p><div class="view-actions"><a class="btn btn-primary" href="../demos/agent-ops-clinic/index.html" target="_blank" rel="noopener">Chạy demo ↗</a><a class="btn" href="../demos/agent-ops-clinic/README.vi.md" target="_blank" rel="noopener">Tài liệu VI</a><button class="btn" data-route="application">Gắn public URL vào form</button></div></div>'
 +'<div class="section-title"><h2>New teaching MVP • N002</h2><span>24 October 2026</span></div><div class="panel"><div class="panel-head"><h2>Codex CLI Onboarding Diagnostic</h2><span class="status-chip verified">16 Python unit tests passed</span></div><p class="small muted">Bộ kiểm tra workshop đọc dữ liệu cục bộ, không gọi API; 3 fixture mô phỏng song ngữ và hướng dẫn người học xác minh terminal. Kết quả online chỉ mô phỏng và không đo tình trạng thiết bị thật.</p><div class="view-actions"><a class="btn btn-primary" href="../demos/cli-onboarding/" target="_blank" rel="noopener noreferrer">Thử workshop tương tác ↗</a><a class="btn" href="../demos/cli-onboarding/cli_onboarding.py" target="_blank" rel="noopener noreferrer">Mã CLI Python</a><a class="btn" href="../demos/cli-onboarding/README.md" target="_blank" rel="noopener noreferrer">Hướng dẫn EN/VI</a><a class="btn" href="../demos/cli-onboarding/WORKSHOP_FACILITATOR.md" target="_blank" rel="noopener noreferrer">Bộ tổ chức workshop</a></div></div>'
 +'<div class="section-title"><h2>Career flagship • N119 — Codex Path</h2><span>Original learning + career navigator</span></div>'
 +'<div class="panel"><div class="panel-head"><h2>14 learner journeys • 61 VI/EN lessons • personalized weekly plans</h2><span class="status-chip verified">26/26 Node tests passed</span></div>'
 +'<p class="small muted">Independent AI learning and career roadmap with verified source links, prerequisite-aware weekly schedule, quiz + explicit human completion, capstone proof ledger, responsive Noti-inspired UI and MIT-licensed ASCII Reveal. No OpenAI certification or employment promise.</p>'
 +'<div class="view-actions"><a class="btn btn-primary" href="../demos/codex-path/" target="_blank" rel="noopener noreferrer">Open Codex Path ↗</a>'
 +'<a class="btn" href="../demos/codex-path/README.md" target="_blank" rel="noopener noreferrer">README</a>'
 +'<a class="btn" href="../demos/codex-path/QA_REPORT.md" target="_blank" rel="noopener noreferrer">Test evidence</a>'
 +'<a class="btn" href="../demos/codex-path/PROVENANCE.md" target="_blank" rel="noopener noreferrer">Credits & licensing</a></div></div>'
 +'<div class="section-title"><h2>Flagship learning app — N118</h2><span>Independent Codex × ChatGPT Zero-to-Hero Academy</span></div>'
 +'<div class="panel"><div class="panel-head"><h2>204 official docs • 25 original bilingual lessons • 5 levels • 6 roles</h2><span class="status-chip verified">56 local unit tests passed</span></div>'
 +'<p class="small muted">Tài liệu gốc được dẫn link trực tiếp, không sao chép toàn văn. Lộ trình Zero → Pro, bộ lọc theo nghề, lesson VI/EN, quiz, checklist và tiến độ riêng trên trình duyệt. Đây là sản phẩm hướng dẫn độc lập, không phải chứng nhận hoặc sản phẩm chính thức của OpenAI.</p>'
 +'<div class="view-actions"><a class="btn btn-primary" href="../demos/codex-academy/" target="_blank" rel="noopener noreferrer">Open Zero-to-Hero Academy ↗</a><a class="btn" href="../demos/codex-academy/README.md" target="_blank" rel="noopener noreferrer">Hướng dẫn workshop</a><a class="btn" href="../demos/codex-academy/QA_REPORT.md" target="_blank" rel="noopener noreferrer">QA and provenance</a></div></div>'
 +'<div class="section-title"><h2>Parallel Codex Builds — four verified prototypes</h2><span>Each demo is an independent source folder with executable tests; browser demos use fixtures</span></div>'
 +'<div class="portfolio-grid">'+[
 ["N094","Requirements Trace Matrix","23/23 Python tests","../demos/requirements-trace/index.html","Traceability between requirements and declared test outcomes"],
 ["N097","Sanitized Bug Report Kit","43/43 Python tests","../demos/bug-report-kit/index.html","Offline synthetic log redaction with explicit review gate"],
 ["N107","PR Evidence Receipt Builder","26/26 Python tests","../demos/pr-evidence-receipt/viewer.html","Read-only local Git hashes, scopes and evidence receipts"],
 ["N101","EN–VI Code Glossary","26/26 Python tests","../demos/vn-code-glossary/index.html","24 bilingual technical terms, accent-insensitive search, keyboard support"]
 ].map(x=>'<article class="portfolio-card"><div class="card-top"><span class="pill blue">'+esc(x[0])+'</span><span class="pill ok">'+esc(x[2])+'</span></div><h3>'+esc(x[1])+'</h3><p>'+esc(x[4])+'</p><div class="card-actions"><a class="btn btn-primary" href="'+esc(x[3])+'" target="_blank" rel="noopener noreferrer">Open live demo ↗</a></div></article>').join('')+'</div>'
 +'<div class="section-title"><h2>Evidence ledger</h2></div><div class="portfolio-grid">'+DATA.portfolio.map(p=>'<article class="portfolio-card"><div class="card-top" style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap"><span class="pill '+(p.status==="tested"?"ok":p.status==="hold"?"bad":"warn")+'">'+esc(p.origin)+'</span><span class="pill">'+esc(p.kind)+'</span></div><h3>'+esc(p.name)+'</h3><p>'+esc(p.desc)+'</p><div class="muted small">Provenance: '+esc(p.owner)+'</div><div class="card-actions">'+a("Mở nguồn",p.link,"btn btn-sm")+'</div></article>').join("")+'</div>';
}
function renderWorkspace(){
 const count=PROJECTS.filter(p=>p.status==="public").length;
 return head("CROSS-LINKED WORKSPACE","Bản đồ dự án / Finder","Một mã ID nối Idea Lab → demo → docs → source. Bản public không tiết lộ đường dẫn tuyệt đối của máy Mac. Reveal dùng helper chỉ chạy trên MacBook.",'<button class="btn btn-primary" data-route="portfolio">Portfolio ↗</button>')
 +(DATA.meta.publicBuild?'':'<div class="notice"><strong>Reveal in Finder:</strong> nút mở source trên Mac mini hoặc bản staged trên MacBook, tùy máy đang sử dụng; helper local 127.0.0.1:45918 phải đang chạy trên chính máy mở dashboard. Link public không thể và không nên tự đọc thư mục máy người xem. Agent đang build sẽ chưa có link demo public.</div>')
 +'<div class="workspace-map-grid">'+PROJECTS.map(p=>'<article class="workspace-node"><div class="workspace-node-top"><span class="pill blue">'+esc(p.id)+'</span><span class="pill '+(p.status==="public"?"ok":"warn")+'">'+esc(p.status)+'</span></div><h3>'+esc(p.title)+'</h3><p class="workspace-path">'+esc(p.file)+'</p><div class="workspace-node-actions">'
 +(p.href?'<a class="btn btn-sm btn-primary" href="'+esc(p.href)+'" target="_blank" rel="noopener noreferrer">Demo ↗</a>':'<span class="pill warn">Chưa public / đang chờ agent</span>')
 +(p.docs?'<a class="btn btn-sm" href="'+esc(p.docs)+'" target="_blank" rel="noopener noreferrer">README ↗</a>':'')
 +(p.source?'<a class="btn btn-sm" href="'+esc(p.source)+'" target="_blank" rel="noopener noreferrer">GitHub ↗</a>':'<span class="pill warn" title="Demo live nhưng source chưa có trên GitHub">Source chưa public</span>')
 +'<a class="btn btn-sm" href="#ideas?idea='+esc(p.id)+'">Idea ↗</a>'
 +(DATA.meta.publicBuild?'':'<a class="btn btn-sm" href="http://127.0.0.1:45918/?item='+encodeURIComponent(p.slug)+'" target="_blank" rel="noopener noreferrer" title="Chỉ chạy nếu bật MacBook Finder helper">Reveal in Finder ↗</a>')
 +'</div></article>').join("")+'</div>';
}
function renderTimeline(){
 const done=DATA.milestones.filter(m=>app.tasks[m.id]).length;
 const cd=L.countdown(DATA.meta.targetSubmission);
 return head("SHIP / SUBMIT","Deadline & Tasks","Đặt lịch nộp 30/10/2026, sớm hơn hạn chương trình 01/11. Đã có Google Calendar popup nhắc trước 48h, 24h, 2h.",(DATA.meta.calendar?'<a class="btn btn-primary" href="'+esc(DATA.meta.calendar)+'" target="_blank" rel="noopener noreferrer">Xem Google Calendar ↗</a>':''))
 +'<div class="grid-3">'+metric("Target countdown",cd.past?"Đến hạn":cd.days+"d "+cd.hours+"h",cd.past?"Kiểm tra lịch và tình trạng nộp":"Tính theo giờ máy của bạn",cd.past?0:Math.max(0,100-cd.days*14),"◷")+metric("Tasks done",done+"/"+DATA.milestones.length,pct(done,DATA.milestones.length)+"% checklist",pct(done,DATA.milestones.length),"✓")+metric("Official close","01/11","Không công bố rõ giờ cutoff, không chờ đến ngày cuối",85,"!")+'</div>'
 +winHTML()
 +'<div class="dashboard-split"><div><div class="section-title"><h2>Execution checklist</h2><span>Manual completion</span></div><div class="panel"><div class="stack-list">'+DATA.milestones.map(taskCard).join("")+'</div>'+progressHTML()+'</div></div><div><div class="section-title"><h2>Submission gate</h2></div><div class="panel"><div class="eyebrow">FINAL REVIEW</div><p class="small muted" style="margin:9px 0 12px">Trạng thái nộp không được tự cập nhật. Chỉ đánh dấu sau khi OpenAI hiện màn hình xác nhận.</p><label class="field-card"><span class="small">Mã/screenshot xác nhận nộp đơn</span><textarea class="form-control" id="receiptInput" placeholder="Điền sau khi thực sự Submit trên OpenAI">'+esc(app.submissionReceipt)+'</textarea></label><button class="btn btn-primary" style="margin-top:12px" data-action="mark-submitted">Ghi nhận đã nộp</button>'+(app.submitted?'<div class="notice success" style="margin:12px 0 0">Đã đánh dấu người dùng tự xác nhận nộp. Không phải trạng thái lấy từ OpenAI.</div>':'<div class="mini-note" style="margin-top:12px">Chưa xác nhận nộp.</div>')+'</div><div class="section-title"><h2>Important links</h2></div><div class="panel stack-list">'+a("Form ứng tuyển",DATA.meta.application)+a("Thể lệ chính thức",DATA.meta.program)+a("Calendar deadline",DATA.meta.calendar)+'</div></div></div>';
}

function renderVideo(){
 const ready=steps.filter(x=>app.videoChecks[x.id]).length;
 return head("VIDEO PRODUCTION","Video Studio — ~30s","Storyboard, kịch bản EN/VI và tracking 5 shots. Chưa quay/đăng video thay người dùng. Link được lưu chung với trường Video URL trong form.",'<button class="btn" data-action="copy-video-en">Copy script EN</button><button class="btn btn-primary" data-action="copy-video-vi">Copy script VI</button>')
 +'<div class="grid-3">'+metric("Shot checklist",ready+"/"+steps.length,"Tiến độ thao tác thủ công",pct(ready,steps.length),"▣")+metric("Target duration","~30s","Video giới thiệu cá nhân",100,"◷")+metric("Published link",app.values.video?"Đã điền":"Điền sau",app.values.video?"Cần test incognito":"Bắt buộc trong form",app.values.video?65:5,"↗")+'</div>'
 +'<div class="grid-2"><div><div class="section-title"><h2>Story board</h2></div><div class="panel stack-list">'+steps.map(s=>'<label class="check-row"><input type="checkbox" data-video-check="'+esc(s.id)+'" '+(app.videoChecks[s.id]?"checked":"")+'><span><strong>'+esc(s.time)+' · '+esc(s.title)+'</strong><span>'+esc(s.detail)+'</span></span></label>').join("")+'</div></div><div><div class="section-title"><h2>Final video URL</h2></div><div class="panel"><label class="small" for="videoUrlQuick">Anyone with link can view (required)</label><input id="videoUrlQuick" class="form-control" type="url" placeholder="https://…" value="'+esc(app.values.video)+'" style="margin-top:10px"><div class="mini-note" style="margin-top:13px">Định dạng ngang/dọc được chấp nhận. Kiểm tra khi logout, không lộ token/terminal riêng tư, không tự nhận là Đại sứ đã được chọn.</div></div><div class="section-title"><h2>English script</h2></div><div class="script-box">'+esc(scriptEN)+'</div></div></div><div class="section-title"><h2>Vietnamese alternative</h2></div><div class="script-box">'+esc(scriptVI)+'</div>';
}
function renderStrategy(){
 const months=[
 ["M1","Approval & budget gates","Repo Agent Ops Clinic, bài hướng dẫn VN/EN, ba exercise và code review thực tế."],
 ["M2","Your first tested PR","Bốn starter templates, PR lab, build-to-review runbook."],
 ["M3","Secure agent context","Threat model, secret hygiene, prompt injection lab (chỉ tình huống an toàn)."],
 ["M4","Codex for Growth Engineering","Metadata validator, schema tests, rollback, source quality."],
 ["M5","Multilingual & inclusive builders","TTS/caption demo có bản quyền, localization QA, accessibility."],
 ["M6","From prototype to maintainable app","Hướng dẫn CI, QA, incident review và case study cộng đồng."]
 ];
 return head("AMBASSADOR POSITIONING","Community contribution plan","Đề xuất Content-led, cộng đồng nói tiếng Việt, song ngữ và tập trung khả năng người khác tái tạo dự án. Cam kết ít nhất một đóng góp hữu ích mỗi tháng.",'<button class="btn btn-primary" data-action="copy-strategy">Copy 6-month plan</button>')
 +'<div class="hero" style="min-height:170px"><div><div class="eyebrow">THE CORE NARRATIVE</div><h1 style="font-size:30px">A builder who teaches<br>how to verify the build.</h1><p>Existing fork không được nhận là tác phẩm gốc. Codex proof, hoạt động giáo dục và tính minh bạch phải đi cùng nhau.</p></div></div>'
 +'<div class="section-title"><h2>Six-month public contribution calendar</h2><span>M1–M6 tính từ lúc được nhận, không phải tháng cố định</span></div><div class="phase-grid">'+months.map(m=>'<article class="phase-card"><div class="eyebrow">'+m[0]+'</div><strong>'+esc(m[1])+'</strong><p>'+esc(m[2])+'</p></article>').join("")+'</div>'
 +'<div class="section-title"><h2>6W2H tactical brief</h2></div><div class="grid-2"><div class="panel"><div class="eyebrow">WHAT / WHY / WHO</div><p class="small muted" style="margin-top:10px">Build practical Codex workflows and explain tradeoffs to Vietnamese-speaking junior builders, marketers becoming makers, and founders. Selection depends on real portfolio, community benefit, and needs/coverage.</p></div><div class="panel"><div class="eyebrow">WHEN / WHERE / HOW / HOW MUCH</div><p class="small muted" style="margin-top:10px">Submit by Oct 30. Demo as a static, zero-paid-API educational artifact with reproducible tests; deliver a small workshop each month. Make no unsupported claim about OpenAI selection probability or guaranteed credits.</p></div></div>';
}
const SETTINGS_TITLE="Dữ liệu & Thiết lập";
function settingsOpen(){return $("detailsDialog").open&&$("dialogTitle").textContent===SETTINGS_TITLE}
function openSettings(){openDialog(SETTINGS_TITLE,'<div class="dialog-content settings-dialog">'+renderSettings()+'</div>')}
function refreshSettings(){if(settingsOpen())openSettings()}
function renderSettings(){
 return '<p class="small muted">Tất cả draft và tiến độ lưu bằng localStorage của trình duyệt này. Không gửi dữ liệu ứng tuyển tới server hoặc OpenAI.</p>'
 +'<div class="panel"><div class="setting-row"><div><strong>Giao diện Noti-inspired</strong><p>Theme sáng/tối, aurora, liquid glass, microinteractions; CSS độc lập không tải tài nguyên ngoài.</p></div><button class="btn" data-action="toggle-theme">Đổi theme</button></div>'
 +'<div class="setting-row"><div><strong>Motion / reduced motion</strong><p>Tôn trọng prefers-reduced-motion; có thể tắt toàn bộ hiệu ứng.</p></div><button class="btn" data-action="toggle-motion">'+(prefs.motion?"Đang bật":"Đã tắt")+'</button></div>'
 +'<div class="setting-row"><div><strong>Thông báo tiếng Việt trong tab này</strong><p>Notification API chỉ chạy khi trình duyệt đang mở; không có push khi đóng máy/tab. Google Calendar là lịch nhắc thật.</p></div><button class="btn" data-action="toggle-notify">'+(prefs.notify?"Đang bật":"Bật (cần quyền)")+'</button></div>'
 +'<div class="setting-row"><div><strong>Export / import</strong><p>Backup JSON chứa thông tin hồ sơ; hãy lưu ở nơi riêng tư. Import kiểm tra phiên bản và kiểu dữ liệu.</p></div><div class="view-actions"><button class="btn" data-action="export-json">Export</button><button class="btn" data-action="import-json">Import</button></div></div>'
 +'<div class="setting-row"><div><strong>Xuất hồ sơ Markdown</strong><p>Tiện dán vào Codex và copy từng câu sang trang ứng tuyển chính thức.</p></div><button class="btn" data-action="export-md">Export .md</button></div>'
 +'<div class="setting-row"><div><strong>Thông tin lưu cuối</strong><p>'+(app.lastSaved?esc(new Date(app.lastSaved).toLocaleString("vi-VN")):"Chưa có thay đổi sau khi load")+'</p></div><span class="pill blue">localStorage</span></div></div>'
 +'<div class="section-title"><h2>Hard reset</h2></div><div class="panel danger-zone"><div class="panel-head"><div><h3>Xóa dữ liệu đang lưu ở trình duyệt</h3><p class="small muted" style="margin-top:6px">Reset toàn bộ form, trạng thái ideas và checklist. Không xóa file source của dự án.</p></div><button class="btn btn-danger" data-action="reset-dashboard">Reset local state</button></div></div>';
}
function render(){
 const incoming=(location.hash||"#overview").slice(1).split("?")[0];
 if(incoming==="settings"){history.replaceState(null,"","#"+(route==="settings"?"overview":route));queueMicrotask(openSettings)}
 route=labels[incoming]&&incoming!=="settings"?incoming:(incoming==="settings"&&route!=="settings"?route:"overview");
 document.querySelectorAll("[data-route]").forEach(n=>{if(n.closest("nav"))n.classList.toggle("active",n.dataset.route===route)});
 $("headerTitle").textContent=labels[route];
 const renderer={overview:renderOverview,application:renderApplication,ideas:renderIdeas,portfolio:renderPortfolio,timeline:renderTimeline,video:renderVideo,strategy:renderStrategy,settings:renderSettings,workspace:renderWorkspace};
 $("view").innerHTML=(window.AMB_DATA.meta.publicBuild ? '<div class="notice" style="padding:7px 12px;margin-bottom:9px;font-size:10px"><strong>Public sample •</strong> Dữ liệu hồ sơ riêng tư chưa được đăng tải; dùng import backup cá nhân trên thiết bị tin cậy.</div>' : "")+renderer[route]();
 if(route==="ideas" && location.hash.includes("?idea=")){
   const ideaId=new URLSearchParams(location.hash.split("?")[1]||"").get("idea");
   if(ideaId && app.ideas.some(x=>x.id===ideaId)){
     queueMicrotask(()=>{if(!$("detailsDialog").open)ideaDialog(ideaId)});
   }
 }
 const audit=L.auditForm(DATA.fields,app.values,app.statuses);
 $("nav-form-count").textContent=audit.requiredLeft||"✓";$("nav-idea-count").textContent=app.ideas.length;
 updateCountdown();
}
function updateCountdown(){
 const c=L.countdown(DATA.meta.targetSubmission);
 $("sideCountdown").textContent=c.past?"DUE / CHECK":c.days+"d "+c.hours+"h "+c.minutes+"m";
 $("sideProgress").style.width=(c.past?100:Math.max(8,100-Math.round(c.totalMinutes/(7*1440)*100)))+"%";
}

function openDialog(title,body){
 const dlg=$("detailsDialog");$("dialogTitle").textContent=title;$("dialogBody").innerHTML=body;
 if(!dlg.open)dlg.showModal();
}
function ideaDialog(id){
 const i=app.ideas.find(x=>x.id===id);if(!i){toast("Không tìm thấy ID "+id,true);return}
 const p=verifiedProject(i),tier=priorityFor(i),ev=ideaEvidenceState(i);
 if(route==="ideas"&&location.hash!==("#ideas?idea="+encodeURIComponent(id)))history.replaceState(null,"","#ideas?idea="+encodeURIComponent(id));
 const proof=p?'<div class="idea-proof-live"><strong>ĐÃ DEPLOY · HTTPS</strong><p>Demo này có URL công khai đã được đối soát với Project Map. Kiểm thử chức năng được ghi riêng, không suy diễn từ HTTP 200.</p><div class="view-actions">'
  +'<a class="btn btn-primary" href="'+esc(p.href)+'" target="_blank" rel="noopener noreferrer">Mở demo ↗</a>'
  +(p.docs?'<a class="btn" href="'+esc(p.docs)+'" target="_blank" rel="noopener noreferrer">README ↗</a>':'')
  +(p.source?'<a class="btn" href="'+esc(p.source)+'" target="_blank" rel="noopener noreferrer">GitHub ↗</a>':'<span class="pill warn" title="Demo live nhưng source chưa có trên GitHub">Source chưa public</span>')
  +'<button class="btn" data-route="workspace">Project Map →</button></div></div>'
 :'<div class="notice"><strong>Chưa có demo công khai đã được xác minh.</strong> '+(ev==="self-reported"?"Trạng thái Public đang do trình duyệt lưu, chưa có bản triển khai trong Project Map.":"Cần source, README, test thật và URL production trước khi đổi sang đã deploy.")+'</div>';
 const steps=p?"Duy trì test hồi quy → ghi case study thực và hướng dẫn cộng đồng.":"Xác định scope → dựng bản mẫu bằng dữ liệu giả → chạy test → chuẩn bị README/source → deploy staging → đối soát HTTPS.";
 openDialog(i.id+" · "+i.name,'<div class="dialog-content idea-detail-panel">'
  +'<div class="card-top"><span class="pill prio-'+tier.toLowerCase()+'">'+tier+' · ưu tiên</span>'
  +'<span class="pill blue">'+esc(i.category)+'</span>'
  +'<span class="pill">'+L.scoreIdea(i)+'/100 điểm nội bộ</span></div>'
  +'<div class="idea-lead">'+esc(i.mvp)+'</div><dl class="detail-list">'
  +'<dt>Đối tượng</dt><dd>'+esc(i.audience)+'</dd>'
  +'<dt>Giờ MVP</dt><dd>'+esc(i.hours)+'h · ước tính, không cam kết</dd>'
  +'<dt>Tình trạng</dt><dd>'+esc(p?"Live · kiểm HTTPS":ev==="self-reported"?"Public chưa kiểm chứng":STAGE_LABEL[i.status]||i.status)+'</dd>'
  +'<dt>Mục tiêu nghiệm thu</dt><dd>'+esc(i.acceptance||"Demo hoạt động, README có bước tái hiện, tối thiểu một kiểm thử thực tế và nêu hạn chế.")+'</dd>'
  +'<dt>Nguồn ý tưởng</dt><dd>'+esc(i.origin||"Chưa ghi")+'</dd>'
  +'<dt>Hành động kế tiếp</dt><dd>'+esc(steps)+'</dd></dl>'
  +insightHTML(i.id)
  +proof
  +'<div class="view-actions idea-detail-actions"><button class="btn btn-primary" data-action="copy-idea" data-id="'+esc(i.id)+'">Copy build brief</button>'
  +(i.status==="backlog"?'<button class="btn" data-action="shortlist-modal" data-id="'+esc(i.id)+'">+ Shortlist</button>':'')
  +'<a class="btn" href="#ideas?idea='+encodeURIComponent(id)+'">Link chi tiết ↗</a></div></div>');
}
function formAsMarkdown(){
 const sections=["Identity","Experience","Links","Evidence","Declarations"];
 const lines=["# Codex Ambassador 2026 — Personal application draft","","LOCAL DRAFT • NOT SUBMITTED","", "Official form: "+DATA.meta.application,""];
 for(const section of sections){lines.push("## "+section,"");for(const f of DATA.fields.filter(x=>x.section===section)){lines.push("### "+f.label+(f.required?" *":""),"",String(app.values[f.key]||"(điền sau)"),"","Status: "+(app.statuses[f.key]||"missing"),"")}}
 lines.push("## Validation",...L.auditForm(DATA.fields,app.values,app.statuses).issues.map(x=>"- "+x.label+": "+x.message),"","Generated locally; verify all claims yourself.");
 return lines.join("\n");
}
function updateField(k,v,checkbox=false){
 const f=fieldByKey(k);if(!f)return;
 app.values[k]=v;app.statuses[k]=L.safeStatus(app.statuses[k],v,checkbox);
 saved();
 const wrap=$("wrap-"+k);
 if(wrap){
  const badge=wrap.querySelector(".status-chip");
  if(badge){const temp=document.createElement("div");temp.innerHTML=statusChip(app.statuses[k]);badge.replaceWith(temp.firstElementChild)}
  const validation=wrap.querySelector(".field-live-status");
  if(validation){
   const check=fieldFeedback(f,v);
   validation.textContent=check.text;
   validation.classList.toggle("valid",check.valid);
   validation.classList.toggle("invalid",!check.valid);
   const control=wrap.querySelector("[data-field]");
   if(control)control.setAttribute("aria-invalid",String(!check.valid));
  }
  const counter=wrap.querySelector("[data-counter]");
  if(counter&&f.max){counter.textContent=[...String(v)].length+" / "+f.max+" ký tự";counter.classList.toggle("over",[...String(v)].length>f.max)}
 }
}
function refreshIdeaGrid(){
 const shown=filteredIdeas(),cards=shown.slice(0,ideaShown);
 const c=$("ideaCount"),grid=$("ideaGrid"),more=$("ideaMore");
 if(c)c.textContent=cards.length+" / "+shown.length+" kết quả · "+app.ideas.length+" idea";
 if(more){more.hidden=shown.length<=ideaShown;more.textContent="Xem thêm "+Math.min(24,Math.max(0,shown.length-ideaShown))+" / "+Math.max(0,shown.length-ideaShown)+" ý tưởng ↓"}
 if(grid)grid.innerHTML=cards.length?cards.map(renderIdea).join(""):'<div class="empty-state">Không có idea phù hợp.</div>';
}
document.addEventListener("click",async e=>{
 const card=e.target.closest(".idea-card[data-idea-open]");
 if(card&&!e.target.closest("button,a,select,input,textarea,label")){ideaDialog(card.dataset.ideaOpen);return}
 const btn=e.target.closest("button,[data-route]");if(!btn)return;
 if(btn.dataset.route==="settings"){openSettings();$("sidebar").classList.remove("open");$("mobileMenu").setAttribute("aria-expanded","false");return}
 if(btn.dataset.route){
  location.hash=btn.dataset.route;if(location.hash.slice(1)===route)render();
  $("sidebar").classList.remove("open");$("mobileMenu").setAttribute("aria-expanded","false");
  return;
 }
 if(btn.dataset.ideaDetail){ideaDialog(btn.dataset.ideaDetail);return}
 if(btn.dataset.copy){const k=btn.dataset.copy;copy(String(app.values[k]||""));return}
 if(btn.dataset.verify){
  const k=btn.dataset.verify,f=fieldByKey(k),v=app.values[k];
  if(!f)return;
  if(f.type==="checkbox"&&!v){toast("Chỉ xác nhận sau khi tự đọc/đồng ý thật.",true);return}
  if(f.type!=="checkbox"&&!String(v||"").trim()){toast("Điền giá trị thật trước khi xác minh.",true);return}
  if(!window.confirm("Mày đã tự kiểm chứng chính xác trường: "+f.label+"? Thao tác này không có xác minh tự động từ OpenAI."))return;
  app.statuses[k]="verified";saved();render();toast("Đánh dấu tự xác minh.");return;
 }
 const action=btn.dataset.action;if(!action)return;
 if(action==="close-dialog"){$("detailsDialog").close();if(location.hash.startsWith("#ideas?idea="))history.replaceState(null,"","#ideas");return}
 if(action==="open-application"){window.open(DATA.meta.application,"_blank","noopener,noreferrer");return}
 if(action==="copy-form"){await copy(formAsMarkdown());return}
 if(action==="copy-video-en"){await copy(scriptEN);return}
 if(action==="copy-video-vi"){await copy(scriptVI);return}
 if(action==="copy-strategy"){await copy("Codex Ambassador application plan: Month 1 bilingual Agent Ops Clinic workshop; M2 first tested PR; M3 secure context; M4 responsible Growth Engineering; M5 multilingual accessibility; M6 maintainable software and retrospective.");return}
 if(action==="export-json"){download("codex-ambassador-backup-"+new Date().toISOString().slice(0,10)+".json",JSON.stringify({exportedAt:new Date().toISOString(),...app},null,2));toast("Đã xuất backup riêng tư.");return}
 if(action==="export-md"){download("codex-ambassador-form.md",formAsMarkdown(),"text/markdown;charset=utf-8");toast("Đã xuất draft Markdown.");return}
 if(action==="export-shortlist"){const arr=app.ideas.filter(i=>i.status!=="backlog").sort((a,b)=>L.scoreIdea(b)-L.scoreIdea(a));const text=arr.length?arr.map(x=>x.id+" | "+x.name+" | "+x.status+" | "+x.hours+"h | "+x.mvp).join("\n"):"No ideas selected yet.";download("codex-ambassador-shortlist.txt",text,"text/plain;charset=utf-8");toast("Đã xuất "+arr.length+" idea.");return}
 if(action==="import-json"){$("importFile").click();return}
 if(action==="toggle-theme")toggleTheme();
 if(action==="toggle-motion")toggleMotion();
 if(action==="toggle-notify"){await toggleNotify();return}
 if(action==="reset-dashboard"){
  if(!window.confirm("Xóa toàn bộ draft, task và idea status chỉ trong trình duyệt này? File gốc trên Mac không đổi."))return;
  app=L.initialState(DATA,BASE,EXTRA);saved();render();toast("Đã reset dữ liệu browser.");return;
 }
 if(action==="reset-filters"){ideasFilter={q:"",category:"",stage:"",speed:"",priority:"",sort:"priority"};ideaShown=24;render();return}
 if(action==="focus-p0"){ideasFilter={q:"",category:"",stage:"",speed:"",priority:"P0",sort:"priority"};ideaShown=24;location.hash="ideas";render();return}
 if(action==="load-more-ideas"){ideaShown+=24;refreshIdeaGrid();return}
 if(action==="show-shortlist"){ideasFilter={q:"",category:"",stage:"",speed:"fast",priority:"",sort:"priority"};ideaShown=24;location.hash="ideas";return}
 if(action==="scroll-first-blocker"){const issue=L.auditForm(DATA.fields,app.values,app.statuses).issues[0];if(issue){const el=$("wrap-"+issue.key);el?.scrollIntoView({behavior:prefs.motion?"smooth":"instant",block:"center"});el?.querySelector(".form-control")?.focus()}else toast("Không còn blocker cấu trúc.");return}
 if(action==="mark-submitted"){
  const audit=L.auditForm(DATA.fields,app.values,app.statuses);
  if(audit.issues.length){toast("Chưa qua gate: "+audit.issues.length+" blocker. Không đánh dấu nộp.",true);return}
  if(!app.submissionReceipt.trim()){toast("Hãy nhập xác nhận/receipt OpenAI sau khi nộp thật.",true);return}
  if(!window.confirm("Mày đã thực sự nhấn Submit trên OpenAI và nhận xác nhận hợp lệ?"))return;
  app.submitted=true;app.tasks.m10=true;app.tasks.m11=true;saved();render();toast("Đã ghi nhận xác nhận thủ công.");return;
 }
 if(action==="add-idea"){
  const opts=categories.map(c=>'<option>'+esc(c)+'</option>').join("");
  openDialog("Thêm product idea",'<form id="customIdeaForm" class="dialog-content"><div class="field-card"><label for="newIdeaName">Tên sản phẩm *</label><input class="form-control" id="newIdeaName" maxlength="150" required></div><div class="field-card"><label for="newIdeaCategory">Nhóm</label><select class="form-control" id="newIdeaCategory">'+opts+'</select></div><div class="field-card"><label for="newIdeaHours">Giờ ước tính cho MVP</label><input class="form-control" type="number" min="1" max="40" id="newIdeaHours" value="4" required></div><div class="field-card"><label for="newIdeaAudience">Đối tượng</label><input class="form-control" id="newIdeaAudience" value="Codex beginner builders"></div><div class="field-card"><label for="newIdeaMvp">MVP có thể demo</label><textarea class="form-control" id="newIdeaMvp" required></textarea></div><button class="btn btn-primary" type="submit">Lưu idea</button></form>');
  return;
 }
 if(action==="shortlist-modal"){
  const i=app.ideas.find(x=>x.id===btn.dataset.id);
  if(i){i.status="shortlist";saved();$("detailsDialog").close();render();toast("Đã vào shortlist")}
  return;
 }
 if(action==="copy-idea"){const i=app.ideas.find(x=>x.id===btn.dataset.id);if(i)copy("PRODUCT: "+i.name+"\nAUDIENCE: "+i.audience+"\nMVP: "+i.mvp+"\nESTIMATED HOURS: "+i.hours+"\nREQUIREMENTS: runnable source, test, README, community exercise, authorship attribution.");return}
});
document.addEventListener("submit",e=>{
 if(e.target.id!=="customIdeaForm")return;
 e.preventDefault();
 const name=$("newIdeaName").value.trim(),mvp=$("newIdeaMvp").value.trim();
 if(!name||!mvp){toast("Nhập tên và MVP thực tế.",true);return}
 const now=String(Date.now()),i={id:"C"+now,name,category:$("newIdeaCategory").value,hours:Number($("newIdeaHours").value),audience:$("newIdeaAudience").value,mvp,priority:"Fast win",status:"backlog",origin:"custom",impact:4};
 app.ideas.push(i);saved();$("detailsDialog").close();render();toast("Đã tạo idea "+i.id);
});
document.addEventListener("input",e=>{
 const el=e.target;if(el.dataset.field){updateField(el.dataset.field,el.type==="checkbox"?el.checked:el.value,el.type==="checkbox");return}
 if(el.id==="videoUrlQuick"){updateField("video",el.value);return}
 if(el.id==="receiptInput"){app.submissionReceipt=el.value;app.submitted=false;saved();return}
 if(el.id==="ideaSearch"){ideasFilter.q=el.value;ideaShown=24;refreshIdeaGrid();return}
 if(el.id==="globalSearch"){
  ideasFilter.q=el.value;
  if(el.value.trim()&&route!=="ideas")location.hash="ideas";
  else if(route==="ideas"){const s=$("ideaSearch");if(s)s.value=el.value;refreshIdeaGrid()}
 }
});
document.addEventListener("change",e=>{
 const el=e.target;
 if(el.dataset.field){updateField(el.dataset.field,el.type==="checkbox"?el.checked:el.value,el.type==="checkbox");if(el.type==="checkbox")render();return}
 if(el.dataset.taskId){
  const id=el.dataset.taskId;
  if(id==="m10"||id==="m11"){
   if(el.checked&&!app.submissionReceipt.trim()){toast("Chỉ đánh dấu nộp khi có confirmation.",true);el.checked=false;return}
  }
  app.tasks[id]=el.checked;saved();render();return;
 }
 if(el.dataset.videoCheck){app.videoChecks[el.dataset.videoCheck]=el.checked;saved();render();return}
 if(el.dataset.ideaStage){
  const idea=app.ideas.find(i=>i.id===el.dataset.ideaStage);if(!idea)return;
  const before=idea.status,after=el.value;
  if(after==="tested"&&!confirm("Đã thực sự chạy kiểm thử cho sản phẩm này?")){el.value=before;return}
  if(after==="public"){
   const url=prompt("Dán URL công khai đã kiểm tra (https://):",idea.evidenceUrl||"");
   if(!L.RE_URL.test(url||"")){toast("Không thể đặt trạng thái Public khi thiếu URL hợp lệ.",true);el.value=before;return}
   idea.evidenceUrl=url;
  }
  idea.status=after;saved();refreshIdeaGrid();toast("Cập nhật "+idea.name+": "+after);return;
 }
 const filterKey={categoryFilter:"category",speedFilter:"speed",stageFilter:"stage",priorityFilter:"priority",sortFilter:"sort"}[el.id];
 if(filterKey){ideasFilter[filterKey]=el.value;ideaShown=24;refreshIdeaGrid()}
});
$("importFile").addEventListener("change",async e=>{
 const file=e.target.files?.[0];if(!file)return;
 try{
  if(file.size>2_000_000)throw new Error("Backup vượt 2MB");
  const payload=JSON.parse(await file.text());const next=L.validateImported(payload,DATA,BASE,EXTRA);
  if(!confirm("Ghi đè draft đang lưu bằng file backup vừa chọn?"))return;
  app=next;saved();render();toast("Import backup thành công.");
 }catch(err){toast("Import thất bại: "+err.message,true)}
 e.target.value="";
});
$("mobileMenu").addEventListener("click",()=>{
 const open=$("sidebar").classList.toggle("open");$("mobileMenu").setAttribute("aria-expanded",String(open));
});
function toggleTheme(){prefs.theme=prefs.theme==="dark"?"light":"dark";document.documentElement.dataset.nuiTheme=prefs.theme;prefSave();toast("Theme: "+prefs.theme);refreshSettings()}
function toggleMotion(){prefs.motion=!prefs.motion;document.documentElement.classList.toggle("nui-motion-off",!prefs.motion);prefSave();toast(prefs.motion?"Đã bật motion.":"Đã tắt motion.");refreshSettings()}
async function toggleNotify(){
 if(prefs.notify){prefs.notify=false;prefSave();refreshSettings();toast("Đã tắt browser notification.");return}
 if(!("Notification" in window)){toast("Trình duyệt này không hỗ trợ Notification API.",true);return}
 try{const permission=await Notification.requestPermission();if(permission!=="granted"){toast("Chưa được cấp quyền thông báo. Lịch Google vẫn hoạt động.",true);return}
  prefs.notify=true;prefSave();refreshSettings();toast("Đã bật thông báo khi dashboard đang mở.");
 }catch{toast("Không yêu cầu được quyền thông báo trong file context.",true)}
}
function checkNotification(){
 if(!prefs.notify||!("Notification" in window)||Notification.permission!=="granted")return;
 const c=L.countdown(DATA.meta.targetSubmission);
 if(c.totalMinutes>2880||c.past)return;
 const key="codex-ambassador-notice-date",today=new Date().toISOString().slice(0,10);
 if(localStorage.getItem(key)===today)return;
 try{new Notification("Codex Ambassador — còn "+c.days+" ngày",{body:"Kiểm tra video, public repo, Community Norms và form trước lịch nộp 30/10.",tag:"codex-ambassador-deadline"});localStorage.setItem(key,today)}catch{}
}
$("themeToggle").addEventListener("click",toggleTheme);
$("motionToggle").addEventListener("click",toggleMotion);
$("exportTop").addEventListener("click",()=>download("codex-ambassador-private-backup.json",JSON.stringify(app,null,2)));
document.addEventListener("keydown",e=>{
 if(e.key==="/"&&!/INPUT|TEXTAREA/.test(document.activeElement?.tagName||"")&&!e.ctrlKey&&!e.metaKey){e.preventDefault();$("globalSearch").focus()}
 if(e.key==="Escape"&&$("sidebar").classList.contains("open")){const inside=$("sidebar").contains(document.activeElement);$("sidebar").classList.remove("open");$("mobileMenu").setAttribute("aria-expanded","false");if(inside)$("mobileMenu").focus()}
});
document.addEventListener("keydown",e=>{
 const card=e.target.closest?.(".idea-card[data-idea-open]");
 if(card&&e.target===card&&(e.key==="Enter"||e.key===" ")){e.preventDefault();ideaDialog(card.dataset.ideaOpen)}
});
$("detailsDialog").addEventListener("close",()=>{
 if(location.hash.startsWith("#ideas?idea="))history.replaceState(null,"","#ideas");
});
$("detailsDialog").addEventListener("click",e=>{
 if(e.target===$("detailsDialog"))$("detailsDialog").close();
});
window.addEventListener("hashchange",()=>{render();window.scrollTo(0,0)});
render();setInterval(()=>{updateCountdown();checkNotification()},60_000);
})();

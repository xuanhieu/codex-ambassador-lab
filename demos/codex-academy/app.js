/* Codex x ChatGPT Academy — independent bilingual static learning app. */
(function(){
"use strict";
const A=window.AcademyLogic;
const STORAGE="codex-zerohero-academy-v1", PREF="codex-zerohero-preferences-v1";
const $=id=>document.getElementById(id);
// The page CSP blocks style="" attributes in HTML strings; widths are set through the CSSOM instead.
const applyPercentWidths=root=>root.querySelectorAll("[data-pct]").forEach(el=>{const n=Number(el.dataset.pct);el.style.width=(Number.isFinite(n)?Math.min(100,Math.max(0,n)):0)+"%"});
const E=v=>String(v??"").replace(/[&<>"']/g,x=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[x]));
const url=r=>A.safeUrl(r)?" href=\""+E(r)+"\" target=\"_blank\" rel=\"noopener noreferrer\"":"";
const I={
vi:{
 navHome:"Tổng quan",navDocs:"Thư viện",navPaths:"Lộ trình",navProgress:"Tiến độ",navLab:"Thực hành",
 headline:"Từ người mới đến người xây dựng AI chuyên nghiệp.",
 subheading:"Bản đồ học ChatGPT và Codex từ nền tảng đến automation, agent engineering và production. Học bằng bài tập, nguồn chính thức và kiểm chứng thật.",
 browse:"Khám phá tài liệu",start:"Bắt đầu lộ trình",officialLinks:"Nguồn chính thức",labLessons:"Bài thực hành",doneLessons:"Hoàn thành",
 pathCard:"Lộ trình theo trình độ",pathCardSub:"5 cấp độ • 6 nhóm người học",
 docsCard:"Nguồn tài liệu chính thống",docsCardSub:"Tìm kiếm và lọc theo chủ đề",
 labCard:"Bài tập thực chiến",labCardSub:"Có tiêu chí đạt, không giả kết quả",
 privacy:"Dữ liệu tiến độ và bookmark chỉ nằm trong trình duyệt này; không có tài khoản hay API key.",
 homeTitle:"Bắt đầu từ đúng trình độ của bạn",homeSub:"Mỗi bậc có bài tập thực tế, quiz và đường dẫn về tài liệu gốc. Chọn bài và tự xác nhận kết quả.",
 homeSources:"Nguồn gốc được đối chiếu",homeSourceSub:"Mở trực tiếp từ trang tài liệu chính thức. Những mục legacy được gắn nhãn rõ.",
 openLibrary:"Mở thư viện tài liệu",viewLesson:"Mở bài học",finished:"Đã hoàn thành",notDone:"Chưa học",details:"Xem chi tiết",
 libraryTitle:"Thư viện tài liệu chính thức",librarySub:"Danh mục được lập từ chỉ mục máy đọc được của OpenAI; tiêu đề và phân loại không thay thế nội dung gốc.",
 find:"Tìm tên, chủ đề, tính năng…",prod:"Sản phẩm",level:"Trình độ",topic:"Chủ đề",all:"Tất cả",hideLegacy:"Ẩn mục legacy",of:"trong",results:"kết quả",
 prev:"Trước",next:"Sau",first:"Đầu",last:"Cuối",openSource:"Xem nguồn",bookmark:"Lưu",saved:"Đã lưu",archived:"Legacy / deprecated",
 pathsTitle:"Lộ trình theo vai trò",pathsSub:"Chọn đối tượng; đường học vẫn theo năm bậc từ Zero đến Pro. Các bước là đề xuất và luôn có thể bỏ qua.",
 audience:"Dành cho",complete:"Hoàn tất",tier:"Bậc",minutes:"phút",begin:"Bắt đầu",continue:"Học tiếp",
 progressTitle:"Tiến độ cá nhân",progressSub:"Dữ liệu chỉ lưu localStorage trong trình duyệt hiện tại. Có thể export/import để chuyển máy.",
 export:"Xuất dữ liệu",import:"Nhập backup JSON",reset:"Xóa tiến độ",confirmReset:"Xóa toàn bộ dữ liệu tiến độ và bookmark trên trình duyệt này?",clearDone:"Đặt lại",
 emptyDone:"Chưa có bài hoàn thành. Bắt đầu bằng một bài Zero.",emptySaved:"Chưa lưu tài liệu nào.",
 completed:"Đã hoàn thành",bookmarked:"Đã bookmark",learning:"Bài đang học",showLessons:"Xem bài học",
 labTitle:"Thực hành, không chỉ đọc",labSub:"Các bài tập không tự chạy Codex hoặc truy cập máy của bạn. Mọi thao tác ngoài trình duyệt do bạn quyết định.",
 labWarning:"Đây là hướng dẫn thực hành. App chỉ hiển thị bài tập và theo dõi thao tác tự xác nhận; không chạy lệnh, không chạm file hay tài khoản thật.",
 sourceSnapshot:"Bản chỉ mục",unofficial:"Dự án hướng dẫn độc lập; không phải sản phẩm hoặc chứng nhận chính thức của OpenAI.",
 purpose:"Mục tiêu",output:"Đầu ra cần có",exercise:"Bài tập 3 bước",sources:"Nguồn đối chiếu chính thức",quiz:"Kiểm tra nhanh",
 markComplete:"Xác nhận hoàn tất",undoComplete:"Đánh dấu chưa học",mustComplete:"Đánh dấu cả 3 bước và trả lời đúng câu hỏi.",correct:"Đúng",incorrect:"Chưa đúng",answerHelp:"Chọn một đáp án. Giải thích sẽ xuất hiện ngay bên dưới.",
 savedToast:"Đã cập nhật trên trình duyệt này.",importSuccess:"Đã nhập backup hợp lệ.",importError:"Không nhập được: ",resetDone:"Đã xóa tiến độ.",empty:"Không có kết quả phù hợp. Thử bỏ bớt bộ lọc.",
 fresh:"Nguồn có thể thay đổi; mở tài liệu chính thức để xác minh.",loadingError:"Không tải được dữ liệu. Chạy qua máy chủ HTTP, không mở file:// trực tiếp.",
 retry:"Thử tải lại",roleAll:"Mọi người học",
 levels:["Zero","Beginner","Intermediate","Advanced","Pro"],roles:["Người mới","Creator","Marketer","Developer","Team Lead","Pro"]
},
en:{
 navHome:"Overview",navDocs:"Library",navPaths:"Paths",navProgress:"Progress",navLab:"Practice",
 headline:"From day one to a confident AI builder.",
 subheading:"A hands-on ChatGPT and Codex roadmap from foundations to automation, agent engineering and production. Learn through exercises, verified sources and honest review.",
 browse:"Browse the docs",start:"Find my path",officialLinks:"Official sources",labLessons:"Practical lessons",doneLessons:"Completed",
 pathCard:"Level-based learning",pathCardSub:"5 levels • 6 audiences",docsCard:"Official documentation links",docsCardSub:"Search and filter by topic",
 labCard:"Hands-on practice",labCardSub:"Acceptance checks, no fake outcomes",
 privacy:"Progress and bookmarks live only in this browser; no accounts or API keys.",
 homeTitle:"Start at the right level",homeSub:"Every tier has practical work, short quizzes and links back to original docs. Choose a lesson and verify it yourself.",
 homeSources:"Traceable official sources",homeSourceSub:"Open original official pages directly. Legacy resources are explicitly labeled.",
 openLibrary:"Open document library",viewLesson:"Open lesson",finished:"Completed",notDone:"Not yet",details:"Details",
 libraryTitle:"Official documentation library",librarySub:"Curated from the machine-readable OpenAI index. Titles and classifications are not a substitute for original pages.",
 find:"Find topic, guide or feature…",prod:"Product",level:"Level",topic:"Topic",all:"All",hideLegacy:"Hide legacy",of:"of",results:"results",
 prev:"Prev",next:"Next",first:"First",last:"Last",openSource:"Open source",bookmark:"Save",saved:"Saved",archived:"Legacy / deprecated",
 pathsTitle:"Learning paths by audience",pathsSub:"Pick a role and advance from Zero to Pro. You can skip optional lessons at any time.",
 audience:"For",complete:"Complete",tier:"Tier",minutes:"min",begin:"Start",continue:"Continue",
 progressTitle:"My progress",progressSub:"Saved only to this browser. Export/import a private JSON backup to change devices.",
 export:"Export progress",import:"Import backup JSON",reset:"Reset all",confirmReset:"Delete all learning progress and bookmarks in this browser?",clearDone:"Reset",
 emptyDone:"Nothing completed yet. Start with a Zero lesson.",emptySaved:"No bookmarked sources yet.",
 completed:"Completed",bookmarked:"Bookmarked",learning:"In progress",showLessons:"Browse lessons",
 labTitle:"Practice, not just reading",labSub:"The website does not execute Codex or access your machine. You choose all outside-browser actions.",
 labWarning:"This is a learning aid. The app only displays steps and self-attested progress; it never runs commands or touches real files/accounts.",
 sourceSnapshot:"Source snapshot",unofficial:"Independent educational resource; not an official OpenAI product or certification.",
 purpose:"Goal",output:"Deliverable",exercise:"Three hands-on steps",sources:"Official references",quiz:"Knowledge check",
 markComplete:"Mark completed",undoComplete:"Mark unfinished",mustComplete:"Check all three steps and answer the quiz correctly.",correct:"Correct",incorrect:"Try again",answerHelp:"Choose an option to see the explanation.",
 savedToast:"Saved in this browser.",importSuccess:"Valid progress imported.",importError:"Cannot import: ",resetDone:"Progress reset.",empty:"No matching results. Clear some filters.",
 fresh:"Sources may change. Check official docs for current behavior.",loadingError:"Cannot load catalog. Serve this directory over HTTP; do not open file:// directly.",
 retry:"Retry",roleAll:"All audiences",
 levels:["Zero","Beginner","Intermediate","Advanced","Pro"],roles:["Newbie","Creator","Marketer","Developer","Team Lead","Pro"]
}
};
let catalog=null,lessons=[],view="home",locale="vi",theme="dark";
let store={schema:1,completed:[],bookmarks:[],checks:{},quiz:{}};
let docsFilter={q:"",product:"",level:"",category:"",hideLegacy:false,page:1};
let chosenRole="Newbie",modalId=null,toastTimer=null;
function words(){return I[locale]}
function safeRead(key){try{return JSON.parse(localStorage.getItem(key))}catch{return null}}
function save(){
 try{localStorage.setItem(STORAGE,JSON.stringify(store))}catch(e){console.warn("Progress remains session-only",e)}
 updateStats();
}
function prefSave(){
 try{localStorage.setItem(PREF,JSON.stringify({locale,theme,chosenRole}))}catch{}
}
function setTheme(){document.documentElement.dataset.theme=theme;$("theme").textContent=theme==="dark"?"☼":"◐"}
function notify(msg){
 const el=$("toast");
 if(!el)return;
 el.textContent=msg;el.classList.add("visible");
 if(toastTimer)clearTimeout(toastTimer);
 toastTimer=setTimeout(()=>el.classList.remove("visible"),3300);
}
function applyLabels(){
 const l=words();
 document.documentElement.lang=locale;
 const map={headline:"headline",subheading:"subheading","start-path":"start","browse-docs":"browse","privacy-note":"privacy"};
 for(const [id,key] of Object.entries(map))if($(id))$(id).textContent=l[key];
 document.querySelectorAll("[data-label]").forEach(node=>{const key=node.dataset.label;if(l[key])node.textContent=l[key]});
 $("locale").textContent=locale==="vi"?"EN":"VI";
 $("edition-text").textContent=(locale==="vi"?"Chỉ mục tài liệu chính thức ":"Official documentation index ")+(catalog?catalog.snapshot:"2026-10-24")+(locale==="vi"?" • Nội dung hướng dẫn độc lập":" • Independent lessons");
 $("footer-snapshot").textContent=l.sourceSnapshot+": "+(catalog?catalog.snapshot:"2026-10-24");
}
function updateStats(){
 if(!catalog)return;
 $("stat-sources").textContent=catalog.sources.length;
 $("stat-lessons").textContent=lessons.length;
 $("stat-done").textContent=store.completed.length;
 $("hero-meter").style.width=A.percentage(store.completed.length,lessons.length)+"%";
}
function heading(title,desc,right=""){
 return '<div class="section-head"><div><div class="eyebrow">CODEX × CHATGPT LEARNING</div><h2>'+E(title)+'</h2><p>'+E(desc)+'</p></div>'+(right?'<div class="right">'+right+'</div>':"")+'</div>';
}
function badge(text,type=""){return '<span class="tag '+E(type)+'">'+E(text)+'</span>'}
function levelIndex(l){return A.TIERS.indexOf(l)}
function openButton(id,label){
 return '<button type="button" class="button small primary" data-lesson="'+E(id)+'">'+E(label)+'</button>';
}
function showHome(){
 const l=words();
 let html=heading(l.homeTitle,l.homeSub)
   +'<div class="grid cols-4">';
 const tierKeys=A.TIERS;
 for(let i=0;i<tierKeys.length;i++){
  const tier=tierKeys[i],arr=lessons.filter(x=>x.level===tier);
  const d=arr.filter(x=>store.completed.includes(x.id)).length;
  html+='<div class="card path-card"><div class="step-num">0'+(i+1)+' / 05</div><h3>'+E(tier)+'</h3><p>'+E(arr[0][locale].purpose)+'</p>'
      +'<div class="path-meter"><i data-pct="'+A.percentage(d,arr.length)+'"></i></div>'
      +'<div class="card-foot">'+badge(d+" / "+arr.length+" "+l.complete,'accent')+openButton(arr.find(x=>!store.completed.includes(x.id))?.id||arr[0].id,l.begin)+'</div></div>';
 }
 html+='</div>';
 html+='<div class="section-head u-mt-35"><div><h2>'+E(l.homeSources)+'</h2><p>'+E(l.homeSourceSub)+'</p></div><button class="button" data-view="library">'+E(l.openLibrary)+' →</button></div>';
 const highlighted=["Codex CLI","Custom instructions with AGENTS.md","Plugins","Codex SDK"];
 const featured=highlighted.map(x=>catalog.sources.find(y=>y.title===x)).filter(Boolean);
 html+='<div class="grid cols-4">'+featured.map(s=>sourceCard(s)).join("")+'</div>';
 return html;
}
function sourceCard(d){
 const l=words(),saved=store.bookmarks.includes(d.id);
 return '<article class="card doc-card"><div class="doc-cat">'+E(d.categories[0]||"Docs")+'</div><h3>'+E(d.title)+'</h3>'
  +'<div class="tags">'+badge(d.product,'accent')+badge(d.level)+(d.legacy?badge(l.archived,'warn'):"")+'</div>'
  +'<div class="card-foot"><a'+url(d.url)+'>'+E(l.openSource)+' ↗</a><button class="button small" type="button" data-bookmark="'+E(d.id)+'" aria-label="'+E(saved?l.saved:l.bookmark)+' '+E(d.title)+'">'+E(saved?"★":"☆")+'</button></div></article>';
}
function options(values,selected,allLabel){
 return '<option value="">'+E(allLabel)+'</option>'+values.map(x=>'<option value="'+E(x)+'"'+(x===selected?' selected':'')+'>'+E(x)+'</option>').join("");
}
function showLibrary(){
 const l=words();
 const products=[...new Set(catalog.sources.map(x=>x.product))].sort();
 const categories=[...new Set(catalog.sources.flatMap(x=>x.categories))].sort();
 const controls='<div class="filters">'
 +'<label class="field search-field">'+E(l.find)+'<input id="doc-search" type="search" placeholder="/ '+E(l.find)+'" autocomplete="off" value="'+E(docsFilter.q)+'"></label>'
 +'<label class="field">'+E(l.prod)+'<select id="doc-product">'+options(products,docsFilter.product,l.all)+'</select></label>'
 +'<label class="field">'+E(l.level)+'<select id="doc-level">'+options(A.TIERS,docsFilter.level,l.all)+'</select></label>'
 +'<label class="field">'+E(l.topic)+'<select id="doc-category">'+options(categories,docsFilter.category,l.all)+'</select></label>'
 +'<label class="check-filter"><input id="doc-legacy" type="checkbox"'+(docsFilter.hideLegacy?' checked':'')+'>'+E(l.hideLegacy)+'</label>'
 +'</div>';
 return heading(l.libraryTitle,l.librarySub)+controls+'<div id="library-results"></div>';
}
function renderLibraryResults(){
 const dest=$("library-results");
 if(!dest)return;
 const l=words();
 const selected=A.filterDocs(catalog.sources,docsFilter);
 const pages=Math.max(1,Math.ceil(selected.length/16));
 docsFilter.page=Math.max(1,Math.min(pages,docsFilter.page));
 const shown=selected.slice((docsFilter.page-1)*16,docsFilter.page*16);
 let html='<p class="muted u-fs-12">'+shown.length+' / '+selected.length+' '+E(l.results)+'</p>';
 html+=shown.length?'<div class="grid cols-4">'+shown.map(sourceCard).join("")+'</div>':'<div class="empty">'+E(l.empty)+'</div>';
 html+='<div class="pager"><button data-page="first"'+(docsFilter.page===1?' disabled':'')+' aria-label="'+E(l.first)+'">«</button>'
  +'<button data-page="prev"'+(docsFilter.page===1?' disabled':'')+'>'+E(l.prev)+'</button>'
  +'<small>'+docsFilter.page+' / '+pages+'</small><button data-page="next"'+(docsFilter.page===pages?' disabled':'')+'>'+E(l.next)+'</button>'
  +'<button data-page="last"'+(docsFilter.page===pages?' disabled':'')+' aria-label="'+E(l.last)+'">»</button></div>';
 dest.innerHTML=html;
}
function lessonCard(row){
 const l=words(),body=row[locale],done=store.completed.includes(row.id);
 return '<article class="card path-card" data-complete="'+done+'"><div class="tags">'+badge(row.level,'accent')+badge(row.duration+' '+l.minutes)+badge(row.id)+'</div>'
   +'<h3>'+E(body.title)+'</h3><p>'+E(body.purpose)+'</p>'
   +'<div class="card-foot">'+badge(done?l.finished:l.notDone,done?'ok':'')+openButton(row.id,done?l.details:l.begin)+'</div></article>';
}
function showPaths(){
 const l=words(),roles=A.ROLES;
 let html=heading(l.pathsTitle,l.pathsSub);
 html+='<div class="role-controls"><button data-role="all" aria-pressed="'+(chosenRole==="all")+'">'+E(l.roleAll)+'</button>';
 html+=roles.map((name,i)=>'<button data-role="'+E(name)+'" aria-pressed="'+(chosenRole===name)+'">'+E(l.roles[i])+'</button>').join('')+'</div>';
 const selected=lessons.filter(x=>chosenRole==="all"||x.audience.includes(chosenRole));
 for(let i=0;i<A.TIERS.length;i++){
  const tier=A.TIERS[i],found=selected.filter(x=>x.level===tier);
  if(!found.length)continue;
  html+='<div class="tier-head"><span class="tier-number">'+(i+1)+'</span><div><h3>'+E(tier)+'</h3><span>'+found.filter(x=>store.completed.includes(x.id)).length+'/'+found.length+' '+E(l.complete)+'</span></div></div>'
  +'<div class="grid cols-4">'+found.map(lessonCard).join('')+'</div>';
 }
 if(!selected.length)html+='<div class="empty">'+E(l.empty)+'</div>';
 return html;
}
function showProgress(){
 const l=words();
 let html=heading(l.progressTitle,l.progressSub,
 '<button class="button" data-export="progress">'+E(l.export)+'</button>'
 +'<label class="import-label">'+E(l.import)+'<input id="import-json" aria-label="'+E(l.import)+'" type="file" accept=".json,application/json"></label>'
 +'<button class="button" data-reset="yes">'+E(l.reset)+'</button>');
 const count=store.completed.length;
 html+='<div class="grid cols-3">'
  +'<div class="card"><span class="eyebrow">'+E(l.completed)+'</span><strong class="u-fs-33">'+count+' / '+lessons.length+'</strong><div class="path-meter"><i data-pct="'+A.percentage(count,lessons.length)+'"></i></div></div>'
  +'<div class="card"><span class="eyebrow">'+E(l.bookmarked)+'</span><strong class="u-fs-33">'+store.bookmarks.length+'</strong><p>'+E(l.fresh)+'</p></div>'
  +'<div class="card"><span class="eyebrow">'+E(l.learning)+'</span><strong class="u-fs-33">'+Object.keys(store.checks).length+'</strong><p>'+E(l.privacy)+'</p></div></div>';
 const finished=lessons.filter(x=>store.completed.includes(x.id));
 const bookmarked=catalog.sources.filter(x=>store.bookmarks.includes(x.id));
 html+='<div class="split u-mt-19">'
   +'<div class="panel"><h3>'+E(l.completed)+'</h3>'
   +(finished.length?finished.map(x=>'<div class="list-row"><span>✓</span><div class="grow"><strong>'+E(x[locale].title)+'</strong><small>'+E(x.level)+'</small></div><button data-lesson="'+E(x.id)+'">'+E(l.details)+'</button></div>').join(''):'<div class="empty">'+E(l.emptyDone)+'</div>')
   +'</div><div class="panel"><h3>'+E(l.bookmarked)+'</h3>'
   +(bookmarked.length?bookmarked.map(x=>'<div class="list-row"><span>☆</span><div class="grow"><strong>'+E(x.title)+'</strong></div><a'+url(x.url)+'>'+E(l.openSource)+' ↗</a></div>').join(''):'<div class="empty">'+E(l.emptySaved)+'</div>')
   +'</div></div>';
 return html;
}
function showLab(){
 const l=words();
 let html=heading(l.labTitle,l.labSub);
 html+='<div class="stage-note">'+E(l.labWarning)+'</div>';
 const selectable=lessons.filter(x=>x.en.exercise.length===3);
 html+='<div class="grid cols-3">'+selectable.map(lessonCard).join('')+'</div>';
 return html;
}
function setView(next){
 if(!["home","library","paths","progress","lab"].includes(next))next="home";
 view=next;
 for(const b of document.querySelectorAll(".nav-button")){
  const active=b.dataset.view===next;b.classList.toggle("selected",active);
  if(active)b.setAttribute("aria-current","page");else b.removeAttribute("aria-current");
 }
 $("hero").hidden=next!=="home";
 $("quick-nav").hidden=next!=="home";
 renderContent();
 try{history.replaceState(null,"","#"+next)}catch{}
}
function renderContent(){
 if(!catalog)return;
 applyLabels();updateStats();
 const actions={home:showHome,library:showLibrary,paths:showPaths,progress:showProgress,lab:showLab};
 $("content").innerHTML=actions[view]();applyPercentWidths($("content"));
 if(view==="library")renderLibraryResults();
}
function setLocale(next){
 locale=next==="en"?"en":"vi";
 prefSave();
 setView(view);
 if(modalId)openLesson(modalId);
}
function lessonLink(row){
 return '<a'+url(row.sources[0])+'>'+E(row.sources[0])+' ↗</a>';
}
function openLesson(id){
 const row=lessons.find(x=>x.id===id);
 if(!row)return;
 modalId=id;
 const l=words(),body=row[locale],checked=store.checks[id]||new Array(body.exercise.length).fill(false);
 const q=body.quiz,answered=store.quiz[id];
 $("lesson-title").textContent=body.title;
 $("lesson-kicker").textContent=row.level+" · "+row.duration+" "+l.minutes+" · "+row.id;
 let html='<div class="tags">'+badge(row.level,'accent')+badge(row.audience.join(" · "))+'</div>';
 html+='<h3>'+E(l.purpose)+'</h3><p>'+E(body.purpose)+'</p>';
 html+='<h3>'+E(l.output)+'</h3><p>'+E(body.outcome)+'</p>';
 html+='<h3>'+E(l.exercise)+'</h3>';
 for(let i=0;i<body.exercise.length;i++){
  html+='<label class="task-check"><input type="checkbox" data-exercise="'+i+'"'+(checked[i]?' checked':'')+'><span>'+E((i+1)+". "+body.exercise[i])+'</span></label>';
 }
 html+='<h3>'+E(l.quiz)+'</h3><fieldset class="quiz-card"><legend>'+E(q.question)+'</legend>'
  +q.options.map((answer,index)=>'<label class="quiz-option"><input type="radio" name="lesson-quiz" value="'+index+'"'+(answered===index?' checked':'')+'><span>'+E(answer)+'</span></label>').join('')
  +'<div class="quiz-feedback'+(answered===q.answer?' correct':'')+'" id="quiz-feedback">'+E(answered==null?l.answerHelp:(answered===q.answer?l.correct:l.incorrect)+": "+q.explanation)+'</div></fieldset>';
 html+='<h3>'+E(l.sources)+'</h3><ul class="info-list">'+row.sources.map(link=>'<li><a'+url(link)+'>'+E(link)+' ↗</a></li>').join('')+'</ul>';
 html+='<p class="stage-note">'+E(l.fresh)+'</p>';
 const done=store.completed.includes(id);
 html+='<div class="modal-actions"><button class="button primary" id="complete-lesson" type="button"'+(!done&&!A.completionReady(row,checked,answered)?' disabled':'')+' data-complete="'+E(id)+'">'+E(done?l.undoComplete:l.markComplete)+'</button>'
 +'<small id="completion-hint" class="muted">'+E(done?l.finished:l.mustComplete)+'</small></div>';
 $("lesson-detail").innerHTML=html;
 const dlg=$("lesson-modal");if(!dlg.open)dlg.showModal();
}
function updateEligibility(){
 const id=modalId;if(!id)return;
 const row=lessons.find(x=>x.id===id);if(!row)return;
 const done=store.completed.includes(id);
 const btn=$("complete-lesson");
 if(btn)btn.disabled=!done&&!A.completionReady(row,store.checks[id]||[],store.quiz[id]);
}
function downloadText(text,filename,mime){
 const blob=new Blob([text],{type:mime||"application/json"});
 const link=document.createElement("a");
 const uri=URL.createObjectURL(blob);link.href=uri;link.download=filename;
 document.body.appendChild(link);link.click();link.remove();
 setTimeout(()=>URL.revokeObjectURL(uri),700);
}
function handleExport(){
 downloadText(JSON.stringify(store,null,2)+"\n","codex-zerohero-progress.json","application/json");
}
async function handleImport(file){
 if(!file||file.size>150000){notify(words().importError+"File exceeds 150 KB");return}
 try{
  const content=await file.text(),obj=JSON.parse(content);
  const validated=A.validateBackup(obj,lessons,catalog.sources);
  store=validated;save();renderContent();notify(words().importSuccess);
 }catch(err){notify(words().importError+String(err.message||"invalid data").slice(0,100))}
}
function toggleBookmark(id){
 if(!catalog.sources.some(x=>x.id===id))return;
 const at=store.bookmarks.indexOf(id);
 if(at>=0)store.bookmarks.splice(at,1);else store.bookmarks.push(id);
 save();
 if(view==="library")renderLibraryResults();else renderContent();
 notify(words().savedToast);
}
function handleClick(e){
 const b=e.target.closest("button");
 if(!b)return;
 if(b.dataset.view){setView(b.dataset.view);window.scrollTo({top:0,behavior:"instant"});return}
 if(b.dataset.lesson){openLesson(b.dataset.lesson);return}
 if(b.dataset.bookmark){toggleBookmark(b.dataset.bookmark);return}
 if(b.dataset.role){chosenRole=b.dataset.role;prefSave();renderContent();return}
 if(b.dataset.page){
  const selected=A.filterDocs(catalog.sources,docsFilter),n=Math.max(1,Math.ceil(selected.length/16));
  docsFilter.page=b.dataset.page==="first"?1:b.dataset.page==="last"?n:b.dataset.page==="next"?Math.min(n,docsFilter.page+1):Math.max(1,docsFilter.page-1);
  renderLibraryResults();return;
 }
 if(b.dataset.export){handleExport();return}
 if(b.dataset.reset){
  if(window.confirm(words().confirmReset)){store={schema:1,completed:[],bookmarks:[],checks:{},quiz:{}};save();renderContent();notify(words().resetDone)}
  return;
 }
 if(b.dataset.complete){
  const id=b.dataset.complete,row=lessons.find(x=>x.id===id);if(!row)return;
  if(store.completed.includes(id))store.completed=store.completed.filter(x=>x!==id);
  else if(A.completionReady(row,store.checks[id]||[],store.quiz[id]))store.completed.push(id);
  else return;
  save();$("lesson-modal").close();modalId=null;renderContent();notify(words().savedToast);
 }
}
function handleChange(e){
 const el=e.target;
 if(el.id==="doc-product"){docsFilter.product=el.value;docsFilter.page=1;renderLibraryResults()}
 if(el.id==="doc-level"){docsFilter.level=el.value;docsFilter.page=1;renderLibraryResults()}
 if(el.id==="doc-category"){docsFilter.category=el.value;docsFilter.page=1;renderLibraryResults()}
 if(el.id==="doc-legacy"){docsFilter.hideLegacy=el.checked;docsFilter.page=1;renderLibraryResults()}
 if(el.id==="import-json"){handleImport(el.files?.[0]);el.value=""}
 if(el.dataset.exercise!=null&&modalId){
  const row=lessons.find(x=>x.id===modalId);if(!row)return;
  const checks=store.checks[modalId]||new Array(row.en.exercise.length).fill(false);
  checks[Number(el.dataset.exercise)]=el.checked;
  store.checks[modalId]=checks;save();updateEligibility();
 }
 if(el.name==="lesson-quiz"&&modalId){
  const row=lessons.find(x=>x.id===modalId);if(!row)return;
  const answer=Number(el.value);store.quiz[modalId]=answer;save();
  const feedback=$("quiz-feedback"),correct=answer===row.en.quiz.answer;
  feedback.classList.toggle("correct",correct);
  feedback.textContent=(correct?words().correct:words().incorrect)+": "+row[locale].quiz.explanation;
  updateEligibility();
 }
}
function handleInput(e){
 if(e.target.id==="doc-search"){
  docsFilter.q=e.target.value;docsFilter.page=1;renderLibraryResults();
 }
}
function bind(){
 document.addEventListener("click",handleClick);
 document.addEventListener("change",handleChange);
 document.addEventListener("input",handleInput);
 $("locale").addEventListener("click",()=>setLocale(locale==="vi"?"en":"vi"));
 $("theme").addEventListener("click",()=>{theme=theme==="dark"?"light":"dark";setTheme();prefSave()});
 $("close-modal").addEventListener("click",()=>{$("lesson-modal").close();modalId=null});
 $("lesson-modal").addEventListener("close",()=>{modalId=null});
 document.addEventListener("keydown",e=>{
  const tag=e.target.tagName,isTyping=/^(INPUT|TEXTAREA|SELECT)$/.test(tag);
  if(e.key==="/"&&!isTyping&&!e.metaKey&&!e.ctrlKey){
   e.preventDefault();setView("library");$("doc-search")?.focus();
  }
  if(e.key==="Escape"&&$("lesson-modal").open){$("lesson-modal").close();modalId=null}
 });
}
async function bootstrap(){
 bind();
 const p=safeRead(PREF);
 if(p&&typeof p==="object"){
  locale=p.locale==="en"?"en":"vi";theme=p.theme==="light"?"light":"dark";
  if(A.ROLES.includes(p.chosenRole)||p.chosenRole==="all")chosenRole=p.chosenRole;
 }
 setTheme();
 try{
  const paths=["./catalog.json","./lessons.json"];
  const responses=await Promise.all(paths.map(path=>fetch(path,{cache:"no-cache"})));
  for(const response of responses)if(!response.ok)throw Error("HTTP "+response.status);
  const payload=await Promise.all(responses.map(x=>x.json()));
  const docset=payload[0],lessonset=payload[1];
  if(!Array.isArray(docset.sources)||docset.sources.length<150||!Array.isArray(lessonset)||lessonset.length<25)throw Error("Incomplete catalog");
  if(docset.sources.some(x=>!A.safeUrl(x.url)))throw Error("Source URL not trusted");
  catalog=docset;lessons=lessonset;
  const old=safeRead(STORAGE);
  if(old){
   try{store=A.validateBackup(old,lessons,catalog.sources)}
   catch{store={schema:1,completed:[],bookmarks:[],checks:{},quiz:{}}}
  }
  const hash=location.hash.replace(/^#/,"");
  setView(["home","library","paths","progress","lab"].includes(hash)?hash:"home");
 }catch(err){
  $("content").innerHTML='<div class="empty">'+E(words().loadingError)+'<p>'+E(String(err.message||""))+'</p><button class="button" id="retry-data">'+E(words().retry)+'</button></div>';
  $("retry-data").addEventListener("click",()=>location.reload());
 }
}
bootstrap();
})();

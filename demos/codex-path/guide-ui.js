/* Independent Codex/ChatGPT documentation guide — 204 dated official indexed links,
   19 human-authored plain-language guides, linked to 61 exercises. No source mirroring. */
(function(root){
"use strict";
const $=id=>document.getElementById(id);
const esc=value=>String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const TIERS=["Zero","Beginner","Intermediate","Advanced","Pro"];
const LEVELS={Zero:{vi:"Chưa biết gì",en:"Starting from zero"},Beginner:{vi:"Mới sử dụng",en:"Beginner"},Intermediate:{vi:"Đã biết cơ bản",en:"Intermediate"},Advanced:{vi:"Làm việc chuyên sâu",en:"Advanced"},Pro:{vi:"Vận hành chuyên nghiệp",en:"Professional"}};
const COPY={
 vi:{title:"Thư viện hướng dẫn — từ dễ hiểu đến thực chiến",sub:"19 chủ đề được viết lại bằng ngôn ngữ đời thường; tài liệu gốc nằm bên cạnh để đối chiếu. Đọc ví dụ trước, thử bài thực hành sau.",
  handbook:"Đọc giáo trình Markdown",sourceTitle:"Chỉ mục tài liệu chính thức",sourceNote:"Đã yêu cầu kiểm tra 204 URL ngày 25/10/2026: 198 HTTP 200, 6 HTTP 404. HTTP 200 không chứng minh nội dung còn đúng. Không sao chép toàn văn tài liệu.",
  lesson:"Bài thực hành liên quan",source:"Xem tài liệu gốc",easy:"Diễn giải ngắn gọn",analogy:"Hiểu qua ví dụ đời thường",example:"Ví dụ cụ thể",
  risk:"Dễ mắc lỗi gì?",try:"Thử trong 5–15 phút",topic:"Chủ đề",level:"Cấp độ",openLesson:"Mở bài",docs:"Tài liệu tham chiếu",
  docsTitle:"Toàn bộ danh mục nguồn đã lập chỉ mục",search:"Tìm chủ đề hoặc tài liệu…",all:"Tất cả",clear:"Xóa lọc",show:"Xem thêm tài liệu",
  mapped:"Liên kết tới hướng dẫn",docsHint:"Chọn cấp độ và sản phẩm. Nội dung gốc thuộc OpenAI, bài giải thích và thực hành là tài liệu học tập độc lập.",
  filterEmpty:"Không tìm thấy tài liệu, hãy thử từ khóa khác.",noTrack:"Các bước học được sắp từ dễ đến khó; bạn có thể bắt đầu ở cấp Zero.",
  changed:"Thông tin sản phẩm và giao diện có thể thay đổi; luôn đọc trang chính thức trước khi áp dụng.",next:"Mở bài thực hành",task:"Bài tập dễ làm",
  beginner:"Lần đầu đến đây? Bắt đầu từ bài dễ nhất",start:"Bắt đầu 3 phút",roadmap:"Xem lộ trình riêng",
  legacy:"Legacy: kiểm tra phiên bản mới",links:"Mục nguồn",guideCount:"Bản hướng dẫn",sourceCount:"URL được phân loại",
  tierHint:"Cấp độ chỉ giúp chọn bài, không đánh giá năng lực hay cấp chứng chỉ.",
  demos:"Dùng thử công cụ minh họa",docAll:"Danh mục tài liệu chi tiết",notLive:"Chưa xác minh truy cập",live:"HTTP 200 · 25/10",outdated:"HTTP 404 · cần nguồn thay thế"},
 en:{title:"Plain-language learning guide — from zero to practice",sub:"19 original explanations, with everyday analogies and real exercises, linked to official resources for further reading.",
  handbook:"Read the Markdown handbook",sourceTitle:"Official source index",sourceNote:"Checked 204 links on 25 Oct 2026: 198 HTTP 200, six HTTP 404. Reachability is not proof that content or features remain current. No full-text mirror.",
  lesson:"Linked practical lessons",source:"Official source",easy:"In plain language",analogy:"Everyday analogy",example:"Concrete example",
  risk:"Common mistake",try:"Try it in 5–15 minutes",topic:"Topic",level:"Level",openLesson:"Open lesson",docs:"References",
  docsTitle:"Full indexed documentation catalog",search:"Search topics and documentation…",all:"All",clear:"Clear filters",show:"Load more documents",
  mapped:"Mapped to guide",docsHint:"Filter by level and product. Original content belongs to OpenAI; these explanations and exercises are independent educational writing.",
  filterEmpty:"No matching documents; change filters or search terms.",noTrack:"Skills progress from simple to advanced; anyone can begin at Zero.",
  changed:"Product interfaces and availability can change; check the official source before acting.",next:"Open practice lesson",task:"Beginner-friendly challenge",
  beginner:"New here? Start from the very beginning",start:"Three-minute start",roadmap:"Personalized roadmap",
  legacy:"Legacy: check current replacement",links:"Indexed links",guideCount:"Guides",sourceCount:"Classified URLs",tierHint:"These tiers are navigation aids, not assessments or certificates.",
  demos:"Try a related demo",docAll:"Detailed source catalog",notLive:"Access unverified",live:"HTTP 200 · 25 Oct",outdated:"HTTP 404 · find replacement"}
};
const DEMOS={
 "first-task":"../zero-token-workshop/",
 "tool-choice":"../zero-token-workshop/",
 "codex-begin":"../zero-token-workshop/",
 "git-and-diffs":"../first-pr-clinic/",
 "review-tests":"../readme-quality-linter/",
 "team-governance":"../workshop-curriculum-planner/",
 "privacy-basics":"../screenshot-privacy-reviewer/",
 "approval":"../human-review-checklist/",
 "release-review":"../evidence-chain/",
 "evals":"../docs-change-radar/",
 "safe-connections":"../approval-drill/",
 "agent-platform":"../agent-ops-clinic/"
};
const safe=url=>typeof url==="string"&&url.startsWith("https://")&&!/[<>"'\\\s]/.test(url)&&url.length<2049;
let map=null,locale="vi",selectedTier="Zero",filterTier="all",filterProduct="all",filterStatus="all",query="",shown=12,opened=null,lastError="";
let onOpenLesson=()=>{},onStart=()=>{},onRoadmap=()=>{};
const t=k=>COPY[locale][k]||k;
function valid(data){
 if(!data||data.schema!=="human-learning-map-v1"||!Array.isArray(data.guides)||data.guides.length<15||
    !Array.isArray(data.documents)||data.documents.length<200)throw Error("Learning map has an incomplete source index");
 const gids=new Set();
 for(const item of data.guides){
  if(!/^[a-z0-9-]+$/.test(item.id)||gids.has(item.id)||!TIERS.includes(item.tier)||
     !item.vi?.simple||!item.en?.simple||!Array.isArray(item.lessons)||!item.lessons.length)throw Error("Invalid guide");
  gids.add(item.id);
 }
 const docs=new Set();
 for(const item of data.documents){
  if(!safe(item.url)||!gids.has(item.guide)||docs.has(item.id)||!/^src-[a-f0-9]{12}$/.test(item.id)||
     !["ChatGPT","Codex","Platform"].includes(item.product))throw Error("Invalid source URL or mapping");
  docs.add(item.id);
 }
 return true;
}
async function load(){
 if(map)return map;
 const res=await fetch("./data/learning-map.json",{cache:"no-cache"});
 if(!res.ok)throw Error("Learning map HTTP "+res.status);
 const obj=await res.json();
 valid(obj);map=obj;
 return obj;
}
function tiers(){
 return '<div class="guide-tier-nav" aria-label="'+esc(t("level"))+'">'+TIERS.map(x=>
  '<button type="button" class="guide-tier '+(selectedTier===x?"selected":"")+'" data-guide-tier="'+x+'" aria-pressed="'+(selectedTier===x)+'">'
  +'<strong>'+esc(x)+'</strong><small>'+esc(LEVELS[x][locale])+'</small></button>').join("")+'</div>';
}
function guideCard(g,i){
 const content=g[locale],reference=g.references.filter(s=>safe(s.url));
 const detail=g.id===opened||(!opened&&i===0);
 return '<details class="guide-card" data-guide-card="'+esc(g.id)+'" '+(detail?"open":"")+'>'
 +'<summary><span class="guide-number">'+String(i+1).padStart(2,"0")+'</span><span class="guide-card-intro"><strong>'+esc(content.title)+'</strong><small>'+esc(content.simple)+'</small></span><span class="guide-chevron">⌄</span></summary>'
 +'<div class="guide-detail">'
 +(root.CodexVisuals?root.CodexVisuals.guide(g,locale):'')
 +'<div class="guide-walkthrough"><article><span>'+esc(t("easy"))+'</span><p>'+esc(content.simple)+'</p></article>'
 +'<article><span>'+esc(t("analogy"))+'</span><p>'+esc(content.analogy)+'</p></article>'
 +'<article><span>'+esc(t("example"))+'</span><p>'+esc(content.example)+'</p></article>'
 +'<article class="guide-warning"><span>'+esc(t("risk"))+'</span><p>'+esc(content.pitfall)+'</p></article>'
 +'</div><div class="guide-challenge"><div><span class="eyebrow">PRACTICE / 5–15 MIN</span><strong>'+esc(t("task"))+'</strong><p>'+esc(content.challenge)+'</p></div>'
 +'<div class="guide-challenge-actions">'+g.lessons.map(id=>'<button type="button" data-guide-lesson="'+esc(id)+'" class="button tiny">'+esc(id)+' · '+esc(t("openLesson"))+' ↗</button>').join("")
 +(DEMOS[g.id]?'<a class="button tiny" href="'+esc(DEMOS[g.id])+'">'+esc(t("demos"))+' ↗</a>':"")+'</div></div>'
 +'<div class="guide-sources"><strong>'+esc(t("docs"))+'</strong><div>'+reference.map(s=>
 '<a href="'+esc(s.url)+'" target="_blank" rel="noopener noreferrer">'+esc(s.title)+' ↗</a>').join("")+'</div></div>'
 +'</div></details>';
}
function cards(){
 const candidates=map.guides.filter(g=>g.tier===selectedTier);
 return '<section class="guide-section"><div class="guide-heading"><div><div class="eyebrow">02 / PLAIN-LANGUAGE LEARNING</div>'
 +'<h3>'+esc(selectedTier)+' · '+esc(LEVELS[selectedTier][locale])+'</h3><p>'+esc(t("tierHint"))+'</p></div>'
 +'<span class="tag">'+candidates.length+' '+esc(t("guideCount"))+'</span></div>'
 +'<div class="guide-cards">'+candidates.map(guideCard).join("")+'</div></section>';
}
function resources(){
 const needle=query.toLocaleLowerCase().trim();
 const filtered=map.documents.filter(d=>(filterTier==="all"||d.level===filterTier)&&
   (filterProduct==="all"||d.product===filterProduct)&&
   (filterStatus==="all"||(filterStatus==="available"&&d.verifiedLive)||(filterStatus==="unavailable"&&!d.verifiedLive))&&
   (!needle||(d.title+" "+d.url+" "+d.product+" "+d.category.join(" ")).toLocaleLowerCase().includes(needle)));
 const visible=filtered.slice(0,shown);
 const filters='<div class="guide-filters"><input type="search" id="guide-search" maxlength="100" value="'+esc(query)+'" placeholder="'+esc(t("search"))+'" aria-label="'+esc(t("search"))+'">'
 +'<select id="guide-product" aria-label="Product"><option value="all">'+esc(t("all"))+' products</option>'
 +["Codex","ChatGPT","Platform"].map(p=>'<option value="'+p+'" '+(filterProduct===p?"selected":"")+'>'+p+'</option>').join("")+'</select>'
 +'<select id="guide-doc-tier" aria-label="'+esc(t("level"))+'"><option value="all">'+esc(t("all"))+' levels</option>'
 +TIERS.map(tier=>'<option value="'+tier+'" '+(filterTier===tier?"selected":"")+'>'+esc(tier)+'</option>').join("")+'</select>'
 +'<select id="guide-status" aria-label="Source HTTP status"><option value="all">All status</option>'
 +'<option value="available" '+(filterStatus==="available"?"selected":"")+'>HTTP 200 · '+map.sourceIndex.httpReachable+'</option>'
 +'<option value="unavailable" '+(filterStatus==="unavailable"?"selected":"")+'>HTTP 404 · '+map.sourceIndex.httpUnavailable+'</option></select>'
 +'<button type="button" class="button tiny" data-guide-clear>'+esc(t("clear"))+'</button></div>';
 return '<section class="guide-section guide-shelf" id="guide-source-index"><div class="guide-heading"><div><div class="eyebrow">03 / SOURCE-TO-LESSON REGISTRY</div>'
 +'<h3>'+esc(t("docsTitle"))+'</h3><p>'+esc(t("sourceNote"))+'</p></div><span class="tag">'+filtered.length+' / '+map.documents.length+' '+esc(t("sourceCount"))+'</span></div>'
 +filters+'<div class="guide-doc-list">'+(visible.length?visible.map(d=>{
   const guide=map.guides.find(g=>g.id===d.guide),label=guide?guide[locale].title:d.guide;
   return '<article class="guide-document"><div class="guide-document-main"><a href="'+esc(d.url)+'" target="_blank" rel="noopener noreferrer">'+esc(d.title)+' ↗</a>'
   +'<small>'+esc(d.product)+' · ' +esc(d.level)+(d.legacy?' · '+esc(t("legacy")):'')+' · '+esc(d.verifiedLive?t("live"):(d.sourceHttp===404?t("outdated"):t("notLive")))+'</small>'
   +(d.sourceHeadings?.length?'<small class="guide-source-outline">'+esc(d.sourceHeadings[0])+'</small>':'')+'</div>'
   +'<button type="button" data-guide-jump="'+esc(d.guide)+'" class="guide-map-link">'+esc(label)+' →</button></article>';
 }).join(""):'<p class="guide-empty">'+esc(t("filterEmpty"))+'</p>')+'</div>'
 +(filtered.length>shown?'<button type="button" data-guide-more class="button secondary guide-more">'+esc(t("show"))+' ('+(filtered.length-shown)+')</button>':"")
 +'<p class="guide-copyright">'+esc(t("docsHint"))+'</p></section>';
}
function render(lang="vi"){
 locale=lang==="en"?"en":"vi";
 if(!map)return '<div class="guide-loading" role="status">Loading learning map…</div>';
 const count=map.documents.length;
 return '<div class="guide-screen">'
 +'<div class="guide-hero"><div><div class="eyebrow">START → LEARN → PRACTICE → VERIFY</div><h2>'+esc(t("title"))+'</h2>'
 +'<p>'+esc(t("sub"))+'</p><div class="guide-actions"><button type="button" data-guide-start class="button primary">'+esc(t("start"))+' ↗</button>'
 +'<button type="button" data-guide-roadmap class="button secondary">'+esc(t("roadmap"))+' →</button>'
 +'<button type="button" data-guide-scroll class="button outline">'+count+' '+esc(t("links"))+' ↓</button>'
 +'<a href="./'+(locale==="vi"?"HANDBOOK_VI.md":"HANDBOOK_EN.md")+'" class="button secondary" target="_blank" rel="noopener noreferrer">'+esc(t("handbook"))+' ↗</a></div></div>'
 +'<div class="guide-preview" role="img" aria-label="'+esc(locale==="vi"?"Sơ đồ: Hiểu → Thử → Kiểm chứng":"Diagram: Learn → Try → Verify")+'">'
 +'<div class="guide-preview-step"><b>01</b><span>'+esc(locale==="vi"?"Hiểu":"Learn")+'</span></div>'
 +'<div class="guide-preview-arrow">↓</div>'
 +'<div class="guide-preview-step"><b>02</b><span>'+esc(locale==="vi"?"Thực hành":"Try it")+'</span></div>'
 +'<div class="guide-preview-arrow">↓</div>'
 +'<div class="guide-preview-step"><b>03</b><span>'+esc(locale==="vi"?"Kiểm chứng":"Verify")+'</span></div>'
 +'<small>19 '+esc(t("guideCount"))+' · '+count+' '+esc(t("sourceCount"))+'</small></div></div>'
 +'<div class="guide-warning-inline">'+esc(t("changed"))+' · '+esc(t("sourceNote"))+'</div>'
 +tiers()+cards()+resources()+'</div>';
}
function bind(element){
 if(element.dataset.guideBound==="yes")return;
 element.dataset.guideBound="yes";
 element.addEventListener("click",e=>{
  if(!e.target.closest(".guide-screen"))return;
  const tier=e.target.closest("[data-guide-tier]");
  if(tier){selectedTier=tier.dataset.guideTier;opened=null;paint();return}
  const lesson=e.target.closest("[data-guide-lesson]");
  if(lesson){onOpenLesson(lesson.dataset.guideLesson);return}
  if(e.target.closest("[data-guide-scroll]")){
   element.querySelector("#guide-source-index")?.scrollIntoView({block:"start",behavior:"smooth"});return;
  }
  if(e.target.closest("[data-guide-start]")){onStart();return}
  if(e.target.closest("[data-guide-roadmap]")){onRoadmap();return}
  const jump=e.target.closest("[data-guide-jump]");
  if(jump){
   const item=map.guides.find(g=>g.id===jump.dataset.guideJump);
   if(item){selectedTier=item.tier;opened=item.id;paint();
    element.querySelector('[data-guide-card="'+item.id+'"]')?.scrollIntoView({block:"center",behavior:"smooth"});}
   return;
  }
  if(e.target.closest("[data-guide-clear]")){query="";filterTier="all";filterProduct="all";filterStatus="all";shown=12;paint();return}
  if(e.target.closest("[data-guide-more]")){shown=Math.min(shown+16,map.documents.length);paint();return}
 });
 element.addEventListener("toggle",e=>{
  if(e.target?.matches?.("[data-guide-card]")&&e.target.open)opened=e.target.dataset.guideCard;
 },true);
 element.addEventListener("input",e=>{
  if(e.target?.id==="guide-search"){
   query=e.target.value.slice(0,100);shown=12;
   const pos=e.target.selectionStart;
   paint();
   const input=$("guide-search");input?.focus();try{input?.setSelectionRange(pos,pos)}catch{}
  }
 });
 element.addEventListener("change",e=>{
  if(e.target?.id==="guide-product"){filterProduct=e.target.value;shown=12;paint()}
  if(e.target?.id==="guide-doc-tier"){filterTier=e.target.value;shown=12;paint()}
  if(e.target?.id==="guide-status"){filterStatus=e.target.value;shown=12;paint()}
 });
}
function paint(){
 const content=$("content");
 if(content){content.innerHTML=render(locale);bind(content)}
}
function mount(lang="vi"){locale=lang==="en"?"en":"vi";paint()}
function configure({openLesson,start,roadmap}={}){
 if(typeof openLesson==="function")onOpenLesson=openLesson;
 if(typeof start==="function")onStart=start;
 if(typeof roadmap==="function")onRoadmap=roadmap;
}
root.CodexGuideScreen={load,valid,render,mount,configure,getState:()=>({guides:map?.guides.length||0,sources:map?.documents.length||0,tier:selectedTier,filterProduct,filterTier,filterStatus})};
})(window);
/* 3-minute zero-jargon onboarding atop the existing Codex Path scheduler. */
(function(root){
"use strict";
const C=root.CodexStarterCore,KEY="codex-path-starter-v1";
const T={
 vi:{intro:"KHỞI ĐẦU TRONG 3 PHÚT · KHÔNG CẦN CODE",title:"Ai cũng có thể bắt đầu từ đây.",sub:"Không biết Git, terminal hay lập trình cũng được. Chọn mình là ai → chọn một việc nhỏ → thử prompt, xem ví dụ, tự kiểm tra.",privacy:"Không tài khoản • Không API key • Không gửi thông tin đi đâu",step1:"1. Chọn mục đích của bạn",step2:"2. Chọn việc muốn làm hôm nay",step3:"3. Thử ngay với ví dụ an toàn",note:"Mẫu minh họa — không phải câu trả lời từ AI thật.",promptTitle:"Prompt đã soạn sẵn — có thể sửa khi dán vào ChatGPT hoặc Codex",exampleTitle:"Ví dụ kết quả sẽ trông như thế nào",copy:"Sao chép prompt",openChat:"Mở ChatGPT ↗",next:"Tiếp lộ trình học theo mình ↗",check1:"Tôi đã đọc và xem lại ví dụ",check2:"Tôi hiểu: không nhập dữ liệu cá nhân, không cho agent tự hành động",mark:"Hoàn thành bài đầu tiên ✓",done:"ĐÃ HOÀN THÀNH FIRST WIN",doneNote:"Đây là kết quả tự xác nhận trên trình duyệt, không phải chứng chỉ hoặc kết quả được AI chấm.",levelHead:"Chưa rõ trình độ? Thử 4 câu hỏi nhanh",levelHint:"Chọn đáp án gần đúng nhất. Bài này chỉ gợi ý nơi bắt đầu, không công nhận kỹ năng chuyên môn.",score:"Gợi ý bắt đầu ở cấp",quizButton:"Xem đề xuất",needAll:"Hãy chọn đủ bốn câu.",ready:"Đã gợi ý lộ trình",feedback:"Prompt đã sao chép. Có thể thử trong công cụ mình có. Nhớ kiểm tra kết quả thật.",clipboardErr:"Không tự sao chép được; hãy bôi đen prompt và dùng Copy.",glossary:"Chưa biết những từ này cũng không sao",glossaryBody:"Prompt = yêu cầu gửi AI; repo = thư mục dự án có lịch sử; commit = mốc lưu thay đổi; diff = phần đã sửa; test = bước kiểm tra; deploy = đưa bản mới lên web; agent = trợ lý có thể xử lý nhiều bước trong phạm vi được cho phép.",tip:"Khi nào nên dùng Codex?",tipBody:"Dùng ChatGPT để hỏi, học, lên ý tưởng. Khi bạn muốn agent đọc hoặc sửa mã trong một dự án, cân nhắc Codex và luôn rà soát quyền, diff và kiểm thử. Không cần cài Codex để hoàn thành bước đầu.",levels:"Năm cấp độ",levelList:"Zero (chưa biết) → Beginner → Intermediate → Advanced → Pro. Pro cần sản phẩm được kiểm chứng, không thể đạt chỉ vì trả lời quiz.",demo:"Đầu ra mẫu, không có kết nối AI",sample:"Dữ liệu mẫu",language:"Tiếng Việt",trackCount:"tuyến học",taskSelected:"Đang thực hành",copyPrompt:"Sao chép để dùng",newbie:"Tôi không biết nên chọn gì",newbieBody:"Mặc định chọn AI cho mọi người. Không cần khai nghề nghiệp, không cần API key.",roleSet:"Đã chọn tuyến học",finished:"Đã ghi nhận tự hoàn thành",progressHint:"Bước tiếp theo: chọn khóa học cá nhân hóa, học bài L26 và tự kiểm tra.",professional:"Tôi đã biết công nghệ",toolChoice:"Không mở tài khoản hoặc cài CLI tại bước này.",source:"Tài liệu nền tảng chính thức ↗",question:"Câu",done1:"Đã xem kết quả",done2:"Đã kiểm tra an toàn"},
 en:{intro:"START IN 3 MINUTES · NO CODE REQUIRED",title:"Everyone starts somewhere.",sub:"You don’t need Git, terminals or coding knowledge. Choose who you are → pick a small task → try a safe prompt, review an example and check your work.",privacy:"No account • No API key • No data uploads",step1:"1. What matters to you?",step2:"2. What would you like to do today?",step3:"3. Try it safely",note:"Illustrative example — not a live AI response.",promptTitle:"Ready-to-edit prompt — use in ChatGPT or Codex",exampleTitle:"A sample result might look like this",copy:"Copy prompt",openChat:"Open ChatGPT ↗",next:"Continue my learning path ↗",check1:"I reviewed the example",check2:"I understand: no personal data or unapproved agent actions",mark:"Complete first win ✓",done:"FIRST WIN COMPLETED",doneNote:"Self-reported browser progress, not a certificate or automatic grading.",levelHead:"Unsure of your level? Four quick questions",levelHint:"Choose the closest answers. This only recommends a starting point, not professional accreditation.",score:"Suggested starting level",quizButton:"Get recommendation",needAll:"Answer all four questions first.",ready:"Path suggestion ready",feedback:"Prompt copied. Try it in your own tool, and review the real result.",clipboardErr:"Clipboard unavailable: select and copy the prompt manually.",glossary:"It's okay not to know these words",glossaryBody:"Prompt = your request; repo = a versioned project folder; commit = saved change; diff = what changed; test = verification; deploy = publishing a new version; agent = an assistant with bounded tool permissions.",tip:"When do you use Codex?",tipBody:"Use ChatGPT to ask, learn and plan. Use Codex when an authorized agent needs to inspect or change a software project; always review permissions, diffs and tests. Codex is not required for the first win.",levels:"Five levels",levelList:"Zero → Beginner → Intermediate → Advanced → Pro. Pro requires reviewed projects, not a multiple-choice score.",demo:"Illustrative only, no live AI connection",sample:"Synthetic data",language:"English",trackCount:"paths",taskSelected:"Current practice",copyPrompt:"Copy and adapt",newbie:"I don't know where to start",newbieBody:"Choose Everyday AI by default. No career choice or API key required.",roleSet:"Learning track selected",finished:"Self-completion saved",progressHint:"Next: open a personalized plan, complete L26 and review the result.",professional:"I'm technical already",toolChoice:"No registration or CLI install needed for this step.",source:"Official foundational training ↗",question:"Question",done1:"Example reviewed",done2:"Privacy checked"}
};
const $=id=>document.getElementById(id);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
let state={persona:"everyday",task:"plan",checked1:false,checked2:false,firstWin:false,quiz:[null,null,null,null],level:"Zero",message:""};
let locale="vi",applyPath=()=>{};
function load(){
 try{
  const old=JSON.parse(localStorage.getItem(KEY)||"null");
  if(old&&C.findPersona(old.persona)&&C.findTask(old.task)){
   state.persona=old.persona;
   state.task=C.findPersona(old.persona).tasks.includes(old.task)?old.task:C.findPersona(old.persona).tasks[0];
   state.firstWin=old.firstWin===true;
   state.checked1=old.checked1===true;
   state.checked2=old.checked2===true;
   if(C.LEVELS.includes(old.level))state.level=old.level;
  }
 }catch{}
}
function save(){
 try{localStorage.setItem(KEY,JSON.stringify({schema:1,persona:state.persona,task:state.task,
  firstWin:state.firstWin,checked1:state.checked1,checked2:state.checked2,level:state.level}))}catch{}
}
function t(k){return T[locale][k]||k}
function choiceTiles(){
 const primary=C.PERSONAS.slice(0,8),other=C.PERSONAS.slice(8);
 function tile(p){
  return '<button type="button" data-starter-persona="'+esc(p.id)+'" class="starter-persona '+(state.persona===p.id?"selected":"")+'" aria-pressed="'+(state.persona===p.id)+'">'
   +'<span class="starter-icon" aria-hidden="true">'+esc(p.symbol)+'</span><span><strong>'+esc(locale==="vi"?p.vi:p.en)+'</strong><small>'+esc(locale==="vi"?p.viDesc:p.enDesc)+'</small></span></button>';
 }
 return '<div class="starter-personas">'+primary.map(tile).join("")+'</div>'
 +'<details class="starter-more"><summary>'+esc(t("professional"))+' ('+other.length+')</summary><div class="starter-personas">'+other.map(tile).join("")+'</div></details>';
}
function taskButtons(){
 const p=C.findPersona(state.persona)||C.PERSONAS[0];
 return '<div class="starter-tasks">'+p.tasks.map(id=>{
 const task=C.findTask(id);return '<button class="starter-task '+(state.task===id?"selected":"")+'" data-starter-task="'+esc(id)+'" type="button" aria-pressed="'+(state.task===id)+'"><span class="starter-task-check">'+(state.task===id?"✓":"○")+'</span>'+esc(locale==="vi"?task.vi:task.en)+'</button>'
 }).join("")+'</div>';
}
function quiz(){
 return '<details class="starter-diagnostic"><summary>'+esc(t("levelHead"))+'<span>+</span></summary><p>'+esc(t("levelHint"))+'</p>'
 +C.QUESTIONS.map((question,ix)=>'<fieldset class="starter-question"><legend>'+(ix+1)+'. '+esc(question[locale])+'</legend><div class="starter-answers">'+question.options[locale].map((answer,value)=>
 '<label><input type="radio" name="starter-quiz-'+ix+'" value="'+value+'" data-starter-answer="'+ix+'" '+(state.quiz[ix]===value?"checked":"")+'> <span>'+esc(answer)+'</span></label>').join("")+'</div></fieldset>').join("")
 +'<div class="starter-diagnostic-footer"><button type="button" class="button primary" data-starter-quiz>'+esc(t("quizButton"))+'</button><strong id="starter-quiz-result" role="status" aria-live="polite">'+esc(state.quiz.every(Number.isInteger)?t("score")+": "+state.level:"")+'</strong></div></details>';
}
function render(lang="vi"){
 locale=lang==="en"?"en":"vi";
 const task=C.findTask(state.task),person=C.findPersona(state.persona);
 if(!person.tasks.includes(state.task))state.task=person.tasks[0];
 const sample=C.sample(state.persona,state.task,locale),prompt=C.prompt(state.persona,state.task,locale);
 const finished=state.firstWin===true;
 return '<div class="starter-screen">'
 +'<div class="starter-heading"><div><div class="eyebrow">'+esc(t("intro"))+'</div><h2>'+esc(t("title"))+'</h2><p>'+esc(t("sub"))+'</p></div><span class="starter-privacy">✓ '+esc(t("privacy"))+'</span></div>'
 +'<div class="starter-progress"><span>01 '+esc(t("step1").slice(3))+'</span><span>02 '+esc(t("step2").slice(3))+'</span><span>03 '+esc(t("step3").slice(3))+'</span></div>'
 +'<section class="starter-block"><div class="starter-block-heading"><h3>'+esc(t("step1"))+'</h3><span>'+C.PERSONAS.length+' '+esc(t("trackCount"))+'</span></div>'
 +choiceTiles()+'</section>'
 +'<section class="starter-block"><div class="starter-block-heading"><h3>'+esc(t("step2"))+'</h3><span>'+esc(t("sample"))+'</span></div>'
 +taskButtons()+'</section>'
 +'<section class="starter-block starter-practice"><div class="starter-block-heading"><h3>'+esc(t("step3"))+'</h3><span>'+esc(t("demo"))+'</span></div>'
 +'<div class="starter-columns"><div class="starter-prompt"><h4>'+esc(t("promptTitle"))+'</h4><textarea id="starter-prompt" spellcheck="false" maxlength="1700" aria-label="'+esc(t("promptTitle"))+'">'+esc(prompt)+'</textarea>'
 +'<div class="starter-inline-actions"><button data-starter-copy class="button primary" type="button">'+esc(t("copy"))+' ↗</button><a class="button secondary" href="https://chatgpt.com/" target="_blank" rel="noopener noreferrer">'+esc(t("openChat"))+'</a></div>'
 +'<p class="starter-subnote">'+esc(t("toolChoice"))+'</p></div>'
 +'<div class="starter-example"><h4>'+esc(t("exampleTitle"))+'</h4><ol>'+sample.map(item=>'<li>'+esc(item)+'</li>').join("")+'</ol><p>'+esc(t("note"))+'</p></div></div>'
 +'<div class="starter-review">'
 +'<label><input type="checkbox" id="starter-check1" '+(state.checked1?"checked":"")+'> <span>'+esc(t("check1"))+'</span></label>'
 +'<label><input type="checkbox" id="starter-check2" '+(state.checked2?"checked":"")+'> <span>'+esc(t("check2"))+'</span></label>'
 +'<div class="starter-next"><button class="button primary" type="button" data-starter-finish '+(state.checked1&&state.checked2?"":"disabled")+'>'+esc(finished?t("finished"):t("mark"))+'</button>'
 +'<button class="button secondary" type="button" data-starter-apply>'+esc(t("next"))+'</button></div>'
 +'<p id="starter-message" role="status" aria-live="polite">'+esc(state.message||(finished?t("done")+" — "+t("doneNote"):t("progressHint")))+'</p></div></section>'
 +quiz()
 +'<div class="starter-knowledge"><div><h4>'+esc(t("glossary"))+'</h4><p>'+esc(t("glossaryBody"))+'</p></div><div><h4>'+esc(t("tip"))+'</h4><p>'+esc(t("tipBody"))+'</p><a href="https://developers.openai.com/training" target="_blank" rel="noopener noreferrer">'+esc(t("source"))+'</a></div></div>'
 +'<p class="starter-level-note">'+esc(t("levelList"))+'</p></div>';
}
function paint(){
 const content=$("content");if(content){content.innerHTML=render(locale);bind(content)}
}
function bind(container){
 if(!container)return;
 if(container.dataset.starterBound==="yes")return;
 container.dataset.starterBound="yes";
 container.addEventListener("click",async event=>{
  const p=event.target.closest("[data-starter-persona]");
  if(p){
   if(!C.findPersona(p.dataset.starterPersona))return;
   state.persona=p.dataset.starterPersona;state.task=C.findPersona(state.persona).tasks[0];
   state.checked1=false;state.checked2=false;state.firstWin=false;state.message="";
   save();paint();return;
  }
  const task=event.target.closest("[data-starter-task]");
  if(task){
   if(!C.findPersona(state.persona).tasks.includes(task.dataset.starterTask))return;
   state.task=task.dataset.starterTask;state.checked1=false;state.checked2=false;state.firstWin=false;state.message="";
   save();paint();return;
  }
  if(event.target.closest("[data-starter-copy]")){
   const txt=$("starter-prompt")?.value||"";
   if(!txt.trim()||txt.length>1700)return;
   // Conservative extra warning on obvious personal details or credential formats.
   // This is not an exhaustive secret detector; users must review before sharing.
   if(/sk-[A-Za-z0-9_-]{10,}|ghp_[A-Za-z0-9_]{10,}|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(txt)){
     state.message=locale==="vi"?"Có vẻ prompt chứa email hoặc thông tin đăng nhập. Hãy thay bằng dữ liệu giả trước khi sao chép.":"Possible email or credential detected. Replace it with fictional values before copying.";
     if($("starter-message"))$("starter-message").textContent=state.message;
     return;
   }
   try{
    if(!navigator.clipboard)throw Error("Clipboard unavailable");
    await navigator.clipboard.writeText(txt);
    state.message=t("feedback");
   }catch{state.message=t("clipboardErr")}
   if($("starter-message"))$("starter-message").textContent=state.message;
   return;
  }
  if(event.target.closest("[data-starter-finish]")){
   if(!state.checked1||!state.checked2)return;
   state.firstWin=true;state.message=t("done")+" — "+t("doneNote");save();paint();return;
  }
  if(event.target.closest("[data-starter-apply]")){
   applyPath({career:state.persona,level:state.level});
   return;
  }
  if(event.target.closest("[data-starter-quiz]")){
   if(!state.quiz.every(Number.isInteger)){
    const target=$("starter-quiz-result");if(target)target.textContent=t("needAll");return;
   }
   state.level=C.startingLevel(state.quiz);
   save();
   const target=$("starter-quiz-result");
   if(target)target.textContent=t("score")+": "+state.level+" · "+t("ready");
   return;
  }
 });
 container.addEventListener("change",event=>{
  const index=event.target?.dataset?.starterAnswer;
  if(index!==undefined){
   const i=Number(index),v=Number(event.target.value);
   if(Number.isInteger(i)&&i>=0&&i<4&&Number.isInteger(v)&&v>=0&&v<=2)state.quiz[i]=v;
   return;
  }
  if(event.target?.id==="starter-check1"||event.target?.id==="starter-check2"){
   state[event.target.id==="starter-check1"?"checked1":"checked2"]=event.target.checked;
   if(!state.checked1||!state.checked2)state.firstWin=false;
   save();
   const button=container.querySelector("[data-starter-finish]");
   if(button)button.disabled=!(state.checked1&&state.checked2);
  }
 });
}
function configure({onApplyPath}={}){
 if(typeof onApplyPath==="function")applyPath=onApplyPath;
 load();
}
function mount(localeArg="vi"){
 const content=$("content");
 if(!content)return;
 content.innerHTML=render(localeArg);
 bind(content);
}
root.CodexStartScreen={configure,mount,render,getState:()=>({persona:state.persona,task:state.task,level:state.level,firstWin:state.firstWin})};
})(window);

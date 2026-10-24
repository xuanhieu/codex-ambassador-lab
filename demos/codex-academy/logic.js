/* Academy deterministic browser/node helpers. No storage, network or DOM dependencies. */
(function(root,factory){
"use strict";
const api=factory();
root.AcademyLogic=api;
if(typeof module==="object"&&module.exports)module.exports=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
"use strict";
const ALLOWED_HOSTS=new Set(["learn.chatgpt.com","developers.openai.com","platform.openai.com"]);
const TIERS=["Zero","Beginner","Intermediate","Advanced","Pro"];
const ROLES=["Newbie","Creator","Marketer","Developer","Team Lead","Pro"];
function safeUrl(raw){
 try{
  if(typeof raw!=="string"||raw.length>1000||/[\\\s\u0000-\u001f]/.test(raw))return false;
  const uri=new URL(raw);
  return uri.protocol==="https:"&&ALLOWED_HOSTS.has(uri.hostname)&&!uri.username&&!uri.password&&(!uri.port||uri.port==="443");
 }catch{return false}
}
function fold(value){
 return String(value??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/đ/g,"d").replace(/Đ/g,"D").toLowerCase().trim();
}
function filterDocs(sources,opts){
 const q=fold(opts.q),product=opts.product||"",level=opts.level||"",category=opts.category||"";
 return sources.filter(d=>{
  if(product&&d.product!==product)return false;
  if(level&&d.level!==level)return false;
  if(category&&!d.categories.includes(category))return false;
  if(opts.hideLegacy&&d.legacy)return false;
  if(q&&!fold([d.title,d.product,d.type,d.level,d.categories.join(" ")].join(" ")).includes(q))return false;
  return safeUrl(d.url);
 });
}
function filterLessons(lessons,opts){
 const q=fold(opts.q||"");
 return lessons.filter(row=>(!opts.level||row.level===opts.level)
  &&(!opts.role||row.audience.includes(opts.role))
  &&(!q||fold(row.en.title+" "+row.vi.title+" "+row.en.purpose+" "+row.vi.purpose).includes(q)));
}
function percentage(done,total){return total?Math.max(0,Math.min(100,Math.round(100*done/total))):0}
function completionReady(lesson,checks,answer){
 return Array.isArray(checks)&&checks.length===lesson.en.exercise.length
  &&checks.every(x=>x===true)
  &&Number.isInteger(answer)&&answer===lesson.en.quiz.answer;
}
function validateBackup(value,lessons,sources){
 if(!value||typeof value!=="object"||Array.isArray(value)||value.schema!==1)
  throw Error("Unsupported backup format");
 const ids=new Set(lessons.map(x=>x.id));
 const docs=new Set(sources.map(x=>x.id));
 function uniq(list,valid,name){
  if(!Array.isArray(list)||list.length>500||list.some(x=>typeof x!=="string"||!valid.has(x))||new Set(list).size!==list.length)
   throw Error("Invalid "+name);
  return [...list];
 }
 const done=uniq(value.completed||[],ids,"completed");
 const bookmarks=uniq(value.bookmarks||[],docs,"bookmarks");
 if(value.checks!=null&&(typeof value.checks!=="object"||Array.isArray(value.checks)))throw Error("Invalid checks");
 const checks={};
 for(const [id,selected] of Object.entries(value.checks||{})){
  const lesson=lessons.find(x=>x.id===id);
  if(!lesson||!Array.isArray(selected)||selected.length!==lesson.en.exercise.length||selected.some(x=>typeof x!=="boolean"))
   throw Error("Invalid exercise checks");
  checks[id]=[...selected];
 }
 const quiz={};
 if(value.quiz!=null&&(typeof value.quiz!=="object"||Array.isArray(value.quiz)))throw Error("Invalid quiz");
 for(const [id,answer] of Object.entries(value.quiz||{})){
  const lesson=lessons.find(x=>x.id===id);
  if(!lesson||!Number.isInteger(answer)||answer<0||answer>=lesson.en.quiz.options.length)
   throw Error("Invalid quiz response");
  quiz[id]=answer;
 }
 // Never import arbitrary Markdown/HTML, user strings, URLs or unknown object keys.
 if(Object.keys(value).some(x=>!["schema","completed","bookmarks","checks","quiz"].includes(x)))
  throw Error("Unexpected backup fields");
 return {schema:1,completed:done,bookmarks,checks,quiz};
}
return {safeUrl,fold,filterDocs,filterLessons,percentage,completionReady,validateBackup,TIERS,ROLES};
});

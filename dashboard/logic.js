(function(root,factory){const api=factory();if(typeof module==="object"&&module.exports)module.exports=api;root.AMB_LOGIC=api;})(typeof window!=="undefined"?window:globalThis,function(){
"use strict";
const own=(obj,key)=>Object.prototype.hasOwnProperty.call(obj,key);
const RE_URL=/^https:\/\/[^\s/?#]+(?:[/?#][^\s]*)?$/i;
const clone=x=>JSON.parse(JSON.stringify(x));
function initialState(data,baseIdeas,extraIdeas){
 return {version:2,values:Object.fromEntries(data.fields.map(f=>[f.key,f.value])),
 statuses:Object.fromEntries(data.fields.map(f=>[f.key,f.status])),
 tasks:Object.fromEntries(data.milestones.map(m=>[m.id,!!m.done])),
 ideas:[...baseIdeas,...extraIdeas].map(x=>({...x})),
 videoChecks:{},note:"",lastSaved:"",submitted:false,submissionReceipt:""};
}
function scoreIdea(idea){
 const hours=Math.max(1,Math.min(100,Number(idea.hours)||6));
 const impact=Math.max(1,Math.min(5,Number(idea.impact)||3));
 // LOCAL prioritization heuristic, not admission odds.
 return Math.round(Math.max(0,Math.min(100,60*impact/5+40*Math.max(0,1-hours/16))));
}
function auditForm(fields,values,statuses){
 const issues=[];let required=0,ready=0,complete=0,verified=0;
 fields.forEach(f=>{
  const v=values[f.key];let fail="";
  const filled=f.type==="checkbox"?v===true:typeof v==="string"&&v.trim().length>0;
  if(f.required)required++;
  if(filled)complete++;
  if(f.required&&!filled)fail="Thiếu thông tin bắt buộc";
  if(f.max&&typeof v==="string"&&[...v].length>f.max)fail="Vượt giới hạn "+f.max+" ký tự";
  if(f.type==="url"&&filled&&!RE_URL.test(String(v)))fail="URL cần bắt đầu bằng https://";
  if(f.type==="email"&&filled&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v))fail="Email không hợp lệ";
  if(f.key==="favorite"&&typeof v==="string"&&/not yet public|\[INSERT|placeholder/i.test(v))fail="Còn nội dung chưa công khai hoặc placeholder";
  if(f.required&&!fail)ready++;
  if(statuses[f.key]==="verified")verified++;
  if(fail)issues.push({key:f.key,label:f.label,message:fail});
 });
 // Strategic evidence gate: Not officially mandatory as a separate field.
 if(!RE_URL.test(String(values.publicRepo||"")))issues.push({key:"publicRepo",label:"Public Codex repo",message:"Chưa có repo công khai đã kiểm chứng (cần cho hồ sơ mạnh)"});
 return {issues,required,ready,complete,verified,gateOpen:issues.length===0,requiredLeft:required-ready};
}
function countdown(target,now=Date.now()){
 let diff=Date.parse(target)-now;const past=diff<=0;diff=Math.max(0,diff);
 return {past,days:Math.floor(diff/86400000),hours:Math.floor(diff/3600000)%24,minutes:Math.floor(diff/60000)%60,totalMinutes:Math.floor(diff/60000)};
}
function validateImported(raw,data,baseIdeas,extraIdeas){
 if(!raw||raw.version!==2||typeof raw!=="object")throw new Error("Sai phiên bản backup. Chỉ hỗ trợ v2.");
 if(!raw.values||typeof raw.values!=="object"||Array.isArray(raw.values))throw new Error("Backup không có trường values hợp lệ.");
 const next=initialState(data,baseIdeas,extraIdeas);
 for(const f of data.fields){
  const v=raw.values[f.key];
  if(f.type==="checkbox"){
   if(typeof v==="boolean")next.values[f.key]=v;
  }else if(typeof v==="string")next.values[f.key]=v.slice(0,20000);
  const st=raw.statuses?.[f.key];
  if(["verified","draft","missing","blocked","confirmed"].includes(st))next.statuses[f.key]=st;
 }
 for(const m of data.milestones)if(typeof raw.tasks?.[m.id]==="boolean")next.tasks[m.id]=raw.tasks[m.id];
 const map=new Map(next.ideas.map(i=>[i.id,i]));
 for(const item of Array.isArray(raw.ideas)?raw.ideas.slice(0,500):[]){
  if(!item||typeof item.id!=="string")continue;
  const status=["backlog","shortlist","building","tested","public"].includes(item.status)?item.status:"backlog";
  if(map.has(item.id))map.get(item.id).status=status;
  else if(/^C\d{10,}$/.test(item.id)&&typeof item.name==="string"&&item.name.trim()){
   const entry={id:item.id,name:item.name.slice(0,180),category:typeof item.category==="string"?item.category.slice(0,100):"Founder operations",hours:Math.max(1,Math.min(40,Number(item.hours)||4)),audience:String(item.audience||"").slice(0,250),mvp:String(item.mvp||"").slice(0,1500),priority:"Fast win",status,origin:"custom",impact:Math.max(1,Math.min(5,Number(item.impact)||3))};
   next.ideas.push(entry);
  }
 }
 if(raw.videoChecks&&typeof raw.videoChecks==="object")for(const [k,v] of Object.entries(raw.videoChecks).slice(0,30))if(typeof v==="boolean")next.videoChecks[k]=v;
 if(typeof raw.note==="string")next.note=raw.note.slice(0,30000);
 if(typeof raw.submissionReceipt==="string")next.submissionReceipt=raw.submissionReceipt.slice(0,2000);
 next.submitted=raw.submitted===true&&!!next.submissionReceipt.trim();
 return next;
}
function safeStatus(current,value,isCheckbox=false){
 if(isCheckbox)return value?"confirmed":"missing";
 return String(value||"").trim()?current==="verified"?"draft":"draft":"missing";
}
return {initialState,scoreIdea,auditForm,countdown,validateImported,safeStatus,RE_URL,clone};
});
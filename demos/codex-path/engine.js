/* Codex Path | deterministic learning/career scheduler. No auth/API/network. */
(function(root,factory){
 const engine=factory();
 if(typeof module==="object"&&module.exports)module.exports=engine;
 if(root)root.CodexPathEngine=engine;
})(typeof window!=="undefined"?window:undefined,function(){
 "use strict";
 const TIERS=["Zero","Beginner","Intermediate","Advanced","Pro"];
 const SAFE_URL=/^https:\/\/[A-Za-z0-9.-]+(?::443)?(?:\/[^\s]*)?$/i;
 const ALLOWED_ROLES=["automation","growth","developer","agents","creator","lead",
  "everyday","student","teacher","office","smallbiz","jobseeker","designer","community"];
 const HOUR_OPTIONS=[1,2,4,6,8,10,15,20];
 const defaults=()=>({career:"everyday",level:"Zero",hours:2,goalWeeks:8,locale:"vi"});
 function clamp(n,low,high){return Math.max(low,Math.min(high,n))}
 function normalizePrefs(input){
  const data=input&&typeof input==="object"&&!Array.isArray(input)?input:{};
  const career=ALLOWED_ROLES.includes(data.career)?data.career:"everyday";
  const level=TIERS.includes(data.level)?data.level:"Zero";
  const hours=HOUR_OPTIONS.includes(Number(data.hours))?Number(data.hours):2;
  const goalWeeks=Number.isInteger(Number(data.goalWeeks))?clamp(Number(data.goalWeeks),2,32):8;
  const locale=data.locale==="en"?"en":"vi";
  return {career,level,hours,goalWeeks,locale};
 }
 function safeUrl(s){return typeof s==="string"&&s.length<=2048&&SAFE_URL.test(s)&&!/^https:\/\/(?:localhost|127\.|0\.0\.0\.0)/i.test(s)}
 function getCareer(data,id){return Array.isArray(data?.careers)?data.careers.find(c=>c.id===id)||null:null}
 function validateCatalog(data){
  if(!data||data.schema!==1||!Array.isArray(data.careers)||!Array.isArray(data.lessons)||!Array.isArray(data.levels))throw Error("Bad curriculum format");
  const ids=new Set();
  for(const lesson of data.lessons){
   if(!lesson||!/^L\d{2}$/.test(lesson.id)||ids.has(lesson.id)||!TIERS.includes(lesson.level)||
      !Number.isInteger(lesson.duration)||lesson.duration<5||lesson.duration>180||
      !Array.isArray(lesson.prerequisites)||!Array.isArray(lesson.sources)||lesson.sources.some(u=>!safeUrl(u))||
      !lesson.en?.title||!lesson.vi?.title)throw Error("Invalid lesson: "+String(lesson?.id));
   ids.add(lesson.id);
  }
  for(const lesson of data.lessons)if(lesson.prerequisites.some(p=>!ids.has(p)||p===lesson.id))throw Error("Invalid prerequisites for "+lesson.id);
  if(data.careers.length<6||new Set(data.careers.map(c=>c.id)).size!==data.careers.length)throw Error("Insufficient career tracks");
  for(const c of data.careers){
   if(!ALLOWED_ROLES.includes(c.id)||!Array.isArray(c.starter)||!Array.isArray(c.growth)||
      [...c.starter,...c.growth].some(id=>!ids.has(id))||!c.capstone?.vi||!c.capstone?.en)throw Error("Invalid career");
  }
  return true;
 }
 function expandAndSort(selectedIds,lessons){
  const map=new Map(lessons.map(x=>[x.id,x]));
  const included=new Set(),visiting=new Set(),order=[];
  function add(id){
   const item=map.get(id);
   if(!item)throw Error("Lesson not found: "+id);
   if(included.has(id))return;
   if(visiting.has(id))throw Error("Prerequisite cycle: "+id);
   visiting.add(id);
   for(const pre of item.prerequisites)add(pre);
   visiting.delete(id);included.add(id);order.push(item);
  }
  // Sequence respects original career-curated order AND prerequisite closure.
  for(const id of selectedIds)add(id);
  return order;
 }
 function buildPlan(data,prefInput){
  validateCatalog(data);
  const prefs=normalizePrefs(prefInput);
  const career=getCareer(data,prefs.career);
  const gate=TIERS.indexOf(prefs.level);
  let selected=[...career.starter,...career.growth].filter(id=>{
   const row=data.lessons.find(l=>l.id===id);return TIERS.indexOf(row.level)>=gate;
  });
  if(selected.length<3)selected=[...career.starter,...career.growth].slice(-5);
  const lessonRows=expandAndSort(selected,data.lessons);
  const capstoneMinutes=career.proofMode==="private"?90:180;
  const capstoneStepMinutes=capstoneMinutes/3;
  const totalMinutes=lessonRows.reduce((x,y)=>x+y.duration,capstoneMinutes);
  // Target weeks affect the actual distribution, capped by available weekly hours.
  // Add headroom for indivisible lessons; this is a plan, not a hard deadline.
  const longest=Math.max(...lessonRows.map(x=>x.duration),capstoneStepMinutes);
  const weeklyGoal=Math.ceil(totalMinutes/prefs.goalWeeks*1.14);
  const weekLimit=Math.min(prefs.hours*60,Math.max(longest,weeklyGoal));
  let week=1,used=0;
  const lessons=lessonRows.map(item=>{
   if(used+item.duration>weekLimit&&used>0){week+=1;used=0}
   const result={id:item.id,week,level:item.level,duration:item.duration,
      prerequisites:item.prerequisites.filter(p=>lessonRows.some(l=>l.id===p)),
      title:item[prefs.locale].title,source:item.sources[0]||"",roles:item.audience};
   used+=item.duration;
   return result;
  });
  const capstoneSteps=[];
  for(let index=1;index<=3;index++){
   const stepMinutes=capstoneStepMinutes;
   if(used+stepMinutes>weekLimit&&used>0){week+=1;used=0}
   capstoneSteps.push({index,week,minutes:stepMinutes});
   used+=stepMinutes;
  }
  const capstoneWeek=week;
  const weeks=[];
  for(let i=1;i<=capstoneWeek;i++){
   const items=lessons.filter(x=>x.week===i);
   const sprint=capstoneSteps.filter(x=>x.week===i);
   const minutes=items.reduce((n,x)=>n+x.duration,0)+sprint.reduce((n,x)=>n+x.minutes,0);
   weeks.push({index:i,lessonIds:items.map(x=>x.id),minutes,
     capstone:sprint.length>0,capstoneMinutes:sprint.reduce((n,x)=>n+x.minutes,0),
     capstoneSteps:sprint.map(x=>x.index)});
  }
  const reachWeeks=weeks.length;
  const status=reachWeeks>prefs.goalWeeks?"more-time-needed":reachWeeks<prefs.goalWeeks?"ahead-of-goal":"on-track";
  return {schema:1,prefs,career,lessons,weeks,totalMinutes,capstoneMinutes,capstoneWeek,capstoneSteps,weekLimit,
    estimatedWeeks:reachWeeks,horizonStatus:status,
    disclaimer:"Estimated self-study time, not a guarantee of employment, certification or mastery."};
 }
 function progress(plan,state={}){
  const done=Array.isArray(state.done)?state.done:[];
  const names=new Set(plan.lessons.map(l=>l.id));
  const completed=[...new Set(done.filter(x=>names.has(x)))];
  const percent=Math.round(completed.length/Math.max(1,plan.lessons.length)*100);
  const unlocked=plan.lessons.filter(l=>!completed.includes(l.id)&&l.prerequisites.every(x=>completed.includes(x)));
  const next=unlocked[0]||plan.lessons.find(l=>!completed.includes(l.id))||null;
  const stage=TIERS.map(level=>{
   const lessons=plan.lessons.filter(l=>l.level===level);
   return {level,total:lessons.length,done:lessons.filter(l=>completed.includes(l.id)).length};
  }).filter(x=>x.total);
  const artifacts=state.artifacts&&typeof state.artifacts==="object"?state.artifacts:{};
  const evidence=Object.values(artifacts).filter(v=>safeUrl(v)).length+
    (plan.career.proofMode==="private" && typeof state.privateProof==="string"&&state.privateProof.trim().length>=35?1:0);
  return {completed:completed.length,total:plan.lessons.length,percent,next,
    remainingMinutes:plan.lessons.filter(l=>!completed.includes(l.id)).reduce((a,b)=>a+b.duration,0),
    stage,evidence};
 }
 function validateState(snapshot,data){
  const lessons=new Set(data.lessons.map(x=>x.id));
  const values=snapshot&&typeof snapshot==="object"&&!Array.isArray(snapshot)?snapshot:{};
  if(values.schema!==1)throw Error("Unsupported backup schema");
  const prefs=normalizePrefs(values.prefs);
  const done=Array.isArray(values.done)?[...new Set(values.done.filter(x=>typeof x==="string"&&lessons.has(x)))]:[];
  const notes={};
  if(values.notes&&typeof values.notes==="object"&&!Array.isArray(values.notes))
   for(const [key,value] of Object.entries(values.notes))
    if(lessons.has(key)&&typeof value==="string")notes[key]=value.slice(0,600);
  const artifacts={};
  if(values.artifacts&&typeof values.artifacts==="object"&&!Array.isArray(values.artifacts))
   for(const [key,value] of Object.entries(values.artifacts))
    if((lessons.has(key)||key==="capstone")&&safeUrl(value))artifacts[key]=value.slice(0,2048);
  const steps={};
  if(values.steps&&typeof values.steps==="object"&&!Array.isArray(values.steps))
   for(const [id,indices] of Object.entries(values.steps)){
    if(!lessons.has(id)||!Array.isArray(indices))continue;
    steps[id]=[...new Set(indices.filter(n=>Number.isInteger(n)&&n>=0&&n<15))].slice(0,15);
   }
  return {schema:1,prefs,done,notes,artifacts,steps,privateProof:typeof values.privateProof==="string"?values.privateProof.slice(0,500):"",
          capstoneConfirmed:values.capstoneConfirmed===true,
          lastUpdated:typeof values.lastUpdated==="string"?values.lastUpdated.slice(0,60):""};
 }
 // Restores saved progress from the raw localStorage string. The origin is shared
 // with other demos, so a bad value (wrong schema, invalid JSON, wrong type) must
 // fall back to a fresh state instead of throwing and blocking the whole app.
 function restoreState(raw,data){
  if(raw==null||raw==="")return {state:initialState(defaults()),corrupt:false};
  try{
   const parsed=JSON.parse(raw);
   if(parsed===null)return {state:initialState(defaults()),corrupt:false};
   return {state:validateState(parsed,data),corrupt:false};
  }catch{
   return {state:initialState(defaults()),corrupt:true};
  }
 }
 function initialState(prefs){return {schema:1,prefs:normalizePrefs(prefs),done:[],notes:{},artifacts:{},steps:{},privateProof:"",capstoneConfirmed:false,lastUpdated:""}}
 function canMarkComplete(plan,state,id){
  const lesson=plan.lessons.find(l=>l.id===id);
  if(!lesson)return {allowed:false,missing:[]};
  const missing=lesson.prerequisites.filter(p=>!state.done.includes(p));
  return {allowed:missing.length===0,missing};
 }
 function readiness(plan,state){
  const p=progress(plan,state);
  const gaps=[];
  if(p.completed<p.total)gaps.push("lessons_pending");
  if(!state.capstoneConfirmed)gaps.push("capstone_not_confirmed");
  if(plan.career.proofMode==="private"){
   if(typeof state.privateProof!=="string"||state.privateProof.trim().length<35)gaps.push("private_evidence_missing");
  }else if(!safeUrl(state.artifacts?.capstone))gaps.push("capstone_evidence_missing");
  return {ready:gaps.length===0,gaps,completed:p.completed,total:p.total,
    note:"Local self-attestation only. Evidence links are syntactically checked but not independently verified."};
 }
 function markdown(plan,state){
  const p=progress(plan,state);
  const lines=[
    "# Codex Path — "+plan.career.name.en,
    "Independent study plan | "+plan.prefs.level+" | "+plan.prefs.hours+" h/week",
    "Estimated "+plan.estimatedWeeks+" week(s), "+plan.totalMinutes+" min (includes "+plan.capstoneMinutes+" min capstone)",
    "Progress: "+p.completed+"/"+p.total+" lessons; human self-reported",
    "",
    "## Weekly roadmap"];
  for(const w of plan.weeks){
   lines.push("### Week "+w.index+" — "+w.minutes+" min");
   for(const l of plan.lessons.filter(x=>x.week===w.index))lines.push(
    "- ["+(state.done.includes(l.id)?"x":" ")+"] "+l.id+" "+l.title+" ("+l.duration+" min) — "+(safeUrl(l.source)?l.source:"no verified source"));
   if(w.capstone)lines.push("- [ ] Capstone: "+plan.career.capstone.en);
  }
  lines.push("","## Evidence checklist",...plan.career.evidence.map(x=>"- [ ] "+x),
             "", "No certification or job guarantee. All private progress stays in your browser.");
  return lines.join("\n");
 }
 return {TIERS,ALLOWED_ROLES,HOUR_OPTIONS,defaults,normalizePrefs,safeUrl,validateCatalog,
   getCareer,buildPlan,progress,validateState,restoreState,initialState,canMarkComplete,readiness,markdown,expandAndSort};
});

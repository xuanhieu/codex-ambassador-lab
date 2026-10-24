/* Offline synthetic documentation snapshots; no fetch, storage, or trackers. */
(() => {
"use strict";
const q=id=>document.getElementById(id);
const labels={
 vi:{heading:"Biết hướng dẫn nào vừa thay đổi. Biết nên xử lý gì trước.",desc:"So sánh snapshot metadata có ID ổn định; phát hiện xóa tài liệu, thay nội dung, đổi URL, đổi tên và xếp mức độ ưu tiên. Không crawler, không API.",beforeDL:"Snapshot trước ↓",afterDL:"Snapshot sau ↓",readme:"CLI + phương pháp ↗",oldSnap:"Bản chụp cũ",newSnap:"Bản chụp mới",replaceOld:"Thay snapshot",replaceNew:"Thay snapshot",compare:"So sánh ngay →",reset:"Dùng dữ liệu mẫu",before:"Tài liệu trước",after:"Tài liệu sau",stable:"Theo ID ổn định",sources:"Metadata nhập thủ công",affected:"Tài liệu ảnh hưởng",events:"Một tài liệu có thể có nhiều sự kiện",critical:"Sự kiện Critical",highrisk:"Ưu tiên xem tài liệu quan trọng",changes:"Danh sách thay đổi",hint:"Rủi ro là điểm ưu tiên nội bộ, không phải kết luận chính thức.",exportCSV:"Xuất CSV ↓",exportJSON:"Xuất JSON ↓",search:"Tìm kiếm",severity:"Độ ưu tiên",type:"Loại thay đổi",allLevels:"Tất cả",allTypes:"Tất cả",manual:"Không có crawler ẩn",manualBody:"Hai JSON do bạn tự cung cấp. Hash phải được nguồn có thẩm quyền hoặc pipeline riêng tính trước; không tự kiểm chứng nguồn gốc metadata.",cli:"Chạy CLI xác minh",cliBody:"Kiểm tra schema, ID trùng, SHA-256 và URL HTTPS. Không gửi request.",noChanges:"Không có thay đổi phù hợp.",snapshotError:"Snapshot không hợp lệ",fileTooBig:"Tệp JSON vượt quá 1 MB",loaded:"đã nạp",items:"sự kiện",prev:"Trước",next:"Sau",source:"Nguồn minh họa",typeRemoved:"Đã xóa",typeAdded:"Mới",typeContent:"Đổi nội dung",typeURL:"Đổi URL",typeTitle:"Đổi tên",typeSection:"Đổi nhóm",typeImportance:"Đổi mức quan trọng"},
 en:{heading:"Know which docs changed. Know what to fix first.",desc:"Compare stable-ID documentation snapshots; find removed, modified, moved and renamed documents and prioritize review. No crawler or API.",beforeDL:"Older snapshot ↓",afterDL:"Newer snapshot ↓",readme:"CLI + methodology ↗",oldSnap:"Old snapshot",newSnap:"New snapshot",replaceOld:"Replace snapshot",replaceNew:"Replace snapshot",compare:"Compare now →",reset:"Use sample data",before:"Documents before",after:"Documents after",stable:"Stable document IDs",sources:"User-supplied metadata",affected:"Affected documents",events:"One doc can have several events",critical:"Critical events",highrisk:"Prioritize important documentation",changes:"Change events",hint:"Risk is an internal prioritization score, not an official quality judgment.",exportCSV:"Export CSV ↓",exportJSON:"Export JSON ↓",search:"Search",severity:"Severity",type:"Change type",allLevels:"All",allTypes:"All",manual:"No hidden crawler",manualBody:"You supply two JSON files. An authoritative source or separate pipeline must compute document hashes first. This tool cannot authenticate metadata.",cli:"Reproducible CLI",cliBody:"Schema, duplicates, SHA-256 format and HTTPS metadata validated. No requests.",noChanges:"No matching changes.",snapshotError:"Invalid snapshot",fileTooBig:"JSON file exceeds 1 MB",loaded:"loaded",items:"events",prev:"Before",next:"After",source:"Example source",typeRemoved:"Removed",typeAdded:"Added",typeContent:"Content",typeURL:"Moved",typeTitle:"Renamed",typeSection:"Category",typeImportance:"Importance"}
};
let locale="vi",before=window.RADAR_FIXTURES.before,after=window.RADAR_FIXTURES.after,report=null;
const t=id=>labels[locale][id]||id;
const SECTIONS=new Set(["Getting started","CLI","Security","Agents","Automation","API","Projects","Policies"]);
function validate(o){
 if(!o||typeof o!=="object"||Array.isArray(o)||Object.keys(o).sort().join("|")!=="documents|label|schema"||o.schema!=="docs-radar-v1"||typeof o.label!=="string"||o.label.length>120||!Array.isArray(o.documents)||o.documents.length>500)throw Error("Unexpected snapshot schema");
 let out=new Map(),urls=new Set();
 for(const d of o.documents){
  if(!d||typeof d!=="object"||Array.isArray(d)||Object.keys(d).sort().join("|")!=="content_sha256|critical|id|section|title|updated|url")throw Error("Bad document metadata keys");
  if(typeof d.id!=="string"||!/^[A-Za-z0-9][A-Za-z0-9._-]{1,79}$/.test(d.id)||out.has(d.id))throw Error("Invalid/duplicate stable ID");
  if(typeof d.title!=="string"||!d.title.trim()||d.title.length>180||!SECTIONS.has(d.section))throw Error("Invalid title/section");
  if(typeof d.content_sha256!=="string"||!/^[a-f0-9]{64}$/.test(d.content_sha256))throw Error("Missing content SHA-256");
  if(typeof d.updated!=="string"||!/^\d{4}-\d{2}-\d{2}$/.test(d.updated)||typeof d.critical!=="boolean")throw Error("Invalid updated or critical");
  if(typeof d.url!=="string"||d.url.length>350||urls.has(d.url))throw Error("Duplicate/invalid HTTPS URL");
  let url;try{url=new URL(d.url)}catch{throw Error("Invalid URL")}
  if(url.protocol!=="https:"||url.username||url.password||!url.hostname||url.hostname.endsWith(".local"))throw Error("Invalid HTTPS URL");
  out.set(d.id,d);urls.add(d.url);
 }
 return out;
}
function compare(oldSnap,newSnap){
 const old=validate(oldSnap),current=validate(newSnap),events=[];
 const bases={removed:88,added:30,title:32,url:65,content_sha256:70,section:38,critical:55};
 function push(doc,type,beforeVal="",afterVal=""){
  let risk=Math.min(100,bases[type]+(doc.critical?13:0));
  events.push({id:doc.id,title:doc.title,section:doc.section,type,risk,critical:doc.critical,
   severity:risk>=80?"critical":risk>=60?"high":risk>=40?"medium":"low",
   old:String(beforeVal),new:String(afterVal),url:doc.url});
 }
 for(const [id,d] of old)if(!current.has(id))push(d,"removed",d.url);
 for(const [id,d] of current)if(!old.has(id))push(d,"added","",d.url);
 for(const [id,d] of current)if(old.has(id)){
  const previous=old.get(id);
  for(const field of ["title","url","section","content_sha256","critical"]){
   if(previous[field]!==d[field])push(d,field,previous[field],d[field]);
  }
 }
 events.sort((a,b)=>b.risk-a.risk||a.id.localeCompare(b.id)||a.type.localeCompare(b.type));
 return {schema:"docs-radar-report-v1",before:oldSnap.label,after:newSnap.label,
 summary:{before:old.size,after:current.size,changed_events:events.length,
 affected_documents:new Set(events.map(e=>e.id)).size,critical_events:events.filter(e=>e.severity==="critical").length},events};
}
function changeLabel(e){return ({removed:t("typeRemoved"),added:t("typeAdded"),content_sha256:t("typeContent"),url:t("typeURL"),title:t("typeTitle"),section:t("typeSection"),critical:t("typeImportance")})[e.type]||e.type}
function txt(el,text){el.textContent=String(text??"")}
function element(tag,cls,text){let e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)txt(e,text);return e}
function rows(){
 const target=q("rows");target.replaceChildren();if(!report)return;
 const query=q("search").value.toLocaleLowerCase(),severity=q("severity").value,type=q("type").value;
 let items=report.events.filter(e=>(!severity||e.severity===severity)&&(!type||e.type===type)&&
 (!query||[e.id,e.title,e.section,e.url,e.old,e.new].join(" ").toLocaleLowerCase().includes(query)));
 q("count").textContent=items.length+" / "+report.events.length+" "+t("items");
 if(!items.length){target.append(element("div","empty",t("noChanges")));return}
 for(const change of items){
  const article=element("article","event");
  article.setAttribute("role","listitem");
  const risk=element("span","risk "+change.severity,String(change.risk));
  const name=element("div","name");
  name.append(element("strong","",change.title),element("small","",change.id+" · "+change.section));
  const tag=element("span","pill",changeLabel(change));
  const severityText=element("span","severity",change.severity);
  let info="";
  if(change.type==="content_sha256")info="SHA256 "+change.old.slice(0,10)+"… → "+change.new.slice(0,10)+"…";
  else if(change.type==="removed")info=change.old;
  else info=change.old&&change.new?change.old+" → "+change.new:change.new||change.old;
  const diff=element("span","diff",info);diff.title=info;
  const link=element("a","go","↗");link.href=change.url;link.target="_blank";link.rel="noopener noreferrer";link.setAttribute("aria-label","Open source metadata URL for "+change.id);
  article.append(risk,name,tag,severityText,diff,link);target.append(article);
 }
}
function show(){
 try{
  report=compare(before,after);
  q("error").hidden=true;
  q("nBefore").textContent=report.summary.before;
  q("nAfter").textContent=report.summary.after;
  q("nAffected").textContent=report.summary.affected_documents;
  q("nCritical").textContent=report.summary.critical_events;
  rows();
 }catch(error){
  report=null;q("error").hidden=false;q("error").textContent=t("snapshotError")+": "+String(error.message).slice(0,240);
  for(const id of ["nBefore","nAfter","nAffected","nCritical"])q(id).textContent="—";
  q("rows").replaceChildren();
 }
}
async function importFile(event,which){
 const file=event.target.files?.[0];if(!file)return;
 if(file.size>1024*1024){q("error").hidden=false;txt(q("error"),t("fileTooBig"));return}
 try{
  const object=JSON.parse(await file.text());validate(object);
  if(which==="before"){before=object;txt(q("oldStatus"),file.name+" · "+t("loaded"))}
  else{after=object;txt(q("newStatus"),file.name+" · "+t("loaded"))}
  show();
 }catch(err){q("error").hidden=false;txt(q("error"),t("snapshotError")+": "+String(err.message).slice(0,180))}
}
function csvCell(value){
 let s=String(value??"");
 if(/^[=+\-@\t\r]/.test(s))s="'"+s; // prevent spreadsheet formula injection
 return '"'+s.replaceAll('"','""')+'"';
}
function download(name,content,type){
 const blob=new Blob([content],{type});
 const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=name;
 document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),200);
}
q("run").addEventListener("click",show);
q("oldInput").addEventListener("change",e=>importFile(e,"before"));
q("newInput").addEventListener("change",e=>importFile(e,"after"));
q("reset").addEventListener("click",()=>{
 before=window.RADAR_FIXTURES.before;after=window.RADAR_FIXTURES.after;
 q("oldInput").value="";q("newInput").value="";
 txt(q("oldStatus"),"before.json · fixture");txt(q("newStatus"),"after.json · fixture");show();
});
for(const id of ["search","severity","type"])q(id).addEventListener(id==="search"?"input":"change",rows);
q("locale").addEventListener("change",e=>{
 locale=e.target.value==="en"?"en":"vi";document.documentElement.lang=locale;
 for(const node of document.querySelectorAll("[data-t]"))txt(node,t(node.dataset.t));
 rows();
});
q("exportJSON").addEventListener("click",()=>{if(report)download("docs-radar-report.json",JSON.stringify(report,null,2),"application/json")});
q("exportCSV").addEventListener("click",()=>{
 if(!report)return;
 const cols=["id","title","section","type","risk","severity","critical","old","new","url"];
 download("docs-radar-events.csv",cols.join(",")+"\r\n"+report.events.map(e=>cols.map(c=>csvCell(e[c])).join(",")).join("\r\n")+"\r\n","text/csv;charset=utf-8");
});
show();
})();
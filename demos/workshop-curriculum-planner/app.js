(function(){"use strict";
const $=id=>document.getElementById(id),C=window.WorkshopPlanner;let current=null;
function render(){
 if(!current)return;
 const list=$("timeline");list.replaceChildren();
 for(const step of current.slots){
  const box=document.createElement("article");box.className="step";
  const time=document.createElement("span");time.className="time";time.textContent=step.start+"–"+step.end+" phút";
  const mins=document.createElement("b");mins.textContent=String(step.minutes)+"m";
  const title=document.createElement("strong");title.textContent=step.vi;
  const detail=document.createElement("p");detail.textContent=step.evidence;
  box.append(time,mins,title,detail);list.append(box);
 }
 const summary=$("summary");summary.replaceChildren();
 const a=document.createElement("strong");a.textContent="Bài thực hành: ";
 summary.append(a,document.createTextNode(current.task));
 const hr=document.createElement("p");hr.textContent="Kiểm tra: "+current.gate;summary.append(hr);
 const link=document.createElement("a");link.href=current.resource;link.textContent="Mở tài liệu / demo liên quan ↗";summary.append(link);
 $("status").textContent="Đã lập "+current.minutes+" phút / "+current.slots.length+" bước. Đầu ra cần kiểm chứng thủ công.";
}
function generate(){
 try{current=C.plan({audience:$("audience").value,topic:$("topic").value,minutes:Number($("minutes").value)});render()}
 catch(e){$("status").textContent="Không hợp lệ: "+e.message}
}
$("generate").addEventListener("click",generate);
for(const key of ["audience","topic","minutes"])$(key).addEventListener("change",()=>{$("status").textContent="Đã thay đổi cấu hình. Bấm Lập giáo án để cập nhật."});
$("copy").addEventListener("click",async()=>{
 if(!current)return;
 try{await navigator.clipboard.writeText(C.markdown(current));$("status").textContent="Đã sao chép giáo án."}
 catch{$("status").textContent="Không thể copy, hãy dùng Xuất Markdown."}
});
$("download").addEventListener("click",()=>{
 if(!current)return;
 const url=URL.createObjectURL(new Blob([C.markdown(current)],{type:"text/markdown;charset=utf-8"}));
 const a=document.createElement("a");a.href=url;a.download="codex-workshop-plan.md";document.body.append(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(url),10000);$("status").textContent="Đã xuất Markdown.";
});
generate();
})();
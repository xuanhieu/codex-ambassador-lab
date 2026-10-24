/* N111 Screenshot Privacy Reviewer. No network, OCR, hidden uploads or EXIF copying. */
(() => {
"use strict";
const C=window.PrivacyRedaction,$=id=>document.getElementById(id);
const PRESETS={
 email:{x:320,y:286,width:570,height:50},
 key:{x:320,y:373,width:630,height:50},
 avatar:{x:1016,y:245,width:94,height:94}
};
const STRINGS={
 vi:{title:"Che thông tin riêng tư trước khi chia sẻ.",desc:"Kéo chọn vùng cần che, xác nhận rồi xuất PNG mới. Công cụ không gửi ảnh đến máy chủ và không nhận token/API key.",safe:"CHẾ ĐỘ LOCAL",uploads:"lần upload",privacy:"Ảnh chỉ nằm trong tab; PNG xuất mới không giữ metadata EXIF của ảnh nhập.",load:"Chọn ảnh cần xử lý",choose:"Chọn PNG, JPEG hoặc WebP",limit:"Tối đa 15 MB, 16 triệu pixel",sample:"Dùng ảnh mẫu có dữ liệu giả",redact:"Khoanh vùng che",drag:"Kéo chuột hoặc ngón tay trên ảnh. Mỗi vùng được tô đặc, không làm mờ.",email:"Che email mẫu",key:"Che mã mẫu",avatar:"Che avatar mẫu",numeric:"Thêm vùng bằng tọa độ (%)",numericInfo:"Dành cho bàn phím hoặc ảnh cần tọa độ chính xác.",left:"Từ trái",top:"Từ trên",width:"Rộng",height:"Cao",addNumeric:"+ Thêm vùng",undo:"↶ Hoàn tác",clear:"Xóa tất cả",export:"Xuất ảnh an toàn",reviewed:"Tôi đã kiểm tra mọi vùng chứa dữ liệu nhạy cảm, kể cả thông tin nhỏ trong ảnh.",download:"Xuất PNG đã che ↓",exportHint:"Ảnh gốc không bị ghi đè. PNG mới có hình chữ nhật đặc, không giữ lớp che có thể tháo gỡ.",preview:"Kiểm tra ảnh trước khi xuất",note:"Che kín toàn bộ dữ liệu. PNG xuất dùng các khối màu đặc thay vì lớp phủ có thể bỏ.",legend:"Vùng được che",checkTitle:"Checklist trước khi đăng",checkDesc:"Kiểm tra thanh địa chỉ, tab, tên tệp, email, điện thoại, token, ảnh đại diện và mã QR.",docs:"Hướng dẫn xử lý ↗",sampleReady:"Ảnh mẫu đang hiển thị · không chứa dữ liệu thật",selected:"Đã chọn ảnh",masks:"vùng đã che",sampleMode:"MẪU GIẢ LẬP",customMode:"ẢNH RIÊNG · CHƯA UPLOAD",draw:"Vùng che mới",invalid:"Kích thước vùng quá nhỏ hoặc không hợp lệ",noImage:"Chưa có ảnh hợp lệ",limitError:"Ảnh không hợp lệ: chỉ PNG/JPEG/WebP tối đa 15 MB và 16 triệu pixel.",tooMany:"Tối đa 100 vùng che",saved:"Đã khởi tạo tải xuống PNG. Kiểm tra file trước khi chia sẻ.",saveError:"Không thể xuất PNG từ ảnh này.",needsReview:"Đánh dấu checklist và tạo ít nhất một vùng che trước khi xuất.",reset:"Đã làm mới ảnh mẫu.",added:"Đã thêm vùng che.",undone:"Đã hoàn tác vùng cuối.",cleared:"Đã xóa tất cả vùng che."},
 en:{title:"Redact private data before you share.",desc:"Drag over sensitive areas, review and export a new PNG. No uploads, API keys or accounts.",safe:"LOCAL MODE",uploads:"uploads",privacy:"Your image stays in the tab. Re-encoded PNG drops the input image's EXIF metadata.",load:"Choose an image",choose:"Select PNG, JPEG or WebP",limit:"Up to 15 MB / 16 million pixels",sample:"Load synthetic screenshot",redact:"Cover sensitive areas",drag:"Drag over the image with a pointer or touch. Every region uses an opaque fill, not a blur.",email:"Cover sample email",key:"Cover sample key",avatar:"Cover sample avatar",numeric:"Add a region by percent",numericInfo:"Useful for keyboard access or exact dimensions.",left:"From left",top:"From top",width:"Width",height:"Height",addNumeric:"+ Add region",undo:"↶ Undo",clear:"Clear all",export:"Export a sanitized image",reviewed:"I reviewed ALL sensitive regions, including small text and QR codes.",download:"Export redacted PNG ↓",exportHint:"Original untouched. New PNG contains opaque pixels rather than removable overlay layers.",preview:"Review image before export",note:"Cover every detail. Exported PNG contains opaque masks that cannot be removed as layers.",legend:"Redacted region",checkTitle:"Pre-publish checklist",checkDesc:"Check browser URL, tabs, filenames, email, phone, tokens, avatars and QR codes.",docs:"Read guide ↗",sampleReady:"Synthetic screenshot active — no real data",selected:"Selected image",masks:"redacted regions",sampleMode:"SYNTHETIC SAMPLE",customMode:"LOCAL IMAGE · NO UPLOAD",draw:"New redaction",invalid:"Invalid or too-small region",noImage:"No valid image",limitError:"Invalid image: PNG/JPEG/WebP only, 15 MB / 16 million pixels max.",tooMany:"Maximum 100 masks",saved:"PNG download requested. Inspect the file before sharing.",saveError:"Could not export PNG.",needsReview:"Add a redaction AND tick the review confirmation before export.",reset:"Sample reset.",added:"Region added.",undone:"Last region removed.",cleared:"All masks removed."}
};
let lang="vi";
const s={image:null,width:0,height:0,filename:"sample",sample:true,rects:[],drawing:null,previewScale:1};
function t(k){return STRINGS[lang][k]||k}
function notice(message,isError=false){
 const el=$("message");el.hidden=false;el.classList.toggle("error",isError);el.textContent=message;
}
function setDisplayText(key,value){$(key).textContent=value}
function updateControls(){
 $("maskCount").textContent=s.rects.length+" "+t("masks");
 $("undo").disabled=s.rects.length===0;$("clear").disabled=s.rects.length===0;
 $("download").disabled=!(s.image&&s.rects.length>0&&$("reviewed").checked);
 for(const b of document.querySelectorAll("[data-sample-mask]"))b.disabled=!s.sample;
 setDisplayText("dimensions",s.width+" × "+s.height);
 $("stageState").textContent=t(s.sample?"sampleMode":"customMode");
}
function safeRect(rect){return C.normalizeRect({x:rect.x,y:rect.y},{x:rect.x+rect.width,y:rect.y+rect.height},s.width,s.height)}
function addRect(rect){
 if(s.rects.length>=100){notice(t("tooMany"),true);return false}
 if(!rect){notice(t("invalid"),true);return false}
 s.rects.push(rect);draw();updateControls();notice(t("added"));return true;
}
function draw(){
 const canvas=$("canvas");if(!s.image)return;
 const maxwidth=1440,scale=Math.min(1,maxwidth/s.width);
 const w=Math.max(1,Math.round(s.width*scale)),h=Math.max(1,Math.round(s.height*scale));
 if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h}
 const ctx=canvas.getContext("2d",{alpha:false});
 ctx.drawImage(s.image,0,0,w,h);
 for(const item of s.rects){
  const r={x:item.x*w/s.width,y:item.y*h/s.height,width:item.width*w/s.width,height:item.height*h/s.height};
  ctx.fillStyle="#10151f";ctx.fillRect(r.x,r.y,r.width,r.height);
  ctx.strokeStyle="#7bedc0";ctx.lineWidth=1.2;ctx.strokeRect(r.x+0.5,r.y+0.5,r.width-1,r.height-1);
 }
 if(s.drawing){
  const r=C.normalizeRect(s.drawing.a,s.drawing.b,s.width,s.height);
  if(r){
   const x=r.x*w/s.width,y=r.y*h/s.height,rw=r.width*w/s.width,rh=r.height*h/s.height;
   ctx.fillStyle="rgba(16,21,31,.72)";ctx.fillRect(x,y,rw,rh);
   ctx.strokeStyle="#ffdc86";ctx.lineWidth=2;ctx.setLineDash([6,4]);ctx.strokeRect(x,y,rw,rh);ctx.setLineDash([]);
  }
 }
}
function setImage(image,filename,sample){
 const width=image.width,height=image.height;
 if(!width||!height||width*height>16e6||width>9000||height>9000){
  if(image.close)image.close();notice(t("limitError"),true);return;
 }
 if(s.image&&s.image.close)s.image.close();
 s.image=image;s.width=width;s.height=height;s.filename=filename;s.sample=sample;
 s.rects=[];s.drawing=null;$("reviewed").checked=false;
 $("fileStatus").textContent=sample?t("sampleReady"):t("selected")+": "+filename;
 $("message").hidden=true;
 draw();updateControls();
}
function demo(){
 const canvas=document.createElement("canvas");canvas.width=1200;canvas.height=760;
 const ctx=canvas.getContext("2d",{alpha:false});
 const grad=ctx.createLinearGradient(0,0,1200,760);
 grad.addColorStop(0,"#15253f");grad.addColorStop(1,"#10202d");
 ctx.fillStyle=grad;ctx.fillRect(0,0,1200,760);
 ctx.fillStyle="#203451";ctx.fillRect(55,54,1090,653);
 ctx.fillStyle="#314968";ctx.fillRect(55,54,1090,60);
 for(let i=0;i<3;i++){ctx.fillStyle=["#f17278","#f5ca6e","#9fe0b9"][i];ctx.beginPath();ctx.arc(83+i*22,84,7,0,Math.PI*2);ctx.fill()}
 ctx.fillStyle="#b6d7ec";ctx.font="20px system-ui";ctx.fillText("example.local / release-checklist / screenshots",170,92);
 ctx.fillStyle="#10243b";ctx.fillRect(95,151,1010,491);
 ctx.fillStyle="#eff7ff";ctx.font="700 33px system-ui";ctx.fillText("Synthetic QA Evidence",135,213);
 ctx.fillStyle="#93b8ca";ctx.font="19px system-ui";ctx.fillText("Only demonstration data — never enter a real token in a screenshot",135,252);
 ctx.fillStyle="#c3e6e6";ctx.font="21px ui-monospace,monospace";
 ctx.fillText("Email:",138,322);ctx.fillText("training@example.invalid",342,322);
 ctx.fillText("Sample key:",138,409);ctx.fillText("DEMO_ONLY__NOT_AN_API_KEY",342,409);
 ctx.fillText("Issue:",138,492);ctx.fillText("UI-123   status: ready for review",342,492);
 ctx.fillStyle="#234c60";ctx.fillRect(135,536,800,65);
 ctx.fillStyle="#a6f0d0";ctx.font="18px system-ui";ctx.fillText("Drag to mask fields, or use the buttons on the left.",159,575);
 ctx.fillStyle="#80d9d1";ctx.beginPath();ctx.arc(1063,294,49,0,Math.PI*2);ctx.fill();
 ctx.fillStyle="#153e50";ctx.font="48px system-ui";ctx.fillText("?",1050,309);
 setImage(canvas,"synthetic-qa-demo.png",true);
}
const canvas=$("canvas");
function pointFromEvent(e){return C.previewToImage(e,canvas.getBoundingClientRect(),s.width,s.height)}
canvas.addEventListener("pointerdown",e=>{
 if(!s.image||e.button!==0)return;
 e.preventDefault();
 try{
  const p=pointFromEvent(e);
  s.drawing={a:p,b:p,pointer:e.pointerId};canvas.setPointerCapture(e.pointerId);draw()
 }catch(err){notice(t("invalid"),true)}
});
canvas.addEventListener("pointermove",e=>{
 if(!s.drawing||e.pointerId!==s.drawing.pointer)return;
 s.drawing.b=pointFromEvent(e);draw();
});
function finish(e,cancel){
 if(!s.drawing||e.pointerId!==s.drawing.pointer)return;
 const pending=s.drawing;s.drawing=null;
 if(!cancel){
  pending.b=pointFromEvent(e);
  addRect(C.normalizeRect(pending.a,pending.b,s.width,s.height));
 }
 if(canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId);
 draw();
}
canvas.addEventListener("pointerup",e=>finish(e,false));
canvas.addEventListener("pointercancel",e=>finish(e,true));
canvas.addEventListener("lostpointercapture",()=>{if(s.drawing){s.drawing=null;draw()}});
$("fileInput").addEventListener("change",async event=>{
 const file=event.target.files?.[0];if(!file)return;
 if(!["image/png","image/jpeg","image/webp"].includes(file.type)||file.size>15*1024*1024){
  notice(t("limitError"),true);event.target.value="";return;
 }
 try{
  const img=await createImageBitmap(file);
  setImage(img,file.name,false);
 }catch(err){notice(t("limitError"),true)}
 event.target.value="";
});
$("sample").addEventListener("click",()=>{demo();notice(t("reset"))});
document.querySelectorAll("[data-sample-mask]").forEach(b=>b.addEventListener("click",()=>{
 if(!s.sample)return;
 addRect(safeRect(PRESETS[b.dataset.sampleMask]));
}));
$("addNumeric").addEventListener("click",()=>{
 try{
  if(!s.image)throw Error("No image");
  const r=C.fromPercent(...["left","top","width","height"].map(id=>Number($(id).value)),s.width,s.height);
  addRect(r);
 }catch(err){notice(t("invalid"),true)}
});
$("undo").addEventListener("click",()=>{if(s.rects.length){s.rects.pop();draw();updateControls();notice(t("undone"))}});
$("clear").addEventListener("click",()=>{s.rects=[];$("reviewed").checked=false;draw();updateControls();notice(t("cleared"))});
$("reviewed").addEventListener("change",updateControls);
$("download").addEventListener("click",async()=>{
 if(!$("reviewed").checked||s.rects.length===0){notice(t("needsReview"),true);return}
 const out=document.createElement("canvas");out.width=s.width;out.height=s.height;
 const ctx=out.getContext("2d",{alpha:false});
 ctx.drawImage(s.image,0,0);
 try{
  C.redact(ctx,s.rects,"#10151f");
  const blob=await new Promise(resolve=>out.toBlob(resolve,"image/png"));
  if(!blob)throw Error("Canvas export failed");
  const blobURL=URL.createObjectURL(blob);
  const link=document.createElement("a");
  link.href=blobURL;link.download="redacted-screenshot.png"; // Never leak private input filenames in the exported artifact.
  document.body.append(link);link.click();link.remove();
  setTimeout(()=>URL.revokeObjectURL(blobURL),15000);
  notice(t("saved")+" ("+s.rects.length+" "+t("masks")+")");
 }catch(err){notice(t("saveError"),true)}
});
$("language").addEventListener("change",e=>{
 lang=e.target.value==="en"?"en":"vi";document.documentElement.lang=lang;
 for(const el of document.querySelectorAll("[data-t]"))el.textContent=t(el.dataset.t);
 if(s.image) $("fileStatus").textContent=s.sample?t("sampleReady"):t("selected")+": "+s.filename;
 updateControls();
});
window.addEventListener("resize",()=>{if(s.image)draw()});
demo();
})();

/* All operations happen in this browser via WebCrypto; zero network requests. */
(() => {
"use strict";
const q=id=>document.getElementById(id);
const LABEL={
 vi:{title:"Chứng minh file không thay đổi.",subtitle:"Tạo chuỗi SHA-256 từ file dự án, xuất manifest và kiểm chứng byte gốc. Toàn bộ chạy trên trình duyệt — không tải dữ liệu lên máy chủ.",download:"Tải manifest mẫu ↓",readme:"Hướng dẫn chạy CLI ↗",notSignature:"Không phải chữ ký số.",disclaimer:"Mã hash phát hiện thay đổi sau khi lập manifest. Nó không chứng minh tác giả, thời gian tạo hay danh tính bên phát hành.",step1:"Chọn manifest JSON",step1hint:"Dùng manifest mẫu hoặc xuất bằng CLI. Chỉ tiếp nhận tệp JSON tối đa 2 MB.",manifestBtn:"Chọn manifest",loadSample:"Nạp mẫu tích hợp →",step1tip:"Kiểm tra chuỗi ngay",step1tiptext:"Ứng dụng tính lại hash của từng mắt xích và root digest từ metadata được sắp xếp cố định.",step2:"Chọn các file để so khớp",step2hint:"Tên, đường dẫn tương đối và byte nội dung phải khớp manifest. Có thể kiểm chứng chuỗi ngay cả khi chưa thêm file.",filesBtn:"Chọn nhiều file",folderBtn:"Hoặc chọn cả thư mục",folderHint:"Dùng khi có đường dẫn tương đối",clear:"Xóa file đã chọn",privacy:"Không gửi dữ liệu đi đâu.",privacyHint:"WebCrypto chạy tại máy; nội dung file không được lưu vào localStorage hoặc gửi API.",result:"Kết quả kiểm chứng",chainStatus:"Chuỗi metadata",bytesStatus:"File bytes",countStatus:"Số file",rootStatus:"Chain root",path:"Đường dẫn",size:"Dung lượng",state:"Trạng thái",method:"Cách tái tạo độc lập",copy:"Sao chép",methodHint:"CLI từ chối đường dẫn ../, symlink, bản ghi trùng, hash sai, file đổi byte. Không cần package.",waiting:"Nạp manifest để bắt đầu.",noManifest:"CHƯA CÓ MANIFEST",bad:"CHAIN KHÔNG HỢP LỆ",chainGood:"CHAIN ĐÚNG",notEnough:"CHỜ FILE GỐC",passed:"TẤT CẢ HỢP LỆ",failed:"FILE SAI KHÁC",metadataOK:"Metadata hợp lệ",pending:"Chưa cung cấp",verified:"Đã xác minh",mismatch:"Không khớp",missing:"Chưa chọn file",duplicate:"Trùng tên / nhiều file cùng đường dẫn",info:"Đọc file theo đường dẫn tương đối trong manifest.",manifestInvalid:"Manifest lỗi",none:"Chưa có file",fileSelected:"file đã chọn",rootFull:"Hash SHA-256 gốc",copied:"Đã copy lệnh CLI",sampleLoaded:"Đã nạp manifest mẫu."},
 en:{title:"Prove your files are unchanged.",subtitle:"Build a SHA-256 content chain and independently verify original file bytes. Everything runs in this browser — no server uploads.",download:"Download sample manifest ↓",readme:"CLI instructions ↗",notSignature:"Not a digital signature.",disclaimer:"Hash checks reveal alterations relative to a manifest. They do not authenticate its author, timestamp, or publisher.",step1:"Select a JSON manifest",step1hint:"Use the built-in sample or the Python CLI. Manifest limited to 2 MB.",manifestBtn:"Select manifest",loadSample:"Load built-in sample →",step1tip:"Inspect the chain first",step1tiptext:"Recompute every link and the final chain root from canonical metadata.",step2:"Select files for comparison",step2hint:"Paths and original bytes must match the manifest. The chain can be verified before selecting files.",filesBtn:"Select multiple files",folderBtn:"Or choose a directory",folderHint:"For manifests with relative paths",clear:"Clear selected files",privacy:"No data uploaded.",privacyHint:"WebCrypto runs on your device. File contents are not saved in localStorage or sent to an API.",result:"Verification results",chainStatus:"Metadata chain",bytesStatus:"File bytes",countStatus:"Files",rootStatus:"Chain root",path:"Path",size:"Size",state:"Status",method:"Reproduce independently",copy:"Copy",methodHint:"CLI rejects traversal, symlinks, duplicates, incorrect hashes and modified file bytes. No packages.",waiting:"Load a manifest to begin.",noManifest:"NO MANIFEST",bad:"INVALID CHAIN",chainGood:"CHAIN VALID",notEnough:"WAITING FOR FILES",passed:"ALL VERIFIED",failed:"CONTENT MISMATCH",metadataOK:"Metadata valid",pending:"Not supplied",verified:"Verified",mismatch:"Mismatch",missing:"File not selected",duplicate:"Duplicate file name/path",info:"Locate files using relative paths from manifest.",manifestInvalid:"Invalid manifest",none:"No files",fileSelected:"file(s) selected",rootFull:"SHA-256 chain root",copied:"CLI copied",sampleLoaded:"Loaded sample manifest."}
};
let lang="vi",manifest=null,artifacts=[],checking=0;
const t=s=>LABEL[lang][s]||s;
function isHex(s){return typeof s==="string" && /^[a-f0-9]{64}$/.test(s)}
function relativePath(p){return typeof p==="string"&&p.length>0&&p.length<=240&&
 !p.includes("\\")&&!p.includes("\0")&&!p.includes("\n")&&!p.includes("\r")&&!p.startsWith("/")&&
 !p.split("/").some(x=>x===""||x===".."||x===".")&&!p.split("/")[0].includes(":")}
function canonical(obj){
 if(Array.isArray(obj))return "["+obj.map(canonical).join(",")+"]";
 if(obj!==null&&typeof obj==="object")return "{"+Object.keys(obj).sort().map(k=>JSON.stringify(k)+":"+canonical(obj[k])).join(",")+"}";
 return JSON.stringify(obj);
}
async function sha(bytes){
 const raw=await crypto.subtle.digest("SHA-256",bytes);
 return [...new Uint8Array(raw)].map(x=>x.toString(16).padStart(2,"0")).join("");
}
const shaText=async s=>sha(new TextEncoder().encode(s));
function sameKeys(obj,keys){return obj && !Array.isArray(obj)&&typeof obj==="object"&&Object.keys(obj).sort().join("|")===keys.slice().sort().join("|")}
async function inspect(m){
 if(!sameKeys(m,["schema","algorithm","claim","root","files","chain"])||
 m.schema!=="evidence-chain-v1"||m.algorithm!=="SHA-256"||typeof m.claim!=="string"||
 !isHex(m.root)||!Array.isArray(m.files)||m.files.length>250||!Array.isArray(m.chain)||
 m.files.length!==m.chain.length)throw Error("Invalid schema / unexpected JSON fields");
 let prev="0".repeat(64),last="";
 for(let i=0;i<m.files.length;i++){
  const f=m.files[i],r=m.chain[i];
  if(!sameKeys(f,["path","size","sha256"])||!relativePath(f.path)||
    !Number.isSafeInteger(f.size)||f.size<0||f.size>20*1024*1024||!isHex(f.sha256)||
    f.path<=last||!sameKeys(r,["index","prev","file","digest"])||
    r.index!==i+1||r.prev!==prev||canonical(r.file)!==canonical(f)||!isHex(r.digest))
    throw Error("Invalid entry at index "+(i+1));
  const expected=await shaText(canonical({index:i+1,prev,file:f}));
  if(r.digest!==expected)throw Error("Broken SHA-256 chain at index "+(i+1));
  last=f.path;prev=expected;
 }
 if(prev!==m.root)throw Error("Root hash mismatch");
 return true;
}
function tr(parts,state){
 const row=document.createElement("tr");
 for(const [i,x] of parts.entries()){
  const cell=document.createElement("td");
  cell.textContent=x;
  if(i===3)cell.className=state;
  row.append(cell);
 }
 return row;
}
function status(kind,key){let node=q("verdict");node.className="verdict "+kind;node.textContent=t(key)}
function refreshLanguage(){
 document.documentElement.lang=lang;
 for(const el of document.querySelectorAll("[data-i]"))el.textContent=t(el.dataset.i);
 render();
}
async function render(){
 const id=++checking;
 const rows=q("fileRows");
 rows.replaceChildren();
 q("filesState").textContent=manifest?String(manifest.files?.length??"—"):"—";
 q("rootState").textContent=manifest?.root?manifest.root.slice(0,18)+"…":"—";
 q("rootState").title=manifest?.root||"";
 if(!manifest){
  status("","noManifest");
  q("chainState").textContent="—";q("bytesState").textContent="—";
  q("summary").textContent=t("waiting");
  rows.append(tr(["—","—","—",t("none")],""));
  return;
 }
 try{await inspect(manifest);if(id!==checking)return}
 catch(e){
  if(id!==checking)return;
  status("bad","bad");q("chainState").textContent="FAIL";q("bytesState").textContent="—";
  q("summary").textContent=t("manifestInvalid")+": "+String(e.message).slice(0,180);
  rows.append(tr(["—","—","—",t("bad")],"state-bad"));return;
 }
 q("chainState").textContent="SHA-256 ✓";
 if(!artifacts.length){
  status("partial","notEnough");q("bytesState").textContent=t("pending");
  q("summary").textContent=t("metadataOK")+". "+t("info");
  for(const f of manifest.files)rows.append(tr([f.path,formatSize(f.size),f.sha256.slice(0,20)+"…",t("missing")],"state-pending"));
  return;
 }
 let passed=0,failed=0,missing=0,used=new Set();
 const sources=new Map();
 for(const f of artifacts){
  const path=(f.webkitRelativePath||f.name).replace(/^[^/]+\//,"");
  if(!sources.has(path))sources.set(path,[]);
  sources.get(path).push(f);
 }
 for(const entry of manifest.files){
  if(id!==checking)return;
  const candidates=sources.get(entry.path)||[];
  let state,cls;
  if(!candidates.length){missing++;state=t("missing");cls="state-pending"}
  else if(candidates.length!==1){failed++;state=t("duplicate");cls="state-bad"}
  else if(candidates[0].size!==entry.size){failed++;state=t("mismatch");cls="state-bad"}
  else if(candidates[0].size>20*1024*1024){failed++;state=t("mismatch");cls="state-bad"}
  else{
   const hash=await sha(await candidates[0].arrayBuffer());
   if(id!==checking)return;
   if(hash===entry.sha256){passed++;state=t("verified");cls="state-good"}
   else{failed++;state=t("mismatch");cls="state-bad"}
  }
  rows.append(tr([entry.path,formatSize(entry.size),entry.sha256.slice(0,20)+"…",state],cls));
  used.add(entry.path);
 }
 q("bytesState").textContent=passed+"/"+manifest.files.length;
 if(failed){status("bad","failed");q("summary").textContent=passed+" OK · "+failed+" mismatch · "+missing+" missing"}
 else if(missing){status("partial","notEnough");q("summary").textContent=passed+" OK · "+missing+" "+t("missing")}
 else{status("good","passed");q("summary").textContent=passed+" "+t("verified")+" · "+t("rootFull")+": "+manifest.root}
}
function formatSize(n){return n<1024?n+" B":(n/1024).toFixed(1)+" KiB"}
q("lang").addEventListener("change",e=>{lang=e.target.value==="en"?"en":"vi";refreshLanguage()});
q("loadSample").addEventListener("click",()=>{manifest=window.SAMPLE_CHAIN;artifacts=[];q("manifestName").textContent="sample-manifest.json";q("artifactName").textContent=t("none");render()});
q("manifest").addEventListener("change",async e=>{
 const f=e.target.files[0];if(!f)return;
 if(f.size>2*1024*1024){q("summary").textContent="Manifest exceeds 2 MB";manifest=null;render();return}
 try{manifest=JSON.parse(await f.text());q("manifestName").textContent=f.name;artifacts=[];q("artifactName").textContent=t("none");render()}
 catch{manifest=null;render();q("summary").textContent=t("manifestInvalid")}
});
function addFiles(list){artifacts=[...list];q("artifactName").textContent=artifacts.length+" "+t("fileSelected");render()}
q("artifacts").addEventListener("change",e=>addFiles(e.target.files));
q("folder").addEventListener("change",e=>addFiles(e.target.files));
q("clear").addEventListener("click",()=>{artifacts=[];q("artifacts").value="";q("folder").value="";q("artifactName").textContent=t("none");render()});
q("copy").addEventListener("click",async()=>{
 try{await navigator.clipboard.writeText(q("command").textContent);q("copy").textContent=t("copied")}
 catch{q("copy").textContent="Ctrl+C";}
});
refreshLanguage();
})();
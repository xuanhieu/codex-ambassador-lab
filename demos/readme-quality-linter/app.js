(function(){"use strict";
const $=id=>document.getElementById(id),C=window.ReadmeLinter;
const ticks=String.fromCharCode(96).repeat(3);
const strong="# Sample App\n\n## Overview\nFor beginners, this demo teaches secure project reviews.\n## Quickstart\n"+ticks+"bash\nnpm run dev\n"+ticks+"\n## Usage\nExpected result: PASS.\n## Tests\nnpm test\n## Security & Privacy\nUse synthetic data only.\n## License\nMIT\n## Contributing\nOpen a GitHub issue or pull request.\n## Troubleshooting\nFAQ: check the port.\n## Demo\nScreenshot example.";
const weak="# Sample project\n\nA draft with TODO details. More content coming soon.";
let result=null;
function message(s){$("message").textContent=s}
function render(){
 const list=$("items");list.replaceChildren();
 if(!result){$("score").textContent="—";$("verdict").textContent="Chưa phân tích";return}
 $("score").textContent=String(result.score);
 $("verdict").textContent={strong:"Đủ mục cơ bản, vẫn cần người duyệt",improve:"Cần cải thiện",incomplete:"Thiếu hướng dẫn",blocked:"DỪNG — cần kiểm tra bí mật"}[result.status];
 for(const txt of result.blockers){
  const node=document.createElement("div");node.className="item";node.textContent="STOP · "+txt;list.append(node);
 }
 for(const issue of result.checks){
  const node=document.createElement("div");node.className="item"+(issue.passed?" pass":"");
  const badge=document.createElement("b");badge.textContent=issue.passed?"PASS":"TODO";
  const detail=document.createElement("div");detail.textContent=issue.vi;
  const hint=document.createElement("small");hint.textContent=issue.passed?"Có tín hiệu trong README. Hãy tự xác minh nội dung.":issue.fix;
  detail.append(hint);node.append(badge,detail);list.append(node);
 }
 $("export").disabled=false;$("copy").disabled=false;
}
function scan(){
 try{result=C.analyze($("input").value);render();message("Đã kiểm tra 12 tiêu chí. "+(result.blockers.length?"Có cảnh báo nghiêm trọng.":"Xem phần gợi ý bên phải."))}
 catch(e){result=null;render();$("export").disabled=true;$("copy").disabled=true;message(e.message)}
}
$("analyze").addEventListener("click",scan);
$("example").addEventListener("click",()=>{$("input").value=strong;scan()});
$("weak").addEventListener("click",()=>{$("input").value=weak;scan()});
$("clear").addEventListener("click",()=>{$("input").value="";result=null;render();$("export").disabled=true;$("copy").disabled=true;message("Đã xóa nội dung trên trang.")});
$("input").addEventListener("input",()=>{result=null;$("export").disabled=true;$("copy").disabled=true;message("Nội dung đã thay đổi — bấm Phân tích.")});
$("file").addEventListener("change",async(e)=>{
 const f=e.target.files?.[0];if(!f)return;
 if(f.size>100000||!/\.(md|markdown|txt)$/i.test(f.name)){message("File không hợp lệ: cần Markdown/TXT ≤100 KB.");e.target.value="";return}
 $("input").value=await f.text();e.target.value="";scan();
});
$("export").addEventListener("click",()=>{
 if(!result)return;
 const url=URL.createObjectURL(new Blob([C.toMarkdown(result)],{type:"text/markdown;charset=utf-8"}));
 const a=document.createElement("a");a.href=url;a.download="readme-audit-report.md";document.body.append(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(url),8000);message("Đã xuất checklist, không chứa README gốc.");
});
$("copy").addEventListener("click",async()=>{
 if(!result)return;
 try{await navigator.clipboard.writeText(C.toMarkdown(result));message("Đã copy checklist.")}
 catch{message("Không thể copy; hãy dùng nút xuất Markdown.")}
});
$("example").click();
})();
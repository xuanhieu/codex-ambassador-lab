/* Independent original instructional diagrams: 19 concepts and 61 lessons. */
(function(root){
"use strict";
const escapeHtml=(s)=>String(s??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
const D={
"first-task":[["Mục tiêu nhỏ","Small goal"],["Nhờ AI phác thảo","Ask for a draft"],["Tự kiểm tra","Review yourself"]],
"tool-choice":[["Hỏi & viết","Ask & draft"],["Làm nhiều bước","Multi-step work"],["Sửa & test code","Edit & test code"]],
"good-request":[["Mục tiêu","Goal"],["Đầu vào mẫu","Safe example"],["Tiêu chí đạt","Acceptance check"]],
"privacy-basics":[["Dữ liệu giả","Synthetic inputs"],["Giới hạn quyền","Minimal access"],["Duyệt trước khi gửi","Approve before send"]],
"checking-answers":[["Phát biểu","Claim"],["Kiểm nguồn","Check source"],["Kết luận có hạn chế","Qualified result"]],
"codex-begin":[["Chọn thư mục demo","Scope sandbox"],["Mô tả thay đổi","Describe change"],["Xem diff & test","Diff and test"]],
"git-and-diffs":[["Trước khi sửa","Before"],["Các dòng thay đổi","Diff"],["Commit & khôi phục","Commit & undo"]],
"review-tests":[["Thao tác","Action"],["Mong đợi","Expected"],["Quan sát thật","Observed"]],
"mini-site":[["Phác ý tưởng","Sketch"],["Làm trang mẫu","Prototype"],["Thử trên điện thoại","Mobile QA"]],
"instructions":[["Luật dự án","Project rules"],["Agent xử lý","Agent tasks"],["Người kiểm tra","Human review"]],
"reusable-skills":[["Input","Input"],["Quy trình","Reusable steps"],["Test lại","Retest"]],
"parallel-work":[["Tách nhiệm vụ","Split scope"],["Nhánh độc lập","Separate branches"],["Tích hợp & QA","Integrate & QA"]],
"safe-connections":[["Nguồn dữ liệu","Data source"],["Quyền tối thiểu","Least privilege"],["Nhật ký & thu hồi","Logs & revoke"]],
"approval":[["Agent đề xuất","Agent proposes"],["Người duyệt","Human reviews"],["Cho phép / từ chối","Allow / deny"]],
"multi-agents":[["Planner","Planner"],["Builder","Builder"],["QA độc lập","Independent QA"]],
"release-review":[["Kiểm test","Run tests"],["Kiểm bảo mật","Privacy gate"],["Phát hành / rollback","Ship / rollback"]],
"agent-platform":[["Nhận yêu cầu","Receive task"],["Trạng thái & quyền","Run states"],["Hủy / khôi phục","Cancel / recover"]],
"evals":[["Bộ ví dụ","Test cases"],["Đo kết quả","Measure"],["Sửa quy tắc","Improve rules"]],
"team-governance":[["Phân quyền","Permissions"],["Đào tạo","Training"],["Đo & cải thiện","Measure & improve"]]
};
const PATHS={
 task:'<rect x="6" y="7" width="24" height="22" rx="4"/><path d="M12 15h12M12 21h7"/>',
 check:'<path d="m8 18 6 6 13-15"/><circle cx="18" cy="18" r="14"/>',
 shield:'<path d="M18 4 31 9v10c0 9-7 13-13 16C12 32 5 28 5 19V9L18 4Z"/><path d="m12 18 4 4 8-9"/>',
 fork:'<circle cx="9" cy="7" r="4"/><circle cx="27" cy="29" r="4"/><circle cx="9" cy="29" r="4"/><path d="M9 11v14M13 7h5c5 0 9 4 9 9v9"/>',
 code:'<path d="m12 10-8 8 8 8m12-16 8 8-8 8m-5-19-6 30"/>',
 layers:'<path d="m18 4 15 8-15 8L3 12Zm-15 15 15 8 15-8M3 25l15 8 15-8"/>',
 link:'<path d="M14 23h8m-11-9 5-5a8 8 0 0 1 12 12l-4 4M24 18l-5 5a8 8 0 0 1-12-12l3-3"/>',
 chart:'<path d="M6 32h27M8 25l8-7 6 5 10-14"/><circle cx="16" cy="18" r="2"/>',
 eye:'<path d="M3 18s6-9 15-9 15 9 15 9-6 9-15 9S3 18 3 18Z"/><circle cx="18" cy="18" r="5"/>',
 book:'<path d="M18 8c-5-4-10-3-14-2v24c5-1 10-2 14 2 4-4 9-3 14-2V6c-5-1-10-2-14 2Zm0 0v24"/>'
};
const TYPES={
 "first-task":["task","code","check"],"tool-choice":["book","layers","code"],"good-request":["task","book","check"],
 "privacy-basics":["shield","shield","check"],"checking-answers":["eye","link","check"],
 "codex-begin":["task","code","check"],"git-and-diffs":["book","fork","check"],
 "review-tests":["task","eye","check"],"mini-site":["book","code","eye"],
 "instructions":["shield","code","eye"],"reusable-skills":["task","layers","check"],
 "parallel-work":["fork","layers","check"],"safe-connections":["link","shield","eye"],
 "approval":["task","eye","shield"],"multi-agents":["task","code","check"],
 "release-review":["check","shield","layers"],"agent-platform":["code","chart","shield"],
 "evals":["task","chart","check"],"team-governance":["shield","book","chart"]
};
function icon(name){
 const path=PATHS[name]||PATHS.task;
 return '<svg class="visual-pictogram" width="36" height="36" viewBox="0 0 36 36" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" aria-hidden="true">'+path+'</svg>';
}
function flow(labels,icons,locale,title,mode="concept"){
 const steps=labels.map((label,i)=>'<li class="visual-step">'
 +'<span class="visual-symbol">'+icon(icons[i]||"task")+'</span>'
 +'<span class="visual-index">'+String(i+1).padStart(2,"0")+'</span>'
 +'<strong>'+escapeHtml(label)+'</strong></li>').join("");
 const alt=(locale==="en"?"Flow diagram: ":"Sơ đồ luồng: ")+labels.join(" → ");
 return '<figure class="visual-figure visual-'+mode+'" role="group" aria-label="'+escapeHtml(alt)+'">'
 +'<figcaption><span class="visual-kicker">VISUAL LEARNING · '+(locale==="en"?"HOW IT WORKS":"CÁCH HOẠT ĐỘNG")+'</span>'
 +'<span class="visual-title">'+escapeHtml(title)+'</span></figcaption>'
 +'<ol class="visual-steps">'+steps+'</ol><p class="visual-caption">'+escapeHtml(locale==="en"?"Illustrative diagram — practice and independently verify each step.":"Sơ đồ minh họa — hãy tự thực hành và kiểm tra từng bước.")+'</p></figure>';
}
function guide(g,locale){
 const lang=locale==="en"?"en":"vi";
 const labels=(D[g.id]||D["first-task"]).map(x=>x[lang==="en"?1:0]);
 return flow(labels,TYPES[g.id]||TYPES["first-task"],lang,g[lang]?.title||g.id);
}
function lesson(item,locale){
 const lang=locale==="en"?"en":"vi",l=item[lang]||{};
 const steps=(l.exercise||[]).slice(0,3).map(x=>String(x).replace(/^\d+[\). ]+/,"").slice(0,120));
 if(steps.length<2)return "";
 return flow(steps,["book","code","check"],lang,l.title||item.id,"lesson");
}
root.CodexVisuals={guide,lesson,concepts:Object.keys(D)};
})(window);

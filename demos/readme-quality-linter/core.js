(function(root,factory){
 const api=factory();
 if(typeof module==="object"&&module.exports)module.exports=api;
 else root.ReadmeLinter=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
"use strict";
const specs=[
 ["title",8,"Tên dự án","Project name",/^#\s+\S.{2,}/m,"Thêm # Tên dự án."],
 ["purpose",12,"Mục đích / lợi ích","Purpose",/overview|purpose|giới thiệu|mục đích|giải quyết|what it does/i,"Nêu vấn đề sản phẩm giải quyết và ai cần dùng."],
 ["quickstart",13,"Bắt đầu trong 3 bước","Quickstart",/quickstart|installation|getting started|cài đặt|bắt đầu/i,"Viết 3 bước cài đặt, chạy và kiểm tra."],
 ["example",10,"Câu lệnh hoặc ví dụ có thể chạy","Executable example",/\\x60\\x60\\x60|npm run|python3 |node --test/i,"Thêm lệnh thật và đầu ra dự kiến."],
 ["tests",12,"Có hướng dẫn kiểm thử","Tests",/tests?|pytest|kiểm thử|chạy test|verification/i,"Ghi test nào phải chạy và điều kiện PASS."],
 ["license",8,"Nêu quyền sử dụng","License",/license|licence|MIT|Apache|giấy phép/i,"Thêm mục license hoặc nêu chưa cấp phép."],
 ["contrib",7,"Nêu cách góp ý","Contributing",/contribut|pull request|issue|đóng góp|góp ý/i,"Mô tả cách báo lỗi và đề xuất PR."],
 ["privacy",10,"Lưu ý dữ liệu và quyền","Security and privacy",/security|privacy|sandbox|permissions?|private|bí mật|bảo mật|dữ liệu giả/i,"Nhắc không dán token, quyền riêng tư và phê duyệt trước hành động lớn."],
 ["expected",8,"Nêu kết quả mong đợi","Expected result",/expected|output|result|mong đợi|kết quả|pass/i,"Ghi rõ khi nào sản phẩm chạy thành công."],
 ["help",5,"Hướng xử lý lỗi","Troubleshooting",/troubleshoot|FAQ|common errors|lỗi thường gặp|khắc phục/i,"Bổ sung các lỗi thường gặp và cách sửa."],
 ["visual",4,"Demo / hình minh họa","Visual example",/demo|screenshot|example|ví dụ|minh họa|hình ảnh/i,"Thêm ảnh/sơ đồ có chú thích thay thế."],
 ["audience",3,"Đối tượng người học","Audience",/audience|beginners|who is this|đối tượng|dành cho|người mới/i,"Ghi dành cho ai và cần biết gì trước."]
];
const secrets=[/-----BEGIN [A-Z ]*PRIVATE KEY-----/i,/\bsk-(?:proj-)?[A-Za-z0-9_-]{16,}/,/\bghp_[A-Za-z0-9]{20,}/];
function analyze(source){
 if(typeof source!=="string"||source.trim().length<20||source.length>100000)throw Error("README phải là văn bản dài 20–100.000 ký tự.");
 const checks=specs.map(x=>({id:x[0],points:x[1],vi:x[2],en:x[3],passed:x[4].test(source),fix:x[5]}));
 const score=checks.reduce((n,x)=>n+(x.passed?x.points:0),0);
 const blockers=[];
 if(secrets.some(x=>x.test(source)))blockers.push("Có chuỗi giống mật khẩu hoặc token.");
 if(/\/Users\/[A-Za-z0-9_-]+\//.test(source))blockers.push("Có đường dẫn máy cá nhân.");
 const warnings=[];
 if(/http:\/\/(?!localhost|127\.0\.0\.1)/i.test(source))warnings.push("Kiểm tra đường dẫn HTTP chưa bảo mật.");
 if(/\b(TODO|FIXME|coming soon)\b/i.test(source))warnings.push("Vẫn có nội dung TODO / chưa hoàn thành.");
 return {score,status:blockers.length?"blocked":score>=80?"strong":score>=55?"improve":"incomplete",
    checks,blockers,warnings,characters:source.length};
}
function toMarkdown(result){
 const lines=["# README Quality Linter","", "Score: "+result.score+"/100","Status: "+result.status,"",
  "## Checks",...result.checks.map(x=>"- ["+(x.passed?"x":" ")+"] "+x.vi+(x.passed?"":" — "+x.fix)),
  "","## Safety warnings",...(result.blockers.length?result.blockers:["No blocking patterns found (not a security guarantee)."]),
  ...result.warnings,"","Heuristic results only. Human review required. The original README content is NOT included."];
 return lines.join("\n")+"\n";
}
return {analyze,toMarkdown,specs};
});
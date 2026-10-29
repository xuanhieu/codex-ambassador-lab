(function(root,factory){
 const api=factory();
 if(typeof module==="object"&&module.exports)module.exports=api;
 else root.ReadmeLinter=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
"use strict";
const specs=[
 ["title",8,"Tên dự án","Project name",/^#\s+\S.{2,}/m,"Thêm # Tên dự án."],
 ["purpose",12,"Mục đích / lợi ích","Purpose",/\b(?:overview|purpose|what it does)\b|giới thiệu|mục đích|giải quyết/i,"Nêu vấn đề sản phẩm giải quyết và ai cần dùng."],
 ["quickstart",13,"Bắt đầu trong 3 bước","Quickstart",/\b(?:quick ?start|installation|getting started)\b|cài đặt|bắt đầu/i,"Viết 3 bước cài đặt, chạy và kiểm tra."],
 ["example",10,"Câu lệnh hoặc ví dụ có thể chạy","Executable example",/^[ \t]{0,3}(?:\x60{3,}|~{3,})|\bnpm run\b|\bpython3 \S|\bnode --test\b/im,"Thêm lệnh thật và đầu ra dự kiến."],
 ["tests",12,"Có hướng dẫn kiểm thử","Tests",/\b(?:tests?|testing|pytest|verification)\b|kiểm thử|chạy test/i,"Ghi test nào phải chạy và điều kiện PASS."],
 ["license",8,"Nêu quyền sử dụng","License",/\b(?:[Ll]icen[cs]e[sd]?|LICEN[CS]E|MIT|Apache)\b|[Gg]iấy phép/,"Thêm mục license hoặc nêu chưa cấp phép."],
 ["contrib",7,"Nêu cách góp ý","Contributing",/\bcontribut|\bpull requests?\b|\b(?:open|file|report|github) (?:an? )?issues?\b|đóng góp|góp ý/i,"Mô tả cách báo lỗi và đề xuất PR."],
 ["privacy",10,"Lưu ý dữ liệu và quyền","Security and privacy",/\b(?:security|privacy|sandbox|permissions?|private)\b|bí mật|bảo mật|dữ liệu giả/i,"Nhắc không dán token, quyền riêng tư và phê duyệt trước hành động lớn."],
 ["expected",8,"Nêu kết quả mong đợi","Expected result",/\b(?:expected|output|results?|pass(?:es|ed)?)\b|mong đợi|kết quả/i,"Ghi rõ khi nào sản phẩm chạy thành công."],
 ["help",5,"Hướng xử lý lỗi","Troubleshooting",/\b(?:troubleshoot\w*|FAQ|common errors)\b|lỗi thường gặp|khắc phục/i,"Bổ sung các lỗi thường gặp và cách sửa."],
 ["visual",4,"Demo / hình minh họa","Visual example",/\b(?:demo|screenshots?|examples?)\b|ví dụ|minh họa|hình ảnh/i,"Thêm ảnh/sơ đồ có chú thích thay thế."],
 ["audience",3,"Đối tượng người học","Audience",/\b(?:audience|beginners?|who is this)\b|đối tượng|dành cho|người mới/i,"Ghi dành cho ai và cần biết gì trước."]
];
const MIN_STRONG_SECTIONS=3;
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
 // A README without real sections cannot be "strong", however many keywords it contains (audit S2).
 const sections=(source.match(/^#{2,6}[ \t]+\S/gm)||[]).length;
 const tier=score>=80&&sections>=MIN_STRONG_SECTIONS?"strong":score>=55?"improve":"incomplete";
 return {score,status:blockers.length?"blocked":tier,
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
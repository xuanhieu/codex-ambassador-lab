/* Codex Path — Every Human Learning Map (independent) beginner onboarding, deterministic and offline. */
(function(root,factory){
 const api=factory();
 if(typeof module==="object"&&module.exports)module.exports=api;
 if(root)root.CodexStarterCore=api;
})(typeof window!=="undefined"?window:undefined,function(){
"use strict";
const PERSONAS=[
 {id:"everyday",symbol:"✦",vi:"Tôi chưa biết AI",en:"I’m new to AI",viDesc:"Việc thường ngày, không cần code.",enDesc:"Everyday tasks, no code needed.",tasks:["plan","explain","organize"]},
 {id:"student",symbol:"◈",vi:"Tôi đang đi học",en:"I’m a student",viDesc:"Hiểu bài, ôn tập, tự kiểm tra.",enDesc:"Understand, practice and verify.",tasks:["explain","quiz","plan"]},
 {id:"teacher",symbol:"▤",vi:"Tôi dạy hoặc hướng dẫn",en:"I teach people",viDesc:"Giáo án, bài tập, tài liệu dễ hiểu.",enDesc:"Lessons, exercises and clarity.",tasks:["teach","quiz","explain"]},
 {id:"office",symbol:"▦",vi:"Tôi làm văn phòng",en:"I work in an office",viDesc:"Email, báo cáo và cuộc họp.",enDesc:"Emails, reports and meetings.",tasks:["organize","write","plan"]},
 {id:"smallbiz",symbol:"⌂",vi:"Tôi kinh doanh",en:"I run a small business",viDesc:"Trang giới thiệu và vận hành thử nghiệm.",enDesc:"A sample storefront and operations.",tasks:["shop","write","organize"]},
 {id:"jobseeker",symbol:"↗",vi:"Tôi muốn đổi nghề",en:"I’m exploring a career",viDesc:"Kỹ năng, CV và sản phẩm học tập.",enDesc:"Skills, resumes and learning proof.",tasks:["resume","plan","write"]},
 {id:"designer",symbol:"◩",vi:"Tôi làm sáng tạo",en:"I design or create",viDesc:"Ý tưởng, giao diện và kể chuyện.",enDesc:"Ideas, UI and storytelling.",tasks:["design","shop","write"]},
 {id:"community",symbol:"❤",vi:"Tôi làm cộng đồng",en:"I help my community",viDesc:"Sự kiện, tình nguyện và truyền thông.",enDesc:"Events, volunteers and outreach.",tasks:["event","organize","plan"]},
 {id:"developer",symbol:"⌘",vi:"Tôi biết lập trình",en:"I build software",viDesc:"Repo, tests, Codex và kiểm tra diff.",enDesc:"Repos, tests, Codex and diffs.",tasks:["review","prototype","plan"]},
 {id:"agents",symbol:"◇",vi:"Tôi làm hệ thống agent",en:"I work with agents",viDesc:"Quyền, giám sát và đánh giá.",enDesc:"Permissions, oversight and evals.",tasks:["approval","review","plan"]},
 {id:"creator",symbol:"✧",vi:"Tôi tạo nội dung",en:"I create content",viDesc:"Kịch bản, bài học, nội dung dễ đọc.",enDesc:"Stories, lessons and accessibility.",tasks:["write","teach","event"]},
 {id:"lead",symbol:"◌",vi:"Tôi dẫn dắt đội nhóm",en:"I lead a team",viDesc:"Lập kế hoạch, chuẩn duyệt và KPI.",enDesc:"Planning, approvals and team metrics.",tasks:["approval","organize","plan"]}
];
const TASKS={
 plan:{vi:"Lên kế hoạch 7 ngày",en:"Plan seven days",inputVI:"Một tuần tự học AI, mỗi ngày 10 phút",inputEN:"A week of ten-minute daily AI practice",
  sampleVI:["Ngày 1: chọn mục tiêu nhỏ.","Ngày 2: thử prompt mẫu.","Ngày 3: sửa một câu trả lời.","Ngày 4–7: tự làm và ghi kết quả."],
  sampleEN:["Day 1: choose a small goal.","Day 2: try a sample prompt.","Day 3: revise one answer.","Days 4–7: practice and record output."]},
 explain:{vi:"Giải thích điều khó",en:"Explain a difficult concept",inputVI:"Giải thích Git bằng ví dụ cuốn sổ gia đình",inputEN:"Explain Git as a family notebook",
  sampleVI:["Git lưu lại các mốc thay đổi.","Commit giống như lưu một bản chụp của sổ.","Nên thử trên dự án mẫu trước."],
  sampleEN:["Git keeps a history of changes.","A commit is like a notebook snapshot.","Practice with a sample project first."]},
 organize:{vi:"Biến ghi chú thành việc",en:"Turn notes into actions",inputVI:"Ba ghi chú giả về chuẩn bị sự kiện",inputEN:"Three fictional event-planning notes",
  sampleVI:["Việc: chọn ngày — người phụ trách: A.","Việc: lập danh sách vật dụng — B.","Thiếu: thời hạn cần xác nhận."],
  sampleEN:["Task: choose date — owner: A.","Task: list supplies — owner: B.","Missing: confirm deadline."]},
 quiz:{vi:"Tạo bài tự kiểm tra",en:"Create a self-check quiz",inputVI:"Ba câu hỏi về chu trình nước",inputEN:"Three questions about the water cycle",
  sampleVI:["Hỏi về bốc hơi, ngưng tụ, mưa.","Có đáp án và giải thích ngắn.","Đọc lại để phát hiện đáp án sai."],
  sampleEN:["Ask about evaporation, condensation, rain.","Add an answer and short explanation.","Review for incorrect explanations."]},
 teach:{vi:"Soạn mini bài học",en:"Make a mini lesson",inputVI:"Bài 20 phút về kỹ năng đánh giá thông tin",inputEN:"20-minute lesson on checking information",
  sampleVI:["5 phút: tình huống khởi động.","10 phút: thực hành so sánh nguồn.","5 phút: câu hỏi và phản hồi."],
  sampleEN:["5 min: warm-up scenario.","10 min: compare sources.","5 min: check and reflect."]},
 write:{vi:"Viết nháp dễ hiểu",en:"Draft clearer writing",inputVI:"Bài giới thiệu lớp học cộng đồng giả lập",inputEN:"Fictional community class announcement",
  sampleVI:["Tiêu đề ngắn và mục đích rõ.","Ba điều người đọc cần biết.","Lời mời hành động không chứa dữ liệu cá nhân."],
  sampleEN:["Short headline and clear purpose.","Three key facts for readers.","A safe call to action without personal details."]},
 shop:{vi:"Phác trang bán hàng",en:"Sketch a sample storefront",inputVI:"Cửa hàng bánh tưởng tượng",inputEN:"An imaginary bakery",
  sampleVI:["Giới thiệu sản phẩm giả.","Ba điểm nổi bật.","Nút liên hệ chỉ là demo, không lấy dữ liệu thật."],
  sampleEN:["Describe fictional products.","Three benefits.","Demo-only contact action; collect no real data."]},
 resume:{vi:"Kiểm tra CV mẫu",en:"Review a sample resume",inputVI:"CV hư cấu của nhân viên văn phòng",inputEN:"A fictional office worker’s resume",
  sampleVI:["Một tiêu đề nghề nghiệp rõ.","Ba thành tựu được gắn nhãn minh họa.","Loại bỏ thông tin riêng tư không cần thiết."],
  sampleEN:["One clear professional summary.","Three achievements labeled illustrative.","Remove unnecessary sensitive details."]},
 design:{vi:"Vẽ luồng màn hình",en:"Map a screen flow",inputVI:"Ứng dụng ghi việc 3 màn hình",inputEN:"A three-screen task app",
  sampleVI:["Màn 1: danh sách việc.","Màn 2: thêm việc.","Màn 3: xem tiến độ, nút trở lại rõ."],
  sampleEN:["Screen 1: task list.","Screen 2: add a task.","Screen 3: progress with clear back navigation."]},
 event:{vi:"Lên chương trình cộng đồng",en:"Plan a community event",inputVI:"Sự kiện trồng cây giả lập",inputEN:"A fictional tree-planting event",
  sampleVI:["Lập lịch, phân công và địa điểm giả.","Chuẩn bị quy trình an toàn.","Chỉ thu nhận dữ liệu cần thiết nếu có đăng ký thật."],
  sampleEN:["Plan schedule, roles and imaginary location.","Add safety checks.","If registration is real, collect only necessary data."]},
 review:{vi:"Rà soát thay đổi code",en:"Review a safe code change",inputVI:"Sửa một nút trên website thử nghiệm",inputEN:"Fix one button on a sample website",
  sampleVI:["Xác định hành vi hiện tại và mong muốn.","Yêu cầu diff, kiểm thử và phương án hoàn tác.","Không deploy production khi chưa duyệt."],
  sampleEN:["Define current and expected behavior.","Require diff, tests and rollback.","Do not deploy production without approval."]},
 prototype:{vi:"Viết brief sản phẩm thử nghiệm",en:"Write a bounded prototype brief",inputVI:"Trang landing một sản phẩm giả",inputEN:"A fictional product landing page",
  sampleVI:["Mục tiêu và người đọc rõ.","Chỉ sửa thư mục thử nghiệm.","Có checklist mobile, form và privacy."],
  sampleEN:["Clear audience and outcome.","Only change the sample workspace.","Test mobile, forms and privacy."]},
 approval:{vi:"Quy định ai được làm gì",en:"Define safe approvals",inputVI:"Agent giả lập xử lý dữ liệu, gửi mail, deploy",inputEN:"Sample agent reading data, sending emails and deploying",
  sampleVI:["Đọc dữ liệu mẫu: phạm vi xác định.","Gửi hoặc xóa: phải được con người duyệt.","Ra ngoài phạm vi: từ chối và ghi lý do."],
  sampleEN:["Read sample data only in authorized scope.","Send or delete: require human approval.","Out of scope: block and explain."]}
};
const LEVELS=["Zero","Beginner","Intermediate","Advanced","Pro"];
const QUESTIONS=[
 {vi:"Bạn đã từng dùng ChatGPT hay AI để giải quyết một việc thật?",en:"Have you used AI to complete a real task?",options:{vi:["Chưa bao giờ","Thử một đôi lần","Đã dùng và biết tự kiểm tra"],en:["Never","Once or twice","Yes, and I review results"]}},
 {vi:"Khi AI trả câu trả lời, bạn thường làm gì?",en:"When AI gives an answer, what do you do?",options:{vi:["Chưa biết kiểm tra","Đọc lại và so sánh","Kiểm tra nguồn và thử nghiệm"],en:["Not sure how to check","Read and compare","Check sources and test it"]}},
 {vi:"Bạn đã từng làm sản phẩm hoặc workflow bằng AI?",en:"Have you built a workflow or project with AI?",options:{vi:["Chưa","Bản nháp hoặc demo","Có bản chạy và kiểm thử"],en:["Not yet","Draft or demo","Runnable and tested"]}},
 {vi:"Bạn biết ranh giới quyền hạn khi agent sửa/xóa dữ liệu?",en:"Can you set boundaries before an agent edits or deletes?",options:{vi:["Chưa biết","Biết xin phép khi cần","Có checklist, test và rollback"],en:["Not yet","Know to request approval","Use gates, tests and rollback"]}}
];
function findPersona(id){return PERSONAS.find(p=>p.id===id)||null}
function findTask(id){return Object.prototype.hasOwnProperty.call(TASKS,id)?TASKS[id]:null}
function startingLevel(answers){
 if(!Array.isArray(answers)||answers.length!==4||answers.some(x=>![0,1,2].includes(x)||!Number.isInteger(x)))return "Zero";
 const points=answers.reduce((a,b)=>a+b,0);
 if(points<3)return "Zero";
 if(points<5)return "Beginner";
 if(points<7)return "Intermediate";
 return "Advanced"; // Pro requires demonstrated projects; not issued by a four-question quiz.
}
function recommend(persona,answers){
 const p=findPersona(persona)||PERSONAS[0];
 return {persona:p.id,level:startingLevel(answers),primary:p.tasks[0],lessons:
   ["Zero","Beginner","Intermediate","Advanced","Pro"],selfAssessment:true,notCertification:true};
}
function prompt(persona,taskId,lang="vi"){
 const p=findPersona(persona)||PERSONAS[0],task=findTask(taskId);
 if(!task||!p.tasks.includes(taskId))throw Error("Invalid starter task for persona");
 const local=lang==="en"?"en":"vi";
 const label=local==="vi"?task.inputVI:task.inputEN;
 const intro=local==="vi"?
 "Tôi đang bắt đầu và không biết lập trình. Hãy hướng dẫn chậm, dễ hiểu và không dùng thuật ngữ nếu chưa giải thích.":
 "I am starting out and may not know how to code. Guide me clearly and explain any technical terms.";
 const request=local==="vi"?
 "Bối cảnh hoàn toàn GIẢ LẬP: ":"Entirely SYNTHETIC scenario: ";
 const steps=local==="vi"?
 "Cho 3 bước nhỏ, một ví dụ cụ thể, tiêu chí tự kiểm tra và bước tiếp theo. Chỉ đưa đề xuất; không tự gửi, mua, xóa, tải lên hay triển khai bất cứ thứ gì. Hãy chỉ rõ điều nào chưa kiểm chứng.":
 "Give three small steps, one worked example, a self-check and a next step. Suggest only: do not send, purchase, delete, upload or deploy anything. Flag unverified claims.";
 return intro+"\n\n"+request+label+".\n\n"+steps;
}
function sample(persona,taskId,lang="vi"){
 const p=findPersona(persona)||PERSONAS[0],t=findTask(taskId);
 if(!t||!p.tasks.includes(taskId))throw Error("Invalid task");
 return (lang==="en"?t.sampleEN:t.sampleVI).slice();
}
return {PERSONAS,TASKS,LEVELS,QUESTIONS,findPersona,findTask,startingLevel,recommend,prompt,sample};
});

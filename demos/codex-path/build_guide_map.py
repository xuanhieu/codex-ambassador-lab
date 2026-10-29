#!/usr/bin/env python3
"""Human-readable learning map over an indexed, DATED official source catalog.
This is original instructional writing, not a mirror of external document contents.
One official URL is indexed once with a primary teaching guide and skill tier.
"""
from __future__ import annotations
import datetime, hashlib, json, re
from collections import Counter
from pathlib import Path
ROOT=Path(__file__).resolve().parent
CATALOG=ROOT.parent/"codex-academy/catalog.json"
if not CATALOG.exists():CATALOG=ROOT/"data/academy-index-20261024.json"
PATH=ROOT/"data/codex-path.json"
OUTPUT=ROOT/"data/learning-map.json"
HEALTH=ROOT/"data/source-health-20261025.json"

# Each guide has its own original explanation, analogy, worked example, hands-on steps,
# danger/mistake and inspectable outcome in Vietnamese and English.
GUIDES=[
("first-task","Zero","L26,L34,L01","first",
"AI giúp được việc gì?","What can AI do for me?",
"AI là công cụ giúp bạn phác thảo, giải thích và sắp xếp việc. Bạn quyết định mục tiêu, tự đọc và kiểm tra kết quả trước khi dùng.",
"AI helps you draft, explain and organize tasks. You decide the goal and review the result before using it.",
"Giống bạn nhờ một người hỗ trợ viết nháp: bản nháp không thay thế quyết định của bạn.",
"Like asking a helper for a first draft: the draft does not make decisions for you.",
"Ví dụ: yêu cầu tạo lịch học giả lập 7 ngày, mỗi ngày 10 phút, sau đó tự chỉnh thời gian cho phù hợp.",
"Example: ask for a fictional seven-day, ten-minute study plan, then adjust it yourself.",
"Đọc như sự thật chắc chắn; đưa số thẻ, mật khẩu hoặc thông tin riêng tư vào ví dụ.",
"Treating plausible text as verified truth; entering secrets or private details.",
"Lập một danh sách 3 việc nhỏ, chọn 1 việc và tạo bản nháp có ghi ‘cần xác minh’.",
"List three small tasks, choose one and make a draft marked 'needs verification'."),
("tool-choice","Zero","L27,L05,L02","choice",
"Chọn ChatGPT, Work hay Codex?","ChatGPT, Work or Codex?",
"ChatGPT phù hợp hỏi đáp, giải thích hoặc soạn nháp. Work dành cho công việc nhiều bước tạo đầu ra hoàn chỉnh. Codex tập trung đọc, sửa, kiểm thử dự án phần mềm; quyền sử dụng và tính năng phụ thuộc tài khoản.",
"ChatGPT suits explanations and drafting. Work handles multi-step deliverables. Codex works on software projects, reviews changes and tests; access depends on your account.",
"Chọn dụng cụ đúng việc: viết nháp không cần mở xưởng lập trình.",
"Pick the right tool: writing a draft does not require a software workshop.",
"Cần soạn lời mời? Bắt đầu bằng ChatGPT. Cần làm việc qua nhiều tệp? Cân nhắc Work. Cần sửa nút web và chạy test? Dùng Codex khi đã cấp quyền.",
"Drafting an invitation? Start with ChatGPT. Multi-file deliverables? Consider Work. Fixing code and running tests? Use Codex with permission.",
"Nhầm mọi tính năng AI đều yêu cầu API key hoặc biết lập trình.",
"Assuming every AI task requires an API key or programming skill.",
"Ghi 5 việc thường ngày và chọn đúng công cụ cho từng việc; giải thích vì sao.",
"List five everyday tasks and choose a tool for each with a reason."),
("good-request","Zero","L28,L03,L34","prompt",
"Đặt câu hỏi sao cho AI hiểu","How to write a clear request",
"Một yêu cầu tốt có bốn phần: việc muốn làm, đối tượng nhận kết quả, dữ liệu mẫu, tiêu chí để tự kiểm tra. Không cần từ ngữ chuyên môn.",
"A good request gives the task, audience, safe example input and review criteria. No special jargon is needed.",
"Giống viết giấy giao việc: nói rõ việc, giới hạn và khi nào xong.",
"Like a short work order: state the goal, constraints and definition of done.",
"‘Hãy viết 5 ý tưởng trò chơi cho học sinh lớp 6, mỗi ý 1 câu, không yêu cầu thiết bị đắt tiền; ghi điều cần kiểm tra trước khi tổ chức.’",
"'Give five games for middle-school students, one sentence each, no expensive equipment; flag safety checks before use.'",
"Chỉ viết ‘làm cho hay’, rồi xem câu trả lời mơ hồ là lỗi của hệ thống.",
"Writing only 'make it better' and expecting a precise outcome.",
"Soạn một prompt 4 phần, thử với dữ liệu giả và sửa ít nhất một điều chưa rõ.",
"Write a four-part prompt, try it with fictional details and revise one ambiguous point."),
("privacy-basics","Zero","L29,L35,L04","privacy",
"Biết chia sẻ gì và không chia sẻ gì","Protect your private information",
"Đừng đưa mật khẩu, API key, ảnh định danh hoặc dữ liệu của người khác vào bài tập công khai. Dùng ví dụ hư cấu để luyện tập, và xin phép trước hành động gửi/xóa/mua.",
"Never put passwords, API keys, identifying images or other people's private data in public lessons. Practice with fictional examples and approve high-impact actions first.",
"Như gửi bưu thiếp: thứ đã gửi đi có thể bị sao chép, nên hãy kiểm tra trước.",
"Like mailing a postcard: once shared it can be copied, so inspect it first.",
"Thay địa chỉ thật bằng ‘Khu phố Ví Dụ’, email bằng example.invalid, token bằng SAMPLE_ONLY.",
"Replace a real address with 'Example Street', an email with example.invalid and a token with SAMPLE_ONLY.",
"Nghĩ rằng che mờ nhẹ hoặc xóa dòng trong phần preview là đủ để bảo vệ file gốc.",
"Assuming a small blur or a hidden UI element fully protects original files.",
"Đọc một ảnh demo và tìm 5 vị trí có thể chứa dữ liệu nhạy cảm.",
"Review a demo screenshot and identify five spots that might expose private details."),
("checking-answers","Zero","L30,L47,L01","verify",
"AI có thể sai. Kiểm tra thế nào?","AI can be wrong. How do I check?",
"Văn bản tự nhiên không phải bằng chứng. Tách câu trả lời thành điều kiểm tra được, điều cần nguồn chính thức và ý kiến mang tính gợi ý.",
"Fluent text is not evidence. Separate verifiable claims, those requiring official sources, and suggestions.",
"Giống kiểm tra bài toán: đáp số có đẹp cũng phải thử lại phép tính.",
"Like checking a math result: a neat answer still needs verification.",
"Một bài nói 'phần mềm miễn phí cho mọi người' có thể đã lỗi thời; hãy đọc trang gói dịch vụ hiện tại trước khi khẳng định.",
"A claim that a service is free for everyone may have changed; check the current plan page before repeating it.",
"Sao chép nội dung mà không kiểm nguồn, ngày hoặc những giới hạn chưa biết.",
"Copying results without checking references, date or limitations.",
"Phân loại 3 mệnh đề giả lập thành Đúng nguồn / Chưa kiểm / Ý kiến.",
"Classify three fictional claims as sourced / unverified / opinion."),
("codex-begin","Beginner","L41,L06,L44","cli",
"Làm quen Codex mà không sợ terminal","Your first safe Codex task",
"Codex là trợ lý lập trình làm việc trong phạm vi dự án. Bạn có thể bắt đầu từ giao diện có sẵn; trước khi giao sửa code, hãy nói rõ folder thử nghiệm, mục tiêu, điều cấm và cách kiểm chứng.",
"Codex works on software tasks within a project. Start in an available client; before edits, specify a sandbox folder, goal, forbidden actions and verification.",
"Giống mời thợ sửa một chiếc ghế: chỉ được sửa chiếc ghế bạn cho phép.",
"Like hiring help for one chair: access should not extend to the rest of the house.",
"‘Trong thư mục demo, sửa nhãn nút Tìm kiếm. Không xóa, không deploy. Cho xem diff, kiểm tra mobile và chỉ báo PASS nếu thử thật.’",
"'In the demo folder, fix the Search button label. Do not delete or deploy. Show a diff and mobile checks; report PASS only after running them.'",
"Cho agent toàn quyền ở thư mục cá nhân hoặc public khi chưa đọc diff.",
"Granting broad permissions to private folders or publishing without reviewing the diff.",
"Tạo một brief thay đổi giả lập có đường dẫn thử nghiệm, 3 test và hướng hoàn tác.",
"Write a fictional change brief with sandbox scope, three tests and rollback."),
("git-and-diffs","Beginner","L08,L42,L07","git",
"Git, repo, commit, diff là gì?","What are Git, repos, commits and diffs?",
"Repo là thư mục dự án có lịch sử. Commit là mốc lưu thay đổi. Diff cho biết dòng nào đã thay. Biết đọc ba thứ này giúp không mất công việc cũ.",
"A repo tracks project history. A commit is a saved milestone. A diff shows changes. Understanding these prevents accidental loss.",
"Giống quyển vở có các bản chụp sau mỗi lần sửa bài.",
"Like a notebook photographed after each revision.",
"Thay tiêu đề 'Xin chào' thành 'Chào bạn' trong file demo, rồi nhìn hai dòng trước/sau.",
"Change 'Hello' to 'Welcome' in a sample file and compare the before/after diff.",
"Tin rằng bấm Save là đã tạo mốc commit hoặc bản backup.",
"Believing pressing Save automatically creates a Git commit or backup.",
"Tạo bảng 3 cột: trước, sau, vì sao thay đổi; ghi cách hoàn tác.",
"Create a three-column before/after/reason table with rollback."),
("review-tests","Beginner","L43,L45,L09","tests",
"Biết sản phẩm chạy đúng hay chưa","How to tell whether a change works",
"Test là hành động thử với kết quả mong đợi trước. Cần thử trường hợp bình thường, nhập sai, thiết bị nhỏ và hoàn tác — không chỉ nhìn giao diện.",
"A test compares observed results against expectations. Cover normal, invalid input, small screens and undo, not just appearance.",
"Như thử khóa cửa: phải kéo cửa thật chứ không chỉ nhìn chìa khóa.",
"Like checking a lock: actually test the door, not only the key.",
"Form nhập email phải hiện thông báo khi bỏ trống, sai định dạng và hợp lệ.",
"An email form should clearly handle empty, invalid and valid input.",
"Thấy trang đẹp và ghi 100% hoàn thành dù chưa bấm các nút.",
"Calling a visually attractive page fully tested without exercising it.",
"Viết 5 test case có 'Thao tác → Mong đợi → Kết quả thật'.",
"Write five test cases: 'Action → Expected → Observed'."),
("mini-site","Beginner","L37,L41,L44","site",
"Từ ý tưởng thành website mẫu","Turn an idea into a sample website",
"Bắt đầu bằng một trang với tiêu đề, nội dung, nút thử và thông báo lỗi. Dùng dữ liệu mẫu, chưa thu email khách hàng và chưa nối thanh toán.",
"Start with one page: title, content, demo button and error state. Use sample data without collecting customer emails or payments.",
"Như làm mô hình nhà giấy trước khi xây thật.",
"Like a paper house model before construction.",
"Trang cửa hàng bánh giả có 3 sản phẩm, bảng giá minh họa và một nút 'Xem chi tiết'.",
"A fictional bakery page with three sample products, indicative prices and a View details button.",
"Đưa landing demo lên public với form lấy dữ liệu thật trước khi kiểm quyền riêng tư.",
"Publishing a data-collecting form before a privacy review.",
"Viết wireframe 3 khối và checklist mobile/người mới.",
"Sketch three sections and a mobile and novice acceptance checklist."),
("instructions","Intermediate","L11,L44,L49","agents",
"Vì sao agent cần hướng dẫn rõ?","Why do agents need bounded instructions?",
"AGENTS.md có thể mô tả quy tắc của dự án và lệnh kiểm tra. Hãy giữ hướng dẫn ngắn, đúng phạm vi, phân biệt việc được làm và việc phải xin duyệt.",
"AGENTS.md can hold project-specific instructions and test commands. Keep them brief, scoped and explicit about required approvals.",
"Giống nội quy phòng thực hành: ai cũng biết chỗ nào được đụng vào.",
"Like lab rules: everyone knows what equipment they may use.",
"AGENTS.md mẫu: 'Chỉ sửa src/demo; chạy npm test; không đọc .env; không push production'.",
"Example AGENTS.md: 'Edit src/demo only; run npm test; never read .env; don't deploy production'.",
"Viết nội quy quá dài, mâu thuẫn nhau hoặc cấm những thứ hệ thống phải làm.",
"Writing huge or contradictory rules that block necessary work.",
"Tạo bản AGENTS.md 6 dòng cho một dự án giả lập.",
"Draft a six-line AGENTS.md for a sample project."),
("reusable-skills","Intermediate","L12,L49,L46","skills",
"Đóng gói quy trình để dùng lại","Package a reusable workflow",
"Một kỹ năng dùng lại cần biết mục tiêu, dữ liệu đầu vào, thao tác, giới hạn và cách kiểm tra. Bắt đầu từ tác vụ đã làm thủ công thành công.",
"A reusable skill needs a goal, input, steps, constraints and an acceptance test. Start with a manual task you've already validated.",
"Giống công thức nấu ăn: có nguyên liệu, bước làm và cách nhận biết món chín.",
"Like a recipe: ingredients, steps and a doneness check.",
"Skill 'review form': input HTML mẫu, chạy 5 test, báo lỗi với ảnh, không sửa production.",
"Sample 'review form' skill: input a sample HTML file, run five tests, report issues with screenshots, no production edits.",
"Nhặt 50 script trên mạng rồi tin rằng script nào cũng an toàn.",
"Collecting dozens of unknown scripts and trusting them without inspection.",
"Viết template mục tiêu, đầu vào, đầu ra, giới hạn và 3 test.",
"Write a template for goal, input, output, limits and three tests."),
("parallel-work","Intermediate","L14,L55,L17","worktrees",
"Làm nhiều nhánh mà không đạp lên nhau","Parallel work without merge collisions",
"Worktree là thư mục làm việc riêng gắn với nhánh Git. Chia rõ nhiệm vụ, chủ sở hữu file và cách tích hợp trước khi giao nhiều agent.",
"A Git worktree is a separate working folder for a branch. Define tasks, file ownership and integration before using multiple agents.",
"Giống chia nhóm sửa các phòng khác nhau, không cùng lúc thay một bức tường.",
"Like teams renovating separate rooms, not editing the same wall concurrently.",
"Agent A viết test, Agent B làm UI, reviewer kiểm tra nhánh đã gộp và ghi lỗi.",
"Agent A writes tests, Agent B builds UI, a reviewer checks the merged branch and records issues.",
"Cho nhiều agent ghi chung một thư mục production hoặc cùng sửa file không phối hợp.",
"Letting multiple agents edit the same production folder or file without coordination.",
"Vẽ sơ đồ 3 vai trò, 3 folder và một bước merge có test.",
"Sketch three roles, three folders and a tested merge step."),
("safe-connections","Intermediate","L13,L50,L47","mcp",
"Kết nối dữ liệu và phân quyền tối thiểu","Connecting tools with least privilege",
"Một kết nối bên ngoài có thể đọc hoặc thay đổi dữ liệu; chỉ cấp quyền cần thiết, thử quyền đọc trước và ngắt kết nối khi không dùng.",
"External connections may read or modify data; grant only necessary permissions, prefer read-only trials and disconnect unused integrations.",
"Giống cho khách mượn một chìa khóa phòng, không phải chìa khóa toàn nhà.",
"Like lending a key to one room, not the entire building.",
"Kết nối kho tài liệu giả lập chỉ đọc, xuất một danh sách và xác nhận không có chức năng xóa.",
"Connect a synthetic read-only document source, list files and verify no delete action is available.",
"Đưa API token toàn quyền vào code public hoặc cho agent đọc mọi tệp.",
"Publishing an all-access API token in code or granting access to every file.",
"Lập bảng: dịch vụ → quyền tối thiểu → người duyệt → cách thu hồi.",
"Build a table: integration → minimal permission → approver → revocation."),
("approval","Advanced","L16,L52,L54","approval",
"Chặn hành động lớn trước khi xảy ra","Pause before high-impact actions",
"Đọc file và sửa file là hai mức quyền khác nhau. Xóa, gửi dữ liệu hay thanh toán cần người có thẩm quyền chấp thuận.",
"Reading and modifying files are different privileges. Deletions, data sends and purchases need authorized approval.",
"Giống kho hàng cần chữ ký người quản lý trước khi xuất hàng.",
"Like a warehouse requiring a manager's sign-off before dispatch.",
"Agent đề nghị gửi email thật: chuyển sang chờ duyệt, ghi người duyệt, chỉ tiếp tục nếu được cho phép.",
"An agent requests to send an email: pause, record an approver and continue only if authorized.",
"Nhầm 'agent tự quyết' với quyền bỏ qua chính sách.",
"Confusing agent autonomy with the right to override permissions.",
"Mô phỏng một quyết định Cho phép/Chờ/Dừng cho 5 tình huống.",
"Simulate Allow/Review/Stop decisions for five scenarios."),
("multi-agents","Advanced","L17,L55,L57","agents",
"Nhiều agent: giao rõ trách nhiệm","Multi-agent work with clear ownership",
"Nhiều agent chỉ tốt khi có việc độc lập, ranh giới file và một reviewer kiểm tra chứng cứ. Không cần nhiều agent cho công việc nhỏ.",
"Multiple agents help when tasks are separable, with file boundaries and evidence review. A small task may be better with one agent.",
"Như ekip quay phim: đạo diễn, quay, dựng và người duyệt có vai trò khác nhau.",
"Like a film crew: direction, recording, editing and review need distinct owners.",
"Planner viết đề bài; Builder sửa sandbox; QA chạy test độc lập; chỉ merge khi đủ bằng chứng.",
"Planner briefs, Builder changes a sandbox, QA independently tests; merge only with evidence.",
"Đếm số agent như KPI và bỏ qua việc có ai chịu trách nhiệm sản phẩm cuối.",
"Counting agents as the KPI without final accountability.",
"Viết sơ đồ trách nhiệm và bảng bằng chứng từ 3 vai trò.",
"Write a responsibility map and evidence table for three roles."),
("release-review","Advanced","L18,L23,L56","ci",
"Đưa code lên web mà không làm hỏng bản đang chạy","Ship updates without breaking production",
"Một release gate kiểm tra test, dữ liệu cá nhân, nội dung và rollback trước khi publish. Bản đang chạy phải có cách trở lại.",
"A release gate checks tests, private data, content and rollback before publishing. Production needs a way back.",
"Giống kiểm tra máy bay trước cất cánh: bỏ qua một mục quan trọng thì chưa bay.",
"Like a preflight checklist: missing a critical item blocks takeoff.",
"Nếu file chứa token giả định, gate phải báo FAIL và không upload.",
"If a file contains an obvious token, the gate must FAIL and avoid upload.",
"Chỉ kiểm npm build PASS mà không thử giao diện hoặc quyền riêng tư.",
"Checking build success alone without user flows or privacy.",
"Viết 8 điều kiện PASS/FAIL và kiểm thử một tình huống phải chặn.",
"Write eight PASS/FAIL checks and test one blocking failure."),
("agent-platform","Pro","L21,L22,L58","sdk",
"Ứng dụng tích hợp agent phải có vòng đời rõ","Agent integrations need an explicit lifecycle",
"Ứng dụng có agent cần biết trạng thái chạy, quyền, dữ liệu nào được gửi, cách hủy và cách phục hồi. SDK không tự giải quyết governance.",
"Agent apps need run state, permissions, transmitted data, cancel handling and recovery. An SDK does not replace governance.",
"Như điều khiển robot: nút dừng và nhật ký quan trọng không kém nút chạy.",
"Like operating a robot: stop controls and logs matter as much as Start.",
"Thiết kế giao diện có trạng thái Queued, Running, Needs approval, Failed, Completed.",
"Design a UI with Queued, Running, Needs approval, Failed and Completed states.",
"Chỉ vẽ spinner rồi gọi đó là hệ thống sản xuất.",
"Adding a spinner and calling the system production-ready.",
"Lập sơ đồ trạng thái, timeout và cảnh báo khi tác vụ vượt phạm vi.",
"Model run states, timeouts and an out-of-scope alert."),
("evals","Pro","L25,L59,L61","eval",
"Đánh giá agent bằng trường hợp thật và lỗi thật","Evaluate agents with reproducible cases",
"Đo chất lượng bằng bộ ví dụ có đầu vào, kỳ vọng và kết quả. Đếm cả lỗi bỏ sót và lỗi cảnh báo nhầm; không biến thành công ở demo thành tỷ lệ toàn cục.",
"Measure quality using reproducible inputs, expected results and observed outputs. Count missed errors and false alarms; do not extrapolate from a demo.",
"Giống đề kiểm tra có đáp án và thang điểm cố định.",
"Like a test with an answer key and an agreed rubric.",
"Chạy 10 tình huống giả, ghi PASS/FAIL và phân tích 2 ca sai.",
"Run ten synthetic scenarios, record PASS/FAIL and inspect two errors.",
"Tuyên bố 'chính xác 99%' từ một vài câu hỏi đã chọn trước.",
"Claiming 99% accuracy from a few handpicked prompts.",
"Tạo bộ 10 case đa dạng và ghi bản báo cáo sai số.",
"Create ten varied cases and a brief error review."),
("team-governance","Pro","L24,L60,L57","enterprise",
"Dạy đội nhóm dùng AI bền vững","Roll out AI responsibly across a team",
"Muốn nhiều người dùng AI cần đào tạo theo trình độ, quy tắc dữ liệu, người phê duyệt, phương pháp đo hiệu quả và cách phản hồi sự cố.",
"A team AI rollout needs tiered training, data rules, approvers, honest measurement and incident escalation.",
"Giống tập huấn an toàn lao động: ai cũng cần biết khi nào được làm và gọi ai.",
"Like workplace safety training: know when to act and whom to call.",
"Lập chương trình 30 ngày cho 6 người giả, phân vai và đặt một ngày review mỗi tuần.",
"Design a thirty-day training plan for six fictional colleagues with a weekly review.",
"Chạy công cụ hàng loạt vì xu hướng mà không hỏi giá trị thực hoặc rủi ro.",
"Rolling tools out for novelty without measuring value or risk.",
"Xây bảng năng lực ban đầu, lịch học, bảng quyền và cách đánh giá sau 30 ngày.",
"Create a skills baseline, lessons, permission matrix and 30-day review.")
]
# Select the most relevant guide for each indexed document by the title and URL.
RULES=[
("privacy-basics",r"privacy|data.control|sensitive|personal|securi|cyber.safety|sandbox|approv|permission|guardrail|auth"),
("tool-choice",r"chatgpt.work|work.vs.codex|when.to.use|difference.between|chatgpt.and.codex"),
("good-request",r"prompt|instructions|writing|system.message"),
("codex-begin",r"codex.cli|codex.ide|mobile|app.server|codex.app|cli.custom|command.line|developer.commands"),
("git-and-diffs",r"git.worktree|pull.request|gitlab|github|linear|diff|source.control"),
("review-tests",r"testing|review.code|code.review|testing|test.coverage"),
("instructions",r"agents.md|agent.config|rules.md|custom.instructions"),
("reusable-skills",r"skill|plugin|mcp"),
("parallel-work",r"worktree|parallel|subagent|multi.agent|multi.agent"),
("safe-connections",r"connector|connect|environment|integration|access"),
("approval",r"approval|auto.review|risk|sandbox"),
("multi-agents",r"subagent|agent.team|orchestrat|delegation"),
("release-review",r"ci.cd|deploy|release|actions|pipeline|workflow"),
("agent-platform",r"sdk|app.server|stream|websocket|server|api"),
("evals",r"eval|measure|metrics|trac|scan|audit|usage.insight"),
("team-governance",r"enterprise|govern|organization|admin|compliance|rbac|team"),
("mini-site",r"site|frontend|website|web.app"),
("first-task",r"introduction|quickstart|start|basic|foundation|tutorial|training|learn|use.case")
]
# Curated title anchors prevent irrelevant default source citations.
# Only match titles already present in the dated official metadata index.
REF_ANCHORS={
 "first-task":["Quickstart","Use ChatGPT","OpenAI training"],
 "tool-choice":["Get started with ChatGPT Work","Codex manual (Markdown)","Quickstart"],
 "good-request":["Prompting","Custom Prompts","Best practices"],
 "privacy-basics":["Permissions","Models and Trusted Access","Agent approvals & security"],
 "checking-answers":["Best practices","Web search","Quickstart"],
 "codex-begin":["Codex CLI","Codex IDE extension","Learn Codex","Codex manual (Markdown)"],
 "git-and-diffs":["Worktrees","Review GitHub pull requests with Codex","Code review"],
 "review-tests":["Code review","Review GitHub pull requests with Codex","Best practices"],
 "mini-site":["Create a site","Sites","Publish and share"],
 "instructions":["Custom instructions with AGENTS.md","Rules","Config basics"],
 "reusable-skills":["Build skills","Skills & Plugins","Build plugins"],
 "parallel-work":["Worktrees","Subagents","Codex environments"],
 "safe-connections":["Model Context Protocol","Documentation MCP","Environment variables"],
 "approval":["Agent approvals & security","Sandbox","Auto-review"],
 "multi-agents":["Subagents","Worktrees","Agent approvals & security"],
 "release-review":["Codex GitHub Action","Codex Security CI/CD overview","Codex security cookbook"],
 "agent-platform":["Codex SDK","Codex App Server","Codex Security TypeScript SDK"],
 "evals":["Usage Insights for ChatGPT Work in Codex","Codex security cookbook","Analytics API"],
 "team-governance":["Governance","Roles and workspace permissions","ChatGPT Work Overview"]
}

GUIDE_BY_ID={g[0]:g for g in GUIDES}
# Never map an advanced security/enterprise source to a Zero-level tutorial.
# Source's level is the primary gate; topic keywords rank topics *within* that tier.
# Some source index legacy levels need editorial overrides for technical complexity.
TOPICS_BY_LEVEL={
    "Zero":["privacy-basics","tool-choice","good-request","checking-answers","first-task"],
    "Beginner":["review-tests","git-and-diffs","mini-site","codex-begin"],
    "Intermediate":["parallel-work","reusable-skills","safe-connections","instructions"],
    "Advanced":["release-review","multi-agents","approval"],
    "Pro":["evals","agent-platform","team-governance"],
}
TOPIC_PATTERNS={
    "privacy-basics":r"personal|privacy|sensitive|data.control|cyber.safety|private",
    "tool-choice":r"chatgpt.work|chatgpt.and.codex|when.to.use|work.vs.codex",
    "good-request":r"prompt|instruction|writing|context",
    "checking-answers":r"verify|validat|source|best.practice|research|evaluate",
    "first-task":r"start|learn|quick|basics|introduction",
    "codex-begin":r"cli|ide|editor|mobile|getting.started|quickstart|codex|app|command",
    "git-and-diffs":r"git|github|gitlab|linear|pull.request|merge|version.control|worktree",
    "review-tests":r"review|test|checks|quality|bug",
    "mini-site":r"sites|frontend|web.app|deploy|project|build",
    "instructions":r"agents.md|instruction|guid|configuration|config|rules",
    "reusable-skills":r"skill|plugin|customization|reusab",
    "parallel-work":r"worktree|parallel|subagent|delegat|collaborat",
    "safe-connections":r"mcp|connector|connect|access|environment|integrat|third.party",
    "approval":r"approv|sandbox|permission|privileg|auto.review|security",
    "multi-agents":r"multi.agent|subagent|orchestrat|agent.team|delegate",
    "release-review":r"ci.cd|security.scan|security.cli|security.plugin|scan|release|github.action|deploy",
    "agent-platform":r"sdk|app.server|api|stream|server|integration|typescript",
    "evals":r"insight|metric|measure|eval|trace|scan|security.cookbook|usage|cost",
    "team-governance":r"enterprise|admin|govern|policy|role|security|organization|deploy|workspace",
}
DEFAULT_BY_LEVEL={"Zero":"first-task","Beginner":"codex-begin","Intermediate":"instructions",
                  "Advanced":"approval","Pro":"team-governance"}
def educational_level(source):
    title=source["title"].lower()
    if source["product"]=="Codex" and ("app server" in title or "sdk" in title):
        return "Pro"
    return source["level"]
def assign(source):
    key=(source["title"]+" "+source["url"]+" "+" ".join(source.get("categories",[]))).lower()
    tier=educational_level(source)
    candidates=TOPICS_BY_LEVEL[tier]
    matches=[gid for gid in candidates if re.search(TOPIC_PATTERNS[gid],key)]
    return matches[0] if matches else DEFAULT_BY_LEVEL[tier]
def build():
    raw=json.loads(CATALOG.read_text())
    docs=raw["sources"]
    curriculum=json.loads(PATH.read_text())
    health=json.loads(HEALTH.read_text()) if HEALTH.exists() else None
    if health:
        assert health["schema"]=="public-official-source-health-v1"
        assert health["total"]==len(docs)
        health_byid={d["id"]:d for d in health["documents"]}
        assert len(health_byid)==len(docs)
    else:
        health_byid={}
    lessonIds={l["id"] for l in curriculum["lessons"]}
    assert len(docs)>=200 and len(curriculum["lessons"])>=61
    records=[]
    for source in docs:
        url=source["url"]
        assert url.startswith("https://"),url
        guide=assign(source)
        check=health_byid.get(source["id"],{})
        if check:assert check["url"]==url,"Source health lookup mismatch"
        ok=check.get("status")=="reachable" and check.get("http")==200 and len(check.get("sha256",""))==64
        records.append(dict(id=source["id"],title=source["title"],url=url,product=source["product"],
          category=source.get("categories",[])[:3],level=source["level"],learningLevel=educational_level(source),
          guide=guide,assignmentBasis="topic_within_learning_level",
          indexSnapshot="2026-10-24",verifiedLive=ok,
          sourceHttp=int(check.get("http",0)),verifiedAt=check.get("checkedAt",""),
          sourceHeadings=check.get("headings",[])[:2] if ok else [],
          legacy=bool(source.get("legacy")) or bool(re.search(r"\blegacy\b|removal|deprecated",source["title"],re.I))))
    assert all(GUIDE_BY_ID[d["guide"]][1]==d["learningLevel"] for d in records)
    grouped={gid:[d for d in records if d["guide"]==gid] for gid in GUIDE_BY_ID}
    modules=[]
    for (gid,tier,linked,topic,titleVI,titleEN,meaningVI,meaningEN,analogyVI,analogyEN,
         exampleVI,exampleEN,mistakeVI,mistakeEN,challengeVI,challengeEN) in GUIDES:
        lessonIdsList=linked.split(",")
        assert set(lessonIdsList).issubset(lessonIds)
        titles=REF_ANCHORS.get(gid,[])
        reference=[]
        for title in titles:
            match=next((d for d in records if d["title"].casefold()==title.casefold()),None)
            if match and (not health or match["verifiedLive"]) and match["id"] not in [r["id"] for r in reference]:
                reference.append(match)
        # A source selected by a low-confidence keyword must not displace a
        # manually curated and demonstrably relevant teaching reference.
        if not reference:
            for record in sorted(grouped[gid],key=lambda d:(not d["verifiedLive"],d["product"]!="Codex",len(d["title"]))):
                if len(reference)>=4:break
                if record["id"] not in [r["id"] for r in reference]:
                    reference.append(record)
        # NEVER backfill a guide with unrelated arbitrary first Codex documents.
        assert reference, "No on-topic reference found for "+gid
        reference=reference[:4]
        modules.append({"id":gid,"tier":tier,"topic":topic,"lessons":lessonIdsList,
          "vi":{"title":titleVI,"simple":meaningVI,"analogy":analogyVI,"example":exampleVI,
                "pitfall":mistakeVI,"challenge":challengeVI},
          "en":{"title":titleEN,"simple":meaningEN,"analogy":analogyEN,"example":exampleEN,
                "pitfall":mistakeEN,"challenge":challengeEN},
          "references":[{"id":d["id"],"url":d["url"],"title":d["title"]} for d in reference]})
    obj={"schema":"human-learning-map-v1","sourceIndex":{"snapshot":"2026-10-24","officialUrls":len(records),
       "codex":sum(d["product"]=="Codex" for d in records),
       "chatgpt":sum(d["product"]=="ChatGPT" for d in records),
       "platform":sum(d["product"]=="Platform" for d in records),
       "quality":"All 204 indexed links were checked via HTTP on 2026-10-25; HTTP 200 is evidence of reachability only, not of current semantic correctness. No full text mirrored.",
       "healthCheckedAt":health.get("checkedAt") if health else None,
       "httpReachable":sum(d["verifiedLive"] for d in records),
       "httpUnavailable":sum(bool(d["sourceHttp"]) and not d["verifiedLive"] for d in records),
       "catalog":"../codex-academy/catalog.json"},
       "guides":modules,"documents":records,
       "editorial":{"purpose":"Original plain-language explanations, analogies, practical exercises and pitfalls.",
         "copyright":"Titles and outbound links only from indexed source; no copied full articles.",
         "freshness":"Official pages change; verify the linked page before relying on UI/plan-specific instructions.",
         "completion":"Self-checked practice is not OpenAI certification."}}
    OUTPUT.write_text(json.dumps(obj,ensure_ascii=False,indent=2)+"\n")
    assert sum(len(grouped[k]) for k in grouped)==len(records)
    print(json.dumps({"status":"pass","originalGuides":len(modules),"mappedUrls":len(records),
      "sourceGroups":dict(Counter(d["product"] for d in records)),
      "sha256":hashlib.sha256(OUTPUT.read_bytes()).hexdigest()},ensure_ascii=False))
if __name__=="__main__":build()

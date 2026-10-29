#!/usr/bin/env python3
"""Render editorial VI/EN Learn Codex (independent) handbooks from verified local maps.

Only original explanations and brief titles/links from official index; no full
third-party article content is redistributed.
"""
import json,re
from pathlib import Path
ROOT=Path(__file__).resolve().parent
MAP=json.loads((ROOT/"data/learning-map.json").read_text())
CURRICULUM=json.loads((ROOT/"data/codex-path.json").read_text())
def clean(value):
 return str(value).replace("|","/").replace("\n"," ").strip()
def build(lang):
 vi=lang=="vi"
 name="Học Codex: cẩm nang từ Zero đến Pro (độc lập)" if vi else "Learn Codex: Zero to Pro handbook (independent)"
 intro=("Bắt đầu không cần biết lập trình. Chọn một việc nhỏ, thử với dữ liệu giả, tự kiểm tra rồi mới mở bài nâng cao."
        if vi else "Start without knowing how to code. Choose a small task, use fictional data, review it, then progress.")
 header=[
  "# "+name,"",
  "> Independent educational handbook / tài liệu học tập độc lập. Not an official OpenAI certification.",
  "> Editorial version: 2026-10-25. Source index: 2026-10-24. Features may differ by account and change.",
  "",intro,"",
  "## "+("Chỉ cần 3 bước đầu" if vi else "Start in three steps"),"",
  ("1. Chọn bạn là ai: học sinh, giáo viên, văn phòng, creator, developer hoặc người chưa từng dùng AI." if vi
    else "1. Choose who you are: student, teacher, office worker, creator, developer or first-time user."),
  ("2. Tạo một prompt với thông tin giả, thử trong công cụ có sẵn và đọc lại kết quả." if vi
    else "2. Draft a synthetic-data prompt, try it in a tool you already have and review its result."),
  ("3. Tự kiểm tra các điều chưa xác minh, rồi chọn một bài ngắn tiếp theo." if vi
    else "3. Check uncertain claims, then continue with a short hands-on lesson."),
  "",
  ("Mở [Bắt đầu trong 3 phút](https://codex.xuanhieu.org/demos/codex-path/#start) và [Bản đồ tương tác](https://codex.xuanhieu.org/demos/codex-path/#guide)." if vi
    else "Open [Three-minute starter](https://codex.xuanhieu.org/demos/codex-path/#start) and [Interactive guide](https://codex.xuanhieu.org/demos/codex-path/#guide)."),
  "",
  "## "+("Năm cấp độ học" if vi else "Five learning levels"),"",
  "| Tier | "+("Năng lực hướng tới" if vi else "Learning outcome")+" |",
  "|---|---|"
 ]
 for level in CURRICULUM["levels"]:
  header.append("| "+level["level"]+" | "+clean(level["checkpoint"][lang])+" |")
 header+=["","## "+("Chọn lộ trình theo bạn" if vi else "Choose a learner profile"),"",
   ("Không cần phải chọn nghề công nghệ; bạn có thể đổi tuyến và học lại bài nhập môn bất cứ lúc nào."
    if vi else "You do not need to choose a technology career; paths can be changed any time."),"",
   "| "+("Hướng học" if vi else "Track")+" | "+("Kết quả cuối" if vi else "End project")+" |","|---|---|"]
 for career in CURRICULUM["careers"]:
  header.append("| "+clean(career["name"][lang])+" | "+clean(career["capstone"][lang])+" |")
 header+=["","## "+("19 chủ đề: hiểu → thử → kiểm tra" if vi else "19 concepts: understand → try → verify"),""]
 titles={
  "simple":"Hiểu đơn giản" if vi else "In plain language",
  "analogy":"Hình dung qua đời sống" if vi else "Everyday analogy",
  "example":"Ví dụ minh họa" if vi else "Worked example",
  "pitfall":"Sai lầm thường gặp" if vi else "Common mistake",
  "challenge":"Thực hành ngắn" if vi else "Quick exercise",
  "lessons":"Bài học liên quan" if vi else "Related lessons",
  "sources":"Nguồn đối chiếu" if vi else "Official references"
 }
 lessonById={x["id"]:x for x in CURRICULUM["lessons"]}
 for i,g in enumerate(MAP["guides"],1):
  item=g[lang]
  header+=["### "+str(i)+". "+item["title"]+" ("+g["tier"]+")",""]
  for key in ("simple","analogy","example","pitfall","challenge"):
   header+=["**"+titles[key]+":** "+item[key],""]
  header+=["**"+titles["lessons"]+":**"]
  for lesson in g["lessons"]:
   l=lessonById[lesson]
   header.append("- ["+lesson+" — "+clean(l[lang]["title"])+
     "](https://codex.xuanhieu.org/demos/codex-path/#path?lesson="+lesson+")")
  header+=["","**"+titles["sources"]+":**"]
  for source in g["references"]:
   header.append("- ["+clean(source["title"])+"]("+source["url"]+")")
  header.append("")
 header+=["---","",
   "## "+("Phạm vi và giới hạn" if vi else "Scope and limitations"),"",
   ("- Danh mục đối chiếu gồm **204 URL đã lập chỉ mục**, trong đó **45 Codex, 158 ChatGPT và 1 Platform**."
    if vi else "- The reference registry has **204 indexed URLs**: **45 Codex, 158 ChatGPT and one Platform**."),
   ("- 61 bài học song ngữ: 25 bài Academy có sẵn và 36 bài thực hành tự biên soạn, 14 tuyến người học."
    if vi else "- 61 bilingual lessons: 25 Academy lessons plus 36 original exercises, across 14 learner tracks."),
   ("- Đây là **bản biên soạn** chứ không phải bản sao toàn văn tài liệu chính thức. Các liên kết có thể cũ; luôn kiểm trang gốc."
    if vi else "- This is **original teaching material**, not a verbatim mirror of official docs. Recheck links for freshness."),
   ("- Bài quiz, checklist và capstone là tự đánh giá; không cấp chứng nhận từ OpenAI."
    if vi else "- Quizzes, checklists and capstones are self-assessments, not OpenAI certification."),
   ("- Không đưa mật khẩu, token, dữ liệu khách hàng hoặc giấy tờ cá nhân vào bài tập công khai."
    if vi else "- Never paste passwords, API keys, customer or identity data into public examples."),
   "",
   "## "+("Thực hành và tài liệu mở rộng" if vi else "Practice and next reading"),"",
   "- [Codex Path](https://codex.xuanhieu.org/demos/codex-path/#start)",
   "- [Academy](https://codex.xuanhieu.org/demos/codex-academy/)",
   "- [GitHub source](https://github.com/xuanhieu/codex-learning-path)",
   "- [Official Codex learning](https://developers.openai.com/learn/codex)",
   "- [OpenAI training](https://developers.openai.com/training)",""]
 path=ROOT/("HANDBOOK_VI.md" if vi else "HANDBOOK_EN.md")
 text="\n".join(header)
 assert text.count("\n### ")==19 and ("204" in text)
 assert not re.search(r"/Users/[A-Za-z0-9_-]+/",text) and not re.search(r"[A-Za-z0-9_.-]+@gmail\.com",text)
 path.write_text(text)
 print("HANDBOOK_CREATED",path.name,"CHARS",len(text),"GUIDES",len(MAP["guides"]))
if __name__=="__main__":
 build("vi");build("en")

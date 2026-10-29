#!/usr/bin/env python3
"""N-PATH-DATA specialized curriculum worker. Publishes only audited synthetic guidance."""
from pathlib import Path
import json, re, hashlib
ROOT=Path(__file__).resolve().parent
ACADEMY=ROOT.parent/"codex-academy"
def idset(*a):return list(a)
CAREERS=[
dict(id="automation",name={"vi":"AI Automation Specialist","en":"AI Automation Specialist"},
tagline={"vi":"Tự động hóa workflow có kiểm soát","en":"Automate workflows with human review"},
family="Operations",audiences=["Newbie","Creator","Marketer","Team Lead"],role="Newbie",icon="⚙",accent="#59d3cf",
skills=["Prompt contracts","No-code orchestration","Approvals","RAG boundaries","Monitoring"],
starter=["L01","L02","L03","L05","L08","L10","L12","L16","L20","L24"],
growth=["L13","L14","L15","L17","L23"],
capstone={"vi":"Mô phỏng một quy trình nhận yêu cầu → kiểm tra dữ liệu → xin duyệt → xuất báo cáo, kèm test và video walkthrough.","en":"Build a synthetic intake → validate → approve → report workflow with tests and walkthrough."},
evidence=["Flowchart","Approved action matrix","10 synthetic test cases","Readme + rollback plan"],
seniority=["AI Ops Associate","Automation Specialist","AI Workflow Architect"]),
dict(id="growth",name={"vi":"AI Growth & SEO Engineer","en":"AI Growth & SEO Engineer"},
tagline={"vi":"Từ chiến lược nội dung đến hệ thống kiểm chứng","en":"From content systems to trustworthy growth"},
family="Growth",audiences=["Marketer","Creator","Team Lead","Developer"],role="Marketer",icon="↗",accent="#b29cff",
skills=["Research","Source validation","Content QA","SEO technical checks","Analytics"],
starter=["L01","L03","L04","L05","L10","L12","L15","L16","L19","L20"],
growth=["L07","L09","L11","L13","L23"],
capstone={"vi":"Tạo công cụ rà soát 30 trang nội dung giả lập: citation, canonical, freshness và checklist xuất CSV.","en":"Build a 30-page synthetic content QA app: citation, canonical, freshness and CSV evidence."},
evidence=["Input data contract","30-row sample CSV","Validation report","SEO regression tests"],
seniority=["AI Content Ops","Growth Automation Lead","AI Growth Architect"]),
dict(id="developer",name={"vi":"AI Product Engineer","en":"AI Product Engineer"},
tagline={"vi":"Dựng sản phẩm, test, review và triển khai","en":"Build, test, review and ship AI products"},
family="Engineering",audiences=["Developer","Pro","Team Lead"],role="Developer",icon="⌘",accent="#72c3ff",
skills=["Git","Codex CLI","Test design","API integration","Release review"],
starter=["L05","L06","L07","L08","L09","L11","L13","L14","L15","L16","L19","L21","L23"],
growth=["L17","L18","L20","L22","L25"],
capstone={"vi":"Build một mini web app có source public, test tự động, CI review-gated và changelog rõ ràng.","en":"Ship a small open-source web app with tests, gated CI and verified changelog."},
evidence=["GitHub repository","Unit tests","CI run receipt","Reproducible setup"],
seniority=["AI-Assisted Developer","AI Product Engineer","Senior AI Engineer"]),
dict(id="agents",name={"vi":"Agent Systems Engineer","en":"Agent Systems Engineer"},
tagline={"vi":"Đa tác tử có sandbox, quyền và bằng chứng","en":"Bounded agents with approvals and reproducible evidence"},
family="Engineering",audiences=["Developer","Pro","Team Lead"],role="Pro",icon="◈",accent="#f3c878",
skills=["Agent contracts","Context isolation","Worktrees","Tool security","Observability"],
starter=["L05","L06","L08","L09","L11","L12","L13","L14","L16","L17","L18","L19","L20","L21","L23","L24","L25"],
growth=["L10","L15","L22"],
capstone={"vi":"Dựng agent orchestration giả lập 3 vai trò: planner → builder → independent QA, có approval gates, audit JSON và rollback.","en":"Simulate a planner → builder → independent QA workflow with approval gates and audit trail."},
evidence=["Agent role contracts","Approval matrix","Isolated fixtures","Deterministic QA"],
seniority=["Agent Integration Engineer","Agent Engineer","Agent Systems Architect"]),
dict(id="creator",name={"vi":"AI Creator & Educator","en":"AI Creator & Educator"},
tagline={"vi":"Chuyển hiểu biết thành workshop và sản phẩm dạy học","en":"Turn practical understanding into workshops"},
family="Education",audiences=["Creator","Newbie","Marketer","Team Lead"],role="Creator",icon="✦",accent="#f48eb6",
skills=["Content synthesis","Lesson planning","Accessibility","Fact checking","Course publishing"],
starter=["L01","L02","L03","L04","L05","L07","L08","L10","L12","L15"],
growth=["L11","L16","L19","L20","L24"],
capstone={"vi":"Thiết kế workshop 20 phút về 1 chức năng Codex; có bài thực hành, quiz, tài liệu nguồn và bộ ví dụ giả lập.","en":"Create a 20-minute Codex workshop with exercises, quiz, official sources and synthetic examples."},
evidence=["Facilitator guide","Learner worksheet","Lesson screenshots","Peer review notes"],
seniority=["AI Content Creator","AI Educator","Developer Advocate"]),
dict(id="lead",name={"vi":"AI Enablement & Team Lead","en":"AI Enablement & Team Lead"},
tagline={"vi":"Quản trị áp dụng AI theo KPI, quyền và năng lực","en":"Lead teams through measurable AI adoption"},
family="Leadership",audiences=["Team Lead","Pro","Developer"],role="Team Lead",icon="◇",accent="#a4e6a8",
skills=["Capability audit","Governance","Approval roles","Training plan","ROI measurement"],
starter=["L01","L02","L03","L04","L09","L10","L11","L13","L15","L16","L17","L20","L23","L24"],
growth=["L18","L19","L21","L25"],
capstone={"vi":"Lập chương trình nâng cấp năng lực 30 ngày cho team giả lập 6 người, có policy, risk register và review hàng tuần.","en":"Design a 30-day AI enablement rollout for a six-person synthetic team with policies and weekly reviews."},
evidence=["Skills gap matrix","Policy handbook","Risk register","30-day review dashboard"],
seniority=["AI Champion","Enablement Lead","AI Transformation Manager"])
]
CERT=[
{"level":"Zero","theme":{"vi":"Tư duy đầu ra","en":"Outcome thinking"},"checkpoint":{"vi":"Tạo 1 brief có giới hạn và tự kiểm tra nguồn.","en":"Create one bounded brief and verify sources."}},
{"level":"Beginner","theme":{"vi":"Toolset & an toàn","en":"Tools and safety"},"checkpoint":{"vi":"Dựng một ví dụ nhỏ, lưu source và ghi cách hoàn tác.","en":"Build one small example with source and rollback notes."}},
{"level":"Intermediate","theme":{"vi":"Workflow & kỹ năng","en":"Workflow and reusable skills"},"checkpoint":{"vi":"Viết contract, test và checklist có thể tái sử dụng.","en":"Produce a repeatable contract, tests and checklist."}},
{"level":"Advanced","theme":{"vi":"Agent & đánh giá","en":"Agents and review"},"checkpoint":{"vi":"Chạy mô phỏng có approval và độc lập QA.","en":"Simulate gated approvals and independent QA."}},
{"level":"Pro","theme":{"vi":"Production discipline","en":"Production discipline"},"checkpoint":{"vi":"Nộp source reproducible với release notes và evidence.","en":"Publish a reproducible source package and release evidence."}}
]
def make():
 snapshot=ACADEMY/"lessons.json"
 if not snapshot.exists():snapshot=ROOT/"data/academy-base-20261024.json"
 lessons=json.loads(snapshot.read_text())
 assert len(lessons)==25 and len({x["id"] for x in lessons})==25
 extension=json.loads((ROOT/"data/every-human-extension.json").read_text())
 assert extension["schema"]==1
 assert len(extension["lessons"])==36 and len(extension["careers"])==8
 lessons=lessons+extension["lessons"]
 careers=CAREERS+extension["careers"]
 assert len({l["id"] for l in lessons})==len(lessons)
 for l in lessons:
  assert all(str(u).startswith(("https://learn.chatgpt.com/","https://developers.openai.com/","https://platform.openai.com/","https://help.openai.com/")) for u in l["sources"])
  assert l["level"] in [c["level"] for c in CERT]
  assert isinstance(l["duration"],int) and 5<=l["duration"]<=180
 for career in careers:
  ids=set(career['starter']+career['growth'])
  assert len(ids)==len(career['starter']+career['growth'])
  assert ids.issubset({x["id"] for x in lessons})
 obj={"schema":1,"kind":"independent-learning-guidance",
      "academy":"../codex-academy/","academySource":"../codex-academy/lessons.json",
      "sourceSnapshot":"2026-10-24","authorship":"Independent educational plan; no job-placement guarantee or official OpenAI certification",
      "levels":CERT,"careers":careers,"lessons":lessons}
 payload=json.dumps(obj,ensure_ascii=False,indent=2)+"\n"
 (ROOT/"data").mkdir(parents=True,exist_ok=True)
 (ROOT/"data/codex-path.json").write_text(payload)
 print(json.dumps({"worker":"curriculum","status":"pass","careerPaths":len(careers),
                   "sourceLessons":len(lessons),"sourceURLs":len(set(u for x in lessons for u in x["sources"])),
                   "digest":hashlib.sha256(payload.encode()).hexdigest()}))
if __name__=="__main__":make()

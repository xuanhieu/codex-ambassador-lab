#!/usr/bin/env python3
"""Publish *metadata only* from a private permission-respecting documentation audit.

For browser display: request outcome, HTTP code, date, SHA256, and at most three
short heading strings from each fetched official page. Never publish article bodies.
"""
from pathlib import Path
import json,re,hashlib
ROOT=Path(__file__).resolve().parent
PRIVATE=ROOT.parents[1]/"docs/source-audit-2026-10-25/INDEX.json"
PUBLIC=ROOT/"data/source-health-20261025.json"
CATALOG=ROOT.parent/"codex-academy/catalog.json"
def build():
 rows=json.loads(PRIVATE.read_text())
 catalog=json.loads(CATALOG.read_text())["sources"]
 assert rows["total"]==len(catalog)==204 and rows["checkedAt"]=="2026-10-25"
 source_byid={d["id"]:d for d in catalog}
 docout=[]
 for d in rows["documents"]:
  official=source_byid.get(d["id"])
  assert official and official["url"]==d["url"],d["id"]
  success=d["status"]=="fetched" and d["http"]==200 and len(d["sha256"])==64
  headings=[]
  if success:
   for h in d["headings"][:3]:
    text=" ".join(h["text"].split())
    # Headings are short structure cues, not complete article content.
    if len(text)>130:text=text[:130]
    if text and not re.search(r"[\x00-\x08]|\S+@[\w.-]+\.[A-Za-z]{2,}",text):headings.append(text)
  docout.append({"id":d["id"],"url":d["url"],"status":"reachable" if success else "unavailable",
                 "http":d["http"],"checkedAt":"2026-10-25",
                 "sha256":d["sha256"] if success else "",
                 "headings":headings})
 assert sum(x["status"]=="reachable" for x in docout)==198
 assert sum(x["status"]=="unavailable" for x in docout)==6
 result={"schema":"public-official-source-health-v1","catalogSnapshot":"2026-10-24",
         "checkedAt":"2026-10-25","total":len(docout),
         "counts":{"reachable":198,"unavailable":6},
         "limits":"Reachable means HTTP 200 on check date only. Not a proof that content, features or instructions are current. The official docs own the text; no article body is copied.",
         "documents":docout}
 PUBLIC.write_text(json.dumps(result,ensure_ascii=False,indent=2)+"\n")
 print(json.dumps({"publicAudit":str(PUBLIC),"rows":len(docout),
       "bytes":PUBLIC.stat().st_size,"sha256":hashlib.sha256(PUBLIC.read_bytes()).hexdigest()}))
if __name__=="__main__":build()

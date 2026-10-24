#!/usr/bin/env python3
"""N104: offline snapshot comparator. Never crawls or fetches remote content."""
from __future__ import annotations
import argparse,hashlib,json,re,sys
from pathlib import Path
from urllib.parse import urlsplit

ALLOWED_SECTIONS={"Getting started","CLI","Security","Agents","Automation","API","Projects","Policies"}
MAX_SNAPSHOT=500
MAX_BYTES=1024*1024
HEX=re.compile("^[a-f0-9]{64}$")
ID=re.compile("^[A-Za-z0-9][A-Za-z0-9._-]{1,79}$")
def validate_snapshot(data):
    if not isinstance(data,dict) or set(data)!={"schema","label","documents"}:raise ValueError("Snapshot must contain schema, label and documents")
    if data["schema"]!="docs-radar-v1":raise ValueError("Unknown schema")
    if not isinstance(data["label"],str) or len(data["label"])>120:raise ValueError("Invalid label")
    docs=data["documents"]
    if not isinstance(docs,list) or len(docs)>MAX_SNAPSHOT:raise ValueError("Snapshot too large")
    results={};urls=set()
    for row in docs:
        if not isinstance(row,dict) or set(row)!={"id","title","url","section","content_sha256","updated","critical"}:
            raise ValueError("Unexpected document fields")
        ident,title,url,section=row["id"],row["title"],row["url"],row["section"]
        if not isinstance(ident,str) or not ID.fullmatch(ident) or ident in results:raise ValueError("Duplicate/invalid stable ID")
        if not isinstance(title,str) or not (1<=len(title.strip())<=180):raise ValueError("Invalid title")
        if not isinstance(url,str) or len(url)>350:raise ValueError("Invalid URL")
        parsed=urlsplit(url)
        if parsed.scheme!="https" or parsed.username or parsed.password or not parsed.hostname or parsed.hostname.endswith(".local"):
            raise ValueError("Documents require valid HTTPS URL metadata")
        if url in urls:raise ValueError("Duplicate document URL")
        if section not in ALLOWED_SECTIONS:raise ValueError("Unknown section")
        if not isinstance(row["content_sha256"],str) or not HEX.fullmatch(row["content_sha256"]):raise ValueError("Missing SHA-256")
        if not isinstance(row["updated"],str) or not re.fullmatch(r"\d{4}-\d{2}-\d{2}",row["updated"]):
            raise ValueError("Invalid ISO update date")
        if type(row["critical"]) is not bool:raise ValueError("critical must be boolean")
        results[ident]=row;urls.add(url)
    return results
def compare(before,after):
    old=validate_snapshot(before);new=validate_snapshot(after)
    events=[]
    def push(doc,type_,previous="",current=""):
        critical=doc["critical"]
        base={"removed":88,"added":30,"title":32,"url":65,"content_sha256":70,"section":38,"critical":55}[type_]
        risk=min(100,base+(13 if critical else 0))
        importance="critical" if risk>=80 else "high" if risk>=60 else "medium" if risk>=40 else "low"
        events.append({"id":doc["id"],"title":doc["title"],"section":doc["section"],
                       "type":type_,"risk":risk,"severity":importance,"critical":critical,
                       "old":previous,"new":current,"url":doc["url"] if type_!="removed" else previous if type_=="url" else doc["url"]})
    for ident in sorted(old.keys()-new.keys()):
        push(old[ident],"removed",old[ident]["url"],"")
    for ident in sorted(new.keys()-old.keys()):
        push(new[ident],"added","",new[ident]["url"])
    for ident in sorted(old.keys()&new.keys()):
        o,n=old[ident],new[ident]
        for field in ("title","url","section","content_sha256","critical"):
            if o[field]!=n[field]:
                def disp(value):
                    if isinstance(value,bool):return str(value).lower()
                    return str(value)
                push(n,field,disp(o[field]),disp(n[field]))
    return {"schema":"docs-radar-report-v1","before":before["label"],"after":after["label"],
            "summary":{"before":len(old),"after":len(new),"changed_events":len(events),
                       "affected_documents":len({e["id"] for e in events}),"critical_events":sum(e["severity"]=="critical" for e in events)},
            "events":sorted(events,key=lambda e:(-e["risk"],e["id"],e["type"]))}
def read(path:Path):
    if path.stat().st_size>MAX_BYTES:raise ValueError("JSON snapshot exceeds 1 MB")
    return json.loads(path.read_text(encoding="utf-8"))
def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument("before",type=Path);p.add_argument("after",type=Path)
    p.add_argument("--output",type=Path)
    args=p.parse_args()
    try:
        result=compare(read(args.before),read(args.after))
        raw=json.dumps(result,indent=2,ensure_ascii=False)+"\n"
        if args.output:args.output.write_text(raw,encoding="utf-8")
        else:print(raw,end="")
        return 0
    except (ValueError,TypeError,OSError,KeyError,json.JSONDecodeError) as err:
        print(json.dumps({"error":str(err)[:250]}),file=sys.stderr)
        return 2
if __name__=="__main__":raise SystemExit(main())

#!/usr/bin/env python3
"""N108: deterministic SHA-256 evidence chain. Integrity, NOT signatures/authorship."""
from __future__ import annotations
import argparse,hashlib,json,os,sys
from pathlib import Path,PurePosixPath

SCHEMA="evidence-chain-v1"
GENESIS="0"*64
MAX_FILES=250
MAX_FILE_SIZE=20*1024*1024
MAX_MANIFEST_BYTES=2*1024*1024
def sha(data:bytes)->str:return hashlib.sha256(data).hexdigest()
def canonical(value)->bytes:return json.dumps(value,ensure_ascii=False,sort_keys=True,separators=(",",":")).encode("utf-8")
def safe_relative(name):
    if not isinstance(name,str) or not name or len(name)>240:return False
    if "\\" in name or "\x00" in name or "\n" in name or "\r" in name:return False
    p=PurePosixPath(name)
    return not p.is_absolute() and not any(part in ("","..",".") for part in name.split("/")) and ":" not in name.split("/")[0]
def collect(base:Path,relative_names:list[str]):
    if len(relative_names)>MAX_FILES:raise ValueError("Too many files")
    if len(relative_names)!=len(set(relative_names)):raise ValueError("Duplicate paths")
    items=[]
    base=base.resolve(strict=True)
    if not base.is_dir():raise ValueError("Source root not a directory")
    for name in sorted(relative_names):
        if not safe_relative(name):raise ValueError("Unsafe path: "+repr(name))
        p=base/name
        if p.is_symlink() or any(x.is_symlink() for x in p.parents if x!=base and base in x.parents):
            raise ValueError("Symlink not allowed: "+name)
        resolved=p.resolve(strict=True)
        if not resolved.is_relative_to(base):raise ValueError("Path escaped source root")
        if not resolved.is_file():raise ValueError("Expected regular file: "+name)
        n=resolved.stat().st_size
        if n>MAX_FILE_SIZE:raise ValueError("Over max file size: "+name)
        data=resolved.read_bytes()
        items.append({"path":name,"size":len(data),"sha256":sha(data)})
    return items
def build_manifest(root:Path,paths:list[str]):
    items=collect(root,paths)
    chain=[]
    prev=GENESIS
    for index,item in enumerate(items,1):
        entry={"index":index,"prev":prev,"file":item}
        digest=sha(canonical(entry))
        chain.append({**entry,"digest":digest})
        prev=digest
    result={"schema":SCHEMA,"algorithm":"SHA-256","claim":"Integrity checksums only; not identity, signatures or source authenticity",
            "root":prev,"files":items,"chain":chain}
    return result
def validate_structure(manifest):
    if not isinstance(manifest,dict) or set(manifest)!={"schema","algorithm","claim","root","files","chain"}:
        raise ValueError("Invalid manifest keys")
    if manifest["schema"]!=SCHEMA or manifest["algorithm"]!="SHA-256":raise ValueError("Unsupported schema or hash")
    if not isinstance(manifest["files"],list) or len(manifest["files"])>MAX_FILES:raise ValueError("Invalid file array")
    if not isinstance(manifest["chain"],list) or len(manifest["chain"])!=len(manifest["files"]):raise ValueError("Invalid chain length")
    if not isinstance(manifest["claim"],str):raise ValueError("Invalid claim")
    if not isinstance(manifest["root"],str) or len(manifest["root"])!=64:raise ValueError("Invalid root digest")
    prev=GENESIS
    paths=[]
    for index,(f,record) in enumerate(zip(manifest["files"],manifest["chain"]),1):
        if not isinstance(f,dict) or set(f)!={"path","size","sha256"}:raise ValueError("Invalid file metadata")
        if not safe_relative(f["path"]):raise ValueError("Unsafe path")
        if type(f["size"])!=int or f["size"]<0 or f["size"]>MAX_FILE_SIZE:raise ValueError("Invalid file size")
        if not isinstance(f["sha256"],str) or len(f["sha256"])!=64 or any(c not in "0123456789abcdef" for c in f["sha256"]):
            raise ValueError("Invalid SHA-256 hex")
        if not isinstance(record,dict) or set(record)!={"index","prev","file","digest"}:
            raise ValueError("Invalid record")
        expected={"index":index,"prev":prev,"file":f}
        if record.get("index")!=index or record.get("prev")!=prev or record.get("file")!=f:
            raise ValueError("Broken chain or metadata")
        correct=sha(canonical(expected))
        if record.get("digest")!=correct:raise ValueError("Chain digest mismatch")
        prev=correct;paths.append(f["path"])
    if paths!=sorted(set(paths)):raise ValueError("Paths must be unique, sorted")
    if manifest["root"]!=prev:raise ValueError("Root digest mismatch")
    return paths
def verify_manifest(manifest,root:Path):
    paths=validate_structure(manifest)
    current=collect(root,paths)
    violations=[]
    for old,new in zip(manifest["files"],current):
        if new!=old:violations.append({"path":old["path"],"problem":"size_or_hash_mismatch"})
    return {"ok":not violations,"checked":len(paths),"root":manifest["root"],"violations":violations}
def cli():
    p=argparse.ArgumentParser(description=__doc__)
    sub=p.add_subparsers(dest="command",required=True)
    b=sub.add_parser("build",help="Build chain for explicit files below --root")
    b.add_argument("--root",type=Path,required=True)
    b.add_argument("--output",type=Path,required=True)
    b.add_argument("paths",nargs="+")
    v=sub.add_parser("verify",help="Check chain, metadata, and disk file bytes")
    v.add_argument("--root",type=Path,required=True)
    v.add_argument("--manifest",type=Path,required=True)
    args=p.parse_args()
    try:
        if args.command=="build":
            m=build_manifest(args.root,args.paths)
            args.output.parent.mkdir(parents=True,exist_ok=True)
            args.output.write_text(json.dumps(m,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
            print(json.dumps({"ok":True,"files":len(m["files"]),"root":m["root"],"manifest":str(args.output)}))
        else:
            if args.manifest.stat().st_size>MAX_MANIFEST_BYTES:raise ValueError("Manifest too large")
            m=json.loads(args.manifest.read_text(encoding="utf-8"))
            output=verify_manifest(m,args.root)
            print(json.dumps(output,ensure_ascii=False))
            if not output["ok"]:return 2
    except (ValueError,OSError,KeyError,TypeError,json.JSONDecodeError) as exc:
        print(json.dumps({"ok":False,"error":str(exc)[:350]}),file=sys.stderr)
        return 2
    return 0
if __name__=="__main__":raise SystemExit(cli())

#!/usr/bin/env python3
"""Codex workshop readiness check. Read-only, no API calls or auth commands.

Checks tool executables, minimum runtime environment and git-repo context.
No secrets, shell commands, or full local paths are logged; --demo is synthetic.
Designed for bilingual workshop use and deterministic unit testing.
"""
from __future__ import annotations

import argparse
import json
import os
from pathlib import Path
import platform
import re
import shutil
import subprocess
import sys

TOOLS = {
    "git": ["git", "--version"],
    "node": ["node", "--version"],
    "codex": ["codex", "--version"],
}
MAX_CAPTURE = 220
LOCALE = {
    "vi": {
        "heading": "Codex Builder Kit — Kiểm tra trước workshop",
        "ready": "Sẵn sàng cho workshop cơ bản.",
        "blocked": "Còn bước chuẩn bị trước workshop.",
        "git": "Git chưa có trong PATH. Cài Git từ nguồn chính thức.",
        "node": "Node.js chưa có trong PATH. Cài phiên bản LTS theo hướng dẫn chính thức.",
        "codex": "Codex CLI chưa có trong PATH. Kiểm tra cài đặt theo tài liệu OpenAI.",
        "repo": "Thư mục đang chọn chưa là Git repository; tạo repo mẫu với git init.",
        "timeout": "Lệnh kiểm tra quá thời gian; tự chạy command --version để xem lỗi.",
        "error": "Có lỗi khi kiểm tra binary; kiểm tra PATH và permission.",
        "ok": "Đã nhận diện",
        "demo": "DỮ LIỆU GIẢ LẬP; không phải cấu hình máy thật.",
        "privacy": "Chỉ kiểm tra tại máy; không thu token, email, tên tài khoản hay gửi HTTP.",
    },
    "en": {
        "heading": "Codex Builder Kit — Workshop preflight",
        "ready": "Ready for the beginner workshop.",
        "blocked": "Setup action is still required before the workshop.",
        "git": "Git is missing from PATH. Install Git from its official source.",
        "node": "Node.js is missing from PATH. Install the official LTS release.",
        "codex": "Codex CLI is missing from PATH. Follow OpenAI installation docs.",
        "repo": "Selected folder is not a Git repository; run git init in a sample folder.",
        "timeout": "Version command timed out; check the binary manually.",
        "error": "Binary check failed; verify PATH and permissions.",
        "ok": "Detected",
        "demo": "SYNTHETIC EXAMPLE; not a claim about this machine.",
        "privacy": "Local-only check; no tokens, email, usernames or HTTP requests.",
    },
}
DEMO = {
    "ready": {
        "git": ["ok", "git 2.46.0"],
        "node": ["ok", "v22.0.0"],
        "codex": ["ok", "codex-cli 0.160.0"],
        "repo": ["ok", "inside"],
    },
    "new-student": {
        "git": ["ok", "git 2.46.0"],
        "node": ["ok", "v22.0.0"],
        "codex": ["missing", ""],
        "repo": ["missing", ""],
    },
    "restricted-device": {
        "git": ["ok", "git 2.46.0"],
        "node": ["missing", ""],
        "codex": ["missing", ""],
        "repo": ["missing", ""],
    },
}

def safe_version(raw: str) -> str:
    """Permit version-shaped text only. Never print arbitrary CLI output."""
    line = raw.strip().splitlines()[0][:MAX_CAPTURE] if raw.strip() else ""
    pat = r"^(?:git version|git|codex(?:-cli)?|node)?[ ]*v?[0-9]+(?:\.[0-9]+){0,3}(?:[-+][A-Za-z0-9._-]{1,32})?$"
    if re.fullmatch(pat, line, flags=re.I):
        return line
    # Apple's Git prints a vendor suffix; retain only the version prefix.
    git_version=re.match(r"^git version ([0-9]+(?:\.[0-9]+){1,3})",line)
    if git_version:
        return "git version "+git_version.group(1)
    return "[version hidden: unrecognized output]"

def run_probe(argv, cwd, timeout=3):
    """Command list is frozen by the program, never sourced from input."""
    try:
        ret = subprocess.run(argv, cwd=cwd, text=True, capture_output=True,
                             timeout=timeout, check=False)
        if ret.returncode:
            return {"status": "error", "version": "", "code": "nonzero"}
        version = safe_version(ret.stdout)
        return {"status": "ok", "version": version, "code": ""}
    except subprocess.TimeoutExpired:
        return {"status": "timeout", "version": "", "code": "timeout"}
    except OSError:
        return {"status": "error", "version": "", "code": "exec_error"}

def make_report(root: Path, which=shutil.which, probe=run_probe):
    """Dependency injection makes tests offline and side effect free."""
    result = {"schema": "codex-workshop-preflight/v1", "mode": "local",
              "platform": platform.system(), "checks": {}, "ready": False}
    try:
        is_dir = root.is_dir()
    except (PermissionError, OSError):
        is_dir = False
    for key, argv in TOOLS.items():
        if not which(key):
            result["checks"][key] = {"status": "missing", "version": "", "code": "not_on_path"}
            continue
        result["checks"][key] = probe(argv, cwd=root if is_dir else Path.cwd())
    if not is_dir or result["checks"]["git"]["status"] != "ok":
        result["checks"]["repo"] = {"status": "missing", "version": "", "code": "not_git_repo"}
    else:
        try:
            r = subprocess.run(["git", "rev-parse", "--is-inside-work-tree"], cwd=root,
                               text=True, capture_output=True, timeout=3, check=False)
            result["checks"]["repo"] = {
                "status": "ok" if r.returncode==0 and r.stdout.strip()=="true" else "missing",
                "version": "", "code": "" if r.returncode==0 and r.stdout.strip()=="true" else "not_git_repo",
            }
        except (subprocess.TimeoutExpired, OSError):
            result["checks"]["repo"] = {"status": "error", "version": "", "code": "repo_error"}
    result["ready"] = all(v["status"]=="ok" for v in result["checks"].values())
    return result

def make_demo(name):
    if name not in DEMO:
        raise ValueError("Unknown synthetic scenario")
    data=DEMO[name]
    checks={}
    for key,(status,version) in data.items():
        checks[key]={"status":status,"version":safe_version(version) if version and key!="repo" else "",
                     "code": "" if status=="ok" else "synthetic_fixture"}
    return {"schema":"codex-workshop-preflight/v1", "mode":"synthetic-demo",
            "scenario":name,"platform":"fixture","checks":checks,
            "ready":all(v["status"]=="ok" for v in checks.values())}

def render(report, language):
    l=LOCALE[language]
    lines=[l["heading"]]
    if report["mode"]=="synthetic-demo":
        lines.append("["+l["demo"]+"]")
    for key,item in report["checks"].items():
        status=item["status"]
        if status=="ok":
            lines.append("[OK] "+key+": "+l["ok"]+" "+item["version"])
        else:
            explanation=l[key] if status=="missing" else l["timeout"] if status=="timeout" else l["error"]
            lines.append("[!!] "+key+": "+explanation)
    lines.append(l["ready"] if report["ready"] else l["blocked"])
    lines.append(l["privacy"])
    return "\n".join(lines)

def main(argv=None):
    p=argparse.ArgumentParser(description="Local-only Codex workshop preflight; no network/auth.")
    p.add_argument("--lang",choices=["vi","en"],default="vi")
    p.add_argument("--root",type=Path,default=Path.cwd(),help="Project folder (not printed).")
    p.add_argument("--demo",choices=sorted(DEMO),help="Use a synthetic, offline example.")
    p.add_argument("--json",action="store_true",help="Machine-readable, privacy-safe summary.")
    args=p.parse_args(argv)
    report=make_demo(args.demo) if args.demo else make_report(args.root)
    if args.json:
        print(json.dumps(report,ensure_ascii=False,sort_keys=True,indent=2))
    else:
        print(render(report,args.lang))
    # Nonzero exit for real unready host makes CI gates useful; demos always 0.
    return 0 if args.demo or report["ready"] else 2

if __name__=="__main__":
    sys.exit(main())

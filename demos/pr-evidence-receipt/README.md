# PR Traceability Receipt Builder / Bộ tạo biên nhận truy vết PR

An original offline learning demo: a Python CLI inspects a Git worktree, maps expected changes to requirements, hashes files and recorded evidence, and prints a JSON receipt. A static bilingual viewer displays that receipt. No dependency downloads, network calls, credentials, remote assets, or endorsement claims.

Bản học tập ngoại tuyến: CLI Python kiểm tra thay đổi Git, liên kết yêu cầu với tệp và bằng chứng, tính SHA256 rồi xuất JSON. Trình xem song ngữ hiển thị kết quả. Không cần tải thư viện hoặc kết nối mạng.

## Setup / Chuẩn bị

Python **3.9+** and a trusted installed Git executable on PATH. Use a normal repository with its own `.git` directory. No package installation. Run commands from this demo folder. The CLI does not write files or execute tests; shell redirection below is an explicit user write. Python may create `__pycache__`; set `PYTHONDONTWRITEBYTECODE=1` to avoid it.

Cần Python **3.9+** và Git tin cậy trên PATH. Chạy từ thư mục này. CLI không ghi tệp hoặc chạy kiểm thử; chuyển hướng đầu ra là thao tác ghi do người dùng chọn.

```sh
PYTHONDONTWRITEBYTECODE=1 python3 -m unittest -v test_receipt.py
python3 receipt.py --help
```

Open `viewer.html` directly in a browser, then choose the shipped `fixtures.json`. No HTTP server is needed. The fixture is **synthetic**, with a deliberate FAIL: an unexpected file and simulated evidence. The fixture's text and hash values illustrate data shape; they are not claims that an app test ran. The viewer never scans a browser filesystem. It reads only the file explicitly chosen and uses text rendering for untrusted content.

Mở `viewer.html`, chọn `fixtures.json`. Mẫu **tổng hợp** cố ý báo FAIL vì có tệp ngoài dự kiến và bằng chứng mô phỏng. Trình xem chỉ đọc tệp được chọn; không quét kho mã hoặc xác minh mã băm.

## Runnable local exercise / Bài thực hành cục bộ

This creates a **new** `workshop-demo` repository under this folder, runs the actual builder test suite, and records its observed output. It refuses to overwrite an existing exercise. Git setup commands below are fixed, instructor-owned commands; JSON never supplies commands. The tiny `app.txt` edit is synthetic exercise content; the recorded tests validate the receipt builder, not an application feature.

Đoạn sau tạo kho mới `workshop-demo`, chạy bộ kiểm thử thực tế và lưu đầu ra quan sát được. Không ghi đè bài cũ. Nội dung `app.txt` là dữ liệu thực hành; kiểm thử đánh giá bộ tạo biên nhận.

```sh
PYTHONDONTWRITEBYTECODE=1 python3 - <<'PY'
import hashlib, json, os, pathlib, subprocess, sys
base = pathlib.Path.cwd()
root = base / 'workshop-demo'
root.mkdir()  # fail safely if already present
runtime_env = {k: v for k, v in os.environ.items() if not k.startswith('GIT_')}
runtime_env.update(GIT_CONFIG_NOSYSTEM='1', GIT_CONFIG_GLOBAL=str(root / 'no-global'),
                   HOME=str(root), XDG_CONFIG_HOME=str(root), PYTHONDONTWRITEBYTECODE='1')
def git(*args):
    subprocess.run(['git', *args], cwd=root, env=runtime_env, check=True, timeout=3)
git('init', '-q', '--template=')
(root / 'app.txt').write_text('before\n', encoding='utf-8')
git('add', 'app.txt')
git('-c', 'user.name=Demo', '-c', 'user.email=demo@example.invalid',
    '-c', 'core.hooksPath=/dev/null', 'commit', '-qm', 'initial')
(root / 'app.txt').write_text('after\n', encoding='utf-8')
run = subprocess.run([sys.executable, '-m', 'unittest', '-v', 'test_receipt.py'],
                     cwd=base, env=runtime_env, capture_output=True, timeout=60)
log = run.stdout + run.stderr
(root / 'test.log').write_bytes(log)
spec = {'expected_files': ['app.txt'], 'requirements': [
    {'id': 'R1', 'description': 'Hash-linked exercise with observed builder tests / Bai tap truy vet',
     'files': ['app.txt'], 'evidence': ['T1']}], 'evidence': [
    {'id': 'T1', 'path': 'test.log', 'sha256': hashlib.sha256(log).hexdigest(),
     'outcome': 'passed' if run.returncode == 0 else 'failed', 'provenance': 'observed'}]}
(root / '.git/spec.json').write_text(json.dumps(spec), encoding='utf-8')
print('Observed suite exit:', run.returncode)
PY
python3 receipt.py --root workshop-demo --spec workshop-demo/.git/spec.json > workshop-demo/.git/receipt.json
```

Choose `workshop-demo/.git/receipt.json` in the viewer (some file pickers hide dot folders; enable hidden files or explicitly copy the receipt to this demo folder). Spec/output live in metadata to avoid becoming unexpected worktree changes. Add `workshop-demo/extra.txt` manually and rerun to observe FAIL. Alter `test.log` to observe a hash mismatch. Do not mark simulated evidence as observed: observed means a real run was recorded, still a user-supplied claim.

Chọn biên nhận mới trong trình xem. Thêm `extra.txt` để quan sát FAIL; sửa `test.log` để thấy mã băm không khớp. Không đổi nhãn mô phỏng thành quan sát nếu chưa chạy thực tế.

## Spec and receipt contract / Hợp đồng dữ liệu

See `fixtures.json` for the complete schema. Top-level spec keys are `expected_files`, `requirements`, `evidence`, plus optional `demo_receipt` (viewer illustration only, ignored by CLI). Unknown top-level and nested requirement/evidence fields are rejected. Every expected file must have a requirement; every requirement needs known files and evidence IDs. IDs must be unique within their lists. Paths use `/`, are repository-relative, and cannot contain `.`, `..`, `.git`, empty segments, backslashes, or NUL. Evidence requires a lowercase 64-character SHA256, `outcome` of `passed`/`failed`, and `provenance` of `observed`/`simulated`.

Mỗi tệp dự kiến phải gắn yêu cầu; mỗi yêu cầu cần ID bằng chứng hợp lệ. Đường dẫn tương đối không được thoát kho. SHA256 phải gồm 64 ký tự thường. Bằng chứng mô phỏng không được chấp nhận cho PASS.

Receipt fields include SHA256 hashes of **current worktree bytes**, changed flags, per-requirement satisfaction, accepted evidence, failures, and unexpected paths. Evidence paths are explicitly allowed worktree changes, so logs do not themselves trigger unexpected-change failures. Other changed/untracked nonignored files do. A deleted expected file causes FAIL because current bytes cannot be hashed. Renames include both source and destination; deletion of the source likewise causes FAIL. No baseline branch or PR diff is inferred.

Exit codes: **0 PASS**, **1 FAIL** (missing/unchanged expected file, unexpected changes, absent/mismatched/failed/simulated evidence), **2 ERROR** (invalid JSON/schema, unsafe paths/repository configuration, Git error or timeout). ERROR outputs JSON when arguments parse; argument errors use argparse diagnostics and exit 2.

Mã thoát: **0 đạt**, **1 không đạt**, **2 lỗi đầu vào hoặc kiểm tra**. Tệp bị xóa hoặc chưa thay đổi không thể đạt yêu cầu.

## Safety boundaries and limitations / Giới hạn

- The only CLI subprocess is the fixed `git ... status --porcelain=v1 -z --untracked-files=all --ignore-submodules=all` invocation defined by `GIT_ARGS` in `receipt.py`, with a 3-second timeout, no shell, and optional locks disabled. Environment Git overrides are removed; system/global user configuration is bypassed by using validated local configuration. Global ignore/attributes locations are replaced with repository-local paths. Git hooks, filters, and tests are not run by the builder; filter configurations are refused before status.
- The root, spec, repository contents (including metadata), and referenced file paths reject symlinks. Special repository files, Git includes, extensions, external worktree configuration, linked worktrees, and alternate/common metadata routing are refused. Nested submodules are not inspected; submodule changes are excluded. Files ignored by Git are outside unexpected-change reporting. Hard links and concurrently modified hostile repositories are not isolated; use a trusted, quiescent local checkout. This is a conservative educational guard, not an OS sandbox.
- Evidence hashes prove byte consistency with the spec, **not** who ran a test, when it ran, or whether it covers the changed code. No signatures, CI verification, semantic requirement validation, freshness attestation, staged-content hashes, or commit/branch comparison. PASS means the documented checks passed for this snapshot. There is no claim of security certification.
- JSON inputs are limited to 1 MB. File hashing streams bytes; repository traversal and Git output are not size capped. Very large repositories can be slow; only the Git subprocess has a deadline. Invalid UTF-8 filenames cause ERROR. Receipts contain paths and hashes; review them before sharing.
- The viewer labels document claims and cannot authenticate even `local-inspection` provenance. Keyboard/file-picker and narrow-screen support are implemented; browser interaction has not been empirically tested in this delivery. See `QA_REPORT.md`.

CLI chỉ chạy lệnh Git cố định với thời hạn 3 giây. Từ chối liên kết tượng trưng và cấu hình định tuyến ra ngoài. Không xác thực người chạy kiểm thử, thời gian hoặc độ bao phủ. Chỉ dùng kho cục bộ tin cậy, không thay đổi đồng thời; kiểm tra biên nhận trước khi chia sẻ.

## 20-minute workshop / Kịch bản 20 phút

| Time / Phút | Instructor action / Hoạt động |
|---|---|
| 0–3 | Open viewer and load fixtures.json. Ask why simulated evidence cannot justify PASS. / Mở mẫu; giải thích vì sao mô phỏng không chứng minh PASS. |
| 3–6 | Read expected_files → requirements → evidence. Trace one ID and hash. / Theo một ID từ yêu cầu tới bằng chứng. |
| 6–11 | Run tests, then the local exercise commands above. Observe actual exit code and receipt. / Chạy kiểm thử và bài tập; ghi nhận mã thoát thật. |
| 11–15 | Load real local receipt; add an extra file and rerun. Alter the log and rerun. / Tải biên nhận; thêm tệp ngoài dự kiến rồi sửa log. |
| 15–18 | Inspect safe paths and the fixed command in receipt.py. Discuss stale evidence and quiescent checkouts. / Đọc kiểm tra đường dẫn; thảo luận bằng chứng cũ. |
| 18–20 | Review QA checklist. Learner explains what a hash establishes and what remains a claim. / Kiểm tra danh sách QA; nêu giới hạn của mã băm. |

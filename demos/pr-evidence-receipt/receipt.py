#!/usr/bin/env python3
"""Read-only Git worktree receipt builder; Python standard library only."""
import argparse
import configparser
import hashlib
import json
import os
from pathlib import Path, PurePosixPath
import shutil
import stat
import subprocess
import sys

GIT_ARGS = ('--no-optional-locks', '-c', 'core.fsmonitor=false', '-c',
            'core.untrackedCache=false', '-c', 'core.excludesFile=.git/info/exclude',
            '-c', 'core.attributesFile=.git/info/attributes', 'status', '--porcelain=v1', '-z',
            '--untracked-files=all', '--ignore-submodules=all')
MAX_JSON = 1_000_000

class ReceiptError(ValueError):
    pass

def relative_path(value):
    if not isinstance(value, str) or not value or '\\' in value or '\x00' in value:
        raise ReceiptError('Invalid relative path')
    path = PurePosixPath(value)
    if path.is_absolute() or any(p in ('', '.', '..', '.git') for p in value.split('/')):
        raise ReceiptError('Unsafe path: ' + value)
    return path

def no_symlink_path(path):
    path = Path(os.path.abspath(path))
    for part in (path, *path.parents):
        if part.is_symlink():
            raise ReceiptError('Symlink refused: ' + str(part))
    return path

def safe_file(root, value):
    relative_path(value)
    path = no_symlink_path(root / value)
    if not path.is_relative_to(root):
        raise ReceiptError('Path escapes root')
    if path.exists() and not stat.S_ISREG(path.stat().st_mode):
        raise ReceiptError('Not a regular file: ' + value)
    return path

def digest(path):
    h = hashlib.sha256()
    with path.open('rb') as stream:
        for block in iter(lambda: stream.read(65536), b''):
            h.update(block)
    return h.hexdigest()

def read_json(path):
    path = no_symlink_path(path)
    if not path.is_file() or path.stat().st_size > MAX_JSON:
        raise ReceiptError('JSON must be a regular file under 1 MB')
    with path.open(encoding='utf-8') as stream:
        return json.load(stream)

def validate_spec(spec):
    if not isinstance(spec, dict) or set(spec) - {'expected_files', 'requirements', 'evidence', 'demo_receipt'}:
        raise ReceiptError('Unknown spec fields (commands are never accepted)')
    for key in ('expected_files', 'requirements', 'evidence'):
        if not isinstance(spec.get(key), list):
            raise ReceiptError('Expected list: ' + key)
    files = spec['expected_files']
    for name in files:
        relative_path(name)
    if not files or len(set(files)) != len(files):
        raise ReceiptError('Expected files must be nonempty and unique')
    ids = set()
    for item in spec['evidence']:
        if not isinstance(item, dict) or set(item) != {'id', 'path', 'sha256', 'outcome', 'provenance'}:
            raise ReceiptError('Invalid evidence fields')
        if not isinstance(item['id'], str) or not item['id'] or item['id'] in ids:
            raise ReceiptError('Evidence IDs must be nonempty and unique')
        ids.add(item['id'])
        relative_path(item['path'])
        sha = item['sha256']
        if not isinstance(sha, str) or len(sha) != 64 or any(c not in '0123456789abcdef' for c in sha):
            raise ReceiptError('Evidence needs a lowercase SHA256')
        if item['outcome'] not in ('passed', 'failed') or item['provenance'] not in ('observed', 'simulated'):
            raise ReceiptError('Invalid outcome/provenance')
    req_ids = set()
    if not spec['requirements']:
        raise ReceiptError('At least one requirement is needed')
    for req in spec['requirements']:
        if not isinstance(req, dict) or set(req) != {'id', 'description', 'files', 'evidence'}:
            raise ReceiptError('Invalid requirement fields')
        if not isinstance(req['id'], str) or not req['id'] or req['id'] in req_ids:
            raise ReceiptError('Requirement IDs must be nonempty and unique')
        req_ids.add(req['id'])
        if not isinstance(req['description'], str) or not req['description'].strip():
            raise ReceiptError('Requirement needs description')
        for key, allowed in (('files', set(files)), ('evidence', ids)):
            values = req[key]
            if not isinstance(values, list) or not values or any(not isinstance(v, str) or v not in allowed for v in values):
                raise ReceiptError('Requirement has missing/unknown ' + key)
    if set(files) - {f for r in spec['requirements'] for f in r['files']}:
        raise ReceiptError('Every expected file needs a requirement')
    return spec

def check_repository(root):
    root = no_symlink_path(root)
    if not root.is_dir() or not (root / '.git').is_dir():
        raise ReceiptError('Root needs its own .git directory; linked worktrees are unsupported')
    def walk_error(error):
        raise ReceiptError(str(error))
    for base, dirs, files in os.walk(root, followlinks=False, onerror=walk_error):
        for name in dirs + files:
            path = Path(base) / name
            if path.is_symlink():
                raise ReceiptError('Repository contains symlink: ' + str(path.relative_to(root)))
            if not (path.is_dir() or path.is_file()):
                raise ReceiptError('Repository contains special file')
    for name in ('commondir', 'gitdir', 'objects/info/alternates'):
        if (root / '.git' / name).exists():
            raise ReceiptError('External Git metadata routing refused: ' + name)
    config = configparser.RawConfigParser(strict=True)
    config.read(root / '.git/config', encoding='utf-8')
    for section in config.sections():
        if section.lower().startswith(('include', 'extensions', 'filter')):
            raise ReceiptError('Git includes/extensions/filters are unsupported')
        if section.lower() == 'core' and config.has_option(section, 'worktree'):
            raise ReceiptError('External Git worktree configuration refused')
    return root

def parse_status(data):
    entries = data.split(b'\0')
    changed = set()
    i = 0
    while i < len(entries) and entries[i]:
        entry = entries[i]
        if len(entry) < 4 or entry[2:3] != b' ':
            raise ReceiptError('Malformed Git status output')
        code = entry[:2]
        name = entry[3:].decode('utf-8', errors='strict')
        relative_path(name)
        changed.add(name)
        if b'R' in code or b'C' in code:
            i += 1
            if i >= len(entries) or not entries[i]:
                raise ReceiptError('Missing rename source')
            source = entries[i].decode('utf-8', errors='strict')
            relative_path(source)
            changed.add(source)
        i += 1
    return changed

def git_changes(root):
    executable = shutil.which('git')
    if not executable:
        raise ReceiptError('Git executable unavailable')
    env = {k: v for k, v in os.environ.items() if not k.startswith('GIT_')}
    env.update(GIT_CONFIG_NOSYSTEM='1', GIT_CONFIG_GLOBAL=str(root / '.git/config'),
               HOME=str(root / '.git'), XDG_CONFIG_HOME=str(root / '.git'),
               GIT_TERMINAL_PROMPT='0', LC_ALL='C')
    result = subprocess.run([executable, *GIT_ARGS], cwd=root, env=env,
                            capture_output=True, timeout=3, check=False)
    if result.returncode:
        raise ReceiptError('Git status failed (exit %d)' % result.returncode)
    return parse_status(result.stdout)

def build(root, spec):
    spec = validate_spec(spec)
    root = check_repository(root)
    changed = git_changes(root)
    failures = []
    expected = set(spec['expected_files'])
    # Evidence artifacts are explicitly declared allowed changes, but never executed.
    allowed = expected | {e['path'] for e in spec['evidence']}
    unexpected = sorted(changed - allowed)
    if unexpected:
        failures.append('Unexpected changes / Thay đổi ngoài dự kiến')
    files = []
    for name in sorted(expected):
        path = safe_file(root, name)
        exists = path.is_file()
        files.append({'path': name, 'changed': name in changed,
                      'sha256': digest(path) if exists else None})
        if not exists:
            failures.append('Missing expected file: ' + name)
        if name not in changed:
            failures.append('Expected file is unchanged: ' + name)
    evidence = []
    for item in spec['evidence']:
        path = safe_file(root, item['path'])
        actual = digest(path) if path.is_file() else None
        reasons = []
        if actual is None:
            reasons.append('missing artifact')
        elif actual != item['sha256']:
            reasons.append('hash mismatch')
        if item['outcome'] != 'passed':
            reasons.append('recorded test failure')
        if item['provenance'] != 'observed':
            reasons.append('simulated evidence')
        evidence.append(dict(item, actual_sha256=actual, accepted=not reasons, issues=reasons))
        failures.extend('Evidence %s: %s' % (item['id'], reason) for reason in reasons)
    accepted = {e['id'] for e in evidence if e['accepted']}
    requirements = [dict(r, satisfied=all(e in accepted for e in r['evidence']) and
                         all(f['changed'] and f['sha256'] for f in files if f['path'] in r['files']))
                    for r in spec['requirements']]
    return {'schema_version': 1, 'provenance': 'local-inspection',
            'evidence_policy': 'Recorded claims only; tests were not executed by this tool.',
            'status': 'FAIL' if failures else 'PASS', 'files': files,
            'unexpected_changes': unexpected, 'evidence': evidence,
            'requirements': requirements, 'failures': failures}

def main(argv=None):
    parser = argparse.ArgumentParser(description='PR receipt / Biên nhận truy vết PR (read-only)')
    parser.add_argument('--root', type=Path, required=True)
    parser.add_argument('--spec', type=Path, required=True)
    args = parser.parse_args(argv)
    try:
        receipt = build(args.root, read_json(args.spec))
    except (OSError, ValueError, configparser.Error, subprocess.SubprocessError) as error:
        print(json.dumps({'schema_version': 1, 'status': 'ERROR', 'provenance': 'local-inspection',
                          'failures': [str(error)]}, ensure_ascii=False))
        return 2
    print(json.dumps(receipt, ensure_ascii=False, indent=2, sort_keys=True))
    return 0 if receipt['status'] == 'PASS' else 1

if __name__ == '__main__':
    sys.exit(main())

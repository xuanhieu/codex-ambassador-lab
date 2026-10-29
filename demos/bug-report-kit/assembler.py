#!/usr/bin/env python3
"""Offline, synthetic-data bug report assembler. Python standard library only."""
import argparse
import base64
import binascii
import hashlib
import ipaddress
import json
import re
import sys
from pathlib import Path

VERSION = '1'
MAX_INPUT = 200_000
FIELDS = ('title', 'trace', 'steps')
WARNING = ('Pattern-based redaction only; unknown secrets may remain. Human review required. '
           '/ Chỉ che theo mẫu; có thể còn bí mật chưa nhận diện. Cần người kiểm tra.')
# Key names: NAMED_KEYS are unambiguous; GENERIC_KEYS also occur in prose, so their unquoted
# values must contain a digit or symbol before they are redacted (avoids "token: required").
NAMED_KEYS = r'(?:api[_-]?key|access[_-]?token|auth[_-]?token|refresh[_-]?token|secret[_-]?key|client[_-]?secret)'
GENERIC_KEYS = r'(?:token|secret|password|passwd|pwd|authorization)'
RULES = [
    ('bearer', re.compile(r'\bBearer[ \t]+[^\s\x00-\x1f"\'<>`]+', re.I | re.ASCII)),
    # Validated in BASIC_AUTH_VALID: must decode to "user:pass", so "Basic usage" survives.
    ('basic_auth', re.compile(r'\bBasic[ \t]+[A-Za-z0-9+/]{4,}={0,2}(?![A-Za-z0-9+/=])', re.ASCII)),
    ('jwt', re.compile(r'\beyJ[A-Za-z0-9_-]{4,}\.[A-Za-z0-9_-]{4,}\.[A-Za-z0-9_-]*', re.ASCII)),
    ('url_credentials', re.compile(r'(?<=://)[^\s/?#@:"\'<>`\[\]]+:[^\s/?#@"\'<>`]+(?=@)', re.ASCII)),
    # JSON/dict style: quoted key AND quoted value, e.g. "api_key": "..." (values already redacted are skipped).
    ('secret', re.compile(r'(?:"(?:' + NAMED_KEYS + '|' + GENERIC_KEYS + r')"|\'(?:' + NAMED_KEYS + '|' + GENERIC_KEYS +
                          r')\')[ \t]*[:=][ \t]*(?:"(?!\[)[^"\n]+"|\'(?!\[)[^\'\n]+\')', re.I | re.ASCII)),
    ('api_key', re.compile(r'(?<![A-Za-z0-9])' + NAMED_KEYS + r'[ \t]*[:=][ \t]*["\']?[A-Za-z0-9_./+\-=]{8,}["\']?', re.I | re.ASCII)),
    ('api_key', re.compile(r'\b(?:sk-[A-Za-z0-9_-]{16,}|ghp_[A-Za-z0-9_]{20,}|github_pat_[A-Za-z0-9_]{20,}|(?:AKIA|ASIA)[A-Z0-9]{16})\b', re.ASCII)),
    ('secret', re.compile(r'(?<![A-Za-z0-9])' + GENERIC_KEYS + r'[ \t]*[:=][ \t]*["\']?(?=[^\s"\']*[0-9_/+\-=~!@#$%^&*])'
                          r'[A-Za-z0-9_./+\-=~!@#$%^&*]{8,}["\']?', re.I | re.ASCII)),
    ('email', re.compile(r'[A-Za-z0-9.!#$%&\'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9.-]*[A-Za-z0-9])?\.[A-Za-z]{2,}')),
    ('home_path', re.compile(r'(?:[A-Za-z]:[\\/](?:Users|Documents and Settings)[\\/]|/(?:Users|home)/|/root(?:/|\b))[^\s\x00-\x1f"\'<>`|]*', re.I | re.ASCII)),
]
# Invisible characters that could split a secret and defeat the rules: C0/C1 controls, bidi
# controls, zero-width/joiner characters (U+200B-U+200F, U+2060-U+2064), BOM, soft hyphen, U+180E.
INVISIBLE = re.compile('[\x00-\x08\x0b-\x1f\x7f-\x9f\xad᠎​-‏‪-‮⁠-⁤⁦-⁩﻿]')


def basic_auth_valid(match):
    """Only count "Basic <b64>" when it decodes to user:password credentials."""
    value = match.group().split()[-1].rstrip('=')
    try:
        return b':' in base64.b64decode(value + '=' * (-len(value) % 4), validate=True)
    except (binascii.Error, ValueError):
        return False


VALIDATORS = {'basic_auth': basic_auth_valid}
IP_CANDIDATE = re.compile(r'(?<![A-Za-z0-9_:])(?:[A-Fa-f0-9]*:){2,}[A-Fa-f0-9:.]*(?:%[A-Za-z0-9_.-]+)?|(?<![A-Za-z0-9_.])(?:[0-9]{1,3}\.){3}[0-9]{1,3}(?![A-Za-z0-9_]|\.[0-9])')


def sanitize(text):
    counts = {}
    text = text.replace('\r\n', '\n').replace('\r', '\n')
    # Remove control, bidi and zero-width characters (tabs and newlines are kept).
    text = INVISIBLE.sub('', text)
    for kind, pattern in RULES:
        def replace(match, kind=kind):
            if kind in VALIDATORS and not VALIDATORS[kind](match):
                return match.group()
            counts[kind] = counts.get(kind, 0) + 1
            return '[' + kind.upper() + '_REDACTED]'
        text = pattern.sub(replace, text)
    def replace_ip(match):
        candidate = match.group()
        # A sentence-ending dot is not part of IPv6.
        address = candidate.rstrip('.') if ':' in candidate else candidate
        try:
            ipaddress.ip_address(address.split('%', 1)[0])
        except ValueError:
            return candidate
        counts['ip'] = counts.get('ip', 0) + 1
        return '[IP_REDACTED]' + candidate[len(address):]
    text = IP_CANDIDATE.sub(replace_ip, text)
    return text, counts


def validate(data):
    if not isinstance(data, dict) or set(data) != set(FIELDS):
        raise ValueError('Expected exactly title, trace, steps / Cần đúng ba trường title, trace, steps')
    if any(not isinstance(data[k], str) or not data[k].strip() for k in FIELDS):
        raise ValueError('Fields must be nonempty strings / Các trường phải là chuỗi có nội dung')
    if sum(len(data[k]) for k in FIELDS) > MAX_INPUT:
        raise ValueError('Input exceeds 200000 characters / Dữ liệu quá 200000 ký tự')
    return data


def fence(text, language='text'):
    longest = max((len(m.group()) for m in re.finditer(r'`+', text)), default=0)
    delimiter = '`' * max(3, longest + 1)
    return delimiter + language + '\n' + text + '\n' + delimiter


def assemble(data):
    validate(data)
    fields, counts = {}, {}
    for key in FIELDS:
        fields[key], found = sanitize(data[key])
        for kind, number in found.items():
            counts[kind] = counts.get(kind, 0) + number
    safe = {'schema_version': 1, 'provenance': 'user-supplied; educational synthetic input expected',
            'warning': WARNING, 'redactions': counts, 'fields': fields}
    report = '# Sanitized bug report / Báo lỗi đã che theo mẫu\n\n' + WARNING + '\n\n'
    for key, label in [('title', 'Title / Tiêu đề'), ('steps', 'Reproduction steps / Các bước tái hiện'), ('trace', 'Error trace / Vết lỗi')]:
        report += '## ' + label + '\n\n' + fence(fields[key]) + '\n\n'
    report += '## Structured data / Dữ liệu có cấu trúc\n\n' + fence(json.dumps(safe, ensure_ascii=False, indent=2), 'json') + '\n'
    canonical = json.dumps(data, ensure_ascii=True, sort_keys=True, separators=(',', ':'))
    digest = hashlib.sha256((VERSION + '\n' + canonical + '\n' + report).encode()).hexdigest()
    return report, digest, safe


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('input', type=Path, help='UTF-8 JSON with title, trace, steps')
    parser.add_argument('--output', type=Path, help='Create a new Markdown file after review')
    parser.add_argument('--approve', help='Exact SHA-256 printed by preview, after human review')
    args = parser.parse_args(argv)
    try:
        with args.input.open('rb') as source:
            raw = source.read(MAX_INPUT * 4 + 1)
        if len(raw) > MAX_INPUT * 4:
            raise ValueError('Input file too large / Tệp quá lớn')
        report, digest, _ = assemble(json.loads(raw.decode('utf-8')))
        if args.output:
            if args.approve != digest:
                raise ValueError('Preview and review first; supply its exact --approve digest / Xem trước và kiểm tra mã duyệt')
            with args.output.open('x', encoding='utf-8', newline='\n') as target:
                target.write(report)
            print('Exported locally / Đã xuất cục bộ: ' + str(args.output))
        else:
            if args.approve:
                raise ValueError('--approve requires --output')
            print(report)
            print('Review required / Cần kiểm tra. Approval SHA-256: ' + digest, file=sys.stderr)
        return 0
    except (OSError, ValueError, UnicodeError, RecursionError) as error:
        # Do not echo parser errors, paths or user input: they may contain secrets.
        print('Cannot process or export. Check JSON fields, size, review digest and a new output path. '
              '/ Không thể xử lý hoặc xuất. Kiểm tra JSON, kích thước, mã duyệt và đường dẫn mới. '
              + '(' + type(error).__name__ + ')', file=sys.stderr)
        return 2


if __name__ == '__main__':
    sys.exit(main())

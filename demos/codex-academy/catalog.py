#!/usr/bin/env python3
"""Compile link metadata only. Network access occurs exclusively with --refresh."""
import argparse
import hashlib
import json
from pathlib import Path
import re
import shutil
import sys
from datetime import datetime, timezone
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit
from urllib.request import HTTPRedirectHandler, Request, build_opener

ROOT = Path(__file__).resolve().parent
INDEX = ROOT / 'sources/official-index-2026-10-24.txt'
INDEX_URL = 'https://learn.chatgpt.com/docs/llms.txt'
HOSTS = frozenset({'learn.chatgpt.com', 'developers.openai.com', 'platform.openai.com'})
TIERS = ['Zero', 'Beginner', 'Intermediate', 'Advanced', 'Pro']
AUDIENCES = ['Newbie', 'Creator', 'Marketer', 'Developer', 'Team Lead', 'Pro']
SUPPLEMENTS = [
    ('OpenAI training', 'https://developers.openai.com/training'),
    ('Learn Codex', 'https://developers.openai.com/learn/codex'),
    ('Documentation MCP', 'https://developers.openai.com/learn/docs-mcp'),
]


def canonical_url(value):
    if not isinstance(value, str) or re.search(r'[\s\\\x00-\x1f\x7f]', value):
        raise ValueError('Invalid URL characters')
    parts = urlsplit(value)
    if (parts.scheme != 'https' or parts.hostname not in HOSTS or parts.username
            or parts.password or parts.port not in (None, 443)):
        raise ValueError('Only allowlisted HTTPS URLs are accepted')
    # Preserve semantic query parameters, especially ?surface=cli versus ?surface=ide.
    query = [(k, v) for k, v in parse_qsl(parts.query, keep_blank_values=True)
             if not k.lower().startswith('utm_')]
    path = parts.path.rstrip('/') or '/'
    return urlunsplit(('https', parts.hostname, path, urlencode(sorted(query)), ''))


def is_legacy(title, description='', url=''):
    return bool(re.search(r'\b(legacy|deprecated|removed|removal)\b',
                          f'{title} {description} {url}', re.I))


def classify(title, category, url):
    text = f'{title} {category} {url}'.lower()
    product = 'Codex' if any(x in text for x in ['codex', 'cli', 'ide extension', 'git', 'sandbox']) else 'ChatGPT'
    if 'mcp' in text or 'api' in text or 'app server' in text:
        product = 'Platform' if 'developers.openai.com' in url else product
    level = 'Zero' if any(x in text for x in ['get started', 'quickstart', 'use chatgpt', 'overview']) else 'Beginner'
    if any(x in text for x in ['config', 'skills', 'plugins', 'projects']):
        level = 'Intermediate'
    if any(x in text for x in ['mcp', 'security', 'sandbox', 'subagent', 'non-interactive', 'github action']):
        level = 'Advanced'
    if any(x in text for x in ['enterprise', 'admin', 'audit', 'app server']):
        level = 'Pro'
    kind = 'Reference' if any(x in text for x in ['reference', 'commands', 'settings', 'config']) else 'Guide'
    if any(x in text for x in ['videos', 'training']):
        kind = 'Learning'
    if any(x in text for x in ['llms', 'manual']):
        kind = 'Index'
    audience = ['Developer', 'Pro'] if product in ('Codex', 'Platform') else ['Newbie', 'Creator', 'Marketer']
    if level == 'Pro':
        audience = ['Team Lead', 'Pro']
    return product, level, kind, audience


def parse_index(content):
    records = {}
    category = 'General'
    for line in content.splitlines():
        if line.startswith('## '):
            category = line[3:].strip()
        match = re.match(r'^\s*-\s+\[([^\]]+)\]\((https://[^\s)]+)\)(?::\s*(.*))?\s*$', line)
        if not match:
            continue
        title, raw, description = match.groups()
        url = canonical_url(raw)
        product, level, kind, audience = classify(title, category, url)
        legacy = is_legacy(title, description or '', url)
        if url in records:
            row = records[url]
            row['categories'] = sorted(set(row['categories'] + [category]))
            row['legacy'] = row['legacy'] or legacy
            if title not in row['aliases'] and title != row['title']:
                row['aliases'].append(title)
            continue
        records[url] = dict(id='src-' + hashlib.sha256(url.encode()).hexdigest()[:12],
                            title=title, url=url, categories=[category], aliases=[],
                            product=product, level=level, type=kind, audience=audience,
                            legacy=legacy)
    return list(records.values())


def build_catalog(content, snapshot='2026-10-24'):
    records = parse_index(content)
    known = {r['url'] for r in records}
    for title, raw in SUPPLEMENTS:
        url = canonical_url(raw)
        if url not in known:
            product, level, kind, audience = classify(title, 'Supplementary learning', url)
            records.append(dict(id='src-' + hashlib.sha256(url.encode()).hexdigest()[:12],
                                title=title, url=url, categories=['Supplementary learning'],
                                aliases=[], product=product, level=level, type=kind,
                                audience=audience, legacy=False))
    return dict(schemaVersion=1, snapshot=snapshot, indexUrl=INDEX_URL,
                classification='Editorial metadata inferred from index titles and topics; verify current source before use.',
                sources=records)


def validate_lessons(lessons, catalog):
    assert isinstance(lessons, list) and len(lessons) >= 25, 'Need 25 lessons'
    ids = {x['id'] for x in lessons}
    assert len(ids) == len(lessons), 'Duplicate lesson IDs'
    known = {x['url'] for x in catalog['sources']}
    for row in lessons:
        assert row['level'] in TIERS and row['audience'] and set(row['audience']) <= set(AUDIENCES)
        assert isinstance(row['duration'], int) and 5 <= row['duration'] <= 180
        assert set(row['prerequisites']) <= ids and row['id'] not in row['prerequisites']
        assert row['sources'] and all(canonical_url(url) in known for url in row['sources'])
        for lang in ['en', 'vi']:
            body = row[lang]
            assert all(isinstance(body[k], str) and body[k].strip() for k in ['title', 'purpose', 'outcome'])
            assert len(body['exercise']) >= 3 and all(isinstance(x, str) and x.strip() for x in body['exercise'])
            assert len(body['checklist']) >= 2 and all(isinstance(x, str) and x.strip() for x in body['checklist'])
            quiz = body['quiz']
            assert quiz['question'] and quiz['explanation'] and len(quiz['options']) >= 3
            assert len(set(quiz['options'])) == len(quiz['options'])
            assert type(quiz['answer']) is int and 0 <= quiz['answer'] < len(quiz['options'])
        assert row['en']['quiz']['answer'] == row['vi']['quiz']['answer']
    visiting, visited = set(), set()
    lookup = {x['id']: x for x in lessons}
    def visit(key):
        assert key not in visiting, 'Prerequisite cycle'
        if key in visited:
            return
        visiting.add(key)
        for dep in lookup[key]['prerequisites']:
            visit(dep)
        visiting.remove(key)
        visited.add(key)
    for key in ids:
        visit(key)


class SafeRedirect(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        canonical_url(newurl)
        # Refresh is the index only, including redirects; never follow an article redirect.
        if canonical_url(newurl) != INDEX_URL:
            raise ValueError('Index redirected outside the approved index endpoint')
        return super().redirect_request(req, fp, code, msg, headers, newurl)


def refresh_index():
    request = Request(INDEX_URL, headers={'User-Agent': 'BR-E-Academy-Index/1.0'}, method='GET')
    with build_opener(SafeRedirect()).open(request, timeout=20) as response:
        canonical_url(response.url)
        raw = response.read(2_000_001)
    if len(raw) > 2_000_000:
        raise ValueError('Index exceeds 2 MB')
    content = raw.decode('utf-8')
    candidate = build_catalog(content, datetime.now(timezone.utc).date().isoformat())
    if len(candidate['sources']) < 200:
        raise ValueError('Unexpected index: fewer than 200 sources; old snapshot kept')
    validate_lessons(json.loads((ROOT / 'lessons.json').read_text()), candidate)
    stamp = datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%S%fZ')
    INDEX.parent.mkdir(parents=True, exist_ok=True)
    if INDEX.is_file():
        shutil.copy2(INDEX, INDEX.with_suffix('.txt.' + stamp + '.bak'))
    INDEX.write_text(content, encoding='utf-8')
    (ROOT / 'sources/snapshot.json').write_text(json.dumps({'snapshot': candidate['snapshot']}))
    return candidate


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    modes = parser.add_mutually_exclusive_group(required=True)
    for mode in ['build', 'check', 'refresh']:
        modes.add_argument('--' + mode, action='store_true')
    args = parser.parse_args()
    snapshot_path = ROOT / 'sources/snapshot.json'
    snapshot = json.loads(snapshot_path.read_text())['snapshot'] if snapshot_path.exists() else '2026-10-24'
    catalog = refresh_index() if args.refresh else build_catalog(INDEX.read_text(encoding='utf-8'), snapshot)
    if len(catalog['sources']) < 200:
        raise ValueError('Catalog must contain at least 200 unique sources')
    lessons_path = ROOT / 'lessons.json'
    if lessons_path.exists():
        validate_lessons(json.loads(lessons_path.read_text(encoding='utf-8')), catalog)
    target = ROOT / 'catalog.json'
    if args.check:
        assert json.loads(target.read_text(encoding='utf-8')) == catalog, 'Catalog is stale; run --build'
    else:
        target.write_text(json.dumps(catalog, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f"{'Checked' if args.check else 'Built'} {len(catalog['sources'])} unique source records; snapshot {catalog['snapshot']}")


if __name__ == '__main__':
    try:
        main()
    except (ValueError, AssertionError, OSError) as exc:
        print(f'Catalog error: {exc}', file=sys.stderr)
        sys.exit(1)

#!/usr/bin/env python3
"""Offline requirement-to-test receipt validator. Does not execute linked tests."""
import argparse
import json
import sys
from pathlib import Path

MAX_BYTES = 1_000_000
OUTCOMES = {'pass', 'fail', 'unverified'}
PROVENANCE = {'synthetic', 'manual'}


def validate(data):
    """Return diagnostics; an empty list means structurally valid, covered claims."""
    errors = []
    if not isinstance(data, dict):
        return ['receipt must be an object']
    if type(data.get('schema_version')) is not int or data['schema_version'] != 1:
        errors.append('schema_version must be 1')
    if not isinstance(data.get('provenance'), str) or data['provenance'] not in PROVENANCE:
        errors.append('provenance must be synthetic or manual')
    collections = {}
    for name in ('requirements', 'tests', 'links'):
        value = data.get(name)
        if not isinstance(value, list):
            errors.append(f'{name} must be an array')
            value = []
        collections[name] = value
    if not collections['requirements']:
        errors.append('requirements must not be empty')
    indexes = {}
    for name in ('requirements', 'tests'):
        index = {}
        for n, item in enumerate(collections[name]):
            where = f'{name}[{n}]'
            if not isinstance(item, dict):
                errors.append(f'{where} must be an object')
                continue
            ident = item.get('id')
            if not isinstance(ident, str) or not ident.strip() or ident != ident.strip():
                errors.append(f'{where}.id must be a nonempty trimmed string')
                continue
            if ident in index:
                errors.append(f'duplicate {name} id: {ident}')
            index[ident] = item
            if not isinstance(item.get('text'), str) or not item['text'].strip():
                errors.append(f'{where}.text must be nonempty')
            rev = item.get('revision')
            if type(rev) is not int or rev < 1:
                errors.append(f'{where}.revision must be a positive integer')
        indexes[name] = index
    seen = set()
    covered = set()
    for n, link in enumerate(collections['links']):
        where = f'links[{n}]'
        if not isinstance(link, dict):
            errors.append(f'{where} must be an object')
            continue
        rid, tid = link.get('requirement_id'), link.get('test_id')
        if not isinstance(rid, str) or rid not in indexes['requirements']:
            errors.append(f'{where}: unknown requirement reference')
            continue
        if not isinstance(tid, str) or tid not in indexes['tests']:
            errors.append(f'{where}: unknown test reference')
            continue
        pair = (rid, tid)
        if pair in seen:
            errors.append(f'{where}: duplicate link {rid} -> {tid}')
        seen.add(pair)
        covered.add(rid)
        outcome = link.get('outcome')
        if not isinstance(outcome, str) or outcome not in OUTCOMES:
            errors.append(f'{where}: invalid outcome')
        elif outcome != 'pass':
            errors.append(f'{where}: {outcome} test {tid}')
        for field, entity in (('requirement_revision', indexes['requirements'][rid]),
                              ('test_revision', indexes['tests'][tid])):
            if type(link.get(field)) is not int or link[field] != entity.get('revision'):
                errors.append(f'{where}: stale evidence ({field})')
    for rid in indexes['requirements']:
        if rid not in covered:
            errors.append(f'missing test coverage: {rid}')
    return errors


def read_json(path):
    with Path(path).open('rb') as stream:
        raw = stream.read(MAX_BYTES + 1)
    if len(raw) > MAX_BYTES:
        raise ValueError(f'input exceeds {MAX_BYTES} bytes')
    def unique_keys(pairs):
        result = {}
        for key, value in pairs:
            if key in result:
                raise ValueError(f'duplicate JSON key: {key}')
            result[key] = value
        return result
    return json.loads(raw.decode('utf-8'), object_pairs_hook=unique_keys,
                      parse_constant=lambda value: (_ for _ in ()).throw(ValueError(f'invalid constant: {value}')))


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('receipt', help='JSON receipt or synthetic scenario bundle')
    parser.add_argument('--scenario', help='scenario name from a bundle')
    args = parser.parse_args(argv)
    try:
        data = read_json(args.receipt)
        if args.scenario:
            if not isinstance(data, dict) or not isinstance(data.get('scenarios'), dict):
                raise ValueError('expected a scenario bundle')
            if args.scenario not in data['scenarios']:
                raise ValueError('unknown scenario')
            data = data['scenarios'][args.scenario]
        errors = validate(data)
    except (OSError, ValueError, RecursionError) as exc:
        print(f'INPUT ERROR: {exc}', file=sys.stderr)
        return 2
    if errors:
        print('\n'.join(f'ERROR: {error}' for error in errors))
        return 1
    print('VALID: all requirements have current passing evidence claims; linked tests were NOT executed.')
    return 0


if __name__ == '__main__':
    sys.exit(main())

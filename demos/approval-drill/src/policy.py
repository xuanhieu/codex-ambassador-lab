"""Pure classification only. Never executes or sends any proposed action."""
import argparse
import json
from pathlib import Path

DATA_PATH = Path(__file__).resolve().parents[1] / 'fixtures' / 'scenarios.json'

def load_data():
    return json.loads(DATA_PATH.read_text(encoding='utf-8'))

def evaluate(action, data=None):
    data = load_data() if data is None else data
    if not isinstance(action, dict):
        return {'verdict': 'block', 'missing': [], 'reason': 'invalid'}
    category = action.get('category')
    approvals = action.get('approvals')
    flags = ('outside_scope', 'raw_secret', 'untrusted_instruction')
    if (not isinstance(category, str) or category not in data['matrix']
        or not isinstance(approvals, list)
        or any(not isinstance(r, str) or r not in data['roles'] for r in approvals)
        or len(approvals) != len(set(approvals))
        or any(type(action.get(f)) is not bool for f in flags)):
        return {'verdict': 'block', 'missing': [], 'reason': 'invalid'}
    for flag in flags:
        if action[flag]:
            return {'verdict': 'block', 'missing': [], 'reason': flag}
    missing = [r for r in data['matrix'][category]['required'] if r not in approvals]
    return {'verdict': 'escalate' if missing else 'proceed', 'missing': missing,
            'reason': 'missing_approval' if missing else 'approved'}

def grade(action, decision, route, data=None):
    expected = evaluate(action, data)
    passed = (decision == expected['verdict'] and isinstance(route, list)
              and all(isinstance(r, str) for r in route)
              and len(route) == len(set(route))
              and sorted(route) == sorted(expected['missing']))
    return {'passed': passed, **expected}

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--scenario', help='Synthetic scenario ID, e.g. A03')
    args = parser.parse_args()
    data = load_data()
    selected = [s for s in data['scenarios'] if not args.scenario or s['id'] == args.scenario]
    if not selected:
        parser.error('Unknown scenario ID')
    print(json.dumps([{ 'id': s['id'], **evaluate(s, data)} for s in selected], indent=2))

if __name__ == '__main__':
    main()

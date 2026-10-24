"""Offline tests of the actual validator, using explicitly synthetic claims."""
import copy
import contextlib
import io
import json
from pathlib import Path
import tempfile
import unittest
import trace as validator

ROOT = Path(__file__).resolve().parent
SCENARIOS = validator.read_json(ROOT / 'fixtures.json')['scenarios']


class TraceTests(unittest.TestCase):
    def setUp(self):
        self.data = copy.deepcopy(SCENARIOS['covered'])

    def assertIssue(self, fragment):
        self.assertTrue(any(fragment in e for e in validator.validate(self.data)),
                        validator.validate(self.data))

    def test_covered_claims(self):
        self.assertEqual(validator.validate(self.data), [])

    def test_missing_fixture(self):
        self.data = SCENARIOS['missing-coverage']
        self.assertIssue('missing test coverage')

    def test_stale_failed_fixture(self):
        self.data = SCENARIOS['stale-and-failed']
        self.assertIssue('stale evidence')
        self.assertIssue('fail test')

    def test_duplicate_requirement(self):
        self.data['requirements'].append(self.data['requirements'][0])
        self.assertIssue('duplicate requirements id')

    def test_duplicate_test(self):
        self.data['tests'].append(self.data['tests'][0])
        self.assertIssue('duplicate tests id')

    def test_duplicate_link(self):
        self.data['links'].append(self.data['links'][0])
        self.assertIssue('duplicate link')

    def test_unknown_requirement(self):
        self.data['links'][0]['requirement_id'] = 'REQ-UNKNOWN'
        self.assertIssue('unknown requirement')

    def test_unknown_test_does_not_cover(self):
        self.data['links'][0]['test_id'] = 'TEST-UNKNOWN'
        self.assertIssue('unknown test')
        self.assertIssue('missing test coverage')

    def test_failed_extra_link_cannot_hide_behind_pass(self):
        self.data['links'].append(dict(self.data['links'][0], test_id='TEST-DUP', outcome='fail'))
        self.assertIssue('fail test')

    def test_unverified(self):
        self.data['links'][0]['outcome'] = 'unverified'
        self.assertIssue('unverified test')

    def test_test_revision_stale(self):
        self.data['tests'][0]['revision'] = 2
        self.assertIssue('stale evidence (test_revision)')

    def test_missing_evidence_revision(self):
        del self.data['links'][0]['requirement_revision']
        self.assertIssue('stale evidence')

    def test_boolean_revision_rejected(self):
        self.data['requirements'][0]['revision'] = True
        self.data['links'][0]['test_revision'] = True
        self.assertIssue('positive integer')
        self.assertIssue('stale evidence')

    def test_empty_requirements(self):
        self.data['requirements'] = []
        self.assertIssue('requirements must not be empty')

    def test_invalid_ids_and_text(self):
        self.data['requirements'][0]['id'] = ' padded '
        self.data['tests'][0]['text'] = ''
        self.assertIssue('trimmed string')
        self.assertIssue('text must be nonempty')

    def test_malformed_types_never_crash(self):
        samples = [None, [], 3, 'text']
        for value in samples:
            with self.subTest(value=value):
                self.assertTrue(validator.validate(value))
        for key in ['requirements', 'tests', 'links', 'provenance', 'schema_version']:
            for value in [None, {}, True, 'invalid']:
                d = copy.deepcopy(self.data)
                d[key] = value
                with self.subTest(key=key, value=value):
                    self.assertTrue(validator.validate(d))

    def test_nested_invalid_values(self):
        for collection in ['requirements', 'tests', 'links']:
            for value in [None, [], 3, {'id': []}, {'requirement_id': [], 'test_id': {}}]:
                d = copy.deepcopy(self.data)
                d[collection].append(value)
                with self.subTest(collection=collection, value=value):
                    self.assertTrue(validator.validate(d))
        for value in [[], {}, None, 'PASS']:
            self.data['links'][0]['outcome'] = value
            self.assertIssue('invalid outcome')

    def test_schema_float_rejected(self):
        self.data['schema_version'] = 1.0
        self.assertIssue('schema_version')

    def test_manual_claim_allowed(self):
        self.data['provenance'] = 'manual'
        self.assertEqual(validator.validate(self.data), [])

    def test_round_trip_unicode(self):
        with tempfile.TemporaryDirectory(dir=ROOT) as folder:
            path = Path(folder) / 'receipt.json'
            path.write_text(json.dumps(self.data, ensure_ascii=False), encoding='utf-8')
            self.assertEqual(validator.read_json(path), self.data)

    def test_strict_json_reader(self):
        with tempfile.TemporaryDirectory(dir=ROOT) as folder:
            path = Path(folder) / 'bad.json'
            for raw in [b'{', b'{"id":1,"id":2}', b'{"v":NaN}', b'\xff', b' ' * (validator.MAX_BYTES + 1)]:
                path.write_bytes(raw)
                with self.subTest(raw=raw[:30]), self.assertRaises(ValueError):
                    validator.read_json(path)

    def test_cli_exit_codes(self):
        with contextlib.redirect_stdout(io.StringIO()), contextlib.redirect_stderr(io.StringIO()):
            for name, code in [('covered', 0), ('missing-coverage', 1), ('stale-and-failed', 1), ('absent', 2)]:
                with self.subTest(name=name):
                    self.assertEqual(validator.main([str(ROOT / 'fixtures.json'), '--scenario', name]), code)
            self.assertEqual(validator.main([str(ROOT / 'no-such-receipt.json')]), 2)

    def test_cli_malformed_file(self):
        with tempfile.TemporaryDirectory(dir=ROOT) as folder:
            path = Path(folder) / 'bad.json'
            path.write_text('{', encoding='utf-8')
            with contextlib.redirect_stderr(io.StringIO()):
                self.assertEqual(validator.main([str(path)]), 2)


if __name__ == '__main__':
    unittest.main()

"""Deterministic integration tests. Git setup commands are test-owned constants."""
import hashlib
import json
import io
from contextlib import redirect_stdout
import os
from pathlib import Path
import subprocess
import tempfile
import unittest
from unittest.mock import patch
import receipt

class ReceiptTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix='.receipt-test-', dir=Path(__file__).parent)
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name).absolute()
        self.env = {k: v for k, v in os.environ.items() if not k.startswith('GIT_')}
        self.env.update(GIT_CONFIG_NOSYSTEM='1', GIT_CONFIG_GLOBAL=str(self.root / 'no-global'),
                        GIT_AUTHOR_NAME='Demo', GIT_AUTHOR_EMAIL='demo@example.invalid',
                        GIT_COMMITTER_NAME='Demo', GIT_COMMITTER_EMAIL='demo@example.invalid',
                        GIT_AUTHOR_DATE='2020-01-01T00:00:00+00:00',
                        GIT_COMMITTER_DATE='2020-01-01T00:00:00+00:00')
        self.git('init', '-q', '--template=')
        (self.root / 'app.txt').write_text('before\n')
        self.git('add', 'app.txt')
        self.git('-c', 'core.hooksPath=/dev/null', 'commit', '-qm', 'initial')
        (self.root / 'app.txt').write_text('after\n')
        (self.root / 'test.log').write_text('one check passed\n')
        self.spec = {'expected_files': ['app.txt'], 'requirements': [
            {'id': 'R1', 'description': 'Change / Thay đổi', 'files': ['app.txt'], 'evidence': ['T1']}],
            'evidence': [{'id': 'T1', 'path': 'test.log',
                          'sha256': hashlib.sha256(b'one check passed\n').hexdigest(),
                          'outcome': 'passed', 'provenance': 'observed'}]}

    def git(self, *args):
        return subprocess.run(['git', *args], cwd=self.root, env=self.env,
                              capture_output=True, check=True, timeout=3)

    def build(self):
        return receipt.build(self.root, self.spec)

    def test_pass_and_hash(self):
        result = self.build()
        self.assertEqual(result['status'], 'PASS')
        self.assertEqual(result['files'][0]['sha256'], hashlib.sha256(b'after\n').hexdigest())
        self.assertTrue(result['requirements'][0]['satisfied'])

    def test_no_repository_mutation(self):
        def snapshot():
            return {str(p.relative_to(self.root)): p.read_bytes()
                    for p in self.root.rglob('*') if p.is_file()}
        before = snapshot()
        self.build()
        self.assertEqual(before, snapshot())

    def test_unexpected_change(self):
        (self.root / 'extra.txt').write_text('extra')
        result = self.build()
        self.assertEqual(result['unexpected_changes'], ['extra.txt'])
        self.assertEqual(result['status'], 'FAIL')

    def test_missing_file(self):
        (self.root / 'app.txt').unlink()
        self.assertIsNone(self.build()['files'][0]['sha256'])
        self.assertEqual(self.build()['status'], 'FAIL')

    def test_unchanged_file(self):
        (self.root / 'app.txt').write_text('before\n')
        self.assertFalse(self.build()['requirements'][0]['satisfied'])

    def test_missing_evidence(self):
        (self.root / 'test.log').unlink()
        self.assertIn('missing artifact', self.build()['evidence'][0]['issues'])

    def test_tampered_evidence(self):
        (self.root / 'test.log').write_text('changed')
        self.assertIn('hash mismatch', self.build()['evidence'][0]['issues'])

    def test_failed_evidence(self):
        self.spec['evidence'][0]['outcome'] = 'failed'
        self.assertEqual(self.build()['status'], 'FAIL')

    def test_simulated_evidence(self):
        self.spec['evidence'][0]['provenance'] = 'simulated'
        self.assertFalse(self.build()['evidence'][0]['accepted'])

    def test_path_escapes(self):
        for value in ('../escape', '/absolute', 'a/../b', '.git/config', 'a\\b', './app.txt', 'a//b'):
            with self.subTest(value=value), self.assertRaises(receipt.ReceiptError):
                receipt.relative_path(value)

    def test_symlink_file(self):
        (self.root / 'link').symlink_to('app.txt')
        with self.assertRaises(receipt.ReceiptError):
            self.build()

    def test_symlink_root(self):
        link = self.root / 'alias'
        link.symlink_to(self.root, target_is_directory=True)
        with self.assertRaises(receipt.ReceiptError):
            receipt.check_repository(link)

    def test_symlink_spec(self):
        link = self.root / 'spec.json'
        link.symlink_to('app.txt')
        with self.assertRaises(receipt.ReceiptError):
            receipt.read_json(link)

    def test_git_timeout(self):
        with patch('receipt.subprocess.run', side_effect=subprocess.TimeoutExpired('git', 3)):
            with self.assertRaises(subprocess.TimeoutExpired):
                self.build()

    def test_git_failure(self):
        with patch('receipt.subprocess.run', return_value=subprocess.CompletedProcess([], 7, b'', b'')):
            with self.assertRaises(receipt.ReceiptError):
                self.build()

    def test_exact_command_and_timeout(self):
        with patch('receipt.subprocess.run', return_value=subprocess.CompletedProcess([], 0, b' M app.txt\0?? test.log\0', b'')) as run:
            self.build()
        args, kwargs = run.call_args
        self.assertEqual(tuple(args[0][1:]), receipt.GIT_ARGS)
        self.assertEqual(kwargs['timeout'], 3)
        self.assertNotIn('shell', kwargs)

    def test_command_field_rejected(self):
        self.spec['command'] = 'do not execute'
        with self.assertRaises(receipt.ReceiptError):
            self.build()

    def test_unknown_evidence_rejected(self):
        self.spec['requirements'][0]['evidence'] = ['missing']
        with self.assertRaises(receipt.ReceiptError):
            self.build()

    def test_empty_evidence_rejected(self):
        self.spec['requirements'][0]['evidence'] = []
        with self.assertRaises(receipt.ReceiptError):
            self.build()

    def test_rename_and_spaces(self):
        self.git('mv', 'app.txt', 'renamed file.txt')
        self.spec['expected_files'].append('renamed file.txt')
        self.spec['requirements'][0]['files'].append('renamed file.txt')
        result = self.build()
        self.assertEqual(result['unexpected_changes'], [])
        self.assertEqual({f['path'] for f in result['files'] if f['changed']}, {'app.txt', 'renamed file.txt'})
        self.assertEqual(result['status'], 'FAIL')  # deleted source cannot be hashed

    def test_external_git_include_rejected(self):
        with (self.root / '.git/config').open('a') as f:
            f.write('\n[include]\n path = ../outside\n')
        with self.assertRaises(receipt.ReceiptError):
            self.build()

    def test_external_metadata_rejected(self):
        (self.root / '.git/commondir').write_text('../elsewhere')
        with self.assertRaises(receipt.ReceiptError):
            self.build()

    def test_git_filter_rejected(self):
        with (self.root / '.git/config').open('a') as f:
            f.write('\n[filter "demo"]\n clean = forbidden-command\n')
        with self.assertRaises(receipt.ReceiptError):
            self.build()

    def test_cli_exit_codes_and_json(self):
        # Keep spec in ignored metadata so the spec itself is not an unexpected change.
        path = self.root / '.git/spec.json'
        for provenance, expected in (('observed', 0), ('simulated', 1)):
            self.spec['evidence'][0]['provenance'] = provenance
            path.write_text(json.dumps(self.spec))
            output = io.StringIO()
            with redirect_stdout(output):
                code = receipt.main(['--root', str(self.root), '--spec', str(path)])
            self.assertEqual(code, expected)
            self.assertEqual(json.loads(output.getvalue())['status'], 'PASS' if expected == 0 else 'FAIL')
        path.write_text('{broken')
        output = io.StringIO()
        with redirect_stdout(output):
            code = receipt.main(['--root', str(self.root), '--spec', str(path)])
        self.assertEqual(code, 2)
        self.assertEqual(json.loads(output.getvalue())['status'], 'ERROR')

    def test_non_repo(self):
        with self.assertRaises(receipt.ReceiptError):
            receipt.check_repository(self.root / 'missing')

    def test_fixture_consistency(self):
        fixture = receipt.read_json(Path(__file__).parent / 'fixtures.json')
        receipt.validate_spec(fixture)
        demo = fixture['demo_receipt']
        self.assertEqual(demo['provenance'], 'synthetic')
        self.assertEqual(demo['status'], 'FAIL')
        self.assertTrue(all(e['provenance'] == 'simulated' for e in demo['evidence']))

    def test_viewer_bundles_sample_matching_fixture(self):
        # Regression (UX audit U1/N107): viewer must offer an offline sample identical to fixtures.json.
        import re
        page = (Path(__file__).parent / 'viewer.html').read_text(encoding='utf-8')
        self.assertIn('id="sample" type="button"', page)
        self.assertIn('Load sample receipt / Tải biên nhận mẫu', page)
        self.assertIn('id="file" type="file"', page)
        match = re.search(r'<script type="application/json" id="sample-receipt">(.*?)</script>', page, re.S)
        self.assertIsNotNone(match)
        bundled = json.loads(match.group(1).replace('<\\/', '</'))
        fixture = receipt.read_json(Path(__file__).parent / 'fixtures.json')
        self.assertEqual(bundled, fixture['demo_receipt'])

if __name__ == '__main__':
    unittest.main()

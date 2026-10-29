"""Deterministic synthetic tests. No network; temporary files stay in this folder."""
import json
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest

import assembler as app

ROOT = Path(__file__).resolve().parent
VECTORS = [
    ('safe', 'A simple error / Lỗi đơn giản', 'A simple error / Lỗi đơn giản'),
    ('newlines', 'a\r\nb\rc\n', 'a\nb\nc\n'),
    ('unicode', 'Lỗi 🧪 /home/người-dùng/ứng-dụng.py', 'Lỗi 🧪 [HOME_PATH_REDACTED]'),
    ('emails', 'builder@example.invalid and qa@example.invalid', '[EMAIL_REDACTED] and [EMAIL_REDACTED]'),
    ('bearer', 'Authorization: bEaReR SYNTHETIC_ONLY', 'Authorization: [BEARER_REDACTED]'),
    ('assignment', 'api_key="SYNTHETIC_ONLY" access-token=NOT_REAL_TOKEN', '[API_KEY_REDACTED] [API_KEY_REDACTED]'),
    ('prefix', 'sk-SYNTHETIC_ONLY_NOT_VALID_0000 ghp_SYNTHETIC_ONLY_NOT_VALID_0000', '[API_KEY_REDACTED] [API_KEY_REDACTED]'),
    ('aws_prefix', 'AKIA' + 'X' * 16, '[API_KEY_REDACTED]'),
    ('unix_paths', '/Users/demo-user/a.py /home/demo-user/a.py /root/a.py', '[HOME_PATH_REDACTED] [HOME_PATH_REDACTED] [HOME_PATH_REDACTED]'),
    ('windows_paths', 'C:\\Users\\demo-user\\app.py D:/Users/demo-user/app.py', '[HOME_PATH_REDACTED] [HOME_PATH_REDACTED]'),
    ('windows_spaces', 'C:\\Documents and Settings\\demo-user\\app.py', '[HOME_PATH_REDACTED]'),
    ('ipv4', '192.0.2.23:8000 203.0.113.5', '[IP_REDACTED]:8000 [IP_REDACTED]'),
    ('ipv4_sentence', 'Peer 192.0.2.23. Version 1.2.3.4.5', 'Peer [IP_REDACTED]. Version 1.2.3.4.5'),
    ('ipv6', '[2001:db8::23]:8000 ::1 fe80::1%fixture0', '[[IP_REDACTED]]:8000 [IP_REDACTED] [IP_REDACTED]'),
    ('ipv6_full', '2001:db8:0:0:0:0:0:23', '[IP_REDACTED]'),
    ('mapped', '::ffff:192.0.2.23', '[IP_REDACTED]'),
    ('invalid_ip', '999.0.0.1 192.000.2.23 2001:::23', '999.0.0.1 192.000.2.23 2001:::23'),
    ('controls', 'a\x00b\x1bc\u202ed\u2066e\t\nf', 'abcde\t\nf'),
    ('obfuscated_controls', 'qa@\x00example.invalid sk-SYNTHETIC_\u202eONLY_NOT_VALID_0000', '[EMAIL_REDACTED] [API_KEY_REDACTED]'),
    ('unicode_boundary', 'éBearer SYNTHETIC_ONLY ésk-SYNTHETIC_ONLY_NOT_VALID_0000', 'é[BEARER_REDACTED] é[API_KEY_REDACTED]'),
    ('multiple', 'qa@example.invalid\nBearer SYNTHETIC\n/home/demo-user/a\n192.0.2.23', '[EMAIL_REDACTED]\n[BEARER_REDACTED]\n[HOME_PATH_REDACTED]\n[IP_REDACTED]'),
    # password= is now a redacted key (audit S3); the other two remain intentional non-matches.
    ('limits', 'password=hunter-demo relative/file.py người@ví-dụ.invalid', '[SECRET_REDACTED] relative/file.py người@ví-dụ.invalid'),
    # S3 regressions (audit 2026-10-29, poc_bugkit_regex.py). All values are synthetic.
    ('json_api_key', '{"api_key": "abcd1234efgh5678"}', '{[SECRET_REDACTED]}'),
    ('json_keys', '{"token": "t0k3n-SYNTH", "secret":"s3", \'password\': \'hunter2\', "Authorization": "Token SYNTH1234"}',
     '{[SECRET_REDACTED], [SECRET_REDACTED], [SECRET_REDACTED], [SECRET_REDACTED]}'),
    ('json_bearer_once', '{"Authorization": "Bearer SYNTHETIC_ONLY"}', '{"Authorization": "[BEARER_REDACTED]"}'),
    ('password_assign', 'password=Hunter2Hunter2 db_passwd: S3cret!value', '[SECRET_REDACTED] db_[SECRET_REDACTED]'),
    ('token_word', 'token: 9f8e7d6c5b4a39281706', '[SECRET_REDACTED]'),
    ('basic_auth', 'Authorization: Basic dXNlcjpwYXNzd29yZA==', 'Authorization: [BASIC_AUTH_REDACTED]'),
    ('url_creds', 'https://admin:S3cretPass@db.example.com/x', 'https://[URL_CREDENTIALS_REDACTED]@db.example.com/x'),
    ('jwt', 'jwt eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIn0.abcDEF123 end', 'jwt [JWT_REDACTED] end'),
    ('zero_width', 'sk-\u200bAbCdEfGhIjKlMnOpQrSt api\u200c_key=\ufeffSYNTH_ONLY_1234 q\u2060a@example.invalid',
     '[API_KEY_REDACTED] [API_KEY_REDACTED] [EMAIL_REDACTED]'),
    # Ordinary prose must not be over-redacted.
    ('no_over_redaction', 'Basic usage: run it. Basic configuration guide. token: required. Password: optional. '
     'max_tokens=4096 secret sauce https://example.com/a@b user@ mailto:x eyJ alone a.b.c',
     'Basic usage: run it. Basic configuration guide. token: required. Password: optional. '
     'max_tokens=4096 secret sauce https://example.com/a@b user@ mailto:x eyJ alone a.b.c'),
    ('markdown', '```\n# forged\n</script><img src=x onerror=alert(1)>', '```\n# forged\n</script><img src=x onerror=alert(1)>'),
]


def data(trace='SyntheticError / Lỗi giả lập'):
    return {'title': 'Demo / Ví dụ', 'trace': trace, 'steps': '1. Open / Mở\n2. Observe / Quan sát'}


class RedactionTests(unittest.TestCase):
    def test_multiple_counts(self):
        report, _, safe = app.assemble(data('qa@example.invalid qa@example.invalid Bearer SYNTHETIC'))
        self.assertEqual(safe['redactions'], {'bearer': 1, 'email': 2})
        self.assertNotIn('qa@example.invalid', report)

    def test_safe_input_still_warns(self):
        report, _, safe = app.assemble(data())
        self.assertEqual(safe['redactions'], {})
        self.assertIn(app.WARNING, report)

    def test_markdown_fences_cannot_close(self):
        injection = '```\n# Fake\n`````\n<script>alert(1)</script>\n[click](https://example.invalid)'
        report, _, _ = app.assemble(data(injection))
        self.assertIn('``````text\n' + injection + '\n``````', report)
        self.assertIn('``````json\n', report)

    def test_title_is_fenced(self):
        report, _, _ = app.assemble({**data(), 'title': '# Fake\n<img src=x>'})
        self.assertIn('```text\n# Fake\n<img src=x>\n```', report)

    def test_digest_bound_to_raw_input(self):
        a = app.assemble(data('Bearer SYNTHETIC_ONE'))
        b = app.assemble(data('Bearer SYNTHETIC_TWO'))
        self.assertEqual(a[0], b[0])
        self.assertNotEqual(a[1], b[1])
        self.assertEqual(a[1], app.assemble(data('Bearer SYNTHETIC_ONE'))[1])

    def test_rejects_missing_and_unknown_fields(self):
        for invalid in ({}, {**data(), 'extra': 'no'}, []):
            with self.subTest(invalid=invalid), self.assertRaises(ValueError):
                app.assemble(invalid)

    def test_rejects_types_and_blank(self):
        for value in (None, 42, [], ' \n'):
            with self.subTest(value=value), self.assertRaises(ValueError):
                app.assemble({**data(), 'trace': value})

    def test_size_limit(self):
        with self.assertRaises(ValueError):
            app.assemble(data('x' * 200001))

    def test_fixture_is_scrubbed_and_synthetic(self):
        fixture = json.loads((ROOT / 'fixtures.json').read_text())
        report, _, safe = app.assemble(fixture)
        self.assertIn('SYNTHETIC DEMO', report)
        for marker in ('builder@example.invalid', 'SYNTHETIC_TOKEN_NOT_VALID', '192.0.2.23', '/home/demo-user'):
            self.assertNotIn(marker, report)
        self.assertEqual(sum(safe['redactions'].values()), 8)

    def test_long_backtick_run(self):
        self.assertTrue(app.fence('`' * 500).startswith('`' * 501 + 'text\n'))


class CLITests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix='test-local-', dir=ROOT)
        self.addCleanup(self.temp.cleanup)
        self.input = Path(self.temp.name) / 'input.json'
        self.output = Path(self.temp.name) / 'report.md'
        self.input.write_text(json.dumps(data()), encoding='utf-8')

    def run_cli(self, *args):
        return subprocess.run([sys.executable, str(ROOT / 'assembler.py'), str(self.input), *map(str, args)],
                              capture_output=True, text=True, cwd=ROOT)

    def test_preview_does_not_export(self):
        result = self.run_cli()
        self.assertEqual(result.returncode, 0)
        self.assertIn('Approval SHA-256:', result.stderr)
        self.assertIn('# Sanitized bug report', result.stdout)
        self.assertFalse(self.output.exists())

    def test_export_requires_review(self):
        for approval in ([], ['--approve', 'wrong']):
            result = self.run_cli('--output', self.output, *approval)
            self.assertEqual(result.returncode, 2)
            self.assertFalse(self.output.exists())

    def test_export_matches_preview(self):
        preview = self.run_cli()
        digest = preview.stderr.strip().split()[-1]
        result = self.run_cli('--output', self.output, '--approve', digest)
        self.assertEqual(result.returncode, 0)
        self.assertEqual(self.output.read_text(), preview.stdout[:-1])

    def test_stale_approval_rejected(self):
        digest = self.run_cli().stderr.strip().split()[-1]
        self.input.write_text(json.dumps(data('Changed / Đã sửa')))
        self.assertEqual(self.run_cli('--output', self.output, '--approve', digest).returncode, 2)
        self.assertFalse(self.output.exists())

    def test_refuses_overwrite(self):
        digest = self.run_cli().stderr.strip().split()[-1]
        self.output.write_text('keep')
        self.assertEqual(self.run_cli('--output', self.output, '--approve', digest).returncode, 2)
        self.assertEqual(self.output.read_text(), 'keep')

    def test_invalid_json_does_not_echo_input(self):
        self.input.write_text('PRIVATE_SYNTHETIC_MARKER invalid json')
        result = self.run_cli()
        self.assertEqual(result.returncode, 2)
        self.assertNotIn('PRIVATE_SYNTHETIC_MARKER', result.stderr + result.stdout)

    def test_invalid_utf8(self):
        self.input.write_bytes(b'\xff')
        self.assertEqual(self.run_cli().returncode, 2)

    def test_approval_without_output_rejected(self):
        self.assertEqual(self.run_cli('--approve', 'anything').returncode, 2)


class WebSourceTests(unittest.TestCase):
    def test_network_blocked_and_text_sink(self):
        html = (ROOT / 'index.html').read_text()
        self.assertIn("connect-src 'none'", html)
        self.assertIn("default-src 'none'", html)
        self.assertNotIn('innerHTML', html)
        self.assertNotIn('fetch(', html)
        self.assertNotIn('localStorage', html)
        self.assertIn('aria-live="polite"', html)

    @unittest.skipUnless(shutil.which('node'), 'Optional Node runtime unavailable; browser logic not executed')
    def test_web_runtime_vectors_and_review_gate(self):
        html = (ROOT / 'index.html').read_text()
        script = html.split('<script>')[1].split('</script>')[0]
        # Minimal DOM harness, not a real browser or visual/accessibility audit.
        harness = r'''
const assert=require('node:assert/strict');
const elements={};let downloads=0;
global.document={getElementById(id){return elements[id]??=( {value:'',checked:false,disabled:true,textContent:'',handlers:{},addEventListener(e,fn){this.handlers[e]=fn;},focus(){}} );},createElement(){return {click(){downloads++;}};}};
'''
        checks = '\nconst vectors=' + json.dumps(VECTORS) + ';\n' + r'''
for(const [name,raw,expected]of vectors)assert.equal(sanitize(raw).text,expected,name);
$('sample').handlers.click();assert.equal(currentReport,null);
$('download').handlers.click();assert.equal(downloads,0);
$('preview').handlers.click();assert.ok(currentReport);assert.equal($('review').disabled,false);
assert.equal($('download').disabled,true);$('download').handlers.click();assert.equal(downloads,0);
$('review').checked=true;$('review').handlers.change();assert.equal($('download').disabled,false);
$('download').handlers.click();assert.equal(downloads,1);
$('trace').value+='changed';$('trace').handlers.input();assert.equal(currentReport,null);assert.equal($('review').checked,false);assert.equal($('download').disabled,true);
$('download').handlers.click();assert.equal(downloads,1);
$('trace').value='';$('preview').handlers.click();assert.equal(currentReport,null);assert.equal($('review').disabled,true);
assert.equal(fence('`'.repeat(500)).startsWith('`'.repeat(501)+'text\n'),true);
'''
        checks += '\nassert.deepEqual(assemble(' + json.dumps(json.loads((ROOT / 'fixtures.json').read_text())) + ').counts,' + json.dumps(app.assemble(json.loads((ROOT / 'fixtures.json').read_text()))[2]['redactions']) + ');'
        checks += "\nassert.ok(fence('`a'.repeat(90000)).startsWith('```text'));"
        result = subprocess.run(['node', '-e', harness + script + checks], capture_output=True, text=True, cwd=ROOT)
        self.assertEqual(result.returncode, 0, result.stderr)


# Give each redaction case its own visible test result as well as the shared loop.
for name, raw, expected in VECTORS:
    def case(self, raw=raw, expected=expected):
        self.assertEqual(app.sanitize(raw)[0], expected)
    setattr(RedactionTests, 'test_redaction_' + name, case)

if __name__ == '__main__':
    unittest.main()

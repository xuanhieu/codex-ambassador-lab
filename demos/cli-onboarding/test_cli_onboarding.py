"""Offline tests for Codex workshop preflight; no network credentials or API calls."""
import contextlib
import io
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
from unittest import mock

sys.path.insert(0,str(Path(__file__).resolve().parent))
import cli_onboarding as app

class SafeVersions(unittest.TestCase):
    def test_expected_version_strings(self):
        for raw in ("git version 2.46.0", "v22.1.0", "codex-cli 0.163.0", "3.12.1"):
            with self.subTest(raw=raw):
                self.assertEqual(app.safe_version(raw),raw)
    def test_apple_git_version_prefix_is_safe(self):
        self.assertEqual(app.safe_version("git version 2.39.5 (Apple Git-154)"),"git version 2.39.5")

    def test_redacts_untrusted_command_output(self):
        for raw in ("secret_token=abc", "/Users/private/person", "person@example.com", "node v22; rm -rf /",
                    "git version 2.46.0\nusername=secret"):
            with self.subTest(raw=raw):
                output=app.safe_version(raw)
                self.assertNotIn("secret",output)
                self.assertNotIn("/Users/",output)
                self.assertNotIn("@",output)
        self.assertEqual(app.safe_version("gibberish"),"[version hidden: unrecognized output]")

class SyntheticDemo(unittest.TestCase):
    def test_ready_demo_all_ok(self):
        result=app.make_demo("ready")
        self.assertTrue(result["ready"])
        self.assertEqual(result["mode"],"synthetic-demo")
        self.assertTrue(all(v["status"]=="ok" for v in result["checks"].values()))
    def test_beginner_requires_codex(self):
        result=app.make_demo("new-student")
        self.assertFalse(result["ready"])
        self.assertEqual(result["checks"]["codex"]["status"],"missing")
        self.assertEqual(result["checks"]["repo"]["status"],"missing")
    def test_restricted_device_requires_node(self):
        result=app.make_demo("restricted-device")
        self.assertEqual(result["checks"]["node"]["status"],"missing")
    def test_unknown_demo_rejected(self):
        with self.assertRaises(ValueError):
            app.make_demo("nonexistent")
    def test_bilingual_output_no_secrets(self):
        r=app.make_demo("new-student")
        en=app.render(r,"en")
        vi=app.render(r,"vi")
        self.assertIn("SYNTHETIC",en)
        self.assertIn("DỮ LIỆU GIẢ LẬP",vi)
        self.assertIn("Codex",en)
        self.assertIn("Codex",vi)
        self.assertNotIn("/Users/",en+vi)
    def test_fixture_cli_json(self):
        stream=io.StringIO()
        with contextlib.redirect_stdout(stream):
            status=app.main(["--demo","ready","--json"])
        result=json.loads(stream.getvalue())
        self.assertEqual(status,0)
        self.assertTrue(result["ready"])
        self.assertEqual(result["mode"],"synthetic-demo")

class LocalChecks(unittest.TestCase):
    def test_missing_commands_never_probe(self):
        with tempfile.TemporaryDirectory() as tmp:
            probe=mock.Mock(side_effect=AssertionError("unexpected exec"))
            result=app.make_report(Path(tmp),which=lambda name:None,probe=probe)
            self.assertFalse(result["ready"])
            self.assertEqual(result["checks"]["codex"]["status"],"missing")
            probe.assert_not_called()
    def test_wrong_root_refuses_repo_status(self):
        bad=Path("/this/path/should/not/exist/for/onboarding-demo")
        probe=mock.Mock(return_value={"status":"ok","version":"v1.0.0","code":""})
        result=app.make_report(bad,which=lambda _: "/fake/bin",probe=probe)
        self.assertEqual(result["checks"]["repo"]["status"],"missing")
        self.assertFalse(result["ready"])
        self.assertNotIn(str(bad),json.dumps(result))
    def test_actual_repo_in_git_fixture(self):
        if not app.shutil.which("git"):
            self.skipTest("git not present")
        with tempfile.TemporaryDirectory() as tmp:
            work=Path(tmp)
            subprocess.run(["git","init","-q",str(work)],check=True,timeout=5)
            probe=lambda argv,cwd: {"status":"ok","version":"v1.0.0","code":""}
            result=app.make_report(work,which=lambda _: "/fake/bin",probe=probe)
            self.assertEqual(result["checks"]["repo"]["status"],"ok")
            self.assertTrue(result["ready"])
            self.assertNotIn(tmp,json.dumps(result))
    def test_probe_allowlist_no_shell_and_timeout(self):
        with mock.patch.object(app.subprocess,"run",side_effect=subprocess.TimeoutExpired("git",3)) as run:
            result=app.run_probe(["git","--version"],Path.cwd())
        self.assertEqual(result["status"],"timeout")
        self.assertFalse(run.call_args.kwargs.get("shell",False))
        self.assertEqual(run.call_args.kwargs["timeout"],3)
    def test_probe_nonzero_code_is_safe(self):
        p=subprocess.CompletedProcess(args=["git","--version"],returncode=123,stdout="user@example.com",stderr="SECRET")
        with mock.patch.object(app.subprocess,"run",return_value=p):
            result=app.run_probe(["git","--version"],Path.cwd())
        self.assertEqual(result["status"],"error")
        self.assertNotIn("@",json.dumps(result))
        self.assertNotIn("SECRET",json.dumps(result))
    def test_probe_unrecognized_version_hides_output(self):
        p=subprocess.CompletedProcess(args=["codex","--version"],returncode=0,stdout="token=secret",stderr="")
        with mock.patch.object(app.subprocess,"run",return_value=p):
            result=app.run_probe(["codex","--version"],Path.cwd())
        self.assertEqual(result["status"],"ok")
        self.assertEqual(result["version"],"[version hidden: unrecognized output]")
    def test_demo_exits_zero_when_unready(self):
        stream=io.StringIO()
        with contextlib.redirect_stdout(stream):
            status=app.main(["--demo","new-student","--json"])
        self.assertEqual(status,0)
        self.assertFalse(json.loads(stream.getvalue())["ready"])

if __name__=="__main__":
    unittest.main()

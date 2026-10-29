import copy
import json
from pathlib import Path
import re
import subprocess
import sys
import unittest

ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT))
import catalog as c

DOCS=json.loads((ROOT/'catalog.json').read_text())
LESSONS=json.loads((ROOT/'lessons.json').read_text())

class OfficialIndexTests(unittest.TestCase):
    def test_has_200_sources(self):
        self.assertGreaterEqual(len(DOCS['sources']),200)
    def test_has_unique_ids_and_urls(self):
        ids=[row['id'] for row in DOCS['sources']]
        urls=[row['url'] for row in DOCS['sources']]
        self.assertEqual(len(ids),len(set(ids)))
        self.assertEqual(len(urls),len(set(urls)))
    def test_all_official_hostnames(self):
        self.assertTrue(all(c.canonical_url(r['url'])==r['url'] for r in DOCS['sources']))
    def test_snapshotted_provenance(self):
        self.assertRegex(DOCS['snapshot'],r'^\d{4}-\d{2}-\d{2}$')
        self.assertEqual(DOCS['indexUrl'],c.INDEX_URL)
    def test_legacy_docs_are_tagged(self):
        self.assertTrue(any(d['legacy'] for d in DOCS['sources']))
        self.assertTrue(all(x['legacy'] for x in DOCS['sources'] if 'Legacy' in x['title']))
    def test_cli_is_catalogued(self):
        self.assertTrue(any(r['title']=='Codex CLI' for r in DOCS['sources']))
    def test_chatgpt_topics_present(self):
        self.assertTrue(any(r['product']=='ChatGPT' for r in DOCS['sources']))
    def test_five_tiers_present(self):
        self.assertTrue(set(c.TIERS)<=set(r['level'] for r in DOCS['sources']))
    def test_no_personal_secrets_in_catalog(self):
        text=(ROOT/'catalog.json').read_text().lower()
        # Synthetic fixture proves the pattern matches; no real address is stored here.
        email=re.compile(r'[a-z0-9._%+-]+@[a-z0-9-]+(?:\.[a-z0-9-]+)+')
        self.assertRegex('learner@example.com',email)
        self.assertIsNone(email.search(text))
        self.assertNotIn('sk-proj-',text)
    def test_build_deterministic(self):
        inp=(ROOT/'sources/official-index-2026-10-24.txt').read_text()
        self.assertEqual(c.build_catalog(inp,DOCS['snapshot']),DOCS)
    def test_reject_untrusted_domain(self):
        with self.assertRaises(ValueError):c.canonical_url('https://evil.example/llms.txt')
    def test_reject_http(self):
        with self.assertRaises(ValueError):c.canonical_url('http://learn.chatgpt.com/docs')
    def test_reject_embedded_credentials(self):
        with self.assertRaises(ValueError):c.canonical_url('https://u:p@learn.chatgpt.com/docs')
    def test_reject_nonstandard_port(self):
        with self.assertRaises(ValueError):c.canonical_url('https://learn.chatgpt.com:8443/docs')
    def test_reject_whitespace_and_backslash(self):
        for bad in ['https://learn.chatgpt.com/a b','https://learn.chatgpt.com/a\nb','https:\\\\learn.chatgpt.com/a']:
            with self.subTest(bad=bad),self.assertRaises(ValueError):c.canonical_url(bad)
    def test_semantic_query_preserved(self):
        one=c.canonical_url('https://learn.chatgpt.com/docs/developer-commands.md?surface=cli&utm_source=x')
        two=c.canonical_url('https://learn.chatgpt.com/docs/developer-commands.md?surface=ide')
        self.assertIn('?surface=cli',one)
        self.assertNotEqual(one,two)
        self.assertNotIn('utm_',one)
    def test_duplicate_link_merges_categories(self):
        inp='## First\n- [Foo](https://learn.chatgpt.com/docs/foo.md): intro\n## Second\n- [Bar](https://learn.chatgpt.com/docs/foo.md): intro\n'
        result=c.parse_index(inp)
        self.assertEqual(len(result),1)
        self.assertEqual(result[0]['categories'],['First','Second'])
        self.assertEqual(result[0]['aliases'],['Bar'])
    def test_markup_without_valid_url_is_ignored(self):
        self.assertEqual(c.parse_index('- [Bad](javascript:alert(1))\n'),[])
    def test_legacy_detection(self):
        self.assertTrue(c.is_legacy('Old API','This flow is deprecated','https://learn.chatgpt.com/docs/old.md'))
        self.assertFalse(c.is_legacy('Current guide','Normal task','https://learn.chatgpt.com/docs/new.md'))
    def test_external_redirect_refused(self):
        req=__import__('urllib.request',fromlist=['Request']).Request(c.INDEX_URL)
        with self.assertRaises(ValueError):
            c.SafeRedirect().redirect_request(req,None,302,'Moved',{},'https://malicious.example/')

class AcademyLessonTests(unittest.TestCase):
    def test_25_lessons_validated(self):
        c.validate_lessons(LESSONS,DOCS)
        self.assertEqual(len(LESSONS),25)
    def test_five_lessons_per_tier(self):
        for tier in c.TIERS:
            self.assertEqual(sum(r['level']==tier for r in LESSONS),5)
    def test_bilingual_quiz_answers_agree(self):
        for r in LESSONS:
            self.assertEqual(r['en']['quiz']['answer'],r['vi']['quiz']['answer'])
    def test_six_audiences_covered(self):
        roles=set(z for r in LESSONS for z in r['audience'])
        self.assertEqual(roles,set(c.AUDIENCES))
    def test_exercises_have_three_steps(self):
        self.assertTrue(all(len(r['en']['exercise'])==3 and len(r['vi']['exercise'])==3 for r in LESSONS))
    def test_duplicate_id_fails(self):
        data=copy.deepcopy(LESSONS)
        data[-1]['id']=data[0]['id']
        with self.assertRaises(AssertionError):c.validate_lessons(data,DOCS)
    def test_missing_source_fails(self):
        data=copy.deepcopy(LESSONS)
        data[0]['sources']=['https://learn.chatgpt.com/docs/not-in-index.md']
        with self.assertRaises(AssertionError):c.validate_lessons(data,DOCS)
    def test_invalid_answer_fails(self):
        data=copy.deepcopy(LESSONS)
        data[0]['en']['quiz']['answer']=99
        with self.assertRaises(AssertionError):c.validate_lessons(data,DOCS)
    def test_duplicate_option_fails(self):
        data=copy.deepcopy(LESSONS)
        data[0]['vi']['quiz']['options'][1]=data[0]['vi']['quiz']['options'][0]
        with self.assertRaises(AssertionError):c.validate_lessons(data,DOCS)
    def test_prerequisite_cycle_fails(self):
        data=copy.deepcopy(LESSONS)
        data[0]['prerequisites']=[data[1]['id']]
        with self.assertRaises(AssertionError):c.validate_lessons(data,DOCS)
    def test_negative_duration_fails(self):
        data=copy.deepcopy(LESSONS)
        data[0]['duration']=-1
        with self.assertRaises(AssertionError):c.validate_lessons(data,DOCS)
    def test_cli_check_passes_without_network(self):
        r=subprocess.run([sys.executable,str(ROOT/'catalog.py'),'--check'],cwd=ROOT,capture_output=True,text=True,timeout=8)
        self.assertEqual(r.returncode,0,r.stderr)
        self.assertIn('Checked 204',r.stdout)

if __name__=='__main__':
    unittest.main()

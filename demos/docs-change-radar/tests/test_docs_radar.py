import copy,hashlib,json,tempfile,unittest
from pathlib import Path
import sys
ROOT=Path(__file__).resolve().parents[1];sys.path.insert(0,str(ROOT))
import docs_radar as d
BEFORE=json.loads((ROOT/'fixtures/before.json').read_text())
AFTER=json.loads((ROOT/'fixtures/after.json').read_text())
class RadarTests(unittest.TestCase):
 def setUp(self):
  self.before=copy.deepcopy(BEFORE);self.after=copy.deepcopy(AFTER)
 def test_fixture_schema(self):self.assertEqual(self.before['schema'],'docs-radar-v1')
 def test_before_count(self):self.assertEqual(len(d.validate_snapshot(self.before)),14)
 def test_after_count(self):self.assertEqual(len(d.validate_snapshot(self.after)),14)
 def test_determinism(self):self.assertEqual(d.compare(self.before,self.after),d.compare(self.before,self.after))
 def test_changed_events(self):self.assertEqual(d.compare(self.before,self.after)['summary']['changed_events'],12)
 def test_affected_documents(self):self.assertEqual(d.compare(self.before,self.after)['summary']['affected_documents'],10)
 def test_critical_count(self):self.assertEqual(d.compare(self.before,self.after)['summary']['critical_events'],5)
 def test_removed_critical(self):
  report=d.compare(self.before,self.after)
  self.assertTrue(any(e['id']=='DOC012' and e['type']=='removed' and e['severity']=='critical' for e in report['events']))
 def test_added(self):self.assertEqual(len([e for e in d.compare(self.before,self.after)['events'] if e['type']=='added']),2)
 def test_rename(self):self.assertTrue(any(e['type']=='title' for e in d.compare(self.before,self.after)['events']))
 def test_moved_url(self):self.assertTrue(any(e['id']=='DOC004' and e['type']=='url' for e in d.compare(self.before,self.after)['events']))
 def test_changed_hash(self):self.assertTrue(any(e['type']=='content_sha256' for e in d.compare(self.before,self.after)['events']))
 def test_severity_sorted(self):
  scores=[e['risk'] for e in d.compare(self.before,self.after)['events']]
  self.assertEqual(scores,sorted(scores,reverse=True))
 def test_identical_no_events(self):self.assertEqual(d.compare(self.before,self.before)['summary']['changed_events'],0)
 def test_invalid_id_duplicate(self):
  self.after['documents'].append(copy.deepcopy(self.after['documents'][0]))
  with self.assertRaises(ValueError):d.validate_snapshot(self.after)
 def test_duplicate_url(self):
  self.after['documents'][1]['url']=self.after['documents'][0]['url']
  with self.assertRaises(ValueError):d.validate_snapshot(self.after)
 def test_non_https_url(self):
  self.after['documents'][0]['url']='http://example.org/insecure'
  with self.assertRaises(ValueError):d.validate_snapshot(self.after)
 def test_url_credentials_rejected(self):
  self.after['documents'][0]['url']='https://admin:secret@example.org/d'
  with self.assertRaises(ValueError):d.validate_snapshot(self.after)
 def test_unknown_section(self):
  self.after['documents'][0]['section']='Hacking'
  with self.assertRaises(ValueError):d.validate_snapshot(self.after)
 def test_invalid_sha(self):
  self.after['documents'][0]['content_sha256']='invalid'
  with self.assertRaises(ValueError):d.validate_snapshot(self.after)
 def test_invalid_boolean_flag(self):
  self.after['documents'][0]['critical']=1
  with self.assertRaises(ValueError):d.validate_snapshot(self.after)
 def test_invalid_date(self):
  self.after['documents'][0]['updated']='today'
  with self.assertRaises(ValueError):d.validate_snapshot(self.after)
 def test_unknown_field_rejected(self):
  self.after['documents'][0]['private_token']='none'
  with self.assertRaises(ValueError):d.validate_snapshot(self.after)
 def test_missing_field_rejected(self):
  del self.after['documents'][0]['id']
  with self.assertRaises(ValueError):d.validate_snapshot(self.after)
 def test_label_overlong(self):
  self.after['label']='X'*121
  with self.assertRaises(ValueError):d.validate_snapshot(self.after)
 def test_snapshot_over_limit(self):
  self.after['documents']*=40
  with self.assertRaises(ValueError):d.validate_snapshot(self.after)
 def test_report_matches_fixture(self):
  expected=json.loads((ROOT/'fixtures/sample-report.json').read_text())
  self.assertEqual(d.compare(self.before,self.after),expected)
if __name__=='__main__':unittest.main()

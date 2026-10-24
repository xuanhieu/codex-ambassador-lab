import copy,json,sys,unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'src'))
import policy
DATA=json.loads((ROOT/'fixtures/scenarios.json').read_text())
class PolicyTests(unittest.TestCase):
 def test_twelve_synthetic_cases(self):self.assertEqual(len(DATA['scenarios']),12)
 def test_six_categories(self):self.assertEqual(len(DATA['matrix']),6)
 def test_all_bilingual(self):
  for row in DATA['scenarios']:
   for field in ('title','description'):self.assertTrue(row[field]['en'] and row[field]['vi'])
 def test_all_cases_have_boolean_flags(self):
  for row in DATA['scenarios']:
   for flag in ('outside_scope','raw_secret','untrusted_instruction'):self.assertIs(type(row[flag]),bool)
 def test_expected_verdicts(self):
  expected={'A01':'proceed','A02':'proceed','A03':'escalate','A04':'proceed','A05':'escalate',
            'A06':'block','A07':'escalate','A08':'block','A09':'escalate','A10':'proceed',
            'A11':'escalate','A12':'block'}
  for row in DATA['scenarios']:
   with self.subTest(row=row['id']):self.assertEqual(policy.evaluate(row,DATA)['verdict'],expected[row['id']])
 def test_unknown_category(self):
  row=dict(DATA['scenarios'][0],category='root-access')
  self.assertEqual(policy.evaluate(row,DATA)['verdict'],'block')
 def test_invalid_missing_flags(self):
  row=dict(DATA['scenarios'][0]);row.pop('outside_scope')
  self.assertEqual(policy.evaluate(row,DATA)['reason'],'invalid')
 def test_invalid_approvers(self):
  row=dict(DATA['scenarios'][0],approvals=['ghost'])
  self.assertEqual(policy.evaluate(row,DATA)['reason'],'invalid')
 def test_duplicate_receipts(self):
  row=dict(DATA['scenarios'][9],approvals=['security','release','release'])
  self.assertEqual(policy.evaluate(row,DATA)['reason'],'invalid')
 def test_scope_always_blocks(self):
  row=copy.deepcopy(DATA['scenarios'][9]);row['outside_scope']=True
  self.assertEqual(policy.evaluate(row,DATA)['reason'],'outside_scope')
 def test_secrets_always_block(self):
  row=copy.deepcopy(DATA['scenarios'][9]);row['raw_secret']=True
  self.assertEqual(policy.evaluate(row,DATA)['reason'],'raw_secret')
 def test_prompt_injection_always_blocks(self):
  row=copy.deepcopy(DATA['scenarios'][9]);row['untrusted_instruction']=True
  self.assertEqual(policy.evaluate(row,DATA)['reason'],'untrusted_instruction')
 def test_missing_approval_is_exact(self):
  out=policy.evaluate(DATA['scenarios'][4],DATA)
  self.assertEqual(out['missing'],['security'])
 def test_no_approval_for_read(self):
  self.assertEqual(policy.evaluate(DATA['scenarios'][0],DATA)['missing'],[])
 def test_grade_correct_passes(self):
  row=DATA['scenarios'][4]
  self.assertTrue(policy.grade(row,'escalate',['security'],DATA)['passed'])
 def test_grade_wrong_verdict_fails(self):
  row=DATA['scenarios'][4]
  self.assertFalse(policy.grade(row,'proceed',['security'],DATA)['passed'])
 def test_grade_extra_route_fails(self):
  row=DATA['scenarios'][4]
  self.assertFalse(policy.grade(row,'escalate',['security','operator'],DATA)['passed'])
 def test_grade_duplicate_route_fails(self):
  row=DATA['scenarios'][4]
  self.assertFalse(policy.grade(row,'escalate',['security','security'],DATA)['passed'])
 def test_grade_non_list_fails(self):
  row=DATA['scenarios'][4]
  self.assertFalse(policy.grade(row,'escalate','security',DATA)['passed'])
 def test_non_dict_fails_closed(self):
  self.assertEqual(policy.evaluate(None,DATA)['verdict'],'block')
 def test_approval_does_not_unlock_scope(self):
  row=dict(DATA['scenarios'][9],outside_scope=True)
  self.assertFalse(policy.grade(row,'proceed',[],DATA)['passed'])
 def test_input_fixtures_are_nonsecret(self):
  s=(ROOT/'fixtures/scenarios.json').read_text()
  for secret in ('sk-proj-','-----BEGIN PRIVATE KEY-----','github_pat_'):self.assertNotIn(secret,s)
if __name__=='__main__':unittest.main()

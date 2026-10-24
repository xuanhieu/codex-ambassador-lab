import copy,json,sys,unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT))
import recovery as r
class RecoveryTests(unittest.TestCase):
 def test_all_scenarios(self):self.assertEqual(len(r.SCENARIOS),6)
 def test_default_429_recovers(self):
  o=r.simulate([429,429,200]);self.assertTrue(o["success"]);self.assertEqual(o["requests"],3)
 def test_repeatable_jitter(self):self.assertEqual(r.simulate([429,429,200]),r.simulate([429,429,200]))
 def test_initial_200(self):
  o=r.simulate([200]);self.assertEqual((o["requests"],o["elapsed_ms"]), (1,0))
 def test_401_fail_fast(self):
  o=r.simulate([401,200]);self.assertFalse(o["success"]);self.assertEqual(o["requests"],1)
 def test_403_fail_fast(self):self.assertEqual(r.simulate([403,200])["requests"],1)
 def test_400_fail_fast(self):self.assertEqual(r.simulate([400,200])["stop_reason"],"terminal_http")
 def test_404_fail_fast(self):self.assertEqual(r.simulate([404,200])["requests"],1)
 def test_422_fail_fast(self):self.assertEqual(r.simulate([422,200])["requests"],1)
 def test_unexpected_418_no_retry(self):self.assertEqual(r.simulate([418,200])["requests"],1)
 def test_502_retry(self):self.assertTrue(r.simulate([502,200])["success"])
 def test_503_retry(self):self.assertTrue(r.simulate([503,200])["success"])
 def test_504_retry(self):self.assertTrue(r.simulate([504,200])["success"])
 def test_retry_after_honored(self):
  o=r.simulate([503,200],4000)
  self.assertEqual(o["events"][0]["delay_ms"],4000)
 def test_retry_after_beyond_cap_aborts(self):
  o=r.simulate([503,200],4000,r.policy(max_delay_ms=2000))
  self.assertEqual(o["stop_reason"],"retry_after_exceeds_cap")
  self.assertEqual(o["requests"],1)
 def test_budget_one(self):
  o=r.simulate([429,200],config=r.policy(budget=1))
  self.assertEqual(o["stop_reason"],"request_budget")
 def test_attempt_limit_one(self):
  o=r.simulate([429,200],config=r.policy(max_attempts=1))
  self.assertEqual(o["stop_reason"],"attempt_limit")
 def test_budget_less_than_attempt_limit(self):
  o=r.simulate([429]*8+[200],config=r.policy(budget=2,max_attempts=10))
  self.assertEqual((o["requests"],o["stop_reason"]),(2,"request_budget"))
 def test_attempt_less_than_budget(self):
  o=r.simulate([429]*8+[200],config=r.policy(budget=10,max_attempts=3))
  self.assertEqual((o["requests"],o["stop_reason"]),(3,"attempt_limit"))
 def test_long_sequence_rejected(self):
  with self.assertRaises(ValueError):r.simulate([429]*21)
 def test_invalid_http_rejected(self):
  for http in [0,99,600,"429",None,True]:
   with self.subTest(http=http):
    with self.assertRaises(ValueError):r.simulate([http])
 def test_policy_bad_types(self):
  with self.assertRaises(ValueError):r.policy(max_attempts=True)
 def test_policy_bounds(self):
  for kw in [{'max_attempts':0},{'budget':11},{'base_delay_ms':50},{'max_delay_ms':70000},{'seed':-1}]:
   with self.subTest(kw=kw):
    with self.assertRaises(ValueError):r.policy(**kw)
 def test_no_negative_wait(self):
  o=r.simulate([429,429,429,200])
  self.assertTrue(all(e["delay_ms"]>=0 and e["at_ms"]>=0 for e in o["events"]))
 def test_clock_matches_retries(self):
  o=r.simulate([429,429,200])
  self.assertEqual(o["elapsed_ms"],sum(e["delay_ms"] for e in o["events"]))
 def test_exponential_doubling_without_jitter_override(self):
  o=r.simulate([429,429,429,200],config=r.policy(base_delay_ms=1000))
  delays=[e["delay_ms"] for e in o["events"] if e["retry"]]
  self.assertTrue(delays[1]>delays[0]);self.assertTrue(delays[2]>delays[1])
 def test_output_fixture_matches(self):
  docs=json.loads((ROOT/'sample-results.json').read_text())
  for name,scenario in r.SCENARIOS.items():
   with self.subTest(name=name):
    self.assertEqual(r.simulate(scenario['statuses'],scenario['retry_after_ms']),docs[name])
 def test_output_schema(self):
  self.assertEqual(r.simulate([200])['schema'],'rate-limit-recovery-v1')
 def test_no_actual_sleep_needed(self):
  self.assertGreater(r.simulate([429,200])["elapsed_ms"],0)
if __name__=='__main__':unittest.main()

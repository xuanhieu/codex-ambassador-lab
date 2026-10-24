import copy,json,os,tempfile,unittest
from pathlib import Path
import sys
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
import evidence_chain as e
class EvidenceTests(unittest.TestCase):
 def setUp(self):
  self.temp=tempfile.TemporaryDirectory()
  self.root=Path(self.temp.name)
  (self.root/'a.txt').write_text('alpha',encoding='utf-8')
  (self.root/'b.txt').write_bytes(b'beta\x00test')
  (self.root/'sub').mkdir()
  (self.root/'sub/c.txt').write_text('Unicode tiếng Việt',encoding='utf-8')
  self.names=['a.txt','b.txt','sub/c.txt']
  self.chain=e.build_manifest(self.root,self.names)
 def tearDown(self):self.temp.cleanup()
 def test_sha_known(self):self.assertEqual(e.sha(b'abc'),'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad')
 def test_build_deterministic(self):self.assertEqual(self.chain,e.build_manifest(self.root,list(reversed(self.names))))
 def test_chain_root_sha(self):self.assertEqual(self.chain['root'],self.chain['chain'][-1]['digest'])
 def test_verify_valid(self):self.assertTrue(e.verify_manifest(self.chain,self.root)['ok'])
 def test_three_files(self):self.assertEqual(len(self.chain['files']),3)
 def test_chain_path_sort(self):self.assertEqual([i['path'] for i in self.chain['files']],self.names)
 def test_changed_file_detected(self):
  (self.root/'a.txt').write_text('changed')
  self.assertFalse(e.verify_manifest(self.chain,self.root)['ok'])
 def test_same_length_change_detected(self):
  (self.root/'a.txt').write_text('alphb')
  out=e.verify_manifest(self.chain,self.root)
  self.assertFalse(out['ok']);self.assertEqual(out['violations'][0]['path'],'a.txt')
 def test_missing_file_rejected(self):
  (self.root/'a.txt').unlink()
  with self.assertRaises(FileNotFoundError):e.verify_manifest(self.chain,self.root)
 def test_tampered_entry_metadata_detected(self):
  m=copy.deepcopy(self.chain);m['files'][0]['size']+=1
  with self.assertRaises(ValueError):e.validate_structure(m)
 def test_tampered_root_detected(self):
  m=copy.deepcopy(self.chain);m['root']='0'*64
  with self.assertRaises(ValueError):e.validate_structure(m)
 def test_tampered_digest_detected(self):
  m=copy.deepcopy(self.chain);m['chain'][1]['digest']='a'*64
  with self.assertRaises(ValueError):e.validate_structure(m)
 def test_duplicate_paths_build_rejected(self):
  with self.assertRaises(ValueError):e.build_manifest(self.root,['a.txt','a.txt'])
 def test_duplicate_paths_manifest_rejected(self):
  m=copy.deepcopy(self.chain);m['files'][1]['path']='a.txt'
  with self.assertRaises(ValueError):e.validate_structure(m)
 def test_traversal_rejected(self):
  for name in ['../etc/passwd','a/../../b','/etc/passwd','C:/root','a//b','a/./b',r'a\b']:
   with self.subTest(name=name):self.assertFalse(e.safe_relative(name))
 def test_symlink_final_rejected(self):
  (self.root/'link.txt').symlink_to(self.root/'a.txt')
  with self.assertRaises(ValueError):e.build_manifest(self.root,['link.txt'])
 def test_symlink_parent_rejected(self):
  (self.root/'alias').symlink_to(self.root/'sub',target_is_directory=True)
  with self.assertRaises(ValueError):e.build_manifest(self.root,['alias/c.txt'])
 def test_directory_instead_file_rejected(self):
  with self.assertRaises(ValueError):e.build_manifest(self.root,['sub'])
 def test_invalid_json_keys_rejected(self):
  m=copy.deepcopy(self.chain);m['admin']=True
  with self.assertRaises(ValueError):e.validate_structure(m)
 def test_boolean_size_rejected(self):
  m=copy.deepcopy(self.chain);m['files'][0]['size']=True
  with self.assertRaises(ValueError):e.validate_structure(m)
 def test_manifest_reordered_rejected(self):
  m=copy.deepcopy(self.chain);m['files'].reverse()
  with self.assertRaises(ValueError):e.validate_structure(m)
 def test_chain_empty(self):
  m=e.build_manifest(self.root,[])
  self.assertEqual(m['root'],'0'*64);self.assertTrue(e.verify_manifest(m,self.root)['ok'])
 def test_unicode_file(self):
  (self.root/'tên-tệp.txt').write_text('Xin chào')
  m=e.build_manifest(self.root,['tên-tệp.txt'])
  self.assertTrue(e.verify_manifest(m,self.root)['ok'])
 def test_one_file_size_limit(self):
  with self.assertRaises(ValueError):e.validate_structure({**self.chain,'files':[{**self.chain['files'][0],'size':e.MAX_FILE_SIZE+1}]})
 def test_fixture_valid(self):
  root=Path(__file__).resolve().parents[1]
  m=json.loads((root/'fixtures/sample-manifest.json').read_text())
  self.assertTrue(e.verify_manifest(m,root/'fixtures/data')['ok'])
if __name__=='__main__':unittest.main()

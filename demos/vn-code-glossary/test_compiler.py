"""Deterministic stdlib tests; temporary fixtures remain in the project folder."""
import copy
from html.parser import HTMLParser
import io
import json
import shutil
import subprocess
from pathlib import Path
import tempfile
import unittest
import unicodedata
from contextlib import redirect_stdout, redirect_stderr

import compiler

ROOT = Path(__file__).resolve().parent


class ScriptCollector(HTMLParser):
    def __init__(self):
        super().__init__()
        self.scripts = []
        self.current = None

    def handle_starttag(self, tag, attrs):
        if tag == 'script':
            self.current = []

    def handle_data(self, data):
        if self.current is not None:
            self.current.append(data)

    def handle_endtag(self, tag):
        if tag == 'script' and self.current is not None:
            self.scripts.append(''.join(self.current))
            self.current = None


class GlossaryTests(unittest.TestCase):
    def setUp(self):
        self.data = json.loads((ROOT / 'glossary.json').read_text(encoding='utf-8'))

    def reject(self, data):
        with self.assertRaises(ValueError):
            compiler.validate(data)

    def test_curated_24_unique_terms(self):
        result = compiler.validate(self.data)
        self.assertEqual(len(result['terms']), 24)
        self.assertEqual(len({t['id'] for t in result['terms']}), 24)
        self.assertEqual({t['category'] for t in result['terms']}, set(compiler.CATEGORIES))

    def test_bilingual_complete(self):
        for term in compiler.validate(self.data)['terms']:
            for field in ('name', 'meaning', 'misconception'):
                self.assertEqual(set(term[field]), {'en', 'vi'})
                self.assertTrue(all(term[field].values()))
            self.assertTrue(term['example'])

    def test_nfd_input_becomes_nfc_without_losing_accents(self):
        text = 'Quyền kiểm thử và ngữ cảnh'
        self.data['terms'][0]['meaning']['vi'] = unicodedata.normalize('NFD', text)
        self.assertEqual(compiler.validate(self.data)['terms'][0]['meaning']['vi'], text)

    def test_nfc_and_nfd_search_equivalent(self):
        text = 'Kiểm thử quyền ĐỐI SỐ'
        self.assertEqual(compiler.fold(text), 'kiem thu quyen doi so')
        self.assertEqual(compiler.fold(text), compiler.fold(unicodedata.normalize('NFD', text)))

    def test_nfc_source_preserved(self):
        result = compiler.validate(self.data)
        self.assertIn('Công cụ', result['terms'][0]['meaning']['vi'])

    def test_validation_does_not_mutate_input(self):
        before = copy.deepcopy(self.data)
        compiler.validate(self.data)
        self.assertEqual(before, self.data)

    def test_duplicate_ids(self):
        self.data['terms'].append(copy.deepcopy(self.data['terms'][0]))
        self.reject(self.data)

    def test_invalid_ids(self):
        for value in ('Git', ' git', 'git ', 'a--b', '-git', 'gít', 'a_b', '', 3, None):
            with self.subTest(value=value):
                self.data['terms'][0]['id'] = value
                self.reject(self.data)

    def test_unknown_category(self):
        for category in ('unknown', [], None):
            self.data['terms'][0]['category'] = category
            self.reject(self.data)

    def test_missing_term_field(self):
        del self.data['terms'][0]['example']
        self.reject(self.data)

    def test_extra_term_field(self):
        self.data['terms'][0]['secret'] = 'not allowed'
        self.reject(self.data)

    def test_language_pair_must_be_exact(self):
        for pair in ({'en': 'text'}, {'en': 'text', 'vi': 'chữ', 'fr': 'texte'}, [], None):
            self.data['terms'][0]['meaning'] = pair
            self.reject(self.data)

    def test_empty_or_nontext_values(self):
        for value in ('', ' \n\t', 1, None, [], {}):
            self.data['terms'][0]['meaning']['vi'] = value
            self.reject(self.data)

    def test_control_surrogate_and_length(self):
        for value in ('bad\x00text', 'bad\ud800text', 'x' * 4001):
            self.data['terms'][0]['example'] = value
            self.reject(self.data)

    def test_invalid_root(self):
        for value in (None, [], {}, {'schema_version': 1, 'terms': [], 'extra': 2}):
            self.reject(value)

    def test_version_is_integer_one(self):
        for version in (True, 1.0, 2, '1', None):
            self.data['schema_version'] = version
            self.reject(self.data)

    def test_invalid_terms_container(self):
        for value in ([], {}, None, 'git', [None]):
            self.data['terms'] = value
            self.reject(self.data)

    def test_workshop_addition_permitted(self):
        term = copy.deepcopy(self.data['terms'][0])
        term['id'] = 'practice-term'
        self.data['terms'].append(term)
        self.assertEqual(len(compiler.validate(self.data)['terms']), 25)

    def test_embedded_payload_round_trip_and_script_escape(self):
        self.data['terms'][0]['example'] = '</script><script>alert("test")</script>& <tag>'
        html = compiler.render(self.data)
        parser = ScriptCollector()
        parser.feed(html)
        self.assertEqual(len(parser.scripts), 2)
        self.assertEqual(json.loads(parser.scripts[0]), compiler.validate(self.data))
        self.assertNotIn('<script>alert', html)

    def test_deterministic_build(self):
        self.assertEqual(compiler.render(self.data), compiler.render(self.data))
        self.assertEqual((ROOT / 'index.html').read_text(encoding='utf-8'), compiler.render(self.data))

    def test_load_malformed_and_duplicate_json_keys(self):
        with tempfile.TemporaryDirectory(dir=ROOT) as folder:
            path = Path(folder) / 'invalid.json'
            for content in ('{', '{"schema_version":1,"schema_version":1,"terms":[]}'):
                path.write_text(content, encoding='utf-8')
                with self.assertRaises(ValueError):
                    compiler.load(path)

    def test_cli_validate_success(self):
        output = io.StringIO()
        with redirect_stdout(output):
            status = compiler.main(['validate', str(ROOT / 'glossary.json')])
        self.assertEqual(status, 0)
        self.assertIn('24', output.getvalue())

    def test_cli_compile(self):
        with tempfile.TemporaryDirectory(dir=ROOT) as folder:
            path = Path(folder) / 'compiled.html'
            with redirect_stdout(io.StringIO()):
                status = compiler.main(['compile', str(ROOT / 'glossary.json'), '--output', str(path)])
            self.assertEqual(status, 0)
            self.assertEqual(path.read_text(encoding='utf-8'), compiler.render(self.data))

    def test_cli_invalid_and_missing_input_fail(self):
        with tempfile.TemporaryDirectory(dir=ROOT) as folder:
            path = Path(folder) / 'invalid.json'
            path.write_text('{"schema_version":2,"terms":[]}', encoding='utf-8')
            for source in (path, Path(folder) / 'missing.json'):
                output = io.StringIO()
                with redirect_stderr(output):
                    status = compiler.main(['validate', str(source)])
                self.assertEqual(status, 1)
                self.assertIn('ERROR / LỖI', output.getvalue())

    @unittest.skipUnless(shutil.which('node'), 'optional local Node.js is unavailable')
    def test_actual_app_javascript_with_dom_harness(self):
        parser = ScriptCollector()
        parser.feed(compiler.render(self.data))
        harness = r"""
const assert = require('node:assert/strict');
class Element {
 constructor(tag='div'){this.tag=tag;this.children=[];this.value='';this.attrs={};this.handlers={};this.textContent='';}
 append(...children){this.children.push(...children);}
 replaceChildren(...children){this.children=children;if(this.tag==='select')this.value=children[0].value;}
 setAttribute(key,value){this.attrs[key]=value;}
 addEventListener(key,handler){this.handlers[key]=handler;}
 focus(){document.activeElement=this;}
 click(){if(this.handlers.click)this.handlers.click();}
 remove(){}
}
const ids={};
for(const id of ['data','search','category','cards','empty','count','steps','en','vi','reset','json','markdown'])ids[id]=new Element(id==='category'?'select':'div');
ids.data.textContent=JSON.stringify(PAYLOAD);
const document={getElementById:id=>ids[id],createElement:tag=>new Element(tag),createDocumentFragment:()=>new Element(),querySelectorAll:()=>[],documentElement:{},body:new Element(),activeElement:null};
// Flatten fragments like the browser does, while retaining card elements.
ids.cards.replaceChildren=function(fragment){this.children=fragment.children;};
const Option=function(text,value){const el=new Element('option');el.textContent=text;el.value=value;return el;};
let saved;
const URL={createObjectURL(blob){saved=blob;return 'blob:local-test';},revokeObjectURL(){}};
const setTimeout=fn=>fn();
""".replace('PAYLOAD', json.dumps(self.data, ensure_ascii=False))
        checks = r"""
(async()=>{
assert.equal(ids.cards.children.length,24);
ids.search.value='quyen';ids.search.handlers.input();
assert.ok(ids.cards.children.length>0);
const matches=ids.cards.children.length;
ids.search.value='quyền'.normalize('NFD');ids.search.handlers.input();
assert.equal(ids.cards.children.length,matches);
ids.reset.click();assert.equal(ids.cards.children.length,24);
assert.equal(document.activeElement,ids.search);
ids.category.value='quality';ids.category.handlers.change();
assert.equal(ids.cards.children.length,4);
ids.vi.click();assert.equal(document.documentElement.lang,'vi');
assert.equal(ids.vi.attrs['aria-pressed'],'true');assert.equal(ids.en.attrs['aria-pressed'],'false');
assert.equal(ids.cards.children[0].children[1].textContent,'Kiểm thử');
assert.equal(ids.category.value,'quality');assert.equal(ids.steps.children.length,5);
ids.cards.children[0].focus();let prevented=false;
ids.cards.handlers.keydown({key:'ArrowDown',preventDefault(){prevented=true;}});
assert.equal(document.activeElement,ids.cards.children[1]);assert.ok(prevented);
ids.cards.handlers.keydown({key:'End',preventDefault(){}});
assert.equal(document.activeElement,ids.cards.children[3]);
ids.cards.handlers.keydown({key:'Home',preventDefault(){}});
assert.equal(document.activeElement,ids.cards.children[0]);
ids.search.value='no-such-term-9087';ids.search.handlers.input();
assert.equal(ids.cards.children.length,0);assert.equal(ids.empty.hidden,false);
ids.json.click();const exported=JSON.parse(await saved.text());
assert.equal(exported.terms.length,24);assert.equal(exported.schema_version,1);
assert.ok(exported.terms[0].meaning.vi.includes('Công cụ'));
ids.markdown.click();const md=await saved.text();
assert.equal((md.match(/^## /gm)||[]).length,24);
assert.ok(md.includes('Quyền truy cập'));assert.ok(md.includes('    git status'));
ids.reset.click();ids.en.click();assert.equal(ids.cards.children.length,24);
assert.equal(document.documentElement.lang,'en');
console.log('App JS: search, filters, language, keyboard, empty state and exports passed.');
})().catch(error=>{console.error(error);process.exitCode=1;});
"""
        result = subprocess.run([shutil.which('node'), '-e', harness + parser.scripts[1] + checks],
                                capture_output=True, text=True, cwd=ROOT, timeout=15)
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)

    def test_cli_refuses_to_overwrite_source(self):
        with tempfile.TemporaryDirectory(dir=ROOT) as folder:
            path = Path(folder) / 'source.json'
            content = json.dumps(self.data, ensure_ascii=False)
            path.write_text(content, encoding='utf-8')
            with redirect_stderr(io.StringIO()):
                status = compiler.main(['compile', str(path), '--output', str(path)])
            self.assertEqual(status, 1)
            self.assertEqual(path.read_text(encoding='utf-8'), content)


if __name__ == '__main__':
    unittest.main()

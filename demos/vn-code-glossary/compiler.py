#!/usr/bin/env python3
"""Offline EN–VI glossary schema validator and single-file HTML compiler."""
import argparse
import json
from pathlib import Path
import re
import sys
import unicodedata

CATEGORIES = {
    'version-control': ('Version control', 'Quản lý phiên bản'),
    'quality': ('Quality', 'Chất lượng'),
    'terminal': ('Terminal', 'Dòng lệnh'),
    'execution': ('Execution & access', 'Thực thi và truy cập'),
    'ai': ('AI concepts', 'Khái niệm AI'),
    'building': ('Building blocks', 'Nền tảng lập trình'),
}
FIELDS = {'id', 'category', 'name', 'meaning', 'example', 'misconception'}


def fold(text):
    """Search folding only; stored and exported Vietnamese retains accents."""
    return ''.join(c for c in unicodedata.normalize('NFD', text.casefold())
                   if not unicodedata.combining(c)).replace('đ', 'd')


def clean_text(value, location):
    if not isinstance(value, str) or not value.strip():
        raise ValueError(f'{location}: expected nonempty text / cần văn bản không rỗng')
    if len(value) > 4000 or any((unicodedata.category(c) == 'Cs' or (unicodedata.category(c) == 'Cc' and c not in '\n\t')) for c in value):
        raise ValueError(f'{location}: oversized text or control character / văn bản quá dài hoặc ký tự điều khiển')
    return unicodedata.normalize('NFC', value.strip())


def validate(document):
    """Validate our closed JSON schema; return a new NFC-normalized document.

    Any nonempty number of terms is permitted, allowing workshop additions.
    The bundled curated dataset is separately tested to contain exactly 24.
    """
    if not isinstance(document, dict) or set(document) != {'schema_version', 'terms'}:
        raise ValueError('root: expected schema_version and terms / cần schema_version và terms')
    if type(document['schema_version']) is not int or document['schema_version'] != 1:
        raise ValueError('schema_version: expected integer 1 / cần số nguyên 1')
    if not isinstance(document['terms'], list) or not document['terms']:
        raise ValueError('terms: expected nonempty array / cần mảng không rỗng')
    result, seen = [], set()
    for i, term in enumerate(document['terms']):
        at = f'terms[{i}]'
        if not isinstance(term, dict) or set(term) != FIELDS:
            raise ValueError(f'{at}: incorrect fields / trường dữ liệu không đúng')
        tid = term['id']
        if not isinstance(tid, str) or not re.fullmatch(r'[a-z][a-z0-9]*(?:-[a-z0-9]+)*', tid):
            raise ValueError(f'{at}.id: use lowercase ASCII kebab-case / dùng chữ thường ASCII ngăn bởi dấu gạch nối')
        if tid in seen:
            raise ValueError(f'{at}.id: duplicate / trùng lặp: {tid}')
        seen.add(tid)
        if not isinstance(term['category'], str) or term['category'] not in CATEGORIES:
            raise ValueError(f'{at}.category: unknown category / nhóm không hợp lệ')
        entry = {'id': tid, 'category': term['category']}
        for field in ('name', 'meaning', 'misconception'):
            pair = term[field]
            if not isinstance(pair, dict) or set(pair) != {'en', 'vi'}:
                raise ValueError(f'{at}.{field}: expected en and vi / cần en và vi')
            entry[field] = {lang: clean_text(pair[lang], f'{at}.{field}.{lang}') for lang in ('en', 'vi')}
        entry['example'] = clean_text(term['example'], f'{at}.example')
        result.append(entry)
    return {'schema_version': 1, 'terms': result}


def unique_object(pairs):
    obj = {}
    for key, value in pairs:
        if key in obj:
            raise ValueError(f'duplicate JSON key / khóa JSON trùng lặp: {key}')
        obj[key] = value
    return obj


def load(path):
    return validate(json.loads(Path(path).read_text(encoding='utf-8'), object_pairs_hook=unique_object))


def render(document):
    payload = json.dumps(validate(document), ensure_ascii=False).replace('<', '\\u003c').replace('>', '\\u003e').replace('&', '\\u0026')
    return HTML.replace('__CATEGORIES__', json.dumps(CATEGORIES, ensure_ascii=False)).replace('__GLOSSARY_DATA__', payload)


HTML = r'''<!doctype html>
<html lang="en">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light dark">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; connect-src 'none'; img-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'">
<title>EN–VI Code Concept Glossary Compiler</title>
<style>
:root{font-family:system-ui,sans-serif;color:#172e32;background:#f3f5ef;line-height:1.6;--paper:#fff;--line:#b6c8c0;--accent:#065d4c;--muted:#435f5b}*{box-sizing:border-box}body{margin:0}header,main,footer{padding:clamp(1rem,3vw,3rem)}header{background:#123e38;color:#fff;border-bottom:6px solid #b7e266}header p{max-width:75ch}h1{font-size:clamp(1.8rem,4vw,3.5rem);line-height:1.15;margin:.4rem 0 1rem;max-width:28ch}h2,h3{line-height:1.3}button,input,select{font:inherit}button,select,input{border:1px solid var(--line);border-radius:.4rem;padding:.65rem .8rem;min-height:46px;background:var(--paper);color:inherit}button{cursor:pointer}header button{color:#123e38;background:#fff}button:hover{border-color:var(--accent);text-decoration:underline}button[aria-pressed=true]{background:#dff2b3;color:#123e38}a{color:var(--accent)}.skip{position:absolute;top:-6rem;background:white;color:#123e38;padding:1rem;z-index:3}.skip:focus{top:0}:focus-visible{outline:3px solid #b05b00;outline-offset:4px}header :focus-visible{outline-color:#b7e266}.topline,.actions{display:flex;gap:.7rem;align-items:center;flex-wrap:wrap}.topline{justify-content:space-between}.eyebrow{font-weight:700;letter-spacing:.08em;font-size:.85rem}.toolbar{display:grid;grid-template-columns:minmax(0,2fr) minmax(0,1fr);gap:1rem}label{font-weight:650}label input,label select{display:block;width:100%;margin-top:.4rem}.help,.meta{color:var(--muted);font-size:.95rem}.actions{margin:1.2rem 0}.layout{display:grid;grid-template-columns:minmax(0,2fr) minmax(16rem,1fr);gap:2rem}.cards{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1rem;align-content:start}.card,aside{background:var(--paper);border:1px solid var(--line);border-radius:.65rem;padding:1.3rem;min-width:0}.card:focus{outline:3px solid var(--accent);outline-offset:3px}.card h3{font-size:1.3rem;margin:.4rem 0}.card p{margin:.65rem 0}.tag{font-size:.8rem;text-transform:uppercase;letter-spacing:.04em;color:var(--accent);font-weight:700}pre{white-space:pre-wrap;overflow-wrap:anywhere;background:#142f2b;color:#e6f5e7;padding:1rem;border-radius:.4rem;font-size:.9rem}code{font-family:ui-monospace,monospace}.misconception{border-left:3px solid #b05b00;padding-left:.8rem}aside{align-self:start}aside li{margin-bottom:.8rem}footer{border-top:1px solid var(--line)}[hidden]{display:none!important}.empty{border:2px dashed var(--line);padding:2rem}.count{font-weight:700}@media(max-width:1000px){.layout{grid-template-columns:1fr}aside{max-width:none}}@media(max-width:650px){.cards,.toolbar{grid-template-columns:1fr}.actions button{flex:1 1 auto}main{padding-top:1.2rem}}@media(prefers-color-scheme:dark){:root{color:#e4eee9;background:#10231f;--paper:#19352e;--line:#5d7c6e;--accent:#b7e266;--muted:#bed3c8}button[aria-pressed=true]{background:#b7e266}pre{background:#0c211b}:focus-visible{outline-color:#f6bd70}}
</style>
<a class="skip" href="#main" data-i="skip">Skip to glossary</a>
<header>
<div class="topline"><span class="eyebrow">FIELD NOTES / GHI CHÉP • 01</span><div role="group" aria-label="Language / Ngôn ngữ"><button type="button" id="en" aria-pressed="true" lang="en">English</button> <button type="button" id="vi" aria-pressed="false" lang="vi">Tiếng Việt</button></div></div>
<h1 data-i="title">Code concepts, one clear step at a time.</h1>
<p data-i="intro">Original beginner terms in English and Vietnamese. Explore, compare, and compile a glossary you can keep offline.</p>
<p data-i="provenance">Independent educational demo. Curated practice examples are not execution records. No model calls, telemetry, or affiliation.</p>
</header>
<main id="main" tabindex="-1">
<section aria-labelledby="explore"><h2 id="explore" data-i="explore">Explore the glossary</h2>
<div class="toolbar"><label><span data-i="search">Search both languages</span><input type="search" id="search" autocomplete="off" aria-describedby="search-help"></label><label><span data-i="category">Category</span><select id="category"></select></label></div>
<p class="help" id="search-help" data-i="help">Search ignores accents: try “quyen” or “kiem thu”. Tab reaches controls; focus a card and use ↑ / ↓, Home / End to move through results.</p>
<div class="actions"><button type="button" id="reset" data-i="reset">Clear filters</button><button type="button" id="json" data-i="json">Download JSON</button><button type="button" id="markdown" data-i="markdown">Download Markdown</button></div>
<p class="help" data-i="exports">Downloads include every term, both languages and schema version 1, regardless of filters.</p>
<p id="count" class="count" role="status" aria-live="polite" aria-atomic="true"></p>
</section>
<div class="layout"><section aria-labelledby="results-title"><h2 id="results-title" data-i="results">Term cards</h2><div id="cards" class="cards"></div><p id="empty" class="empty" hidden data-i="empty">No matches. Clear filters or try another word in either language.</p></section>
<aside aria-labelledby="workshop"><span class="tag">20 MIN / 20 PHÚT</span><h2 id="workshop" data-i="workshop">From a word to a working check</h2><ol id="steps"></ol><p data-i="challenge">Challenge: explain why a passing schema check cannot prove that a translation is correct.</p><p class="help" data-i="safety">Examples are plain text and never run here. Git examples require an existing practice repository. Python examples require Python 3.</p></aside></div>
<noscript><p>Enable JavaScript to search and export. For a no-JavaScript route, read glossary.json and run python3 compiler.py validate. / Bật JavaScript để tìm và xuất; hoặc đọc glossary.json và chạy python3 compiler.py validate.</p></noscript>
</main><footer><strong>EN–VI Code Concept Glossary Compiler</strong><p data-i="footer">Built for local learning. Vietnamese accents are preserved in stored data and downloads. Search folding does not change the source.</p></footer>
<script id="data" type="application/json">__GLOSSARY_DATA__</script>
<script>
'use strict';
const data=JSON.parse(document.getElementById('data').textContent);
const categories=__CATEGORIES__;
const copy={en:{skip:'Skip to glossary',title:'Code concepts, one clear step at a time.',intro:'Original beginner terms in English and Vietnamese. Explore, compare, and compile a glossary you can keep offline.',provenance:'Independent educational demo. Curated practice examples are not execution records. No model calls, telemetry, or affiliation.',explore:'Explore the glossary',search:'Search both languages',category:'Category',help:'Search ignores accents: try “quyen” or “kiem thu”. Tab reaches controls; focus a card and use ↑ / ↓, Home / End to move through results.',reset:'Clear filters',json:'Download JSON',markdown:'Download Markdown',exports:'Downloads include every term, both languages and schema version 1, regardless of filters.',results:'Term cards',empty:'No matches. Clear filters or try another word in either language.',workshop:'From a word to a working check',challenge:'Challenge: explain why a passing schema check cannot prove that a translation is correct.',safety:'Examples are plain text and never run here. Git examples require an existing practice repository. Python examples require Python 3.',footer:'Built for local learning. Vietnamese accents are preserved in stored data and downloads. Search folding does not change the source.',all:'All categories',meaning:'Meaning',example:'Practice example • not executed',misconception:'Common misconception',count:(n)=>`${n} of ${data.terms.length} terms`,steps:['0–3 min: Search for “commit”. Compare the two meanings and explain the misconception.','3–7 min: Find “assertion” and “tests”. Predict what each example checks before running Python locally.','7–12 min: Download JSON. Add a bilingual term with a unique ID to a practice copy.','12–17 min: Run the validator on that copy. Duplicate its ID, observe the error, then fix it.','17–20 min: Clear filters, switch languages and download Markdown. Share one corrected misconception.']},vi:{skip:'Đến bảng thuật ngữ',title:'Hiểu khái niệm lập trình, từng bước rõ ràng.',intro:'Các thuật ngữ gốc dành cho người mới, bằng tiếng Anh và tiếng Việt. Khám phá, đối chiếu và biên soạn bảng thuật ngữ dùng ngoại tuyến.',provenance:'Bản minh họa giáo dục độc lập. Ví dụ thực hành được biên soạn, không phải nhật ký thực thi. Không gọi mô hình, không thu thập dữ liệu, không liên kết với nhà cung cấp.',explore:'Khám phá bảng thuật ngữ',search:'Tìm bằng cả hai ngôn ngữ',category:'Nhóm',help:'Tìm không phân biệt dấu: thử “quyen” hoặc “kiem thu”. Dùng Tab đến các điều khiển; khi thẻ có tiêu điểm, dùng ↑ / ↓, Home / End để chuyển giữa các kết quả.',reset:'Xóa bộ lọc',json:'Tải JSON',markdown:'Tải Markdown',exports:'Bản tải xuống chứa mọi thuật ngữ, cả hai ngôn ngữ và phiên bản lược đồ 1, bất kể bộ lọc.',results:'Các thẻ thuật ngữ',empty:'Không có kết quả. Xóa bộ lọc hoặc thử từ khác bằng một trong hai ngôn ngữ.',workshop:'Từ một từ đến phép kiểm tra chạy được',challenge:'Thử thách: giải thích vì sao kiểm tra lược đồ đạt không chứng minh bản dịch đúng.',safety:'Ví dụ là văn bản và không chạy tại đây. Ví dụ Git cần kho thực hành có sẵn. Ví dụ Python cần Python 3.',footer:'Dành cho học tập cục bộ. Dấu tiếng Việt được giữ trong dữ liệu và bản tải xuống. Tìm kiếm không sửa dữ liệu nguồn.',all:'Tất cả các nhóm',meaning:'Ý nghĩa',example:'Ví dụ thực hành • chưa thực thi',misconception:'Hiểu lầm thường gặp',count:(n)=>`${n} / ${data.terms.length} thuật ngữ`,steps:['0–3 phút: Tìm “commit”. Đối chiếu hai phần giải nghĩa và giải thích hiểu lầm.','3–7 phút: Tìm “assertion” và “tests”. Dự đoán ví dụ kiểm tra điều gì trước khi chạy Python cục bộ.','7–12 phút: Tải JSON. Thêm thuật ngữ song ngữ có ID riêng vào bản sao thực hành.','12–17 phút: Chạy trình xác thực trên bản sao. Lặp lại ID, quan sát lỗi rồi sửa.','17–20 phút: Xóa bộ lọc, đổi ngôn ngữ và tải Markdown. Chia sẻ một hiểu lầm đã được sửa.']}};
let lang='en';
const $=id=>document.getElementById(id);
const fold=s=>s.normalize('NFD').replace(/\p{M}/gu,'').toLowerCase().replace(/đ/g,'d');
function node(tag,text,className){const el=document.createElement(tag);el.textContent=text;if(className)el.className=className;return el;}
function bilingual(tag,pair,className){const el=node(tag,pair[lang],className);el.lang=lang;return el;}
function show(){
 const query=fold($('search').value.trim());const cat=$('category').value;
 const terms=data.terms.filter(t=>(!cat||t.category===cat)&&fold([t.id,...categories[t.category],...Object.values(t.name),...Object.values(t.meaning),...Object.values(t.misconception),t.example].join(' ')).includes(query));
 const fragment=document.createDocumentFragment();
 for(const t of terms){const card=document.createElement('article');card.className='card';card.tabIndex=0;card.setAttribute('aria-labelledby',`title-${t.id}`);
 card.append(node('span',categories[t.category][lang==='en'?0:1],'tag'));
 const title=bilingual('h3',t.name);title.id=`title-${t.id}`;card.append(title);
 const other=lang==='en'?'vi':'en';const alternate=node('p',t.name[other],'meta');alternate.lang=other;card.append(alternate);
 card.append(node('strong',copy[lang].meaning),bilingual('p',t.meaning));
 const translation=bilingual('p',t.meaning,'meta');translation.textContent=t.meaning[other];translation.lang=other;card.append(translation);
 card.append(node('strong',copy[lang].example));const pre=document.createElement('pre');pre.append(node('code',t.example));card.append(pre);
 const misconception=node('div','','misconception');misconception.append(node('strong',copy[lang].misconception),bilingual('p',t.misconception));card.append(misconception);
 fragment.append(card);}
 $('cards').replaceChildren(fragment);$('empty').hidden=terms.length!==0;$('count').textContent=copy[lang].count(terms.length);
}
function language(next){lang=next;document.documentElement.lang=lang;document.title=lang==='en'?'EN–VI Code Concept Glossary Compiler':'Trình biên soạn thuật ngữ lập trình Anh–Việt';
 document.querySelectorAll('[data-i]').forEach(el=>el.textContent=copy[lang][el.dataset.i]);
 for(const l of ['en','vi'])$(l).setAttribute('aria-pressed',String(l===lang));
 const selected=$('category').value;$('category').replaceChildren(new Option(copy[lang].all,''),...Object.entries(categories).map(([id,names])=>new Option(names[lang==='en'?0:1],id)));$('category').value=selected;
 $('steps').replaceChildren(...copy[lang].steps.map(s=>node('li',s)));show();}
$('search').addEventListener('input',show);$('category').addEventListener('change',show);
$('reset').addEventListener('click',()=>{$('search').value='';$('category').value='';show();$('search').focus();});
for(const l of ['en','vi'])$(l).addEventListener('click',()=>language(l));
$('cards').addEventListener('keydown',event=>{const cards=Array.from($('cards').children);const at=cards.indexOf(document.activeElement);if(at<0)return;let next;
 if(event.key==='ArrowDown')next=Math.min(at+1,cards.length-1);if(event.key==='ArrowUp')next=Math.max(0,at-1);if(event.key==='Home')next=0;if(event.key==='End')next=cards.length-1;
 if(next!==undefined){event.preventDefault();cards[next].focus();}});
function markdown(){const lines=['# EN–VI Code Concept Glossary / Thuật ngữ lập trình Anh–Việt','','Schema version / Phiên bản lược đồ: 1','','Independent educational practice examples; not execution records. / Ví dụ giáo dục độc lập; không phải nhật ký thực thi.',''];
 for(const t of data.terms){lines.push(`## ${t.name.en} / ${t.name.vi}`,`ID: ${t.id}`,`Category / Nhóm: ${categories[t.category].join(' / ')}`,'',`EN: ${t.meaning.en}`,`VI: ${t.meaning.vi}`,'','Example / Ví dụ:','');
 // Indented code blocks safely preserve embedded backticks in workshop additions.
 lines.push(...t.example.split('\n').map(line=>'    '+line),'',`Misconception / Hiểu lầm (EN): ${t.misconception.en}`,`Hiểu lầm (VI): ${t.misconception.vi}`,'');}return lines.join('\n');}
function download(content,type,filename){const url=URL.createObjectURL(new Blob([content],{type}));const a=document.createElement('a');a.href=url;a.download=filename;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
$('json').addEventListener('click',()=>download(JSON.stringify(data,null,2)+'\n','application/json;charset=utf-8','en-vi-glossary.json'));
$('markdown').addEventListener('click',()=>download(markdown(),'text/markdown;charset=utf-8','en-vi-glossary.md'));
language('en');
</script>
</html>
'''


def main(argv=None):
    parser = argparse.ArgumentParser(description='Validate or compile an offline EN–VI glossary / Xác thực hoặc biên soạn bảng thuật ngữ ngoại tuyến')
    parser.add_argument('command', choices=('validate', 'compile'))
    parser.add_argument('input', nargs='?', default='glossary.json')
    parser.add_argument('--output', default='index.html', help='HTML output for compile / Tệp HTML khi biên soạn')
    args = parser.parse_args(argv)
    try:
        document = load(args.input)
        if args.command == 'compile':
            target = Path(args.output)
            if target.resolve() == Path(args.input).resolve():
                raise ValueError('output must differ from input / tệp xuất phải khác tệp nguồn')
            target.write_text(render(document), encoding='utf-8')
        print(f'OK: {len(document["terms"])} terms / thuật ngữ; {args.command}')
        return 0
    except (OSError, ValueError, RecursionError) as error:
        print(f'ERROR / LỖI: {error}', file=sys.stderr)
        return 1


if __name__ == '__main__':
    sys.exit(main())

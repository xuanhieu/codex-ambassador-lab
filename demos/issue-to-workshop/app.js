'use strict';
(() => {
  const C = window.WorkshopCore;
  const $ = id => document.getElementById(id);
  let lang = 'vi', plan = null, loadedSample = null, dirty = false;
  const ui = {
    vi: { skip:'Đến nội dung',language:'Ngôn ngữ',eyebrow:'BÀN LÀM VIỆC CỦA NGƯỜI HƯỚNG DẪN',heading:'Một issue. Một buổi học 20 phút.',subtitle:'Biến bản ghi lỗi tổng hợp thành hoạt động có bằng chứng, cho cả người mới và lập trình viên.',inputTitle:'01 / Chuẩn bị bản ghi',required:'Tất cả trường đều bắt buộc',scenario:'Tình huống tổng hợp',filter:'Bộ lọc chữ hoa',count:'Bộ đếm nhiệm vụ',focus:'Tiêu điểm hộp thoại',load:'Nạp mẫu',inputHelp:'Chỉ dùng văn bản tổng hợp. Không URL; Markdown được chuyển thành văn bản thuần. Nạp mẫu sẽ thay nội dung hiện tại.',complexity:'Độ phức tạp',audience:'Nhóm tham gia',low:'Thấp',medium:'Vừa',high:'Cao',mixed:'Hỗn hợp',noncoder:'Không lập trình',developer:'Lập trình viên',consent:'Tôi chỉ dùng dữ liệu tổng hợp và mô phỏng trên giấy.',generate:'Tạo kế hoạch 20 phút',outputTitle:'02 / Kế hoạch workshop',emptyTitle:'Bài học bắt đầu từ bằng chứng.',emptyText:'Nạp một mẫu hoặc tự nhập bản ghi, xác nhận phạm vi rồi tạo kế hoạch. Bốn bài tập đi kèm trong hai giai đoạn lập kế hoạch và kiểm chứng.',copy:'Sao chép phiếu',download:'Tải phiếu .txt',json:'Xuất JSON',footer:'Cục bộ trong trình duyệt • Không lưu dữ liệu sau khi tải lại • Không kết nối dịch vụ bên ngoài',loaded:'Đã nạp mẫu tổng hợp. Có thể chỉnh sửa trước khi tạo.',invalid:'Kiểm tra các trường được đánh dấu. Nội dung đã được giữ lại.',created:'Đã tạo kế hoạch mô phỏng 20 phút.',stale:'Nội dung đã đổi. Tạo lại kế hoạch để xuất bản mới.',copied:'Đã sao chép phiếu.',fallback:'Không thể dùng clipboard. Phiếu bên dưới đã được chọn; nhấn Ctrl+C hoặc ⌘C để sao chép.',saved:'Đã yêu cầu trình duyệt tải tệp.',downloadError:'Không tạo được tệp. Dùng Sao chép phiếu để lấy văn bản.',goals:'Mục tiêu',source:'Bản ghi dùng cho buổi học',exercise:'Bài tập lồng trong giai đoạn 3 và 5',exerciseHelp:'Ở mỗi giai đoạn, chia cặp theo vai: mỗi nhóm làm một bài phù hợp trong thời gian của giai đoạn; không cộng thêm phút.',deliver:'Sản phẩm',minutes:'phút',stepHint:'2–6 bước, mỗi dòng 3–200 ký tự.' },
    en: { skip:'Skip to content',language:'Language',eyebrow:'THE FACILITATOR’S WORKBENCH',heading:'One issue. A 20-minute workshop.',subtitle:'Turn a synthetic bug record into evidence-led activities for newcomers and developers.',inputTitle:'01 / Prepare the record',required:'All fields are required',scenario:'Synthetic scenario',filter:'Uppercase filter',count:'Task counter',focus:'Dialog focus',load:'Load sample',inputHelp:'Synthetic plain text only. No URLs; Markdown becomes plain text. Loading a sample replaces current inputs.',complexity:'Complexity',audience:'Audience',low:'Low',medium:'Medium',high:'High',mixed:'Mixed',noncoder:'Non-coder',developer:'Developer',consent:'I will use only synthetic data and paper simulation.',generate:'Create 20-minute plan',outputTitle:'02 / Workshop plan',emptyTitle:'A lesson starts with evidence.',emptyText:'Load a sample or enter a record, confirm the scope, then generate a plan. Four exercises are embedded in the planning and verification stages.',copy:'Copy worksheet',download:'Download .txt',json:'Export JSON',footer:'Local browser only • Nothing persists after reload • No external services',loaded:'Synthetic sample loaded. Edit it before generating if needed.',invalid:'Check the marked fields. Your inputs have been preserved.',created:'20-minute simulation plan created.',stale:'Inputs changed. Generate again to export the updated plan.',copied:'Worksheet copied.',fallback:'Clipboard unavailable. The worksheet below is selected; press Ctrl+C or ⌘C to copy.',saved:'Browser download requested.',downloadError:'Could not create a file. Use Copy worksheet to obtain the text.',goals:'Learning goals',source:'Record used in this workshop',exercise:'Exercises embedded in stages 3 and 5',exerciseHelp:'In each stage, pair up by role: each group chooses a relevant exercise within that stage’s time; do not add minutes.',deliver:'Deliverable',minutes:'min',stepHint:'2–6 steps, each on its own line with 3–200 characters.' }
  };
  function node(tag, text, className) { const el = document.createElement(tag); if (text !== undefined) el.textContent = text; if (className) el.className = className; return el; }
  Object.entries(C.LIMITS).forEach(([key,max]) => {
    const wrap = node('div', undefined, 'field');
    const label = node('label'); label.htmlFor = key;
    label.append(node('span', '', 'field-name'), node('span', '≤ ' + max, 'limit'));
    const input = document.createElement(key === 'title' ? 'input' : 'textarea');
    input.id = key; input.name = key; input.maxLength = max; input.required = true;
    input.setAttribute('aria-describedby', key + '-error' + (key === 'steps' ? ' steps-hint' : '') + ' input-help');
    wrap.append(label,input);
    if (key === 'steps') { const hint = node('span','','help'); hint.id = 'steps-hint'; wrap.append(hint); }
    const error = node('span','','error'); error.id = key + '-error'; wrap.append(error); $('fields').append(wrap);
  });
  function read() {
    const input = {};
    [...Object.keys(C.LIMITS),'complexity','audience'].forEach(key => input[key] = $(key).value);
    input.synthetic = $('synthetic').checked;
    return input;
  }
  $('fields').addEventListener('focusout',event => {
    const key = event.target.id; if(!C.LIMITS[key]) return;
    const error = C.validate(read(),lang).errors[key]; $(key+'-error').textContent = error || '';
    if(error) $(key).setAttribute('aria-invalid','true'); else $(key).removeAttribute('aria-invalid');
  });
  function clearErrors() { document.querySelectorAll('.error').forEach(el => el.textContent = ''); document.querySelectorAll('[aria-invalid]').forEach(el => el.removeAttribute('aria-invalid')); }
  function invalidate() {
    plan = null; $('result').hidden = true; $('exports').hidden = true; $('empty').hidden = false;
    $('copy-fallback').hidden = true; $('export-status').textContent = '';
  }
  function fill(id) {
    const input = C.scenario(id,lang);
    Object.keys(C.LIMITS).concat(['complexity','audience']).forEach(key => $(key).value = input[key]);
    $('synthetic').checked = false; loadedSample = id; dirty = false;
    clearErrors(); invalidate(); $('form-status').textContent = ui[lang].loaded;
  }
  function render() {
    const t = ui[lang], out = $('result'); out.replaceChildren();
    out.append(node('h3',plan.issue.title),node('p',plan.scopeGuidance),node('h3',t.goals));
    const goals = node('ul'); plan.goals.forEach(g => goals.append(node('li',g))); out.append(goals);
    const source = node('details'), summary = node('summary',t.source); source.append(summary);
    Object.entries(C.COPY[lang].labels).forEach(([key,label]) => {
      const value = plan.issue[key];
      source.append(node('p',label + ': ' + (Array.isArray(value) ? value.join('\n') : (t[value] || value)), 'source'));
    }); out.append(source);
    const strip = node('ol',undefined,'timeline');
    plan.stages.forEach(s => { const li = node('li'); li.append(node('b',s.minutes + ' ' + t.minutes),node('span',s.title)); strip.append(li); }); out.append(strip);
    plan.stages.forEach((s,i) => { const section = node('article',undefined,'stage'); section.append(node('h3',`${i+1}. ${s.title} · ${s.start}–${s.end} ${t.minutes}`),node('p',s.instruction));
      if(i===1) { const list = node('ol'); plan.issue.steps.forEach(step => list.append(node('li',step))); section.append(list,node('p',C.COPY[lang].labels.expected + ': ' + plan.issue.expected),node('p',C.COPY[lang].labels.actual + ': ' + plan.issue.actual)); }
      out.append(section);
    });
    out.append(node('h3',t.exercise),node('p',plan.exerciseGuidance));
    plan.exercises.forEach(e => { const article = node('article',undefined,'exercise'); article.append(node('h3',e.title + ' · ' + t[e.audience] + ' · ' + C.COPY[lang].stage + ' ' + e.stage),node('p',e.task),node('p',t.deliver + ': ' + e.deliverable)); out.append(article); });
    $('empty').hidden = true; out.hidden = false; $('exports').hidden = false;
  }
  function translate() {
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-i18n]').forEach(el => el.textContent = ui[lang][el.dataset.i18n]);
    Object.keys(C.LIMITS).forEach(key => $(key).previousElementSibling.querySelector('.field-name').textContent = C.COPY[lang].labels[key]);
    $('steps-hint').textContent = ui[lang].stepHint; $('notice').textContent = C.COPY[lang].notice;
  }
  $('language').addEventListener('change',() => {
    const hadPlan = !!plan; lang = $('language').value; translate(); clearErrors();
    if(loadedSample && !dirty) {
      const selectedAudience = $('audience').value, confirmed = $('synthetic').checked;
      const input = C.scenario(loadedSample,lang); Object.keys(C.LIMITS).forEach(key => $(key).value = input[key]);
      $('audience').value = selectedAudience; $('synthetic').checked = confirmed;
    }
    $('form-status').textContent = ''; $('export-status').textContent = ''; $('copy-fallback').hidden = true;
    if(hadPlan) { plan = C.generate(read(),lang).plan; render(); }
  });
  $('load').addEventListener('click',() => fill($('scenario').value));
  $('issue-form').addEventListener('input',() => { dirty = true; if(plan) { invalidate(); $('form-status').textContent = ui[lang].stale; } });
  $('issue-form').addEventListener('submit',event => {
    event.preventDefault(); clearErrors(); invalidate();
    const result = C.generate(read(),lang);
    if(!result.ok) {
      Object.entries(result.errors).forEach(([key,message]) => { $(key+'-error').textContent = message; $(key).setAttribute('aria-invalid','true'); });
      $('form-status').textContent = ui[lang].invalid; $(Object.keys(result.errors)[0]).focus(); return;
    }
    plan = result.plan; render(); $('form-status').textContent = ui[lang].created; $('output-title').focus();
  });
  $('copy').addEventListener('click',async () => {
    if(!plan) return;
    const text = C.worksheet(plan); $('copy').disabled = true;
    try { if(!navigator.clipboard) throw new Error('unavailable'); await navigator.clipboard.writeText(text); $('export-status').textContent = ui[lang].copied; }
    catch { const area = $('copy-fallback'); area.value = text; area.hidden = false; area.focus(); area.select(); $('export-status').textContent = ui[lang].fallback; }
    finally { $('copy').disabled = false; }
  });
  function download(json) {
    if(!plan) return;
    try {
      const blob = new Blob([json ? C.exportJSON(plan) : C.worksheet(plan)],{type:json ? 'application/json;charset=utf-8':'text/plain;charset=utf-8'});
      const url = URL.createObjectURL(blob), anchor = node('a'); anchor.href = url; anchor.download = 'n106-workshop-' + lang + (json ? '.json':'.txt');
      document.body.append(anchor); anchor.click(); anchor.remove(); setTimeout(() => URL.revokeObjectURL(url),1000); $('export-status').textContent = ui[lang].saved;
    } catch { $('export-status').textContent = ui[lang].downloadError; }
  }
  $('text-download').addEventListener('click',() => download(false)); $('json-download').addEventListener('click',() => download(true));
  translate();
})();

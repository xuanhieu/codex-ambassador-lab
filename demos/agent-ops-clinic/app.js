import { SCENARIOS, STAGES, ROLES, createSession, dispatch, estimateCents, budgetOK, blockers, canPublish, exportSession, replaySession } from './domain.js';
import { messages, roleNames } from './i18n.js';
import { SAMPLES } from './samples.js';

const KEY = 'agent-ops-clinic:v1';
const root = document.querySelector('#app');
let lang = 'en', scenarioId = 'launch', selected = {}, sessions = {}, storageIssue = '', notice = '';
let drafts = {};
try {
  const raw = localStorage.getItem(KEY);
  if (raw) {
    const saved = JSON.parse(raw);
    if (saved.version !== 1 || !saved.sessions || typeof saved.sessions !== 'object') throw Error('invalid');
    const restored = {};
    for (const [id, record] of Object.entries(saved.sessions)) {
      if (id !== record.scenarioId) throw Error('invalid');
      restored[id] = replaySession(record);
    }
    sessions = restored;
    lang = saved.lang === 'vi' ? 'vi' : 'en';
    scenarioId = SCENARIOS.some(s => s.id === saved.scenarioId) ? saved.scenarioId : 'launch';
    selected = saved.selected && typeof saved.selected === 'object' ? saved.selected : {};
  }
} catch { storageIssue = 'recovered'; }
const tr = key => messages[lang][key] ?? messages[lang].error;
const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money = cents => new Intl.NumberFormat(lang === 'vi' ? 'vi-VN' : 'en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
const role = name => roleNames[lang][name];
const session = () => sessions[scenarioId] ??= createSession(scenarioId);
const currentTask = () => session().tasks.find(t => t.id === selected[scenarioId]) ?? session().tasks[0];
const localTime = at => new Intl.DateTimeFormat(lang === 'vi' ? 'vi-VN' : 'en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(new Date(at));
const draftKey = () => `${scenarioId}:${currentTask().id}:${lang}`;
function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify({ version: 1, lang, scenarioId, selected, sessions: Object.fromEntries(Object.entries(sessions).map(([id,s]) => [id, exportSession(s)])) }));
    if (storageIssue === 'storageError') storageIssue = '';
  } catch { storageIssue = 'storageError'; }
}
function announce(key) {
  notice = tr(key);
  document.querySelector('#announcement').textContent = notice;
}
function operate(type, data = {}, taskId = currentTask().id) {
  try {
    sessions[scenarioId] = dispatch(session(), { type, data, ...(type !== 'set_budget' ? { taskId } : {}) });
    if (type === 'save_brief') delete drafts[draftKey()];
    persist();
    announce(type === 'save_brief' ? 'briefSaved' : type === 'advance' && currentTask().stage === 'publish' ? 'published' : 'changed');
  } catch (error) { announce(messages[lang][error.code] ? error.code : 'error'); }
  render();
}
function riskPanel(task) {
  return task.risks.map(risk => {
    const resolved = task.decisions[risk] !== 'open';
    const sample = SAMPLES[risk === 'outbound' ? scenarioId : risk][lang];
    return `<section class="risk-item ${resolved ? 'resolved' : ''}" aria-labelledby="risk-${risk}">
      <div class="risk-heading"><span class="status-dot" aria-hidden="true"></span><h4 id="risk-${risk}">${esc(tr(`risk_${risk}`))}</h4></div>
      <p>${esc(tr(`riskText_${risk}`))}</p>
      <details class="training-sample"><summary>${esc(tr('inspectSample'))}</summary><p><strong>${esc(tr('sampleSource'))}</strong><br>${esc(sample.source)}</p><p><strong>${esc(tr('sampleProposal'))}</strong><br>${esc(sample.proposal)}</p></details>
      ${resolved ? `<p class="success-text">✓ ${esc(tr(risk === 'outbound' ? 'distributionApproved' : 'remediated'))}</p>` : task.stage === 'review' ? `
      <label class="check-label"><input type="checkbox" id="confirm-${risk}" data-confirm="resolve-${risk}"><span>${esc(tr(`confirm_${risk}`))}</span></label>
      <button id="resolve-${risk}" data-risk="${risk}" disabled>${esc(tr(`resolve_${risk}`))}</button>` : `<span class="small muted">${esc(tr('riskWaiting'))}</span>`}
    </section>`;
  }).join('');
}
function assignment(task) {
  const editable = task.stage === 'intake';
  const value = drafts[draftKey()] ?? { brief: task.brief[lang], acceptance: task.acceptance[lang] };
  return `<section class="assignment"><div class="section-heading"><h3>${esc(tr('brief'))}</h3><span class="mono">${esc(task.id.toUpperCase())}</span></div>
    ${editable ? `<form id="brief-form"><p id="brief-help" class="small muted">${esc(tr('briefHelp'))}</p>
      <label for="brief-input">${esc(tr('scope'))}</label><textarea id="brief-input" name="brief" minlength="20" maxlength="2000" required aria-describedby="brief-help">${esc(value.brief)}</textarea>
      <label for="acceptance-input">${esc(tr('acceptance'))}</label><textarea id="acceptance-input" name="acceptance" minlength="20" maxlength="2000" required aria-describedby="brief-help">${esc(value.acceptance)}</textarea>
      <button type="submit">${esc(tr('save'))}</button></form>` : `<dl class="brief-read"><dt>${esc(tr('scope'))}</dt><dd>${esc(task.brief[lang])}</dd><dt>${esc(tr('acceptance'))}</dt><dd>${esc(task.acceptance[lang])}</dd></dl>`}
    </section>`;
}
function handoff(task) {
  if (task.stage === 'intake') return '';
  const heading = task.stage === 'plan' ? 'planTitle' : task.stage === 'build' ? 'buildTitle' : task.stage === 'review' ? 'reviewTitle' : 'publishedTitle';
  const release = session().events.findLast(e => e.type === 'advance' && e.taskId === task.id && e.data.to === 'publish')?.data.release;
  return `<section class="handoff"><div class="eyebrow">${esc(tr('handoff'))} / ${esc(tr('simulated'))}</div><h3>${esc(tr(heading))}</h3>
    ${task.stage === 'plan' ? `<ol>${messages[lang].planSteps.map(step => `<li>${esc(step)}</li>`).join('')}</ol>` : `<p>${esc(tr(task.stage === 'build' ? 'buildText' : task.stage === 'review' ? 'reviewText' : 'publishedText'))}</p>`}
    ${task.stage === 'publish' ? `<dl class="snapshot"><dt>${esc(tr('approved'))}</dt><dd>✓</dd><dt>${esc(tr('estimate'))}</dt><dd>${esc(money(release?.estimateCents ?? estimateCents(session())))}</dd><dt>${esc(tr('cap'))}</dt><dd>${esc(money(release?.capCents ?? session().maxSpendCents))}</dd></dl>` : ''}</section>`;
}
function eventOwner(event) {
  if (event.type !== 'advance') return role('Human');
  return role(event.data.to === 'publish' ? 'Publisher' : ROLES[event.data.from]);
}
function eventDetail(event) {
  if (event.type === 'set_budget') return money(event.data.cents);
  if (event.type === 'resolve_risk') return tr(`risk_${event.data.risk}`);
  if (event.type === 'advance') return tr(event.data.to);
  return '';
}
function render() {
  const focusId = document.activeElement?.id;
  const state = session(), task = currentTask(), scenario = SCENARIOS.find(s => s.id === scenarioId);
  const stageIndex = STAGES.indexOf(task.stage), reasons = blockers(state, task.id);
  const inReview = task.stage === 'review', published = task.stage === 'publish';
  const ready = canPublish(state, task.id), estimate = estimateCents(state);
  document.documentElement.lang = lang;
  document.title = `Agent Ops Clinic · ${tr('tagline')}`;
  root.innerHTML = `
    <a href="#lab" class="skip-link">${esc(tr('skip'))}</a>
    <header class="topbar"><a class="brand" href="#top" aria-label="Agent Ops Clinic"><svg viewBox="0 0 32 32" aria-hidden="true"><path d="M4 24V8h10v16m4-16h10v16H18M1 16h7m16 0h7m-17 0h4"/></svg><span>Agent Ops <strong>Clinic</strong><small>${esc(tr('tagline'))}</small></span></a>
      <nav aria-label="${esc(tr('lab'))}"><a href="#lab">${esc(tr('lab'))}</a><a href="#lesson">${esc(tr('lesson'))}</a><a href="#audit">${esc(tr('audit'))}</a></nav>
      <div class="language" role="group" aria-label="${esc(tr('langLabel'))}"><button id="lang-en" data-lang="en" lang="en" aria-pressed="${lang === 'en'}">EN</button><button id="lang-vi" data-lang="vi" lang="vi" aria-pressed="${lang === 'vi'}">VI</button></div>
    </header>
    <main id="top">
      <section class="hero" aria-labelledby="hero-title"><div><p class="eyebrow">${esc(tr('eyebrow'))}</p><h1 id="hero-title">${tr('hero')}</h1><p class="hero-intro">${esc(tr('intro'))}</p><a class="text-link" href="#lesson">${esc(tr('start'))} <span aria-hidden="true">↗</span></a></div>
        <aside class="hero-note"><div class="handoff-art" aria-hidden="true"><span>P</span><i>→</i><span>B</span><i>→</i><span>R</span><i>→</i><span class="human-gate">✓</span></div><p>${esc(tr('heroNote'))}</p><small>${esc(tr('heroSub'))}</small><div class="offline"><span class="status-dot"></span>${esc(tr('local'))}</div></aside>
      </section>
      <div class="simulation-banner"><span class="tag">${esc(tr('simulation'))}</span><p>${esc(tr('simNote'))}</p></div>
      <div id="lab" class="lab-layout" tabindex="-1">
        <aside class="context-column"><p class="eyebrow">${esc(tr('choose'))}</p><h2>${esc(tr('scenario'))}</h2><div class="scenario-list" role="group" aria-label="${esc(tr('scenario'))}">${SCENARIOS.map((s,i) => `<button id="scenario-${s.id}" class="scenario-button" data-scenario="${s.id}" aria-pressed="${s.id === scenarioId}"><span class="mono">0${i+1}</span><span><strong>${esc(s.title[lang])}</strong><small>${esc(s.subtitle[lang])}</small></span><span aria-hidden="true">↗</span></button>`).join('')}</div>
          <div class="context-note"><span class="eyebrow">${esc(scenario.client[lang])}</span><p>${esc(scenario.context[lang])}</p></div>
          <div class="queue-heading"><h3>${esc(tr('tasks'))}</h3><span class="mono">03</span></div><p class="small muted">${esc(tr('selectTask'))}</p><div class="task-list">${state.tasks.map((t,i) => `<button id="task-${t.id}" class="task-button" data-task="${t.id}" aria-pressed="${t.id === task.id}"><span class="task-number mono">${String(i+1).padStart(2,'0')}</span><span><strong>${esc(t.title[lang])}</strong><small>${esc(tr(t.stage))} <span aria-hidden="true">·</span> ${esc(money(t.cents))}</small></span></button>`).join('')}</div><p class="seed-note">${esc(tr('seeded'))}</p>
        </aside>
        <section class="workspace" aria-labelledby="task-title"><p class="eyebrow">${esc(tr('workbench'))}</p><div class="task-title"><h2 id="task-title" tabindex="-1">${esc(task.title[lang])}</h2><span class="stage-badge">${esc(tr(task.stage))}</span></div>
          <div class="phase-track" aria-label="${esc(tr('lifecycle'))}">${['phase1','phase2','phase3'].map((key,i) => `<span class="${(stageIndex === 0 ? 0 : stageIndex < 3 ? 1 : 2) === i ? 'active' : ''}"><b>0${i+1}</b> ${esc(tr(key))}</span>`).join('')}</div>
          <ol class="lifecycle" aria-label="${esc(tr('lifecycle'))}">${STAGES.map((stage,i) => `<li class="${i < stageIndex ? 'past' : i === stageIndex ? 'current' : ''}" ${i === stageIndex ? 'aria-current="step"' : ''}><span class="step-node">${i < stageIndex ? '✓' : i+1}</span><strong>${esc(tr(stage))}</strong><small>${esc(role(ROLES[stage]))}</small></li>`).join('')}</ol>
          <div class="owner-strip"><div><span>${esc(tr('owner'))}</span><strong>${esc(role(ROLES[task.stage]))}</strong></div><div><span>${esc(tr('taskCost'))}</span><strong>${esc(money(task.cents))}</strong></div><div><span>${esc(tr('simulation'))}</span><strong>${task.risks.length ? `${task.risks.length} ${esc(tr('riskCount'))}` : esc(tr('noRisk'))}</strong></div></div>
          <p class="coach-note"><span aria-hidden="true">↳</span> ${esc(tr(`${task.stage}Tip`))}</p>
          ${handoff(task)}${assignment(task)}
          <div class="task-actions">${published ? `<p class="success-text">✓ ${esc(tr('done'))}</p>` : `<button class="primary" id="advance" ${inReview && !ready ? 'disabled aria-describedby="blocker-list"' : ''}>${esc(tr(['nextPlan','nextBuild','nextReview','nextPublish'][stageIndex]))}<span aria-hidden="true"> →</span></button>`}${inReview ? `<button id="request-changes">${esc(tr('revise'))}</button>` : ''}</div>
          ${notice ? `<p class="notice">${esc(notice)}</p>` : ''}
        </section>
        <aside class="control-column" aria-label="${esc(tr('release'))}"><p class="eyebrow">${esc(tr('gates'))}</p><section class="release-panel"><div class="section-heading"><h2>${esc(tr('release'))}</h2><span class="lock-icon" aria-hidden="true">⌑</span></div><p class="gate-status ${ready || published ? 'success-text' : ''}">${esc(tr(published ? 'done' : ready ? 'ready' : 'blocked'))}</p>
          ${riskPanel(task)}
          <section class="approval-block"><h3>${esc(tr(task.reviewApproved ? 'approved' : 'pending'))}</h3>${!task.reviewApproved && inReview ? `<label class="check-label"><input id="confirm-review" type="checkbox" data-confirm="approve-review" ${task.risks.some(r => task.decisions[r] === 'open') ? 'disabled' : ''}><span>${esc(tr('reviewConfirm'))}</span></label><button id="approve-review" disabled>${esc(tr('approve'))}</button>` : ''}<p class="small muted">${esc(tr('approvalHelp'))}</p></section>
          ${!published ? `<div class="blockers"><h3>${esc(tr('blockersTitle'))}</h3><ul id="blocker-list">${reasons.length ? reasons.map(r => `<li>${esc(tr(r.startsWith('risk_') ? `${r}_reason` : r))}</li>`).join('') : `<li class="success-text">✓ ${esc(tr('ready'))}</li>`}</ul></div>` : ''}
        </section>
        <section class="budget-panel"><div class="section-heading"><h2>${esc(tr('budget'))}</h2><span class="mono">USD</span></div><div class="budget-total"><strong>${esc(money(estimate))}</strong><span>${esc(tr('estimate'))}</span></div><meter min="0" max="${Math.max(estimate,state.maxSpendCents,1)}" value="${estimate}" low="${state.maxSpendCents}" high="${state.maxSpendCents}" optimum="0" aria-label="${esc(tr('estimate'))}"></meter><p class="budget-status ${budgetOK(state) ? 'success-text' : 'danger-text'}">${esc(tr(budgetOK(state) ? 'remaining' : 'exceeded'))} · ${esc(money(Math.abs(state.maxSpendCents-estimate)))}</p>
          <form id="budget-form"><label for="budget-input">${esc(tr('cap'))}</label><div class="budget-input-row"><input type="number" id="budget-input" name="budget" min="0" max="1000" step="0.01" required value="${state.maxSpendCents/100}" aria-describedby="budget-help"><button type="submit">${esc(tr('setCap'))}</button></div></form><p id="budget-help" class="small muted">${esc(tr('budgetHelp'))}</p><details><summary>${esc(tr('costBreakdown'))}</summary><dl class="cost-list">${[['Planner',.2],['Builder',.6],['Reviewer',.2],['Publisher',0]].map(([name,ratio])=>`<div><dt>${esc(role(name))}</dt><dd>${esc(money(Math.round(task.cents*ratio)))}</dd></div>`).join('')}</dl></details>
        </section></aside>
      </div>
      <section id="lesson" class="lesson-section" aria-labelledby="lesson-title"><div class="lesson-header"><div><p class="eyebrow">${lang === 'en' ? 'THE FIELD GUIDE' : 'SỔ TAY THỰC HÀNH'} / EN + VI</p><h2 id="lesson-title">${esc(tr('lessonTitle'))}</h2><p>${esc(tr('lessonIntro'))}</p></div><span class="lesson-duration mono">20<span>MIN</span></span></div><div class="lesson-steps">${messages[lang].lessonSteps.map((s,i)=>`<article class="lesson-step"><span class="mono">${esc(s.time)}</span><div><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p>${s.check ? `<p class="lesson-check">${esc(s.check)}</p><details><summary>${lang === 'en' ? 'Discussion prompt' : 'Gợi ý thảo luận'}</summary><p>${esc(s.debrief)}</p></details>` : ''}</div></article>`).join('')}</div><a class="text-link" href="./README.md">${esc(tr('notes'))} ↗</a></section>
      <section id="audit" class="audit-section" aria-labelledby="audit-title"><div class="audit-heading"><div><p class="eyebrow">${esc(tr('audit'))} / ${esc(tr('local'))}</p><h2 id="audit-title">${esc(tr('auditTitle'))}</h2><p class="small muted">${esc(tr('auditIntro'))}</p></div><div class="audit-actions"><button id="export">${esc(tr('export'))} <span aria-hidden="true">↓</span></button><button id="reset" class="quiet-danger">${esc(tr('reset'))}</button></div></div><ol class="event-log">${[...state.events].reverse().map(e=>`<li><span class="event-id mono">${String(e.id).padStart(3,'0')}</span><div><strong>${esc(messages[lang].events[e.type])}${eventDetail(e) ? ` · ${esc(eventDetail(e))}` : ''}</strong><small>${e.taskId ? esc(state.tasks.find(t=>t.id===e.taskId).title[lang])+' · ' : ''}${esc(eventOwner(e))}</small></div><time class="mono" datetime="${esc(e.at)}" title="${esc(new Date(e.at).toLocaleString(lang === 'vi' ? 'vi-VN':'en-US'))}">${esc(localTime(e.at))}</time></li>`).join('')}</ol></section>
    </main><footer><div><strong>Agent Ops Clinic</strong><p>${esc(tr('footer'))}</p></div><span class="storage-status">${esc(tr(storageIssue || 'storage'))}</span></footer>
    <dialog id="reset-dialog" aria-labelledby="reset-title" aria-describedby="reset-description"><h2 id="reset-title">${esc(tr('resetTitle'))}</h2><p id="reset-description">${esc(tr('resetText'))}</p><form method="dialog"><button value="cancel" autofocus>${esc(tr('cancel'))}</button><button id="confirm-reset" class="danger" value="confirm">${esc(tr('confirmReset'))}</button></form></dialog>`;
  if (focusId) (document.getElementById(focusId) ?? document.getElementById('task-title'))?.focus({ preventScroll: true });
}
root.addEventListener('input', event => {
  if (event.target.closest('#brief-form')) {
    const form = document.querySelector('#brief-form');
    drafts[draftKey()] = { brief: form.elements.brief.value, acceptance: form.elements.acceptance.value };
  }
});
root.addEventListener('change', event => {
  if (event.target.dataset.confirm) document.getElementById(event.target.dataset.confirm).disabled = !event.target.checked;
});
root.addEventListener('submit', event => {
  if (event.target.id === 'brief-form') {
    event.preventDefault();
    operate('save_brief', { lang, brief: event.target.elements.brief.value, acceptance: event.target.elements.acceptance.value });
  }
  if (event.target.id === 'budget-form') {
    event.preventDefault();
    const value = event.target.elements.budget.value;
    if (!/^\d+(\.\d{1,2})?$/.test(value) || Number(value) > 1000) { announce('invalid_budget'); render(); return; }
    operate('set_budget', { cents: Math.round(Number(value) * 100) });
  }
});
root.addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button || button.disabled) return;
  if (button.dataset.lang) { lang = button.dataset.lang; notice = ''; persist(); render(); }
  else if (button.dataset.scenario) { scenarioId = button.dataset.scenario; notice = ''; session(); persist(); render(); }
  else if (button.dataset.task) { selected[scenarioId] = button.dataset.task; notice = ''; persist(); render(); }
  else if (button.dataset.risk) {
    const risk = button.dataset.risk;
    operate('resolve_risk', { risk, decision: risk === 'outbound' ? 'approved' : 'remediated', confirmed: document.querySelector(`#confirm-${risk}`).checked });
  } else if (button.id === 'advance') {
    if (currentTask().stage === 'intake' && drafts[draftKey()] && (drafts[draftKey()].brief !== currentTask().brief[lang] || drafts[draftKey()].acceptance !== currentTask().acceptance[lang])) { announce('unsaved'); render(); }
    else operate('advance');
  } else if (button.id === 'approve-review') operate('approve_review', { confirmed: document.querySelector('#confirm-review').checked });
  else if (button.id === 'request-changes') operate('request_changes');
  else if (button.id === 'export') {
    const blob = new Blob([JSON.stringify({ ...exportSession(session()), disclosure: 'Educational simulation. No agents, security scans, payments or external publishing executed.' }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob), a = document.createElement('a');
    a.href = url; a.download = `agent-ops-clinic-${scenarioId}.json`; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000); announce('exported'); render();
  } else if (button.id === 'reset') document.querySelector('#reset-dialog').showModal();
  else if (button.id === 'confirm-reset') {
    event.preventDefault();
    document.querySelector('#reset-dialog').close();
    sessions = {}; selected = {}; drafts = {}; storageIssue = '';
    try { localStorage.removeItem(KEY); } catch { storageIssue = 'storageError'; }
    announce('resetDone'); render(); document.querySelector('#reset').focus();
  }
});
render();

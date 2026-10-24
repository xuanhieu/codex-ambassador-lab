// All money is integer US cents. Nothing here calls an agent, scanner or payment API.
export const VERSION = 1;
export const STAGES = ['intake', 'plan', 'build', 'review', 'publish'];
export const ROLES = { intake: 'Human', plan: 'Planner', build: 'Builder', review: 'Reviewer + Human', publish: 'Publisher' };
export const RISK_KEYS = ['secrets', 'pii', 'outbound'];
const pair = (en, vi) => ({ en, vi });
const task = (id, title, stage, cents, risks, brief, acceptance) => ({ id, title, stage, cents, risks, brief, acceptance });
export const SCENARIOS = [
  {
    id: 'launch', title: pair('Startup launch', 'Ra mắt startup'), subtitle: pair('Ship a useful first impression.', 'Ra mắt với giá trị thiết thực.'),
    client: pair('Fieldnote · a fictional scheduling startup', 'Fieldnote · startup lịch hẹn hư cấu'),
    context: pair('A two-person team has a Friday demo. Delegate the website, keep credentials private, and approve every invitation.', 'Nhóm hai người có buổi demo thứ Sáu. Giao việc làm web, giữ kín thông tin đăng nhập và duyệt từng đợt gửi lời mời.'),
    maxSpendCents: 3000,
    tasks: [
      task('launch-page', pair('Build the early-access page', 'Làm trang đăng ký sớm'), 'intake', 1200, ['secrets'], pair('Create a static early-access page for Fieldnote. Use a fictional product description; collect no email addresses.', 'Tạo trang đăng ký sớm tĩnh cho Fieldnote. Dùng mô tả sản phẩm hư cấu; không thu thập địa chỉ email.'), pair('Works at 390px; keyboard accessible; no live form; no credentials in the handoff.', 'Hiển thị tốt ở 390px; dùng được bằng bàn phím; không có biểu mẫu gửi thật; không có thông tin đăng nhập trong bàn giao.')),
      task('launch-faq', pair('Explain the product clearly', 'Giải thích sản phẩm rõ ràng'), 'build', 600, [], pair('Draft an FAQ covering scheduling, data retention and the pilot scope.', 'Soạn FAQ về lịch hẹn, thời hạn lưu dữ liệu và phạm vi thử nghiệm.'), pair('Six honest answers; no unsupported privacy or performance promises.', 'Sáu câu trả lời trung thực; không hứa hẹn vô căn cứ về riêng tư hoặc hiệu năng.')),
      task('launch-invite', pair('Prepare the launch invitation', 'Chuẩn bị lời mời ra mắt'), 'review', 800, ['outbound'], pair('Draft a launch invitation for a fictional list of 12 pilot customers. Do not send it.', 'Soạn lời mời cho danh sách 12 khách hàng thử nghiệm hư cấu. Chưa gửi.'), pair('Clear opt-out language, approved audience and a human-reviewed final draft.', 'Có hướng dẫn từ chối nhận tin, đối tượng được duyệt và bản cuối do người duyệt.'))
    ]
  },
  {
    id: 'community', title: pair('Community nonprofit', 'Tổ chức cộng đồng'), subtitle: pair('Serve people. Protect their stories.', 'Phục vụ cộng đồng. Giữ kín câu chuyện.'),
    client: pair('Open Table · a fictional community kitchen', 'Bếp Mở · bếp cộng đồng hư cấu'),
    context: pair('Volunteers need a bilingual site before Saturday. Public opening hours are safe to share; volunteer contact details are not.', 'Tình nguyện viên cần web song ngữ trước thứ Bảy. Có thể công bố giờ mở cửa; thông tin liên hệ tình nguyện viên cần được bảo vệ.'),
    maxSpendCents: 1800,
    tasks: [
      task('community-hours', pair('Make the opening-hours page', 'Làm trang giờ mở cửa'), 'intake', 700, [], pair('Create a bilingual page with fictional meal times and step-free access information.', 'Tạo trang song ngữ với giờ phục vụ hư cấu và thông tin lối đi không bậc thang.'), pair('Times agree in both languages; directions work without a map service.', 'Giờ giống nhau ở cả hai ngôn ngữ; chỉ đường không cần dịch vụ bản đồ.')),
      task('community-roster', pair('Prepare a volunteer handoff', 'Chuẩn bị bàn giao tình nguyện viên'), 'review', 900, ['pii'], pair('Turn a fictional volunteer roster into a public shift guide. The sample includes personal contact fields.', 'Chuyển lịch tình nguyện viên hư cấu thành hướng dẫn ca trực công khai. Mẫu có trường liên hệ cá nhân.'), pair('Remove names, phone numbers and email fields; share role names and shift times only.', 'Xóa tên, số điện thoại và email; chỉ chia sẻ vai trò và giờ ca trực.')),
      task('community-news', pair('Draft the neighborhood update', 'Soạn tin khu phố'), 'plan', 500, ['outbound'], pair('Prepare a notice for a fictional neighborhood newsletter, with no automatic sending.', 'Chuẩn bị thông báo cho bản tin khu phố hư cấu, không tự động gửi.'), pair('Human approves wording, recipient group and distribution timing.', 'Người phụ trách duyệt nội dung, nhóm người nhận và thời điểm gửi.'))
    ]
  },
  {
    id: 'creator', title: pair('Solo educator', 'Nhà sáng tạo giáo dục'), subtitle: pair('One lesson. Two thoughtful versions.', 'Một bài học. Hai bản dịch chỉn chu.'),
    client: pair('Small Steps · a fictional learning studio', 'Bước Nhỏ · studio học tập hư cấu'),
    context: pair('A solo creator is preparing an EN/VI lesson on spreadsheets. Delegate the draft and translation; keep editorial control.', 'Nhà sáng tạo độc lập chuẩn bị bài học EN/VI về bảng tính. Giao việc soạn và dịch; giữ quyền biên tập.'),
    maxSpendCents: 2200,
    tasks: [
      task('creator-lesson', pair('Outline a practical lesson', 'Lập dàn ý bài học thực tế'), 'intake', 800, [], pair('Outline a 10-minute spreadsheet lesson using a fictional café budget.', 'Lập dàn ý bài học bảng tính 10 phút với ngân sách quán cà phê hư cấu.'), pair('One learning goal, three worked examples and an answer key with checked arithmetic.', 'Một mục tiêu học tập, ba ví dụ có lời giải và đáp án đã kiểm tra phép tính.')),
      task('creator-translate', pair('Adapt the lesson into Vietnamese', 'Chuyển bài học sang tiếng Việt'), 'build', 700, [], pair('Translate the café-budget lesson using Vietnamese number formatting and familiar terms.', 'Dịch bài học ngân sách quán cà phê, dùng định dạng số và thuật ngữ quen thuộc ở Việt Nam.'), pair('Preserve formulas; explain new terms; a human checks both language versions.', 'Giữ nguyên công thức; giải thích thuật ngữ mới; người biên tập kiểm tra cả hai bản.')),
      task('creator-post', pair('Prepare the lesson announcement', 'Chuẩn bị thông báo bài học'), 'review', 600, ['outbound'], pair('Draft a bilingual social announcement. Keep both versions local until approved.', 'Soạn thông báo song ngữ cho mạng xã hội. Giữ cả hai bản ở máy cho đến khi được duyệt.'), pair('No invented learning outcomes; human approves channel, audience and copy.', 'Không bịa kết quả học tập; người phụ trách duyệt kênh, đối tượng và nội dung.'))
    ]
  }
];
export class ClinicError extends Error { constructor(code) { super(code); this.code = code; } }
const fail = code => { throw new ClinicError(code); };
export const scenarioById = id => SCENARIOS.find(s => s.id === id) ?? fail('invalid_scenario');
function baseState(scenarioId) {
  const s = scenarioById(scenarioId);
  return { version: VERSION, scenarioId, maxSpendCents: s.maxSpendCents, tasks: s.tasks.map(t => ({
    ...structuredClone(t), reviewApproved: false, decisions: Object.fromEntries(t.risks.map(r => [r, 'open']))
  })), events: [] };
}
export function createSession(scenarioId = 'launch', at = new Date().toISOString()) {
  const state = baseState(scenarioId);
  state.events.push({ id: 1, at, type: 'session_started', data: { scenarioId } });
  return state;
}
export const estimateCents = state => state.tasks.reduce((sum, t) => sum + t.cents, 0);
export const budgetOK = state => estimateCents(state) <= state.maxSpendCents;
export function blockers(state, taskId) {
  const t = state.tasks.find(t => t.id === taskId);
  if (!t) return ['invalid_task'];
  const reasons = [];
  if (t.stage !== 'review' && t.stage !== 'publish') reasons.push('needs_review_stage');
  if (!t.reviewApproved) reasons.push('needs_human_review');
  for (const r of t.risks) if (t.decisions[r] === 'open') reasons.push(`risk_${r}`);
  if (!budgetOK(state)) reasons.push('over_budget');
  return reasons;
}
export const canPublish = (state, taskId) => blockers(state, taskId).length === 0 && state.tasks.find(t => t.id === taskId)?.stage === 'review';
export function dispatch(state, command, at = new Date().toISOString()) {
  if (!Number.isFinite(Date.parse(at))) fail('invalid_timestamp');
  if (state.events.length >= 5000) fail('event_limit');
  const next = structuredClone(state);
  const data = command.data ?? {};
  const t = next.tasks.find(t => t.id === command.taskId);
  if (command.type !== 'set_budget' && !t) fail('invalid_task');
  if (command.type === 'set_budget') {
    if (!Number.isSafeInteger(data.cents) || data.cents < 0 || data.cents > 100000) fail('invalid_budget');
    next.maxSpendCents = data.cents;
  } else if (command.type === 'advance') {
    const index = STAGES.indexOf(t.stage);
    if (index < 0 || index >= STAGES.length - 1) fail('invalid_transition');
    if (t.stage === 'review' && !canPublish(state, t.id)) fail('publish_blocked');
    t.stage = STAGES[index + 1];
  } else if (command.type === 'approve_review') {
    if (t.stage !== 'review') fail('needs_review_stage');
    if (data.confirmed !== true) fail('explicit_approval_required');
    if (t.risks.some(r => t.decisions[r] === 'open')) fail('unresolved_risks');
    if (t.reviewApproved) fail('already_approved');
    t.reviewApproved = true;
  } else if (command.type === 'resolve_risk') {
    if (t.stage !== 'review') fail('needs_review_stage');
    if (!t.risks.includes(data.risk)) fail('invalid_risk');
    const expected = data.risk === 'outbound' ? 'approved' : 'remediated';
    if (data.decision !== expected || data.confirmed !== true) fail('explicit_approval_required');
    if (t.decisions[data.risk] !== 'open') fail('already_resolved');
    t.decisions[data.risk] = expected;
    t.reviewApproved = false;
  } else if (command.type === 'request_changes') {
    if (t.stage !== 'review') fail('needs_review_stage');
    t.stage = 'build';
    t.reviewApproved = false;
    t.decisions = Object.fromEntries(t.risks.map(r => [r, 'open']));
  } else if (command.type === 'save_brief') {
    if (t.stage !== 'intake') fail('brief_locked');
    if (!['en', 'vi'].includes(data.lang) || typeof data.brief !== 'string' || typeof data.acceptance !== 'string' ||
        data.brief.trim().length < 20 || data.acceptance.trim().length < 20 || data.brief.length > 2000 || data.acceptance.length > 2000) fail('invalid_brief');
    t.brief[data.lang] = data.brief.trim();
    t.acceptance[data.lang] = data.acceptance.trim();
  } else fail('invalid_command');
  const eventData = command.type === 'advance' ? { from: state.tasks.find(task => task.id === t.id).stage, to: t.stage, ...(t.stage === 'publish' ? { release: { estimateCents: estimateCents(next), capCents: next.maxSpendCents, reviewApproved: t.reviewApproved, decisions: structuredClone(t.decisions) } } : {}) } : structuredClone(data);
  next.events.push({ id: next.events.length + 1, at, type: command.type, ...(command.taskId ? { taskId: command.taskId } : {}), data: eventData });
  return next;
}
export function exportSession(state) {
  return { version: VERSION, scenarioId: state.scenarioId, events: structuredClone(state.events) };
}
export function replaySession(record) {
  if (!record || record.version !== VERSION || !Array.isArray(record.events) || !record.events.length || record.events.length > 5000) fail('invalid_record');
  const first = record.events[0];
  if (first.type !== 'session_started' || first.id !== 1 || first.data?.scenarioId !== record.scenarioId || !Number.isFinite(Date.parse(first.at))) fail('invalid_record');
  let state = createSession(record.scenarioId, first.at);
  for (const event of record.events.slice(1)) {
    if (event.id !== state.events.length + 1 || !Number.isFinite(Date.parse(event.at))) fail('invalid_record');
    state = dispatch(state, event, event.at);
  }
  return state;
}
export function resetSession(state, at = new Date().toISOString()) { return createSession(state.scenarioId, at); }

/* Pure policy functions shared by the browser and Node tests. */
const DrillPolicy = (() => {
  function evaluate(action, data) {
    const invalid = {verdict:'block', missing:[], reason:'invalid'};
    if (!action || typeof action !== 'object' || Array.isArray(action)) return invalid;
    const flags = ['outside_scope','raw_secret','untrusted_instruction'];
    if (typeof action.category !== 'string' || !Object.hasOwn(data.matrix, action.category) ||
        !Array.isArray(action.approvals) || action.approvals.some(r => typeof r !== 'string' || !Object.hasOwn(data.roles,r)) ||
        new Set(action.approvals).size !== action.approvals.length || flags.some(f => typeof action[f] !== 'boolean')) return invalid;
    for (const flag of flags) if (action[flag]) return {verdict:'block', missing:[], reason:flag};
    const missing = data.matrix[action.category].required.filter(r => !action.approvals.includes(r));
    return {verdict:missing.length ? 'escalate':'proceed',missing,reason:missing.length ? 'missing_approval':'approved'};
  }
  function grade(action, decision, route, data) {
    const expected = evaluate(action, data);
    const passed = decision === expected.verdict && Array.isArray(route) && route.every(r => typeof r === 'string') &&
      new Set(route).size === route.length && JSON.stringify([...route].sort()) === JSON.stringify([...expected.missing].sort());
    return {passed,...expected};
  }
  return {evaluate,grade};
})();
if (typeof module !== 'undefined') module.exports = DrillPolicy;

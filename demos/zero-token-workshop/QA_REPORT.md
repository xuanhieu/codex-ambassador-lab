# N003 QA — 2026-10-25

- Product: Codex Zero-Token Workshop.
- Unit: 15/15 Node tests PASS; Chrome 390/1440px checks 6 interactions each and zero viewport overflow.
- Browser runner: `agents/BR-20261025-QUICKWIN/QA/browser_qa.mjs`; screenshots for two real Chrome viewports stored under the role's screenshots directory.
- Gate: simulated-only side effects; local fixture content; no API credential input; no network to model providers.
- Learner experience: first screen shows the product purpose, navigation, next action, test evidence and a status message. The user can start without setting an account.
- Negative paths covered: invalid prompt, dangerous approval, incorrect diff or missing test, credential-like sample, wrong authorization gate.
- Known gaps: manual VoiceOver user testing, real learner interviews and fully automated browser screenshot pixel diff are not completed. Do not claim WCAG certification or an actual GitHub PR.

- N120 coverage: JSON passport round-trip, invalid order, oversized input, and prototype-safe allowlisted import; simple UI download and file selector. No original typed prompts are exported.

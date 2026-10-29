# Prompt Injection Defense Clinic

Offline educational clinic for **prompt injection defense**. Four simulated attacker-vs-document scenarios teach trust boundaries, human review outcomes, and safe handling. No real customer data, no API calls, no secrets.

## What is runnable

- Static site: `index.html`, `styles.css`, `app.js`.
- Pure logic module exported from `app.js` (CommonJS in Node, global `PIClinic` in browser).
- Tests: `tests/test.cjs` using `node:test`.

## Run

```bash
cd demos/prompt-injection-clinic
python3 -m http.server 4199 --bind 127.0.0.1
```

Open http://127.0.0.1:4199. Or open `index.html` directly.

Run tests:

```bash
node --test tests/test.cjs
node --check app.js
```

## Scenarios

1. **S1** — Report with hidden command: sanitize and summarize.
2. **S2** — Attachment requests forwarding: block entirely.
3. **S3** — Document requests secret disclosure: block entirely.
4. **S4** — Document triggers dangerous tool: escalate to human.

## Features

- VI/EN toggle (default VI).
- Trust-boundary diagram with trusted vs untrusted zones.
- Real functional controls: scenario selector, decision buttons, safety checks, run, replay, export.
- Keyboard support: Enter to run, arrows to switch scenarios.
- Input validation on scenario/decision/checks.
- Local replay log in `localStorage` (scenario IDs and decisions only).
- Responsive single-screen layout (mobile/tablet/desktop).

## Privacy & safety

- No network requests (`connect-src 'none'`).
- No real attacks, no real customer data, no secret collection.
- Replay log stores only scenario IDs and decisions.
- Educational simulation only; not a security certification.

## Limitations

- Deterministic fixtures; not an AI model evaluation.
- No real tool execution or permission enforcement.
- Human review is simulated; cannot authenticate real approvers.
- Browser session memory retains replay log until cleared.

## Try it with Codex / Thử với Codex

Work on a fresh clone or a throwaway branch. Start Codex in `demos/prompt-injection-clinic` with `codex` and paste:

```text
Read app.js (validateChecks and evaluate) and tests/test.cjs. Add ONE new node:test case to tests/test.cjs proving that when checks is an array instead of an object, validateChecks returns error "invalid_checks" and evaluate() for scenario S1 returns status "INVALID_INPUT" with flags.invalidChecks === true. Do not change app.js or any other file. Run `node --test tests/test.cjs`, then show me the diff and explain in two sentences why strict input validation matters in a prompt-injection lesson.
```

Check it yourself from the same folder:

```bash
node --test tests/test.cjs
git diff --stat
```

A good result: 29 tests, 29 pass, 0 fail (28 before the change); `git diff --stat` lists only `tests/test.cjs`. If Codex edits `app.js`, reject the change and ask again.

## Status

Live: https://codex.xuanhieu.org/demos/prompt-injection-clinic/. `node --test tests/test.cjs`: 28/28 pass (2026-10-29, Node v24.22.1).

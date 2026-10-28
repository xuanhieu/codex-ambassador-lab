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

## Honest completion note

Implemented in one focused pass. Tests must be run locally; results recorded after execution. No deployment or push performed.

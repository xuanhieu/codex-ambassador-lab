# N110 — Agent Approval Escalation Drill

Independent VI/EN offline security workshop: 12 synthetic agent tasks across six permission categories. The user selects **Proceed / Escalate / Block** and missing approval roles, then receives a deterministic explanation. This app never calls production endpoints or executes the action being evaluated.

**Provenance:** a Codex CLI specialist agent produced the initial page, JavaScript and Python policy scaffold and 12 synthetic examples. That agent later stopped because its workspace ran out of credits. The supervising assistant completed the Vietnamese localization, working frontend logic, tests, browser QA and publication. Don't credit the initial agent with these later changes.

## Run

Open `index.html` through the local static server:

```bash
cd demos/approval-drill
python3 -m http.server 4181 --bind 127.0.0.1
```

Open http://127.0.0.1:4181. The page has no network dependencies. Data remains in browser localStorage.

**Policy CLI:** `python3 src/policy.py --scenario A06` (should yield `block`, reason `untrusted_instruction`).

**Tests:** `python3 -m unittest discover -s tests -p 'test_*.py' -q`, `node --test tests/test_policy.cjs`. Check with Chrome at 390, 768, 1440 px.

## Teaching flow (20 minutes)

1. 0–3 min: distinguish read-only, external send, sensitive write, delete, deploy, and secrets.
2. 3–9 min: solve A01–A05; check whether the required human roles are missing, not whether the user likes the request.
3. 9–14 min: run A06 and A08. An untrusted document's instructions and out-of-scope operations must be blocked **even with receipts**.
4. 14–18 min: solve A09–A12 including deployment promotion and raw secret disclosure.
5. 18–20 min: reset/replay one failed scenario and explain why no UI decision grants actual machine permissions.

## Key distinctions

- `proceed`: all necessary synthetic approvals are already present, no hard stop.
- `escalate`: missing at least one human role for an otherwise permitted action.
- `block`: outside scope, raw secret disclosure, untrusted prompt injection or malformed instructions.
- Synthetic pre-attached approvals are assumed valid only within these teaching fixtures. The app cannot authenticate a real approver or access a real system.
- Completing scenarios is only a training score, not production security certification.

## Privacy

No API token, login, analytics, server storage, external request or real action execution. Stored state consists only of scenario IDs and learners' choices. Browser output is populated with safe DOM text nodes, not HTML from user inputs.

## Links

- Dashboard: https://codex.xuanhieu.org/dashboard/#workspace
- Academy: https://codex.xuanhieu.org/demos/codex-academy/
- Public drill (after verified release): https://codex.xuanhieu.org/demos/approval-drill/

No link is evidence of official OpenAI affiliation, certification or acceptance.

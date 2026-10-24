# Codex CLI Onboarding Diagnostic — Vietnamese / English Workshop

A self-contained, **read-only** teaching asset for first-time Codex builders. It is an independent educational project, not an OpenAI product or endorsement.

## Two ways to learn

1. **Visual synthetic workshop:** serve this folder over HTTP and open index.html. It has three fixture scenarios (ready, new student, restricted computer), bilingual explanations and three checklist exercises.
2. **Real local CLI:** run cli_onboarding.py on your own computer. It checks only installed executable versions and whether a selected folder is a Git repository. It does not ask for credentials or call Codex/Cloudflare APIs.

**Critical difference:** The website runs pre-recorded fixture data only. It cannot verify your actual computer.

## Quick start

Python 3.9+ is recommended. All runtime dependencies use the Python standard library.

From a local terminal:

    cd demos/cli-onboarding
    python3 cli_onboarding.py --demo new-student --lang vi
    python3 cli_onboarding.py --demo ready --lang en --json
    python3 cli_onboarding.py --root ../agent-ops-clinic --json
    python3 -m unittest -v test_cli_onboarding.py

To view the interactive page:

    python3 -m http.server 4177 --bind 127.0.0.1

Then open http://127.0.0.1:4177/ in a browser.

The current deployed public educational page is reachable at:

https://codex-amb-xuanhieu.pages.dev/demos/cli-onboarding/

The Pages URL only counts as public after you personally verify successful deployment; do not represent a local file as publicly hosted.

## Checklist for a 20-minute session

| Minute | Lesson | Learner demonstration |
|---:|---|---|
| 0–3 | Real versus simulated execution | Identify which side requires no API key |
| 3–8 | Fixture environment tour | Show ready, new-student, restricted-device checks |
| 8–15 | Read-only local CLI | Run root check on a real Git repo and view JSON output |
| 15–20 | Verification and recovery | Run tests, name limitations, document one setup blocker |

## Three guided exercises / Ba bài thực hành

**1 — Diagnosis / Nhận diện (5m).** Select the new-student fixture and explain why the learner is not ready. The synthetic fixture has Git + Node but is missing Codex and a Git repository. Do not install tools automatically. Evidence: identify exactly two blockers.

**2 — Repro / Chạy thật (7m).** Open terminal inside your own demo Git repository and run:

    python3 /absolute/path/to/cli_onboarding.py --root . --json

If Codex or Node is missing, the command exits with code 2. That is a valid educational outcome, **not** a test-system failure. Never copy account tokens or local directory listings into your screenshot.

**3 — Tests / Kiểm chứng (8m).** Run:

    python3 -m unittest discover -s demos/cli-onboarding -p 'test_*.py'

Explain why version checks do not verify authentication, live subscription, available model or remote API access. Evidence: actual test pass/fail output, not fabricated results.

## What the scanner detects

- Git, Node.js, and Codex CLI found in local PATH.
- Safely extracted version strings (not full command output).
- Whether the selected folder is already inside a Git repository.
- Readiness for this specific workshop, not certification of Codex availability.
- Machine-readable JSON for practice and reproducible QA.

## Privacy, trust and limitations

- No HTTP requests, no OAuth/login checks, no subprocess shell execution, no writes outside intentional user-triggered sample downloads.
- No personal usernames, passwords, raw environment variables, path names, or token-shaped output in reports.
- The read-only CLI launches fixed safe diagnostic commands (git --version, node --version, codex --version, git rev-parse).
- A fake or malicious binary already placed on PATH is outside scope: verify trusted installations separately.
- The website is labelled synthetic, and fixture/CLI outputs are deliberately separate.
- Version presence is not proof of valid authorization, active OpenAI plan, current model availability or application eligibility.
- No educational artifact is a claim that the user has already been selected for the Codex Ambassadors program.

## Provenance and quality gate

- Source: cli_onboarding.py, with no third-party runtime dependencies.
- Tests: test_cli_onboarding.py (unit fixtures, sanitization, bad outputs, timeout, missing runtime, real temporary Git repository).
- Synthetic fixtures: fixtures.json generated from the Python scenario definitions.
- Manual checks: keyboard-only use, language toggle, mobile width, correct fixture message, correct download JSON.
- Appropriate next publication: publish this isolated learner asset; keep the private Ambassador application dashboard and unrelated evidence logs out of any public repo.

## Design brief

Register: Product. Scene: beginner Vietnamese builder following a 20-minute lab on a laptop or mobile browser. Direction: readable terminal workbench and explicit fixture integrity over decorative complexity. Color: restrained deep navy with mint status accent and warm attention accent. Type: native UI system + monospace terminal. Signature: four tool status cards next to an annotated synthetic terminal. Dials: variance 3, motion 2, density 5.

# Codex Ambassador Builder Lab

Independent practical apps and tutorials about Codex and ChatGPT. Source mirror is privacy-sanitized; not an official OpenAI product.

**Portfolio and live demos:** https://codex.xuanhieu.org/

## Interactive demo catalog

23 tested teaching demos, each with its own source folder.

| ID | Product | Source / public demo |
|---|---|---|
| N119 | Codex Path — Learning &amp; Career OS | [Source](./demos/codex-path/) · [Live](https://codex.xuanhieu.org/demos/codex-path/) |
| N002 | Codex CLI Onboarding | [Source](./demos/cli-onboarding/) · [Live](https://codex.xuanhieu.org/demos/cli-onboarding/) |
| N094 | Requirements Trace Matrix | [Source](./demos/requirements-trace/) · [Live](https://codex.xuanhieu.org/demos/requirements-trace/) |
| N097 | Sanitized Bug Report Kit | [Source](./demos/bug-report-kit/) · [Live](https://codex.xuanhieu.org/demos/bug-report-kit/) |
| N101 | EN–VI Code Glossary | [Source](./demos/vn-code-glossary/) · [Live](https://codex.xuanhieu.org/demos/vn-code-glossary/) |
| N107 | PR Evidence Receipt | [Source](./demos/pr-evidence-receipt/) · [Live](https://codex.xuanhieu.org/demos/pr-evidence-receipt/) |
| N118 | Codex × ChatGPT Academy | [Source](./demos/codex-academy/) · [Live](https://codex.xuanhieu.org/demos/codex-academy/) |
| O001 | Agent Ops Clinic | [Source](./demos/agent-ops-clinic/) · [Live](https://codex.xuanhieu.org/demos/agent-ops-clinic/) |
| N104 | Documentation Change Radar | [Source](./demos/docs-change-radar/) · [Live](https://codex.xuanhieu.org/demos/docs-change-radar/) |
| N108 | Evidence Chain Exporter | [Source](./demos/evidence-chain/) · [Live](https://codex.xuanhieu.org/demos/evidence-chain/) |
| N110 | Agent Approval Drill | [Source](./demos/approval-drill/) · [Live](https://codex.xuanhieu.org/demos/approval-drill/) |
| N111 | Screenshot Privacy Reviewer | [Source](./demos/screenshot-privacy-reviewer/) · [Live](https://codex.xuanhieu.org/demos/screenshot-privacy-reviewer/) |
| N112 | API Rate Limit Recovery Simulator | [Source](./demos/rate-limit-recovery/) · [Live](https://codex.xuanhieu.org/demos/rate-limit-recovery/) |
| N065 | README Quality Linter — 12 Checkpoints | [Source](./demos/readme-quality-linter/) · [Live](https://codex.xuanhieu.org/demos/readme-quality-linter/) |
| N074 | Workshop Curriculum Planner | [Source](./demos/workshop-curriculum-planner/) · [Live](https://codex.xuanhieu.org/demos/workshop-curriculum-planner/) |
| N003 | Zero-Token Workshop | [Source](./demos/zero-token-workshop/) · [Live](https://codex.xuanhieu.org/demos/zero-token-workshop/) |
| N006 | Human Review Checklist | [Source](./demos/human-review-checklist/) · [Live](https://codex.xuanhieu.org/demos/human-review-checklist/) |
| O004 | First Pull Request Clinic | [Source](./demos/first-pr-clinic/) · [Live](https://codex.xuanhieu.org/demos/first-pr-clinic/) |
| N106 | Issue-to-Workshop Converter | [Source](./demos/issue-to-workshop/) · [Live](https://codex.xuanhieu.org/demos/issue-to-workshop/) |
| N078 | Reproducibility Receipt | [Source](./demos/reproducibility-receipt/) · [Live](https://codex.xuanhieu.org/demos/reproducibility-receipt/) |
| N019 | Prompt Injection Defense Clinic | [Source](./demos/prompt-injection-clinic/) · [Live](https://codex.xuanhieu.org/demos/prompt-injection-clinic/) |
| N071 | Evidence-to-Story Portfolio Builder | [Source](./demos/evidence-story-builder/) · [Live](https://codex.xuanhieu.org/demos/evidence-story-builder/) |
| N058 | Workshop Accessibility Scorecard | [Source](./demos/workshop-accessibility-scorecard/) · [Live](https://codex.xuanhieu.org/demos/workshop-accessibility-scorecard/) |

## Run locally

From repository root:
    python3 -m http.server 4177 --bind 127.0.0.1

Open: http://127.0.0.1:4177/

Examples of offline tests:
    node --test demos/codex-path/tests/test_engine.cjs
    node --test demos/agent-ops-clinic/tests/domain.test.js
    node --test demos/screenshot-privacy-reviewer/tests/test_redaction.cjs

The public release contains only allowlisted files from Cloudflare Pages; local personal form data, secrets, browser sessions and raw private agent logs have not been included.

A standalone Codex Learning Path repository is separately available under the same GitHub account. Original vendor code retains its own licensing notices; no blanket license is implied.

For current Codex commands use official documentation at https://developers.openai.com/codex.

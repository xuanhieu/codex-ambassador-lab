# N065 — README Quality Linter

Local-first README linter for people learning open source, with 12 transparent scoring criteria, a safe synthetic example and actionable checklist export.

Start via the public page /demos/readme-quality-linter/ or serve this directory statically. Press Mẫu hoàn chỉnh to see a passing example, Mẫu cần sửa to inspect missing details, or paste a README / choose a small Markdown file.

No uploads, model API, tracking or persistent storage. Export includes findings, NOT the input README. Checks use word boundaries (so "commit" is not "MIT" and "latest" is not "test"), detect real ``` / ~~~ fenced blocks, and a README needs at least three ## sections to be rated strong. Pattern-based credential/path checks are not a substitute for manual security assessment.

Reproduce: node --test tests/test_core.cjs. Independent educational tool, not an OpenAI product or certification.

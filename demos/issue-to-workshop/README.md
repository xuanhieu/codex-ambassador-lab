# N106 — Issue-to-Workshop Converter

Independent, bilingual, **offline** 20-minute workshop generator from a synthetic bug/issue fixture. It does not contact GitHub, execute code, fix real issues, or send data anywhere.

## Run and learn

From this folder, use `python3 -m http.server 45106 --bind 127.0.0.1`, then open `http://127.0.0.1:45106/`. Or visit the verified public build after release, under `https://codex.xuanhieu.org/demos/issue-to-workshop/`.

1. Choose one of three **fictional** bug scenarios, click **Nạp mẫu**, and confirm that the content is synthetic.
2. Select your audience (beginner, developer, or mixed). Adjust fields carefully; empty or malformed input gives an inline error.
3. Click **Tạo kế hoạch 20 phút**. The application generates six timed stages (3+4+3+5+3+2 = 20 minutes), four audience-aware practice exercises, step-by-step reproduction, and review tasks.
4. Change the audience or issue after generating: old results disappear until regenerated. Toggle English for a bilingual workshop.
5. Export an actual TXT worksheet or structured JSON and inspect it. The clipboard button has a fallback for browsers blocking clipboard access.

## Purpose and safety constraints

Built as a reproducible education utility. The product **simulates** a workshop, not a GitHub issue or real patch. Do not paste credentials, private bug reports or production paths into public demos. The form rejects suspicious URLs and invalid issue structures. User-entered strings render as text nodes instead of executable HTML; CSP blocks external connections.

## Verified evidence (26 Oct 2026)

```sh
node --check core.js
node --check app.js
node --test tests/test_core.cjs
```

- 17/17 Node deterministic tests passed from the isolated source directory.
- Independent real Chrome CDP executed **8 checks per viewport across mobile 390px, tablet 768px and desktop 1440px = 24**: empty-form block, sample load, six stages, four exercises, stale results, bilingual switch, JSON export and no overflow/JS exceptions.
- QA screenshots and JSON run metadata: `agents/BR-20261026-QA/` in the private development workspace.
- Codex CLI generated core source in the isolated lane, but its final session failed with **model capacity**; coordinator independently supplied README/QA and verified all runnable files. Do not claim the Codex session ended successfully.

**Not yet verified:** actual lesson delivery with students, manual VoiceOver/screen reader conformance, actual GitHub PR creation, integration with production repositories or incident handling. This is not an OpenAI-certified curriculum.

## Connected learning apps

- [Codex Path](../codex-path/#start)
- [Zero-Token Workshop](../zero-token-workshop/)
- [Human Review Checklist](../human-review-checklist/)
- [First Pull Request Clinic](../first-pr-clinic/)

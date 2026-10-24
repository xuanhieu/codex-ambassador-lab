# N104 — Documentation Breaking-Change Radar

An independent, offline training utility for prioritizing documentation changes across two JSON metadata snapshots. It is **not** a live crawler and does not claim to observe the real Codex/OpenAI documentation today. The bundled example uses 14-before/14-after **synthetic documents and example.org URLs** to demonstrate a robust comparison workflow.

## Use locally

```bash
cd demos/docs-change-radar
python3 docs_radar.py fixtures/before.json fixtures/after.json --output fixtures/sample-report.json
python3 -m unittest discover -s tests -p 'test_*.py' -q
python3 -m http.server 4182 --bind 127.0.0.1
```

Open `http://127.0.0.1:4182/`. Each snapshot must contain stable `id`, `title`, HTTPS `url`, allowed `section`, precomputed `content_sha256`, `updated` date, and boolean `critical`.

Detection is deterministic: documents added or removed, changed titles, moved URLs, changed content hashes, reclassified sections and changes in criticality. Multiple events can belong to one document. Priority weights are a transparent **internal heuristic**, not a probability of actual breakage or official risk score.

## Live-document pipeline (not implemented by this app)

If connecting a legitimate documentation source in future:
1. Obtain and verify the provider's crawler permissions/robots/API terms.
2. Normalize stable document IDs and canonical URLs.
3. Compute hashes only of authorized content and avoid storing full copyrighted pages.
4. Export two snapshots and import into this tool. Review changes manually.
5. Treat metadata authenticity and content changes separately; a hash difference can reflect trivial formatting.

No background monitoring, API calls, scraped content, personal data or accounts are required for the demo.

## Workshop

In a 15-minute lesson, import two fixtures, filter the 5 Critical events, isolate moved URL DOC004 and deleted security/policy DOC012, export CSV/JSON, then show why document owners need to review the actual official page before publishing an updated tutorial.

- Dashboard: https://codex.xuanhieu.org/dashboard/#workspace
- Academy: https://codex.xuanhieu.org/demos/codex-academy/
- Local source: `demos/docs-change-radar/`

No official Codex/OpenAI affiliation or certification.

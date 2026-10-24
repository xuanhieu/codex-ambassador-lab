# N108 — Evidence Chain Exporter

Original independent educational utility. A reproducible SHA-256 hash chain over explicitly selected files verifies whether content matches an existing manifest.

**Not** a digital signature, legal chain of custody, publication proof, proof of authorship, timestamp authority, or authentication. Whoever can replace both the files and manifest can forge consistency. To establish identity, add separately verified signatures and a trusted timestamping/attestation system.

## Zero-install CLI

From the project directory:

```bash
python3 evidence_chain.py build --root fixtures/data --output fixtures/sample-manifest.json qa-summary.txt release-checklist.txt sample-note.txt
python3 evidence_chain.py verify --root fixtures/data --manifest fixtures/sample-manifest.json
python3 -m unittest discover -s tests -p 'test_*.py' -q
```

The manifest records each SHA-256 file content hash, byte size, its relative path, ordered previous-link digest and a SHA-256 digest over canonical JSON for each link. A single deterministic root hash binds the sequence. Files are sorted by relative path; rebuilding with the same bytes generates the same root. Verification compares the manifest's chain and the on-disk byte hashes. The CLI never sends files to a server.

Hard bounds: up to 250 explicitly listed files; 20 MB each; manifest 2 MB. Rejects `../` traversal, absolute paths, symlinked path components, duplicate paths, missing or oversized files, unknown manifest keys, malformed hashes, missing links, altered metadata and incorrect root.

## Browser

Run as a static site, or visit the Cloudflare Pages demo under `/demos/evidence-chain/`. Browser WebCrypto validates the same chain format and user-selected file bytes; no files are uploaded and no account/API token is needed. A built-in **synthetic** sample and downloadable manifest are provided. Selecting all three files in `fixtures/data` leads to `ALL VERIFIED`. Changing a byte produces a mismatch.

For actual verification, obtain the expected manifest through an independent trusted channel rather than from the same potentially compromised source. The browser-only sample does not establish identity or date.

## Audience / 15-minute workshop

Developers, release reviewers, program managers and students. Run the sample with three files; modify one byte; show hash mismatch; then modify the manifest too and explain why a trusted signer / authenticated manifest distributor is needed.

- Project source: Mac mini `demos/evidence-chain/`.
- Dashboard: https://codex.xuanhieu.org/dashboard/#workspace
- Other educational apps: https://codex.xuanhieu.org/demos/codex-academy/

No official endorsement or production audit claims.

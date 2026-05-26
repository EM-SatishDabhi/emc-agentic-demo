# `tests/` — EM Testing Taxonomy in Practice

Drop-in folder skeleton for the EM Testing Strategy. Every layer here maps 1:1 to a row in [`../TESTING.md`](../TESTING.md#the-taxonomy).

## Layout

```
tests/
├── contract/      ← Pact contracts (service-to-service API shape)
├── e2e/
│   ├── flows/         ← Critical user paths (per-PR, scoped to diff)
│   ├── regression/    ← "This broke once, never again" — grows with escapes
│   ├── smoke/         ← Post-deploy liveness, runs against real prod URL
│   └── chaos/         ← Resilience under partial failure
├── perf/          ← Latency / bundle / memory budgets
├── security/      ← Auth / CSRF / headers / OWASP probes
└── a11y/          ← WCAG 2.1 AA conformance (axe-core)
```

Unit and integration tests live next to source code (`src/**/*.test.ts`, `apps/api/tests/integration/`) — they're not in this folder.

## Where to put a new test

1. Identify the **single failure mode** the test catches.
2. Pick the **deepest layer that can catch it** — unit first, E2E last.
3. If the test needs the UI, a real network, or a state machine spanning >2 modules, it's E2E. Otherwise push down.
4. If you can't articulate the failure mode in one sentence, **don't write the test**. It's probably noise.

## CODEOWNERS

Each layer's folder routes review to its owner. The handles below are **placeholder patterns** — the starter pack `.github/CODEOWNERS` header explicitly says "Replace placeholder team handles below with real ones from your org." When you copy `tests/` into a consumer repo, edit `CODEOWNERS` to point at teams that actually exist in your GitHub org (EM convention is `@Engineersmind/em-<project>-<role>`).

- `tests/contract/` → your PQE team + your API/backend team
- `tests/e2e/flows/` → your PQE team + your frontend team
- `tests/e2e/regression/` → your PQE team (PQE owns the curation)
- `tests/e2e/smoke/` → your PQE team + your SRE/on-call team
- `tests/e2e/chaos/` → your SRE/resilience team
- `tests/perf/` → your SRE team + your frontend team
- `tests/security/` → your security team + your PQE team
- `tests/a11y/` → your frontend team + your PQE team

## When you copy this into a real repo

```bash
cp -r tests /path/to/your/repo/
```

Then:

1. Delete the layers your repo doesn't need (CLI tools skip `a11y/`, single-service repos skip `contract/`).
2. Add your repo's first specs per the matrix in `TESTING.md`.
3. Update root `CODEOWNERS` to match the table above.
4. Wire each layer into the appropriate CI workflow (per-PR, nightly, post-deploy) — see the per-layer READMEs below.

Every layer's README explains exactly what to put there and what *not* to.

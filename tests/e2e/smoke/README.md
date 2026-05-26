# `tests/e2e/smoke/` — Post-Deploy Liveness

## What goes here

The "is the deploy actually alive" set. Runs **against the deployed production URL** after every release. ≤5 specs, <30s total.

Examples:
- `GET /health` returns 200
- Login page renders
- API root responds with expected JSON shape
- Critical-tier landing page (e.g. dashboard) loads without errors
- A single happy-path read query works end-to-end

## What does NOT go here

- Functional correctness — that's `tests/e2e/flows/`
- Anything that mutates state (smokes run against real prod; no writes)
- Anything that needs auth credentials (use a public-or-canary user only)
- Edge cases — smoke is intentionally shallow
- Anything taking >5 seconds per spec

## When smoke fails — Phase 3+ behavior

> The flow below describes the **future** `.github/workflows/smoke-after-deploy.yml` workflow that lands in Phase 3 of the agentic-testing rollout. The workflow file is **not** part of the Phase 1 foundation. Until Phase 3 ships, smoke failures must be surfaced manually (PQE/SRE clicks through the failed run).

1. `smoke-after-deploy.yml` (future) files an `incident:prod-smoke` issue
2. PagerDuty / Slack webhook fires
3. AI triage (Phase 2, `qa-architect` Mode 4) correlates against the release tag's commit range, names suspect commits
4. SRE on-call decides: roll back, hotfix, or accept (rare)

## Layout

```
tests/e2e/smoke/
├── health.spec.ts
├── login-renders.spec.ts
├── api-root.spec.ts
└── critical-page-loads.spec.ts
```

## CI wiring

- **Triggered by:** `release.published` (release-please cuts the tag on `main`)
- **Runs against:** `PROD_URL` env var per repo
- **Failure action:** opens `incident:prod-smoke` labeled issue, posts to oncall channel
- **NOT a PR gate** — smokes are post-deploy by definition

## CODEOWNERS

`@Engineersmind/pqe @Engineersmind/sre`

## See also

- [TESTING.md → Production mirror replay](../../../TESTING.md#production-mirror-replay-phase-6--gated-on-legal) — the deeper version, Phase 6
- `smoke-after-deploy.yml` workflow (Phase 3)

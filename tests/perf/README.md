# `tests/perf/` — Performance Budgets

## What goes here

Tests that **enforce budgets**, not measure performance for its own sake. Each test asserts: "this thing is below the budget; alert if it crosses."

Three sub-layers:

### Frontend (Lighthouse + bundle-analyzer)

```
tests/perf/frontend/
├── lighthouse.spec.ts      ← LCP / FCP / TBT budgets per critical page
└── bundle-size.spec.ts     ← Asset KB budgets per app
```

### API (k6 load tests)

```
tests/perf/api/
├── policy-list.k6.js       ← p95 latency budget under N rps
├── quote-create.k6.js      ← p95 latency + error rate budget
└── ...
```

### Memory / resource budgets

```
tests/perf/memory/
└── api-steady-state.spec.ts  ← RSS budget after 1000 requests
```

## What does NOT go here

- Synthetic benchmarks of pure functions (not useful)
- Single-request latency assertions (use `tests/integration/` if you want functional latency checks)
- Load testing prod (use staging or dedicated load env only)

## Budgets

Each repo defines its own `.github/perf-budgets.yml` (no template ships in the starter pack today — consumer repos author it on adoption). Suggested shape:

```yaml
frontend:
  lcp_ms: 2500
  fcp_ms: 1800
  tbt_ms: 200
  bundle_kb:
    main: 350
    vendor: 800
api:
  endpoints:
    GET_/policy: { p95_ms: 200, p99_ms: 500, error_rate: 0.001 }
    POST_/quote: { p95_ms: 800, p99_ms: 2000, error_rate: 0.005 }
memory:
  api_rss_mb_after_1k_req: 512
```

Budgets are reviewed quarterly. **Don't relax a budget without tech-lead approval** — that's how SLOs erode.

## CI wiring

Split by sub-layer — they have different costs and run at different cadences:

| Sub-layer | Per-PR | Nightly | Pre-release |
|---|---|---|---|
| Lighthouse (frontend) | ✓ scoped to UI diff | ✓ full | hard gate via `release-readiness` |
| Bundle size | ✓ always (cheap) | — | hard gate |
| k6 load (API) | ✗ too expensive | ✓ full | hard gate |
| Memory (RSS, GC pressure) | ✗ | ✓ | warn only until baselines stable |

The same caveat as elsewhere in the pack: workflow files that enforce these cadences land in Phase 3+. Today this section is a contract, not running CI.

## CODEOWNERS

`@Engineersmind/devops @Engineersmind/frontend` (placeholder pattern — replace with your repo's real team handles per the starter pack `.github/CODEOWNERS` header).

## See also

- [TESTING.md → Risk-tier matrix](../../TESTING.md#required-tests-by-tier) — perf required for `critical` and `high` tier
- [k6 docs](https://k6.io/docs/) — API load testing
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)

# `tests/e2e/regression/` — "This Broke Once, Never Again"

## What goes here

The **curated** regression suite. Every test in this folder exists because **something escaped to production (or was caught at Step 8b PQE), and we never want it to recur**. Each test maps to a closed bug ticket.

This folder grows ~1 test per production escape. **It is not a first-line coverage layer** — it's a memory.

## What does NOT go here

- Tests added "just to bump E2E count" — go to `tests/e2e/flows/` if it's a user flow
- Tests for features that haven't shipped yet — write a unit/integration test instead
- Speculative "what if X breaks" tests — until X actually breaks, you don't know what to test
- Tests duplicated from `tests/e2e/flows/` — that's the suite that already covers the happy path

## When to add one

Add a test here when:

1. A bug was found in production OR by PQE at Step 8b
2. The fix PR is being prepared
3. The bug's failure mode is something a test could detect (not env-drift, not data-shape-only)

The test goes in *with the fix PR*. If a fix PR ships without a regression test, the bug *can come back* — and probably will.

## Naming

```
tests/e2e/regression/
├── emc-447-policy-uuid-rename.spec.ts
├── emc-512-quote-decimal-rounding.spec.ts
├── emc-589-stale-session-after-renewal.spec.ts
└── ...
```

Each filename includes the ticket reference. Each spec has a `// why:` block:

```typescript
// why: EMC-447. Auto-quote silently returned premium=NaN when policy.id
// was renamed to policy.uuid. Caught in prod after 4hrs. This test
// asserts a non-NaN premium on a known-good input.
test('auto-quote returns numeric premium for standard input', async ({ page }) => {
  // ...
});
```

## Quarterly audit

PQE reviews this folder every quarter. Tests are deleted when:

- The feature they cover has been removed (link to the removal PR)
- The code path they exercise no longer exists (verified via coverage map)
- They have flaked >5% over the prior quarter and the root cause has been fixed elsewhere

**Never delete a regression test just because "we haven't seen the bug in a while."** That's exactly when the suite is doing its job.

## CI wiring

- **Nightly:** full set, all browsers
- **Per-PR:** subset scoped to changed surface (Phase 4)
- **Always:** runs as part of "critical-tier-pinned regression" bundle for any `risk-tier:critical` PR

## CODEOWNERS

`@Engineersmind/pqe` — PQE owns the curation, period.

## See also

- [TESTING.md → Bug-fix tests](../../../TESTING.md#bug-fix-tests--risk-tier-aware) — when this folder gets a new entry vs. another layer
- [TESTING.md → Test suite hygiene](../../../TESTING.md#test-suite-hygiene) — quarterly audit process

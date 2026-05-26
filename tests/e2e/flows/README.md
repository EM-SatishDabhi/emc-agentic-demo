# `tests/e2e/flows/` — Critical User Paths

## What goes here

Playwright specs that exercise **end-to-end user paths** through the real UI, hitting a real (or container-real) backend. One spec per critical user flow.

Examples for an insurance app:
- Quote → bind → policy issuance
- File First Notice of Loss (FNOL) for a claim
- Renewal payment + confirmation
- Agent assignment + handoff

## What does NOT go here

- Edge-case enumeration — push down to unit
- Component visual assertions — push down to a11y / visual
- Single-API smoke checks — that's `tests/e2e/smoke/`
- "Every screen renders" tests — that's a11y coverage
- Anything that takes >30 seconds per test — refactor or push down

## Size budget

**<10 specs per repo. <3 minutes total runtime.** If you have 20+ E2E flow specs, you're using E2E to cover what unit/integration should be catching. Push down.

## When you find yourself wanting to add one

Ask:

1. Could a unit test cover this? (Usually yes for logic.)
2. Could an integration test cover this? (Usually yes for module boundaries.)
3. Does this test depend on the UI rendering correctly? (If no, push down.)
4. Is this a *user* path, or am I testing implementation? (If implementation, push down.)

Only when the answer to 1–3 is "no" and 4 is "yes" does an E2E flow test earn its slot.

## Layout

```
tests/e2e/flows/
├── quote.spec.ts           ← Quote → bind → policy issuance
├── fnol.spec.ts            ← File a claim end-to-end
├── renewal.spec.ts         ← Renewal flow with payment
└── ...
```

Each spec has a `// why:` comment at the top explaining the failure mode it catches.

```typescript
// why: regression guard for the auto-quote happy path.
// Previously broken when policy.id was renamed to policy.uuid in EMC-447.
test('agent can complete an auto-quote end to end', async ({ page }) => {
  // ...
});
```

## CI wiring

- **Per-PR:** runs the subset scoped to the diff (Phase 4 — scoped regression)
- **Nightly:** runs the full set across browser matrix
- **Local:** `pnpm exec playwright test tests/e2e/flows/`

## CODEOWNERS

`@Engineersmind/pqe @Engineersmind/frontend`

## See also

- [TESTING.md → The pyramid target](../../../TESTING.md#the-pyramid-target) — E2E share <25%
- [TESTING.md → Risk-tier matrix](../../../TESTING.md#required-tests-by-tier) — required for `critical` and `high` tier PRs

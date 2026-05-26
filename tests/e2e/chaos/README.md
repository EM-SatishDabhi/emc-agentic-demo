# `tests/e2e/chaos/` — Resilience Under Partial Failure

## What goes here

Tests that **characterize failure modes** — what the system does when a dependency degrades, not just when it fails outright.

Examples:
- Redis takes 5 seconds to respond — does the API time out cleanly or hang?
- Postgres connection pool exhausted — does the request queue or return 503?
- Third-party SMS provider returns 502 — does the outbound job retry with backoff?
- Network partition between API and worker — does the BullMQ job re-claim cleanly?
- Clock drift between services — does JWT validation tolerate it?

## What does NOT go here

- Bug-finding — chaos *characterizes* known failure modes, not discovers new ones
- Performance testing — that's `tests/perf/`
- "What happens when X is down" if you've never observed X going down — write the test after you've seen it

## Tools

- **Toxiproxy** for network-level chaos (latency, partition, bandwidth limits)
- **Custom fixtures** for dependency mocking (slow Redis, full DB pool, etc.)
- **Pumba** for container-level chaos in CI
- **Real failure injection** in nightly only, never per-PR

## Layout

```
tests/e2e/chaos/
├── redis-slow-response.spec.ts
├── postgres-pool-exhaustion.spec.ts
├── sms-provider-502.spec.ts
├── queue-worker-partition.spec.ts
└── ...
```

Each spec asserts the **expected degraded behavior**, not that everything works perfectly. Examples:

```typescript
// why: characterizes API behavior when Redis adds 5s latency.
// Expected: requests time out cleanly with 503, no hung connections.
test('API returns 503 within 6s when Redis latency >5s', async ({ }) => {
  await toxiproxy.addLatency('redis', 5000);
  const start = Date.now();
  const res = await fetch('/api/policy/list');
  expect(res.status).toBe(503);
  expect(Date.now() - start).toBeLessThan(6000);
});
```

## CI wiring

- **Nightly only** — chaos tests are expensive and flaky-by-nature
- **Pre-release** — full set runs as part of `release-readiness`
- **Never per-PR** — too slow, too noisy

## CODEOWNERS

`@Engineersmind/sre`

## See also

- [TESTING.md → Risk-tier matrix](../../../TESTING.md#required-tests-by-tier) — chaos required for `critical` tier
- [Toxiproxy docs](https://github.com/Shopify/toxiproxy)

# `tests/contract/` — Service-to-Service Contracts

## What goes here

Pact-style consumer-driven contract tests pinning the **API shape** between services. Producer side and consumer side both live here in the respective repos.

- Consumer test: "I call `POST /policy/quote` with `{vin, zip}` and expect `{quoteId, premium}`"
- Producer verifier: "Replay every consumer's recorded interaction and confirm the response shape still matches"

## What does NOT go here

- Testing your service's internals — that's `src/**/*.test.ts` or `tests/integration/`
- End-to-end user flows — that's `tests/e2e/flows/`
- Load testing the API — that's `tests/perf/`
- Auth-boundary security — that's `tests/security/`

## When to write one

Every cross-service call gets a contract. If your service:

- Calls another EM service (internal API), OR
- Is called by another EM service, OR
- Calls a third-party API that has SLA implications (Stripe, Twilio, Auth0, etc.)

…it needs a contract test.

## When to skip

- Single-service repo with no cross-service calls
- Phase 1 of EM rollout — contract infra ships in Phase 5

## Layout

```
tests/contract/
├── consumer/      ← Tests we author against services we depend on
│   └── *.pact.spec.ts
├── producer/      ← Verifications: replay every consumer's pact against us
│   └── verify.spec.ts
└── pacts/         ← Generated artifacts published to broker (.gitignored, CI publishes)
```

## CI wiring (Phase 5)

- **Per-PR (consumer):** generate the pact, publish to broker tagged with branch
- **Per-PR (producer):** pull all consumer pacts tagged `main`, verify against the producer's HEAD
- **Broker:** Pact Broker (self-hosted or PactFlow) — URL configured per repo via `PACT_BROKER_URL` secret

## See also

- [TESTING.md → Risk-tier matrix](../../TESTING.md#required-tests-by-tier) — contracts required for `critical` and `high` tiers
- [Pact docs](https://docs.pact.io/) — Pact concepts and SDK reference

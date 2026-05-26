# EngineersMind Testing Strategy

The contract every EM repo follows for testing. Ships with the agentic-workflow starter pack and is read by every contributor — human and AI — before they write a line of test code.

> **Status:** Phase 1 (foundation). Workflows that enforce this land in later phases. Until then, this doc is a normative spec that PRs are expected to follow on best effort.

> **A note on team handles.** Throughout this doc and the `tests/` READMEs, references like `@Engineersmind/pqe` or `@Engineersmind/security` are **placeholder patterns** — the starter pack's [`.github/CODEOWNERS`](./.github/CODEOWNERS) header says exactly this: *"Replace placeholder team handles below with real ones from your org."* When you drop the starter pack into a consumer repo, edit `CODEOWNERS` to point at teams that actually exist in your GitHub org (EM convention is `@Engineersmind/em-<project>-<role>`, e.g. `@Engineersmind/em-emc-ai-core-leads`).

> **A note on metrics.** The targets named below (escape rate <3%, MTTD <5 min, postmortem coverage trending to 0, etc.) are **aspirational until the measurement infrastructure lands**. Phase 1 establishes the contract; the data pipeline that surfaces these metrics on a dashboard is a separate workstream tracked outside this rollout. Don't treat the targets as enforced today — treat them as where the strategy is heading.

> **A note on language/framework.** The `tests/` folder skeleton and per-layer READMEs use TypeScript-flavor conventions (Vitest for unit, Playwright for E2E, Pact for contracts, axe-core for a11y, k6 for perf load). Repos in other stacks should adapt the layer model to their language's idiomatic tools — the layers and risk tiers stay; the framework names change.

---

## Why this exists

EM ships AI-augmented applications across regulated industries — insurance, healthcare, wealth management. The cost of a production escape is not a bug ticket; it's a compliance event. The cost of test theater is wasted runtime, brittle suites, and false confidence.

The strategy is built around five honest assumptions:

1. **Most production bugs are not coverage failures.** They are spec gaps, integration drift, and data-shape surprises. Forcing "one test per bug fix" produces test theater.
2. **All code is not equal.** A copy-edit and an auth-middleware rewrite need radically different rigor.
3. **Tests rot.** Suite hygiene is a continuous job, not a one-time setup.
4. **The pyramid matters.** E2E catches the most attention; unit tests prevent the most bugs.
5. **AI shifts testing left.** The biggest leverage is in test design *before* code, not test triage *after* code.

Everything below follows from those.

---

## The taxonomy

Ten test layers, each with a single explicit responsibility. Tests written outside their layer's responsibility are rejected in review.

| Layer | Owns | Lives in | Runs when | Target |
|---|---|---|---|---|
| **Unit** | Pure-function correctness, branch coverage | `src/**/*.test.ts` (Vitest) | Pre-commit, per-PR | <2s total, ≥80% line cov on critical-tier code |
| **Integration** | Module-to-module wiring with real DB/Redis, no external network | `apps/api/tests/integration/`, `apps/web/tests/integration/` | Per-PR | <60s, every Prisma model touched |
| **Contract** | Service-to-service API shape pinning | `tests/contract/` (Pact) | Per-PR on producer; broker-driven check for consumers | 100% of cross-service calls |
| **E2E flow** | Critical user paths through real UI | `tests/e2e/flows/` (Playwright) | Per-PR, scoped to diff | <10 critical-flow specs per repo, target <3min total |
| **E2E regression** | Curated "this broke once, never again" suite | `tests/e2e/regression/` | Nightly + on-demand | Grows ~1 test per production escape, audited quarterly |
| **Smoke** | "Is the deploy alive at all" | `tests/e2e/smoke/` | Post-deploy against real prod URL | <30s, ≤5 specs |
| **Chaos** | Resilience under partial failure | `tests/e2e/chaos/` | Nightly + pre-release | Network partition, slow Redis, DB lock, dependency timeout |
| **Performance** | Latency / bundle / memory budgets | `tests/perf/` (k6, Lighthouse, bundle-analyzer) | Per-PR + nightly | p95 budget per critical-tier endpoint, bundle KB budget per app |
| **Security** | Auth / CSRF / headers / secrets-in-code | `tests/security/` + CodeQL + Dependabot | Per-PR + weekly | OWASP Top 10 surface coverage |
| **Accessibility** | WCAG 2.1 AA conformance | `tests/a11y/` (axe-core via Playwright) | Per-PR on UI changes | Zero violations on critical-tier pages |

Each layer **should** have a CODEOWNERS entry routing changes to its owning team. The starter pack's [`.github/CODEOWNERS`](./.github/CODEOWNERS) provides placeholder entries for each `tests/<layer>/` path; consumer repos edit those to point at real team handles in their org.

### What each layer is *not* for

| Layer | Don't use it for |
|---|---|
| Unit | Anything that needs a database, network, or wall-clock time |
| Integration | UI assertions, full user journeys, snapshots of generated HTML |
| Contract | Testing your own code's internals; only the API shape at the boundary |
| E2E flow | Edge-case enumeration (push down to unit); style assertions (push down to a11y) |
| E2E regression | First-line coverage; this folder only accepts tests that exist because something escaped |
| Smoke | Functional correctness; only liveness |
| Chaos | Bug-finding; only failure-mode characterization |
| Performance | Functional correctness; only the budget |
| Security | Coverage theater (one CSRF test per endpoint isn't useful); focus on auth boundaries and OWASP top 10 |
| Accessibility | Visual regression (separate concern); only WCAG conformance |

### The pyramid target

Healthy repos hold roughly a **70:20:10** ratio (unit : integration : E2E-and-above). Repos drift on their own — UI work pulls toward E2E, integration tests get written because unit feels hard. The pyramid health report (Phase 7) flags inversion. AI proposes pushing E2E tests down to integration when the same coverage is achievable.

Inversion alert thresholds:
- E2E share > 25% → warning
- E2E share > 40% → required PQE review on every new E2E test

---

## Risk-tier classification

Every PR carries a `risk-tier:*` label. The tier is set by:

1. **Path rules** (deterministic baseline) — defined per repo in `.qa-architect/risk-tiers.yml` (template + illustrative defaults ship at [`skills/qa-architect/.qa-architect-template/risk-tiers.yml`](./skills/qa-architect/.qa-architect-template/risk-tiers.yml); consumer repos bootstrap it on adoption)
2. **AI proposal** (Phase 2) — Claude reads the diff + linked Story, proposes a tier
3. **Dev confirms or escalates** before requesting review

### The four tiers

| Tier | What it means | Example paths |
|---|---|---|
| **critical** | Auth, payment, PII, regulated data, billing, RBAC, anything that breaks → compliance event | `**/auth/**`, `**/payment/**`, `**/claim/**`, `**/encryption/**`, `**/audit/**` |
| **high** | Core business flows, user-visible functionality, public API surface | `apps/api/src/modules/**`, `apps/web/src/features/**`, `packages/validation/**` |
| **medium** | Internal admin tools, low-traffic flows, dev tooling | `apps/admin/**`, `scripts/**`, `tools/**` |
| **low** | Cosmetic, docs, marketing copy, branding assets | `docs/**`, `*.md`, `**/branding/**`, `**/marketing/**` |

When path rules disagree (a PR touches both `**/auth/**` and `docs/**`), **the highest tier wins**.

### Required tests by tier

The matrix every PR is held against:

| Tier | Unit | Integration | Contract | E2E flow | Chaos | A11y | Perf | Security |
|---|---|---|---|---|---|---|---|---|
| **critical** | required | required | required | required | required | required (UI) | required | required |
| **high** | required | required | required | required | — | required (UI) | required | spot check |
| **medium** | required | required | — | optional | — | required (UI) | — | spot check |
| **low** | required (if logic) | — | — | — | — | — | — | — |

Reads as: a PR labeled `risk-tier:critical` cannot merge to `dev` unless every "required" column above has a corresponding test exercising the changed code path. AI-assisted gap detection (Phase 3) checks this.

### Bug-fix tests — risk-tier-aware

When PQE finds a bug at Step 8b, the fix PR must include a test **at the layer most likely to catch a recurrence** — not necessarily E2E. The rule:

- Logic / pure-function bugs → unit test
- Module-boundary / wiring bugs → integration test
- API shape / breaking-change bugs → contract test
- User-journey / state-machine bugs → E2E flow + add to regression
- Resilience / timeout bugs → chaos test
- Auth / RBAC bugs → security test
- Layout / contrast / keyboard-nav bugs → a11y test

If PQE judges the bug doesn't need a new test (legitimately rare — env drift, one-off data issue), apply `test-not-applicable` with a comment explaining why. Audited by `area:pqe` weekly.

---

## Shift-left test planning — the agentic killer feature

This is where AI moves the needle, and it sits **before any code is written**.

### The flow

1. **Story is opened** (Step 2 of the agentic-coding workflow) with acceptance criteria.
2. **Claude generates `test-plan.md`** as a sub-issue or PR attachment, listing 8–15 specific scenarios across the relevant tiers, classified by risk tier.
3. **PQE reviews the plan**, edits, accepts. Plan is committed to the Story.
4. **Dev writes tests AND code against the accepted plan** (Steps 6 — TDD-RED, then 7 — TDD-GREEN).
5. **PR review (Step 10) checks**: does the implementation cover every scenario in the accepted plan? `plan-to-test fidelity` metric.

### Why this matters more than every CI gate combined

CI gates catch the bugs you knew to test for. Shift-left planning catches the **scenarios you wouldn't have thought to test for at all**. AI is uniquely good at enumeration; humans are uniquely good at judgment. The combination is the win.

### Where the skill lives

`~/.claude/skills/qa-architect/` ships with the starter pack (Phase 2). Modes:

| Mode | Trigger | Output |
|---|---|---|
| `plan-from-ac` | Story issue opened | `test-plan.md` proposal |
| `classify-risk-tier` | PR opened | Tier label proposal |
| `propose-regression-test` | Bug-fix PR with no test | Test stub at correct layer |
| `triage-failure` | Nightly or scoped suite fails | Flake-vs-real-regression classification |
| `hygiene-report` | Weekly cron | Decay / flake / dead-test report |

---

## Promotion gates — scoped, not blanket

The wrong shape: "last night's nightly was green, so we can promote."
The right shape: "for this PR's changed surface, the targeted regression bundle passes."

### How scoped regression works

1. PR opens → diff analysis lists changed modules
2. Reverse coverage map (built per repo, maintained per release) lists which tests exercise those modules
3. The targeted bundle = that subset + always-run smoke + always-run critical-tier-pinned regression
4. Promotion gate checks the targeted bundle passed on the PR's head commit

A 1-line copy-edit runs a tiny bundle in seconds. An auth refactor runs the full critical bundle in minutes. Nightly is informational.

### What replaces "nightly gates promotions"

Promotion gates (`staging-readiness`, `release-readiness`) continue to check labels (`qa:passed`, `uat:passed`) — and also check that the **scoped regression on the changed surface passed**. Nightly remains an information radiator; failures still file issues but no longer block tomorrow's deploys directly.

---

## Production mirror replay (Phase 6 — gated on legal)

The deepest agentic feature. Defer until Fylix and 1-2 others are running steady on the rest of the strategy.

1. Capture sanitized prod traffic (1% sample, PII stripped per `apps/api/src/lib/pii.ts` encryption rules)
2. Replay against the staging build pre-promotion
3. AI classifies diffs vs. baseline: new error rates, latency drift, response shape changes, 4xx rate change
4. PQE reviews the classified diff, signs off or blocks promotion

This catches things no curated test ever will: the long tail of real user inputs.

**Compliance prerequisite:** legal + compliance officer sign-off on PII sanitization pipeline before the first capture runs. Different regimes (HIPAA for healthcare repos, state insurance regulators for EMC) have different sanitization requirements. Treat as a separate workstream.

---

## Test suite hygiene

Suites rot. The hygiene job is what keeps them honest.

### Weekly AI report

Runs in every repo with this pack installed. Produces a `QA_HYGIENE.md` PR each Monday. Sections:

- **Flaky tests** — pass rate <95% over rolling 30 days. Propose fix or delete.
- **Dead tests** — exercise code paths no commit has touched in 6 months. Propose delete.
- **Stale acknowledgments** — `acknowledged-by-pqe` labels >14 days old without resolution. Escalate.
- **Pyramid inversion warnings** — E2E share creeping past target.
- **Coverage gaps from postmortems** — for each `incident:prod-smoke` or `area:qa-found` issue closed last week, AI asks "did a test exist that should have caught this?" and answers.

PQE merges or rejects per item. Hygiene is not a gate — it's a rolling forcing function.

---

## Metrics — the honest set

Posted to the dev portal per repo, refreshed weekly. These tell you whether testing is *working*, not whether the workflow is *running*.

| Metric | Definition | Target |
|---|---|---|
| **Escape rate** | bugs found in prod ÷ total bugs found, trailing 30 days | <3% |
| **Mean time to detect** | prod incident start → first internal alert | <5 min for critical-tier |
| **Postmortem test coverage** | % of prod incidents where a test *should have caught* it but didn't (existed-but-disabled, was-flaky, or never-existed) | trending toward 0 |
| **Pyramid ratio** | unit : integration : E2E test counts | 70 : 20 : 10 ± 10pp |
| **Flake rate** | % of test runs where the same test passed and failed within 24h | <1% |
| **Plan-to-test fidelity** | % of accepted `test-plan.md` scenarios that have a corresponding committed test in the implementing PR | >95% |
| **--admin merges** | PRs that bypassed required checks via admin override | trending down |

The first three are the brutal ones. They tell the truth. The vanity metrics (test count, line coverage, CI green rate) are not on this list because they're easy to game.

---

## Roles and ownership

| Role | Owns | Reviews |
|---|---|---|
| **Dev** | Writing tests at every layer required by their PR's risk tier | Implementation + test correctness |
| **PQE** | Test plans, exploratory probes, suite curation, hygiene reports, regression test acceptance | `test-plan.md`, `QA_HYGIENE.md` PRs, regression test additions, `test-not-applicable` waivers |
| **Compliance Officer** | PII handling in tests, audit trail of test waivers, production mirror sanitization sign-off | Anything touching `tests/security/` + production mirror policy |
| **Tech Lead** | Risk-tier definitions per repo, pyramid health, escape rate trend | `risk-tiers.yml` PRs, weekly metrics review |
| **AI (Claude / Copilot)** | Plan-from-AC drafts, risk-tier proposals, test stubs, hygiene reports, failure triage | Never the final say — always proposes, never approves |

---

## Rollout sequencing

| Phase | What | Owner | Duration |
|---|---|---|---|
| **1. Foundation (this doc)** | TESTING.md, `tests/` skeleton, risk-tier matrix, metrics defined | This repo | 1-2 weeks |
| **2. Agentic test planning** | `qa-architect` skill — plan-from-AC, classify-risk-tier (no enforcement yet) | This repo + skill | 4-6 weeks |
| **3. Tier-aware enforcement** | CI gates require per-tier test coverage. `test-plan.md` required for `risk-tier:critical` PRs | Per-repo workflows | 2 weeks |
| **4. Scoped regression** | Replace blanket "all nightly green" with diff-scoped bundles | Per-repo workflows | 2 weeks |
| **5. Contract testing** | Pact broker, producer/consumer gates | Org infra | 2-3 months (cross-team) |
| **6. Production mirror** | Sanitized prod replay against staging | Org infra + compliance | 6+ months (gated on legal) |
| **7. Continuous hygiene** | Weekly `QA_HYGIENE.md` PR per repo | AI cron | Always-on after Phase 2 |

**Pilot order:** Fylix mid-June 2026, taxonomy + plan-from-AC only (Phases 1 + 2). Each subsequent phase adds after Fylix stabilizes on the prior one. **Do not ship all phases at once.**

---

## FAQ

**Q: My PR is a one-line typo fix. Do I really need to add tests?**
A: No. Risk-tier:low + no logic change = no required tests. Path-based classification will pick `risk-tier:low` for `*.md` and copy-text changes automatically. Don't game it — actual logic changes mislabeled as `low` will get caught in review.

**Q: We don't have time to build a `test-plan.md` for every Story.**
A: Phase 2 is opt-in initially. Plans are only *required* for `risk-tier:critical` Stories. For `high` and below, they're proposed but not enforced. The AI generation cost is ~30s; the human review cost is the real question. PQE should set their own scope based on team bandwidth.

**Q: What if our repo doesn't have a UI? Do we still need a11y?**
A: No. A11y is required only for repos that ship UI. The matrix above reads "required (UI)" — meaning required only when the layer applies. CLI tools, schedulers, daemons → skip a11y.

**Q: What if the test required at a tier doesn't make sense for this change?**
A: PQE can apply `test-not-applicable` with an explanatory comment. Audited weekly. Not a routine escape hatch — meant for genuine "the test would be meaningless" cases (e.g. changing log-level enums).

**Q: Why isn't visual regression in the taxonomy?**
A: It overlaps too much with a11y and bundle-size budgets. Visual diff tools (Percy, Chromatic) catch a lot of false positives. Phase 7 may add `tests/visual/` if the postmortem analysis shows we're missing visual regressions. Not Phase 1.

**Q: What about mutation testing?**
A: Not in Phase 1. It's a "coverage of coverage" tool; valuable in mature suites, premature in suites still being built. Revisit after Phase 4.

**Q: Where does load testing fit?**
A: Performance layer. `tests/perf/` includes both Lighthouse (frontend) and k6 (API load). Load tests are nightly only — not per-PR — because they're expensive.

**Q: Who decides if a test is "honest"?**
A: PQE during review. Heuristics: does the test assert behavior, not implementation? Would deleting the production code make it fail? Is there a `// why` comment explaining what failure mode it catches? If any answer is no, the test is candidate for deletion.

---

## See also

- [`README.md`](./README.md) — starter pack overview
- [`tests/`](./tests/) — per-layer folder skeletons with README scaffolding
- [Engineersmind/agentic-workflow-training](https://github.com/Engineersmind/agentic-workflow-training) — training portal. [Module 06](https://github.com/Engineersmind/agentic-workflow-training/blob/main/06-testing-strategy.md) is the trainee-facing explanation of this spec.
- [`pull_request_template.md`](./.github/pull_request_template.md) — PR template referencing risk tiers

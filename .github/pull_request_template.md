<!--
Branch:  feature|bug|task|hotfix|refactor / EM-Author / EMC-NNN-short-description
Target:  dev   (squash merge)         hotfix → main + back-merge to dev
Title:   feat(scope): EMC-NNN human-readable summary
-->

## Summary

<!-- 1-3 sentences. What changed and why. The "why" matters more than the "what" — the diff already shows the what. -->

Closes #

## Workflow gates

<!-- Check each gate as it passes. CI enforces the same checks; this checklist makes the human confirmation explicit. -->

### Step 4-5 — Plan
- [ ] PLAN.md exists for this work (or change is trivial — single-file < 20 LOC)
- [ ] Plan was reviewed (human or `/gsd:list-phase-assumptions`)

### Step 6-6b — Tests
- [ ] Failing tests written before implementation (TDD-RED)
- [ ] All tests now pass (TDD-GREEN)
- [ ] Coverage on changed files ≥ project threshold

### Step 8 — Integration
- [ ] Playwright / API integration tests cover the user-facing path
- [ ] Manual smoke test against `dev` env (UI changes only)

### Step 8b — PQE exploratory pass _(runs after this PR merges)_
> No pre-merge action required. On merge to `dev`, `auto-qa-on-merge` will label this PR `qa:ready`
> (or `qa:skip` if the diff is docs/deps-only) and create the PQE Test Plan issue automatically.
> PQE tests against the deployed `dev` environment, then labels `qa:passed` or `qa:failed`. The
> dev → staging promotion will fail if any PR is missing `qa:passed` / `qa:skip` / `hotfix`.
- [ ] If this PR needs an *immediate* PQE eyes-on before merge (high-risk, security, etc.),
      manually label `qa:ready` now — that suppresses the auto-trigger and routes to PQE pre-merge.

### Step 9 — NFR compliance
- [ ] No new accessibility violations (axe / Lighthouse)
- [ ] Performance budget respected (bundle size, Core Web Vitals)
- [ ] Touches PII / auth / payments → reviewed by security owner
- [ ] Outbound SMS path → TCPA consent + DNC check verified
- [ ] AI-generated content path → guardrails verified (no insurance advice)

### Step 11 — Security
- [ ] Dependabot / CodeQL / Snyk findings on this branch are clean or triaged
- [ ] No secrets in diff (gitleaks / trufflehog clean)

### Step 12 — Docs
- [ ] CLAUDE.md updated if conventions changed
- [ ] README / module docs updated if public API changed
- [ ] Migration / runbook entry added (DB schema, config, infra changes)

### Step 12b — UAT (applies before staging → main)
- [ ] PR will be labeled `uat:passed` after PQE walks AC scenarios on staging
- [ ] High-risk stories: stakeholder walkthrough scheduled — see PQE Test Plan
- [ ] If `uat:waived`: justification written in CHANGELOG, Tech Lead approved

## Test plan

<!-- How a reviewer should verify. Be specific — paste commands and expected output. -->

- [ ]
- [ ]

## Rollout / rollback

<!-- Default for most PRs: "Standard squash to dev → staging promotion → main." Override only for risky changes. -->

- **Rollout:** Standard squash to `dev`
- **Feature flag:** none / `flag:name` (default off)
- **Rollback:** revert PR + redeploy

## Screenshots / recordings

<!-- UI changes only. Paste before/after or a Loom. -->

# Contributing to emc-agentic-demo

Practical checklist for the EM 13-Step Workflow — tailored to this repo.

---

## Quick Reference

| Concept | Value for this repo |
|---|---|
| Base branch | `dev` |
| Branch convention | `{type}/EM-{Author}/{TICKET}-short-description` |
| Author (Satish Dabhi) | `EM-Satish-Dabhi` |
| Merge strategy | Squash → `dev`, Merge → `staging`, Merge → `main` |
| Repo URL | https://github.com/EM-SatishDabhi/emc-agentic-demo |

---

## Step-by-Step: From Idea to Production

### Step 1 — Create a Feature Issue

```bash
gh issue create \
  --template feature.yml \
  --title "[Feature] Short description" \
  --label "type:feature,needs-triage"
```

The issue must answer: What problem? What is success? What's in/out of scope? Who's the stakeholder?

---

### Step 2 — Break into Stories (if feature is large)

```bash
gh issue create \
  --template story.yml \
  --title "[Story] As a user I want ..."
```

Each story must have Given/When/Then acceptance criteria and fit in a single PR (~1 week max).

---

### Step 3 — Create Branch

```bash
# Replace EMC-NNN with your issue number
gh issue develop <ISSUE_NUMBER> \
  --base dev \
  --branch feature/EM-Satish-Dabhi/EMC-<NNN>-short-description \
  --checkout
```

Branch naming is enforced by the org-level ruleset — pushes with wrong names are rejected.

| Type | Use for |
|---|---|
| `feature/` | New functionality |
| `bug/` | Bug fixes |
| `task/` | Chores, config, docs |
| `hotfix/` | Emergency prod fixes (targets `main`) |
| `refactor/` | Code restructuring |

---

### Step 4 — Plan (PLAN.md)

```bash
# In Claude Code:
/gsd:plan-phase EMC-<NNN>
```

Output: `.planning/phase-NNN/PLAN.md` with goal, file-by-file task list, and verification approach.
Skip for trivial changes (single-file, < 20 LOC).

---

### Step 5 — Plan Review

A second person (Tech Lead) reads PLAN.md and approves in writing before any code is written.

```bash
# Surface Claude's assumptions:
/gsd:list-phase-assumptions
```

---

### Step 6 — Write Failing Tests First (TDD-RED)

```bash
npm test              # should be RED for new functionality
```

Tests must map 1:1 to acceptance criteria. Run existing suite to confirm no regressions.

---

### Step 7 — Implement (TDD-GREEN)

```bash
# Autonomous Claude implementation:
/gsd:execute-phase

# Or task-by-task:
# "Implement PLAN.md task 1. Follow patterns in src/."

npm test              # all GREEN
npm run build         # no build errors
npm run lint          # no lint errors
```

Commit per PLAN.md task (atomic):
```bash
git add <specific-files>
git commit -m "feat(scope): EMC-NNN description"
```

---

### Step 8 — Integration + E2E Tests

```bash
npx playwright test          # local E2E
npx playwright test --headed # headed for UI verification
```

For UI changes: open the app in a real browser and manually walk the golden path.

```bash
npm run dev    # http://localhost:5173
```

---

### Step 9 — NFR Checks (runs in CI)

CI runs `.github/workflows/nfr-checks.yml` automatically on push.
Watch for:
- Bundle size budget
- Accessibility violations (axe)
- License compliance (no AGPL/GPL deps)

---

### Step 10 — Open PR

```bash
gh pr create \
  --base dev \
  --title "feat(scope): EMC-NNN human-readable summary" \
  --fill-first
```

Fill the PR checklist in the template. Minimum before merge:
- [ ] Tests pass
- [ ] CI green (all checks)
- [ ] PR checklist filled
- [ ] At least 1 approving review

```bash
gh pr checks <PR_NUMBER>     # watch CI
gh pr view <PR_NUMBER>       # see review status
```

---

### Step 11 — SAST/SCA (CodeQL + Dependabot)

```bash
# View CodeQL alerts on your branch:
gh api repos/EM-SatishDabhi/emc-agentic-demo/code-scanning/alerts \
  --jq '[.[] | {rule: .rule.id, severity: .rule.severity, file: .most_recent_instance.location.path}]'

# View Dependabot alerts:
gh api repos/EM-SatishDabhi/emc-agentic-demo/dependabot/alerts \
  --jq '[.[] | select(.state=="open") | {pkg: .dependency.package.name, severity: .security_vulnerability.severity}]'
```

Zero open high/critical findings before merging to `staging` or `main`.

---

### Step 12 — Update Docs

| If you changed... | Update... |
|---|---|
| Project conventions | `CLAUDE.md` |
| How to run / setup | Root `README.md` |
| Public API | OpenAPI / route docs |
| DB schema | Migration runbook |
| Env vars | `.env.example` |

---

### Step 12b — UAT Sign-off (before staging → main)

After merge to `staging`, PQE runs AC scenarios against the deployed environment and labels the PR `uat:passed`.
The `release-readiness` workflow blocks `staging → main` until every included PR has `uat:passed`.

---

### Step 13 — Promotion Ladder

```
feature/EM-Satish-Dabhi/EMC-NNN  →  dev       (squash merge, after PR review + CI green)
dev                      →  staging   (after QA pass — qa:passed label on each PR)
staging                  →  main      (after UAT — uat:passed label on each PR)
main                     →  Release   (release-please.yml auto-cuts release + changelog)
```

Hotfix path:
```bash
# Branch from main
git checkout -b hotfix/EM-Deb/EMC-NNN-fix-description main

# PR → main with --label hotfix
gh pr create --base main --label hotfix

# After merge: back-merge main → staging → dev
git checkout staging && git merge --no-ff main -m "chore: backmerge main → staging (hotfix EMC-NNN)"
git push
git checkout dev && git merge --no-ff staging -m "chore: backmerge staging → dev (hotfix EMC-NNN)"
git push
```

---

## Common Commands Cheat Sheet

```bash
# Check PR status
gh pr view
gh pr checks

# Check CI logs
gh run list --branch $(git branch --show-current)
gh run view <RUN_ID>

# Label a PR
gh pr edit <PR_NUMBER> --add-label "qa:ready"

# Request review
gh pr edit <PR_NUMBER> --add-reviewer <github-username>

# Merge PR (squash to dev)
gh pr merge <PR_NUMBER> --squash --delete-branch
```

# `tests/security/` — Auth, Boundaries, and OWASP

## What goes here

Targeted tests on **security-sensitive boundaries** in the application. The full OWASP Top 10 surface, not full coverage of every endpoint.

Categories:

- **Auth boundaries** — login, logout, session expiration, token refresh, MFA bypass attempts
- **RBAC** — every persona × every restricted resource. Each persona tries to access what they shouldn't.
- **CSRF** — every state-mutating endpoint, with and without token
- **Headers** — CSP, HSTS, X-Frame-Options, X-Content-Type-Options present and correct
- **Input validation** — SQL injection probes (Prisma should prevent, but test it), XSS payloads in user-input fields, prototype pollution
- **Secrets** — no secrets in source, no secrets in logs, no secrets in error responses
- **Rate limiting** — auth endpoints respond with 429 after threshold
- **PII handling** — encrypted fields stay encrypted in API responses, never logged plaintext

## What does NOT go here

- Static scanning (CodeQL handles SAST — covered by `.github/workflows/codeql.yml`)
- Dependency vulnerabilities (Dependabot + Snyk handle SCA)
- Penetration testing (separate engagement, not CI)
- Auditing test coverage of security (one test per endpoint is theater — focus on boundaries)

## Layout

```
tests/security/
├── auth/
│   ├── login.spec.ts
│   ├── session-expiry.spec.ts
│   └── mfa-bypass.spec.ts
├── rbac/
│   └── persona-matrix.spec.ts     ← table-driven: 8 personas × N resources
├── csrf/
│   └── state-mutations.spec.ts
├── headers/
│   └── response-headers.spec.ts
├── injection/
│   ├── sql-probe.spec.ts
│   └── xss-payloads.spec.ts
├── pii/
│   ├── encryption-roundtrip.spec.ts
│   └── log-redaction.spec.ts
└── rate-limit/
    └── auth-throttle.spec.ts
```

Each test has a `// why:` block tying to OWASP category or compliance requirement:

```typescript
// why: OWASP A01:2021 - Broken Access Control.
// Compliance Officer access to claims is allowed; Marketing Manager is not.
test('marketing manager cannot read claims endpoint', async () => {
  // ...
});
```

## CI wiring

- **Per-PR:** runs subset scoped to changed surface
- **Weekly:** full set
- **Pre-release:** full set required green

## CODEOWNERS

`@Engineersmind/security @Engineersmind/pqe`

## See also

- [TESTING.md → Risk-tier matrix](../../TESTING.md#required-tests-by-tier) — security required for `critical`, spot-check for `high` and `medium`
- [OWASP Top 10 2021](https://owasp.org/Top10/)
- `.github/workflows/codeql.yml` — SAST (different layer)

# `tests/a11y/` — Accessibility (WCAG 2.1 AA)

## What goes here

axe-core scans via Playwright that assert **zero WCAG 2.1 AA violations** on critical-tier pages. Every page that handles regulated data, every public-facing form, every authenticated dashboard.

## What does NOT go here

- Visual regression — different concern (color/layout drift); revisit in Phase 7 if needed
- Manual a11y audits — those are PQE exploratory, not CI
- Marketing/branding pages — covered by separate marketing-site testing, not this pack
- Accessibility for native apps (iOS/Android) — separate framework

## What WCAG 2.1 AA actually requires (the short version)

- Keyboard-accessible — every interactive element reachable via Tab, operable via Enter/Space
- Screen-reader announceable — every interactive element has an accessible name (label, aria-label, or text content)
- Color contrast — 4.5:1 for normal text, 3:1 for large text and UI components
- Focus visible — focused element has a visible focus indicator
- Form labels — every input has a `<label>` or `aria-labelledby`
- Headings hierarchical — no skipping levels (h1 → h3)
- Images alt text — meaningful images have `alt`; decorative have `alt=""`

axe-core checks most of these automatically. Some (color contrast on dynamic content, focus trap correctness) need supplemental manual probes.

## Layout

```
tests/a11y/
├── critical-pages.spec.ts   ← Scan critical-tier pages, fail on any violation
├── forms.spec.ts             ← Every form: keyboard nav, label associations
├── modals.spec.ts            ← Focus trap, escape closes, no scroll bleed
└── auth-flow.spec.ts         ← Login, MFA, password reset — keyboard-only walkthrough
```

Example:

```typescript
// why: WCAG 2.1 AA conformance on the agent dashboard (critical-tier UI).
test('agent dashboard has no axe violations', async ({ page }) => {
  await page.goto('/agent/dashboard');
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
```

## CI wiring

- **Per-PR:** runs only when UI files change (`apps/web/**/*.tsx`)
- **Nightly:** full set across viewports
- **Pre-release:** zero violations required on critical-tier pages

## CODEOWNERS

`@Engineersmind/frontend @Engineersmind/pqe`

## See also

- [TESTING.md → Risk-tier matrix](../../TESTING.md#required-tests-by-tier) — a11y required (UI) for `critical`, `high`, `medium`
- [axe-core rules](https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md)
- [WCAG 2.1 quick reference](https://www.w3.org/WAI/WCAG21/quickref/?levels=aa)

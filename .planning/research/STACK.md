# Stack Research

**Domain:** Client-side calculator web app (woodworking / imperial units)
**Researched:** 2026-02-25
**Confidence:** HIGH (core stack verified via official docs and WebSearch; supporting library versions verified via npm)

---

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Vite | 7.x (7.3.1 current) | Build tool + dev server | Standard scaffolding tool for React SPAs in 2026. Vite 7 uses Rolldown (Rust-based bundler) for fast builds, requires Node 20.19+. `npm create vite@latest -- --template react-ts` gives a fully wired project in one command. |
| React | 19.x (19.2.4 current) | UI rendering | Dominant component model for interactive UIs. React 19 stabilized Server Components (irrelevant here) and improved form handling — the important part is it's current and has full Vite support via `@vitejs/plugin-react`. |
| TypeScript | 5.9.x (5.9.3 stable) | Type safety | Prevents entire class of bugs in calculation logic (wrong unit type passed as another, off-by-one in arrays). TS 6.0 is in beta — stay on 5.9.x until 6.0 is stable. |
| Tailwind CSS | 4.x (4.2.0 current) | Styling | CSS-first, no JS config file. Fast incremental builds (100x faster than v3). Mobile-first by default — critical for phone-at-the-bench use case. v4 drops the `tailwind.config.js` file; configuration lives in your CSS with `@theme`. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| fraction.js | 5.3.4 | Convert decimal results to imperial fractions (e.g. 0.4375 → 7/16) | Use for all display formatting of calculated dimensions. 20M+ weekly downloads, actively maintained. Avoids writing your own GCD/rational-number reduction code. |
| Vitest | 4.x (4.0.18 current) | Unit testing the calculation engine | Use to test the dovetail math: given known board widths, assert expected pin counts, widths, and angles. Browser Mode is now stable in Vitest 4. Shares Vite config — zero extra setup. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| ESLint 9 (flat config) | Lint TypeScript + React | Use `eslint.config.js` (flat config format). Install `@eslint/js`, `typescript-eslint`, `eslint-plugin-react`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`. Vite's `react-ts` template ships a basic ESLint config — update it to flat config v9 format. |
| Prettier | Code formatting | Pair with ESLint. No config conflict with Tailwind v4 (use `prettier-plugin-tailwindcss` for class sorting). |
| GitHub Pages or Netlify | Static hosting | Both support Vite builds natively. GitHub Pages requires setting `base` in `vite.config.ts` if deploying to a repo subdirectory. Netlify auto-detects Vite and sets `npm run build` + `dist/` output automatically. Zero cost for a static app this size. |

---

## Installation

```bash
# Scaffold the project (installs Vite + React + TypeScript)
npm create vite@latest dovetail-calc -- --template react-ts
cd dovetail-calc

# Install Tailwind CSS v4 (CSS-first, no config JS file)
npm install tailwindcss @tailwindcss/vite

# Supporting libraries
npm install fraction.js

# Dev dependencies (testing + linting)
npm install -D vitest @vitest/coverage-v8
npm install -D eslint @eslint/js typescript-eslint eslint-plugin-react eslint-plugin-react-hooks eslint-plugin-react-refresh
npm install -D prettier prettier-plugin-tailwindcss
```

Tailwind v4 Vite integration (add to `vite.config.ts`):
```typescript
import tailwindcss from '@tailwindcss/vite'

export default {
  plugins: [
    tailwindcss(),
  ],
}
```

Then in your CSS entry file replace `@tailwind` directives with:
```css
@import "tailwindcss";
```

---

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Vite | Create React App | Never — CRA is unmaintained since 2023. Vite is the official recommendation. |
| Vite | Next.js | If you need SSR, routing, or API routes. This project needs none of those. Next.js adds significant complexity with zero benefit for a pure client-side calculator. |
| React | Vue 3 / Svelte | If team strongly prefers them. For a solo project with standard tooling expectations, React is the safe choice with the largest ecosystem. |
| Tailwind CSS | CSS Modules | If you prefer scoped CSS without utility classes. CSS Modules work fine with Vite. Tailwind is faster to iterate on for responsive layouts. |
| Tailwind CSS | styled-components / Emotion | Avoid for this project — runtime CSS-in-JS adds bundle weight for no benefit in a static calculator. |
| fraction.js | Custom GCD algorithm | Only if fraction.js becomes a dependency burden (it won't — it's 3.5KB). Write your own only if fraction.js output format doesn't match the display requirements. |
| Vitest | Jest | Vitest is faster and shares Vite config. Jest requires additional Babel/ts-jest setup. No reason to use Jest in a Vite project. |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Create React App (CRA) | Unmaintained since 2023, slow builds, outdated webpack | Vite with `react-ts` template |
| TypeScript 6.0 beta | In beta as of Feb 2026 — breaking changes still landing | TypeScript 5.9.x stable |
| Tailwind CSS v3 | Still works but v4 is the current release with significantly better DX and build speed | Tailwind CSS v4 |
| math.js | 170KB+ bundle for capabilities this project doesn't need | fraction.js (3.5KB) for fractions only |
| Redux / Zustand / Jotai | Overkill state management for a single-form calculator — no shared state across routes or components | React's built-in `useState` + `useMemo` |
| React Router | No routing needed — single-page form with no navigation | None; keep it a single component tree |
| Any backend/API | Project constraint explicitly rules this out | Pure client-side calculation |

---

## Stack Patterns by Variant

**If deploying to GitHub Pages (repo subdirectory):**
- Set `base: '/repo-name/'` in `vite.config.ts`
- Use `gh-pages` npm package or GitHub Actions with the `peaceiris/actions-gh-pages` action

**If deploying to Netlify (recommended for simplicity):**
- Connect repo, set build command `npm run build`, publish dir `dist`
- No base path changes needed — Netlify serves from root

**If adding a visual diagram later (v2 scope):**
- Add `konva` (canvas) or `svg.js` — neither conflicts with this stack
- Keep calculation engine pure functions in `src/lib/` so they're reusable without UI coupling

---

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| vite@7.x | Node 20.19+ or 22.12+ | Node 18 is EOL and dropped in Vite 7 |
| react@19.x | vite@7.x via @vitejs/plugin-react | plugin-react supports React 19 fully |
| typescript@5.9.x | vite@7.x | Vite 7 TypeScript support is built-in, no separate plugin needed |
| tailwindcss@4.x | vite@7.x via @tailwindcss/vite | The Vite plugin replaces the PostCSS plugin — do not use both |
| vitest@4.x | vite@7.x | Vitest 4 is designed for Vite 7; they share configuration |
| fraction.js@5.x | TypeScript 5.x | Ships its own type definitions — no `@types/fraction.js` needed |

---

## Sources

- https://vite.dev/blog/announcing-vite7 — Vite 7.0 announcement, version 7.3.1 current, Node.js requirements (HIGH confidence)
- https://react.dev/blog/2025/10/01/react-19-2 — React 19.2 release notes, version 19.2.4 current (HIGH confidence)
- https://devblogs.microsoft.com/typescript/announcing-typescript-6-0-beta/ — TypeScript 6.0 beta status; 5.9.3 is stable (HIGH confidence)
- https://tailwindcss.com/blog/tailwindcss-v4 — Tailwind CSS v4.0 announcement; v4.2.0 current as of Feb 19 2026 (HIGH confidence)
- https://vitest.dev/blog/vitest-4 — Vitest 4.0 release; 4.0.18 current (HIGH confidence)
- https://npmtrends.com/decimal.js-vs-fraction.js-vs-fractional-vs-numeral — fraction.js popularity vs alternatives (MEDIUM confidence — WebSearch verified)
- https://vite.dev/guide/static-deploy — Official Vite static deployment guide for GitHub Pages and Netlify (HIGH confidence)
- WebSearch: "eslint v9 flat config vite react typescript 2025" — multiple community guides confirming flat config as current standard (MEDIUM confidence)

---

*Stack research for: Dovetail Joint Calculator — client-side web app*
*Researched: 2026-02-25*

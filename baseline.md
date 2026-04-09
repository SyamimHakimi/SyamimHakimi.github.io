# Baseline Audit

This document captures the pre-migration state of the legacy Vue 3 portfolio app before the Astro rebuild begins.

## Build Baseline

- Command: `npm run build`
- Result: passes
- Notes:
  - `vue-tsc --noEmit` passed.
  - `vite build` passed and produced a production bundle.
  - The build currently emits extensive Sass deprecation warnings from the KeenThemes/Bootstrap stack.
  - Notable output sizes from the current build:
    - `dist/assets/index-CATeHrbO.css`: 1.87 MB
    - `dist/assets/index-Dwx9LsdX.js`: 1.77 MB

## Lint Baseline

- Verification command: `npm run lint:check`
- Result: fails
- Exact totals from the JSON formatter run:
  - Errors: 67
  - Warnings: 447
  - Files with findings: 110
  - Auto-fixable warnings: 447
- Major issue categories observed:
  - `@typescript-eslint/no-explicit-any`
  - `@typescript-eslint/ban-ts-comment`
  - `@typescript-eslint/no-unsafe-function-type`
  - `@typescript-eslint/no-unused-vars`
  - Prettier line-ending warnings in utility scripts

## Firebase Data Shape Baseline

The current app already identifies the live Firestore paths used at runtime:

- `profile/ddIhV8IxV5DjciJY7UxW`
- `services`
- `social-media`
- `photography-gears`
- `favourite-boardgames`
- `photos`
- `projects/XYdqe9OyXNSUEzZ8kqwn`
- `projects/XYdqe9OyXNSUEzZ8kqwn/techstack`
- `experience/platforms/item`
- `experience/protocols/item`
- `experience/frameworks/item`
- `experience/languages/item`
- `statistics/stats`
- `statistics/photo-stats`
- `statistics/fav-photo-stats`
- `statistics/focal-stats`
- `statistics/lens_stats`
- `statistics/recipe-stats`
- `statistics/theme-stats`

These paths were derived from the existing VueFire stores and are the source of truth for the A1 export script.

## Dependency Audit

### In active use

- Core app/runtime: `vue`, `vue-router`, `pinia`, `firebase`, `vuefire`
- Styling/UI stack: `bootstrap`, `bootstrap-icons`, `@fortawesome/fontawesome-free`, `line-awesome`, `socicon`, `sass`
- Feature libraries with direct imports or stylesheet usage:
  - `apexcharts`, `vue3-apexcharts`
  - `vee-validate`, `yup`
  - `vue-inline-svg`
  - `vue-i18n`
  - `axios`, `vue-axios`
  - `object-path`
  - `quill`
  - `sweetalert2`
  - `nouislider`
  - `dropzone`
  - `animate.css`
  - `@vueform/multiselect`
  - `prismjs`, `prism-themes`
- Tooling/dev usage:
  - `vite`, `vue-tsc`, `typescript`, `eslint`, `eslint-plugin-vue`, `prettier`
  - `npm-run-all`
  - `playwright` (used by `scripts/ui-preview.mjs`)
  - `gh-pages` (current deploy script)

### Likely dead weight or no active usage found in app code

- `@fullcalendar/core`
- `@fullcalendar/daygrid`
- `@fullcalendar/interaction`
- `@fullcalendar/list`
- `@fullcalendar/timegrid`
- `@fullcalendar/vue3`
- `@tinymce/tinymce-vue`
- `clipboard`
- `core-js`
- `deepmerge`
- `moment`
- `vue-currency-input`
- `array-sort`
- `sass-loader`

### Audit note

This is a non-destructive audit only. No dependency removal is part of Phase A1.

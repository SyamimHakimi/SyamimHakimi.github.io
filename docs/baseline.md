# Bundle Size Baseline

Recorded at Phase A7 (2026-04-10). Run `npm run build` to regenerate.

## JavaScript chunks (`dist/_astro/`)

| Chunk | Size (bytes) | Notes |
|---|---|---|
| `vue3-apexcharts.*.js` | 527 KB | ApexCharts Vue wrapper — loaded only by PhotographyJourney island |
| `apexcharts.ssr.esm-*.js` | 518 KB | ApexCharts core — lazy-loaded with charts island |
| `firebase.*.js` | 294 KB | Firebase SDK (Firestore + Auth) — shared across all islands |
| `ServicesSection.*.js` | 134 KB | Includes motion-v animation library |
| `runtime-core.esm-bundler.*.js` | 74 KB | Vue 3 runtime core — shared chunk |
| `runtime-dom.esm-bundler.*.js` | 11 KB | Vue 3 DOM renderer |
| `GalleryGrid.*.js` | 7.3 KB | Gallery pagination island |
| `ContactForm.*.js` | 7.3 KB | EmailJS contact form island |
| `PhotographyJourney.*.js` | 6.7 KB | Stats + featured photos island |
| `PortfolioSection.*.js` | 6.3 KB | Experience + projects island |
| `AboutMe.*.js` | 4.6 KB | Profile, gear, boardgames island |
| `ThemeToggle.*.js` | 1.7 KB | Dark/light mode toggle |

## CSS

| File | Size |
|---|---|
| `PageLayout.*.css` | 28 KB |

## Notes

- All JS chunks are loaded lazily (`client:visible` or `client:load`) — the initial page load ships only the CSS and the page shell HTML.
- The ApexCharts bundle (1 MB combined) loads only when `PhotographyJourney` scrolls into view. Future optimisation: dynamic import to split per-chart.
- `ServicesSection` is heavier than other islands because it bundles motion-v. If motion-v is added to other islands, the shared chunk will be extracted automatically by Rollup.
- Firebase SDK (294 KB) is currently duplicated per island because each island is an independent Astro island entry point. A shared provider pattern could deduplicate it.

## Performance targets

| Metric | Target |
|---|---|
| First Contentful Paint (FCP) | < 1.5 s on fast 3G |
| Initial JS shipped (before scroll) | 0 KB client JS (static shell) |
| Lighthouse Performance score | ≥ 90 |

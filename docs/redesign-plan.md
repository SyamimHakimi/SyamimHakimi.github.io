# Redesign Plan - MD3-Informed Portfolio System

**Status:** Planning
**Design authority:** `ui-ux-pro-max`
**Implementation owner:** Claude
**Review owner:** Codex
**Final approver:** Syamim
**Intent:** Modernize the portfolio around an MD3-informed portfolio system with a neutral-first palette and restrained blue accent while presenting software engineering and photography as equally intentional parts of the brand.

**Selected palette:** Neutral monochrome with restrained blue accent (`#18181B` primary, `#2563EB` CTA, `#FAFAFA` background)
**Selected typography:** DM Serif Display (display/headline roles) + DM Sans (body, UI, labels)
**Selected icons:** Lucide (`lucide-vue-next`)

## Workflow

`ui-ux-pro-max` is the primary design authority for this redesign. Claude and Codex define product, accessibility, and engineering constraints, but they do not override approved visual decisions from `ui-ux-pro-max`.

1. Claude and Codex define only the product, content, accessibility, and engineering constraints for a page or component.
2. `ui-ux-pro-max` produces the design direction and mockups. For major pages, layout shells, and system-level visual changes, it should produce three distinct options where useful.
3. The selected mockup is saved as `scripts/<phase>-<component>.html`.
4. The prompt, rationale, and required states are recorded in `HANDOFF.md` or the phase design notes.
5. `npm run ui:preview -- --file scripts/<file>.html --label "<Phase> - <Component>"` is run and sent to Telegram.
6. Syamim approves or requests changes.
7. Any requested visual revision goes back through `ui-ux-pro-max`; Claude and Codex do not improvise redesign revisions directly.
8. Implementation begins only after the preview is explicitly approved.
9. Gate 4 review checks the built UI against the approved mockup, not just the code diff.

## Required Approved States

Every approved redesign artifact must cover:

- Desktop and mobile layout
- Default and active states
- Hover and focus-visible states where applicable
- Disabled, submitting, success, and validation states where applicable
- Loading, empty, and error states for Firestore-backed islands
- Reduced-motion behavior when animation is part of the experience

This rule also applies to later frontend hotfixes or polish passes if they materially change the user experience.

## Product Structure Rationale

`ui-ux-pro-max`'s default portfolio pattern would normally prioritize a single flow of Hero, Project Grid, About, and Contact on one primary journey. This project intentionally keeps Photography Journey as the home route and preserves dedicated routes for Portfolio, Services, About, and Contact because photography is not a side gallery here; it is a co-primary identity alongside engineering. The redesign should still follow the skill's neutral-first, work-first restraint, but the route structure remains intentionally multi-route.

## Design System Foundation

### Color Roles

`ui-ux-pro-max` recommends a neutral-first portfolio palette so the work stays primary and the accent color only guides action. Contrast ratios must meet WCAG AA for text.

| Role | Light | Dark | Purpose |
|---|---|---|---|
| Primary | `#18181B` | `#FAFAFA` | Primary text and high-emphasis UI |
| Secondary | `#3F3F46` | `#A1A1AA` | Supporting actions and muted UI |
| CTA | `#2563EB` | `#60A5FA` | Buttons, links, active indicators |
| Background | `#FAFAFA` | `#09090B` | Page background |
| Surface | `#FFFFFF` | `#18181B` | Cards, panels, inputs |
| Surface Variant | `#F4F4F5` | `#27272A` | Tinted cards and quiet sections |
| On Surface | `#09090B` | `#FAFAFA` | Primary text on surfaces |
| On Surface Variant | `#52525B` | `#D4D4D8` | Supporting text |
| Outline | `#E4E4E7` | `#3F3F46` | Borders and dividers |
| Error | `#DC2626` | `#F87171` | Validation errors |
| Scrim | `rgba(0,0,0,0.5)` | `rgba(0,0,0,0.5)` | Dialog and lightbox overlay |

### Typography Scale

DM Serif Display remains the chosen display and headline face for now, paired with DM Sans for body and interface text. Because DM Serif is more expressive, every approved mockup must verify that smaller headings stay legible and do not overpower the photography.

| Role | Font | Size | Weight | Line Height | Usage |
|---|---|---|---|---|---|
| Display Large | DM Serif Display | 57px | 400 | 64px | Numerical stats and impact figures |
| Display Small | DM Serif Display | 36px | 400 | 44px | Page hero titles |
| Headline Large | DM Serif Display | 32px | 400 | 40px | Section headings |
| Headline Medium | DM Serif Display | 28px | 400 | 36px | Group headers |
| Headline Small | DM Serif Display | 24px | 400 | 32px | Sub-section titles |
| Title Large | DM Sans | 22px | 500 | 28px | Card titles |
| Title Medium | DM Sans | 16px | 500 | 24px | List item titles |
| Title Small | DM Sans | 14px | 500 | 20px | Tab labels |
| Body Large | DM Sans | 16px | 400 | 24px | Body copy |
| Body Medium | DM Sans | 14px | 400 | 20px | Supporting copy |
| Body Small | DM Sans | 12px | 400 | 16px | Dense supporting text |
| Label Large | DM Sans | 14px | 500 | 20px | Buttons and chips |
| Label Small | DM Sans | 11px | 500 | 16px | Badges and captions |

### Shape Scale

| Scale | Radius | Applied To |
|---|---|---|
| Small | 8px | Buttons, text fields, chips |
| Medium | 12px | Cards |
| Large | 16px | Dialogs and floating actions |
| Extra Large | 28px | Large containers and sheets |
| Full | 9999px | Pills and avatars |

### Elevation

Elevation is expressed through neutral surface stepping, not a coloured tint overlay. The neutral-first palette has no primary-colour tint; depth is communicated by moving through the surface stack. Drop shadows are reserved for floating layers only (dialogs, drawers) and must be restrained.

| Level | Light surface | Dark surface | Used For |
|---|---|---|---|
| 0 | Background `#FAFAFA` | Background `#09090B` | Page surface |
| 1 | Surface `#FFFFFF` | Surface `#18181B` | Elevated cards, nav bars |
| 2 | Surface Variant `#F4F4F5` | Surface Variant `#27272A` | Hover fills, input focus tint |
| 3 | Surface Variant + Outline border | Surface Variant + Outline border | Active nav indicator, FAB |
| 4 | Surface + shadow `0 4px 16px rgba(0,0,0,0.12)` | Surface + shadow `0 4px 16px rgba(0,0,0,0.4)` | Dialogs |
| 5 | Surface + shadow `0 8px 32px rgba(0,0,0,0.16)` | Surface + shadow `0 8px 32px rgba(0,0,0,0.5)` | Drawers and highest overlays |

### Spacing

All spacing follows the MD3 4pt grid: `4 8 12 16 20 24 32 40 48px`. No arbitrary values outside this scale.

### Content Width

Page content is centred with a max-width cap to prevent uncomfortable stretching on wide monitors. Text-heavy pages (About, Contact, 404) use `max-w-3xl` (768px) for the content column. Grid and card pages (Photography Journey, Gallery, Portfolio, Services) use `max-w-7xl` (1280px). The navigation rail sits outside this cap on desktop.

### Scroll-triggered Animations

`motion-v` handles all scroll-triggered entrances. Standard pattern across all pages:

- Hero and page title: fade-up on load, Emphasized Decelerate, 300ms, no scroll trigger
- Card grids: stagger in on scroll-enter, Emphasized Decelerate, 300ms, 40ms delay per card, maximum 6 cards animated
- Section headings: fade-up on scroll-enter, Emphasized Decelerate, 250ms
- All entrance animations respect `prefers-reduced-motion`

### Motion

Use MD3-style easing and keep all motion compatible with `prefers-reduced-motion`. Exit animations run at 60-70% of the paired enter duration.

| Name | Curve | Duration | Usage |
|---|---|---|---|
| Emphasized | `cubic-bezier(0.2, 0, 0, 1)` | 400ms | Container transforms and lightbox open |
| Emphasized Decelerate | `cubic-bezier(0.05, 0.7, 0.1, 1)` | 300ms | Elements entering the screen |
| Emphasized Accelerate | `cubic-bezier(0.3, 0, 0.8, 0.15)` | 200ms | Elements leaving the screen |
| Standard | `cubic-bezier(0.2, 0, 0, 1)` | 200ms | On-screen tab and filter transitions |
| Micro | `cubic-bezier(0.2, 0, 0, 1)` | 150ms | State layer ripple, chip toggle, hover fill |

## Global Shell

### Files

- `src/components/SiteHeader.astro`
- `src/layouts/PageLayout.astro`
- `src/components/SiteFooter.astro`

### Shell Direction

- Small top app bar with site name/logo and `ThemeToggle`
- Desktop navigation rail with six destinations: Home, Gallery, Portfolio, Services, About, Contact — each destination must show both an icon and a visible text label; icon-only navigation is not permitted
- Mobile navigation follows the same rule: every destination must have both an icon and a visible label regardless of the chosen mobile pattern
- Mobile navigation must preserve route parity with desktop. If the final mobile pattern cannot present all six destinations in a single bottom bar, `ui-ux-pro-max` must propose an alternative mobile navigation pattern that still exposes Home, Gallery, Portfolio, Services, About, and Contact without inventing replacement destinations.
- The mobile fallback pattern must preserve visible current-route indication, stable browser back behavior, logical tab order, and direct access to every primary route without ambiguous labels or hidden IA.
- Include a skip link and preserve logical tab order so keyboard users can move from navigation to main content without crossing the full shell first
- Sticky or fixed navigation must not obscure the first content block; layout spacing must compensate for nav height on every breakpoint.
- Minimal desktop footer; mobile omits the footer only if the approved mobile navigation pattern makes that the better UX

## Page Plans

### Photography Journey `/`

**Island:** `PhotographyJourney.vue`

- Hero with restrained motion and neutral-first visual hierarchy; primary CTA is a "View Full Gallery" filled button linking to `/photography`
- Stats strip as elevated cards with Display Large figures in CTA or primary accent only where emphasis helps scanning
- Charts inside outlined cards; ApexCharts series colours: series 1 → CTA (`#2563EB` light / `#60A5FA` dark), series 2 → CTA at 40% opacity, series 3 → Secondary (`#3F3F46` light / `#A1A1AA` dark); axes and grid lines → Outline (`#E4E4E7` light / `#3F3F46` dark); chart background → Surface
- Loading state uses shimmer, not `animate-pulse`

### Gallery `/photography`

**Islands:** `GalleryGrid.vue`, `GalleryLightbox.vue`

- Filter chips for `All` and `Favourites`
- Editorial photo grid with minimal gaps and no hover zoom gimmicks
- Tonal "Load more" button
- Lightbox: opens with scale (0.92 to 1) plus fade, Emphasized easing, 250ms; closes with scale (1 to 0.92) plus fade, Emphasized Accelerate, 200ms
- Lighter MD3-style lightbox scrim (`black/50`) and icon buttons with translucent surface background
- Filter chips and lightbox controls must use semantic buttons, support keyboard interaction, expose visible focus states, and provide accessible names for icon-only actions.
- Lightbox status changes and async gallery updates should be announced where appropriate with polite live-region messaging.
- Image alt text: use the `description` field from the Firestore `photos` document when present; fall back to `"Photo by Syamim Hakimi"` when the field is empty or absent. Decorative placeholder images use `alt=""`.

### Portfolio `/portfolio`

**Island:** `PortfolioSection.vue`

- Primary tabs for Platforms, Protocols, Frameworks, Languages, and Project
- Elevated cards for experience groups
- Compact filled cards for frameworks
- Assist chips for languages
- Large outlined project card with restrained accent treatment rather than decorative gradients by default

### Services `/services`

**Island:** `ServicesSection.vue`

- Group headers with numbered labels
- Filled service cards with icon discs, with the visual disc inside a minimum 48x48 tap target
- Cards stagger in on scroll-enter, Emphasized Decelerate, 300ms, 40ms per card, capped at 6 animated cards
- Extended FAB or equivalent CTA to `/contact`

### About `/about`

**Island:** `AboutMe.vue`

- Elevated profile card
- Structured gear list with category subheads
- Horizontal boardgame scroller with snap behavior
- Assist chips for social links

### Contact `/contact`

**Island:** `ContactForm.vue`

- Filled MD3 text fields and textarea
- Textarea includes a character counter: `0 / 500`, Label Small, right-aligned below the field
- Inline validation fires on blur, not on keystroke
- Error states use MD3 error color roles
- Submit button with inline circular progress, 16px, replacing the label during submission
- Snackbar for submit feedback instead of inline banners; success auto-dismisses after 4s, error includes a `Retry` action
- Mobile form inputs should use appropriate `inputmode` and input types where applicable
- Every form control must have an explicit label, correct autocomplete where applicable, and async submit status/error messaging exposed through `aria-live`.

### 404

- Centered MD3 hero with strong primary-number treatment
- Filled button back to home
- Abstract background accents should stay subtle and not overpower the content

## Implementation Order

All implementation is **mobile-first**, expanding at `md` (768px) and `lg` (1024px). Step 1 also covers Google Fonts loading: preload DM Serif Display 400 and DM Sans 400 + 500 with `font-display: swap`; all other weights load non-blocking.

| Step | Scope | Files |
|---|---|---|
| 1 | Color tokens and typography | `src/styles/global.css` |
| 2 | Navigation rail/bar, top app bar, and footer | `src/components/SiteHeader.astro`, `src/components/SiteFooter.astro`, `src/layouts/PageLayout.astro` |
| 3 | Card system | Shared Astro and Vue UI patterns |
| 4 | Photography Journey | `src/components/islands/PhotographyJourney.vue` |
| 5 | Gallery and lightbox | `src/components/islands/GalleryGrid.vue`, `src/components/islands/GalleryLightbox.vue` |
| 6 | Portfolio | `src/components/islands/PortfolioSection.vue` |
| 7 | Services | `src/components/islands/ServicesSection.vue` |
| 8 | About | `src/components/islands/AboutMe.vue` |
| 9 | Contact | `src/components/islands/ContactForm.vue` |
| 10 | 404 | `src/pages/404.astro` |

Before each implementation step above, the matching mockup must be approved through the UI preview workflow.

## Accessibility Baseline

- Use semantic HTML elements before ARIA workarounds.
- All icon-only buttons must have accessible names.
- Decorative icons must be hidden from assistive technology.
- All custom interactive UI must support keyboard interaction as well as pointer interaction.
- Contact form fields must have labels and appropriate autocomplete values.
- Async status updates such as submission, retry, loading, and error feedback must use `aria-live` where needed.
- Heading hierarchy must remain sequential across all pages.

## Component Reference Map

| MD3 Component | Used In |
|---|---|
| Navigation Rail | Desktop shell |
| Navigation Bar or equivalent parity-preserving mobile pattern | Mobile shell |
| Top App Bar | Global shell |
| Elevated Card | Stats, platforms, profile |
| Filled Card | Services and framework cards |
| Outlined Card | Charts, boardgames, project card |
| Primary Tabs | Portfolio |
| Filter Chips | Gallery |
| Assist Chips | Languages and social links |
| Suggestion Chips | Tech stack |
| Filled Text Field | Contact form |
| Filled Button | Contact and 404 |
| Filled Tonal Button | Gallery |
| Text Button | Secondary actions |
| Extended FAB | Services CTA |
| Icon Button | Theme toggle and lightbox controls |
| Snackbar | Contact feedback |
| State Layer | Interactive surfaces |
| Shimmer Skeleton | Firestore loading states |
| Circular Progress | Loading actions |

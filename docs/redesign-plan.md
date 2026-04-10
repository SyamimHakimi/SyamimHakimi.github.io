# Redesign Plan - Material Design 3

**Status:** Planning
**Design authority:** `ui-ux-pro-max`
**Implementation owner:** Claude
**Review owner:** Codex
**Final approver:** Syamim
**Intent:** Modernize the portfolio around Material Design 3 with a blue and near-black palette while presenting software engineering and photography as equally intentional parts of the brand.

**Selected palette:** Option C - Sky/Periwinkle Blue (`#4A90D9` light / `#7EB8F0` dark)
**Selected typography:** Inter for now; font replacement is deferred to a future phase
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

## Design System Foundation

### Color Roles

| Role | Light | Dark | Purpose |
|---|---|---|---|
| Primary | `#4A90D9` | `#7EB8F0` | Key actions, active nav, filled buttons |
| On Primary | `#FFFFFF` | `#0D1B2A` | Text and icons on primary fills |
| Primary Container | `#D8EEFF` | `#163352` | Chip fills, card tints, active indicators |
| On Primary Container | `#163352` | `#A0CFFF` | Text on primary container |
| Secondary | `#607080` | `#8AA8C0` | Supporting actions |
| Secondary Container | `#D0E8F8` | `#1A3048` | Subtle fills |
| Surface | `#F9FBFF` | `#0D0F12` | Page background |
| Surface Variant | `#EDF5FF` | `#141820` | Cards, panels, inputs |
| On Surface | `#0D1B2A` | `#E8F2FF` | Primary text |
| On Surface Variant | `#3D4A58` | `#607080` | Supporting text |
| Outline | `#BAE0FF` | `#1E2530` | Borders and dividers |
| Outline Variant | `#D8EEFF` | `#141820` | Subtle separators |
| Error | `#D32F2F` | `#F28B82` | Validation errors |
| Scrim | `rgba(0,0,0,0.5)` | `rgba(0,0,0,0.5)` | Dialog and lightbox overlay |

### Typography Scale

| Role | Size | Weight | Line Height | Usage |
|---|---|---|---|---|
| Display Large | 57px | 400 | 64px | Numerical stats and impact figures |
| Display Small | 36px | 400 | 44px | Page hero titles |
| Headline Large | 32px | 400 | 40px | Section headings |
| Headline Medium | 28px | 400 | 36px | Group headers |
| Headline Small | 24px | 400 | 32px | Sub-section titles |
| Title Large | 22px | 500 | 28px | Card titles |
| Title Medium | 16px | 500 | 24px | List item titles |
| Title Small | 14px | 500 | 20px | Tab labels |
| Body Large | 16px | 400 | 24px | Body copy |
| Body Medium | 14px | 400 | 20px | Supporting copy |
| Body Small | 12px | 400 | 16px | Dense supporting text |
| Label Large | 14px | 500 | 20px | Buttons and chips |
| Label Small | 11px | 500 | 16px | Badges and captions |

### Shape Scale

| Scale | Radius | Applied To |
|---|---|---|
| Small | 8px | Buttons, text fields, chips |
| Medium | 12px | Cards |
| Large | 16px | Dialogs and floating actions |
| Extra Large | 28px | Large containers and sheets |
| Full | 9999px | Pills and avatars |

### Elevation

Use MD3 tonal elevation first. Drop shadows should be restrained and reserved for cases where tonal separation is insufficient.

| Level | Tint Opacity | Used For |
|---|---|---|
| 0 | 0% | Page surface |
| 1 | 5% | Elevated cards, nav bars |
| 2 | 8% | Hovered fills |
| 3 | 11% | Active nav indicator, FAB |
| 4 | 12% | Dialogs |
| 5 | 14% | Drawers and highest overlays |

### Motion

Use MD3-style easing and keep all motion compatible with `prefers-reduced-motion`.

| Name | Curve | Usage |
|---|---|---|
| Emphasized | `cubic-bezier(0.2, 0, 0, 1)` | Container transforms |
| Emphasized Decelerate | `cubic-bezier(0.05, 0.7, 0.1, 1)` | Entering motion |
| Emphasized Accelerate | `cubic-bezier(0.3, 0, 0.8, 0.15)` | Exiting motion |
| Standard | `cubic-bezier(0.2, 0, 0, 1)` | On-screen transitions |

## Global Shell

### Files

- `src/components/SiteHeader.astro`
- `src/layouts/PageLayout.astro`
- `src/components/SiteFooter.astro`

### Shell Direction

- Small top app bar with site name/logo and `ThemeToggle`
- Desktop navigation rail with six destinations: Home, Gallery, Portfolio, Services, About, Contact
- Mobile navigation must preserve route parity with desktop. If the final mobile pattern cannot present all six destinations in a single bottom bar, `ui-ux-pro-max` must propose an alternative mobile navigation pattern that still exposes Home, Gallery, Portfolio, Services, About, and Contact without inventing replacement destinations.
- Minimal desktop footer; mobile omits the footer only if the approved mobile navigation pattern makes that the better UX

## Page Plans

### Photography Journey `/`

**Island:** `PhotographyJourney.vue`

- Hero with MD3 page-title treatment and restrained motion
- Stats strip as elevated cards
- Charts inside outlined cards
- Loading state uses shimmer, not `animate-pulse`

### Gallery `/photography`

**Islands:** `GalleryGrid.vue`, `GalleryLightbox.vue`

- Filter chips for `All` and `Favourites`
- Editorial photo grid with minimal gaps and no hover zoom gimmicks
- Tonal "Load more" button
- Lighter MD3-style lightbox scrim and icon buttons

### Portfolio `/portfolio`

**Island:** `PortfolioSection.vue`

- Primary tabs for Platforms, Protocols, Frameworks, Languages, and Project
- Elevated cards for experience groups
- Compact filled cards for frameworks
- Assist chips for languages
- Large outlined project card with gradient banner and suggestion chips

### Services `/services`

**Island:** `ServicesSection.vue`

- Group headers with numbered labels
- Filled service cards with icon discs
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
- Error states use MD3 error color roles
- Submit button with inline progress
- Snackbar for submit feedback instead of inline banners

### 404

- Centered MD3 hero with strong primary-number treatment
- Filled button back to home
- Abstract background accents from primary container and surface roles

## Implementation Order

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

## Component Reference Map

| MD3 Component | Used In |
|---|---|
| Navigation Rail | Desktop shell |
| Navigation Bar or equivalent parity-preserving mobile pattern | Mobile shell |
| Top App Bar | Global shell |
| Elevated Card | Stats, platforms, profile |
| Filled Card | Services, framework cards |
| Outlined Card | Charts, boardgames, project card |
| Primary Tabs | Portfolio |
| Filter Chips | Gallery |
| Assist Chips | Languages, social links |
| Suggestion Chips | Tech stack |
| Filled Text Field | Contact form |
| Filled Button | Contact, 404 |
| Filled Tonal Button | Gallery |
| Text Button | Secondary actions |
| Extended FAB | Services CTA |
| Icon Button | Theme toggle, lightbox controls |
| Snackbar | Contact feedback |
| State Layer | Interactive surfaces |
| Shimmer Skeleton | Firestore loading states |
| Circular Progress | Loading actions |

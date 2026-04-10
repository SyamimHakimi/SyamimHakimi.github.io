# Redesign Plan — Material Design 3

**Status:** PLANNING  
**Owner:** Claude (suggest) → Codex (review) → UI/UX Pro Max (3 design options) → Syamim (select)  
**Intent:** Modernise the portfolio to MD3 spec, blue + black palette, showcasing Syamim's skills and hobbies.  
**Selected Palette:** Option C — Sky/Periwinkle Blue (`#4A90D9` light / `#7EB8F0` dark)  
**Selected Typography:** Inter (existing — font switch deferred to a future phase)  
**Selected Icons:** Lucide (`lucide-vue-next` — already installed, no migration needed)

---

## Collaborative Workflow

```
1. Claude drafts spec/approach for each page or component
2. Codex reviews — flags issues, suggests alternatives, both parties agree
3. UI/UX Pro Max produces ≥ 3 distinct design mockups per page/section
4. Syamim selects preferred option
5. Implementation begins on the agreed design
```

---

## Design System Foundation

### Color Palette — Option C: Sky/Periwinkle Blue ✅ SELECTED

MD3 uses named "color roles" rather than raw hex values. The entire UI adapts through these roles.

| Role | Light Mode | Dark Mode | Purpose |
|---|---|---|---|
| Primary | `#4A90D9` | `#7EB8F0` | Key actions, active nav, filled buttons |
| On Primary | `#FFFFFF` | `#0D1B2A` | Text/icons on primary fills |
| Primary Container | `#D8EEFF` | `#163352` | Chip fills, card tints, tab indicators |
| On Primary Container | `#163352` | `#A0CFFF` | Text on primary container |
| Secondary | `#607080` | `#8AA8C0` | Supporting actions, secondary chips |
| Secondary Container | `#D0E8F8` | `#1A3048` | Subtle fills |
| Surface | `#F9FBFF` | `#0D0F12` | Page background |
| Surface Variant | `#EDF5FF` | `#141820` | Card backgrounds, input fills |
| On Surface | `#0D1B2A` | `#E8F2FF` | Primary text |
| On Surface Variant | `#3D4A58` (light) | `#607080` (dark) | Supporting/muted text |
| Outline | `#BAE0FF` | `#1E2530` | Borders, dividers |
| Outline Variant | `#D8EEFF` | `#141820` | Subtle dividers |
| Error | `#D32F2F` | `#F28B82` | Validation errors |
| Scrim | `rgba(0,0,0,0.5)` | `rgba(0,0,0,0.5)` | Dialog/lightbox overlay |

> **Palette rationale:** Sky/Periwinkle blue is soft and approachable — balances the technical software
> engineering content with the creative photography side. The near-black (`#0D0F12`) dark surface
> gives excellent contrast without feeling harsh.

---

### Typography Scale (Inter → MD3 roles)

| Role | Size | Weight | Line Height | Usage |
|---|---|---|---|---|
| Display Large | 57px | 400 | 64px | Hero stat numbers |
| Display Medium | 45px | 400 | 52px | — |
| Display Small | 36px | 400 | 44px | Page hero titles |
| Headline Large | 32px | 400 | 40px | Section headings |
| Headline Medium | 28px | 400 | 36px | Card group headers |
| Headline Small | 24px | 400 | 32px | Sub-section titles |
| Title Large | 22px | 500 | 28px | Nav labels, card titles |
| Title Medium | 16px | 500 | 24px | List item titles |
| Title Small | 14px | 500 | 20px | Tab labels, dense headers |
| Body Large | 16px | 400 | 24px | Body copy |
| Body Medium | 14px | 400 | 20px | Descriptions, supporting |
| Body Small | 12px | 400 | 16px | Dense body text |
| Label Large | 14px | 500 | 20px | Buttons, chip labels |
| Label Medium | 12px | 500 | 16px | — |
| Label Small | 11px | 500 | 16px | Badges, captions, counters |

---

### Shape Scale

| Scale | Radius | Applied To |
|---|---|---|
| Extra Small | 4px | Snackbars, tooltips |
| Small | 8px | Buttons, text fields, chips |
| Medium | 12px | Cards |
| Large | 16px | Dialogs, FAB |
| Extra Large | 28px | Bottom sheets |
| Full | 9999px | Avatar circles, pills |

---

### Elevation (Tonal — MD3 style)

MD3 communicates elevation through a primary-color tint overlay, not drop shadows (except for FAB).

| Level | Tint Opacity | Used For |
|---|---|---|
| 0 | 0% | Surface (page bg) |
| 1 | 5% | Navigation bar/rail, Elevated Cards |
| 2 | 8% | Filled button hover state |
| 3 | 11% | FAB, active nav indicator |
| 4 | 12% | Dialog |
| 5 | 14% | Navigation drawer |

---

### Motion — MD3 Easing

Replace current `ease` transitions with MD3-specified curves:

| Name | Curve | Usage |
|---|---|---|
| Emphasized | `cubic-bezier(0.2, 0, 0, 1)` | Enter from off-screen, container transforms |
| Emphasized Decelerate | `cubic-bezier(0.05, 0.7, 0.1, 1)` | Elements entering the screen |
| Emphasized Accelerate | `cubic-bezier(0.3, 0, 0.8, 0.15)` | Elements leaving the screen |
| Standard | `cubic-bezier(0.2, 0, 0, 1)` | On-screen transitions |

All animations continue to respect `prefers-reduced-motion`.

---

## Global Shell

### Files: `SiteHeader.astro`, `PageLayout.astro`, `SiteFooter.astro`

**Top App Bar (Small)**
- Height: 64px
- Content: Site name/logo (Title Large, Primary color) + ThemeToggle icon button
- Background: Surface with Level 1 elevation on scroll
- No nav links — navigation moves to Rail/Bar

**Navigation Rail (desktop ≥ 1024px)**
- Width: 80px, fixed left, full viewport height
- Destinations (top-to-bottom): Home · Gallery · Portfolio · Services · About · Contact
- Each destination: icon (24px lucide) + Label Small below
- Active state: Primary Container pill (56px wide, 32px tall, rounded-full) behind the icon; icon + label turn Primary color
- Inactive: On Surface Variant color
- Bottom of rail: ThemeToggle icon button (or move to Top App Bar)

**Navigation Bar (mobile < 1024px)**
- Height: 80px, fixed bottom
- Same 6 destinations with icon + Label Small
- Active indicator: Primary Container rounded-full pill behind icon
- Background: Surface Variant at Level 1 elevation

**Footer**
- Desktop only: single line below main content — `© 2025 Syamim Hakimi` in Body Small / On Surface Variant
- Mobile: hidden (nav bar occupies bottom)

---

## Page Plans

### Page 1 — Photography Journey `/`
**Island:** `PhotographyJourney.vue`

**Hero (static shell)**
- Display Small heading "Photography Journey"
- Body Large subtitle describing the photography practice
- Motion-v fade-up + slide (Emphasized Decelerate, 400ms) on page load

**Stats Strip**
- 4× MD3 Elevated Cards (Level 1 tint, no border, 12px radius)
- Value: Display Large in Primary color
- Label: Label Large in On Surface Variant
- Grid: `grid-cols-2 sm:grid-cols-4 gap-4`
- Skeleton: shimmer sweep (gradient from Surface Variant → white → Surface Variant) replacing animate-pulse

**Charts**
- 2× MD3 Outlined Cards (1px Outline border, no elevation, 12px radius)
- Card header: Title Large + Body Medium supporting text + Divider (1px Outline Variant)
- ApexCharts palette: Primary, Primary Container, Secondary Container, Surface Variant
- Grid: `grid-cols-1 md:grid-cols-2 gap-6`

---

### Page 2 — Gallery `/photography`
**Islands:** `GalleryGrid.vue`, `GalleryLightbox.vue`

**Filter Chips**
- Row: "All" | "Favourites"
- MD3 Filter Chips — outlined (Outline border) unselected; Primary Container fill + On Primary Container text + checkmark when selected
- Wire "Favourites" chip to filter `favourite === true` from Firestore data

**Photo Grid**
- Aspect ratio: `aspect-[3/4]` (portrait, editorial)
- Tight gap: `gap-1` for editorial mosaic feel
- Columns: `grid-cols-2 sm:grid-cols-3 lg:grid-cols-4`
- Hover: state layer (white/8% overlay) — no scale transform
- Focus-visible: 2px Primary outline with 2px offset

**Load More**
- MD3 Filled Tonal Button (Primary Container bg, On Primary Container text)
- Loading state: 16px circular indeterminate progress indicator replaces icon

**Lightbox**
- Scrim: `black/50` (MD3 spec, lighter than current black/90)
- Controls: MD3 Icon Buttons — `Surface/80%` bg, rounded-full, state layer on hover
- Caption: Label Large `white/87` bottom-left
- Image transition: scale + fade (Emphasized easing, 250ms)

---

### Page 3 — Portfolio `/portfolio`
**Island:** `PortfolioSection.vue`

**Primary Tabs**
- Tabs: Platforms · Protocols · Frameworks · Languages · Project
- Active: Title Small 500 weight + 3px Primary indicator line underneath
- Tab switch: content fades + slides 8px horizontally (Standard easing, 200ms)

**Platforms & Protocols tabs**
- MD3 Elevated Cards in `grid-cols-1 sm:grid-cols-2 gap-4`
- Card: icon (lucide, 24px, Primary color) + Title Medium name + Body Small description
- Level 1 elevation, 12px radius, no border

**Frameworks tab**
- MD3 Filled Cards (Surface Variant bg) in `grid-cols-2 sm:grid-cols-3 gap-3`
- Compact: icon + Title Small name only

**Languages tab**
- MD3 Assist Chips — outlined, with optional leading tech icon
- `flex flex-wrap gap-2`

**Project tab**
- Full-width MD3 Large Card (12px radius, Outlined style)
- Top: gradient banner in Primary Container → Secondary Container
- Body: Headline Small title, Body Large description
- Tech Stack: Suggestion Chips (`flex flex-wrap gap-2`) at card bottom
- Action: Text Button "View on GitHub →" bottom-right

---

### Page 4 — Services `/services`
**Island:** `ServicesSection.vue`

**Group Headers**
- Label Large in Primary color (e.g. `01 — DEVELOPMENT`)
- Headline Medium group title
- Divider extending right of the heading

**Service Cards**
- MD3 Filled Cards (Surface Variant bg, no border, no shadow)
- Leading: icon in Primary Container rounded circle (40×40px)
- Title: Title Medium
- Description: Body Medium in On Surface Variant
- Keep motion-v stagger — update easing to Emphasized Decelerate

**Extended FAB (bottom CTA)**
- "Get in touch" + mail icon
- Primary bg, On Primary text
- Fixed bottom-right on desktop, full-width centered below cards on mobile
- Links to `/contact`

---

### Page 5 — About `/about`
**Island:** `AboutMe.vue`

**Profile Card**
- Full-width MD3 Elevated Card
- Avatar: initials or photo in Primary Container circle (64×64px, rounded-full)
- Name: Headline Medium
- Bio: Body Large

**Photography Gear**
- MD3 List (no card wrapper per item)
- List Item: leading icon square (Surface Variant, 40×40px, 8px radius) + Title Medium name + Body Medium detail
- Divider between items
- Label Large sticky subheader per gear category

**Favourite Boardgames**
- Horizontal scroll snap container
- Each game: MD3 Outlined Card — game cover image (or placeholder) + Title Small name
- `snap-x snap-mandatory overflow-x-auto`

**Social Media**
- MD3 Assist Chips with platform icon + name
- `flex flex-wrap gap-2`

---

### Page 6 — Contact `/contact`
**Island:** `ContactForm.vue`

**Filled Text Fields**
- Background: Surface Variant
- Top corners rounded (8px), no side/bottom border rounding
- Bottom indicator: 1px Outline → 2px Primary on focus
- Floating label: animates from inside field up to top on focus/fill
- Error state: Outline + label → Error color, supporting text below

**Textarea**
- Same Filled style
- Character counter: Label Small right-aligned below (`0 / 500`)

**Submit Button**
- MD3 Filled Button — full-width on mobile, `w-fit` on desktop
- Loading: 16px circular indeterminate progress (white stroke) replaces label

**Feedback**
- Remove inline banners
- MD3 Snackbar: slides up from bottom, auto-dismiss 4s
  - Success: "Message sent ✓"
  - Error: error text + "Retry" Text Button action

---

### Page 7 — 404
**Static Astro page**

- Display Large "404" in Primary color, centered
- Headline Small "Page not found"
- Body Medium supporting message in On Surface Variant
- MD3 Filled Button "Back to Home" with home icon
- Background accent: abstract shapes using Primary Container + Surface Variant

---

## Implementation Order

| Step | Scope | Files |
|---|---|---|
| 1 | Color tokens + typography | `global.css` |
| 2 | Navigation Rail/Bar + Top App Bar | `SiteHeader.astro`, `PageLayout.astro` |
| 3 | Card system (Elevated, Filled, Outlined) | Shared pattern across all islands |
| 4 | Photography Journey | `PhotographyJourney.vue` |
| 5 | Gallery + Lightbox | `GalleryGrid.vue`, `GalleryLightbox.vue` |
| 6 | Portfolio + Tabs | `PortfolioSection.vue` |
| 7 | Services + FAB | `ServicesSection.vue` |
| 8 | About | `AboutMe.vue` |
| 9 | Contact + Snackbar + Filled Fields | `ContactForm.vue` |
| 10 | 404 | `404.astro` |

---

## Component Reference Map

| MD3 Component | Replaces | Used In |
|---|---|---|
| Navigation Rail | Top sticky nav (desktop) | All pages |
| Navigation Bar | Top sticky nav (mobile) | All pages |
| Top App Bar (Small) | Full sticky header | All pages |
| Elevated Card | `rounded-xl border bg-surface` | Stats, Platforms, Profile |
| Filled Card | Same | Services, Frameworks |
| Outlined Card | Same | Charts, Boardgames |
| Primary Tabs | Stacked vertical sections | Portfolio |
| Filter Chips | — (new) | Gallery |
| Assist Chips | `rounded-full border` pills | Languages, Social links |
| Suggestion Chips | Tech stack badges | Portfolio project card |
| Filled Text Field | `rounded-lg border input` | Contact form |
| Filled Button | Current primary button | Contact submit, 404 |
| Filled Tonal Button | Current secondary button | Gallery load more |
| Text Button | Plain links | Portfolio card action |
| Extended FAB | — (new) | Services CTA |
| Icon Button | Current toggle/icon buttons | ThemeToggle, Lightbox |
| Snackbar | Inline alert divs | Contact feedback |
| State Layer | `hover:bg-*` utilities | All interactive elements |
| Shimmer Skeleton | `animate-pulse` blocks | All islands loading |
| Circular Progress | Spinner/loading icon | Buttons loading state |

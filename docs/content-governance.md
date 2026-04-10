# Content Governance

All site content is stored in Firebase Firestore (project `portfolio-9e62d`) and read at
runtime by Vue islands. No content is fetched at build time.

## Edit Workflow

**Now:** Edit documents directly in the [Firebase console](https://console.firebase.google.com).
Changes appear on the live site immediately without redeployment.

**Later:** A lightweight admin UI is planned. Client-side writes will be gated behind Firebase
Auth with an authenticated admin role.

## Collection Ownership

| Collection | Owner | Read | Write | Consumed by |
|------------|-------|------|-------|-------------|
| `photos` | Syamim | public | Firebase console | `useGallery()` |
| `statistics` | Syamim | public | Firebase console | `useStatistics()` |
| `services` | Syamim | public | Firebase console | `useServices()` |
| `experience/{category}/item` | Syamim | public | Firebase console | `usePortfolio()` |
| `projects` | Syamim | public | Firebase console | `usePortfolio()` |
| `projects/{id}/techstack` | Syamim | public | Firebase console | `usePortfolio()` |
| `profile` | Syamim | public | Firebase console | `useAboutMe()` |
| `photography-gears` | Syamim | public | Firebase console | `useAboutMe()` |
| `favourite-boardgames` | Syamim | public | Firebase console | `useAboutMe()` |
| `social-media` | Syamim | public | Firebase console | `useAboutMe()` |

## Security Model

- **Public reads:** All collections above are readable by anonymous visitors. The portfolio
  content is intentionally public.
- **Restricted writes:** All writes are disabled from client code. No client-side mutation
  is permitted until a future admin UI is built with proper authentication.
- **Admin access:** The project owner edits content via the Firebase console, which uses
  Google authentication and is not governed by `firestore.rules`.

See `firestore.rules` for the enforced security rules.

## Schema Reference

Schemas are defined as Zod objects in `src/lib/composables/`:

| Composable | Schema export |
|-----------|---------------|
| `useGallery.ts` | `PhotoSchema` |
| `useStatistics.ts` | `StatisticsSchema` |
| `useServices.ts` | `ServiceSchema` |
| `usePortfolio.ts` | `ExperienceItemSchema`, `ProjectSchema`, `TechStackItemSchema` |
| `useAboutMe.ts` | `ProfileSchema`, `GearSchema`, `BoardgameSchema`, `SocialMediaSchema` |

All Firestore payloads are validated through Zod before reaching the UI. If a document
fails schema validation, the island shows an error state instead of a broken UI.

import type { PhotographyGear } from "../composables/useAboutMe";

/**
 * Shared informational tiles shown in the About profile summary.
 */
export const PROFILE_INTERESTS = [
  {
    title: "Software",
    description:
      "Frontend-heavy engineering, product polish, and shipping practical systems.",
  },
  {
    title: "Photography",
    description:
      "Street, travel, and everyday scenes with compact gear that stays easy to carry.",
  },
  {
    title: "Boardgames",
    description:
      "Games with tension, replayability, and enough interaction to stay memorable.",
  },
] as const;

/**
 * Decorative panel frame layout for the desktop-only About visual block.
 */
export const ABOUT_VISUAL_FRAMES = [
  {
    className:
      "min-h-[308px] rounded-[20px] border border-[var(--color-outline)] bg-gradient-to-br from-[var(--color-surface-variant)] to-[color-mix(in_srgb,var(--color-outline)_60%,var(--color-surface))]",
  },
  {
    className:
      "min-h-[148px] rounded-[20px] border border-[var(--color-outline)] bg-gradient-to-br from-[color-mix(in_srgb,var(--color-surface-variant)_80%,var(--color-outline))] to-[var(--color-surface-variant)]",
  },
  {
    className:
      "min-h-[148px] rounded-[20px] border border-[var(--color-outline)] bg-gradient-to-br from-[var(--color-surface-variant)] to-[color-mix(in_srgb,var(--color-surface-variant)_80%,var(--color-outline))]",
  },
] as const;

const GEAR_TYPE_META: Record<number, string> = {
  1: "Body",
  2: "Zoom",
  3: "Prime",
};

const GEAR_IMAGE: Record<string, string> = {
  "Fujifilm X-E4": "/media/gear/XE4.png",
  "Sigma 10-18mm F2.8 DC DN": "/media/gear/Sigma10-18.png",
  "Sigma 18-50mm F2.8 DC DN": "/media/gear/Sigma18-50.png",
  "Viltrox 56mm F1.7 APS-C": "/media/gear/Viltrox56.png",
};

const SOCIAL_ICON: Record<string, string> = {
  email: "/media/svg/social-logos/email.svg",
  github: "/media/svg/social-logos/github.svg",
  linkedin: "/media/svg/social-logos/linkedin.svg",
  instagram: "/media/svg/social-logos/instagram.svg",
  twitter: "/media/svg/social-logos/twitter.svg",
  facebook: "/media/svg/social-logos/facebook.svg",
  youtube: "/media/svg/social-logos/youtube.svg",
  dribbble: "/media/svg/social-logos/dribbble.svg",
  google: "/media/svg/social-logos/google.svg",
};

/**
 * Returns the display label for a photography gear type id.
 *
 * @param type - Numeric Firestore gear type identifier.
 * @returns Human-readable gear category label or an empty string.
 */
export function gearMeta(type: number): string {
  return GEAR_TYPE_META[type] ?? "";
}

/**
 * Maps a gear item to its local product image.
 *
 * @param item - Photography gear record.
 * @returns Public asset path when available, otherwise null.
 */
export function gearImage(item: PhotographyGear): string | null {
  return GEAR_IMAGE[`${item.brand} ${item.name}`] ?? null;
}

/**
 * Maps a social platform name to a local icon asset.
 *
 * @param name - Social platform label from Firestore.
 * @returns Public asset path when available, otherwise null.
 */
export function socialIcon(name: string): string | null {
  return SOCIAL_ICON[name.toLowerCase()] ?? null;
}

/**
 * Splits the free-form boardgame tag string into trimmed labels.
 *
 * @param tags - Comma-delimited tag string from Firestore.
 * @returns Array of non-empty tag labels.
 */
export function boardgameTags(tags: string | undefined): string[] {
  return tags
    ? tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
    : [];
}

import {
  Briefcase,
  CreditCard,
  Flame,
  Layers3,
  Link2,
  Zap,
  type LucideIcon,
} from "lucide-vue-next";
import type { PortfolioData } from "../composables/usePortfolio";

/**
 * Reusable experience section config consumed by PortfolioSection.
 */
export interface PortfolioExperienceSection {
  key: keyof PortfolioData["experience"];
  title: string;
  description: string;
  gridClass: string;
  compact?: boolean;
}

/**
 * Shared section definitions for portfolio experience groups.
 */
export const PORTFOLIO_EXPERIENCE_SECTIONS: PortfolioExperienceSection[] = [
  {
    key: "platforms",
    title: "Platforms",
    description:
      "Cloud infrastructure, payment rails, and developer platforms I've shipped with.",
    gridClass: "sm:grid-cols-2 lg:grid-cols-3",
  },
  {
    key: "protocols",
    title: "Protocols",
    description:
      "Specialised communication standards I've implemented in production.",
    gridClass: "sm:grid-cols-2",
  },
  {
    key: "frameworks",
    title: "Frameworks",
    description:
      "Backend and frontend frameworks I use to build fast, maintainable products.",
    gridClass: "sm:grid-cols-2 lg:grid-cols-3",
    compact: true,
  },
];

export interface PortfolioHeroItem {
  label: string;
  icon: LucideIcon;
  kind: "stat" | "tag";
}

/**
 * Builds the compact hero summary items shown at the top of the experience page.
 *
 * @param expYears - Total years of professional experience.
 * @returns Ordered hero highlight items.
 */
export function buildPortfolioHeroItems(expYears: number): PortfolioHeroItem[] {
  return [
    { label: `${expYears}+ yrs experience`, icon: Briefcase, kind: "stat" },
    { label: "APIs & Integrations",         icon: Link2,     kind: "stat" },
    { label: "Full-stack",                  icon: Layers3,   kind: "stat" },
    { label: "FinTech",                     icon: CreditCard, kind: "tag" },
    { label: "EV Charging",                 icon: Zap,       kind: "tag" },
    { label: "Oil & Gas",                   icon: Flame,     kind: "tag" },
  ];
}

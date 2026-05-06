import {
  Briefcase,
  CreditCard,
  Flame,
  Layers3,
  Link2,
  Zap,
  type LucideIcon,
} from "lucide-vue-next";
import type { ExperienceItem, PortfolioData } from "../composables/usePortfolio";

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
      "Third-party services and cloud platforms I've integrated and built on.",
    gridClass: "sm:grid-cols-2 lg:grid-cols-3",
  },
  {
    key: "protocols",
    title: "Protocols",
    description:
      "Communication standards and integration specs I've implemented in production.",
    gridClass: "sm:grid-cols-2",
  },
  {
    key: "ai",
    title: "AI Developer Tools",
    description:
      "AI-powered tools I use actively in my engineering workflow.",
    gridClass: "sm:grid-cols-2",
  },
  {
    key: "frameworks",
    title: "Frameworks",
    description: "Frameworks, libraries, and SDKs I use across the stack.",
    gridClass: "sm:grid-cols-2 lg:grid-cols-3",
    compact: true,
  },
];

/**
 * Sorts experience items: active first, then by oldest start year ascending,
 * then alphabetically by title within the same year.
 */
export function sortExperienceItems(items: ExperienceItem[]): ExperienceItem[] {
  return [...items].sort((a, b) => {
    const aActive = !a["date-to"];
    const bActive = !b["date-to"];
    if (aActive !== bActive) return aActive ? -1 : 1;
    const aYear = a["date-from"] ? new Date(a["date-from"]).getFullYear() : 0;
    const bYear = b["date-from"] ? new Date(b["date-from"]).getFullYear() : 0;
    if (aYear !== bYear) return aYear - bYear;
    return a.title.localeCompare(b.title);
  });
}

export interface PortfolioMatrixRow {
  key: keyof PortfolioData["experience"];
  title: string;
  description: string;
}

export const PORTFOLIO_MATRIX_ROWS: PortfolioMatrixRow[] = [
  {
    key: "platforms",
    title: "Platforms",
    description: "Cloud & 3rd-party services",
  },
  {
    key: "protocols",
    title: "Protocols",
    description: "Integration standards implemented in production",
  },
  {
    key: "ai",
    title: "AI Developer Tools",
    description: "Workflow & automation",
  },
  {
    key: "frameworks",
    title: "Frameworks",
    description: "Libraries & SDKs across the stack",
  },
  {
    key: "languages",
    title: "Languages & DBs",
    description: "Written & queried daily",
  },
];

/**
 * Compact year range for matrix skill tags.
 * Active: "2023–"  |  Inactive same year: "2023"  |  Inactive: "2022–24"
 */
export function matrixYearLabel(item: ExperienceItem): string {
  const from = item["date-from"];
  if (!from) return "";
  const fromYear = new Date(from).getFullYear();
  if (!item["date-to"]) return `${fromYear}–`;
  const toYear = new Date(item["date-to"]).getFullYear();
  if (fromYear === toYear) return String(fromYear);
  return `${fromYear}–${String(toYear).slice(2)}`;
}

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
export function buildPortfolioHeroItems(expYears: number | null): PortfolioHeroItem[] {
  const items: PortfolioHeroItem[] = [];
  if (expYears !== null) {
    items.push({ label: `${expYears}+ yrs experience`, icon: Briefcase, kind: "stat" });
  }
  items.push(
    { label: "APIs & Integrations", icon: Link2,      kind: "stat" },
    { label: "Full-stack",          icon: Layers3,    kind: "stat" },
    { label: "FinTech",             icon: CreditCard, kind: "tag"  },
    { label: "EV Charging",         icon: Zap,        kind: "tag"  },
    { label: "Oil & Gas",           icon: Flame,      kind: "tag"  },
  );
  return items;
}

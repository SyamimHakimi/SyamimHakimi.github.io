import {
  Boxes,
  Code2,
  CreditCard,
  Shield,
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
 * Builds the compact hero summary items shown at the top of the portfolio page.
 *
 * @param pythonYears - Years of Python experience.
 * @param vueYears - Years of Vue experience.
 * @returns Ordered hero highlight items.
 */
export function buildPortfolioHeroItems(
  pythonYears: number | null,
  vueYears: number | null,
): PortfolioHeroItem[] {
  const items: PortfolioHeroItem[] = [];

  if (pythonYears) {
    items.push({
      label: `${pythonYears}+ yrs Python`,
      icon: Code2,
      kind: "stat",
    });
  }

  if (vueYears) {
    items.push({
      label: `${vueYears}+ yrs Vue`,
      icon: Boxes,
      kind: "stat",
    });
  }

  items.push({
    label: "AWS · Firebase",
    icon: Shield,
    kind: "stat",
  });
  items.push({
    label: "FinTech",
    icon: CreditCard,
    kind: "tag",
  });
  items.push({
    label: "EV Charging",
    icon: Zap,
    kind: "tag",
  });

  return items;
}

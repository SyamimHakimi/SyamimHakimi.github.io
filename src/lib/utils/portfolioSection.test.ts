import { describe, expect, it } from "vitest";
import {
  buildPortfolioHeroItems,
  PORTFOLIO_EXPERIENCE_SECTIONS,
} from "./portfolioSection";

describe("portfolioSection config", () => {
  it("keeps the experience sections ordered and defined", () => {
    expect(PORTFOLIO_EXPERIENCE_SECTIONS.map((section) => section.key)).toEqual(
      ["platforms", "protocols", "frameworks"],
    );
  });

  it("builds hero items from total experience years", () => {
    const items = buildPortfolioHeroItems(5);

    expect(items[0]?.label).toBe("5+ yrs experience");
    expect(items[1]?.label).toBe("APIs & Integrations");
    expect(items[2]?.label).toBe("Full-stack");
    expect(items.filter((item) => item.kind === "tag")).toHaveLength(3);
  });
});

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

  it("builds hero items from available experience years", () => {
    const items = buildPortfolioHeroItems(6, 4);

    expect(items[0]?.label).toBe("6+ yrs Python");
    expect(items[1]?.label).toBe("4+ yrs Vue");
    expect(items.filter((item) => item.kind === "tag")).toHaveLength(2);
  });
});

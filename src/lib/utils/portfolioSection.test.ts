import { describe, expect, it } from "vitest";
import {
  buildPortfolioHeroItems,
  PORTFOLIO_EXPERIENCE_SECTIONS,
  sortExperienceItems,
} from "./portfolioSection";

const item = (id: string, from: string, to?: string) => ({
  id,
  title: id,
  "date-from": from,
  "date-to": to,
});

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

  it("omits the years stat when expYears is null", () => {
    const items = buildPortfolioHeroItems(null);
    expect(items[0]?.label).toBe("APIs & Integrations");
    expect(items.some((item) => item.label.includes("yrs experience"))).toBe(false);
  });
});

describe("sortExperienceItems", () => {
  it("places active items before inactive", () => {
    const input = [
      item("inactive", "2020-01-01", "2022-01-01"),
      item("active", "2021-01-01"),
    ];
    const result = sortExperienceItems(input);
    expect(result[0]?.id).toBe("active");
    expect(result[1]?.id).toBe("inactive");
  });

  it("sorts active items by oldest start year first", () => {
    const input = [
      item("newer", "2023-01-01"),
      item("older", "2020-01-01"),
    ];
    const result = sortExperienceItems(input);
    expect(result.map((i) => i.id)).toEqual(["older", "newer"]);
  });

  it("sorts inactive items by oldest start year first", () => {
    const input = [
      item("started-late", "2022-01-01", "2024-06-01"),
      item("started-early", "2019-01-01", "2023-06-01"),
    ];
    const result = sortExperienceItems(input);
    expect(result.map((i) => i.id)).toEqual(["started-early", "started-late"]);
  });

  it("sorts alphabetically by title when start dates are equal", () => {
    const input = [
      item("Zebra", "2022-01-01"),
      item("Apple", "2022-01-01"),
    ];
    const result = sortExperienceItems(input);
    expect(result.map((i) => i.id)).toEqual(["Apple", "Zebra"]);
  });

  it("does not mutate the original array", () => {
    const input = [item("a", "2020-01-01", "2022-01-01"), item("b", "2021-01-01")];
    const original = [...input];
    sortExperienceItems(input);
    expect(input).toEqual(original);
  });
});

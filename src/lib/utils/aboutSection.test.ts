import { describe, expect, it } from "vitest";
import { boardgameTags, gearImage, gearMeta, socialIcon } from "./aboutSection";

describe("aboutSection helpers", () => {
  it("maps known gear types and images", () => {
    expect(gearMeta(1)).toBe("Body");
    expect(
      gearImage({
        id: "1",
        brand: "Fujifilm",
        name: "X-E4",
        type: 1,
      }),
    ).toBe("/media/gear/XE4.png");
  });

  it("maps social names and trims boardgame tags", () => {
    expect(socialIcon("GitHub")).toBe("/media/svg/social-logos/github.svg");
    expect(boardgameTags(" Engine, Co-op ,  ")).toEqual(["Engine", "Co-op"]);
  });
});

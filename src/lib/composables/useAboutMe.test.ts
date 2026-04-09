import { describe, it, expect } from "vitest";
import {
  ProfileSchema,
  PhotographyGearSchema,
  BoardgameSchema,
  SocialMediaSchema,
} from "./useAboutMe";

describe("ProfileSchema", () => {
  it("parses a valid profile document", () => {
    const result = ProfileSchema.parse({
      id: "ddIhV8IxV5DjciJY7UxW",
      Name: "Syamim Hakimi",
      Country: "Malaysia",
      "Residing Country": "Malaysia",
      Hobbies: "Boardgames, Photography",
    });
    expect(result.id).toBe("ddIhV8IxV5DjciJY7UxW");
    expect(result.Name).toBe("Syamim Hakimi");
  });

  it("accepts a profile with only required fields", () => {
    const result = ProfileSchema.parse({ id: "abc", Name: "Test" });
    expect(result.Country).toBeUndefined();
  });
});

describe("PhotographyGearSchema", () => {
  it("parses a camera body", () => {
    const result = PhotographyGearSchema.parse({
      id: "atr52Qv62UguiFhUJRXu",
      name: "X-E4",
      brand: "Fujifilm",
      type: 1,
      link: "https://fujifilm-x.com/en-my/products/cameras/x-e4/",
      "img-src": "media/gear/XE4.png",
    });
    expect(result.type).toBe(1);
    expect(result.brand).toBe("Fujifilm");
  });

  it("accepts gear without optional fields", () => {
    const result = PhotographyGearSchema.parse({
      id: "x",
      name: "Lens",
      brand: "Sigma",
      type: 2,
    });
    expect(result.link).toBeUndefined();
  });
});

describe("BoardgameSchema", () => {
  it("parses a boardgame entry", () => {
    const result = BoardgameSchema.parse({
      id: "iUMxdCoiU8NB3Ex0ZnSf",
      name: "Heat: Pedal to the Metal",
      score: 9.5,
      link: "https://boardgamegeek.com/boardgame/366013",
      tags: "Racing",
    });
    expect(result.score).toBe(9.5);
  });
});

describe("SocialMediaSchema", () => {
  it("parses a social media entry", () => {
    const result = SocialMediaSchema.parse({
      id: "QojWK47fl9oZAIQbji5s",
      name: "Email",
      text: "syamim.dev@tunasprism.com.my",
      link: "mailto:syamim.dev@tunasprism.com.my",
      icon: "bi bi-envelope",
      sorting: 1,
    });
    expect(result.sorting).toBe(1);
  });
});

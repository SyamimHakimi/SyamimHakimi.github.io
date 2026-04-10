import { describe, it, expect, expectTypeOf } from "vitest";
import {
  ExperienceItemSchema,
  ProjectDocumentSchema,
  TechstackItemSchema,
  type ExperienceItem,
  type ProjectDocument,
  type TechstackItem,
} from "./usePortfolio";

describe("ExperienceItemSchema", () => {
  it("parses an experience item with dates", () => {
    const result = ExperienceItemSchema.parse({
      id: "tSUKsViiHMZ6wa10iC6N",
      title: "Stripe",
      description: "A powerful API-driven Payment Gateway.",
      link: "https://stripe.com",
      "img-src": "media/brands/stripe.png",
      "date-from": "2023-04-30T16:00:00.864Z",
    });
    expect(result.title).toBe("Stripe");
    expect(result["date-from"]).toBe("2023-04-30T16:00:00.864Z");
  });

  it("accepts an experience item without optional fields", () => {
    const result = ExperienceItemSchema.parse({ id: "x", title: "Vue 3" });
    expect(result["date-to"]).toBeUndefined();
  });
});

describe("ProjectDocumentSchema", () => {
  it("parses a project document", () => {
    const result = ProjectDocumentSchema.parse({
      id: "XYdqe9OyXNSUEzZ8kqwn",
      title: "syamim.",
      subtitle: "My Journey Showcase",
      description: "A personalized website.",
    });
    expect(result.id).toBe("XYdqe9OyXNSUEzZ8kqwn");
  });
});

describe("TechstackItemSchema", () => {
  it("parses a techstack item", () => {
    const result = TechstackItemSchema.parse({
      id: "U75YQ0Ij4zFcqcN0L0Hh",
      title: "Vue 3",
      description: "The main front-end Framework used",
      link: "https://vuejs.org/",
      "img-src": "media/brands/vue.png",
      sorting: 1,
    });
    expect(result.sorting).toBe(1);
  });

  it("rejects a techstack item missing sorting", () => {
    expect(() =>
      TechstackItemSchema.parse({ id: "x", title: "Vue" }),
    ).toThrow();
  });
});

describe("ExperienceItem type", () => {
  it("has correct field types", () => {
    expectTypeOf<ExperienceItem["id"]>().toBeString();
    expectTypeOf<ExperienceItem["title"]>().toBeString();
    expectTypeOf<ExperienceItem["link"]>().toEqualTypeOf<string | undefined>();
    expectTypeOf<ExperienceItem["date-from"]>().toEqualTypeOf<
      string | undefined
    >();
  });
});

describe("ProjectDocument type", () => {
  it("has correct field types", () => {
    expectTypeOf<ProjectDocument["id"]>().toBeString();
    expectTypeOf<ProjectDocument["title"]>().toBeString();
    expectTypeOf<ProjectDocument["subtitle"]>().toEqualTypeOf<
      string | undefined
    >();
  });
});

describe("TechstackItem type", () => {
  it("has correct field types", () => {
    expectTypeOf<TechstackItem["id"]>().toBeString();
    expectTypeOf<TechstackItem["title"]>().toBeString();
    expectTypeOf<TechstackItem["sorting"]>().toBeNumber();
  });
});

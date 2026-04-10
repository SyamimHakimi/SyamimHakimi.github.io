import { describe, it, expect, expectTypeOf } from "vitest";
import { ServiceSchema, type Service } from "./useServices";

describe("ServiceSchema", () => {
  it("parses a valid service document", () => {
    const result = ServiceSchema.parse({
      id: "2eQDNhBrJruiMRiHOzav",
      title: "Custom Web Application",
      description: "Creating web applications from scratch",
      icon: "screen",
      group: 4,
      sorting: 1,
    });
    expect(result.group).toBe(4);
    expect(result.sorting).toBe(1);
  });

  it("rejects a service missing required fields", () => {
    expect(() =>
      ServiceSchema.parse({ id: "x", title: "Incomplete" }),
    ).toThrow();
  });
});

describe("Service type", () => {
  it("has correct field types", () => {
    expectTypeOf<Service["id"]>().toBeString();
    expectTypeOf<Service["title"]>().toBeString();
    expectTypeOf<Service["description"]>().toBeString();
    expectTypeOf<Service["icon"]>().toBeString();
    expectTypeOf<Service["group"]>().toBeNumber();
    expectTypeOf<Service["sorting"]>().toBeNumber();
  });
});

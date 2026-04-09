import { describe, it, expect } from "vitest";
import { ServiceSchema } from "./useServices";

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

import { describe, it, expect } from "vitest";
import { PhotoSchema } from "./useGallery";

describe("PhotoSchema", () => {
  it("parses a photo with all fields", () => {
    const result = PhotoSchema.parse({
      id: "EwhCucjUPF4jfheZeTag",
      date: "2025-02-26T16:00:00.412Z",
      theme: "Portrait",
      lens: "56mm F1.7 APS-C",
      focal_length: 84,
      recipe: "Nurture Nature",
      title: "red and green",
      link: "https://firebasestorage.googleapis.com/v0/b/portfolio-9e62d.firebasestorage.app/o/0020-3.png?alt=media&token=887acbdf-4faa-428f-b7af-fecfd570bf94",
      favourite: true,
    });
    expect(result.favourite).toBe(true);
    expect(result.focal_length).toBe(84);
  });

  it("parses a minimal photo with only required fields", () => {
    const result = PhotoSchema.parse({
      id: "abc",
      date: "2025-01-01T00:00:00.000Z",
    });
    expect(result.title).toBeUndefined();
    expect(result.favourite).toBeUndefined();
  });

  it("rejects a photo missing date", () => {
    expect(() => PhotoSchema.parse({ id: "abc" })).toThrow();
  });
});

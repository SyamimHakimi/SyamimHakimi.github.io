import { describe, expect, it } from "vitest";
import type { Service } from "../composables/useServices";
import {
  getServiceGroupMeta,
  groupServices,
  SERVICE_CARD_TAGS,
  SERVICES_OVERVIEW_METRICS,
} from "./servicesSection";

const services: Service[] = [
  {
    id: "service-a",
    title: "Feature Implementation",
    description: "Build scoped features.",
    icon: "code",
    group: 1,
    sorting: 1,
  },
  {
    id: "service-b",
    title: "UX Polish",
    description: "Refine interaction quality.",
    icon: "sparkles",
    group: 1,
    sorting: 2,
  },
  {
    id: "service-c",
    title: "API Design",
    description: "Shape data models.",
    icon: "database",
    group: 2,
    sorting: 1,
  },
];

describe("getServiceGroupMeta", () => {
  it("returns configured metadata for known groups", () => {
    expect(getServiceGroupMeta(1)).toMatchObject({
      title: "Product Delivery",
      icon: "build",
    });
  });

  it("returns a safe fallback for unknown groups", () => {
    expect(getServiceGroupMeta(9)).toEqual({
      title: "Service Group 9",
      description:
        "Specialized engineering support scoped around delivery needs.",
      summary: "Specialized support",
      icon: "scope",
    });
  });
});

describe("groupServices", () => {
  it("groups services by group id and preserves Firestore order", () => {
    const result = groupServices(services);

    expect(result.map((group) => group.id)).toEqual([1, 2]);
    expect(result[0]?.services.map((service) => service.id)).toEqual([
      "service-a",
      "service-b",
    ]);
    expect(result[1]?.services.map((service) => service.id)).toEqual([
      "service-c",
    ]);
  });
});

describe("shared service presentation constants", () => {
  it("exposes stable overview metrics for the services hero", () => {
    expect(SERVICES_OVERVIEW_METRICS).toHaveLength(3);
    expect(SERVICES_OVERVIEW_METRICS[0]).toMatchObject({
      value: "3",
    });
  });

  it("keeps the shared footer tags used by service cards", () => {
    expect(SERVICE_CARD_TAGS).toEqual(["Scoped delivery", "Review-ready"]);
  });
});

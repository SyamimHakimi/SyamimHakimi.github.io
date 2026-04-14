import type { Service } from "../composables/useServices";

export interface ServiceGroupMeta {
  title: string;
  description: string;
  summary: string;
  icon: "build" | "refine" | "data" | "platform" | "review" | "scope";
}

export interface ServiceGroup {
  id: number;
  meta: ServiceGroupMeta;
  services: Service[];
}

export interface ServiceOverviewMetric {
  value: string;
  description: string;
}

const GROUP_META: Record<number, ServiceGroupMeta> = {
  1: {
    title: "Product Delivery",
    description:
      "For work that needs to get built, refined, and shipped without turning into generic product UI.",
    summary: "Build and refine",
    icon: "build",
  },
  2: {
    title: "Platform and Data",
    description:
      "For the structural work underneath the UI: schemas, APIs, runtime content, and delivery systems.",
    summary: "Model and platform",
    icon: "data",
  },
  3: {
    title: "Hardening and Review",
    description:
      "For teams that need sharper review, stronger testing posture, or help getting a redesign over the line.",
    summary: "Review and support",
    icon: "review",
  },
};

/** Shared overview metrics used in the services page intro. */
export const SERVICES_OVERVIEW_METRICS: readonly ServiceOverviewMetric[] = [
  {
    value: "3",
    description:
      "Service groups with a consistent structure and one clear CTA path.",
  },
  {
    value: "48px",
    description:
      "Minimum target for icon-disc affordances and primary action controls.",
  },
  {
    value: "1",
    description:
      "Primary route to contact, kept stable across mobile and desktop.",
  },
];

/** Shared footer tags for individual service cards. */
export const SERVICE_CARD_TAGS = ["Scoped delivery", "Review-ready"] as const;

/**
 * Returns the presentation metadata for a service group.
 *
 * @param groupId Firestore-defined numeric group identifier.
 * @returns User-facing label, description, and icon mapping for the group.
 */
export function getServiceGroupMeta(groupId: number): ServiceGroupMeta {
  return (
    GROUP_META[groupId] ?? {
      title: `Service Group ${groupId}`,
      description:
        "Specialized engineering support scoped around delivery needs.",
      summary: "Specialized support",
      icon: "scope",
    }
  );
}

/**
 * Groups services by their Firestore-controlled group id while preserving input order.
 *
 * @param services Ordered services fetched from Firestore.
 * @returns Grouped service sections ready for rendering.
 */
export function groupServices(services: Service[]): ServiceGroup[] {
  const grouped = new Map<number, Service[]>();

  for (const service of services) {
    if (!grouped.has(service.group)) grouped.set(service.group, []);
    grouped.get(service.group)!.push(service);
  }

  return [...grouped.entries()].map(([id, groupedServices]) => ({
    id,
    meta: getServiceGroupMeta(id),
    services: groupedServices,
  }));
}

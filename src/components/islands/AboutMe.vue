<script setup lang="ts">
/**
 * AboutMe — profile, photography gear, favourite boardgames, and social links.
 * Island: client:visible
 * Composable: useAboutMe()
 */
import { computed } from "vue";
import { User, Camera, Layers3, MessageSquare } from "lucide-vue-next";
import {
  useAboutMe,
  type PhotographyGear,
} from "../../lib/composables/useAboutMe";
import SectionHeader from "../ui/SectionHeader.vue";
import ErrorAlert from "../ui/ErrorAlert.vue";

const { data, loading, error } = useAboutMe();

/* ── Gear helpers ──────────────────────────────────────────────────────── */

const GEAR_TYPE_LABEL: Record<number, string> = {
  1: "Camera Body",
  2: "Lenses",
  3: "Lenses",
};

const GEAR_TYPE_META: Record<number, string> = {
  1: "Body",
  2: "Zoom",
  3: "Prime",
};

const gearGroups = computed<[string, PhotographyGear[]][]>(() => {
  const groups = new Map<string, PhotographyGear[]>();
  for (const item of data.value.gear) {
    const label = GEAR_TYPE_LABEL[item.type] ?? "Accessories";
    if (!groups.has(label)) groups.set(label, []);
    groups.get(label)!.push(item);
  }
  return [...groups.entries()];
});

function gearMeta(type: number): string {
  return GEAR_TYPE_META[type] ?? "";
}

/* ── Boardgame helpers ─────────────────────────────────────────────────── */

function boardgameTags(tags: string | undefined): string[] {
  return tags
    ? tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : [];
}
</script>

<template>
  <div>
    <!-- ── Loading ─────────────────────────────────────────────────────── -->
    <div v-if="loading" class="space-y-6" aria-busy="true" aria-label="Loading profile">
      <div class="skeleton-rect h-[400px] w-full" />
      <div class="skeleton-rect h-56 w-full" />
      <div class="skeleton-rect h-44 w-full" />
      <div class="skeleton-line mt-2 w-2/3" />
    </div>

    <!-- ── Error ───────────────────────────────────────────────────────── -->
    <ErrorAlert
      v-else-if="error"
      title="Failed to load profile"
      :message="error"
    />

    <!-- ── Content ─────────────────────────────────────────────────────── -->
    <div v-else class="space-y-8">

      <!-- Hero card ──────────────────────────────────────────────────── -->
      <section
        class="grid gap-5 rounded-[28px] border border-[var(--color-outline)] bg-[var(--color-surface)] p-6 md:p-8"
        aria-label="About Syamim"
      >
        <!-- Eyebrow -->
        <p
          class="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.11em] text-[var(--color-on-surface-variant)]"
        >
          <span
            class="h-2 w-2 rounded-full bg-[var(--color-cta)]"
            aria-hidden="true"
          />
          About Syamim
        </p>

        <!-- Title + subtitle -->
        <div>
          <h1
            class="font-serif text-[clamp(2.125rem,6vw,3.625rem)] leading-[0.98] tracking-[-0.03em]"
          >
            The person behind the work.
          </h1>
          <p
            class="mt-4 max-w-[52ch] text-base text-[var(--color-on-surface-variant)]"
          >
            A profile-first read on who I am, what I spend time on, and how
            software, photography, and boardgames fit together.
          </p>
        </div>

        <!-- Two-column: profile card + visual panel -->
        <div class="grid gap-4 md:grid-cols-[1.1fr_0.9fr] md:items-start">

          <!-- Profile card -->
          <div
            v-if="data.profile"
            class="grid gap-4 rounded-[24px] border border-[var(--color-outline)] bg-[var(--color-surface)] p-5"
          >
            <!-- Avatar + name row -->
            <div class="flex items-start gap-4">
              <div
                class="flex h-[76px] w-[76px] shrink-0 items-center justify-center rounded-[24px] bg-[color:var(--color-cta-soft,rgba(37,99,235,0.1))] text-[var(--color-cta)]"
                aria-hidden="true"
              >
                <User :size="30" :stroke-width="1.75" />
              </div>
              <div>
                <h2 class="font-serif text-[2.125rem] leading-none">
                  {{ data.profile.Name }}
                </h2>
                <p class="mt-1.5 text-sm text-[var(--color-on-surface-variant)]">
                  {{ data.profile["Residing Country"] ?? data.profile.Country }}
                </p>
              </div>
            </div>

            <!-- Hobbies -->
            <p
              v-if="data.profile.Hobbies"
              class="max-w-[52ch] text-[15px] text-[var(--color-on-surface)]"
            >
              {{ data.profile.Hobbies }}
            </p>

            <!-- Interest grid (static) -->
            <div class="grid gap-2.5 sm:grid-cols-3">
              <div
                class="grid gap-1.5 rounded-[18px] border border-[var(--color-outline)] bg-[var(--color-surface-variant)] p-3.5"
              >
                <strong
                  class="text-[11px] font-bold uppercase tracking-[0.09em] text-[var(--color-on-surface-variant)]"
                  >Software</strong
                >
                <span class="text-sm text-[var(--color-on-surface)]"
                  >Frontend-heavy engineering, product polish, and shipping
                  practical systems.</span
                >
              </div>
              <div
                class="grid gap-1.5 rounded-[18px] border border-[var(--color-outline)] bg-[var(--color-surface-variant)] p-3.5"
              >
                <strong
                  class="text-[11px] font-bold uppercase tracking-[0.09em] text-[var(--color-on-surface-variant)]"
                  >Photography</strong
                >
                <span class="text-sm text-[var(--color-on-surface)]"
                  >Street, travel, and everyday scenes with compact gear that
                  stays easy to carry.</span
                >
              </div>
              <div
                class="grid gap-1.5 rounded-[18px] border border-[var(--color-outline)] bg-[var(--color-surface-variant)] p-3.5"
              >
                <strong
                  class="text-[11px] font-bold uppercase tracking-[0.09em] text-[var(--color-on-surface-variant)]"
                  >Boardgames</strong
                >
                <span class="text-sm text-[var(--color-on-surface)]"
                  >Games with tension, replayability, and enough interaction to
                  stay memorable.</span
                >
              </div>
            </div>

            <!-- Social chips row -->
            <div
              v-if="data.socialMedia.length > 0"
              class="flex flex-wrap gap-2.5"
              role="list"
              aria-label="Social links"
            >
              <a
                v-for="social in data.socialMedia"
                :key="social.id"
                :href="social.link"
                :target="social.link.startsWith('mailto:') ? undefined : '_blank'"
                rel="noopener noreferrer"
                role="listitem"
                class="inline-flex min-h-[40px] items-center rounded-full border border-[var(--color-outline)] bg-[var(--color-surface-variant)] px-3.5 text-[13px] font-medium text-[var(--color-on-surface)] transition-all duration-150 hover:border-[var(--color-cta)] hover:text-[var(--color-cta)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-cta)] focus-visible:ring-offset-2"
              >
                {{ social.name }} — {{ social.text }}
              </a>
            </div>
          </div>

          <!-- Visual panel (decorative, hidden on mobile) -->
          <aside
            class="hidden rounded-[24px] border border-[var(--color-outline)] bg-[var(--color-surface)] p-5 md:block"
            aria-hidden="true"
          >
            <div class="grid grid-cols-[1.15fr_0.85fr] gap-3">
              <!-- Tall frame -->
              <div
                class="min-h-[308px] rounded-[20px] border border-[var(--color-outline)] bg-gradient-to-br from-[var(--color-surface-variant)] to-[color-mix(in_srgb,var(--color-outline)_60%,var(--color-surface))]"
              />
              <!-- Two stacked frames -->
              <div class="grid gap-3">
                <div
                  class="min-h-[148px] rounded-[20px] border border-[var(--color-outline)] bg-gradient-to-br from-[color-mix(in_srgb,var(--color-surface-variant)_80%,var(--color-outline))] to-[var(--color-surface-variant)]"
                />
                <div
                  class="min-h-[148px] rounded-[20px] border border-[var(--color-outline)] bg-gradient-to-br from-[var(--color-surface-variant)] to-[color-mix(in_srgb,var(--color-surface-variant)_80%,var(--color-outline))]"
                />
              </div>
            </div>
          </aside>

        </div>
      </section>

      <!-- Section stack ───────────────────────────────────────────────── -->
      <div class="mx-auto grid max-w-[860px] gap-5">

        <!-- Photography Gear ─────────────────────────────────────────── -->
        <section
          v-if="data.gear.length > 0"
          class="rounded-[22px] border border-[var(--color-outline)] bg-[var(--color-surface)] p-5"
          aria-label="Photography gear"
        >
          <!-- Section header -->
          <SectionHeader
            :icon="Camera"
            title="Photography Gear"
            subtitle="Grouped by type — the current carry setup for street and travel."
          />

          <!-- Gear groups -->
          <div class="grid gap-3.5">
            <div v-for="[label, items] in gearGroups" :key="label">
              <p
                class="mb-2.5 text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--color-on-surface-variant)]"
              >
                {{ label }}
              </p>
              <div class="grid gap-3 sm:grid-cols-2">
                <article
                  v-for="item in items"
                  :key="item.id"
                  class="rounded-2xl border border-[var(--color-outline)] bg-[var(--color-surface-variant)] p-3.5"
                >
                  <strong class="block text-[15px] font-semibold">
                    {{ item.brand }} {{ item.name }}
                  </strong>
                  <a
                    v-if="item.link"
                    :href="item.link"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="mt-2 inline-flex min-h-[26px] items-center rounded-full bg-[color:var(--color-cta-soft,rgba(37,99,235,0.1))] px-2.5 text-[11px] font-bold uppercase tracking-[0.06em] text-[var(--color-cta)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-cta)]"
                  >
                    {{ gearMeta(item.type) }}
                  </a>
                  <span
                    v-else
                    class="mt-2 inline-flex min-h-[26px] items-center rounded-full bg-[color:var(--color-cta-soft,rgba(37,99,235,0.1))] px-2.5 text-[11px] font-bold uppercase tracking-[0.06em] text-[var(--color-cta)]"
                  >
                    {{ gearMeta(item.type) }}
                  </span>
                </article>
              </div>
            </div>
          </div>
        </section>

        <!-- Favourite Boardgames ─────────────────────────────────────── -->
        <section
          v-if="data.boardgames.length > 0"
          class="rounded-[22px] border border-[var(--color-outline)] bg-[var(--color-surface)] p-5"
          aria-label="Favourite boardgames"
        >
          <!-- Section header -->
          <SectionHeader
            :icon="Layers3"
            title="Favourite Boardgames"
            subtitle="A horizontal strip keeps the section tactile without overwhelming the page."
          />

          <!-- Scroll hint -->
          <div
            class="mb-3 flex flex-wrap items-center justify-between gap-3 text-[var(--color-on-surface-variant)]"
          >
            <strong
              class="text-[11px] font-bold uppercase tracking-[0.1em]"
            >
              Scroll to browse
            </strong>
            <span class="text-xs">Swipe or trackpad-scroll to see more.</span>
          </div>

          <!-- Horizontal scroller -->
          <div
            class="overflow-x-auto pb-1.5 [scrollbar-width:thin] [scrollbar-color:var(--color-outline)_transparent]"
            style="
              display: grid;
              grid-auto-flow: column;
              grid-auto-columns: minmax(240px, 280px);
              gap: 12px;
              scroll-snap-type: x proximity;
              mask-image: linear-gradient(90deg, transparent 0, black 16px, black calc(100% - 28px), transparent 100%);
            "
            role="list"
            aria-label="Favourite boardgames"
          >
            <article
              v-for="game in data.boardgames"
              :key="game.id"
              class="rounded-[18px] border border-[var(--color-outline)] p-[18px] [scroll-snap-align:start]"
              style="
                background: linear-gradient(
                  180deg,
                  var(--color-surface) 0%,
                  var(--color-surface-variant) 100%
                );
              "
              role="listitem"
            >
              <span
                class="inline-flex min-h-[28px] items-center rounded-full bg-[color:var(--color-cta-soft,rgba(37,99,235,0.1))] px-2.5 text-xs font-bold text-[var(--color-cta)]"
              >
                {{ game.score }}
              </span>
              <h3
                class="mt-3 font-serif text-[24px] leading-[1.04]"
              >
                {{ game.name.trim() }}
              </h3>
              <div class="mt-3.5 flex flex-wrap gap-2">
                <span
                  v-for="tag in boardgameTags(game.tags)"
                  :key="tag"
                  class="inline-flex min-h-[28px] items-center rounded-full border border-[var(--color-outline)] bg-[var(--color-surface)] px-2.5 text-xs font-medium text-[var(--color-on-surface-variant)]"
                >
                  {{ tag }}
                </span>
              </div>
            </article>
          </div>
        </section>

        <!-- Connect ─────────────────────────────────────────────────── -->
        <section
          v-if="data.socialMedia.length > 0"
          class="rounded-[22px] border border-[var(--color-outline)] bg-[var(--color-surface)] p-5"
          aria-label="Connect"
        >
          <!-- Section header -->
          <SectionHeader
            :icon="MessageSquare"
            title="Connect"
            subtitle="Direct links — recognizable platform names first, then a short qualifier."
          />

          <!-- Social chips -->
          <div
            class="flex flex-wrap gap-2.5"
            role="list"
            aria-label="Social links"
          >
            <a
              v-for="social in data.socialMedia"
              :key="social.id"
              :href="social.link"
              :target="social.link.startsWith('mailto:') ? undefined : '_blank'"
              rel="noopener noreferrer"
              role="listitem"
              class="inline-flex min-h-[40px] items-center rounded-full border border-[var(--color-outline)] bg-[var(--color-surface-variant)] px-3.5 text-[13px] font-medium text-[var(--color-on-surface)] transition-all duration-150 hover:border-[var(--color-cta)] hover:text-[var(--color-cta)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-cta)] focus-visible:ring-offset-2"
            >
              {{ social.name }} — {{ social.text }}
            </a>
          </div>
        </section>

      </div>
    </div>
  </div>
</template>

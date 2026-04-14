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

const GEAR_TYPE_META: Record<number, string> = {
  1: "Body",
  2: "Zoom",
  3: "Prime",
};

/** Gear sorted Body → Zoom → Prime for the product-card grid. */
const sortedGear = computed(() =>
  [...data.value.gear].sort((a, b) => a.type - b.type),
);

function gearMeta(type: number): string {
  return GEAR_TYPE_META[type] ?? "";
}

/** Maps brand + name to a local product image path. */
const GEAR_IMAGE: Record<string, string> = {
  "Fujifilm X-E4": "/media/gear/XE4.png",
  "Sigma 10-18mm F2.8 DC DN": "/media/gear/Sigma10-18.png",
  "Sigma 18-50mm F2.8 DC DN": "/media/gear/Sigma18-50.png",
  "Viltrox 56mm F1.7 APS-C": "/media/gear/Viltrox56.png",
};

function gearImage(item: PhotographyGear): string | null {
  return GEAR_IMAGE[`${item.brand} ${item.name}`] ?? null;
}

/* ── Social helpers ────────────────────────────────────────────────────── */

/** Maps social platform name to a local SVG icon path. */
const SOCIAL_ICON: Record<string, string> = {
  email: "/media/svg/social-logos/email.svg",
  github: "/media/svg/social-logos/github.svg",
  linkedin: "/media/svg/social-logos/linkedin.svg",
  instagram: "/media/svg/social-logos/instagram.svg",
  twitter: "/media/svg/social-logos/twitter.svg",
  facebook: "/media/svg/social-logos/facebook.svg",
  youtube: "/media/svg/social-logos/youtube.svg",
  dribbble: "/media/svg/social-logos/dribbble.svg",
  google: "/media/svg/social-logos/google.svg",
};

function socialIcon(name: string): string | null {
  return SOCIAL_ICON[name.toLowerCase()] ?? null;
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
    <div
      v-if="loading"
      class="space-y-6"
      aria-busy="true"
      aria-label="Loading profile"
    >
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
      <!-- Profile card + visual panel ───────────────────────────────── -->
      <section
        class="grid gap-4 rounded-[20px] border border-[var(--color-outline)] bg-[var(--color-surface)] p-4 sm:rounded-[28px] sm:p-6 md:p-8"
        aria-label="About Syamim"
      >
        <!-- Two-column: profile card + visual panel -->
        <div class="grid gap-4 md:grid-cols-[1.1fr_0.9fr] md:items-start">
          <!-- Profile card -->
          <div
            v-if="data.profile"
            class="grid gap-4 rounded-[18px] border border-[var(--color-outline)] bg-[var(--color-surface)] p-4 sm:rounded-[24px] sm:p-5"
          >
            <!-- Avatar + name row -->
            <div class="flex items-start gap-3">
              <div
                class="flex h-[56px] w-[56px] shrink-0 items-center justify-center rounded-[18px] bg-[color:var(--color-cta-soft)] text-[var(--color-cta)] sm:h-[76px] sm:w-[76px] sm:rounded-[24px]"
                aria-hidden="true"
              >
                <User :size="24" :stroke-width="1.75" class="sm:hidden" />
                <User :size="30" :stroke-width="1.75" class="hidden sm:block" />
              </div>
              <div>
                <h2
                  class="font-serif text-[1.625rem] leading-none sm:text-[2.125rem]"
                >
                  {{ data.profile.Name }}
                </h2>
                <p
                  class="mt-1.5 text-sm text-[var(--color-on-surface-variant)]"
                >
                  {{ data.profile["Residing Country"] ?? data.profile.Country }}
                </p>
              </div>
            </div>

            <!-- Hobbies -->
            <p
              v-if="data.profile.Hobbies"
              class="text-[15px] text-[var(--color-on-surface)]"
            >
              {{ data.profile.Hobbies }}
            </p>

            <!-- Interest grid (static) -->
            <div class="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-2.5">
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
      <div class="grid gap-5">
        <!-- Photography Gear ─────────────────────────────────────────── -->
        <section
          v-if="data.gear.length > 0"
          class="overflow-hidden rounded-[18px] border border-[var(--color-outline)] bg-[var(--color-surface)] p-4 sm:rounded-[22px] sm:p-5"
          aria-label="Photography gear"
        >
          <!-- Section header -->
          <SectionHeader
            :icon="Camera"
            title="Photography Gear"
            subtitle="Grouped by type — the current carry setup for street and travel."
          />

          <!-- Product-card grid — image is the hero, 2-col → 4-col -->
          <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <a
              v-for="item in sortedGear"
              :key="item.id"
              :href="item.link || undefined"
              :target="item.link ? '_blank' : undefined"
              rel="noopener noreferrer"
              :role="item.link ? 'link' : undefined"
              class="group flex flex-col overflow-hidden rounded-[16px] border border-[var(--color-outline)] transition-shadow duration-150"
              :class="
                item.link ? 'hover:shadow-md cursor-pointer' : 'cursor-default'
              "
              style="background: var(--color-surface-variant)"
            >
              <!-- Image area — white bg, takes most of the card -->
              <div
                class="flex aspect-square w-full items-center justify-center bg-white p-4"
              >
                <img
                  v-if="gearImage(item)"
                  :src="gearImage(item)!"
                  :alt="item.brand + ' ' + item.name"
                  class="h-full w-full object-contain transition-transform duration-200 group-hover:scale-105"
                  width="120"
                  height="120"
                  loading="lazy"
                />
              </div>

              <!-- Info strip -->
              <div class="flex flex-col gap-0.5 px-3 py-2.5">
                <div class="flex items-center justify-between gap-1">
                  <p
                    class="text-[10px] font-semibold uppercase tracking-[0.09em] text-[var(--color-on-surface-variant)]"
                  >
                    {{ item.brand }}
                  </p>
                  <span
                    class="shrink-0 rounded-full bg-[color:var(--color-cta-soft)] px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.06em] text-[var(--color-cta)]"
                  >
                    {{ gearMeta(item.type) }}
                  </span>
                </div>
                <strong
                  class="block truncate text-[12px] font-medium leading-snug text-[var(--color-on-surface)]"
                >
                  {{ item.name }}
                </strong>
              </div>
            </a>
          </div>
        </section>

        <!-- Favourite Boardgames ─────────────────────────────────────── -->
        <section
          v-if="data.boardgames.length > 0"
          class="overflow-hidden rounded-[18px] border border-[var(--color-outline)] bg-[var(--color-surface)] p-4 sm:rounded-[22px] sm:p-5"
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
            <strong class="text-[11px] font-bold uppercase tracking-[0.1em]">
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
              mask-image: linear-gradient(
                90deg,
                transparent 0,
                black 16px,
                black calc(100% - 28px),
                transparent 100%
              );
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
                class="inline-flex min-h-[28px] items-center rounded-full bg-[color:var(--color-cta-soft)] px-2.5 text-xs font-bold text-[var(--color-cta)]"
              >
                {{ game.score }}
              </span>
              <h3 class="mt-3 font-serif text-[24px] leading-[1.04]">
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
          class="overflow-hidden rounded-[18px] border border-[var(--color-outline)] bg-[var(--color-surface)] p-4 sm:rounded-[22px] sm:p-5"
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
              class="inline-flex max-w-full min-h-[40px] items-center gap-2 rounded-full border border-[var(--color-outline)] bg-[var(--color-surface-variant)] px-3.5 text-[13px] font-medium text-[var(--color-on-surface)] transition-all duration-150 hover:border-[var(--color-cta)] hover:text-[var(--color-cta)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-cta)] focus-visible:ring-offset-2"
            >
              <img
                v-if="socialIcon(social.name)"
                :src="socialIcon(social.name)!"
                :alt="social.name"
                class="h-4 w-4 shrink-0 object-contain opacity-70"
                aria-hidden="true"
              />
              {{ social.name }} — {{ social.text }}
            </a>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

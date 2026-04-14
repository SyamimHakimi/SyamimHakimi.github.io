<script setup lang="ts">
/**
 * AboutMe — profile, photography gear, favourite boardgames, and social links.
 * Island: client:visible
 * Composable: useAboutMe()
 */
import { computed } from "vue";
import { User, Camera, Layers3, MessageSquare } from "lucide-vue-next";
import { useAboutMe } from "../../lib/composables/useAboutMe";
import {
  ABOUT_VISUAL_FRAMES,
  PROFILE_INTERESTS,
  boardgameTags,
  gearImage,
  gearMeta,
  socialIcon,
} from "../../lib/utils/aboutSection";
import SectionHeader from "../ui/SectionHeader.vue";
import DetailTileGrid from "../ui/DetailTileGrid.vue";
import ErrorAlert from "../ui/ErrorAlert.vue";

const { data, loading, error } = useAboutMe();

/** Gear sorted Body → Zoom → Prime for the product-card grid. */
const sortedGear = computed(() =>
  [...data.value.gear].sort((a, b) => a.type - b.type),
);
</script>

<template>
  <div>
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

    <ErrorAlert
      v-else-if="error"
      title="Failed to load profile"
      :message="error"
    />

    <div v-else class="space-y-8">
      <section
        class="panel-shell grid gap-4 p-4 sm:p-6 md:p-8"
        aria-label="About Syamim"
      >
        <div class="grid gap-4 md:grid-cols-[1.1fr_0.9fr] md:items-start">
          <div
            v-if="data.profile"
            class="grid gap-4 rounded-[18px] border border-[var(--color-outline)] bg-[var(--color-surface)] p-4 sm:rounded-[24px] sm:p-5"
          >
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

            <p
              v-if="data.profile.Hobbies"
              class="text-[15px] text-[var(--color-on-surface)]"
            >
              {{ data.profile.Hobbies }}
            </p>

            <DetailTileGrid
              :items="[...PROFILE_INTERESTS]"
              columns-class="grid-cols-2 sm:grid-cols-3"
            />
          </div>

          <aside
            class="hidden rounded-[24px] border border-[var(--color-outline)] bg-[var(--color-surface)] p-5 md:block"
            aria-hidden="true"
          >
            <div class="grid grid-cols-[1.15fr_0.85fr] gap-3">
              <div :class="ABOUT_VISUAL_FRAMES[0]?.className" />
              <div class="grid gap-3">
                <div
                  v-for="frame in ABOUT_VISUAL_FRAMES.slice(1)"
                  :key="frame.className"
                  :class="frame.className"
                />
              </div>
            </div>
          </aside>
        </div>
      </section>

      <div class="grid gap-5">
        <section
          v-if="data.gear.length > 0"
          class="overflow-hidden rounded-[18px] border border-[var(--color-outline)] bg-[var(--color-surface)] p-4 sm:rounded-[22px] sm:p-5"
          aria-label="Photography gear"
        >
          <SectionHeader
            :icon="Camera"
            title="Photography Gear"
            subtitle="Grouped by type — the current carry setup for street and travel."
          />

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
                item.link ? 'cursor-pointer hover:shadow-md' : 'cursor-default'
              "
              style="background: var(--color-surface-variant)"
            >
              <div
                class="flex aspect-square w-full items-center justify-center bg-white p-4"
              >
                <img
                  v-if="gearImage(item)"
                  :src="gearImage(item)!"
                  :alt="`${item.brand} ${item.name}`"
                  class="h-full w-full object-contain transition-transform duration-200 group-hover:scale-105"
                  width="120"
                  height="120"
                  loading="lazy"
                />
              </div>

              <div class="flex flex-col gap-0.5 px-3 py-2.5">
                <div class="flex items-center justify-between gap-1">
                  <p
                    class="text-[10px] font-semibold uppercase tracking-[0.09em] text-[var(--color-on-surface-variant)]"
                  >
                    {{ item.brand }}
                  </p>
                  <span
                    class="pill pill--accent shrink-0 min-h-0 px-2 py-0.5 text-[9px] tracking-[0.06em]"
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

        <section
          v-if="data.boardgames.length > 0"
          class="overflow-hidden rounded-[18px] border border-[var(--color-outline)] bg-[var(--color-surface)] p-4 sm:rounded-[22px] sm:p-5"
          aria-label="Favourite boardgames"
        >
          <SectionHeader
            :icon="Layers3"
            title="Favourite Boardgames"
            subtitle="A horizontal strip keeps the section tactile without overwhelming the page."
          />

          <div
            class="mb-3 flex flex-wrap items-center justify-between gap-3 text-[var(--color-on-surface-variant)]"
          >
            <strong class="text-[11px] font-bold uppercase tracking-[0.1em]">
              Scroll to browse
            </strong>
            <span class="text-xs">Swipe or trackpad-scroll to see more.</span>
          </div>

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
                  class="pill"
                >
                  {{ tag }}
                </span>
              </div>
            </article>
          </div>
        </section>

        <section
          v-if="data.socialMedia.length > 0"
          class="overflow-hidden rounded-[18px] border border-[var(--color-outline)] bg-[var(--color-surface)] p-4 sm:rounded-[22px] sm:p-5"
          aria-label="Connect"
        >
          <SectionHeader
            :icon="MessageSquare"
            title="Connect"
            subtitle="Direct links — recognizable platform names first, then a short qualifier."
          />

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
              class="pill pill--soft pill-link max-w-full min-h-[40px] px-3.5 text-[13px] text-[var(--color-on-surface)]"
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

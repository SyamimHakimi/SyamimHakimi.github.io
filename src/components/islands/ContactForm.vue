<script setup lang="ts">
import { Mail, Linkedin, Instagram, ExternalLink, type LucideComponent } from "lucide-vue-next";
import DetailTileGrid from "../ui/DetailTileGrid.vue";

const contactNotes = [
  {
    title: "Best for",
    description:
      "Project inquiries, frontend work, product polish, and collaborations with a clear scope.",
  },
  {
    title: "Reply style",
    description:
      "Short, direct replies first. If the project fits, follow-up moves into details quickly.",
  },
  {
    title: "Useful details",
    description:
      "Timeline, rough scope, and what kind of help you need make the first reply faster.",
  },
];

const socialLinks: { icon: LucideComponent; label: string; href: string }[] = [
  {
    icon: Linkedin,
    label: "Syamim Hakimi",
    href: "https://www.linkedin.com/in/syamim-hakimi-33717518a/",
  },
  {
    icon: Instagram,
    label: "@syamimhakimi",
    href: "https://www.instagram.com/syamimhakimi/",
  },
];
</script>

<template>
  <section class="panel-shell grid gap-5 p-6 md:p-8" aria-label="Contact">
    <div
      class="grid gap-5 md:grid-cols-[minmax(280px,0.85fr)_minmax(0,1.15fr)] md:items-start"
    >
      <!-- Info card ────────────────────────────────────────────────── -->
      <aside
        class="panel-shell panel-shell--lg grid gap-5 p-[22px] md:sticky md:top-24"
        aria-label="Contact information"
      >
        <DetailTileGrid
          :items="contactNotes"
          columns-class="grid-cols-1"
          tile-class="px-4 py-3.5"
        />
        <div class="flex flex-wrap gap-2.5">
          <span
            class="pill pill--soft min-h-[36px] px-3.5 text-[13px] text-[var(--color-on-surface)]"
            >Frontend systems</span
          >
          <span
            class="pill pill--soft min-h-[36px] px-3.5 text-[13px] text-[var(--color-on-surface)]"
            >UI polish</span
          >
          <span
            class="pill pill--soft min-h-[36px] px-3.5 text-[13px] text-[var(--color-on-surface)]"
            >Portfolio work</span
          >
        </div>
      </aside>

      <!-- Contact card ─────────────────────────────────────────────── -->
      <section
        class="panel-shell panel-shell--lg grid gap-7 p-[22px]"
        aria-label="Contact channels"
      >
        <!-- Hero block -->
        <div class="grid gap-5">
          <div class="grid gap-2">
            <h2
              class="font-serif text-[clamp(1.75rem,4vw,2.5rem)] leading-none"
            >
              Say hello.
            </h2>
            <p
              class="max-w-[46ch] text-sm text-[var(--color-on-surface-variant)]"
            >
              The fastest path is a direct email. Write what you're working on
              and what kind of help you need.
            </p>
          </div>

          <!-- Email hero button -->
          <div class="grid gap-3">
            <a
              href="mailto:syamim.dev@tunasprism.com.my"
              class="group inline-flex w-full items-center justify-between gap-3 rounded-2xl bg-[var(--color-cta)] px-5 py-4 text-white transition-all duration-200 hover:opacity-90 hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-cta)] focus-visible:ring-offset-2 sm:w-auto"
            >
              <span class="flex items-center gap-3">
                <Mail class="h-[18px] w-[18px] shrink-0" />
                <span class="text-[14px] font-semibold"
                  >syamim.dev@tunasprism.com.my</span
                >
              </span>
              <ExternalLink
                class="h-4 w-4 shrink-0 opacity-70 transition-opacity group-hover:opacity-100"
              />
            </a>
            <p class="text-[12px] text-[var(--color-on-surface-variant)]">
              Opens your default email client · No signup required
            </p>
          </div>
        </div>

        <!-- Divider -->
        <div class="flex items-center gap-3">
          <div class="h-px flex-1 bg-[var(--color-outline)]" />
          <span
            class="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--color-on-surface-variant)]"
            >or find me on</span
          >
          <div class="h-px flex-1 bg-[var(--color-outline)]" />
        </div>

        <!-- Social pills -->
        <div class="flex flex-wrap gap-3" role="list" aria-label="Social links">
          <a
            v-for="link in socialLinks"
            :key="link.href"
            :href="link.href"
            target="_blank"
            rel="noopener noreferrer"
            role="listitem"
            class="group inline-flex min-h-[44px] items-center gap-2.5 rounded-full border border-[var(--color-outline)] bg-[var(--color-surface)] px-4 text-[13px] font-semibold text-[var(--color-on-surface)] transition-all duration-200 hover:border-[var(--color-cta)] hover:text-[var(--color-cta)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-cta)]"
          >
            <component :is="link.icon" class="h-4 w-4 shrink-0" />
            {{ link.label }}
            <ExternalLink
              class="h-3.5 w-3.5 shrink-0 opacity-50 transition-opacity group-hover:opacity-100"
            />
          </a>
        </div>
      </section>
    </div>
  </section>
</template>

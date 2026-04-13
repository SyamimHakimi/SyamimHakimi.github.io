<script setup lang="ts">
/**
 * ThemeToggle — reads/writes localStorage key "theme" and toggles
 * data-theme="dark" on <html>. Hydrated via client:load so it
 * activates immediately after first paint.
 *
 * The data-theme attribute is the contract that Tailwind's @custom-variant dark
 * declaration targets — every dark: utility in global.css depends on this.
 *
 * A MutationObserver keeps isDark in sync when a second ThemeToggle instance
 * (e.g. the desktop rail instance) changes the attribute externally.
 */
import { ref, onMounted, onUnmounted } from "vue";
import { Moon, Sun } from "lucide-vue-next";

const isDark = ref(false);
let observer: MutationObserver | null = null;

onMounted(() => {
  isDark.value = document.documentElement.getAttribute("data-theme") === "dark";

  observer = new MutationObserver(() => {
    isDark.value =
      document.documentElement.getAttribute("data-theme") === "dark";
  });
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
});

onUnmounted(() => {
  observer?.disconnect();
});

function toggle() {
  isDark.value = !isDark.value;
  const theme = isDark.value ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
}
</script>

<template>
  <button
    type="button"
    :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
    :aria-pressed="isDark"
    class="flex h-11 w-11 items-center justify-center rounded-md text-[var(--color-on-surface-variant)] transition-colors hover:bg-[var(--color-surface-variant)] hover:text-[var(--color-on-surface)]"
    @click="toggle"
  >
    <Moon v-if="!isDark" class="h-4 w-4" aria-hidden="true" />
    <Sun v-else class="h-4 w-4" aria-hidden="true" />
  </button>
</template>

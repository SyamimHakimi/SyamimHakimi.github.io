<script setup lang="ts">
/**
 * ThemeToggle — reads/writes localStorage key "theme" and toggles
 * data-theme="dark" on <html>. Hydrated via client:load so it
 * activates immediately after first paint.
 *
 * The data-theme attribute is the contract that Tailwind's @custom-variant dark
 * declaration targets — every dark: utility in global.css depends on this.
 */
import { ref, onMounted } from "vue";
import { Moon, Sun } from "lucide-vue-next";

const isDark = ref(false);

onMounted(() => {
  isDark.value = document.documentElement.getAttribute("data-theme") === "dark";
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
    class="flex h-9 w-9 items-center justify-center rounded-md text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]"
    @click="toggle"
  >
    <Moon v-if="!isDark" class="h-4 w-4" aria-hidden="true" />
    <Sun v-else class="h-4 w-4" aria-hidden="true" />
  </button>
</template>

<script setup lang="ts">
/**
 * ThemeToggle — reads/writes localStorage key "theme" and toggles
 * data-theme="dark" on <html>. Hydrated via client:load so it
 * activates immediately after first paint.
 *
 * Full icon + animation styling applied in Phase A4.
 */
import { ref, onMounted } from "vue";

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
    @click="toggle"
  >
    {{ isDark ? "Light" : "Dark" }}
  </button>
</template>

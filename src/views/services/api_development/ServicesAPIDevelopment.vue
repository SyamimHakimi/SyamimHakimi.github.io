<script lang="ts">
import { defineComponent } from "vue";
import ExperienceSection from "@/views/portfolio/experience/ExperienceSection.vue";
import type { PortfolioSections } from "@/stores/portfolio";

export default defineComponent({
  name: "services-api-development",
  components: { ExperienceSection },
  setup() {
    return {};
  },
});
</script>

<template>
  <!--  <template v-for="(item, index) in portfolioSections" :key="index">-->
  <!--    <ExperienceSection :portfolio-sections="item" />-->
  <!--  </template>-->
  huh
</template>

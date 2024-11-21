<script lang="ts">
import { defineComponent } from "vue";
import ExperienceSection from "@/views/portfolio/experience/ExperienceSection.vue";
import { usePortfolioStore } from "@/stores/portfolio";
import { storeToRefs } from "pinia";

export default defineComponent({
  name: "experience-layout",
  components: { ExperienceSection },
  setup() {
    const portfolioStore = usePortfolioStore();
    const { portfolioSections } = storeToRefs(portfolioStore);

    return {
      portfolioSections,
    };
  },
});
</script>

<template>
  <template v-for="(item, index) in portfolioSections" :key="index">
    <ExperienceSection :portfolio-sections="item" />
  </template>
</template>

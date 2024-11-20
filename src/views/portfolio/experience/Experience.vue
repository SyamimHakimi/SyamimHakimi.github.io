<script lang="ts">
import { defineComponent } from "vue";
import ExperienceSection from "@/views/portfolio/experience/ExperienceSection.vue";
import { useExperienceStore } from "@/stores/portfolio";
import { storeToRefs } from "pinia";

export default defineComponent({
  name: "experience-layout",
  components: { ExperienceSection },
  setup() {
    const experienceStore = useExperienceStore();
    const { portfolioSections } = storeToRefs(experienceStore);

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

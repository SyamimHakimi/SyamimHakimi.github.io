<script lang="ts">
import { defineComponent, onServerPrefetch } from "vue";
import ExperienceSection from "@/views/portfolio/experience/ExperienceSection.vue";
import { usePortfolioStore } from "@/stores/portfolio";
import { storeToRefs } from "pinia";
import { usePendingPromises } from "vuefire";

export default defineComponent({
  name: "experience-layout",
  components: { ExperienceSection },
  setup() {
    const portfolioStore = usePortfolioStore();
    onServerPrefetch(() => usePendingPromises());
    const {
      experiencePlatformsList,
      experienceProtocolsList,
      experienceFrameworksList,
      experienceLanguagesList,
    } = storeToRefs(portfolioStore);

    return {
      portfolioSections: [
        {
          title: "Platforms",
          experienceList: experiencePlatformsList,
        },
        {
          title: "Protocols",
          experienceList: experienceProtocolsList,
        },
        {
          title: "Frameworks",
          experienceList: experienceFrameworksList,
        },
        {
          title: "Languages",
          experienceList: experienceLanguagesList,
        },
      ],
    };
  },
});
</script>

<template>
  <template v-for="(item, index) in portfolioSections" :key="index">
    <ExperienceSection :portfolio-sections="item" />
  </template>
</template>

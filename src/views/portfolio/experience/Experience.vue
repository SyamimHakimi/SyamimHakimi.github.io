<script lang="ts">
import { defineComponent } from "vue";
import ExperienceSection from "@/views/portfolio/experience/ExperienceSection.vue";
import type { PortfolioSections } from "@/stores/portfolio";

export default defineComponent({
  name: "experience-layout",
  components: { ExperienceSection },
  setup() {
    const portfolioSections: Array<PortfolioSections> = [
      {
        title: "Languages",
        experienceList: [
          {
            iconImg: "media/svg/brand-logos/plurk.svg",
            link: "https://www.google.com",
            badgeText: "4 Years",
            badgeColor: "success",
            title: "Python",
            description:
              "Used mainly on back-end development for creating scripts and APIs",
          },
          {
            iconImg: "media/svg/brand-logos/plurk.svg",
            link: "https://www.google.com",
            badgeText: "4 Years",
            badgeColor: "success",
            title: "Python",
            description:
              "Used mainly on back-end development for creating scripts and APIs",
          },
        ],
      },
      {
        title: "Frameworks",
        experienceList: [
          {
            iconImg: "media/svg/brand-logos/plurk.svg",
            link: "https://www.google.com",
            badgeText: "4 Years",
            badgeColor: "success",
            title: "Python",
            description:
              "Used mainly on back-end development for creating scripts and APIs",
          },
          {
            iconImg: "media/svg/brand-logos/plurk.svg",
            link: "https://www.google.com",
            badgeText: "4 Years",
            badgeColor: "success",
            title: "Python",
            description:
              "Used mainly on back-end development for creating scripts and APIs",
          },

          {
            iconImg: "media/svg/brand-logos/plurk.svg",
            link: "https://www.google.com",
            badgeText: "4 Years",
            badgeColor: "success",
            title: "Python",
            description:
              "Used mainly on back-end development for creating scripts and APIs",
          },
        ],
      },
      {
        title: "Protocols",
        experienceList: [
          {
            iconImg: "media/svg/brand-logos/plurk.svg",
            link: "https://www.google.com",
            badgeText: "4 Years",
            badgeColor: "success",
            title: "Python",
            description:
              "Used mainly on back-end development for creating scripts and APIs",
          },
        ],
      },
    ];

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
  <!--  Software Journey Page src/views/crafted/pages/profile/Activity.vue-->
</template>

<script lang="ts">
import { defineComponent } from "vue";
import LayoutGrids from "@/components-new/layouts/LayoutGrids.vue";
import CardPersonalProjectsDescription from "@/components-new/cards/CardPersonalProjectsDescription.vue";
import CardPersonalProjectsTechStack from "@/components-new/cards/CardPersonalProjectsTechStack.vue";
import { usePortfolioStore } from "@/stores/portfolio";
import { storeToRefs } from "pinia";

export default defineComponent({
  name: "personal-projects",
  components: {
    LayoutGrids,
    CardPersonalProjectsTechStack,
    CardPersonalProjectsDescription,
  },
  setup() {
    // const personalProjects: PersonalProjects = {
    //   personalProjectsDescription: {
    //     title: "syamim.",
    //     subtitle: "My Journey Showcase",
    //     description:
    //       "Due to the presence of non-disclosure agreements (NDAs) on most of my\n" +
    //       "projects, I am unable to share specific details about my work.\n" +
    //       "Therefore, developing a personalized website to showcase my portfolio\n" +
    //       "is the most efficient way to utilize my limited time. This platform\n" +
    //       "will also serve as a personal journal, documenting my photography\n" +
    //       "journey and experiences. Killing two birds with one stone!",
    //   },
    //   personalProjectsTechStackList: [
    //     {
    //       imgSrc: "media/svg/brand-logos/google-icon.svg",
    //       title: "Vue 3",
    //       description: "The main front-end Framework used",
    //       link: "https://vuejs.org/guide/introduction.html",
    //     },
    //     {
    //       imgSrc: "media/svg/brand-logos/google-icon.svg",
    //       title: "Vue 3",
    //       description: "The main front-end Framework used",
    //       link: "https://vuejs.org/guide/introduction.html",
    //     },
    //     {
    //       imgSrc: "media/svg/brand-logos/google-icon.svg",
    //       title: "Vue 3",
    //       description: "The main front-end Framework used",
    //       link: "https://vuejs.org/guide/introduction.html",
    //     },
    //   ],
    // };
    const portfolioStore = usePortfolioStore();
    const { personalProjectsDescription, personalProjectsTechStack } =
      storeToRefs(portfolioStore);

    return {
      personalProjectsDescription,
      personalProjectsTechStack,
    };
  },
});
</script>

<template>
  <LayoutGrids>
    <template v-slot:gridColumns>
      <div class="col-md-4 col-lg-12 col-xl-4">
        <CardPersonalProjectsDescription
          :personal-projects-description="personalProjectsDescription"
          :in-layout-grid="true"
        />
      </div>
      <div class="col-md-8 col-lg-12 col-xl-8">
        <CardPersonalProjectsTechStack
          :personal-projects-tech-stack-list="personalProjectsTechStack"
          :in-layout-grid="true"
        />
      </div>
    </template>
  </LayoutGrids>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import LayoutGrids from "@/components-new/layouts/LayoutGrids.vue";
import PersonalProjectsDescription from "@/views/portfolio/personal-projects/PersonalProjectsDescription.vue";
import PersonalProjectsTechStack from "@/views/portfolio/personal-projects/PersonalProjectsTechStack.vue";
import type { PersonalProjects } from "@/stores/portfolio";

export default defineComponent({
  name: "personal-projects",
  components: {
    LayoutGrids,
    PersonalProjectsTechStack,
    PersonalProjectsDescription,
  },
  setup() {
    const personalProjects: PersonalProjects = {
      personalProjectsDescription: {
        title: "syamim.",
        subtitle: "My Journey Showcase",
        description:
          "Due to the presence of non-disclosure agreements (NDAs) on most of my\n" +
          "projects, I am unable to share specific details about my work.\n" +
          "Therefore, developing a personalized website to showcase my portfolio\n" +
          "is the most efficient way to utilize my limited time. This platform\n" +
          "will also serve as a personal journal, documenting my photography\n" +
          "journey and experiences. Killing two birds with one stone!",
      },
      personalProjectsTechStackList: [
        {
          imgSrc: "media/svg/brand-logos/google-icon.svg",
          title: "Vue 3",
          description: "The main front-end Framework used",
          link: "https://vuejs.org/guide/introduction.html",
        },
        {
          imgSrc: "media/svg/brand-logos/google-icon.svg",
          title: "Vue 3",
          description: "The main front-end Framework used",
          link: "https://vuejs.org/guide/introduction.html",
        },
        {
          imgSrc: "media/svg/brand-logos/google-icon.svg",
          title: "Vue 3",
          description: "The main front-end Framework used",
          link: "https://vuejs.org/guide/introduction.html",
        },
      ],
    };

    return {
      personalProjects,
    };
  },
});
</script>

<template>
  <LayoutGrids>
    <template v-slot:gridColumns>
      <div class="col-md-4 col-lg-12 col-xl-4">
        <PersonalProjectsDescription
          :personal-projects-description="
            personalProjects.personalProjectsDescription
          "
          :in-layout-grid="true"
        />
      </div>
      <div class="col-md-8 col-lg-12 col-xl-8">
        <PersonalProjectsTechStack
          :personal-projects-tech-stack-list="
            personalProjects.personalProjectsTechStackList
          "
          :in-layout-grid="true"
        />
      </div>
    </template>
  </LayoutGrids>
</template>

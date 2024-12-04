<script lang="ts">
import { defineComponent, type PropType } from "vue";
import LayoutGrids from "@/components/layouts/LayoutGrids.vue";
import CardExperience from "@/components/cards/CardExperience.vue";
import type { PortfolioSections } from "@/stores/portfolio";

export default defineComponent({
  name: "experience-section",
  components: { CardExperience, LayoutGrids },
  props: {
    portfolioSections: {
      type: Object as PropType<PortfolioSections>,
      required: true,
    },
  },
  setup() {},
});
</script>

<template>
  <div class="my-5">
    <h2 class="fs-2 fw-semibold">{{ portfolioSections.title }}</h2>
  </div>

  <LayoutGrids>
    <template v-slot:gridColumns>
      <template
        v-for="(item, index) in portfolioSections.experienceList.value"
        :key="index"
      >
        <div class="col-md-6 col-xl-4">
          <CardExperience
            :portfolio-section-item="item"
            :in-layout-grid="true"
          />
        </div>
      </template>
    </template>
  </LayoutGrids>
</template>

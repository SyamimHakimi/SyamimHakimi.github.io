<script lang="ts">
import { defineComponent, type PropType } from "vue";
import CardContainer from "@/components-new/cards/CardContainer.vue";
import "@/core/helpers/global";
import type { PortfolioSectionsItem } from "@/stores/portfolio";

export default defineComponent({
  name: "card-experience",
  components: { CardContainer },
  props: {
    portfolioSectionItem: {
      type: Object as PropType<PortfolioSectionsItem>,
      required: true,
    },
    inLayoutGrid: { type: Boolean, required: false },
  },
  setup() {},
});
</script>

<template>
  <CardContainer
    :icon-img="portfolioSectionItem.iconImg"
    :link="portfolioSectionItem.link"
    :header-border="false"
    :badge-text="portfolioSectionItem.badgeText"
    :badge-color="portfolioSectionItem.badgeColor"
    :in-layout-grid="inLayoutGrid"
  >
    <template v-slot:cardBody>
      <div class="fs-3 fw-bold text-dark">{{ portfolioSectionItem.title }}</div>
      <p class="text-gray-400 fw-semibold fs-5 mt-1 mb-7">
        {{ portfolioSectionItem.description }}
      </p>
    </template>
  </CardContainer>
</template>

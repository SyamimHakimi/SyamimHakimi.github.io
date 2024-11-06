<script lang="ts">
import { defineComponent } from "vue";
import CardContainer from "@/components-new/cards/CardContainer.vue";
import type { PersonalProjectsDescription } from "@/stores/portfolio";

export default defineComponent({
  name: "card-personal-projects-description",
  components: { CardContainer },
  props: {
    personalProjectsDescription: {
      type: Object as () => PersonalProjectsDescription,
      required: true,
    },
    inLayoutGrid: { type: Boolean, required: false },
  },
  setup() {},
});
</script>

<template>
  <CardContainer :in-layout-grid="inLayoutGrid">
    <template v-slot:cardBody>
      <div class="fw-bold fs-1">
        {{ personalProjectsDescription.title }}
        <div class="text-muted fs-3 fw-semibold mb-5">
          {{ personalProjectsDescription.subtitle }}
        </div>
        <div class="fs-6 fw-normal text-gray-600">
          {{ personalProjectsDescription.description }}
        </div>
      </div>
    </template>
  </CardContainer>
</template>

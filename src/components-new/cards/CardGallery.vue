<script lang="ts">
import { defineComponent } from "vue";
import CardContainer from "@/components-new/cards/CardContainer.vue";
import ImagesContainer from "@/components-new/images/ImagesContainer.vue";
import LayoutGrids from "@/components-new/layouts/LayoutGrids.vue";

export default defineComponent({
  name: "card-gallery",
  components: { LayoutGrids, ImagesContainer, CardContainer },
  props: {
    title: { type: String, required: true },
    theme: { type: String, required: true },
    recipe: { type: String, required: true },
    datePosted: { type: String, required: true },
    imgSrc: { type: String, required: true },
    inLayoutGrid: { type: Boolean, required: false, default: false },
    widgetClasses: { type: String, required: false },
  },
});
</script>

<template>
  <CardContainer :in-layout-grid="inLayoutGrid">
    <template v-slot:cardBody>
      <div class="d-flex justify-content-center pb-4">
        <ImagesContainer :imgSrc="imgSrc" :border="true" />
      </div>
      <div class="fs-2x fw-bold mb-2">{{ title }}</div>
      <LayoutGrids>
        <template v-slot:gridColumns>
          <div class="col-md-6 align-content-end">
            <div class="fs-3 fw-semibold text-gray-800">{{ theme }}</div>
            <div class="fs-3 fw-semibold text-gray-800">{{ recipe }}</div>
          </div>
          <div class="col-md-6 align-content-end">
            <div class="fs-5 fw-semibold text-muted text-md-end">
              {{ datePosted }}
            </div>
          </div>
        </template>
      </LayoutGrids>
    </template>
  </CardContainer>
</template>

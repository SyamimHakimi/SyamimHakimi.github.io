<script lang="ts">
import { defineComponent } from "vue";
import CardContainer from "@/components-new/cards/CardContainer.vue";
import ImagesContainer from "@/components-new/images/ImagesContainer.vue";

export default defineComponent({
  name: "card-gallery",
  components: { ImagesContainer, CardContainer },
  props: {
    title: { type: String, required: true },
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
      <div class="fs-1 fw-bold">{{ title }}</div>
      <div class="fs-5 fw-semibold text-gray-600">{{ datePosted }}</div>
    </template>
  </CardContainer>
</template>

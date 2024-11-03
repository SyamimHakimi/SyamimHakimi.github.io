<script lang="ts">
import { defineComponent } from "vue";
import CardContainer from "@/components-new/cards/CardContainer.vue";
import type { ProfilePhotographyGear } from "@/stores/about-me";
import { getAssetPath } from "@/core/helpers/assets";

export default defineComponent({
  name: "list-profile-photography-gear",
  components: { CardContainer },
  props: {
    inLayoutGrid: { type: Boolean, required: false, default: true },
  },
  setup() {
    const photographyGear: Array<ProfilePhotographyGear> = [
      {
        imgSrc: getAssetPath("media/stock/600x400/img-20.jpg"),
        title: "X-E4",
        type: "Camera",
        color: "success",
        brand: "Fujifilm",
      },
      {
        imgSrc: getAssetPath("media/stock/600x400/img-19.jpg"),
        title: "18-50mm F2.8 DC DN",
        type: "Zoom Lens",
        color: "primary",
        brand: "Sigma",
      },
      {
        imgSrc: getAssetPath("media/stock/600x400/img-25.jpg"),
        title: "10-18mm F2.8 DC DN",
        type: "Zoom Lens",
        color: "primary",
        brand: "Sigma",
      },
      {
        imgSrc: getAssetPath("media/stock/600x400/img-24.jpg"),
        title: "56mm F1.7 APS-C",
        type: "Prime Lens",
        color: "info",
        brand: "Viltrox",
      },
    ];

    return {
      photographyGear,
    };
  },
});
</script>

<template>
  <CardContainer
    card-title="Photography Gear"
    card-subtitle="Currently Owned"
    :header-border="false"
    :in-layout-grid="inLayoutGrid"
  >
    <template v-slot:cardBody>
      <template v-for="(item, index) in photographyGear" :key="index">
        <!--begin::Item-->
        <div
          :class="{ 'mb-7': photographyGear.length - 1 !== index }"
          class="d-flex align-items-sm-center"
        >
          <!--begin::Symbol-->
          <div class="symbol symbol-60px symbol-2by3 me-4">
            <div
              class="symbol-label"
              :style="{
                backgroundImage: `url(${item.imgSrc})`,
              }"
            ></div>
          </div>
          <!--end::Symbol-->

          <!--begin::Title-->
          <div class="d-flex flex-row-fluid flex-wrap align-items-center">
            <div class="flex-grow-1 me-2">
              <a
                href="#"
                class="text-gray-800 fw-bold text-hover-primary fs-6"
                >{{ item.title }}</a
              >

              <span class="text-muted fw-semibold d-block pt-1">{{
                item.brand
              }}</span>
            </div>

            <span
              :class="`badge-light-${item.color}`"
              class="badge fs-8 fw-bold my-2"
              >{{ item.type }}</span
            >
          </div>
          <!--end::Title-->
        </div>
        <!--end::Item-->
      </template>
    </template>
  </CardContainer>
  <!--end::List Widget 7-->
</template>

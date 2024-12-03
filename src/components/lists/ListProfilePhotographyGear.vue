<script lang="ts">
import { defineComponent } from "vue";
import CardContainer from "@/components-new/cards/CardContainer.vue";
import { useAboutMeStore } from "@/stores/about-me";
import { storeToRefs } from "pinia";

export default defineComponent({
  name: "list-profile-photography-gear",
  components: { CardContainer },
  props: {
    inLayoutGrid: { type: Boolean, required: false, default: true },
  },
  setup() {
    const aboutMeStore = useAboutMeStore();
    const { photographyGearsList } = storeToRefs(aboutMeStore);

    return {
      photographyGearsList,
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
      <template v-for="(item, index) in photographyGearsList" :key="index">
        <!--begin::Item-->
        <div
          :class="{ 'mb-7': index < photographyGearsList.length - 1 }"
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
                :href="item.link"
                class="text-gray-800 fw-bold text-hover-primary fs-6"
                >{{ item.name }}</a
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

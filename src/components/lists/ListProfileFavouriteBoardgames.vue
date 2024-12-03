<script lang="ts">
import { defineComponent, watch } from "vue";
import CardContainer from "@/components/cards/CardContainer.vue";
import { useAboutMeStore } from "@/stores/about-me";
import { storeToRefs } from "pinia";
import { assignColorListThemeFirestore } from "@/core/helpers/global";

export default defineComponent({
  name: "list-profile-favourite-boardgames",
  components: { CardContainer },
  props: {
    inLayoutGrid: { type: Boolean, required: false, default: true },
  },
  setup() {
    const aboutMeStore = useAboutMeStore();
    const { favouriteBoardgamesList } = storeToRefs(aboutMeStore);
    assignColorListThemeFirestore(favouriteBoardgamesList, "color");

    watch(favouriteBoardgamesList, () => {
      assignColorListThemeFirestore(favouriteBoardgamesList, "color");
    });

    return {
      favouriteBoardgamesList,
    };
  },
});
</script>

<template>
  <CardContainer
    card-title="Favourite Boardgames"
    card-subtitle="My Personal Top 5 (BGG Ratings)"
    :header-border="false"
    :in-layout-grid="inLayoutGrid"
  >
    <template v-slot:cardBody>
      <template v-for="(item, index) in favouriteBoardgamesList" :key="index">
        <!--begin::Item-->
        <div
          :class="{ 'mb-7': index < favouriteBoardgamesList.length - 1 }"
          class="d-flex align-items-center"
        >
          <!--begin::Symbol-->
          <div class="symbol symbol-50px me-5">
            <span :class="`bg-light-${item.color}`" class="symbol-label">
              <i :class="`${item.icon} text-${item.color} fa-solid fs-2x`"></i>
            </span>
          </div>
          <!--end::Symbol-->

          <!--begin::Text-->
          <div class="d-flex flex-column">
            <a
              :href="item.link"
              class="text-dark text-hover-primary fs-6 fw-bold"
              >{{ item.title }}</a
            >

            <span class="text-muted fw-semibold">{{ item.description }}</span>
          </div>
          <!--end::Text-->

          <!--start::Rating-->
          <div
            class="d-flex flex-grow-1 align-items-center justify-content-end ms-3"
          >
            <span class="text-muted fw-bold me-2">{{ item.rating }}</span>
            <div class="rating">
              <template v-for="i in 5" :key="i">
                <div
                  :class="[
                    Math.floor(item.ratingMax5 * 2) >= i * 2 - 1 && 'checked',
                  ]"
                  class="rating-label"
                >
                  <i
                    v-if="Math.floor(item.ratingMax5 * 2) >= i * 2"
                    class="fa fa-star fs-2"
                  ></i>
                  <i
                    v-else-if="Math.floor(item.ratingMax5 * 2) >= i * 2 - 1"
                    class="fa fa-star-half-alt fs-2"
                  ></i>
                  <i v-else class="fa-regular fa-star fs-2"></i>
                </div>
              </template>
            </div>
          </div>
          <!--end::Rating-->
        </div>
        <!--end::Item-->
      </template>
    </template>
  </CardContainer>
</template>

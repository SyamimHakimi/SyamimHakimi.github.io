<script lang="ts">
import { defineComponent } from "vue";
import CardContainer from "@/components-new/cards/CardContainer.vue";
import type { ProfileFavouriteBoardgames } from "@/stores/about-me";

export default defineComponent({
  name: "list-profile-favourite-boardgames",
  components: { CardContainer },
  props: {
    inLayoutGrid: { type: Boolean, required: false, default: true },
  },
  setup() {
    const favouriteBoardgamesList: Array<ProfileFavouriteBoardgames> = [
      {
        icon: "fa-1",
        color: "success",
        title: "A Fake Artist Goes to New York ",
        description: "Bluffing, Deduction",
        rating: 7.8,
        ratingMax5: 7.8 / 2,
      },
      {
        icon: "fa-2",
        color: "warning",
        title: "Heat: Pedal to the Metal",
        description: "Racing",
        rating: 8.3,
        ratingMax5: 8.3 / 2,
      },
      {
        icon: "fa-3",
        color: "primary",
        title: "Deception: Murder in Hong Kong ",
        description: "Bluffing, Deduction",
        rating: 8.8,
        ratingMax5: 8.8 / 2,
      },
      {
        icon: "fa-4",
        color: "danger",
        title: "Taco Cat Goat Cheese Pizza",
        description: "Dexterity, Party Game",
        rating: 6.1,
        ratingMax5: 6.1 / 2,
      },
      {
        icon: "fa-5",
        color: "info",
        title: "Patchwork",
        description: "Strategy, Economic",
        rating: 6.8,
        ratingMax5: 6.8 / 2,
      },
    ];

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
          :class="{ 'mb-7': favouriteBoardgamesList.length - 1 !== index }"
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
            <a href="#" class="text-dark text-hover-primary fs-6 fw-bold">{{
              item.title
            }}</a>

            <span class="text-muted fw-semibold">{{ item.description }}</span>
          </div>
          <!--end::Text-->

          <!--start::Rating-->
          <div
            class="d-flex flex-grow-1 align-items-center justify-content-end ms-2"
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

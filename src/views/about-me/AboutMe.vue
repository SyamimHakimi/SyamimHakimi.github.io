<script lang="ts">
import { getAssetPath } from "@/core/helpers/assets";
import { defineComponent } from "vue";
import CardProfile from "@/components/cards/CardProfile.vue";
import LayoutGrids from "@/components/layouts/LayoutGrids.vue";
import ListProfileFavouriteBoardgames from "@/components/lists/ListProfileFavouriteBoardgames.vue";
import ListProfilePhotographyGear from "@/components/lists/ListProfilePhotographyGear.vue";

export default defineComponent({
  name: "about-me-layout",
  components: {
    ListProfilePhotographyGear,
    ListProfileFavouriteBoardgames,
    LayoutGrids,
    CardProfile,
  },
  setup() {
    return {
      getAssetPath,
    };
  },
});
</script>

<template>
  <CardProfile />

  <LayoutGrids>
    <template v-slot:gridColumns>
      <div class="col-xl-6">
        <ListProfileFavouriteBoardgames />
      </div>
      <div class="col-xl-6">
        <ListProfilePhotographyGear />
      </div>
    </template>
  </LayoutGrids>
</template>

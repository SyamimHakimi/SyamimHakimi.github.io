<script lang="ts">
import { getAssetPath } from "@/core/helpers/assets";
import { defineComponent } from "vue";
import CardProfile from "@/components-new/cards/CardProfile.vue";
import LayoutGrids from "@/components-new/layouts/LayoutGrids.vue";
import ListProfileFavouriteBoardgames from "@/components-new/lists/ListProfileFavouriteBoardgames.vue";
import ListProfilePhotographyGear from "@/components-new/lists/ListProfilePhotographyGear.vue";

export default defineComponent({
  name: "account-overview",
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

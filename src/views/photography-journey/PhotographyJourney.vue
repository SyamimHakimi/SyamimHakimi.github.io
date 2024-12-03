<script lang="ts">
import { defineComponent } from "vue";
import ChartsPhotographyStatistics from "@/components/charts/ChartsPhotographyStatistics.vue";
import ChartsUsedFocalLength from "@/components/charts/ChartsUsedFocalLength.vue";
import ChartsPhotographyTheme from "@/components/charts/ChartsPhotographyTheme.vue";
import ChartsFujifilmRecipe from "@/components/charts/ChartsFujifilmRecipe.vue";
import TablesLatestPhotos from "@/components/tables/TablesLatestPhotos.vue";
import LayoutGrids from "@/components/layouts/LayoutGrids.vue";
import { storeToRefs } from "pinia";
import { usePhotographyJourneyStore } from "@/stores/photography-journey";

export default defineComponent({
  name: "photography-journey-layout",
  components: {
    LayoutGrids,
    TablesLatestPhotos,
    ChartsFujifilmRecipe,
    ChartsPhotographyTheme,
    ChartsUsedFocalLength,
    ChartsPhotographyStatistics,
  },
  setup() {
    const photographyJourneyStore = usePhotographyJourneyStore();
    const { lensStats } = storeToRefs(photographyJourneyStore);

    return {
      lensStats,
    };
  },
});
</script>

<template>
  <!--begin::Row-->
  <LayoutGrids>
    <template v-slot:gridColumns>
      <div class="col-12">
        <ChartsPhotographyStatistics :in-layout-grid="true" />
      </div>
      <div class="col-xxl-4">
        <ChartsUsedFocalLength chart-height="100" :in-layout-grid="true" />
      </div>
      <div class="col-xxl-4">
        <ChartsPhotographyTheme chart-height="100" :in-layout-grid="true" />
      </div>
      <div class="col-xxl-4">
        <ChartsFujifilmRecipe chart-height="100" :in-layout-grid="true" />
      </div>
      <div class="col-12">
        <TablesLatestPhotos :in-layout-grid="true" />
      </div>
    </template>
  </LayoutGrids>
</template>

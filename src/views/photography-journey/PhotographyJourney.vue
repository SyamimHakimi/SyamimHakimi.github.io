<script lang="ts">
import { defineComponent } from "vue";
import ChartsPhotographyStatistics from "@/components-new/charts/ChartsPhotographyStatistics.vue";
import ChartsUsedFocalLength from "@/components-new/charts/ChartsUsedFocalLength.vue";
import ChartsPhotographyTheme from "@/components-new/charts/ChartsPhotographyTheme.vue";
import ChartsFujifilmRecipe from "@/components-new/charts/ChartsFujifilmRecipe.vue";
import TablesLatestPhotos from "@/components-new/tables/TablesLatestPhotos.vue";
import LayoutGrids from "@/components-new/layouts/LayoutGrids.vue";
import CardExperience from "@/components-new/cards/CardExperience.vue";

export default defineComponent({
  name: "photography-journey-layout",
  components: {
    CardExperience,
    LayoutGrids,
    TablesLatestPhotos,
    ChartsFujifilmRecipe,
    ChartsPhotographyTheme,
    ChartsUsedFocalLength,
    ChartsPhotographyStatistics,
  },
  setup() {},
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

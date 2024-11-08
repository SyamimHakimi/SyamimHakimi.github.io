<script lang="ts">
import { defineComponent, onMounted, onUnmounted } from "vue";
import LayoutService from "@/core/services/LayoutService";
import MixedWidget12 from "@/components/widgets/mixed/Widget12.vue";
import MixedWidget13 from "@/components/widgets/mixed/Widget13.vue";
import MixedWidget14 from "@/components/widgets/mixed/Widget14.vue";
import TablesWidget9 from "@/components/widgets/tables/Widget9.vue";
import ListsWidget5 from "@/components/widgets/lists/Widget5.vue";
import ListsWidget4 from "@/components/widgets/lists/Widget4.vue";
import Widget6 from "@/components/widgets/mixed/Widget6.vue";
import ChartsPhotographyStatistics from "@/components-new/charts/ChartsPhotographyStatistics.vue";
import Widget12 from "@/components/widgets/mixed/Widget12.vue";
import ChartsUsedFocalLength from "@/components-new/charts/ChartsUsedFocalLength.vue";
import ChartsPhotographyTheme from "@/components-new/charts/ChartsPhotographyTheme.vue";
import ChartsFujifilmRecipe from "@/components-new/charts/ChartsFujifilmRecipe.vue";

export default defineComponent({
  name: "photography-journey-layout",
  components: {
    ChartsFujifilmRecipe,
    ChartsPhotographyTheme,
    ChartsUsedFocalLength,
    Widget12,
    ChartsPhotographyStatistics,
    Widget6,
    MixedWidget12,
    MixedWidget13,
    MixedWidget14,
    TablesWidget9,
    ListsWidget5,
    ListsWidget4,
  },
  setup() {},
});
</script>

<template>
  <!--begin::Row-->
  <div class="row gy-5 g-xl-10">
    <!--    Favourite recipe src/components/widgets/mixed/Widget13.vue-->
    <!--  Photography Theme src/components/widgets/statsistics/Widget4.vue-->

    <div class="col-12">
      <ChartsPhotographyStatistics />
    </div>

    <div class="col-xl-4">
      <ChartsUsedFocalLength chart-height="100" />
    </div>

    <div class="col-xl-4">
      <ChartsPhotographyTheme chart-height="100" />
    </div>

    <div class="col-xl-4">
      <ChartsFujifilmRecipe chart-height="100" />
    </div>
  </div>

  <TablesWidget9 widget-classes="mb-5 mb-xl-10" />
</template>

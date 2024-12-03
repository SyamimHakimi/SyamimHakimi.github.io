<script lang="ts">
import { getAssetPath } from "@/core/helpers/assets";
import { computed, defineComponent, onBeforeMount, ref, watch } from "vue";
import { getCSSVariableValue } from "@/assets/ts/_utils";
import type { ApexOptions } from "apexcharts";
import type VueApexCharts from "vue3-apexcharts";
import { useThemeStore } from "@/stores/theme";
import CardContainer from "@/components/cards/CardContainer.vue";
import {
  getMaxChart,
  usePhotographyJourneyStore,
} from "@/stores/photography-journey";
import { storeToRefs } from "pinia";

export default defineComponent({
  name: "charts-photography-theme",
  components: {
    CardContainer,
  },
  props: {
    chartHeight: { type: String, required: false, default: "100" },
    inLayoutGrid: { type: Boolean, required: false, default: false },
  },
  setup(props) {
    const chartRef = ref<typeof VueApexCharts | null>(null);
    const store = useThemeStore();

    const photographyJourneyStore = usePhotographyJourneyStore();
    const { themeStats } = storeToRefs(photographyJourneyStore);

    const series = computed(() => {
      return [
        {
          name: "Photos Posted",
          data: themeStats.value?.yAxis ?? [],
        },
      ];
    });

    const max = computed(() => {
      return getMaxChart<string>(themeStats.value);
    });

    const chart = computed(() => {
      const baseColor = getCSSVariableValue(`--bs-danger`);

      return <ApexOptions>{
        chart: {
          fontFamily: "inherit",
          height: props.chartHeight,
          type: "bar",
          toolbar: {
            show: false,
          },
          sparkline: {
            enabled: true,
          },
        },
        grid: {
          show: false,
          padding: {
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
          },
        },
        colors: [baseColor],
        stroke: {
          width: 2,
          colors: ["#FFFFFF"],
        },
        plotOptions: {
          bar: {
            borderRadius: 2,
            dataLabels: {
              position: "top",
            },
            columnWidth: "50%",
          },
        },
        dataLabels: {
          enabled: false,
        },
        xaxis: {
          labels: {
            show: false,
          },
          categories: themeStats.value?.xAxis ?? [],
          position: "top",
          axisBorder: {
            show: false,
          },
          axisTicks: {
            show: false,
          },
          crosshairs: {
            show: false,
          },
          tooltip: {
            enabled: false,
          },
        },
        yaxis: {
          show: false,
          axisBorder: {
            show: false,
          },
          axisTicks: {
            show: false,
          },
          labels: {
            show: false,
          },
        },
      };
    });

    const themeMode = computed(() => {
      return store.mode;
    });

    onBeforeMount(() => {
      Object.assign(chart, chart.value);
    });

    const refreshChart = () => {
      if (!chartRef.value) {
        return;
      }

      Object.assign(chart, chart.value);

      chartRef.value.refresh();
    };

    watch(themeMode, () => {
      refreshChart();
    });

    return {
      themeMode,
      max,
      chart,
      series,
      chartRef,
      getAssetPath,
    };
  },
});
</script>

<template>
  <CardContainer
    card-title="Photo Theme"
    :header-border="false"
    class="theme-dark-bg-body theme-light-bg-danger"
    :in-layout-grid="inLayoutGrid"
  >
    <template v-slot:cardBody>
      <apexchart
        ref="chartRef"
        :options="chart"
        :series="series"
        :height="chartHeight"
        type="bar"
      ></apexchart>

      <!--begin::Stats-->
      <div class="pt-2">
        <span class="text-dark fw-bold fs-3x me-2">{{ max }}</span>
        <!--end::Number-->

        <!--begin::Text-->
        <div class="text-dark fw-bold fs-6 me-2">Favourite Theme</div>
        <!--end::Text-->
      </div>
      <!--end::Stats-->
    </template>
  </CardContainer>
</template>

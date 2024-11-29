<script lang="ts">
import { getAssetPath } from "@/core/helpers/assets";
import { computed, defineComponent, onBeforeMount, ref, watch } from "vue";
import { getCSSVariableValue } from "@/assets/ts/_utils";
import type { ApexOptions } from "apexcharts";
import type VueApexCharts from "vue3-apexcharts";
import { useThemeStore } from "@/stores/theme";
import CardContainer from "@/components-new/cards/CardContainer.vue";
import {
  getMaxChart,
  usePhotographyJourneyStore,
} from "@/stores/photography-journey";
import { storeToRefs } from "pinia";

export default defineComponent({
  name: "charts-used-focal-length",
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
    const { focalStats } = storeToRefs(photographyJourneyStore);

    const series = computed(() => {
      return [
        {
          name: "Photos Posted",
          data: focalStats.value?.yAxis ?? [],
        },
      ];
    });

    const labels = computed(() => {
      const _list = focalStats.value?.xAxis ?? [];

      return _list.map((value) => {
        return `${value}mm`;
      });
    });

    const max = computed(() => {
      return getMaxChart<string>(focalStats.value);
    });

    const chart = computed(() => {
      const labelColor = getCSSVariableValue("--bs-gray-800");
      const strokeColor = getCSSVariableValue("--bs-gray-300");
      const baseColor = getCSSVariableValue(`--bs-primary`);
      const lightColor = getCSSVariableValue(`--bs-primary-light`);

      return <ApexOptions>{
        grid: {
          show: false,
          padding: {
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
          },
        },
        chart: {
          fontFamily: "inherit",
          type: "area",
          height: props.chartHeight,
          toolbar: {
            show: false,
          },
          zoom: {
            enabled: false,
          },
          sparkline: {
            enabled: true,
          },
        },
        plotOptions: {},
        legend: {
          show: false,
        },
        dataLabels: {
          enabled: false,
        },
        fill: {
          type: "gradient",
          gradient: {
            opacityFrom: 0.8,
            opacityTo: 0,
            stops: [20, 120, 120, 120],
          },
        },
        stroke: {
          curve: "smooth",
          show: true,
          width: 2,
          colors: ["#FFFFFF"],
        },
        xaxis: {
          categories: labels.value,
          axisBorder: {
            show: false,
          },
          axisTicks: {
            show: false,
          },
          labels: {
            show: false,
            style: {
              colors: labelColor,
              fontSize: "12px",
            },
          },
          crosshairs: {
            show: false,
            position: "front",
            stroke: {
              color: strokeColor,
              width: 1,
              dashArray: 3,
            },
          },
          tooltip: {
            enabled: false,
          },
        },
        yaxis: {
          min: 0,
          max: Math.max(...(focalStats.value?.yAxis ?? [0])) + 1,
          labels: {
            show: false,
            style: {
              colors: labelColor,
              fontSize: "12px",
            },
          },
        },
        states: {
          normal: {
            filter: {
              type: "none",
              value: 0,
            },
          },
          hover: {
            filter: {
              type: "none",
              value: 0,
            },
          },
          active: {
            allowMultipleDataPointsSelection: false,
            filter: {
              type: "none",
              value: 0,
            },
          },
        },
        tooltip: {
          style: {
            fontSize: "12px",
          },
          y: {
            formatter: function (val) {
              return val + " Photos";
            },
          },
        },
        colors: [baseColor],
        markers: {
          colors: [lightColor],
          strokeColors: [baseColor],
          strokeWidth: 3,
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
      focalStats,
      max,
      themeMode,
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
    card-title="Focal Length"
    :header-border="false"
    class="theme-dark-bg-body theme-light-bg-primary"
    :in-layout-grid="inLayoutGrid"
  >
    <template v-slot:cardBody>
      <apexchart
        ref="chartRef"
        :options="chart"
        :series="series"
        :height="chartHeight"
        type="area"
      ></apexchart>

      <!--begin::Stats-->
      <div class="pt-2">
        <span class="text-dark fw-bold fs-3x">{{ max }}</span>
        <span class="text-dark fw-bold fs-2x me-2">mm</span>
        <!--end::Number-->

        <!--begin::Text-->
        <div class="text-dark fw-bold fs-6">Preferred Focal Length</div>
        <!--end::Text-->
      </div>
      <!--end::Stats-->
    </template>
  </CardContainer>
</template>

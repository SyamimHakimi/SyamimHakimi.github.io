<script lang="ts">
import { getAssetPath } from "@/core/helpers/assets";
import { computed, defineComponent, onBeforeMount, ref, watch } from "vue";
import { getCSSVariableValue } from "@/assets/ts/_utils";
import type { ApexOptions } from "apexcharts";
import type VueApexCharts from "vue3-apexcharts";
import { useThemeStore } from "@/stores/theme";
import CardContainer from "@/components-new/cards/CardContainer.vue";
import type { PhotographyStatistic } from "@/stores/photography-journey";

export default defineComponent({
  name: "charts-used-focal-length",
  components: {
    CardContainer,
  },
  props: {
    chartHeight: { type: String, required: false, default: "100" },
  },
  setup(props) {
    const chartRef = ref<typeof VueApexCharts | null>(null);
    const chart: ApexOptions = {};
    const store = useThemeStore();

    const photographyStatistics: Array<PhotographyStatistic> = [
      {
        title: "Photos Posted",
        value: "5",
        icon: "bucket",
        iconColor: "success",
      },
      {
        title: "Photo Outings",
        value: "3",
        icon: "bucket",
        iconColor: "warning",
      },
      {
        title: "Favourite Photos",
        value: "2",
        icon: "bucket",
        iconColor: "primary",
      },
      {
        title: "Favourite Photo Lens ",
        value: "5",
        icon: "bucket",
        iconColor: "danger",
      },
    ];

    const series = [
      {
        name: "Photos Posted",
        data: [15, 25, 15, 40, 20, 50],
      },
    ];

    const themeMode = computed(() => {
      return store.mode;
    });

    onBeforeMount(() => {
      Object.assign(chart, chartOptions(props.chartHeight));
    });

    const refreshChart = () => {
      if (!chartRef.value) {
        return;
      }

      Object.assign(chart, chartOptions(props.chartHeight));

      chartRef.value.refresh();
    };

    watch(themeMode, () => {
      refreshChart();
    });

    return {
      photographyStatistics,
      themeMode,
      chart,
      series,
      chartRef,
      getAssetPath,
    };
  },
});

const chartOptions = (chartHeight: string = "auto"): ApexOptions => {
  const labelColor = getCSSVariableValue("--bs-gray-800");
  const strokeColor = getCSSVariableValue("--bs-gray-300");
  const baseColor = getCSSVariableValue(`--bs-primary`);
  const lightColor = getCSSVariableValue(`--bs-primary-light`);

  return {
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
      height: chartHeight,
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
      categories: ["Feb", "Mar", "Apr", "May", "Jun", "Jul"],
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
      max: 60,
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
          return "$" + val + " thousands";
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
};
</script>

<template>
  <CardContainer
    card-title="Focal Length"
    :header-border="false"
    class="theme-dark-bg-body theme-light-bg-primary"
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
        <span class="text-dark fw-bold fs-3x">560</span>
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

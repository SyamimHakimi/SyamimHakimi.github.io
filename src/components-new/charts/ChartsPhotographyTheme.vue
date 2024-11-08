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
  name: "charts-photography-theme",
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
  const baseColor = getCSSVariableValue(`--bs-danger`);

  return {
    chart: {
      fontFamily: "inherit",
      height: chartHeight,
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
      categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
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
};
</script>

<template>
  <CardContainer
    card-title="Photo Theme"
    :header-border="false"
    class="theme-dark-bg-body theme-light-bg-danger"
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
        <span class="text-dark fw-bold fs-3x me-2">Landscape</span>
        <!--end::Number-->

        <!--begin::Text-->
        <div class="text-dark fw-bold fs-6 me-2">Favourite Theme</div>
        <!--end::Text-->
      </div>
      <!--end::Stats-->
    </template>
  </CardContainer>
</template>

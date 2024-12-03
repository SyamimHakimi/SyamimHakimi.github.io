<script lang="ts">
import { getAssetPath } from "@/core/helpers/assets";
import { computed, defineComponent, onBeforeMount, ref, watch } from "vue";
import { getCSSVariableValue } from "@/assets/ts/_utils";
import type { ApexOptions } from "apexcharts";
import type VueApexCharts from "vue3-apexcharts";
import { useThemeStore } from "@/stores/theme";
import CardContainer from "@/components-new/cards/CardContainer.vue";
import KTIcon from "@/core/helpers/kt-icon/KTIcon.vue";
import LayoutGrids from "@/components-new/layouts/LayoutGrids.vue";
import { usePhotographyJourneyStore } from "@/stores/photography-journey";
import { storeToRefs } from "pinia";

export default defineComponent({
  name: "charts-photography-statistics",
  components: {
    LayoutGrids,
    KTIcon,
    CardContainer,
  },
  props: {
    chartHeight: { type: String, required: false, default: "150" },
    inLayoutGrid: { type: Boolean, required: false, default: false },
  },
  setup(props) {
    const chartRef = ref<typeof VueApexCharts | null>(null);
    const store = useThemeStore();

    const photographyJourneyStore = usePhotographyJourneyStore();
    const { mainStats, photoStats, favPhotoStats } = storeToRefs(
      photographyJourneyStore,
    );

    const series = computed(() => {
      const photoList = photoStats.value?.yAxis ?? [];
      const favPhotoList = favPhotoStats.value?.yAxis ?? [];

      const maxLength = Math.max(photoList.length, favPhotoList.length);

      while (photoList.length < maxLength) {
        photoList.push(0);
      }
      while (favPhotoList.length < maxLength) {
        favPhotoList.push(0);
      }

      return [
        {
          name: "Photos Posted",
          data: photoList,
        },
        {
          name: "Favourite Photos",
          data: favPhotoList,
        },
      ];
    });

    const labels = computed(() => {
      const photoList = photoStats.value?.xAxis ?? [];
      const favPhotoList = favPhotoStats.value?.xAxis ?? [];

      let _list: Date[];
      if (photoList.length > favPhotoList.length) _list = photoList;
      else _list = favPhotoList;

      return _list.map((date) => {
        return date.toLocaleString("en-US", {
          month: "short",
          year: "numeric",
        });
      });
    });

    const chart = computed(() => {
      const labelColor = getCSSVariableValue("--bs-gray-800");
      const strokeColor = getCSSVariableValue("--bs-gray-300");
      const baseColor = getCSSVariableValue(`--bs-success`);
      const secondaryColor = getCSSVariableValue(`--bs-primary`);
      const lightColor = getCSSVariableValue(`--bs-success-light`);
      const secondaryLightColor = getCSSVariableValue(`--bs-primary-light`);

      return <ApexOptions>{
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
          type: "solid",
          opacity: 1,
        },
        stroke: {
          curve: "smooth",
          show: true,
          width: 3,
          colors: [baseColor, secondaryColor],
        },
        xaxis: {
          categories: labels.value,
          axisBorder: {
            strokeWidth: 0,
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
          max: Math.max(...(photoStats.value?.yAxis ?? [0])) + 1,
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
        colors: [lightColor, secondaryLightColor],
        markers: {
          colors: [lightColor, secondaryLightColor],
          strokeColors: [baseColor, secondaryColor],
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
      mainStats,
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
    card-title="Photography Statistics"
    card-subtitle="My Photography Journey"
    :header-border="false"
    :body-padding="false"
    :in-layout-grid="inLayoutGrid"
  >
    <template v-slot:cardBody>
      <LayoutGrids class="card-px pt-5 pb-10">
        <template v-slot:gridColumns>
          <template
            v-for="(photographyStatistic, index) in mainStats"
            :key="index"
          >
            <div class="col-6 col-xl-3 align-content-center">
              <div class="d-flex align-items-center me-2">
                <div class="symbol symbol-50px me-3">
                  <div
                    :class="`symbol-label bg-light-${photographyStatistic.iconColor}`"
                  >
                    <KTIcon
                      :icon-name="photographyStatistic.icon"
                      :icon-class="`fs-1 text-${photographyStatistic.iconColor}`"
                    />
                  </div>
                </div>

                <div>
                  <div class="fs-4 text-dark fw-bold">
                    {{ photographyStatistic.value }}
                  </div>
                  <div class="fs-7 text-muted fw-semibold">
                    {{ photographyStatistic.title }}
                  </div>
                </div>
              </div>
            </div>
          </template>
        </template>
      </LayoutGrids>

      <apexchart
        ref="chartRef"
        class="card-rounded-bottom"
        :options="chart"
        :series="series"
        :height="chartHeight"
        type="area"
      ></apexchart>
      <!--end::Chart-->
    </template>
  </CardContainer>
</template>

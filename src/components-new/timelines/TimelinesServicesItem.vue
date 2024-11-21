<script lang="ts">
import { defineComponent } from "vue";
import KTIcon from "@/core/helpers/kt-icon/KTIcon.vue";
import type { TimelinesService } from "@/stores/services";

export default defineComponent({
  name: "timelines-services-item",
  components: { KTIcon },
  props: {
    timelinesServices: {
      type: Object as PropType<TimelinesService>,
      required: true,
    },
  },
  setup() {
    return {};
  },
});
</script>

<template>
  <!--begin::Timeline item-->
  <div class="timeline-item">
    <!--begin::Timeline line-->
    <div class="timeline-line w-40px"></div>
    <!--end::Timeline line-->

    <!--begin::Timeline icon-->
    <div class="timeline-icon symbol symbol-circle symbol-40px">
      <div class="symbol-label bg-light">
        <KTIcon
          :icon-name="timelinesServices.icon"
          :icon-class="`fs-2 text-${timelinesServices.color}`"
        />
      </div>
    </div>
    <!--end::Timeline icon-->

    <!--begin::Timeline content-->
    <div class="timeline-content mb-10">
      <div class="overflow-auto pe-3">
        <div class="fs-5 fw-bold mb-1">
          {{ timelinesServices.title }}
        </div>

        <div class="d-flex align-items-center fs-6 text-muted me-2">
          {{ timelinesServices.description }}
        </div>
      </div>
    </div>
    <!--end::Timeline content-->
  </div>
</template>

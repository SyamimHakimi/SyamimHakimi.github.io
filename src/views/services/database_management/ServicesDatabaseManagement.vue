<script lang="ts">
import { defineComponent } from "vue";
import TimelinesServices from "@/components-new/timelines/TimelinesServices.vue";
import type { TimelinesService } from "@/stores/services";

export default defineComponent({
  name: "services-web-app-development",
  components: { TimelinesServices },
  setup() {
    const timelinesServices: Array<TimelinesService> = [
      {
        icon: "external-drive",
        color: "success",
        title: "Designing SQL Database",
        description: "Design to be scalable, efficient and easy to maintain",
      },
      {
        icon: "arrow-up-down",
        color: "warning",
        title: "Data Migration",
        description:
          "Handling import and export tasks to enable compatibility with older data",
      },
    ];

    return {
      timelinesServices,
    };
  },
});
</script>

<template>
  <TimelinesServices :timelines-services="timelinesServices" />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import TimelinesServices from "@/components-new/timelines/TimelinesServices.vue";
import type { TimelinesService } from "@/stores/services";

export default defineComponent({
  name: "services-api-integration",
  components: {
    TimelinesServices,
  },
  setup() {
    const timelinesServices: Array<TimelinesService> = [
      {
        icon: "fasten",
        color: "success",
        title: "Integrate Third-Party APIs",
        description:
          "Seamlessly connect with APIs from payment gateways to in-house APIs",
      },
      {
        icon: "kanban",
        color: "warning",
        title: "Meet Business Flow",
        description: "Minor to none customization to current business flow",
      },
      {
        icon: "arrows-loop",
        color: "primary",
        title: "Data Mapping",
        description:
          "Ensuring correct formatting during transfer of data to and from APIs",
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

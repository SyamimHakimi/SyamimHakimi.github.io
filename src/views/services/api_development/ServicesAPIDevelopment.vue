<script lang="ts">
import { defineComponent } from "vue";
import type { TimelinesService } from "@/stores/services";
import TimelinesServices from "@/components-new/timelines/TimelinesServices.vue";

export default defineComponent({
  name: "services-api-development",
  components: {
    TimelinesServices,
  },
  setup() {
    const timelinesServices: Array<TimelinesService> = [
      {
        icon: "data",
        color: "success",
        title: "Designing RESTful APIs",
        description: "Design to be scalable, secure and easy to maintain",
      },
      {
        icon: "rocket",
        color: "warning",
        title: "Performance Optimization",
        description: "Consideration for future increase of traffic",
      },
      {
        icon: "shield-tick",
        color: "primary",
        title: "Security Implementation",
        description:
          "Ensuring APIs follow secure coding practices to prevent vulnerabilities",
      },
      {
        icon: "send",
        color: "danger",
        title: "Providing Postman Requests",
        description: "Useful for easier maintenance and troubleshooting",
      },
      {
        icon: "book",
        color: "info",
        title: "Writing-up API Documentation",
        description: "Clear handover documents to future developers and users",
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

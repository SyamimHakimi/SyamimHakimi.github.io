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
        icon: "screen",
        color: "success",
        title: "Custom Web Application",
        description:
          "Creating web applications from scratch according to requirements",
      },
      {
        icon: "questionnaire-tablet",
        color: "warning",
        title: "Forms and Validations",
        description: "Comprehensive forms and validation for data entry",
      },
      {
        icon: "security-user",
        color: "primary",
        title: "Access Management",
        description: "Apply security roles for access management",
      },
      {
        icon: "graph-3",
        color: "danger",
        title: "Detailed Dashboard",
        description: "Provide relevant statistics in a single page",
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

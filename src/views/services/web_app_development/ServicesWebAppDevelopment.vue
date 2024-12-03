<script lang="ts">
import { defineComponent, watch } from "vue";
import TimelinesServices from "@/components/timelines/TimelinesServices.vue";
import { useServiceStore } from "@/stores/services";
import { storeToRefs } from "pinia";
import { assignColorListThemeFirestore } from "@/core/helpers/global";

export default defineComponent({
  name: "services-web-app-development",
  components: { TimelinesServices },
  setup() {
    const servicesStore = useServiceStore();
    const { servicesWebAppDevelopmentList } = storeToRefs(servicesStore);
    assignColorListThemeFirestore(servicesWebAppDevelopmentList, "color");

    watch(servicesWebAppDevelopmentList, () => {
      assignColorListThemeFirestore(servicesWebAppDevelopmentList, "color");
    });

    return {
      servicesWebAppDevelopmentList,
    };
  },
});
</script>

<template>
  <TimelinesServices :timelines-services="servicesWebAppDevelopmentList" />
</template>

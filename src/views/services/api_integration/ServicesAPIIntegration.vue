<script lang="ts">
import { defineComponent, watch } from "vue";
import TimelinesServices from "@/components/timelines/TimelinesServices.vue";
import { useServiceStore } from "@/stores/services";
import { storeToRefs } from "pinia";
import { assignColorListThemeFirestore } from "@/core/helpers/global";

export default defineComponent({
  name: "services-api-integration",
  components: {
    TimelinesServices,
  },
  setup() {
    const servicesStore = useServiceStore();
    const { servicesApiIntegrationList } = storeToRefs(servicesStore);
    assignColorListThemeFirestore(servicesApiIntegrationList, "color");

    watch(servicesApiIntegrationList, () => {
      assignColorListThemeFirestore(servicesApiIntegrationList, "color");
    });

    return {
      servicesApiIntegrationList,
    };
  },
});
</script>

<template>
  <TimelinesServices :timelines-services="servicesApiIntegrationList" />
</template>

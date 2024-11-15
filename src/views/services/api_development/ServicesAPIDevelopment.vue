<script lang="ts">
import { defineComponent, watch } from "vue";
import { useServiceStore } from "@/stores/services";
import TimelinesServices from "@/components-new/timelines/TimelinesServices.vue";
import { storeToRefs } from "pinia";
import { assignColorListThemeFirestore } from "@/core/helpers/global";

export default defineComponent({
  name: "services-api-development",
  components: {
    TimelinesServices,
  },
  setup() {
    const servicesStore = useServiceStore();
    const { servicesApiDevelopmentList } = storeToRefs(servicesStore);
    assignColorListThemeFirestore(servicesApiDevelopmentList, "color");

    watch(servicesApiDevelopmentList, () => {
      assignColorListThemeFirestore(servicesApiDevelopmentList, "color");
    });

    return {
      servicesApiDevelopmentList,
    };
  },
});
</script>

<template>
  <TimelinesServices :timelines-services="servicesApiDevelopmentList" />
</template>

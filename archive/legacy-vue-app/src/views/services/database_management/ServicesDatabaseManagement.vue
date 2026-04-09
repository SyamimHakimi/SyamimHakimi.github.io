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
    const { servicesDatabaseManagementList } = storeToRefs(servicesStore);
    assignColorListThemeFirestore(servicesDatabaseManagementList, "color");

    watch(servicesDatabaseManagementList, () => {
      assignColorListThemeFirestore(servicesDatabaseManagementList, "color");
    });

    return {
      servicesDatabaseManagementList,
    };
  },
});
</script>

<template>
  <TimelinesServices :timelines-services="servicesDatabaseManagementList" />
</template>

<template>
  <CardContainer widget-classes="mb-5 mb-xl-10" />
</template>

<script lang="ts">
import { defineComponent, onMounted, onUnmounted } from "vue";
import LayoutService from "@/core/services/LayoutService";
import { LS_CONFIG_NAME_KEY } from "@/stores/config";
import CardContainer from "@/components-new/cards/CardContainer.vue";

export default defineComponent({
  name: "main-dashboard",
  components: {
    CardContainer,
  },
  setup() {
    onMounted(() => {
      if (!localStorage.getItem(LS_CONFIG_NAME_KEY)) {
        LayoutService.enableSidebar();
      }
    });

    onUnmounted(() => {
      if (!localStorage.getItem(LS_CONFIG_NAME_KEY)) {
        LayoutService.disableSidebar();
      }
    });
  },
});
</script>

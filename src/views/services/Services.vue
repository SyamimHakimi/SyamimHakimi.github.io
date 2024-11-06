<script lang="ts">
import { defineComponent } from "vue";
import CardServicesDescription from "@/components-new/cards/CardServicesDescription.vue";
import NavsServices from "@/components-new/navs/NavsServices.vue";

export default defineComponent({
  name: "services-layout",
  components: {
    NavsServices,
    CardServicesDescription,
  },
  setup() {},
});
</script>

<template>
  <CardServicesDescription class="mb-10" />
  <NavsServices />
  <router-view></router-view>
</template>

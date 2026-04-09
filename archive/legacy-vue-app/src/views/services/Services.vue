<script lang="ts">
import { defineComponent } from "vue";
import CardServicesDescription from "@/components/cards/CardServicesDescription.vue";
import NavsServices from "@/components/navs/NavsServices.vue";

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

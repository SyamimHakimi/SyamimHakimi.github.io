<script lang="ts">
import { defineComponent } from "vue";
import CardGallery from "@/components-new/cards/CardGallery.vue";
import LayoutGrids from "@/components-new/layouts/LayoutGrids.vue";
import LayoutBuilder from "@/views/LayoutBuilder.vue";
import CardServicesDescription from "@/components-new/cards/CardServicesDescription.vue";
import AccountOverview from "@/views/crafted/account/Overview.vue";
import TabsPortfolio from "@/components-new/tabs/TabsPortfolio.vue";
import NavsServices from "@/components-new/navs/NavsServices.vue";

export default defineComponent({
  name: "services-layout",
  components: {
    NavsServices,
    TabsPortfolio,
    AccountOverview,
    CardServicesDescription,
    LayoutBuilder,
    LayoutGrids,
    CardGallery,
  },
  setup() {},
});
</script>

<template>
  <CardServicesDescription class="mb-10" />
  <NavsServices />
  <router-view></router-view>
  <LayoutBuilder />
  <!--  C:\Users\Syamim\Documents\GitHub\SyamimHakimi.github.io\src\views\LayoutBuilder.vue-->
</template>

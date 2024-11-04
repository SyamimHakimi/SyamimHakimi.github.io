<script lang="ts">
import { defineComponent } from "vue";
import TabsPortfolio from "@/components-new/tabs/TabsPortfolio.vue";
import type { PortfolioTabs } from "@/stores/portfolio";

export default defineComponent({
  name: "portfolio-layout",
  components: {
    TabsPortfolio,
  },
  setup() {
    const portfolioTabs: Array<PortfolioTabs> = [
      {
        routerTo: "/portfolio/experience",
        icon: ["python", "vue"],
        iconColor: "light",
        color: "dark",
        title: "Experience",
        description: "Language, Framework, Protocols",
      },
      {
        routerTo: "/portfolio/personal_projects",
        icon: ["monitor-mobile"],
        iconColor: "light",
        color: "dark",
        title: "Personal Projects",
        description: "Web Applications",
      },
    ];

    return {
      portfolioTabs,
    };
  },
});
</script>

<template>
  <nav class="nav nav-pills nav-justified flex-column flex-sm-row mb-10">
    <TabsPortfolio
      v-for="(portfolioTab, index) in portfolioTabs"
      :key="index"
      :router-to="portfolioTab.routerTo"
      :title="portfolioTab.title"
      :description="portfolioTab.description"
      :icons="portfolioTab.icon"
      :icon-color="portfolioTab.iconColor"
      :color="portfolioTab.color"
      widget-classes="card-xl-stretch"
      :class="{
        'mb-5 mb-sm-0 me-sm-6 me-xl-10': index < portfolioTabs.length - 1,
      }"
    />
  </nav>
  <router-view></router-view>
</template>

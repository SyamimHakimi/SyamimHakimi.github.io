<script lang="ts">
import { defineComponent } from "vue";
import type { ServicesTab } from "@/stores/services";

export default defineComponent({
  name: "navs-services",
  setup() {
    const servicesTabs: Array<ServicesTab> = [
      {
        routerTo: "/services/api_development",
        title: "API Development",
      },
      {
        routerTo: "/services/api_integration",
        title: "API Integration",
      },
      {
        routerTo: "/services/database_management",
        title: "Database Management",
      },
      {
        routerTo: "/services/web_app_development",
        title: "Web Application Development",
      },
    ];

    return {
      servicesTabs,
    };
  },
});
</script>

<template>
  <nav
    class="nav nav-tabs nav-justified nav-line-tabs nav-line-tabs-2x mb-5 fs-5 fw-bold"
  >
    <template v-for="(servicesTab, index) in servicesTabs" :key="index">
      <router-link
        class="nav-link btn btn-active-light btn-color-gray-600 btn-active-color-primary rounded-bottom-0 d-flex align-items-center justify-content-center"
        :to="servicesTab.routerTo"
        :active-class="`active btn-active-color-primary btn-active-light`"
        >{{ servicesTab.title }}</router-link
      >
    </template>
  </nav>
</template>

<template>
  <!--begin::Header-->
  <div
    id="kt_header"
    class="header align-items-stretch"
    :data-kt-sticky="isHeaderSticky"
    data-kt-sticky-name="header"
    data-kt-sticky-offset="{default: '200px', lg: '300px'}"
  >
    <!--begin::Container-->
    <div
      id="kt_header_container"
      :class="{
        'container-fluid': headerWidthFluid,
        'container-xxl': !headerWidthFluid,
      }"
      class="d-flex flex-stack flex-wrap gap-2"
    >
      <div class="d-flex d-lg-none align-items-center ms-n2 me-2">
        <!--begin::Aside mobile toggle-->
        <div class="btn btn-icon btn-active-icon-primary" id="kt_aside_toggle">
          <KTIcon icon-name="abstract-14" icon-clss="fs-1 mt-1" />
        </div>
        <!--end::Aside mobile toggle-->

        <!--begin::Logo-->
        <router-link to="/dashboard" class="d-flex align-items-center">
          <img
            alt="Logo"
            :src="getAssetPath('media/logos/light-default.svg')"
            class="h-20px logo theme-light-show"
          />
          <img
            alt="Logo"
            :src="getAssetPath('media/logos/dark-default.svg')"
            class="h-20px logo theme-dark-show"
          />
        </router-link>
        <!--end::Logo-->
      </div>

      <PageTitle />
    </div>
    <!--end::Container-->
  </div>
  <!--end::Header-->
</template>

<script lang="ts">
import { getAssetPath } from "@/core/helpers/assets";
import { computed, defineComponent } from "vue";
import PageTitle from "@/layouts/main-layout/page-title/PageTitle.vue";

import {
  asideDisplay,
  headerFixed,
  headerFixedOnMobile,
  headerLeft,
  headerWidthFluid,
} from "@/core/helpers/config";
import KTIcon from "@/core/helpers/kt-icon/KTIcon.vue";

export default defineComponent({
  name: "KTHeader",
  components: {
    KTIcon,
    PageTitle,
  },
  setup() {
    const isHeaderSticky = computed(() => {
      if (window.innerWidth > 768) {
        return headerFixed.value;
      } else {
        return headerFixedOnMobile.value;
      }
    });

    return {
      headerWidthFluid,
      headerLeft,
      asideDisplay,
      isHeaderSticky,
      getAssetPath,
    };
  },
});
</script>

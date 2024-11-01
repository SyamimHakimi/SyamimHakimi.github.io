<template>
  <!--begin::Aside-->
  <div
    id="kt_aside"
    class="aside py-9"
    data-kt-drawer="true"
    data-kt-drawer-name="aside"
    data-kt-drawer-activate="{default: true, lg: false}"
    data-kt-drawer-overlay="true"
    data-kt-drawer-width="{default:'200px', '300px': '250px'}"
    data-kt-drawer-direction="start"
    data-kt-drawer-toggle="#kt_aside_toggle"
  >
    <!--begin::Aside logo-->
    <div class="aside-logo flex-column-auto px-9 mb-9" id="kt_aside_logo">
      <!--begin::Logo-->
      <router-link to="/dashboard">
        <img
          alt="Logo"
          :src="getAssetPath('media/logos/light-default.svg')"
          class="h-20px theme-light-show"
        />
        <img
          alt="Logo"
          :src="getAssetPath('media/logos/dark-default.svg')"
          class="h-20px theme-dark-show"
        />
      </router-link>
      <!--end::Logo-->
    </div>
    <!--end::Aside logo-->

    <!--begin::Aside menu-->
    <div class="aside-menu flex-column-fluid ps-5 pe-3">
      <KTMenu></KTMenu>
    </div>
    <!--end::Aside menu-->

    <!--begin::Footer-->
    <div class="aside-footer flex-column-auto px-9" id="kt_aside_footer">
      <!--begin::User panel-->
      <div class="d-flex flex-stack">
        <!--begin::Wrapper-->
        <div class="d-flex align-items-center">
          <!--begin::Avatar-->
          <div class="symbol symbol-square symbol-40px">
            <img
              alt="Logo"
              :src="getAssetPath('media/logos/dark-small-square-300.png')"
              class="theme-light-show"
            />
            <img
              alt="Logo"
              :src="getAssetPath('media/logos/light-small-square-300.png')"
              class="theme-dark-show"
            />
          </div>
          <!--end::Avatar-->

          <!--begin::User info-->
          <div class="ms-3">
            <!--begin::Name-->
            <span class="text-gray-800 fs-6 fw-bold lh-1">Syamim Hakimi</span>
            <!--end::Name-->

            <!--begin::Major-->
            <span class="text-muted fw-semobold d-block fs-7 lh-1"
              >Software Developer</span
            >
            <!--end::Major-->
          </div>
          <!--end::User info-->
        </div>
        <!--begin::Theme mode-->
        <div class="d-flex align-items-center ms-3 ms-lg-4">
          <!--begin::Menu toggle-->
          <a
            href="#"
            class="btn btn-icon btn-color-gray-700 btn-active-color-primary btn-outline w-40px h-40px"
            data-kt-menu-trigger="{default:'click', lg: 'hover'}"
            data-kt-menu-attach="parent"
            data-kt-menu-placement="bottom-end"
          >
            <KTIcon
              icon-name="night-day"
              icon-class="theme-light-show fs-2 fs-md-1"
            />
            <KTIcon
              icon-name="moon"
              icon-class="theme-dark-show fs-2 fs-md-1"
            />
          </a>
          <!--begin::Menu toggle-->
          <KTThemeModeSwitcher></KTThemeModeSwitcher>
        </div>
        <!--end::Theme mode-->
        <!--end::Wrapper-->
      </div>
      <!--end::User panel-->
    </div>
    <!--end::Footer-->
  </div>
  <!--end::Aside-->
</template>

<script lang="ts">
import { getAssetPath } from "@/core/helpers/assets";
import { defineComponent } from "vue";
import { useI18n } from "vue-i18n";
import KTMenu from "@/layouts/main-layout/aside/Menu.vue";
import { asideTheme } from "@/core/helpers/config";
import KTThemeModeSwitcher from "@/layouts/main-layout/theme-mode/ThemeModeSwitcher.vue";
import KTIcon from "@/core/helpers/kt-icon/KTIcon.vue";

export default defineComponent({
  name: "KTAside",
  components: {
    KTIcon,
    KTThemeModeSwitcher,
    KTMenu,
  },
  props: {
    lightLogo: String,
    darkLogo: String,
  },
  setup() {
    const { t } = useI18n();

    return {
      asideTheme,
      t,
      getAssetPath,
    };
  },
});
</script>

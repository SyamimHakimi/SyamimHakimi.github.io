<template>
  <!--begin::Footer-->
  <div class="footer py-4 d-flex flex-lg-column" id="kt_footer">
    <!--begin::Container-->
    <div
      class="d-flex flex-column flex-md-row align-items-center justify-content-between"
      :class="{
        'container-fluid': footerWidthFluid,
        'container-xxl': !footerWidthFluid,
      }"
    >
      <!--begin::Copyright-->
      <div class="text-muted fw-semibold order-2 order-md-1">
        2024&copy; sym.
      </div>
      <!--end::Copyright-->
    </div>
    <!--end::Container-->
  </div>
  <!--end::Footer-->
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { footerWidthFluid } from "@/core/helpers/config";

export default defineComponent({
  name: "KTFooter",
  setup() {
    return {
      footerWidthFluid,
    };
  },
});
</script>

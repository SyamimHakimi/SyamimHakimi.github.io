<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "layout-grids",
});
</script>

<template>
  <div class="row gy-5 g-xl-10">
    <!--begin::Col-->
    <slot name="gridColumns" />
    <!--end::Col-->
  </div>
</template>

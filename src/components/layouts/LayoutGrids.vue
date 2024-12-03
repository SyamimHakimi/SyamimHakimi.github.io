<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "layout-grids",
  props: {
    gutterClass: { type: String, required: false },
  },
});
</script>

<template>
  <div class="row" :class="gutterClass ? gutterClass : 'gy-5 g-xl-10'">
    <!--begin::Col-->
    <slot name="gridColumns" />
    <!--end::Col-->
  </div>
</template>

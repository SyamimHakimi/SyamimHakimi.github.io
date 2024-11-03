<script lang="ts">
import { computed, defineComponent } from "vue";

export default defineComponent({
  name: "card-container",
  props: {
    cardTitle: { type: String, required: false },
    cardSubtitle: { type: String, required: false },
    headerBorder: { type: Boolean, required: false, default: true },
    inLayoutGrid: { type: Boolean, required: false, default: false },
    widgetClasses: { type: String, required: false },
  },
  setup(props) {
    const hasHeader = computed(() => {
      return props.cardTitle !== undefined;
    });

    return {
      hasHeader,
    };
  },
});
</script>

<template>
  <div
    class="card"
    :class="{
      'h-xl-100': inLayoutGrid,
      'mb-5 mb-xl-10': !inLayoutGrid,
      [widgetClasses + '']: widgetClasses,
    }"
  >
    <!--begin::Header-->
    <div
      v-if="hasHeader"
      class="card-header"
      :class="{
        'pt-5': cardSubtitle,
        'border-0': !headerBorder,
      }"
    >
      <h3 class="card-title align-items-start flex-column">
        <span class="card-label fw-bold fs-3">{{ cardTitle }}</span>

        <span v-if="cardSubtitle" class="text-muted mt-1 fw-semibold fs-7">{{
          cardSubtitle
        }}</span>
      </h3>
    </div>
    <!--end::Header-->

    <!--begin::Body-->
    <div class="card-body" :class="{ 'pt-5': cardSubtitle && !headerBorder }">
      <slot name="cardBody" />
    </div>
    <!--begin::Body-->
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";

export default defineComponent({
  name: "card-container",
  props: {
    cardTitle: { type: String, required: false },
    cardSubtitle: { type: String, required: false },
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
  <div class="card" :class="widgetClasses">
    <!--begin::Header-->
    <div v-if="hasHeader" class="card-header border-0 pt-5">
      <h3 class="card-title align-items-start flex-column">
        <span class="card-label fw-bold fs-3 mb-1">{{ cardTitle }}</span>

        <span v-if="cardSubtitle" class="text-muted mt-1 fw-semibold fs-7">{{
          cardSubtitle
        }}</span>
      </h3>
    </div>
    <!--end::Header-->

    <!--begin::Body-->
    <div class="card-body py-3">
      <slot name="cardBody" />
    </div>
    <!--begin::Body-->
  </div>
</template>

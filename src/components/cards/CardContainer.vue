<script lang="ts">
import { computed, defineComponent } from "vue";
import { getAssetPath } from "@/core/helpers/assets";

export default defineComponent({
  name: "card-container",
  methods: { getAssetPath },
  props: {
    cardTitle: { type: String, required: false },
    cardSubtitle: { type: String, required: false },
    iconImg: { type: String, required: false },
    badgeText: { type: String, required: false },
    badgeColor: { type: String, required: false },
    link: { type: String, required: false },
    headerBorder: { type: Boolean, required: false, default: true },
    bodyPadding: { type: Boolean, required: false, default: true },
    inLayoutGrid: { type: Boolean, required: false, default: false },
    widgetClasses: { type: String, required: false },
  },
  setup(props) {
    const hasHeader = computed(() => {
      return props.cardTitle !== undefined || props.iconImg !== undefined;
    });

    return {
      hasHeader,
    };
  },
});
</script>

<template>
  <a
    :href="link"
    class="card"
    :class="{
      'h-100': inLayoutGrid,
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
        'pt-9': iconImg,
        'border-0': !headerBorder,
      }"
    >
      <div class="d-flex">
        <!--begin::Avatar-->
        <div
          v-if="iconImg"
          class="align-content-center align-self-center symbol symbol-50px h-50px w-50px bg-white me-3"
        >
          <img :src="getAssetPath(iconImg)" alt="icon" class="h-auto p-3" />
        </div>
        <!--end::Avatar-->

        <!--begin::Title-->
        <h3 class="card-title align-items-start flex-column">
          <span class="card-label fw-bold fs-3">{{ cardTitle }}</span>
          <span v-if="cardSubtitle" class="text-muted mt-1 fw-semibold fs-7">{{
            cardSubtitle
          }}</span>
        </h3>
        <!--end::Title-->
      </div>

      <!--begin::Card toolbar-->
      <div v-if="badgeText" class="card-toolbar">
        <span
          :class="`badge-light-${badgeColor ?? 'primary'}`"
          class="badge fw-bold me-auto px-4 py-3"
          >{{ badgeText }}</span
        >
      </div>
      <!--end::Card toolbar-->
    </div>
    <!--end::Header-->

    <!--begin::Body-->
    <div
      class="card-body"
      :class="{ 'pt-5': cardSubtitle && !headerBorder, 'p-0': !bodyPadding }"
    >
      <slot name="cardBody" />
    </div>
    <!--begin::Body-->
  </a>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import KTIcon from "@/core/helpers/kt-icon/KTIcon.vue";
import { useRoute } from "vue-router";

export default defineComponent({
  name: "tabs-portfolio",
  props: {
    routerTo: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    icons: { type: Array<string>, required: true },
    iconColor: { type: String, required: true },
    color: { type: String, required: true },
    widgetClasses: { type: String, required: false },
  },
  components: { KTIcon },
  setup(props) {
    const route = useRoute();
    const isActive = computed(() => {
      return route.path === props.routerTo;
    });
    const iconClass = computed(() => {
      return isActive.value
        ? `text-inverse-${props.color} fs-3x mx-n1`
        : `text-muted fs-3x mx-n1`;
    });

    return {
      isActive,
      iconClass,
    };
  },
});
</script>

<template>
  <router-link
    class="nav-link card"
    :to="routerTo"
    :active-class="`active bg-${color}`"
  >
    <div class="card-body">
      <template v-for="(icon, index) in icons" :key="index">
        <KTIcon :icon-name="icon" :icon-class="iconClass" />
      </template>

      <div
        :class="isActive ? `text-inverse-${color}` : `text-muted`"
        class="fw-bold fs-2 mb-2 mt-5"
      >
        {{ title }}
      </div>

      <div
        :class="isActive ? `text-inverse-${color}` : `text-muted`"
        class="fw-semibold fs-7"
      >
        {{ description }}
      </div>
    </div>
  </router-link>
</template>

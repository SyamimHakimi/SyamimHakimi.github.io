<script lang="ts">
import { defineComponent, ref, watch } from "vue";

// const storeAssets = useAssetsStore();

export default defineComponent({
  name: "images-container",
  props: {
    imgSrc: { type: String, required: true },
    border: { type: Boolean, required: false, default: false },
    required: { type: Boolean, required: false, default: false },
  },
  components: {},
  setup(props) {
    const isImageError = ref(false);

    const handleImageError = () => {
      isImageError.value = true;
    };

    watch(
      () => props.imgSrc,
      () => {
        isImageError.value = false;
      },
    );

    return {
      isImageError,
      handleImageError,
    };
  },
});
</script>

<template>
  <p v-if="isImageError" class="ki-duotone ki-information text-warning fs-4x">
    ERROR FETCH
  </p>
  <img
    v-else
    :src="imgSrc"
    @error="handleImageError"
    alt=""
    class="mw-100"
    :class="border ? 'border' : ''"
  />
  <!--  <p v-else class="ki-duotone ki-question fs-4x" :class="required ? 'text-danger' : ''">-->
  <!--      ERROR NO IMAGE-->
  <!--  </p>-->
</template>

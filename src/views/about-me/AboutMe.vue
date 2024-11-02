<template>
  <LayoutGrids>
    <template v-slot:gridColumns>
      <div class="col-md-6 col-xxl-4">
        <!--begin::Child-->
        <CardGallery
          title="box."
          date-posted="01 November 24"
          img-src="https://24ai.tech/en/wp-content/uploads/sites/3/2023/10/01_product_1_sdelat-kvadratnym-5-scaled.jpg"
        />
        <!--end::Child-->
      </div>
      <div class="col-md-6 col-xxl-4">
        <!--begin::Child-->
        <CardGallery
          title="sunset."
          date-posted="01 November 24"
          img-src="https://24ai.tech/en/wp-content/uploads/sites/3/2023/10/01_product_1_sdelat-kvadratnym-5-scaled.jpg"
        />
        <!--end::Child-->
      </div>
    </template>
  </LayoutGrids>
  <!--  Hobbies and shit \src\views\crafted\account\Overview.vue-->
</template>

<script lang="ts">
import { defineComponent, onMounted, onUnmounted } from "vue";
import LayoutService from "@/core/services/LayoutService";
import { LS_CONFIG_NAME_KEY } from "@/stores/config";
import CardGallery from "@/components-new/cards/CardGallery.vue";
import LayoutGrids from "@/components-new/layouts/LayoutGrids.vue";

export default defineComponent({
  name: "main-dashboard",
  components: { LayoutGrids, CardGallery },
  setup() {
    onMounted(() => {
      if (!localStorage.getItem(LS_CONFIG_NAME_KEY)) {
        LayoutService.enableSidebar();
      }
    });

    onUnmounted(() => {
      if (!localStorage.getItem(LS_CONFIG_NAME_KEY)) {
        LayoutService.disableSidebar();
      }
    });
  },
});
</script>

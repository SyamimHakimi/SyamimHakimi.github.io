<script lang="ts">
import { defineComponent } from "vue";
import CardGallery from "@/components-new/cards/CardGallery.vue";
import LayoutGrids from "@/components-new/layouts/LayoutGrids.vue";

export default defineComponent({
  name: "main-dashboard",
  components: { LayoutGrids, CardGallery },
  setup() {},
});
</script>

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
</template>

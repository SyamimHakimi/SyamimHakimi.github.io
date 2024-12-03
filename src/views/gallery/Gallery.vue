<script lang="ts">
import { defineComponent } from "vue";
import CardGallery from "@/components/cards/CardGallery.vue";
import LayoutGrids from "@/components/layouts/LayoutGrids.vue";
import { useGalleryStore } from "@/stores/gallery";
import { storeToRefs } from "pinia";
import { convertTimestampToDateString } from "@/core/helpers/global";

export default defineComponent({
  name: "gallery-layout",
  methods: { convertTimestampToDateString },
  components: { LayoutGrids, CardGallery },
  setup() {
    const galleryStore = useGalleryStore();
    const { galleryList } = storeToRefs(galleryStore);

    return {
      galleryList,
    };
  },
});
</script>

<template>
  <LayoutGrids>
    <template v-slot:gridColumns>
      <template v-for="(photoItem, index) in galleryList" :key="index">
        <div class="col-md-6 col-xxl-4">
          <!--begin::Child-->
          <CardGallery
            :title="photoItem.title"
            :theme="photoItem.theme"
            :recipe="photoItem.recipe"
            :date-posted="convertTimestampToDateString(photoItem.datePosted)"
            :img-src="photoItem.imgSrc"
            :in-layout-grid="true"
          />
          <!--end::Child-->
        </div>
      </template>
    </template>
  </LayoutGrids>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from "vue";
import CardGallery from "@/components/cards/CardGallery.vue";
import LayoutGrids from "@/components/layouts/LayoutGrids.vue";
import {
  fetchPaginateGalleryList,
  limitGallery,
  useGalleryStore,
} from "@/stores/gallery";
import { storeToRefs } from "pinia";
import { convertTimestampToDateString } from "@/core/helpers/global";
import PaginateGallery from "@/components/paginate/PaginateGallery.vue";
import { usePhotographyJourneyStore } from "@/stores/photography-journey";
import { usePendingPromises } from "vuefire";

export default defineComponent({
  name: "gallery-layout",
  methods: {
    limitGallery() {
      return limitGallery;
    },
    convertTimestampToDateString,
  },
  components: { PaginateGallery, LayoutGrids, CardGallery },
  setup() {
    const galleryStore = useGalleryStore();
    const { galleryList } = storeToRefs(galleryStore);

    const photographyJourneyStore = usePhotographyJourneyStore();
    const { mainStatsRaw } = storeToRefs(photographyJourneyStore);

    const currentPage = ref(1);

    const totalPage = computed(() => {
      return (mainStatsRaw.value?.total_fav_photos ?? 0) % limitGallery;
    });

    async function getList(page: number) {
      let mode = <"next" | "back">"back";
      let item = galleryList.value[0];
      if (currentPage.value < page) {
        mode = "next";
        item = galleryList.value[galleryList.value.length - 1];
      }

      if (item && mode) {
        const newList = await fetchPaginateGalleryList(item.documentId, mode);
        await usePendingPromises();
        galleryList.value.length = 0;
        galleryList.value = newList.value;
        currentPage.value = page;
      }
    }

    return {
      currentPage,
      galleryList,
      totalPage,
      mainStatsRaw,
      getList,
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
            :date-posted="
              photoItem.datePosted
                ? convertTimestampToDateString(photoItem.datePosted)
                : ''
            "
            :img-src="photoItem.imgSrc"
            :in-layout-grid="true"
          />
          <!--end::Child-->
        </div>
      </template>
      <PaginateGallery
        class="mt-4"
        :maxVisibleButtons="0"
        :current-page="currentPage"
        :per-page="limitGallery()"
        :total="mainStatsRaw?.total_fav_photos ?? 0"
        :total-pages="totalPage"
        @pageChange="getList"
      ></PaginateGallery>
    </template>
  </LayoutGrids>
</template>

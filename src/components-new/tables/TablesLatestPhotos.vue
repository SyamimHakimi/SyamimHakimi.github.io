<script lang="ts">
import { getAssetPath } from "@/core/helpers/assets";
import { defineComponent, ref } from "vue";
import CardContainer from "@/components-new/cards/CardContainer.vue";
import type { PhotoItem } from "@/stores/photography-journey";
import KTIcon from "@/core/helpers/kt-icon/KTIcon.vue";

export default defineComponent({
  name: "tables-latest-photos",
  components: { KTIcon, CardContainer },
  props: {
    inLayoutGrid: { type: Boolean, required: false, default: false },
  },
  setup() {
    const checkedRows = ref<Array<number>>([]);

    const photoItemList: Array<PhotoItem> = [
      {
        imgSrc: getAssetPath("media/stock/600x400/img-20.jpg"),
        title: "super.",
        isFavourite: false,
        theme: "Landscape",
        focalLength: 24,
        datePosted: "01/06/2024",
      },
      {
        imgSrc: getAssetPath("media/stock/600x400/img-20.jpg"),
        title: "super.",
        isFavourite: true,
        theme: "Potrait",
        focalLength: 24,
        datePosted: "30/05/2024",
      },
      {
        imgSrc: getAssetPath("media/stock/600x400/img-20.jpg"),
        title: "super.",
        isFavourite: false,
        theme: "Landscape",
        focalLength: 24,
        datePosted: "14/04/2024",
      },
      {
        imgSrc: getAssetPath("media/stock/600x400/img-20.jpg"),
        title: "super.",
        isFavourite: false,
        theme: "Landscape",
        focalLength: 24,
        datePosted: "21/02/2024",
      },
      {
        imgSrc: getAssetPath("media/stock/600x400/img-20.jpg"),
        title: "super.",
        isFavourite: true,
        theme: "Potrait",
        focalLength: 24,
        datePosted: "21/01/2024",
      },
    ];

    return {
      photoItemList,
      checkedRows,
      getAssetPath,
    };
  },
});
</script>

<template>
  <CardContainer
    card-title="Latest Photos"
    :header-border="false"
    :in-layout-grid="inLayoutGrid"
  >
    <template v-slot:cardBody>
      <div class="table-responsive">
        <table
          class="table table-row-dashed table-row-gray-300 align-middle gs-0 gy-4"
        >
          <thead>
            <tr class="fw-bold text-muted">
              <th class="min-w-100px">Photo</th>
              <th class="min-w-150px">Title</th>
              <th class="min-w-150px">Theme</th>
              <th class="min-w-100px">Focal Length</th>
              <th class="min-w-100px">Date Posted</th>
            </tr>
          </thead>

          <tbody>
            <template v-for="(photoItem, index) in photoItemList" :key="index">
              <tr>
                <td>
                  <img
                    alt="img"
                    class="rounded mw-150px"
                    :src="photoItem.imgSrc"
                  />
                </td>
                <td class="text-dark fw-bold fs-5">
                  <span>{{ photoItem.title }}</span>
                  <span v-if="photoItem.isFavourite">
                    <KTIcon
                      icon-name="star"
                      icon-class="text-warning fs-2 ms-1"
                  /></span>
                </td>
                <td class="text-dark fw-bold fs-5">
                  {{ photoItem.theme }}
                </td>
                <td class="text-dark fw-bold fs-5">
                  {{ photoItem.focalLength }}mm
                </td>
                <td class="text-muted fs-5">
                  {{ photoItem.datePosted }}
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </template>
  </CardContainer>
</template>

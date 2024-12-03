<script lang="ts">
import { defineComponent } from "vue";
import CardContainer from "@/components-new/cards/CardContainer.vue";
import { usePhotographyJourneyStore } from "@/stores/photography-journey";
import { storeToRefs } from "pinia";
import { convertTimestampToDateString } from "@/core/helpers/global";

export default defineComponent({
  name: "tables-latest-photos",
  methods: { convertTimestampToDateString },
  components: { CardContainer },
  props: {
    inLayoutGrid: { type: Boolean, required: false, default: false },
  },
  setup() {
    const photographyJourneyStore = usePhotographyJourneyStore();
    const { latestPhotos } = storeToRefs(photographyJourneyStore);

    return {
      latestPhotos,
    };
  },
});
</script>

<template>
  <CardContainer
    card-title="Latest Favourite Photos"
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
              <th class="min-w-150px">Recipe</th>
              <th class="min-w-100px">Focal Length</th>
              <th class="min-w-100px">Date Posted</th>
            </tr>
          </thead>

          <tbody>
            <template v-for="(photoItem, index) in latestPhotos" :key="index">
              <tr>
                <td>
                  <img
                    alt="img"
                    class="rounded mw-150px"
                    :src="photoItem.imgSrc"
                  />
                </td>
                <td class="text-dark fw-bold fs-5">
                  {{ photoItem.title }}
                </td>
                <td class="text-dark fw-bold fs-5">
                  {{ photoItem.theme }}
                </td>
                <td class="text-dark fw-bold fs-5">
                  {{ photoItem.recipe }}
                </td>
                <td class="text-dark fw-bold fs-5">
                  {{ photoItem.focalLength }}mm
                </td>
                <td class="text-muted fs-5">
                  {{ convertTimestampToDateString(photoItem.datePosted) }}
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </template>
  </CardContainer>
</template>

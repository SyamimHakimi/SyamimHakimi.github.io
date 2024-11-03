<script lang="ts">
import { defineComponent } from "vue";
import CardContainer from "@/components-new/cards/CardContainer.vue";
import "@/core/helpers/global";
import type { ProfileDetails } from "@/stores/about-me";

export default defineComponent({
  name: "card-profile",
  components: { CardContainer },
  setup() {
    const profileDetails: ProfileDetails = {
      name: "Syamim Hakimi",
      country: "Malaysia",
      residing_country: "Malaysia",
      hobbies: "Boardgames, Photography, Gardening",
    };

    return {
      profileDetails,
    };
  },
});
</script>

<template>
  <CardContainer card-title="Profile Details">
    <template v-slot:cardBody>
      <!--begin::Row-->
      <div v-for="(value, key) in profileDetails" :key="key" class="row mb-7">
        <label class="col-lg-4 fw-semibold text-muted">{{
          key.replace("_", " ").toTitleCase()
        }}</label>
        <div class="col-lg-8">
          <span class="fw-bold fs-6 text-dark">{{ value }}</span>
        </div>
      </div>
    </template>
  </CardContainer>
</template>

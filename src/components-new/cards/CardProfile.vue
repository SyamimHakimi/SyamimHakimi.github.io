<script lang="ts">
import { defineComponent } from "vue";
import CardContainer from "@/components-new/cards/CardContainer.vue";
import "@/core/helpers/global";
import { useAboutMeStore } from "@/stores/about-me";
import { storeToRefs } from "pinia";

export default defineComponent({
  name: "card-profile",
  components: { CardContainer },
  setup() {
    const aboutMeStore = useAboutMeStore();
    const { profileDetails, socialMediaList } = storeToRefs(aboutMeStore);

    return {
      profileDetails,
      socialMediaList,
    };
  },
});
</script>

<template>
  <CardContainer card-title="Profile Details">
    <template v-slot:cardBody>
      <!--begin::Row-->
      <div v-for="(value, key) in profileDetails" :key="key" class="row mb-7">
        <label class="col-lg-2 fw-semibold text-muted">{{
          key.replace("_", " ").toTitleCase()
        }}</label>
        <div class="col-lg-10">
          <span class="fw-bold fs-6 text-dark">{{ value }}</span>
        </div>
      </div>

      <hr class="text-muted" />
      <div class="mb-7" />

      <div v-for="(value, key) in socialMediaList" :key="key" class="row mb-7">
        <label class="col-lg-2 fw-semibold text-muted">
          <i :class="`${value.icon} fs-2 me-2`" />
          {{ value.name }}
        </label>
        <div class="col-lg-10">
          <a
            :href="value.link"
            class="fw-bold fs-6 text-dark text-hover-primary"
            >{{ value.text }}
          </a>
        </div>
      </div>
    </template>
  </CardContainer>
</template>

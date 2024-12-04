<script lang="ts">
import { defineComponent } from "vue";
import type { TimelinesService } from "@/stores/services";
import TimelinesServicesItem from "@/components/timelines/TimelinesServicesItem.vue";
import CardContainer from "@/components/cards/CardContainer.vue";

export default defineComponent({
  name: "timelines-services",
  components: { CardContainer, TimelinesServicesItem },
  props: {
    timelinesServices: {
      type: Array<TimelinesService>,
      required: true,
    },
  },
  setup() {
    return {};
  },
});
</script>

<template>
  <CardContainer card-title="Services Provided">
    <template v-slot:cardBody>
      <div class="timeline">
        <template
          v-for="(timelinesService, index) in timelinesServices"
          :key="index"
        >
          <TimelinesServicesItem :timelines-services="timelinesService" />
        </template>
        <div />
      </div>
    </template>
  </CardContainer>
</template>

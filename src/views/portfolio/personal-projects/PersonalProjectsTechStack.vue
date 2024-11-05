<script lang="ts">
import { defineComponent } from "vue";
import CardContainer from "@/components-new/cards/CardContainer.vue";
import { getAssetPath } from "@/core/helpers/assets";
import KTIcon from "@/core/helpers/kt-icon/KTIcon.vue";
import type { PersonalProjectsTechStack } from "@/stores/portfolio";

export default defineComponent({
  name: "personal-projects-tech-stack",
  methods: { getAssetPath },
  components: { KTIcon, CardContainer },
  props: {
    personalProjectsTechStackList: {
      type: Array<PersonalProjectsTechStack>,
      required: true,
    },
    inLayoutGrid: { type: Boolean, required: false },
  },
  setup() {},
});
</script>

<template>
  <CardContainer card-title="Notable Tech Stack" :in-layout-grid="inLayoutGrid">
    <template v-slot:cardBody>
      <template
        v-for="(
          personalProjectsTechStack, index
        ) in personalProjectsTechStackList"
        :key="index"
      >
        <div class="d-flex flex-stack">
          <div class="d-flex">
            <img
              :src="getAssetPath(personalProjectsTechStack.imgSrc)"
              class="w-30px me-6"
              alt="logo"
            />

            <div class="d-flex flex-column">
              <a href="#" class="fs-5 text-dark text-hover-primary fw-bold">
                {{ personalProjectsTechStack.title }}
              </a>
              <div class="fs-6 fw-semibold text-muted">
                {{ personalProjectsTechStack.description }}
              </div>
            </div>
          </div>

          <div class="d-flex justify-content-end">
            <a
              :href="personalProjectsTechStack.link"
              class="btn btn-icon btn-light btn-sm border-0"
            >
              <KTIcon icon-name="note-2" icon-class="fs-2 text-dark" />
            </a>
          </div>
        </div>

        <div
          v-if="index < personalProjectsTechStackList.length - 1"
          class="separator separator-dashed my-5"
        ></div>
      </template>
    </template>
  </CardContainer>
</template>

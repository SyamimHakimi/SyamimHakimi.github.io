<script lang="ts">
import { defineComponent } from "vue";
import CardContainer from "@/components-new/cards/CardContainer.vue";
import KTIcon from "@/core/helpers/kt-icon/KTIcon.vue";
import LayoutGrids from "@/components-new/layouts/LayoutGrids.vue";

export default defineComponent({
  name: "card-services-description",
  components: { LayoutGrids, KTIcon, CardContainer },
  props: {
    inLayoutGrid: { type: Boolean, required: false },
  },
  setup() {},
});
</script>

<template>
  <CardContainer :in-layout-grid="inLayoutGrid">
    <template v-slot:cardBody>
      <div class="d-flex align-items-center">
        <KTIcon
          icon-name="code"
          icon-class="fs-5x text-dark me-7 d-none d-sm-block"
        />
        <div>
          <div class="fs-5 fw-normal text-gray-600 mb-5">
            Here are my range of services for my freelancing gig. I specialize
            in back-end development but also provide services in web app
            development. Whether you need to connect disparate systems or
            develop a custom web application from the ground up, I am dedicated
            to understanding your unique needs and providing reliable services.
            Let’s collaborate to bring your ideas to life!
          </div>

          <div class="notice bg-light rounded p-6">
            <LayoutGrids gutter-class="gy-5">
              <template v-slot:gridColumns>
                <div class="d-flex col-12 col-xxl-3 align-items-center">
                  <KTIcon
                    icon-name="messages"
                    icon-class="fs-2tx text-dark me-4"
                  />
                  <span class="fs-3 text-gray-800 fw-bold"
                    >Contact Information</span
                  >
                </div>
                <a
                  href="#"
                  class="d-flex col-md-6 col-lg-12 col-xl-6 col-xxl-auto align-items-center text-gray-700 text-hover-primary"
                >
                  <KTIcon icon-name="sms" icon-class="fs-2 me-2 text-dark" />
                  <span class="fs-5 fw-normal">
                    syamim.dev@tunasprism.com.my
                  </span>
                </a>
                <div class="vr px-0 d-none d-xxl-block"></div>
                <a
                  href="#"
                  class="d-flex col-md-6 col-lg-12 col-xl-6 col-xxl-auto align-items-center text-gray-700 text-hover-primary"
                >
                  <KTIcon
                    icon-name="instagram"
                    icon-class="fs-2 me-2 text-dark"
                  />
                  <div class="fs-5 fw-normal">syamimhakimi</div>
                </a>
              </template>
            </LayoutGrids>
          </div>
        </div>
      </div>
    </template>
  </CardContainer>
</template>

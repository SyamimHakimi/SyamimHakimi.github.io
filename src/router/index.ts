import {
  createRouter,
  createWebHashHistory,
  type RouteRecordRaw,
} from "vue-router";
import { useConfigStore } from "@/stores/config";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    redirect: "/photography_journey",
    component: () => import("@/layouts/main-layout/MainLayout.vue"),
    meta: {
      middleware: "auth",
    },
    children: [
      {
        path: "/photography_journey",
        name: "photography_journey",
        component: () =>
          import("@/views/photography-journey/PhotographyJourney.vue"),
        meta: {
          pageTitle: "Photography Journey",
          breadcrumbs: ["Photography Journey"],
        },
      },
      {
        path: "/services",
        name: "services",
        component: () => import("@/views/services/Services.vue"),
        meta: {
          pageTitle: "Services",
          breadcrumbs: ["Services"],
        },
        children: [
          {
            path: "/services/api_development",
            name: "services-api-development",
            component: () =>
              import(
                "@/views/services/api_development/ServicesAPIDevelopment.vue"
              ),
            meta: {
              breadcrumbs: ["Services", "API Development"],
            },
          },
          {
            path: "/services/api_integration",
            name: "services-api-integration",
            component: () =>
              import(
                "@/views/services/api_integration/ServicesAPIIntegration.vue"
              ),
            meta: {
              breadcrumbs: ["Services", "API Integration"],
            },
          },
          {
            path: "/services/database_management",
            name: "services-database-management",
            component: () =>
              import(
                "@/views/services/database_management/ServicesDatabaseManagement.vue"
              ),
            meta: {
              breadcrumbs: ["Services", "Database Management"],
            },
          },
          {
            path: "/services/web_app_development",
            name: "services-web_app_development",
            component: () =>
              import(
                "@/views/services/web_app_development/ServicesWebAppDevelopment.vue"
              ),
            meta: {
              breadcrumbs: ["Services", "Web Application Development"],
            },
          },
        ],
      },
      {
        path: "/portfolio",
        name: "portfolio",
        component: () => import("@/views/portfolio/PortfolioLayout.vue"),
        meta: {
          breadcrumbs: ["Portfolio"],
        },
        children: [
          {
            path: "/portfolio/personal_projects",
            name: "portfolio-personal-projects",
            component: () =>
              import(
                "@/views/portfolio/personal-projects/PersonalProjects.vue"
              ),
            meta: {
              pageTitle: "Personal Projects",
              breadcrumbs: ["Portfolio", "Personal Projects"],
            },
          },
          {
            path: "/portfolio/experience",
            name: "portfolio-experience",
            component: () =>
              import("@/views/portfolio/experience/Experience.vue"),
            meta: {
              pageTitle: "Experience",
              breadcrumbs: ["Portfolio", "Experience"],
            },
          },
        ],
      },
      {
        path: "/gallery",
        name: "gallery",
        component: () => import("@/views/gallery/Gallery.vue"),
        meta: {
          pageTitle: "Gallery",
          breadcrumbs: ["Gallery"],
        },
      },
      {
        path: "/about_me",
        name: "about_me",
        component: () => import("@/views/about-me/AboutMe.vue"),
        meta: {
          pageTitle: "About Me",
          breadcrumbs: ["About Me"],
        },
      },
    ],
  },
  {
    path: "/",
    component: () => import("@/layouts/SystemLayout.vue"),
    children: [
      {
        // the 404 route, when none of the above matches
        path: "/404",
        name: "404",
        component: () => import("@/views/error/Error404.vue"),
        meta: {
          pageTitle: "Error 404",
        },
      },
      {
        path: "/500",
        name: "500",
        component: () => import("@/views/error/Error500.vue"),
        meta: {
          pageTitle: "Error 500",
        },
      },
    ],
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: "/404",
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const configStore = useConfigStore();

  // current page view title
  document.title = `${to.meta.pageTitle} - ${import.meta.env.VITE_APP_NAME}`;

  // reset config to initial state
  configStore.resetLayoutConfig();

  // // verify auth token before each page change
  // authStore.verifyAuth();
  //
  // // before page access check if page requires authentication
  // if (to.meta.middleware == "auth") {
  //   if (authStore.isAuthenticated) {
  //     next();
  //   } else {
  //     next({ name: "sign-in" });
  //   }
  // } else {
  //   next();
  // }
  next();

  // Scroll page to top on every route change
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: "smooth",
  });
});

export default router;

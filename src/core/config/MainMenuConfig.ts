export interface MenuItem {
  heading?: string;
  sectionTitle?: string;
  route?: string;
  pages?: Array<MenuItem>;
  keenthemesIcon?: string;
  bootstrapIcon?: string;
  sub?: Array<MenuItem>;
}

const MainMenuConfig: Array<MenuItem> = [
  {
    heading: "Photography Journey",
    route: "/photography_journey",
    keenthemesIcon: "black-right",
    bootstrapIcon: "bi-arrow-right",
  },
  {
    heading: "Services",
    route: "/services/api_development",
    keenthemesIcon: "black-right",
    bootstrapIcon: "bi-arrow-right",
  },
  {
    sectionTitle: "Portfolio",
    route: "/portfolio",
    keenthemesIcon: "black-right",
    bootstrapIcon: "bi-arrow-right",
    pages: [
      {
        heading: "Experience",
        route: "/portfolio/experience",
        keenthemesIcon: "element-plus",
        bootstrapIcon: "bi-arrow-right",
      },
      {
        heading: "Personal Projects",
        route: "/portfolio/personal_projects",
        keenthemesIcon: "element-plus",
        bootstrapIcon: "bi-arrow-right",
      },
    ],
  },
  {
    heading: "Gallery",
    route: "/gallery",
    keenthemesIcon: "black-right",
    bootstrapIcon: "bi-arrow-right",
  },
  {
    heading: "About Me",
    route: "/about_me",
    keenthemesIcon: "black-right",
    bootstrapIcon: "bi-arrow-right",
  },
];

export default MainMenuConfig;

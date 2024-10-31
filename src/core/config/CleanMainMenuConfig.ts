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
    heading: "dashboard",
    route: "/dashboard",
    keenthemesIcon: "black-right",
    bootstrapIcon: "bi-arrow-right",
  },
];

export default MainMenuConfig;

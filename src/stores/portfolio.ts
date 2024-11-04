export interface PortfolioTabs {
  routerTo: string;
  icon: Array<string>;
  iconColor: string;
  color: string;
  title: string;
  description: string;
}

export interface PortfolioSectionsItem {
  iconImg: string;
  link: string;
  badgeText: string;
  badgeColor: string;
  title: string;
  description: string;
}

export interface PortfolioSections {
  title: string;
  experienceList: Array<PortfolioSectionsItem>;
}

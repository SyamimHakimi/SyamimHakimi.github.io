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

export interface PersonalProjectsDescription {
  title: string;
  subtitle: string;
  description: string;
}

export interface PersonalProjectsTechStack {
  imgSrc: string;
  title: string;
  description: string;
  link: string;
}

export interface PersonalProjects {
  personalProjectsDescription: PersonalProjectsDescription;
  personalProjectsTechStackList: Array<PersonalProjectsTechStack>;
}

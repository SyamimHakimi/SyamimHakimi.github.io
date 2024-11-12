export interface PhotographyStatistic {
  title: string;
  value: string;
  icon: string;
  iconColor: string;
}

export interface PhotoItem {
  imgSrc: string;
  title: string;
  isFavourite: boolean;
  theme: string;
  focalLength: number;
  datePosted: string;
}

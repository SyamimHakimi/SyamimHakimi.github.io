export interface ProfileDetails {
  name: string;
  country: string;
  residing_country: string;
  hobbies: string;
}

export interface ProfileFavouriteBoardgames {
  icon: string;
  color: string;
  title: string;
  description: string;
  rating: number;
  ratingMax5: number;
}

export interface ProfilePhotographyGear {
  imgSrc: string;
  color: string;
  title: string;
  type: string;
  brand: string;
}

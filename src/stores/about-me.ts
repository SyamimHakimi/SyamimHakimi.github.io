import { socialMediaRef } from "@/core/services/FirebaseService";
import { orderBy, query } from "firebase/firestore";
import { firestoreDefaultConverter, useCollection } from "vuefire";
import { defineStore } from "pinia";

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

export interface SocialMedia {
  text: string;
  name: string;
  link: string;
  icon: string;
}

/* Firebase Queries */

function servicesFirebaseQuery() {
  return query(socialMediaRef, orderBy("sorting"));
}

function socialMediaList() {
  return useCollection(
    servicesFirebaseQuery().withConverter<SocialMedia>({
      fromFirestore(snapshot): SocialMedia {
        return <SocialMedia>{
          text: snapshot.get("text"),
          name: snapshot.get("name"),
          link: snapshot.get("link"),
          icon: snapshot.get("icon"),
        };
      },
      toFirestore: () => firestoreDefaultConverter.toFirestore,
    }),
    {
      ssrKey: `SocialMedia`,
      once: true,
    },
  );
}

/* Pinia Store */

export const useAboutMeStore = defineStore("about-me", {
  state: function () {
    return {
      socialMediaList: socialMediaList(),
    };
  },
});

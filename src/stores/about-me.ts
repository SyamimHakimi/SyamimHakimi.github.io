import {
  favouriteBoardgamesRef,
  photographyGearsRef,
  profileRef,
  socialMediaRef,
} from "@/core/services/FirebaseService";
import { orderBy, query } from "firebase/firestore";
import { firestoreDefaultConverter, useCollection, useDocument } from "vuefire";
import { defineStore } from "pinia";
import { getAssetPath } from "@/core/helpers/assets";

export interface ProfileDetails {
  name: string;
  country: string;
  residing_country: string;
  hobbies: string;
}

export interface ProfileFavouriteBoardgames {
  icon: string | undefined;
  color: string | undefined;
  title: string;
  link: string;
  description: string;
  rating: number;
  ratingMax5: number;
}

export interface ProfilePhotographyGear {
  imgSrc: string;
  color: string | undefined;
  name: string;
  link: string;
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

function favouriteBoardgamesList() {
  const queryCollection = query(
    favouriteBoardgamesRef,
    orderBy("score", "desc"),
  );
  let index = 1;

  return useCollection(
    queryCollection.withConverter<ProfileFavouriteBoardgames>({
      fromFirestore(snapshot): ProfileFavouriteBoardgames {
        return <ProfileFavouriteBoardgames>{
          title: snapshot.get("name"),
          link: snapshot.get("link"),
          description: snapshot.get("tags"),
          rating: snapshot.get("score"),
          ratingMax5: snapshot.get("score") / 2,
          icon: `fa-${index++}`,
        };
      },
      toFirestore: () => firestoreDefaultConverter.toFirestore,
    }),
    {
      ssrKey: `FavouriteBoardgames`,
      once: true,
    },
  );
}

function socialMediaList() {
  const queryCollection = query(socialMediaRef, orderBy("sorting"));

  return useCollection(
    queryCollection.withConverter<SocialMedia>({
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

function profileDetails() {
  return useDocument(
    profileRef.withConverter<ProfileDetails>({
      fromFirestore(snapshot): ProfileDetails {
        return <ProfileDetails>{
          name: snapshot.get("Name"),
          country: snapshot.get("Country"),
          residing_country: snapshot.get("Residing Country"),
          hobbies: snapshot.get("Hobbies"),
        };
      },
      toFirestore: () => firestoreDefaultConverter.toFirestore,
    }),
    {
      ssrKey: `Profile`,
      once: true,
    },
  );
}

function photographyGearsList() {
  const queryCollection = query(photographyGearsRef, orderBy("type"));

  return useCollection(
    queryCollection.withConverter<ProfilePhotographyGear>({
      fromFirestore(snapshot): ProfilePhotographyGear {
        const _type = snapshot.get("type");
        let type = "";
        let color = "";

        switch (_type) {
          case 1: {
            type = "Camera";
            color = "success";
            break;
          }
          case 2: {
            type = "Zoom Lens";
            color = "primary";
            break;
          }
          case 3: {
            type = "Prime Lens";
            color = "info";
            break;
          }
        }

        return <ProfilePhotographyGear>{
          imgSrc: getAssetPath(snapshot.get("img-src")),
          name: snapshot.get("name"),
          link: snapshot.get("link"),
          type: type,
          color: color,
          brand: snapshot.get("brand"),
        };
      },
      toFirestore: () => firestoreDefaultConverter.toFirestore,
    }),
    {
      ssrKey: `PhotographyGears`,
      once: true,
    },
  );
}

/* Pinia Store */

export const useAboutMeStore = defineStore("about-me", {
  state: function () {
    return {
      favouriteBoardgamesList: favouriteBoardgamesList(),
      socialMediaList: socialMediaList(),
      photographyGearsList: photographyGearsList(),
      profileDetails: profileDetails(),
    };
  },
});

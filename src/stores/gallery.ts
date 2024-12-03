import { firestoreDefaultConverter, useCollection } from "vuefire";
import { limit, orderBy, query, where } from "firebase/firestore";
import { photosRef } from "@/core/services/FirebaseService";
import { defineStore } from "pinia";
import type { PhotoItem } from "@/stores/photography-journey";

/* Firebase Queries */

function galleryList() {
  const queryCollection = query(
    photosRef,
    where("favourite", "==", true),
    orderBy("date", "desc"),
    limit(6),
  );

  return useCollection(
    queryCollection.withConverter<PhotoItem>({
      fromFirestore(snapshot): PhotoItem {
        return <PhotoItem>{
          imgSrc: snapshot.get("link"),
          title: snapshot.get("title"),
          recipe: snapshot.get("recipe"),
          theme: snapshot.get("theme"),
          focalLength: snapshot.get("focal_length"),
          datePosted: snapshot.get("date"),
        };
      },
      toFirestore: () => firestoreDefaultConverter.toFirestore,
    }),
    {
      ssrKey: `Gallery`,
      once: true,
    },
  );
}
/* Pinia Store */

export const useGalleryStore = defineStore("gallery", {
  state: function () {
    return {
      galleryList: galleryList(),
    };
  },
});

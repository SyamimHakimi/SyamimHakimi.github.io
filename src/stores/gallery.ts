import { firestoreDefaultConverter, useCollection } from "vuefire";
import {
  limit,
  orderBy,
  query,
  where,
  startAfter,
  endBefore,
  doc,
  getDoc,
  DocumentSnapshot,
} from "firebase/firestore";
import { photosRef } from "@/core/services/FirebaseService";
import { defineStore } from "pinia";
import type { PhotoItem } from "@/stores/photography-journey";

export const limitGallery = 6;

/* Firebase Queries */

// async

function fetchGalleryList(
  docSnap: DocumentSnapshot | undefined = undefined,
  mode: "next" | "back" | undefined = undefined,
) {
  let queryCollection = query(
    photosRef,
    where("favourite", "==", true),
    orderBy("date", "desc"),
    startAfter("8hkoHInpszUiHjZ6sdKy"),
    limit(limitGallery),
  );

  if (docSnap && mode) {
    // const docSnap = await getDoc(doc(photosRef, lastDocId));

    queryCollection = query(
      photosRef,
      where("favourite", "==", true),
      orderBy("date", "desc"),
      mode == "next" ? startAfter(docSnap) : endBefore(docSnap),
      limit(limitGallery),
    );
  }
  console.log(queryCollection);

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
          documentId: snapshot.id,
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

export async function fetchPaginateGalleryList(
  lastDocId: string,
  mode: "next" | "back",
) {
  const docSnap = await getDoc(doc(photosRef, lastDocId));

  const queryCollection = query(
    photosRef,
    where("favourite", "==", true),
    orderBy("date", "desc"),
    mode == "next" ? startAfter(docSnap) : endBefore(docSnap),
    limit(limitGallery),
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
          documentId: snapshot.id,
        };
      },
      toFirestore: () => firestoreDefaultConverter.toFirestore,
    }),
    {
      ssrKey: `Gallery-Paginate`,
      once: true,
    },
  );
}
/* Pinia Store */

export const useGalleryStore = defineStore("gallery", {
  state: function () {
    return {
      galleryList: fetchGalleryList(),
    };
  },
});

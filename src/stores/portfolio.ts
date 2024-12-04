import {
  type _RefFirestore,
  firestoreDefaultConverter,
  useCollection,
  useDocument,
} from "vuefire";
import { collection, orderBy, query } from "firebase/firestore";
import {
  experienceFrameworksRef,
  experienceLanguagesRef,
  experiencePlatformsRef,
  experienceProtocolsRef,
  experienceRef,
  personalProjectsRef,
} from "@/core/services/FirebaseService";
import { defineStore } from "pinia";
import {
  durationToString,
  getDurationFromTimestamp,
} from "@/core/helpers/global";
import { DocumentReference } from "@firebase/firestore";
import { ref } from "vue";

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
  experienceList: _RefFirestore<PortfolioSectionsItem[]>;
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
  personalProjectsTechStackList: _RefFirestore<PersonalProjectsTechStack[]>;
}

/* Enum */

export enum ExperienceEnum {
  Platforms = 1,
  Protocols = 3,
  Frameworks = 2,
  Languages = 4,
}

/* Firebase Queries */

function experienceFirebaseQuery(experienceEnum: ExperienceEnum) {
  let itemRef = experienceRef;
  switch (experienceEnum) {
    case ExperienceEnum.Platforms: {
      itemRef = experiencePlatformsRef;
      break;
    }
    case ExperienceEnum.Protocols: {
      itemRef = experienceProtocolsRef;
      break;
    }
    case ExperienceEnum.Frameworks: {
      itemRef = experienceFrameworksRef;
      break;
    }
    case ExperienceEnum.Languages: {
      itemRef = experienceLanguagesRef;
      break;
    }
  }

  return query(itemRef, orderBy("date-from"));
}

function experienceItemList(experienceEnum: ExperienceEnum) {
  return useCollection(
    experienceFirebaseQuery(
      experienceEnum,
    ).withConverter<PortfolioSectionsItem>({
      fromFirestore(snapshot): PortfolioSectionsItem {
        const dateFrom = snapshot.get("date-from");
        const dateTo = snapshot.get("date-to");
        const difference = getDurationFromTimestamp(dateFrom, dateTo);

        let color = "success";
        switch (difference.years) {
          case 0: {
            color = "warning";
            break;
          }
          case 1: {
            color = "info";
            break;
          }
        }

        return <PortfolioSectionsItem>{
          iconImg: snapshot.get("img-src"),
          link: snapshot.get("link"),
          badgeText: durationToString(difference),
          badgeColor: color,
          title: snapshot.get("title"),
          description: snapshot.get("description"),
        };
      },
      toFirestore: () => firestoreDefaultConverter.toFirestore,
    }),
    {
      ssrKey: `Experience-${ExperienceEnum[experienceEnum]}`,
      once: true,
      wait: true,
    },
  );
}

function personalProjectsTechStackList(
  docRef: DocumentReference,
  path: string,
) {
  const techStackRef = query(collection(docRef, path), orderBy("sorting"));

  return useCollection(
    techStackRef.withConverter<PersonalProjectsTechStack>({
      fromFirestore(snapshot): PersonalProjectsTechStack {
        return <PersonalProjectsTechStack>{
          imgSrc: snapshot.get("img-src"),
          title: snapshot.get("title"),
          description: snapshot.get("description"),
          link: snapshot.get("link"),
        };
      },
      toFirestore: () => firestoreDefaultConverter.toFirestore,
    }),
    {
      ssrKey: `PersonalProjects-TechStack`,
      once: true,
    },
  );
}

function personalProjectDescription() {
  return useDocument(
    personalProjectsRef.withConverter<PersonalProjectsDescription>({
      fromFirestore(snapshot): PersonalProjectsDescription {
        return <PersonalProjectsDescription>{
          title: snapshot.get("title"),
          subtitle: snapshot.get("subtitle"),
          description: snapshot.get("description"),
        };
      },
      toFirestore: () => firestoreDefaultConverter.toFirestore,
    }),
    {
      ssrKey: `PersonalProjects`,
      once: true,
    },
  );
}

/* Pinia Store */

export const usePortfolioStore = defineStore("portfolio", {
  state: function () {
    const experiencePlatformsList = experienceItemList(
      ExperienceEnum.Platforms,
    ).value;
    const experienceProtocolsList = experienceItemList(
      ExperienceEnum.Protocols,
    ).value;
    const experienceFrameworksList = experienceItemList(
      ExperienceEnum.Frameworks,
    ).value;
    const experienceLanguagesList = ref(
      experienceItemList(ExperienceEnum.Languages),
    );

    return {
      experiencePlatformsList: experienceItemList(ExperienceEnum.Platforms),
      experienceProtocolsList: experienceItemList(ExperienceEnum.Protocols),
      experienceFrameworksList: experienceItemList(ExperienceEnum.Frameworks),
      experienceLanguagesList: experienceItemList(ExperienceEnum.Languages),
      personalProjectsDescription: personalProjectDescription(),
      personalProjectsTechStack: personalProjectsTechStackList(
        personalProjectsRef,
        "techstack",
      ),
    };
  },
});

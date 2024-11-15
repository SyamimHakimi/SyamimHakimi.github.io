import { query, where, orderBy } from "firebase/firestore";
import { servicesRef } from "@/core/services/FirebaseService";
import { firestoreDefaultConverter, useCollection } from "vuefire";
import { defineStore } from "pinia";
import { assignColorListThemeFirestore } from "@/core/helpers/global";

export interface ServicesTab {
  routerTo: string;
  title: string;
}

export interface TimelinesService {
  icon: string;
  color: string | undefined;
  title: string;
  description: string;
}

/* Enum */

export enum ServicesEnum {
  ApiDevelopment = 1,
  ApiIntegration = 2,
  DatabaseManagement = 3,
  WebAppDevelopment = 4,
}

/* Firebase Queries */

function servicesFirebaseQuery(servicesEnum: ServicesEnum) {
  return query(
    servicesRef,
    where("group", "==", servicesEnum),
    orderBy("sorting"),
  );
}

function servicesTimelineList(servicesEnum: ServicesEnum) {
  return useCollection(
    servicesFirebaseQuery(servicesEnum).withConverter<TimelinesService>({
      fromFirestore(snapshot): TimelinesService {
        return <TimelinesService>{
          icon: snapshot.get("icon"),
          title: snapshot.get("title"),
          description: snapshot.get("description"),
        };
      },
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      toFirestore: (modelObject: TimelinesService) =>
        firestoreDefaultConverter.toFirestore,
    }),
    {
      ssrKey: `Services-${ServicesEnum[servicesEnum]}`,
      once: true,
    },
  );
}

/* Pinia Store */

export const useServiceStore = defineStore("services", {
  state: function () {
    return {
      servicesApiDevelopmentList: servicesTimelineList(
        ServicesEnum.ApiDevelopment,
      ),
      servicesApiIntegrationList: servicesTimelineList(
        ServicesEnum.ApiIntegration,
      ),
      servicesDatabaseManagementList: servicesTimelineList(
        ServicesEnum.DatabaseManagement,
      ),
      servicesWebAppDevelopmentList: servicesTimelineList(
        ServicesEnum.WebAppDevelopment,
      ),
    };
  },
});

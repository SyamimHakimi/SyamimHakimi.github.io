import { defineStore } from "pinia";
import { firestoreDefaultConverter, useCollection, useDocument } from "vuefire";
import {
  photosRef,
  statisticsFavPhotoRef,
  statisticsFocalRef,
  statisticsLensRef,
  statisticsMainRef,
  statisticsPhotoRef,
  statisticsRecipeRef,
  statisticsThemeRef,
} from "@/core/services/FirebaseService";
import { convertToDate } from "@/core/helpers/global";
import {
  where,
  orderBy,
  query,
  limit,
  QueryDocumentSnapshot,
  type Timestamp,
} from "firebase/firestore";

export interface PhotographyStatistic {
  title: string;
  value: string;
  icon: string;
  iconColor: string;
  sorting: number;
}

export interface PhotoItem {
  imgSrc: string;
  title: string;
  recipe: string;
  theme: string;
  focalLength: number;
  datePosted: Timestamp;
  documentId: string;
}

export interface StatChart<T> {
  xAxis: Array<T>;
  yAxis: Array<number>;
}

interface ChartItem<T> {
  key: T;
  value: number;
}

interface XYItem<T> {
  x: T;
  y: number;
}

/* Enum */

export enum MainStatsOrderEnum {
  total_photos = 1,
  total_fav_photos = 3,
  total_outings = 2,
  favourite_photo_lens = 4,
}

const PhotographyStatisticIcons = [
  {
    order: MainStatsOrderEnum.total_photos,
    title: "Photos Published",
    icon: "picture",
    iconColor: "success",
  },
  {
    order: MainStatsOrderEnum.total_outings,
    title: "Days Posted",
    icon: "calendar",
    iconColor: "warning",
  },
  {
    order: MainStatsOrderEnum.total_fav_photos,
    title: "Favourite Photos",
    icon: "like-2",
    iconColor: "primary",
  },
  {
    order: MainStatsOrderEnum.favourite_photo_lens,
    title: "Favourite Photo Lens ",
    icon: "cube-2",
    iconColor: "danger",
  },
];

const getStatisticByEnumKey = (enumKey: string) => {
  const orderValue = MainStatsOrderEnum[enumKey];
  return PhotographyStatisticIcons.find((item) => item.order === orderValue);
};

function getChart<T>(
  snapshot: QueryDocumentSnapshot,
  isDate: boolean = false,
  sortValue: boolean = false,
  asc: boolean = true,
): StatChart<T> {
  const _statLineChart = <StatChart<T>>{
    xAxis: Array<Date>(),
    yAxis: Array<number>(),
  };

  const _tempList = Array<ChartItem<T>>();
  const _data = snapshot.data();
  for (const value in _data) {
    const _key = isDate ? convertToDate(value) : value;
    if (_key) {
      _tempList.push(<ChartItem<T>>{
        key: _key,
        value: _data[value],
      });
    }
  }

  let _sortedList: ChartItem<T>[];
  if (isDate) {
    _sortedList = _tempList.sort((a, b) => {
      return (a.key as Date).getTime() - (b.key as Date).getTime();
    });
  } else {
    const _key = sortValue ? "value" : "key";
    const _order = asc ? -1 : 1;

    _sortedList = _tempList.sort((a, b) => {
      if (a[_key] < b[_key]) return _order; // a comes before b
      if (a[_key] > b[_key]) return -_order; // a comes after b
      return 0;
    });
  }

  _sortedList.forEach((item) => {
    _statLineChart.xAxis.push(item.key);
    _statLineChart.yAxis.push(item.value);
  });

  return _statLineChart;
}

export function convertXY<T>(
  chart: StatChart<T> | undefined,
): Array<XYItem<T>> | undefined {
  if (!chart) return undefined;

  const _list = Array<XYItem<T>>();

  chart.xAxis.forEach((item, index) => {
    _list.push({
      x: item,
      y: chart.yAxis[index],
    });
  });

  return _list;
}

export function getMaxChart<T>(chart: StatChart<T> | undefined): T | undefined {
  if (!chart) return undefined;

  const maxIndex = chart.yAxis.reduce((maxIdx, currentValue, currentIndex) => {
    return currentValue > chart.yAxis[maxIdx] ? currentIndex : maxIdx;
  }, 0);

  return chart.xAxis[maxIndex];
}

/* Firebase Queries */

function mainStats() {
  return useDocument(
    statisticsMainRef.withConverter<Array<PhotographyStatistic>>({
      fromFirestore(snapshot): Array<PhotographyStatistic> {
        const _list = Array<PhotographyStatistic>();
        for (const value in snapshot.data()) {
          const _photographyStats = getStatisticByEnumKey(value);
          if (_photographyStats) {
            _list.push({
              title: _photographyStats.title,
              value: snapshot.get(value),
              icon: _photographyStats.icon,
              iconColor: _photographyStats.iconColor,
              sorting: _photographyStats.order,
            });
          }
        }

        return _list.sort((a, b) => a.sorting - b.sorting);
      },
      toFirestore: () => firestoreDefaultConverter.toFirestore,
    }),
    {
      ssrKey: `Stats-Main`,
      once: true,
    },
  );
}

function mainStatsRaw() {
  return useDocument(statisticsMainRef, {
    ssrKey: `Stats-Main`,
    once: true,
  });
}

function lensStats() {
  return useDocument(statisticsLensRef, {
    ssrKey: `Stats-Lens`,
    once: true,
  });
}

function photoStats() {
  return useDocument(
    statisticsPhotoRef.withConverter<StatChart<Date>>({
      fromFirestore(snapshot): StatChart<Date> {
        return getChart(snapshot, true);
      },
      toFirestore: () => firestoreDefaultConverter.toFirestore,
    }),
    {
      ssrKey: `Stats-Photo`,
      once: true,
    },
  );
}

function favPhotoStats() {
  return useDocument(
    statisticsFavPhotoRef.withConverter<StatChart<Date>>({
      fromFirestore(snapshot): StatChart<Date> {
        return getChart(snapshot, true);
      },
      toFirestore: () => firestoreDefaultConverter.toFirestore,
    }),
    {
      ssrKey: `Stats-Fav-Photo`,
      once: true,
    },
  );
}

function focalStats() {
  return useDocument(
    statisticsFocalRef.withConverter<StatChart<string>>({
      fromFirestore(snapshot): StatChart<string> {
        return getChart(snapshot);
      },
      toFirestore: () => firestoreDefaultConverter.toFirestore,
    }),
    {
      ssrKey: `Stats-Focal`,
      once: true,
    },
  );
}

function themeStats() {
  return useDocument(
    statisticsThemeRef.withConverter<StatChart<string>>({
      fromFirestore(snapshot): StatChart<string> {
        return getChart(snapshot);
      },
      toFirestore: () => firestoreDefaultConverter.toFirestore,
    }),
    {
      ssrKey: `Stats-Theme`,
      once: true,
    },
  );
}

function recipeStats() {
  return useDocument(
    statisticsRecipeRef.withConverter<StatChart<string>>({
      fromFirestore(snapshot): StatChart<string> {
        return getChart(snapshot, false, true, false);
      },
      toFirestore: () => firestoreDefaultConverter.toFirestore,
    }),
    {
      ssrKey: `Stats-Recipe`,
      once: true,
    },
  );
}

function latestPhotos() {
  const queryCollection = query(
    photosRef,
    where("favourite", "==", true),
    orderBy("date", "desc"),
    limit(5),
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
      ssrKey: `Stat-Gallery`,
      once: true,
    },
  );
}

/* Pinia Store */

export const usePhotographyJourneyStore = defineStore("photography-journey", {
  state: function () {
    return {
      mainStats: mainStats(),
      mainStatsRaw: mainStatsRaw(),
      focalStats: focalStats(),
      themeStats: themeStats(),
      recipeStats: recipeStats(),
      lensStats: lensStats(),
      photoStats: photoStats(),
      favPhotoStats: favPhotoStats(),
      latestPhotos: latestPhotos(),
    };
  },
});

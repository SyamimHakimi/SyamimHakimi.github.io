import { defineStore } from "pinia";
import { firestoreDefaultConverter, useDocument } from "vuefire";
import {
  statisticsFavPhotoRef,
  statisticsFocalRef,
  statisticsLensRef,
  statisticsMainRef,
  statisticsPhotoRef,
} from "@/core/services/FirebaseService";
import { convertToDate } from "@/core/helpers/global";
import { QueryDocumentSnapshot } from "firebase/firestore";

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
  isFavourite: boolean;
  theme: string;
  focalLength: number;
  datePosted: string;
}

export interface StatChart<T> {
  xAxis: Array<T>;
  yAxis: Array<number>;
}

interface ChartItem<T> {
  key: T;
  value: number;
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
    title: "Photos Posted",
    icon: "bucket",
    iconColor: "success",
  },
  {
    order: MainStatsOrderEnum.total_outings,
    title: "Photo Outings",
    icon: "bucket",
    iconColor: "warning",
  },
  {
    order: MainStatsOrderEnum.total_fav_photos,
    title: "Favourite Photos",
    icon: "bucket",
    iconColor: "primary",
  },
  {
    order: MainStatsOrderEnum.favourite_photo_lens,
    title: "Favourite Photo Lens ",
    icon: "bucket",
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
    _sortedList = _tempList.sort((a, b) => {
      if (a.key < b.key) return -1; // a comes before b
      if (a.key > b.key) return 1; // a comes after b
      return 0;
    });
  }

  _sortedList.forEach((item) => {
    _statLineChart.xAxis.push(item.key);
    _statLineChart.yAxis.push(item.value);
  });

  return _statLineChart;
}

export function getMaxChart<T>(chart: StatChart<T> | undefined): T | undefined {
  if (!chart) return undefined;

  const maxIndex = chart.yAxis.reduce((maxIdx, currentValue, currentIndex) => {
    return currentValue > chart[maxIdx] ? currentIndex : maxIdx;
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

/* Pinia Store */

export const usePhotographyJourneyStore = defineStore("photography-journey", {
  state: function () {
    const _focalStats = focalStats();

    return {
      mainStats: mainStats(),
      focalStats: _focalStats,
      lensStats: lensStats(),
      photoStats: photoStats(),
      favPhotoStats: favPhotoStats(),
    };
  },
});

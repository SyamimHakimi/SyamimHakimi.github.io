import { defineStore } from "pinia";
import { firestoreDefaultConverter, useDocument } from "vuefire";
import {
  statisticsFavPhotoRef,
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

interface PhotographyLineChart {
  key: Date;
  value: number;
}

export interface StatLineChart {
  xAxis: Array<Date>;
  yAxis: Array<number>;
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

function getLineChart(snapshot: QueryDocumentSnapshot): StatLineChart {
  const _statLineChart = <StatLineChart>{
    xAxis: Array<Date>(),
    yAxis: Array<number>(),
  };

  const _tempList = Array<PhotographyLineChart>();
  const _data = snapshot.data();
  for (const value in _data) {
    const _key = convertToDate(value);
    if (_key) {
      _tempList.push(<PhotographyLineChart>{
        key: _key,
        value: _data[value],
      });
    }
  }
  const sortedList = _tempList.sort(
    (a, b) => a.key.getTime() - b.key.getTime(),
  );

  sortedList.forEach((item) => {
    _statLineChart.xAxis.push(item.key);
    _statLineChart.yAxis.push(item.value);
  });

  return _statLineChart;
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
    statisticsPhotoRef.withConverter<StatLineChart>({
      fromFirestore(snapshot): StatLineChart {
        return getLineChart(snapshot);
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
    statisticsFavPhotoRef.withConverter<StatLineChart>({
      fromFirestore(snapshot): StatLineChart {
        return getLineChart(snapshot);
      },
      toFirestore: () => firestoreDefaultConverter.toFirestore,
    }),
    {
      ssrKey: `Stats-Fav-Photo`,
      once: true,
    },
  );
}

/* Pinia Store */

export const usePhotographyJourneyStore = defineStore("photography-journey", {
  state: function () {
    return {
      mainStats: mainStats(),
      lensStats: lensStats(),
      photoStats: photoStats(),
      favPhotoStats: favPhotoStats(),
    };
  },
});

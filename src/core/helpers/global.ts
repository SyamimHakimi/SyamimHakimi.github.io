import type { _RefFirestore } from "vuefire";
import { Timestamp } from "firebase/firestore";

String.prototype.toTitleCase = function (): string {
  return this.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase(),
  );
};

export const colorListTheme: Array<string> = [
  "success",
  "warning",
  "primary",
  "danger",
  "info",
];

export function assignColorListTheme<T>(
  list: Array<T>,
  propertyName: Extract<keyof T, string>,
) {
  list.forEach((obj, index) => {
    obj[propertyName] = colorListTheme[index % colorListTheme.length] as never;
  });
}

export function assignColorListThemeFirestore<T>(
  list: _RefFirestore<Array<T>>,
  propertyName: Extract<keyof T, string>,
) {
  assignColorListTheme(list.value, propertyName);
}

export function getDurationFromTimestamp(
  timestampFrom: Timestamp,
  timestampTo: Timestamp | undefined,
) {
  const dateFromTimestamp = timestampFrom.toDate();
  let now = new Date();
  if (timestampTo) now = timestampTo.toDate();

  let years = now.getFullYear() - dateFromTimestamp.getFullYear();
  let months = now.getMonth() - dateFromTimestamp.getMonth();

  // Adjust if the month difference is negative
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  return { years, months };
}

export function durationToString(duration) {
  const { years, months } = duration;

  if (years > 0 && months > 0) {
    return `${years} Year${years > 1 ? "s" : ""} ${months} Month${months > 1 ? "s" : ""}`;
  } else if (years > 0) {
    return `${years} Year${years > 1 ? "s" : ""}`;
  } else if (months > 0) {
    return `${months} Month${months > 1 ? "s" : ""}`;
  } else {
    return "0 Months"; // If both are 0
  }
}

export function convertToDate(mmYYYY: string): Date | null {
  const [month, year] = mmYYYY.split("/").map(Number);

  if (month < 1 || month > 12 || year < 1000) {
    return null; // Handle invalid month/year inputs.
  }

  // Note: JS Date uses zero-based months (0 = January, 11 = December).
  return new Date(year, month - 1, 1);
}

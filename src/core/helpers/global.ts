import type { _RefFirestore } from "vuefire";

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

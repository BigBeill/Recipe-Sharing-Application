export function joinWithOxfordComma(array: string[]) {
  if (array.length === 0) return "";
  if (array.length === 1) return array[0];
  if (array.length === 2) return array.join(" and ");

  const allButLast = array.slice(0, -1).join(", ");
  return `${allButLast}, and ${array[array.length - 1]}`;
}
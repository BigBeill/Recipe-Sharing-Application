import { BrokenPaginatedListType } from "../shared.types";

// * combine two paginated lists together
// * Recommended use is for saving returns from the server on a paginated list, so if the user backtracks they don't need to wait for results to load before seeing old recipes
// ! this is susceptible to desynchronization
export default function combinePaginatedLists<T>(originals: BrokenPaginatedListType<T>, inserts: BrokenPaginatedListType<T>): BrokenPaginatedListType<T> {
   if (originals.list.length === 0) { return inserts; }

   const start = Math.min(originals.firstItemIndex, inserts.firstItemIndex);
   const end = Math.min(
      inserts.count,
      Math.max(originals.firstItemIndex + originals.list.length, inserts.firstItemIndex + inserts.list.length),
   );

   const list: (T | null)[] = [];
   for (let i = start; i < end; i++) {
      list.push(inserts.list[i - inserts.firstItemIndex] ?? originals.list[i - originals.firstItemIndex] ?? null);
   }

   return { list, count: inserts.count, firstItemIndex: start };
}
import { BrokenPaginatedListType } from "../shared.types";

// combines two paginated lists together filling the blanks with null and giving priority to inserts for conflicting data
export default function combinePaginatedLists<T>(originals: BrokenPaginatedListType<T>, inserts: BrokenPaginatedListType<T>): BrokenPaginatedListType<T> {
   let tempList: (T | null)[] = [];

   if (originals.list.length === 0) { return { ...inserts, list: [...inserts.list] }; }
   else if (inserts.list.length === 0) { return { ...originals, list: [...originals.list], count: inserts.count }; }

   if(originals.firstItemIndex < inserts.firstItemIndex) {
      let currentIndex = originals.firstItemIndex;

      while(currentIndex < inserts.firstItemIndex) {
         tempList.push(originals.list[currentIndex - originals.firstItemIndex] ?? null);
         currentIndex++;
      }

      while(currentIndex < inserts.firstItemIndex + inserts.list.length) {
         tempList.push(inserts.list[currentIndex - inserts.firstItemIndex] ?? originals.list[currentIndex - originals.firstItemIndex] ?? null);
         currentIndex++;
      }

      if(currentIndex < originals.firstItemIndex + originals.list.length) {
         tempList.push(...originals.list.slice(currentIndex - originals.firstItemIndex));
      }

      return {
         list: tempList,
         count: inserts.count,
         firstItemIndex: originals.firstItemIndex,
      }
   }
   else {
      let currentIndex = inserts.firstItemIndex

      while (currentIndex < inserts.firstItemIndex + inserts.list.length) {
         tempList.push(inserts.list[currentIndex - inserts.firstItemIndex] ?? originals.list[currentIndex - originals.firstItemIndex] ?? null);
         currentIndex++;
      }

      while (currentIndex < originals.firstItemIndex) {
         tempList.push(null);
         currentIndex++;
      }

      tempList.push(...originals.list.slice(currentIndex - originals.firstItemIndex));
      
      return {
         list: tempList,
         count: inserts.count,
         firstItemIndex: inserts.firstItemIndex,
      }
   }
}
export type TypePaginatedList<T> = {
   list: T[];
   count: number;
   firstItemIndex: number;
};
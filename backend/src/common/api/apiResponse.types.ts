export type PaginatedListType<T> = {
  list: T[];
  count: number;
  firstItemIndex: number;
};
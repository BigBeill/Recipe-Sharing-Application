// src/common/types/api.ts
export type StandardApiResponse<T> = { data: T } | { error: { code: string; message: string } };

export type PaginatedListType<T> = {
  list: T[];
  count: number;
  firstItemIndex: number;
};
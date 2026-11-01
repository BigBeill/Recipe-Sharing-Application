import { t, type TSchema } from "elysia"

export const DepartingPaginatedList = <T extends TSchema>(validator: T) =>
   t.Object({
      list: t.Array(validator),
      count: t.Number(),
      firstItemIndex: t.Number(),
   });
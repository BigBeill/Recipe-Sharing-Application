import { t, type TSchema } from "elysia"

export const ValidatorCommonPaginatedList = <T extends TSchema>(validator: T) =>
   t.Object({
      list: t.Array(validator),
      count: t.Number(),
      firstItemIndex: t.Number(),
   });

export const ValidatorIncomingPaginatedList = t.Object({
   skip: t.Optional(t.Numeric({minimum: 0, maximum: 1024, default: 0})),
   limit: t.Optional(t.Numeric({minimum: 0, maximum: 64, default: 16})),
});
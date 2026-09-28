import { t } from "elysia";

export const SearchValidator = t.Object({
   title: t.Optional(t.String({ minLength: 1, maxLength: 100 })),
   ownerIdList: t.Optional(t.Array(t.String())),
   ingredientIdList: t.Optional(t.Array(t.Numeric())),
   visibilityList: t.Optional(t.Array(t.Union([
      t.Literal('public'),
      t.Literal('private'),
      t.Literal('personal')
   ]))),
   limit: t.Optional(t.Numeric()),
   skip: t.Optional(t.Numeric()),
});
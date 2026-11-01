import { t } from "elysia";
import { IdValidator } from "../../../../common/api/validators/id.validator";
import { PaginationValidator } from "../../../../common/api/validators/pagination.validator";

export const SearchValidator = t.Object({
   title: t.Optional(t.String({ minLength: 1, maxLength: 100 })),
   ownerIdList: t.Optional(t.Array(IdValidator)),
   ingredientIdList: t.Optional(t.Array(t.Numeric())),
   visibilityList: t.Optional(t.Array(t.Union([
      t.Literal('public'),
      t.Literal('private'),
      t.Literal('personal')
   ]))),
   ...PaginationValidator.properties
});
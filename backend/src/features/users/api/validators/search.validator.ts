import { t } from "elysia";
import { IdValidator } from "../../../../common/api/validators/id.validator";
import { PaginationValidator } from "../../../../common/api/validators/pagination.validator";

export const SearchValidator = t.Object({
   _id: t.Optional(IdValidator.properties._id),
   name: t.Optional(t.String()),
   ...PaginationValidator.properties,
   includeRelationship: t.Optional(t.Boolean()),
});
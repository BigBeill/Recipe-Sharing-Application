import { t } from "elysia";
import { PaginationValidator } from "../../../common/validators/pagination.validator";
import { IdValidator } from "../../../common/validators/id.validator";

export const SearchValidator = t.Object({
   _id: t.Optional(IdValidator.properties._id),
   name: t.Optional(t.String()),
   ...PaginationValidator.properties,
   includeRelationship: t.Optional(t.Boolean()),
});
import { t } from "elysia";
import { PaginationValidator } from "../../../common/validators/pagination.validator";
import { PostgresIdValidator } from "../../../common/validators/postgresId.validator";

export const SearchValidator = t.Object({
   description: t.Optional(t.String()),
   food_group_id: t.Optional(PostgresIdValidator.properties._id),
   ...PaginationValidator.properties,
});
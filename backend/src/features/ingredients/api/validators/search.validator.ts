import { t } from "elysia";
import { PaginationValidator } from "../../../../common/api/validators/pagination.validator";
import { PostgresIdValidator } from "../../../../common/api/validators/postgresId.validator";

export const SearchValidator = t.Object({
   description: t.Optional(t.String()),
   foodGroupId: t.Optional(PostgresIdValidator),
   ...PaginationValidator.properties,
});
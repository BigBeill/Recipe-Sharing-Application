import { t } from "elysia";
import { PaginationValidator } from "../../../../common/api/validators/pagination.validator";
import { PostgresIdValidator } from "../../../../common/api/validators/postgresId.validator";

export const SearchConversionValidator = t.Object({
   food_id: PostgresIdValidator.properties._id,
   ...PaginationValidator.properties,
});
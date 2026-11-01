import { t } from "elysia";
import { PaginationValidator } from "../../../../common/api/validators/pagination.validator";
import { PostgresIdValidator } from "../../../../common/api/validators/postgresId.validator";

export const SearchConversionValidator = t.Object({
   foodId: PostgresIdValidator,
   ...PaginationValidator.properties,
});
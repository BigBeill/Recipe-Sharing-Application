import { t } from "elysia";
import { ValidatorCommonPostgresId } from "../../../../common/domain/validators/postgresId.validator";
import { ValidatorIncomingPaginatedList } from "../../../../common/domain/validators/pagination.validator";

export const ValidatorIncomingIngredientsSearchConversionBody = t.Object({
   foodId: ValidatorCommonPostgresId,
   ...ValidatorIncomingPaginatedList.properties,
});
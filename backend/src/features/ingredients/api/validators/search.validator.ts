import { t } from "elysia";
import { ValidatorCommonPostgresId } from "../../../../common/domain/validators/postgresId.validator";
import { ValidatorIncomingPaginatedList } from "../../../../common/domain/validators/pagination.validator";

export const ValidatorIncomingIngredientsSearchBody = t.Object({
   description: t.Optional(t.String()),
   food_group_id: t.Optional(ValidatorCommonPostgresId),
   ...ValidatorIncomingPaginatedList.properties,
});
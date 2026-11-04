import { t } from "elysia";
import { ValidatorCommonMongooseId } from "../../../../common/domain/validators/mongooseId.validator";
import { ValidatorIncomingPaginatedList } from "../../../../common/domain/validators/pagination.validator";

export const ValidatorIncomingRecipesSearchBody = t.Object({
   title: t.Optional(t.String({ minLength: 1, maxLength: 100 })),
   ownerIdList: t.Optional(t.Array(ValidatorCommonMongooseId)),
   ingredientIdList: t.Optional(t.Array(t.Numeric())),
   visibilityList: t.Optional(t.Array(t.Union([
      t.Literal('public'),
      t.Literal('private'),
      t.Literal('personal')
   ]))),
   ...ValidatorIncomingPaginatedList.properties
});
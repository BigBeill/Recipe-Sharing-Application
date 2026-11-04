import { t } from "elysia";
import { ValidatorCommonPostgresId } from "../../../../common/domain/validators/postgresId.validator";
import { ValidatorCommonNutrition } from "../../../../common/domain/validators/nutrition.validator";

export const ValidatorCommonIngredient = t.Object({
   _id: ValidatorCommonPostgresId,
   description: t.String(),
   label: t.Optional(t.String()),
   commonName: t.Optional(t.String()),
   portion: t.Object({
      _id: ValidatorCommonPostgresId,
      description: t.String(),
      amount: t.Number()
   }),
   nutrition: t.Optional(ValidatorCommonNutrition),
});
import { t } from "elysia";
import { IdValidator } from "../../../../common/api/validators/id.validator";
import { NutritionValidator } from "../../../../common/api/validators/nutrition.validator";
import { ValidatorRecipeDraft } from "./recipeDraft.Validator";

export const RecipeValidator = t.Object({
   _id: IdValidator,
   ownerId: IdValidator,
   nutrition: t.Optional(NutritionValidator),
   ...ValidatorRecipeDraft.properties,
});
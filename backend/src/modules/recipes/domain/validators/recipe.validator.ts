import { t } from "elysia";
import { IdValidator } from "../../../../common/validators/id.validator";
import { NutritionValidator } from "../../../../common/validators/nutrition.validator";
import { ValidatorRecipeDraft } from "./recipeDraft.Validator";

export const RecipeValidator = t.Object({
   ...IdValidator.properties,
   ownerId: IdValidator.properties._id,
   ...ValidatorRecipeDraft.properties,
   nutrition: t.Optional( NutritionValidator.properties.nutrition),
})
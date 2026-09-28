import { t } from "elysia";
import { RecipeValidator } from "./recipe.validator";

export const AddRecipeValidator = t.Object({
   recipe: t.Omit(RecipeValidator.properties.recipe, ['_id']),
})
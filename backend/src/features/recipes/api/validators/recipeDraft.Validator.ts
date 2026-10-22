import { t } from "elysia";
import { IngredientValidator } from "../../../ingredients/api/validators/ingredient.validator";

export const RecipeDraftValidator = t.Object({
   title: t.String(),
   description: t.String(),
   ingredientList: t.Array(IngredientValidator),
   instructionList: t.Array(t.String()),
   visibility: t.Union([
      t.Literal('public'),
      t.Literal('private'),
      t.Literal('personal')
   ])
})
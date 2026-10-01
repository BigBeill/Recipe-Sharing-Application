import { t } from "elysia";
import { IngredientValidator } from "../../../ingredients/domain/validators/ingredient.validator";

export const ValidatorRecipeDraft = t.Object({
   title: t.String(),
   description: t.String(),
   ingredientList: t.Array( IngredientValidator.properties.ingredient ),
   instructionList: t.Array(t.String()),
   visibility: t.Union([
      t.Literal('public'),
      t.Literal('private'),
      t.Literal('personal')
   ])
})
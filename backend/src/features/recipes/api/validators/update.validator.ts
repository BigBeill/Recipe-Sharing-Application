import { t } from "elysia";
import { IdValidator } from "../../../../common/api/validators/id.validator";
import { IngredientValidator } from "../../../ingredients/api/validators/ingredient.validator";

export const ValidatorRecipeDraft = t.Object({
   _id: IdValidator,
   title: t.Optional(t.String()),
   description: t.Optional(t.String()),
   ingredientList: t.Optional(t.Array(IngredientValidator)),
   instructionList: t.Optional(t.Array(t.String())),
   visibility: t.Optional(t.Union([
      t.Literal('public'),
      t.Literal('private'),
      t.Literal('personal')
   ])),
});
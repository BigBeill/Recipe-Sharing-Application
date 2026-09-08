import { t } from "elysia";
import { IdValidator } from "../../../common/validators/id.validator";
import { IngredientValidator } from "../../ingredients/validators/ingredient.validator";
import { NutritionValidator } from "../../../common/validators/nutrition.validator";
import { ImageLinkValidator } from "../../images/validators/imageLink.validator";

export const RecipeValidator = t.Object({
   recipe: t.Object({
      ...IdValidator.properties,
      ownerId: IdValidator.properties._id,
      ...ImageLinkValidator.properties,
      title: t.String(),
      description: t.String(),
      ingredientList: t.Array( IngredientValidator.properties.ingredient ),
      instructionList: t.Array(t.String()),
      nutrition: t.Optional( NutritionValidator.properties.nutrition),
      visibility: t.Union([
         t.Literal('public'),
         t.Literal('private'),
         t.Literal('personal')
      ])
   })
})
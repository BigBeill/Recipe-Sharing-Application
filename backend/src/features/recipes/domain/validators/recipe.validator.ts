import { t } from "elysia";
import { ValidatorCommonMongooseId } from "../../../../common/domain/validators/mongooseId.validator";
import { ValidatorCommonNutrition } from "../../../../common/domain/validators/nutrition.validator";
import { ValidatorCommonImageReference } from "../../../images/domain/validators/imageReference.validator";
import { ValidatorCommonSignedImageUrl } from "../../../images/domain/validators/signedImageUrl.validator";
import { ValidatorCommonIngredient } from "../../../ingredients/domain/validators/ingredient.validator";

export const ValidatorCommonRecipe = t.Object({
   _id: ValidatorCommonMongooseId,
   ownerId: ValidatorCommonMongooseId,
   nutrition: t.Optional(ValidatorCommonNutrition),
   title: t.String(),
   description: t.String(),
   signedImageUrl: t.Optional(ValidatorCommonSignedImageUrl),
   ingredientList: t.Array(ValidatorCommonIngredient),
   instructionList: t.Array(t.String()),
   visibility: t.Union([
      t.Literal('public'),
      t.Literal('private'),
      t.Literal('personal')
   ])
});

export const ValidatorCommonRecipeDraft = t.Object({
   ...t.Omit(ValidatorCommonRecipe, ['_id', 'ownerId', 'nutrition', 'signedImageUrl']).properties,
   imageReference: t.Optional(ValidatorCommonImageReference),
});
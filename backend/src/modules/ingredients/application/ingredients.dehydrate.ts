import type { TypeRecipeIngredient } from "../domain/ingredients.types";

type TypeDehydratedIngredient = Pick<TypeRecipeIngredient, '_id' | 'label'> & {
   portion: Pick<NonNullable<TypeRecipeIngredient['portion']>, '_id' | 'amount'>;
};

export function dehydrateIngredient(ingredient: TypeRecipeIngredient): TypeDehydratedIngredient {
   if (!ingredient.portion) { throw new Error("ingredient is missing portions field and cannot be converted into storedIngredientType."); }
   return {
      _id: ingredient._id,
      label: ingredient.label,
      portion: {
         _id: ingredient.portion._id,
         amount: ingredient.portion.amount,
      }
   };
};
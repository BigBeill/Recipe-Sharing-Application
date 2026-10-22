import type { TypeIngredient } from "../domain/ingredients.types";

type TypeDehydratedIngredient = Pick<TypeIngredient, '_id' | 'label'> & {
   portion: Pick<NonNullable<TypeIngredient['portion']>, '_id' | 'amount'>;
};

export function dehydrateIngredient(ingredient: TypeIngredient): TypeDehydratedIngredient {
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
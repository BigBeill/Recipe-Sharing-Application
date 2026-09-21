import { Types } from "mongoose";
import type { TypeRecipe } from "../domain/recipes.types";
import { dehydrateIngredient } from "../../ingredients/application/ingredients.dehydrate";

export function dehydrateRecipe(recipe: Omit<TypeRecipe, '_id'>) {
   return {
      ownerId: new Types.ObjectId(recipe.ownerId),
      title: recipe.title,
      description: recipe.description,
      image: recipe.image ?? undefined,
      ingredientList: recipe.ingredientList.map(dehydrateIngredient),
      instructionList: recipe.instructionList,
      nutrition: recipe.nutrition,
      visibility: recipe.visibility,
   };
}
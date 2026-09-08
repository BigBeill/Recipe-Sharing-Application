import { Types } from "mongoose";
import type { RecipeType } from "./recipes.types";
import { toStoredIngredient } from "../ingredients/ingredients.utils";

export function toStoredRecipe(recipe: Omit<RecipeType, '_id'>) {
   return {
      ownerId: new Types.ObjectId(recipe.ownerId),
      title: recipe.title,
      description: recipe.description,
      image: recipe.image ?? undefined,
      ingredientList: recipe.ingredientList.map(toStoredIngredient),
      instructionList: recipe.instructionList,
      nutrition: recipe.nutrition,
      visibility: recipe.visibility,
   };
}
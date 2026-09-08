import { RecipeType } from "./recipes.types";

export default function checkRecipeRequirements (recipe: RecipeType): string | null {
   if (!recipe.title) { return "your recipe must have a title"; }
   if (!recipe.description) { return "your recipe must have a description"; }
   if (recipe.ingredientList.length == 0) { return "your recipe must have at least one ingredient"; }
   if (recipe.instructionList.length == 0) { return "your recipe must have at least one instruction"; }
   return null;
}
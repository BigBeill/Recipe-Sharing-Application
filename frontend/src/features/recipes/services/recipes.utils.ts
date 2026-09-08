import { RecipeDraft, RecipeType } from "../domain/recipes.types";
import { ErrorValidation } from "@/shared/lib/api/errorClasses";

export function checkValidRecipeDraft(recipe: RecipeDraft) {
   const issueList: string[] = [];

   if (recipe.title.length < 3) { issueList.push('title must be at least 3 characters long'); }
   if (recipe.title.length > 512) { issueList.push('title must be less than 512 characters long'); }
   if (recipe.description.length < 3) { issueList.push('description must be at least 3 characters long'); }
   if (recipe.description.length > 16384) { issueList.push('description must be less than 16,384 characters long'); }
   if (recipe.ingredientList.length == 0) { issueList.push('must have at least 1 ingredient'); }
   if (recipe.ingredientList.length > 128) { issueList.push('must have less than 128 ingredients'); }
   recipe.ingredientList.map((ingredient) => {
      if (ingredient.label) { 
         if (ingredient.label.length < 3) { issueList.push('all ingredient lists must be at least 3 characters long'); }
         if (ingredient.label.length > 512) { issueList.push('all ingredient labels must be less than 512 characters long'); }
      }
      if (!ingredient.portion) { issueList.push('all ingredients part of a recipe must have portions'); }
      else {
         if (ingredient.portion.amount <= 0) {  issueList.push('all ingredient portions must have an amount of greater than 0'); }
         if (ingredient.portion.amount > 16384) { issueList.push('all ingredient portions must be less than 16,384'); }
      }
   });
   if (recipe.instructionList.length == 0) { issueList.push('must have at least 1 instruction'); }
   if (recipe.instructionList.length == 512) { issueList.push('must have less than 512 instructions') }
   recipe.instructionList.map((instruction) => {
      if (instruction.length < 3) { issueList.push('all instructions must have at least 3 characters'); }
      if (instruction.length > 16384) { issueList.push('all instructions must be less than 16,384 characters') }
   });

   if (issueList. length != 0) { throw new ErrorValidation([{ field: 'recipe', issueList }]); }
   else { return null; }
}

export function createRecipeFormData(recipe: RecipeDraft | RecipeType, imageBuffer?: File): FormData {
   const formData = new FormData();

   if ("_id" in recipe) { formData.append("_id", recipe._id); }
	formData.append("title", recipe.title);
	formData.append("description", recipe.description);
	formData.append("ingredients", JSON.stringify(recipe.ingredientList));
	formData.append("instructions", JSON.stringify(recipe.instructionList));
	formData.append("visibility", recipe.visibility);
	if (imageBuffer instanceof File) { formData.append("image", imageBuffer); }

   return formData;
}
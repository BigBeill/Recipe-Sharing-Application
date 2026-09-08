import { PaginatedListType } from "@/shared/shared.types";
import { RecipeDraft, RecipeType } from "../domain/recipes.types";
import { checkValidRecipeDraft, createRecipeFormData } from "./recipes.utils";
import {
   TypeRecipeApi,
   TypeRecipeServiceGetParams,
   TypeRecipeServiceSearchParams,
} from './recipes.api'

export function createRecipeService(api: TypeRecipeApi) {
   return {

      create: (recipe: RecipeDraft): Promise<void> => {
         checkValidRecipeDraft(recipe);
         const recipeFormData = createRecipeFormData(recipe);
         return api.create(recipeFormData);
      },

      delete: (recipeId: string): Promise<void> => {
         return api.delete(recipeId);
      },

      get: (recipeId: string, params?: TypeRecipeServiceGetParams): Promise<RecipeType> => {
         return api.get(recipeId, params);
      },

      search: (params: TypeRecipeServiceSearchParams): Promise<PaginatedListType<RecipeType>> => {
         const { title, ingredientIdList, visibilityList, limit, skip } = params;
         return api.search({ 
            ...(title ? { title } : undefined),
            ...(ingredientIdList?.length !== 0 ? ingredientIdList : undefined), 
            visibilityList,
            limit,
            skip,
         });
      },

      update: (recipeId: string, recipe: RecipeDraft): Promise<void> => {
         checkValidRecipeDraft(recipe);
         const recipeFormData = createRecipeFormData(recipe);
         return api.update(recipeId, recipeFormData);
      }

   }
}
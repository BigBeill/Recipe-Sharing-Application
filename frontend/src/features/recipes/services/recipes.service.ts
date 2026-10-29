import { PaginatedListType } from "@/shared/domain/shared.types";
import { checkValidRecipeDraft } from "./recipes.utils";
import {
   TypeRecipeApi,
   PayloadRecipeApiGet,
   PayloadRecipeApiSearch,
   PayloadRecipeApiUpdate,
} from './recipes.api'
import { TypeRecipe, TypeRecipeDraft } from "../domain/recipes.types";

export function createRecipeService(api: TypeRecipeApi) {
   return {

      create: async (recipe: TypeRecipeDraft): Promise<void> => {
         checkValidRecipeDraft(recipe);
         await api.create(recipe);
      },

      delete: (recipeId: string): Promise<void> => {
         return api.delete(recipeId);
      },

      get: (recipeId: string, params?: PayloadRecipeApiGet): Promise<TypeRecipe> => {
         return api.get(recipeId, params);
      },

      search: (params: PayloadRecipeApiSearch): Promise<PaginatedListType<TypeRecipe>> => {
         const { title, ingredientIdList, visibilityList, limit, skip } = params;
         return api.search({ 
            ...(title ? { title } : undefined),
            ...(ingredientIdList?.length !== 0 ? { ingredientIdList } : undefined), 
            visibilityList,
            limit,
            skip,
         });
      },

      update: async (recipeId: string, payload: PayloadRecipeApiUpdate): Promise<void> => {
         await api.update(recipeId, payload);
      },
   }
}
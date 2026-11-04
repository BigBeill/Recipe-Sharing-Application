import type { TypeApiCaller } from "@/shared/lib/api/types";
import { TypeRecipe, TypeRecipeDraft } from "../domain/recipes.types";
import { PaginatedListType } from "@/shared/domain/shared.types";

export type PayloadRecipeApiGet = { includeNutrients?: boolean; }
export type PayloadRecipeApiSearch = {
   title?: string;
   ownerIdList?: string[];
   ingredientIdList?: number[];
   visibilityList?: ('public' | 'private' | 'personal')[]
   limit?: number;
   skip?: number;
}

export function createRecipeApi(call: TypeApiCaller ) {
   return {

      create: (body: TypeRecipeDraft): Promise<void> =>
         call({
            url: '/recipes/create',
            method: 'post',
            body: body
         }),
      
      delete: (recipeId: string): Promise<void> => 
         call({
            url: `/recipes/delete/${recipeId}`,
            method: 'delete'
         }),

      get: (recipeId: string, params?: PayloadRecipeApiGet) =>
         call<TypeRecipe>({
            url:`/recipes/get/${recipeId}`,
            method: 'get',
            body: params,
         }),

      search: (params: PayloadRecipeApiSearch) => 
         call<PaginatedListType<TypeRecipe>>({
            url:`/recipes/search`,
            method: 'get',
            body: params,
         }),

      update: (recipeId: string, body: Partial<TypeRecipeDraft>): Promise<TypeRecipe> =>
         call<TypeRecipe>({
            url:`/recipes/update/${recipeId}`,
            method: 'put',
            body: body,
         })

   }
}

export type TypeRecipeApi = ReturnType<typeof createRecipeApi>;
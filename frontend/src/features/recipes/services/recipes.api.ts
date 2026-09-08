import type { TypeApiCaller } from "@/shared/lib/api/types";
import { RecipeType } from "../domain/recipes.types";
import { PaginatedListType } from "@/shared/shared.types";

export type TypeRecipeServiceGetParams = { includeNutrients?: boolean; }
export type TypeRecipeServiceSearchParams = {
   title?: string;
   ownerIdList?: string[];
   ingredientIdList?: number[];
   visibilityList?: ('public' | 'private' | 'personal')[]
   limit?: number;
   skip?: number;
}

export function createRecipeApi(call: TypeApiCaller ) {
   return {

      create: (recipe: FormData): Promise<void> =>
         call({
            url: '/recipes/create',
            method: 'post',
            body: { recipe: recipe }
         }),
      
      delete: (recipeId: string): Promise<void> => 
         call({
            url: `/recipes/delete/${recipeId}`,
            method: 'delete'
         }),

      get: (recipeId: string, params?: TypeRecipeServiceGetParams) =>
         call<RecipeType>({
            url:`/recipes/get/${recipeId}`,
            method: 'get',
            body: params,
         }),

      search: (params: TypeRecipeServiceSearchParams) => 
         call<PaginatedListType<RecipeType>>({
            url:`/recipes/search`,
            method: 'get',
            body: params,
         }),

      update: (recipeId: string, recipe: FormData): Promise<void> =>
         call({
            url:`/recipes/update/${recipeId}`,
            method: 'put',
            body: { recipe: recipe },
         })

   }
}

export type TypeRecipeApi = ReturnType<typeof createRecipeApi>;
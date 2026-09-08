import { TypeApiCaller } from "@/shared/lib/api/types";
import { IngredientGroupType, IngredientConversionType, IngredientType } from "../domain/ingredient.types";
import { PaginatedListType } from "@/shared/shared.types";

export type TypeIngredientServiceGetParams = { includeNutrition?: boolean }
export type TypeIngredientServiceSearchParams = {
   description?: string;
   food_group_id?: number;
   skip?: number;
   limit?: number;
}

export function createIngredientApi(call: TypeApiCaller) {
   return {

   conversionOptionList: (ingredientId: number) =>
      call<IngredientConversionType[]>({
         url: `/ingredients/conversionOptionList/${ingredientId}`,
         method: 'get',
      }),
   get: (ingredientId: number, params?: TypeIngredientServiceGetParams) =>
      call<IngredientType>({
         url: `/ingredients/get/${ingredientId}`,
         method: 'get',
         body: params
      }),
   search: (params: TypeIngredientServiceSearchParams) => 
      call<PaginatedListType<IngredientType>>({
         url: '/ingredients/search',
         method: 'get',
         body: params,
      }),
   searchGroup: () =>
      call<PaginatedListType<IngredientGroupType>>({
         url: `/ingredients/searchGroup`,
         method: 'get',
      }),

   }
}

export type TypeIngredientApi = ReturnType<typeof createIngredientApi>;
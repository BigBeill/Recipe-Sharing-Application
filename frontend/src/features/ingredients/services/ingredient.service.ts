import { IngredientConversionType, IngredientGroupType, IngredientType } from "../domain/ingredient.types";
import { PaginatedListType } from "@/shared/domain/shared.types";
import type {
   TypeIngredientApi,
   TypeIngredientServiceGetParams,
   TypeIngredientServiceSearchParams,
} from './ingredient.api';

export function createIngredientService(api: TypeIngredientApi) {
   return {

      searchConversion: (ingredientId: number): Promise<PaginatedListType<IngredientConversionType>> => {
         return api.searchConversion(ingredientId);
      },

      get: (ingredientId: number, params?: TypeIngredientServiceGetParams): Promise<IngredientType> => {
         return api.get(ingredientId, params);
      },

      search: (params: TypeIngredientServiceSearchParams): Promise<PaginatedListType<IngredientType>> => {
         return api.search(params);
      },

      searchGroup: (): Promise<PaginatedListType<IngredientGroupType>> => {
         return api.searchGroup();
      },

   }
}
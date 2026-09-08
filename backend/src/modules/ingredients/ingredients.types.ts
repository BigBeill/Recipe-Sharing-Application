import type { NutritionType } from "../recipes/recipes.types";

export interface IngredientType {
   _id: number;
   description: string;
   label?: string;
   commonName?: string;
   portion?: {
      _id: number;
      description: string;
      amount: number;
   }
   nutrition?: NutritionType
}

export interface IngredientConversionType {
   food_id: number
   measure_id: number,
   measure_description: string,
   value: number
}

export interface IngredientGroupType {
   _id: string;
   name: string;
}
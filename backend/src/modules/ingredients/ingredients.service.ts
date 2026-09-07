import { NotFoundError } from "elysia";
import type { IngredientRecord } from "../../common/mongo-db/schemas/recipe.schema";
import type PaginationParams from "../../common/parameters/pagination.parameters";
import type { PaginatedListType } from "../../common/types/return.types";
import type { NutritionType } from "../recipes/recipes.types";
import type { IngredientsRepository } from "./ingredients.repository";
import type { IngredientConversionType, IngredientGroupType, IngredientType } from "./ingredients.types";
import { breakupMeasureDescription } from "./ingredients.utils";

interface SearchGroupParams extends PaginationParams {
   description?: string,
}

interface SearchIngredientParams extends PaginationParams {
   description?: string;
   food_group_id?: number;
}

export class IngredientsService {
   private readonly repository: IngredientsRepository;

   constructor(ingredientsRepository: IngredientsRepository) {
      this.repository = ingredientsRepository;
   }

   async getIngredient (_id: number, params: { includeNutrition?: boolean } = {}): Promise<IngredientType | null> {
      const { includeNutrition } = params;

      const ingredient = await this.repository.getIngredient(_id);
      if (!ingredient) { throw new NotFoundError(); }

      if (!includeNutrition) { return ingredient; }
      else {
         const nutrition = await this.repository.getBaseNutrition(ingredient._id);
         return { ...ingredient, nutrition }
      }
   }

   async getNutrition (ingredientList: IngredientType[]): Promise<NutritionType> {

      // get a list of nutrients found in each ingredient
      const nutritionList: NutritionType[] = await Promise.all( ingredientList.map(async (ingredient) => {
         const [ nutrition, conversion ] = await Promise.all([
            this.repository.getBaseNutrition(ingredient._id),
            this.repository.getConversion(ingredient._id, ingredient.portion!._id),
         ]);

         const { number: measureNumber } = conversion ? breakupMeasureDescription(conversion.measure_description): { number: 1 };
         
         const totalConversion = ((conversion?.value || 1) / measureNumber) * ingredient.portion!.amount;

         const scaledNutrition = Object.fromEntries(
            Object.entries(nutrition).map(([field, value]) => [field, value * totalConversion]),
         ) as typeof nutrition;

         return scaledNutrition;
      }));

      // add all nutrition values together
      const totalNutrition = nutritionList.reduce((acc, nutrition) => {
         for (const key of Object.keys(acc) as (keyof typeof acc)[]) {
            acc[key] += nutrition[key];
         }
         return acc;
      }, { calories: 0, fat: 0, cholesterol: 0, sodium: 0, potassium: 0, carbohydrates: 0, fibre: 0, sugar: 0, protein: 0 });
   
      return totalNutrition;
   }

   async hydrateIngredient(record: IngredientRecord): Promise<IngredientType> {
      const [ingredient, conversion] = await Promise.all([
         this.repository.getIngredient(record._id),
         this.repository.getConversion(record._id, record.portion._id).catch((error) => {
            console.error(error);
            return null;
         }),
      ]);
      return {
         ...record,
         description: ingredient?.description || "",
         portion: {
            ...record.portion,
            description: conversion?.measure_description || "",
         }
      }
   }

   // TODO: get repository to return count so paginated list can be used effectively
   async searchConversion (food_id: number, params: PaginationParams): Promise<PaginatedListType<IngredientConversionType>> {
      const { skip, limit } = params;
      const conversionList = await this.repository.searchConversions(food_id, { skip, limit });
      return conversionList;
   }

   async searchGroup (params: SearchGroupParams): Promise<PaginatedListType<IngredientGroupType>> {
      const { description, skip, limit } = params;
      const groupList = await this.repository.searchGroups({ description, skip, limit });
      return groupList;
   }

   async searchIngredient (params: SearchIngredientParams): Promise<PaginatedListType<IngredientType>> {
      const { description, food_group_id, skip, limit } = params;
      const ingredientList = await this.repository.searchIngredients({ description, food_group_id, skip, limit });
      return ingredientList;
   }
}
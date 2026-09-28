import { NotFoundError } from "elysia";
import type { IngredientRecord } from "../../../database/schemas/recipe.schema";
import type PaginationParams from "../../../common/parameters/pagination.parameters";
import type { PaginatedListType } from "../../../common/types/return.types";
import type { IngredientsRepository } from "../infrastructure/ingredients.repository";
import type { TypeIngredient, TypeIngredientConversion, TypeIngredientGroup, TypeRecipeIngredient } from "../domain/ingredients.types";
import { NutritionCalculator } from "./ingredients.nutritionCalculator";
import type { TypeNutrition } from "../../recipes/domain/recipes.types";

interface SearchGroupParams extends PaginationParams {
   description?: string,
}

interface SearchIngredientParams extends PaginationParams {
   description?: string;
   food_group_id?: number;
}

export class IngredientsService {
   private readonly repository: IngredientsRepository;
   private readonly nutrition: NutritionCalculator;

   constructor({ ingredientsRepository }: { ingredientsRepository: IngredientsRepository }) {
      this.repository = ingredientsRepository;
      this.nutrition = new NutritionCalculator({ ingredientsRepository });
   }



   async getIngredient (_id: number): Promise<TypeIngredient> {
      const ingredient = await this.repository.getIngredient(_id);
      if (!ingredient) { throw new NotFoundError(); }
      return ingredient;
   }



   async getNutrition (ingredient: TypeRecipeIngredient): Promise<TypeNutrition> {
      return this.nutrition.calculate(ingredient);
   }



   async hydrateIngredient(record: IngredientRecord): Promise<TypeRecipeIngredient> {
      const [ingredient, measureDescription] = await Promise.all([
         this.repository.getIngredient(record._id),
         this.repository.getMeasureDescription(record.portion._id)
      ]);
      return {
         ...record,
         description: ingredient?.description,
         portion: {
            ...record.portion,
            description: measureDescription,
         }
      }
   }



   async searchConversion (food_id: number, params: PaginationParams): Promise<PaginatedListType<TypeIngredientConversion>> {
      const { skip, limit } = params;
      const conversionList = await this.repository.searchConversionOptions(food_id, { skip, limit });
      return conversionList;
   }



   async searchGroup (params: SearchGroupParams): Promise<PaginatedListType<TypeIngredientGroup>> {
      const { description, skip, limit } = params;
      const groupList = await this.repository.searchGroups({ description, skip, limit });
      return groupList;
   }



   async searchIngredient (params: SearchIngredientParams): Promise<PaginatedListType<TypeIngredient>> {
      const { description, food_group_id, skip, limit } = params;
      const ingredientList = await this.repository.searchIngredients({ description, food_group_id, skip, limit });
      return ingredientList;
   }
}
import { NotFoundError } from "elysia";
import type { IngredientRecord } from "../../../externalResources/database/mongoose/schemas/recipe.schema";
import type { PaginatedListType } from "../../../common/api/apiResponse.types";
import type { IngredientsRepository } from "../infrastructure/ingredients.repository";
import type { TypeIngredient, TypeIngredientConversion, TypeIngredientDraft, TypeIngredientGroup } from "../domain/ingredients.types";
import { NutritionCalculator } from "./ingredients.nutritionCalculator";
import type { TypeNutrition } from "../../recipes/domain/recipes.types";

interface SearchGroupParams {
   description?: string,
   skip?: number,
   limit?: number,
}

interface SearchIngredientParams {
   description?: string,
   food_group_id?: number,
   skip?: number,
   limit?: number,
}

export class IngredientsService {
   private readonly repository: IngredientsRepository;
   private readonly nutrition: NutritionCalculator;

   constructor({ ingredientsRepository }: { ingredientsRepository: IngredientsRepository }) {
      this.repository = ingredientsRepository;
      this.nutrition = new NutritionCalculator({ ingredientsRepository });
   }



   async getIngredient (_id: number): Promise<TypeIngredientDraft> {
      const ingredient = await this.repository.getIngredient(_id);
      if (!ingredient) { throw new NotFoundError(); }
      return ingredient;
   }



   async getNutrition (ingredient: TypeIngredient): Promise<TypeNutrition> {
      return this.nutrition.calculate(ingredient);
   }



   async hydrateIngredient(record: IngredientRecord): Promise<TypeIngredient> {
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



   async searchConversion (food_id: number, params: { skip?: number, limit?: number }): Promise<PaginatedListType<TypeIngredientConversion>> {
      const { skip, limit } = params;
      const conversionList = await this.repository.searchConversionOption(food_id, { skip, limit });
      return conversionList;
   }



   async searchGroup (params: SearchGroupParams): Promise<PaginatedListType<TypeIngredientGroup>> {
      const { description, skip, limit } = params;
      const groupList = await this.repository.searchGroup({ description, skip, limit });
      return groupList;
   }



   async searchIngredient (params: SearchIngredientParams): Promise<PaginatedListType<TypeIngredientDraft>> {
      const { description, food_group_id, skip, limit } = params;
      const ingredientList = await this.repository.searchIngredient({ description, food_group_id, skip, limit });
      return ingredientList;
   }
}
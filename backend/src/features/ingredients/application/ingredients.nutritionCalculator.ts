import type { RecordIngredient } from "../../../externalResources/database/mongoose/schemas/recipe.schema";
import type { TypeNutrition } from "../../recipes/domain/recipes.types";
import type { TypeIngredient } from "../domain/ingredients.types";
import type { IngredientsRepository } from "../infrastructure/ingredients.repository";

export class NutritionCalculator {
   private readonly repository: IngredientsRepository;

   constructor({ ingredientsRepository }: { ingredientsRepository: IngredientsRepository }) {
      this.repository = ingredientsRepository;
   }

   async calculate(ingredient: TypeIngredient | RecordIngredient): Promise<TypeNutrition> {

      const [baseNutrition, conversion] = await Promise.all([
         this.repository.getBaseNutrition(ingredient._id),
         this.repository.getConversion(ingredient._id, ingredient.portion._id),
      ]);

      const scaledNutrition = Object.fromEntries(
         Object.entries(baseNutrition).map(([field, value]) => [field, value * conversion.value * ingredient.portion.amount]),
      ) as TypeNutrition;

      return scaledNutrition
   }
}
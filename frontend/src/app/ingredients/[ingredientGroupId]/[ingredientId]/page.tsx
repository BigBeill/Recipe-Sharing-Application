import IngredientPage from "@/features/ingredients/components/IngredientPage";
import { IngredientType } from "@/features/ingredients/domain/ingredient.types";
import { ingredientService } from "@/features/ingredients/services/ingredient.service";
import preRenderService from "@/shared/lib/preRenderService";

export default async function IngredientList({ params }: { params: Promise<{ IngredientGroupId: number, ingredientId: number }> }) {
   const { ingredientId } = await params;

   const ingredient: IngredientType = await preRenderService(() => { return ingredientService.get(ingredientId, { includeNutrition: true }) })

   return <IngredientPage ingredient={ ingredient } />;
}
import IngredientGroupPage from "@/features/ingredients/components/IngredientGroupPage";
import { ingredientService } from "@/features/ingredients/services/ingredient.service";
import preRenderService from "@/shared/lib/preRenderService";

export default async function Page() {
   const IngredientGroups = await preRenderService(() => ingredientService.searchGroup());
   
   return <IngredientGroupPage ingredientGroups={ IngredientGroups } />
}
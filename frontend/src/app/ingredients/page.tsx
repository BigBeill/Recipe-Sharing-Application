import { ingredientService } from "@/features/ingredients/services/ingredient.service.server";
import IngredientGroupPage from "@/features/ingredients/view/pages/IngredientGroup.page";
import preRenderService from "@/shared/lib/preRenderService";

export default async function Page() {
   const IngredientGroups = await preRenderService(() => ingredientService.searchGroup());
   
   return <IngredientGroupPage ingredientGroups={ IngredientGroups } />
}
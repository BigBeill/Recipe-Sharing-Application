import RecipePage from "@/features/recipes/components/RecipePage";
import { recipeService } from "@/features/recipes/services/recipes.service.server";
import preRenderService from "@/shared/lib/preRenderService";

export default async function Page({ params }: { params: Promise<{recipeId: string}> }) {
   const { recipeId } = await params;

   const recipe = await preRenderService(() => { return recipeService.get(recipeId) })
   return <RecipePage recipe={ recipe } />;
}
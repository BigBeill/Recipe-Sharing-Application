import { verifySession } from "@/features/auth/server/session";
import EditRecipeView from "@/features/recipes/components/EditRecipeView"
import { recipeService } from "@/features/recipes/services/recipes.service";
import preRenderService from "@/shared/lib/preRenderService";
import { redirect } from "next/navigation";

export default async function EditRecipePage({ params }: { params: Promise<{recipeId: string}> }) {
   const { recipeId } = await params;

   const session = await verifySession();
   if (!session) { redirect('/auth/login'); }

   const recipe = await preRenderService(() => { return recipeService.get(recipeId) });
   
   return <EditRecipeView recipe={ recipe } />
}
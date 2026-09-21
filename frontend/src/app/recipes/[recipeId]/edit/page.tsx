import { verifySession } from "@/features/auth/server/session";
import { recipeService } from "@/features/recipes/services/recipes.service.server";
import EditRecipePage from "@/features/recipes/view/pages/EditRecipe.page";
import preRenderService from "@/shared/lib/preRenderService";
import { redirect } from "next/navigation";

export default async function Page({ params }: { params: Promise<{recipeId: string}> }) {
   const { recipeId } = await params;

   const session = await verifySession();
   if (!session) { redirect('/auth/login'); }

   const recipe = await preRenderService(() => { return recipeService.get(recipeId) });
   
   return <EditRecipePage recipe={ recipe } />
}
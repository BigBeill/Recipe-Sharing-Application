import { verifySession } from "@/features/auth/server/session";
import CreateRecipeView from "@/features/recipes/components/CreateRecipeView";
import { RecipeDraft } from "@/features/recipes/domain/recipes.types";
import { redirect } from "next/navigation";

/** Builds an authenticated user's blank recipe draft or redirects guests to login. */
export default async function NewRecipe() {

   const session = await verifySession();
   if (!session) { redirect('/auth/login'); }

   const defaultRecipe: RecipeDraft = {
      ownerId: session.userId,
      title: '', 
      description: '', 
      ingredientList: [], 
      instructionList: [], 
      visibility: 'public',
   }

   return <CreateRecipeView recipe={ defaultRecipe }/>
}
import { verifySession } from "@/features/auth/server/session";
import CreateRecipePage from "@/features/recipes/view/pages/CreateRecipe.page";
import { RecipeDraft } from "@/features/recipes/domain/recipes.types";
import { redirect } from "next/navigation";

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

   return <CreateRecipePage recipe={ defaultRecipe }/>
}
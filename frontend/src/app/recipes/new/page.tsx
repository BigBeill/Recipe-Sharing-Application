import { verifySession } from "@/features/auth/server/session";
import CreateRecipeView from "@/features/recipes/components/CreateRecipeView";
import { RecipeType } from "@/features/recipes/domain/recipes.types";
import { redirect } from "next/navigation";

export default async function NewRecipe() {

   const session = await verifySession();
   if (!session) { redirect('/auth/login'); }

   const defaultRecipe: Omit<RecipeType, "_id"> = {
      ownerId: session.userId,
      title: '', 
      description: '', 
      ingredientList: [], 
      instructionList: [], 
      visibility: 'public',
   }

   return <CreateRecipeView recipe={ defaultRecipe }/>
}
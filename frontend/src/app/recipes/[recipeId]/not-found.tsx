import { ErrorNotFound } from "@/shared/domain/errorClasses";
import StateErrorPage from "@/shared/view/states/Error.states";

export default async function NotFoundPage({ params }: { params: Promise<{recipeId: string}> }) {
   const { recipeId } = await params;

   return <StateErrorPage error={ new ErrorNotFound(`Unable to fetch recipe from server with _id: ${recipeId}`) } />
}
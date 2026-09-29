import IngredientListPage from "@/features/ingredients/view/pages/IngredientList.page";

export default async function IngredientList({ params }: { params: Promise<{ ingredientGroupId: string }> }) {
   const { ingredientGroupId } = await params;
   return <IngredientListPage ingredientGroupId={ Number(ingredientGroupId) } />;
}
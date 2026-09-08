import IngredientListPage from "@/features/ingredients/components/IngredientListPage";

export default async function IngredientList({ params }: { params: Promise<{ ingredientGroupId: string }> }) {
   const { ingredientGroupId } = await params;
   return <IngredientListPage ingredientGroupId={ Number(ingredientGroupId) } />;
}
import NotebookPageListItems from "@/shared/view/components/notebookPageSpecific/ListItems.notebookComponent";
import { PaginatedListType } from "@/shared/domain/shared.types";
import NotebookPage from "@/shared/view/pages/Notebook.page";
import { IngredientGroupType } from "../../domain/ingredient.types";

const groupSize = 5;

interface props {
   ingredientGroups: PaginatedListType<IngredientGroupType>
}

export default function IngredientGroupPage({ ingredientGroups }: props) {

   const notebookComponents: PaginatedListType<React.ReactElement> = { list: [], count: Math.ceil(ingredientGroups.count / groupSize), firstItemIndex: 0  };
   
   for (let groupStartIndex = 0; groupStartIndex < ingredientGroups.list.length; groupStartIndex += groupSize) {
      const ingredientGroupList = ingredientGroups.list.slice(groupStartIndex, groupStartIndex + groupSize);
      const itemList = ingredientGroupList.map((ingredientGroup) => { return { title: ingredientGroup.description, href: `/ingredients/${ ingredientGroup._id }` } });
      notebookComponents.list.push(<NotebookPageListItems key={ groupStartIndex } itemList={ itemList } defaultListSize={ groupSize } />);
   }

   return <NotebookPage components={ notebookComponents } />
}
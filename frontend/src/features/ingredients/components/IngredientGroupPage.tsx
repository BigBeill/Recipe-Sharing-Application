import { IngredientGroupType } from "../domain/ingredient.types";
import NotebookPageListItems from "@/shared/components/notebookPageComponents/ListItems";
import Notebook from "@/shared/components/Notebook";
import { PaginatedListType } from "@/shared/shared.types";

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

   return <Notebook components={ notebookComponents } />
}
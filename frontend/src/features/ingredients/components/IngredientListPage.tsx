"use client"

import NotebookPageListItems from "@/shared/components/notebookPageComponents/ListItems";
import Notebook from "@/shared/components/Notebook";
import { BrokenPaginatedListType } from "@/shared/shared.types";
import useServiceState from "@/shared/hooks/useServiceState";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import combinePaginatedLists from "@/shared/lib/combinePaginatedLists";
import { ingredientService } from "../services/ingredient.service.client";

const groupSize = 5;

interface PageProps {
   ingredientGroupId: number;
}

export default function IngredientListPage({ ingredientGroupId }: PageProps) {

   const searchParams = useSearchParams();
   const page = Number(searchParams.get('page')) || 1;

   const [notebookComponents, setNotebookComponents] = useState<BrokenPaginatedListType<React.ReactElement>>({ list: [], count: 0, firstItemIndex: 0 });

   useServiceState(async () => {
      const firstComponent = (page - 1) * 2; // index of the first component being added to notebookComponents
      const firstItem = firstComponent * groupSize; // index of the first user being grabbed from the server

      const response = await ingredientService.search({ 
         food_group_id: ingredientGroupId, 
         skip: firstItem,
         limit: 10,
      });

      let newComponents = []

      for (let i = 0; i < response.list.length; i += groupSize) {
         const ingredientList = response.list.slice(i, i + groupSize);
         const itemList = ingredientList.map((ingredient) => { return { title: ingredient.description, href: `/ingredients/${ingredientGroupId}/${ ingredient._id }` } });
         newComponents.push(<NotebookPageListItems itemList={ itemList } defaultListSize={ groupSize } />);
      }

      setNotebookComponents((previous) => { return combinePaginatedLists(previous, { list: newComponents,  count: Math.ceil(response.count / groupSize) + 1, firstItemIndex: firstComponent }) });

   }, [searchParams]);

   return <Notebook components={ notebookComponents } />
}
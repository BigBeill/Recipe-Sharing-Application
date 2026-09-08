"use client"

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import useServiceState from "@/shared/hooks/useServiceState";
import { BrokenPaginatedListType } from "@/shared/shared.types";
import UserFilterPage from "./UserFilterPage";
import NotebookPageListItems from "@/shared/components/notebookPageComponents/ListItems";
import combinePaginatedLists from "@/shared/lib/combinePaginatedLists";
import Notebook from "@/shared/components/Notebook";
import { userService } from "../services/user.service.client";

const groupSize = 5;


export default function SearchUserPage() {

   const searchParams = useSearchParams();

   const userId = searchParams.get('userId');
   const name = searchParams.get('name');
   const page: number = Number(searchParams.get("page")) || 1;

   // create the initial paginated list that only shows the filter page
   const [notebookComponents, setNotebookComponents] = useState<BrokenPaginatedListType<React.ReactElement>>({ list: [<UserFilterPage/>], count: 1, firstItemIndex: 0 });

   useServiceState(async() => {
      const firstComponent = Math.max((page - 1) * 2, 1); // index of the first component being added to notebookComponents
      const firstItem = (firstComponent - 1) * groupSize; // index of the first user being grabbed from the server

      const response = await userService.search({ 
         ...(userId && { _id: userId }),
         ...(name && { name }),
         skip: firstItem,
         limit: (page === 1 ? groupSize : groupSize * 2)
      });

      let newComponents = []
      
      for (let i = 0; i < response.list.length; i += groupSize) {
         const userList = response.list.slice(i, i + groupSize);
         const itemList = userList.map((user) => { return { title: user.name, image: user.image, href: `/recipes/${ user._id }` } });
         newComponents.push(<NotebookPageListItems itemList={ itemList } defaultListSize={ groupSize } />);
      }

      setNotebookComponents((previous) => { return combinePaginatedLists(previous, { list: newComponents,  count: Math.ceil(response.count / groupSize) + 1, firstItemIndex: firstComponent }) });
   
   }, [searchParams]);

   return <Notebook components={ notebookComponents } />
}
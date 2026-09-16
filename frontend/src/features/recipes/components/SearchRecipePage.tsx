"use client"

import React, { use, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import useServiceState from '@/shared/hooks/useServiceState';
import Notebook from '@/shared/components/Notebook';
import NotebookPageListItems from '@/shared/components/notebookPageComponents/ListItems';
import RecipeFilterPage from './RecipeFilterPage';
import { BrokenPaginatedListType } from '@/shared/shared.types';
import combinePaginatedLists from '@/shared/lib/combinePaginatedLists';
import { recipeService } from '../services/recipes.service.client';
import { TypeSession } from '@/features/auth/server/session';
import { useAuth } from '@/features/auth/providers/AuthProvider';
import { LoadingProvider } from '@/shared/hooks/loadingContext';

const groupSize = 5

/** Searches from URL filters, redirects guests from friends or personal searches, and shares loading state. */
export default function SearchRecipePage() {

   const { sessionStatus } = useAuth();

   const router = useRouter();
   const searchParams = useSearchParams();

   const title: string =  searchParams.get('title') || '';
   const ingredientIdListParam = searchParams.get('ingredientIdList');
   const category = searchParams.get('category') as "public" | "friends" | "personal" || 'public';
   const ingredientIdList = useMemo(() => { return ingredientIdListParam ? ingredientIdListParam.split(',').map(Number) : [] }, [ingredientIdListParam] );
   const page: number = Number(searchParams.get('page')) || 1;

   useEffect(() => {
      if (sessionStatus === 'guest' && (category === 'friends' || category === 'personal')) { router.replace('/auth/login'); }
   },[sessionStatus]);

   const [notebookComponents, setNotebookComponents] = useState<BrokenPaginatedListType<React.ReactElement>>({ list: [<RecipeFilterPage />], count: 1, firstItemIndex: 0 });

   const recipeListState = useServiceState(async () => {

      const firstComponent = Math.max((page - 1) * 2, 1); // index of the first component being added to notebookComponents
      const firstItem = (firstComponent - 1) * groupSize; // index of the first user being grabbed from the server

      const response = await recipeService.search({
         title,
         visibilityList: [...(
            sessionStatus ? ['public']
            : category === 'public' ? ['public', 'private', 'personal']
            : category === 'friends' ? ['private, personal']
            : ['personal']
         ) as ('public' | 'private' | 'personal')[]],
         ingredientIdList,
         skip: firstItem,
         limit: (page === 1 ? groupSize : groupSize * 2)
      });

      let newComponents = []

      for (let i = 0; i < response.list.length; i += groupSize) {
         const recipeList = response.list.slice(i, i + groupSize);
         const itemList = recipeList.map((recipe) => { return { title: recipe.title, image: recipe.image, href: `/recipes/${ recipe._id }` } });
         newComponents.push(<NotebookPageListItems itemList={ itemList } defaultListSize={ groupSize } />);
      }

      setNotebookComponents((previous) => { return combinePaginatedLists(previous, { list: newComponents,  count: Math.ceil(response.count / groupSize) + 1, firstItemIndex: firstComponent }) });

   }, [searchParams]);

   return (
      <LoadingProvider value={ recipeListState.status === "loading" } >
         <Notebook components={ notebookComponents } />
      </LoadingProvider>
   );
}
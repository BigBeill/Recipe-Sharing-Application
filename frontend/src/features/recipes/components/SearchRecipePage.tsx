"use client"

import React, { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import useServiceState from '@/shared/hooks/useServiceState';
import Notebook from '@/shared/components/Notebook';
import NotebookPageListItems from '@/shared/components/notebookPageComponents/ListItems';
import RecipeFilterPage from './RecipeFilterPage';
import { BrokenPaginatedListType } from '@/shared/shared.types';
import combinePaginatedLists from '@/shared/lib/combinePaginatedLists';
import useAuth from '@/features/auth/hooks/useAuth';
import { recipeService } from '../services/recipes.service.client';

const groupSize = 5

export default function SearchRecipePage() {

   const { authId } = useAuth();
   const router = useRouter();
   const searchParams = useSearchParams();

   const title: string =  searchParams.get('title') || '';
   const ingredientIdListParam = searchParams.get('ingredientIdList');
   const category = searchParams.get('category') as "public" | "friends" | "personal" || 'public';
   const ingredientIdList = useMemo(() => { return ingredientIdListParam ? ingredientIdListParam.split(',').map(Number) : [] }, [ingredientIdListParam] );
   const page: number = Number(searchParams.get('page')) || 1;

   if (!authId && (category === 'friends' || category === 'personal')) { router.replace('login'); }

   const [notebookComponents, setNotebookComponents] = useState<BrokenPaginatedListType<React.ReactElement>>({ list: [<RecipeFilterPage />], count: 1, firstItemIndex: 0 });

   useServiceState(async () => {
      const firstComponent = Math.max((page - 1) * 2, 1); // index of the first component being added to notebookComponents
      const firstItem = (firstComponent - 1) * groupSize; // index of the first user being grabbed from the server

      const response = await recipeService.search({
         title,
         visibilityList: [...(
            !authId ? ['public']
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
      <Notebook components={ notebookComponents } />
   );
}
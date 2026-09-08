"use client"

import { useRef } from 'react';
import { RecipeType } from '../domain/recipes.types';
import { IngredientType } from '@/features/ingredients/domain/ingredient.types';
import { DataHandle } from '@/shared/shared.types';
import Notebook from '@/shared/components/Notebook';
import { useServiceMutation } from '@/shared/hooks/useServiceMutation';
import harvestRefsObject from '@/shared/lib/harvestRefsObject';
import EditRecipeFinalizeChangesView from './EditRecipeSubPages/FinalizeChangesView';
import EditRecipeGeneralInfoView from './EditRecipeSubPages/GeneralInfoView';
import EditRecipeAdditionalInfoView from './EditRecipeSubPages/AdditionalInfoView';
import EditRecipeIngredientsView from './EditRecipeSubPages/IngredientsView';
import EditRecipeInstructionsView from './EditRecipeSubPages/InstructionsView';
import { recipeService } from '../services/recipes.service.client';
import { useRouter } from 'next/navigation';

interface ComponentParams {
   recipe: Omit<RecipeType, '_id'>,
}

export default function CreateRecipeView({ recipe }: ComponentParams ) {

   const router = useRouter();

   // data references
   const refs = {
      title: useRef<DataHandle<string>>(null),
      description: useRef<DataHandle<string>>(null),
      image: useRef<DataHandle<File | null>>(null),
      visibility: useRef<DataHandle<'public' | 'private' | 'personal'>>(null),
      ingredientList: useRef<DataHandle<IngredientType[]>>(null),
      instructionList: useRef<DataHandle<string[]>>(null),
   }

   const saveMutator = useServiceMutation (async () => {
      await recipeService.create({
         ownerId: recipe.ownerId,
         ...harvestRefsObject(refs),
      });
      router.push('/recipes');
   });

   const deleteMutator = useServiceMutation (async () => {
      router.replace('/recipes');
   });

   // call notebook and give it pageList
   return (
      <Notebook components={ {
         list: [
            <EditRecipeGeneralInfoView newRecipe={ !('_id' in recipe) } refs={ { title: refs.title, description: refs.description } } initial={ { title: recipe.title, description: recipe.description } } />,
            <EditRecipeAdditionalInfoView refs={ { image: refs.image, visibility: refs.visibility } } initial={ { image: recipe.image || undefined, visibility: recipe.visibility } } />,
            <EditRecipeIngredientsView refs={ { ingredientList: refs.ingredientList } } initial={ { ingredientList: recipe.ingredientList } } />,
            <EditRecipeInstructionsView refs={ { instructionList: refs.instructionList } } initial={ { instructionList: recipe.instructionList } } />,
            <EditRecipeFinalizeChangesView saveMutator={ saveMutator } deleteMutator={ deleteMutator } />,
         ],
         count: 5,
         firstItemIndex: 0,
      } }/>
   );
}
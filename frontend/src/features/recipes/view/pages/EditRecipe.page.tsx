"use client"

import { useRef } from 'react';
import { RecipeType } from '../../domain/recipes.types';
import { IngredientType } from '@/features/ingredients/domain/ingredient.types';
import { DataHandle } from '@/shared/domain/shared.types';
import harvestRefsObject from '@/shared/lib/harvestRefsObject';
import { recipeService } from '../../services/recipes.service.client';
import { useRouter } from 'next/navigation';
import { useServiceMutation } from '@/shared/lib/hooks/useServiceMutation';
import NotebookPage from '@/shared/view/pages/Notebook.page';
import EditRecipeShardSetTitle from './EditRecipeShards/SetTitle';
import EditRecipeShardSetImage from './EditRecipeShards/SetImage';
import EditRecipeShardSetIngredientList from './EditRecipeShards/SetIngredientList';
import EditRecipeShardSetInstructionList from './EditRecipeShards/SetInstructionList';
import EditRecipeShardSubmit from './EditRecipeShards/Submit';

interface ComponentParams {
	recipe: RecipeType
}

export default function EditRecipePage({ recipe }: ComponentParams ) {

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

	const saveMutator = useServiceMutation(async () => {
		await recipeService.update(recipe._id, {
			...harvestRefsObject(refs),
		});
		router.push('/recipes');
	});

	const deleteMutator = useServiceMutation(async () => {
		recipeService.delete(recipe._id);
		router.replace('/recipes');
	});

	// call notebook and give it pageList
	return (
		<NotebookPage components={ {
			list: [
				<EditRecipeShardSetTitle newRecipe={ !('_id' in recipe) } refs={ { title: refs.title, description: refs.description } } initial={ { title: recipe.title, description: recipe.description } } />,
				<EditRecipeShardSetImage refs={ { image: refs.image, visibility: refs.visibility } } initial={ { image: recipe.image || undefined, visibility: recipe.visibility } } />,
				<EditRecipeShardSetIngredientList refs={ { ingredientList: refs.ingredientList } } initial={ { ingredientList: recipe.ingredientList } } />,
				<EditRecipeShardSetInstructionList refs={ { instructionList: refs.instructionList } } initial={ { instructionList: recipe.instructionList } } />,
				<EditRecipeShardSubmit saveMutator={ saveMutator } deleteMutator={ deleteMutator } />,
			],
			count: 5,
			firstItemIndex: 0
		} } />
	)
}
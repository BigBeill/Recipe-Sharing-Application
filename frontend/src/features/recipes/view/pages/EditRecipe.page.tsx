"use client"

import { useRef } from 'react';
import { TypeRecipe } from '../../domain/recipes.types';
import { IngredientType } from '@/features/ingredients/domain/ingredient.types';
import { TypeDataHandle } from '@/shared/domain/shared.types';
import harvestRefsObject from '@/shared/lib/harvestRefCollection';
import { recipeService } from '../../services/recipes.service.client';
import { useRouter } from 'next/navigation';
import { useServiceMutation } from '@/shared/lib/hooks/useServiceMutation';
import NotebookPage from '@/shared/view/pages/Notebook.page';
import EditRecipeShardSetTitle from './EditRecipeShards/SetTitle';
import EditRecipeShardSetImage from './EditRecipeShards/SetImage';
import EditRecipeShardSetIngredientList from './EditRecipeShards/SetIngredientList';
import EditRecipeShardSetInstructionList from './EditRecipeShards/SetInstructionList';
import EditRecipeShardSubmit from './EditRecipeShards/Submit';
import { TypeImageReference } from '@/features/images/domain/image.types';

interface ComponentParams {
	recipe: TypeRecipe
}

export default function EditRecipePage({ recipe }: ComponentParams ) {

	const router = useRouter();

	// data references
	const refs = {
		title: useRef<TypeDataHandle<string>>(null),
		description: useRef<TypeDataHandle<string>>(null),
		imageReference: useRef<TypeDataHandle<TypeImageReference | undefined>>(null),
		visibility: useRef<TypeDataHandle<'public' | 'private' | 'personal'>>(null),
		ingredientList: useRef<TypeDataHandle<IngredientType[]>>(null),
		instructionList: useRef<TypeDataHandle<string[]>>(null),
	}

	const saveMutator = useServiceMutation(async () => {
		await recipeService.update(recipe, (await harvestRefsObject(refs)));
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
				<EditRecipeShardSetImage refs={ { image: refs.imageReference, visibility: refs.visibility } } initial={ { signedImageUrl: recipe.signedImageUrl || undefined, visibility: recipe.visibility } } />,
				<EditRecipeShardSetIngredientList refs={ { ingredientList: refs.ingredientList } } initial={ { ingredientList: recipe.ingredientList } } />,
				<EditRecipeShardSetInstructionList refs={ { instructionList: refs.instructionList } } initial={ { instructionList: recipe.instructionList } } />,
				<EditRecipeShardSubmit saveMutator={ saveMutator } deleteMutator={ deleteMutator } />,
			],
			count: 5,
			firstItemIndex: 0
		} } />
	)
}
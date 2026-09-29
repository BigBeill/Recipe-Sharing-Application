import { DataHandle } from "@/shared/domain/shared.types";
import { Ref } from "react";
import { NotebookComponentDefault } from "@/shared/view/components/notebookPageSpecific/default.notebookComponent";
import { InputString } from "@/shared/view/components/Input.components";

interface ComponentProps {
	newRecipe: boolean;
	refs: { 
		title: Ref<DataHandle<string>>;
		description: Ref<DataHandle<string>>;
	};
	initial: { 
		title?: string,
		description?: string
	};
}

export default function EditRecipeGeneralInfoView ({ newRecipe, refs, initial }: ComponentProps) {
	return (
		<NotebookComponentDefault>
			<h1>{newRecipe ? 'New Recipe' : 'Edit Recipe'}</h1>

			<InputString type='text' label='Title' ref={ refs.title } initial={ initial.title } placeholder="Give your recipe a name" />
			<InputString type='textarea' label='Description' ref={ refs.description } initial={ initial.description } placeholder='Describe your recipe' />
		</NotebookComponentDefault>
	)
}

import { InputText, InputTextArea } from "@/shared/components/Input.components";
import { NotebookPage } from "@/shared/components/Notebook";
import { DataHandle } from "@/shared/shared.types";
import { Ref } from "react";

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
		<NotebookPage>
			<h1>{newRecipe ? 'New Recipe' : 'Edit Recipe'}</h1>

			<InputText label='Title' dataRef={ refs.title } initial={ initial.title } placeholder="give your title a recipe" />
			<InputTextArea label='Description' dataRef={ refs.description } initial={ initial.description } placeholder='describe your recipe' />
		</NotebookPage>
	)
}

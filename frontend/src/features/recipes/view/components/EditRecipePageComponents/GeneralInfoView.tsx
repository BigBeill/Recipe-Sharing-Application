import { InputText, InputTextArea } from "@/shared/view/components/Input.components";
import { DataHandle } from "@/shared/domain/shared.types";
import { Ref } from "react";
import { NotebookComponentDefault } from "@/shared/view/components/notebookPageSpecific/default.notebookComponent";

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

			<InputText label='Title' dataRef={ refs.title } initial={ initial.title } placeholder="give your title a recipe" />
			<InputTextArea label='Description' dataRef={ refs.description } initial={ initial.description } placeholder='describe your recipe' />
		</NotebookComponentDefault>
	)
}

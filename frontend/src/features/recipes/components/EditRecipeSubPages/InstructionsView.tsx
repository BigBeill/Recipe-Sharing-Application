import { ButtonOval } from "@/shared/components/Button.components";
import { InputText } from "@/shared/components/Input.components";
import { NotebookPage } from "@/shared/components/Notebook";
import { useInteractableList } from "@/shared/hooks/useInteractableList";
import { DataHandle } from "@/shared/shared.types";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Ref, useRef } from "react";

interface ComponentProps {
   refs: {
      instructionList: Ref<DataHandle<string[]>>;
   }
   initial: { 
      instructionList: string[];
   }
}

export default function EditRecipeInstructionsView ({ refs, initial }: ComponentProps) {

   const newInstructionRef = useRef<DataHandle<string>>(null);

   const instructionList = useInteractableList({
      initial: initial.instructionList,
      ref: refs.instructionList,
      renderItemContent: (item: string) => (
         <p>{item}</p>
      ),
      renderItemOptions: (item: string, index: number) => (
         <FontAwesomeIcon 
            role='button'
            tabIndex={0}
            aria-label={`Remove instruction ${index + 1}`}
            icon={faTrash} 
            style={{color: "#575757",}} 
            onClick={() => { instructionList.removeIndex(index) }} 
         />
      ),
      renderItemHeader(item: string, index: number) {
         <h4>Step {index + 1} </h4>
      },
   });

   function addInstruction() {
      const newInstruction = newInstructionRef.current!.getData();
      if(newInstruction.length < 3) { return; }
      instructionList.addItem(newInstruction);
      newInstructionRef.current!.setData('');
   }

   return (
      <NotebookPage>
         <h2>Recipe Instructions</h2>
         { instructionList.htmlView }

         <InputText
            label="New Instruction"
            placeholder="add a new instruction"
            dataRef={ newInstructionRef }
         />
         <ButtonOval onClick={() => { addInstruction(); }}>Add Instruction</ButtonOval>
      </NotebookPage>
   )
}